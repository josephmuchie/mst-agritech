#pragma once

#include <QObject>
#include <QJsonArray>
#include <QJsonObject>
#include <QSqlDatabase>
#include <QString>
#include <QVariantMap>

struct AppSettings {
    QString apiBaseUrl;
    QString tenantSlug;
    QString operatorEmail;
    QString platformName;
    QString supportEmail;
    QString defaultCurrency;
    bool autoSyncEnabled = false;
    bool maintenanceMode = false;
    int retryCount = 3;
    double maxOrderValueUsd = 50000.0;
};

class OfflineStore : public QObject {
    Q_OBJECT

public:
    explicit OfflineStore(QObject *parent = nullptr);
    ~OfflineStore() override;

    bool initialize(QString *errorMessage = nullptr);
    QString databasePath() const;
    QSqlDatabase database() const;

    AppSettings settings() const;
    bool saveSettings(const AppSettings &settings, QString *errorMessage = nullptr);

    int createRecord(const QString &module,
                     const QString &title,
                     const QString &subtitle,
                     const QString &status,
                     double amount,
                     const QString &currency,
                     const QString &notes,
                     const QJsonObject &payload,
                     QString *errorMessage = nullptr);

    bool updateRecord(int id,
                      const QString &title,
                      const QString &subtitle,
                      const QString &status,
                      double amount,
                      const QString &currency,
                      const QString &notes,
                      const QJsonObject &payload,
                      QString *errorMessage = nullptr);

    bool markDeleted(int id, QString *errorMessage = nullptr);

    QJsonArray pendingChanges() const;
    bool markQueueItemSynced(int queueId, const QString &remoteId = QString(), QString *errorMessage = nullptr);
    int pendingChangeCount() const;
    QVariantMap localKpis() const;

signals:
    void dataChanged();
    void queueChanged();
    void settingsChanged();

private:
    QString readSetting(const QString &key, const QString &fallback = QString()) const;
    bool writeSetting(const QString &key, const QString &value, QString *errorMessage = nullptr);
    bool createSchema(QString *errorMessage);
    bool seedDefaults(QString *errorMessage);
    bool enqueueChange(int recordId,
                       const QString &module,
                       const QString &operation,
                       const QJsonObject &payload,
                       QString *errorMessage = nullptr);
    QJsonObject recordPayload(int recordId) const;
    static QString nowIso();

    QString m_connectionName;
    QString m_databasePath;
};
