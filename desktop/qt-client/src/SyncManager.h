#pragma once

#include "OfflineStore.h"

#include <QNetworkAccessManager>
#include <QObject>

class QNetworkReply;

class SyncManager : public QObject {
    Q_OBJECT

public:
    explicit SyncManager(OfflineStore *store, QObject *parent = nullptr);

    bool isOnline() const;

public slots:
    void checkConnectivity();
    void syncNow();

signals:
    void onlineStateChanged(bool online);
    void statusMessage(const QString &message);
    void syncFinished(bool success, const QString &message);

private:
    QString normalizedApiBaseUrl() const;
    void setOnline(bool online);
    void markPendingAttemptFailed(const QString &message);

    OfflineStore *m_store = nullptr;
    QNetworkAccessManager m_network;
    bool m_online = false;
};
