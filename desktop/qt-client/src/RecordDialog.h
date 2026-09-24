#pragma once

#include <QDialog>
#include <QJsonObject>
#include <QStringList>

class QComboBox;
class QDoubleSpinBox;
class QLineEdit;
class QTextEdit;

struct RecordFormData {
    QString title;
    QString subtitle;
    QString status;
    double amount = 0.0;
    QString currency;
    QString notes;
    QJsonObject payload;
};

class RecordDialog : public QDialog {
    Q_OBJECT

public:
    explicit RecordDialog(const QString &module,
                          const QStringList &statusOptions,
                          QWidget *parent = nullptr);

    void setRecordData(const RecordFormData &data);
    RecordFormData recordData() const;

private:
    QString m_module;
    QLineEdit *m_titleEdit = nullptr;
    QLineEdit *m_subtitleEdit = nullptr;
    QComboBox *m_statusCombo = nullptr;
    QDoubleSpinBox *m_amountSpin = nullptr;
    QLineEdit *m_currencyEdit = nullptr;
    QTextEdit *m_notesEdit = nullptr;
    QTextEdit *m_payloadEdit = nullptr;
};
