#include "SyncManager.h"

#include <QJsonArray>
#include <QJsonDocument>
#include <QNetworkReply>
#include <QNetworkRequest>
#include <QSqlError>
#include <QSqlQuery>
#include <QUrl>

SyncManager::SyncManager(OfflineStore *store, QObject *parent)
    : QObject(parent),
      m_store(store) {
}

bool SyncManager::isOnline() const {
    return m_online;
}

void SyncManager::checkConnectivity() {
    const QUrl healthUrl(normalizedApiBaseUrl() + QStringLiteral("/actuator/health"));
    QNetworkRequest request(healthUrl);
    request.setHeader(QNetworkRequest::UserAgentHeader, QStringLiteral("MST-Agritech-Desktop/0.1"));

    QNetworkReply *reply = m_network.get(request);
    connect(reply, &QNetworkReply::finished, this, [this, reply]() {
        const bool healthy = reply->error() == QNetworkReply::NoError
            && reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt() < 500;
        setOnline(healthy);
        emit statusMessage(healthy ? QStringLiteral("API is reachable.") : QStringLiteral("API is not reachable; offline mode remains active."));
        reply->deleteLater();
    });
}

void SyncManager::syncNow() {
    const QJsonArray changes = m_store->pendingChanges();
    if (changes.isEmpty()) {
        emit syncFinished(true, QStringLiteral("No pending offline changes to sync."));
        return;
    }

    const QUrl syncUrl(normalizedApiBaseUrl() + QStringLiteral("/api/v1/desktop-sync/changes"));
    QNetworkRequest request(syncUrl);
    request.setHeader(QNetworkRequest::ContentTypeHeader, QStringLiteral("application/json"));
    request.setHeader(QNetworkRequest::UserAgentHeader, QStringLiteral("MST-Agritech-Desktop/0.1"));

    const AppSettings settings = m_store->settings();
    QJsonObject envelope;
    envelope.insert(QStringLiteral("tenantSlug"), settings.tenantSlug);
    envelope.insert(QStringLiteral("operatorEmail"), settings.operatorEmail);
    envelope.insert(QStringLiteral("changes"), changes);

    QNetworkReply *reply = m_network.post(request, QJsonDocument(envelope).toJson(QJsonDocument::Compact));
    connect(reply, &QNetworkReply::finished, this, [this, reply, changes]() {
        const int statusCode = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        if (reply->error() != QNetworkReply::NoError || statusCode < 200 || statusCode >= 300) {
            setOnline(false);
            const QString message = QStringLiteral("Sync failed: %1").arg(reply->errorString());
            markPendingAttemptFailed(message);
            emit syncFinished(false, message);
            reply->deleteLater();
            return;
        }

        setOnline(true);
        QString error;
        for (const QJsonValue &value : changes) {
            const int queueId = value.toObject().value(QStringLiteral("queueId")).toInt();
            if (!m_store->markQueueItemSynced(queueId, QString(), &error)) {
                emit syncFinished(false, QStringLiteral("Sync accepted but local queue update failed: %1").arg(error));
                reply->deleteLater();
                return;
            }
        }

        emit syncFinished(true, QStringLiteral("Synced %1 offline change(s).").arg(changes.size()));
        reply->deleteLater();
    });
}

QString SyncManager::normalizedApiBaseUrl() const {
    QString baseUrl = m_store->settings().apiBaseUrl.trimmed();
    while (baseUrl.endsWith('/')) {
        baseUrl.chop(1);
    }
    return baseUrl.isEmpty() ? QStringLiteral("http://localhost:8080") : baseUrl;
}

void SyncManager::setOnline(bool online) {
    if (m_online == online) {
        return;
    }
    m_online = online;
    emit onlineStateChanged(m_online);
}

void SyncManager::markPendingAttemptFailed(const QString &message) {
    QSqlQuery query(m_store->database());
    query.prepare(QStringLiteral(R"sql(
        UPDATE sync_queue
        SET attempts = attempts + 1,
            last_error = :lastError,
            updated_at = datetime('now')
        WHERE status = 'PENDING'
    )sql"));
    query.bindValue(QStringLiteral(":lastError"), message);
    query.exec();
}
