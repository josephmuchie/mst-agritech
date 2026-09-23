#pragma once

#include "OfflineStore.h"

#include <QWidget>

class QComboBox;
class QLabel;
class QLineEdit;
class QNetworkAccessManager;
class QNetworkReply;
class QPlainTextEdit;
class QSqlTableModel;
class QTableView;

class DataIngestionWidget : public QWidget {
    Q_OBJECT

public:
    explicit DataIngestionWidget(OfflineStore *store, QWidget *parent = nullptr);

private:
    void chooseFile();
    void exportTemplate();
    void stageJsonOffline();
    void submitJsonOnline();
    void stageSelectedFile();
    void refreshHistory();
    void updateTypeDescription();
    QJsonObject currentJsonPayload(bool *ok = nullptr) const;
    QJsonObject ingestionRecordPayload(const QString &source, const QJsonObject &body, const QString &filePath = QString()) const;
    QString endpointUrl(const QString &path) const;

    OfflineStore *m_store = nullptr;
    QNetworkAccessManager *m_network = nullptr;
    QComboBox *m_importTypeCombo = nullptr;
    QLabel *m_typeDescriptionLabel = nullptr;
    QPlainTextEdit *m_jsonEdit = nullptr;
    QLineEdit *m_filePathEdit = nullptr;
    QSqlTableModel *m_historyModel = nullptr;
    QTableView *m_historyTable = nullptr;
};
