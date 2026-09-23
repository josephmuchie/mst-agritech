#include "DataIngestionWidget.h"

#include <QComboBox>
#include <QFile>
#include <QFileDialog>
#include <QFileInfo>
#include <QFormLayout>
#include <QHBoxLayout>
#include <QHeaderView>
#include <QJsonArray>
#include <QJsonDocument>
#include <QJsonParseError>
#include <QLabel>
#include <QLineEdit>
#include <QMessageBox>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QPlainTextEdit>
#include <QPushButton>
#include <QSqlTableModel>
#include <QTableView>
#include <QUrl>
#include <QVBoxLayout>
#include <algorithm>

namespace {

struct ImportTypeInfo {
    QString type;
    QString label;
    QString description;
    QStringList columns;
};

const QList<ImportTypeInfo> kImportTypes = {
    {QStringLiteral("MARKET_PRICES"), QStringLiteral("Market prices"), QStringLiteral("Market price uploads by product, country, currency, and source."), {QStringLiteral("product_name"), QStringLiteral("price"), QStringLiteral("currency_code"), QStringLiteral("country_iso"), QStringLiteral("price_source")}},
    {QStringLiteral("COUNTRIES"), QStringLiteral("Countries"), QStringLiteral("Reference country list used by farmers, buyers, logistics, and market data."), {QStringLiteral("iso_code"), QStringLiteral("name"), QStringLiteral("region"), QStringLiteral("active")}},
    {QStringLiteral("CURRENCIES"), QStringLiteral("Currencies"), QStringLiteral("Currency master data and symbols."), {QStringLiteral("code"), QStringLiteral("name"), QStringLiteral("symbol"), QStringLiteral("active")}},
    {QStringLiteral("PRODUCT_CATEGORIES"), QStringLiteral("Product categories"), QStringLiteral("Product category master data."), {QStringLiteral("name"), QStringLiteral("description"), QStringLiteral("active")}},
    {QStringLiteral("PRODUCTS"), QStringLiteral("Products"), QStringLiteral("Product catalogue data for marketplace and orders."), {QStringLiteral("name"), QStringLiteral("category_name"), QStringLiteral("unit_of_measure"), QStringLiteral("description"), QStringLiteral("requires_cold_chain")}},
    {QStringLiteral("FARMERS"), QStringLiteral("Farmers"), QStringLiteral("Farmer onboarding and farm profile data."), {QStringLiteral("full_name"), QStringLiteral("email"), QStringLiteral("farm_name"), QStringLiteral("province"), QStringLiteral("country_iso"), QStringLiteral("total_hectares")}},
    {QStringLiteral("BUYERS"), QStringLiteral("Buyers"), QStringLiteral("Buyer company onboarding data."), {QStringLiteral("company_name"), QStringLiteral("country_iso"), QStringLiteral("buyer_type"), QStringLiteral("contact_email"), QStringLiteral("contact_phone")}},
    {QStringLiteral("ORDERS"), QStringLiteral("Orders"), QStringLiteral("Order import data for references, parties, amount, status, and notes."), {QStringLiteral("reference"), QStringLiteral("farmer_name"), QStringLiteral("buyer_company"), QStringLiteral("status"), QStringLiteral("total_amount"), QStringLiteral("currency_code")}},
};

QString defaultJsonExample() {
    return QStringLiteral(R"json({
  "importType": "MARKET_PRICES",
  "records": [
    {
      "product_name": "Premium Roses",
      "price": "4.75",
      "currency_code": "USD",
      "country_iso": "ZW",
      "price_source": "Desktop upload"
    }
  ]
})json");
}

QString csvLine(const QStringList &values) {
    QStringList escaped;
    for (const QString &value : values) {
        escaped << QStringLiteral("\"%1\"").arg(value);
    }
    return escaped.join(',');
}

} // namespace

DataIngestionWidget::DataIngestionWidget(OfflineStore *store, QWidget *parent)
    : QWidget(parent),
      m_store(store),
      m_network(new QNetworkAccessManager(this)) {
    auto *title = new QLabel(QStringLiteral("<h2>Data Ingestion</h2>"), this);
    auto *description = new QLabel(
        QStringLiteral("Bulk import platform data through the same ingestion concepts as the web app. "
                       "Online JSON submissions call the configured API; offline work is staged into the local sync queue."),
        this);
    description->setWordWrap(true);

    m_importTypeCombo = new QComboBox(this);
    for (const ImportTypeInfo &type : kImportTypes) {
        m_importTypeCombo->addItem(type.label, type.type);
    }
    m_typeDescriptionLabel = new QLabel(this);
    m_typeDescriptionLabel->setWordWrap(true);

    m_jsonEdit = new QPlainTextEdit(defaultJsonExample(), this);
    m_jsonEdit->setMinimumHeight(210);
    m_jsonEdit->setStyleSheet(QStringLiteral("font-family: Menlo, Consolas, monospace; font-size: 12px;"));

    m_filePathEdit = new QLineEdit(this);
    m_filePathEdit->setReadOnly(true);
    auto *browseButton = new QPushButton(QStringLiteral("Choose file"), this);
    auto *stageFileButton = new QPushButton(QStringLiteral("Stage file offline"), this);
    auto *templateButton = new QPushButton(QStringLiteral("Export CSV template"), this);
    connect(browseButton, &QPushButton::clicked, this, &DataIngestionWidget::chooseFile);
    connect(stageFileButton, &QPushButton::clicked, this, &DataIngestionWidget::stageSelectedFile);
    connect(templateButton, &QPushButton::clicked, this, &DataIngestionWidget::exportTemplate);

    auto *stageJsonButton = new QPushButton(QStringLiteral("Stage JSON offline"), this);
    auto *submitJsonButton = new QPushButton(QStringLiteral("Submit JSON online"), this);
    connect(stageJsonButton, &QPushButton::clicked, this, &DataIngestionWidget::stageJsonOffline);
    connect(submitJsonButton, &QPushButton::clicked, this, &DataIngestionWidget::submitJsonOnline);

    auto *form = new QFormLayout;
    form->addRow(QStringLiteral("Import type"), m_importTypeCombo);
    form->addRow(QStringLiteral("Details"), m_typeDescriptionLabel);
    form->addRow(QStringLiteral("JSON payload"), m_jsonEdit);

    auto *jsonActions = new QHBoxLayout;
    jsonActions->addWidget(stageJsonButton);
    jsonActions->addWidget(submitJsonButton);
    jsonActions->addStretch(1);

    auto *fileActions = new QHBoxLayout;
    fileActions->addWidget(m_filePathEdit, 1);
    fileActions->addWidget(browseButton);
    fileActions->addWidget(stageFileButton);
    fileActions->addWidget(templateButton);

    m_historyModel = new QSqlTableModel(this, m_store->database());
    m_historyModel->setTable(QStringLiteral("records"));
    m_historyModel->setFilter(QStringLiteral("module = 'Data Ingestion' AND deleted = 0"));
    m_historyModel->setSort(m_historyModel->fieldIndex(QStringLiteral("updated_at")), Qt::DescendingOrder);
    m_historyModel->setHeaderData(m_historyModel->fieldIndex(QStringLiteral("title")), Qt::Horizontal, QStringLiteral("Import"));
    m_historyModel->setHeaderData(m_historyModel->fieldIndex(QStringLiteral("subtitle")), Qt::Horizontal, QStringLiteral("Source"));
    m_historyModel->setHeaderData(m_historyModel->fieldIndex(QStringLiteral("status")), Qt::Horizontal, QStringLiteral("Status"));
    m_historyModel->setHeaderData(m_historyModel->fieldIndex(QStringLiteral("notes")), Qt::Horizontal, QStringLiteral("Notes"));
    m_historyModel->setHeaderData(m_historyModel->fieldIndex(QStringLiteral("updated_at")), Qt::Horizontal, QStringLiteral("Updated"));

    m_historyTable = new QTableView(this);
    m_historyTable->setModel(m_historyModel);
    m_historyTable->setAlternatingRowColors(true);
    m_historyTable->horizontalHeader()->setStretchLastSection(true);
    for (const QString &column : {QStringLiteral("id"), QStringLiteral("module"), QStringLiteral("amount"), QStringLiteral("currency"), QStringLiteral("payload_json"), QStringLiteral("remote_id"), QStringLiteral("deleted"), QStringLiteral("created_at"), QStringLiteral("synced_at")}) {
        m_historyTable->hideColumn(m_historyModel->fieldIndex(column));
    }

    auto *layout = new QVBoxLayout(this);
    layout->addWidget(title);
    layout->addWidget(description);
    layout->addLayout(form);
    layout->addLayout(jsonActions);
    layout->addWidget(new QLabel(QStringLiteral("<b>Excel / CSV file ingestion</b>"), this));
    layout->addLayout(fileActions);
    layout->addWidget(new QLabel(QStringLiteral("<b>Import history</b>"), this));
    layout->addWidget(m_historyTable, 1);

    connect(m_importTypeCombo, &QComboBox::currentIndexChanged, this, &DataIngestionWidget::updateTypeDescription);
    connect(m_store, &OfflineStore::dataChanged, this, &DataIngestionWidget::refreshHistory);
    updateTypeDescription();
    refreshHistory();
}

void DataIngestionWidget::chooseFile() {
    const QString path = QFileDialog::getOpenFileName(this, QStringLiteral("Choose ingestion file"), QString(), QStringLiteral("Data files (*.xlsx *.csv *.json);;All files (*.*)"));
    if (!path.isEmpty()) {
        m_filePathEdit->setText(path);
    }
}

void DataIngestionWidget::exportTemplate() {
    const QString importType = m_importTypeCombo->currentData().toString();
    const auto it = std::find_if(kImportTypes.cbegin(), kImportTypes.cend(), [&importType](const ImportTypeInfo &type) {
        return type.type == importType;
    });
    if (it == kImportTypes.cend()) {
        return;
    }

    const QString path = QFileDialog::getSaveFileName(this, QStringLiteral("Save CSV template"), QStringLiteral("mst-import-%1-template.csv").arg(importType.toLower()), QStringLiteral("CSV files (*.csv)"));
    if (path.isEmpty()) {
        return;
    }

    QFile file(path);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QMessageBox::critical(this, QStringLiteral("Template export failed"), file.errorString());
        return;
    }
    file.write(csvLine(it->columns).toUtf8());
    file.write("\n");
    QMessageBox::information(this, QStringLiteral("Template exported"), QStringLiteral("Template saved to %1").arg(path));
}

QJsonObject DataIngestionWidget::currentJsonPayload(bool *ok) const {
    QJsonParseError parseError;
    const QJsonDocument document = QJsonDocument::fromJson(m_jsonEdit->toPlainText().toUtf8(), &parseError);
    const bool valid = parseError.error == QJsonParseError::NoError && document.isObject();
    if (ok) {
        *ok = valid;
    }
    return valid ? document.object() : QJsonObject();
}

QJsonObject DataIngestionWidget::ingestionRecordPayload(const QString &source, const QJsonObject &body, const QString &filePath) const {
    QJsonObject payload;
    payload.insert(QStringLiteral("source"), source);
    payload.insert(QStringLiteral("endpoint"), QStringLiteral("/api/v1/config/ingestion/api"));
    payload.insert(QStringLiteral("body"), body);
    if (!filePath.isEmpty()) {
        QFileInfo info(filePath);
        payload.insert(QStringLiteral("filePath"), filePath);
        payload.insert(QStringLiteral("fileName"), info.fileName());
        payload.insert(QStringLiteral("fileSize"), static_cast<double>(info.size()));
    }
    return payload;
}

void DataIngestionWidget::stageJsonOffline() {
    bool ok = false;
    QJsonObject body = currentJsonPayload(&ok);
    if (!ok) {
        QMessageBox::warning(this, QStringLiteral("Invalid JSON"), QStringLiteral("JSON payload must be a valid object."));
        return;
    }

    const QString importType = body.value(QStringLiteral("importType")).toString(m_importTypeCombo->currentData().toString());
    body.insert(QStringLiteral("importType"), importType);
    QString error;
    const int id = m_store->createRecord(
        QStringLiteral("Data Ingestion"),
        QStringLiteral("%1 import").arg(importType),
        QStringLiteral("JSON API"),
        QStringLiteral("QUEUED"),
        body.value(QStringLiteral("records")).toArray().size(),
        QStringLiteral("ROWS"),
        QStringLiteral("Staged offline for sync"),
        ingestionRecordPayload(QStringLiteral("API_JSON"), body),
        &error);
    if (id <= 0) {
        QMessageBox::critical(this, QStringLiteral("Stage failed"), error);
        return;
    }
    QMessageBox::information(this, QStringLiteral("Import staged"), QStringLiteral("JSON import is queued for sync."));
}

void DataIngestionWidget::submitJsonOnline() {
    bool ok = false;
    QJsonObject body = currentJsonPayload(&ok);
    if (!ok) {
        QMessageBox::warning(this, QStringLiteral("Invalid JSON"), QStringLiteral("JSON payload must be a valid object."));
        return;
    }
    body.insert(QStringLiteral("importType"), body.value(QStringLiteral("importType")).toString(m_importTypeCombo->currentData().toString()));

    QNetworkRequest request(QUrl(endpointUrl(QStringLiteral("/api/v1/config/ingestion/api"))));
    request.setHeader(QNetworkRequest::ContentTypeHeader, QStringLiteral("application/json"));
    const QString token = m_store->settings().apiAccessToken;
    if (!token.isEmpty()) {
        request.setRawHeader("Authorization", QStringLiteral("Bearer %1").arg(token).toUtf8());
    }

    QNetworkReply *reply = m_network->post(request, QJsonDocument(body).toJson(QJsonDocument::Compact));
    connect(reply, &QNetworkReply::finished, this, [this, reply, body]() {
        const bool success = reply->error() == QNetworkReply::NoError
            && reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt() >= 200
            && reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt() < 300;
        QString error;
        m_store->createRecord(
            QStringLiteral("Data Ingestion"),
            QStringLiteral("%1 import").arg(body.value(QStringLiteral("importType")).toString()),
            QStringLiteral("JSON API"),
            success ? QStringLiteral("COMPLETED") : QStringLiteral("QUEUED"),
            body.value(QStringLiteral("records")).toArray().size(),
            QStringLiteral("ROWS"),
            success ? QStringLiteral("Submitted to API") : QStringLiteral("Online submit failed; staged offline"),
            ingestionRecordPayload(QStringLiteral("API_JSON"), body),
            &error);
        QMessageBox::information(this, QStringLiteral("Data ingestion"), success ? QStringLiteral("Import submitted successfully.") : QStringLiteral("API submit failed, so the import was staged offline."));
        reply->deleteLater();
    });
}

void DataIngestionWidget::stageSelectedFile() {
    if (m_filePathEdit->text().trimmed().isEmpty()) {
        QMessageBox::warning(this, QStringLiteral("No file selected"), QStringLiteral("Choose an Excel, CSV, or JSON file first."));
        return;
    }

    const QString importType = m_importTypeCombo->currentData().toString();
    QJsonObject body;
    body.insert(QStringLiteral("importType"), importType);
    body.insert(QStringLiteral("records"), QJsonArray());

    QString error;
    const QFileInfo info(m_filePathEdit->text());
    const int id = m_store->createRecord(
        QStringLiteral("Data Ingestion"),
        QStringLiteral("%1 file import").arg(importType),
        info.fileName(),
        QStringLiteral("QUEUED"),
        0,
        QStringLiteral("ROWS"),
        QStringLiteral("File metadata staged offline; backend processing happens on sync."),
        ingestionRecordPayload(QStringLiteral("FILE_UPLOAD"), body, info.absoluteFilePath()),
        &error);
    if (id <= 0) {
        QMessageBox::critical(this, QStringLiteral("Stage failed"), error);
        return;
    }
    QMessageBox::information(this, QStringLiteral("File staged"), QStringLiteral("File import metadata is queued for sync."));
}

void DataIngestionWidget::refreshHistory() {
    m_historyModel->select();
}

void DataIngestionWidget::updateTypeDescription() {
    const QString importType = m_importTypeCombo->currentData().toString();
    const auto it = std::find_if(kImportTypes.cbegin(), kImportTypes.cend(), [&importType](const ImportTypeInfo &type) {
        return type.type == importType;
    });
    if (it == kImportTypes.cend()) {
        return;
    }
    m_typeDescriptionLabel->setText(QStringLiteral("%1\nColumns: %2").arg(it->description, it->columns.join(QStringLiteral(", "))));
}

QString DataIngestionWidget::endpointUrl(const QString &path) const {
    QString baseUrl = m_store->settings().apiBaseUrl.trimmed();
    while (baseUrl.endsWith('/')) {
        baseUrl.chop(1);
    }
    return baseUrl + path;
}
