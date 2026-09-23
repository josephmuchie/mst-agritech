#include "DataModuleWidget.h"

#include "RecordDialog.h"

#include <QHeaderView>
#include <QHBoxLayout>
#include <QJsonDocument>
#include <QJsonParseError>
#include <QLabel>
#include <QLineEdit>
#include <QMessageBox>
#include <QPushButton>
#include <QSqlRecord>
#include <QSqlTableModel>
#include <QTableView>
#include <QVBoxLayout>

DataModuleWidget::DataModuleWidget(const QString &module,
                                   const QString &description,
                                   const QStringList &statusOptions,
                                   OfflineStore *store,
                                   QWidget *parent)
    : QWidget(parent),
      m_module(module),
      m_statusOptions(statusOptions),
      m_store(store) {
    auto *title = new QLabel(QStringLiteral("<h2>%1</h2>").arg(module), this);
    auto *help = new QLabel(description, this);
    help->setWordWrap(true);

    m_searchEdit = new QLineEdit(this);
    m_searchEdit->setPlaceholderText(QStringLiteral("Search local %1 records...").arg(module.toLower()));

    auto *newButton = new QPushButton(QStringLiteral("New"), this);
    m_editButton = new QPushButton(QStringLiteral("Edit"), this);
    m_deleteButton = new QPushButton(QStringLiteral("Delete"), this);
    auto *refreshButton = new QPushButton(QStringLiteral("Refresh"), this);

    m_model = new QSqlTableModel(this, m_store->database());
    m_model->setTable(QStringLiteral("records"));
    m_model->setEditStrategy(QSqlTableModel::OnManualSubmit);
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("title")), Qt::Horizontal, QStringLiteral("Name / reference"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("subtitle")), Qt::Horizontal, QStringLiteral("Detail"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("status")), Qt::Horizontal, QStringLiteral("Status"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("amount")), Qt::Horizontal, QStringLiteral("Amount"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("currency")), Qt::Horizontal, QStringLiteral("Currency"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("dirty")), Qt::Horizontal, QStringLiteral("Offline changes"));
    m_model->setHeaderData(m_model->fieldIndex(QStringLiteral("updated_at")), Qt::Horizontal, QStringLiteral("Updated"));

    m_table = new QTableView(this);
    m_table->setModel(m_model);
    m_table->setSelectionBehavior(QAbstractItemView::SelectRows);
    m_table->setSelectionMode(QAbstractItemView::SingleSelection);
    m_table->setAlternatingRowColors(true);
    m_table->setSortingEnabled(true);
    m_table->horizontalHeader()->setStretchLastSection(true);
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("id")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("module")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("notes")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("payload_json")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("remote_id")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("deleted")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("created_at")));
    m_table->hideColumn(m_model->fieldIndex(QStringLiteral("synced_at")));

    auto *toolbar = new QHBoxLayout;
    toolbar->addWidget(m_searchEdit, 1);
    toolbar->addWidget(newButton);
    toolbar->addWidget(m_editButton);
    toolbar->addWidget(m_deleteButton);
    toolbar->addWidget(refreshButton);

    auto *layout = new QVBoxLayout(this);
    layout->addWidget(title);
    layout->addWidget(help);
    layout->addLayout(toolbar);
    layout->addWidget(m_table, 1);

    connect(newButton, &QPushButton::clicked, this, &DataModuleWidget::createRecord);
    connect(m_editButton, &QPushButton::clicked, this, &DataModuleWidget::editSelectedRecord);
    connect(m_deleteButton, &QPushButton::clicked, this, &DataModuleWidget::deleteSelectedRecord);
    connect(refreshButton, &QPushButton::clicked, this, &DataModuleWidget::refresh);
    connect(m_searchEdit, &QLineEdit::textChanged, this, &DataModuleWidget::applyFilter);
    connect(m_table, &QTableView::doubleClicked, this, &DataModuleWidget::editSelectedRecord);
    connect(m_table->selectionModel(), &QItemSelectionModel::selectionChanged, this, [this]() {
        const bool hasSelection = selectedRecordId() > 0;
        m_editButton->setEnabled(hasSelection);
        m_deleteButton->setEnabled(hasSelection);
    });
    connect(m_store, &OfflineStore::dataChanged, this, &DataModuleWidget::refresh);

    m_editButton->setEnabled(false);
    m_deleteButton->setEnabled(false);
    refresh();
}

void DataModuleWidget::refresh() {
    applyFilter();
    m_model->select();
}

void DataModuleWidget::applyFilter() {
    QString escapedModule = m_module;
    escapedModule.replace('\'', QStringLiteral("''"));
    QString filter = QStringLiteral("module = '%1' AND deleted = 0").arg(escapedModule);
    const QString search = m_searchEdit->text().trimmed();
    if (!search.isEmpty()) {
        QString escaped = search;
        escaped.replace('\'', QStringLiteral("''"));
        filter += QStringLiteral(" AND (title LIKE '%%1%' OR subtitle LIKE '%%1%' OR status LIKE '%%1%')")
                      .arg(escaped);
    }
    m_model->setFilter(filter);
}

int DataModuleWidget::selectedRecordId() const {
    const QModelIndexList rows = m_table->selectionModel()->selectedRows();
    if (rows.isEmpty()) {
        return -1;
    }
    return m_model->data(m_model->index(rows.first().row(), m_model->fieldIndex(QStringLiteral("id")))).toInt();
}

void DataModuleWidget::createRecord() {
    RecordDialog dialog(m_module, m_statusOptions, this);
    RecordFormData defaults;
    defaults.currency = m_store->settings().defaultCurrency;
    defaults.status = m_statusOptions.isEmpty() ? QString() : m_statusOptions.first();
    dialog.setRecordData(defaults);

    if (dialog.exec() != QDialog::Accepted) {
        return;
    }

    const RecordFormData data = dialog.recordData();
    QString error;
    if (m_store->createRecord(m_module, data.title, data.subtitle, data.status, data.amount, data.currency, data.notes, data.payload, &error) <= 0) {
        QMessageBox::critical(this, QStringLiteral("Save failed"), error);
    }
}

void DataModuleWidget::editSelectedRecord() {
    const int id = selectedRecordId();
    if (id <= 0) {
        return;
    }

    const QModelIndexList rows = m_table->selectionModel()->selectedRows();
    const int row = rows.first().row();
    RecordFormData data;
    data.title = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("title")))).toString();
    data.subtitle = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("subtitle")))).toString();
    data.status = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("status")))).toString();
    data.amount = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("amount")))).toDouble();
    data.currency = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("currency")))).toString();
    data.notes = m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("notes")))).toString();

    QJsonParseError parseError;
    const QJsonDocument payload = QJsonDocument::fromJson(
        m_model->data(m_model->index(row, m_model->fieldIndex(QStringLiteral("payload_json")))).toString().toUtf8(),
        &parseError);
    if (parseError.error == QJsonParseError::NoError && payload.isObject()) {
        data.payload = payload.object();
    }

    RecordDialog dialog(m_module, m_statusOptions, this);
    dialog.setRecordData(data);
    if (dialog.exec() != QDialog::Accepted) {
        return;
    }

    const RecordFormData updated = dialog.recordData();
    QString error;
    if (!m_store->updateRecord(id, updated.title, updated.subtitle, updated.status, updated.amount, updated.currency, updated.notes, updated.payload, &error)) {
        QMessageBox::critical(this, QStringLiteral("Update failed"), error);
    }
}

void DataModuleWidget::deleteSelectedRecord() {
    const int id = selectedRecordId();
    if (id <= 0) {
        return;
    }

    const auto answer = QMessageBox::question(
        this,
        QStringLiteral("Delete local record"),
        QStringLiteral("This marks the record deleted locally and queues a delete operation for sync. Continue?"));
    if (answer != QMessageBox::Yes) {
        return;
    }

    QString error;
    if (!m_store->markDeleted(id, &error)) {
        QMessageBox::critical(this, QStringLiteral("Delete failed"), error);
    }
}
