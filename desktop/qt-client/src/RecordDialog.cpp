#include "RecordDialog.h"

#include <QComboBox>
#include <QDialogButtonBox>
#include <QDoubleSpinBox>
#include <QFormLayout>
#include <QJsonDocument>
#include <QJsonParseError>
#include <QLineEdit>
#include <QMessageBox>
#include <QPushButton>
#include <QTextEdit>
#include <QVBoxLayout>

RecordDialog::RecordDialog(const QString &module,
                           const QStringList &statusOptions,
                           QWidget *parent)
    : QDialog(parent),
      m_module(module) {
    setWindowTitle(QStringLiteral("%1 record").arg(module));
    resize(560, 520);

    m_titleEdit = new QLineEdit(this);
    m_subtitleEdit = new QLineEdit(this);
    m_statusCombo = new QComboBox(this);
    m_statusCombo->setEditable(true);
    m_statusCombo->addItems(statusOptions);

    m_amountSpin = new QDoubleSpinBox(this);
    m_amountSpin->setRange(0.0, 999999999.99);
    m_amountSpin->setDecimals(2);
    m_amountSpin->setGroupSeparatorShown(true);

    m_currencyEdit = new QLineEdit(QStringLiteral("USD"), this);
    m_currencyEdit->setMaxLength(8);

    m_notesEdit = new QTextEdit(this);
    m_notesEdit->setMinimumHeight(90);

    m_payloadEdit = new QTextEdit(this);
    m_payloadEdit->setPlaceholderText(QStringLiteral("{\n  \"field\": \"value\"\n}"));
    m_payloadEdit->setMinimumHeight(120);

    auto *form = new QFormLayout;
    form->addRow(QStringLiteral("Primary name / reference"), m_titleEdit);
    form->addRow(QStringLiteral("Secondary detail"), m_subtitleEdit);
    form->addRow(QStringLiteral("Status"), m_statusCombo);
    form->addRow(QStringLiteral("Amount / value"), m_amountSpin);
    form->addRow(QStringLiteral("Currency"), m_currencyEdit);
    form->addRow(QStringLiteral("Notes"), m_notesEdit);
    form->addRow(QStringLiteral("Additional JSON"), m_payloadEdit);

    auto *buttons = new QDialogButtonBox(QDialogButtonBox::Cancel | QDialogButtonBox::Save, this);
    connect(buttons, &QDialogButtonBox::rejected, this, &QDialog::reject);
    connect(buttons, &QDialogButtonBox::accepted, this, [this]() {
        if (m_titleEdit->text().trimmed().isEmpty()) {
            QMessageBox::warning(this, QStringLiteral("Missing value"), QStringLiteral("Primary name / reference is required."));
            return;
        }

        QJsonParseError parseError;
        const QString jsonText = m_payloadEdit->toPlainText().trimmed();
        if (!jsonText.isEmpty()) {
            const QJsonDocument document = QJsonDocument::fromJson(jsonText.toUtf8(), &parseError);
            if (parseError.error != QJsonParseError::NoError || !document.isObject()) {
                QMessageBox::warning(
                    this,
                    QStringLiteral("Invalid JSON"),
                    QStringLiteral("Additional JSON must be a valid JSON object.\n%1").arg(parseError.errorString()));
                return;
            }
        }

        accept();
    });

    auto *layout = new QVBoxLayout(this);
    layout->addLayout(form);
    layout->addWidget(buttons);
}

void RecordDialog::setRecordData(const RecordFormData &data) {
    m_titleEdit->setText(data.title);
    m_subtitleEdit->setText(data.subtitle);
    m_statusCombo->setCurrentText(data.status);
    m_amountSpin->setValue(data.amount);
    m_currencyEdit->setText(data.currency.isEmpty() ? QStringLiteral("USD") : data.currency);
    m_notesEdit->setPlainText(data.notes);
    m_payloadEdit->setPlainText(QString::fromUtf8(QJsonDocument(data.payload).toJson(QJsonDocument::Indented)));
}

RecordFormData RecordDialog::recordData() const {
    QJsonObject payload;
    const QString jsonText = m_payloadEdit->toPlainText().trimmed();
    if (!jsonText.isEmpty()) {
        payload = QJsonDocument::fromJson(jsonText.toUtf8()).object();
    }

    RecordFormData data;
    data.title = m_titleEdit->text().trimmed();
    data.subtitle = m_subtitleEdit->text().trimmed();
    data.status = m_statusCombo->currentText().trimmed();
    data.amount = m_amountSpin->value();
    data.currency = m_currencyEdit->text().trimmed().toUpper();
    data.notes = m_notesEdit->toPlainText().trimmed();
    data.payload = payload;
    data.payload.insert(QStringLiteral("desktopModule"), m_module);
    return data;
}
