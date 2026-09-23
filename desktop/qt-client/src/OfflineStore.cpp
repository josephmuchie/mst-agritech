#include "OfflineStore.h"

#include <QCoreApplication>
#include <QDateTime>
#include <QDir>
#include <QJsonDocument>
#include <QMap>
#include <QSqlError>
#include <QSqlQuery>
#include <QStandardPaths>
#include <QUuid>

OfflineStore::OfflineStore(QObject *parent)
    : QObject(parent),
      m_connectionName(QStringLiteral("mst_agritech_desktop_%1").arg(QUuid::createUuid().toString(QUuid::Id128))) {
}

OfflineStore::~OfflineStore() {
    if (!m_connectionName.isEmpty()) {
        {
            QSqlDatabase db = QSqlDatabase::database(m_connectionName, false);
            if (db.isValid()) {
                db.close();
            }
        }
        QSqlDatabase::removeDatabase(m_connectionName);
    }
}

bool OfflineStore::initialize(QString *errorMessage) {
    const QString dataRoot = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation);
    QDir dir(dataRoot);
    if (!dir.exists() && !dir.mkpath(QStringLiteral("."))) {
        if (errorMessage) {
            *errorMessage = QStringLiteral("Unable to create application data directory: %1").arg(dataRoot);
        }
        return false;
    }

    m_databasePath = dir.filePath(QStringLiteral("mst-agritech-offline.sqlite"));
    QSqlDatabase db = QSqlDatabase::addDatabase(QStringLiteral("QSQLITE"), m_connectionName);
    db.setDatabaseName(m_databasePath);
    if (!db.open()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    QSqlQuery pragma(db);
    pragma.exec(QStringLiteral("PRAGMA foreign_keys = ON"));
    pragma.exec(QStringLiteral("PRAGMA journal_mode = WAL"));

    return createSchema(errorMessage) && seedDefaults(errorMessage);
}

QString OfflineStore::databasePath() const {
    return m_databasePath;
}

QSqlDatabase OfflineStore::database() const {
    return QSqlDatabase::database(m_connectionName);
}

bool OfflineStore::createSchema(QString *errorMessage) {
    QSqlQuery query(database());
    const QStringList statements = {
        QStringLiteral(R"sql(
            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        )sql"),
        QStringLiteral(R"sql(
            CREATE TABLE IF NOT EXISTS records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module TEXT NOT NULL,
                title TEXT NOT NULL,
                subtitle TEXT DEFAULT '',
                status TEXT DEFAULT '',
                amount REAL DEFAULT 0,
                currency TEXT DEFAULT 'USD',
                notes TEXT DEFAULT '',
                payload_json TEXT NOT NULL DEFAULT '{}',
                remote_id TEXT,
                dirty INTEGER NOT NULL DEFAULT 1,
                deleted INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                synced_at TEXT
            )
        )sql"),
        QStringLiteral(R"sql(
            CREATE INDEX IF NOT EXISTS idx_records_module_deleted
            ON records(module, deleted, updated_at)
        )sql"),
        QStringLiteral(R"sql(
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                record_id INTEGER,
                module TEXT NOT NULL,
                operation TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                attempts INTEGER NOT NULL DEFAULT 0,
                last_error TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(record_id) REFERENCES records(id) ON DELETE SET NULL
            )
        )sql"),
        QStringLiteral(R"sql(
            CREATE INDEX IF NOT EXISTS idx_sync_queue_status
            ON sync_queue(status, updated_at)
        )sql")
    };

    for (const QString &statement : statements) {
        if (!query.exec(statement)) {
            if (errorMessage) {
                *errorMessage = query.lastError().text();
            }
            return false;
        }
    }

    return true;
}

bool OfflineStore::seedDefaults(QString *errorMessage) {
    const QMap<QString, QString> defaults = {
        {QStringLiteral("apiBaseUrl"), QStringLiteral("http://localhost:8080")},
        {QStringLiteral("tenantSlug"), QStringLiteral("default")},
        {QStringLiteral("operatorEmail"), QStringLiteral("")},
        {QStringLiteral("platformName"), QStringLiteral("MST Agritech")},
        {QStringLiteral("supportEmail"), QStringLiteral("support@mst.co.zw")},
        {QStringLiteral("defaultCurrency"), QStringLiteral("USD")},
        {QStringLiteral("autoSyncEnabled"), QStringLiteral("false")},
        {QStringLiteral("maintenanceMode"), QStringLiteral("false")},
        {QStringLiteral("retryCount"), QStringLiteral("3")},
        {QStringLiteral("maxOrderValueUsd"), QStringLiteral("50000")}
    };

    for (auto it = defaults.cbegin(); it != defaults.cend(); ++it) {
        if (readSetting(it.key()).isNull() && !writeSetting(it.key(), it.value(), errorMessage)) {
            return false;
        }
    }

    return true;
}

QString OfflineStore::readSetting(const QString &key, const QString &fallback) const {
    QSqlQuery query(database());
    query.prepare(QStringLiteral("SELECT value FROM app_settings WHERE key = :key"));
    query.bindValue(QStringLiteral(":key"), key);
    if (!query.exec() || !query.next()) {
        return fallback;
    }
    return query.value(0).toString();
}

bool OfflineStore::writeSetting(const QString &key, const QString &value, QString *errorMessage) {
    QSqlQuery query(database());
    query.prepare(QStringLiteral(R"sql(
        INSERT INTO app_settings(key, value)
        VALUES(:key, :value)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
    )sql"));
    query.bindValue(QStringLiteral(":key"), key);
    query.bindValue(QStringLiteral(":value"), value.isNull() ? QStringLiteral("") : value);
    if (!query.exec()) {
        if (errorMessage) {
            *errorMessage = query.lastError().text();
        }
        return false;
    }
    return true;
}

AppSettings OfflineStore::settings() const {
    AppSettings settings;
    settings.apiBaseUrl = readSetting(QStringLiteral("apiBaseUrl"), QStringLiteral("http://localhost:8080"));
    settings.tenantSlug = readSetting(QStringLiteral("tenantSlug"), QStringLiteral("default"));
    settings.operatorEmail = readSetting(QStringLiteral("operatorEmail"));
    settings.platformName = readSetting(QStringLiteral("platformName"), QStringLiteral("MST Agritech"));
    settings.supportEmail = readSetting(QStringLiteral("supportEmail"), QStringLiteral("support@mst.co.zw"));
    settings.defaultCurrency = readSetting(QStringLiteral("defaultCurrency"), QStringLiteral("USD"));
    settings.autoSyncEnabled = readSetting(QStringLiteral("autoSyncEnabled"), QStringLiteral("false")) == QStringLiteral("true");
    settings.maintenanceMode = readSetting(QStringLiteral("maintenanceMode"), QStringLiteral("false")) == QStringLiteral("true");
    settings.retryCount = readSetting(QStringLiteral("retryCount"), QStringLiteral("3")).toInt();
    settings.maxOrderValueUsd = readSetting(QStringLiteral("maxOrderValueUsd"), QStringLiteral("50000")).toDouble();
    return settings;
}

bool OfflineStore::saveSettings(const AppSettings &settings, QString *errorMessage) {
    QSqlDatabase db = database();
    if (!db.transaction()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    const QMap<QString, QString> values = {
        {QStringLiteral("apiBaseUrl"), settings.apiBaseUrl},
        {QStringLiteral("tenantSlug"), settings.tenantSlug},
        {QStringLiteral("operatorEmail"), settings.operatorEmail},
        {QStringLiteral("platformName"), settings.platformName},
        {QStringLiteral("supportEmail"), settings.supportEmail},
        {QStringLiteral("defaultCurrency"), settings.defaultCurrency},
        {QStringLiteral("autoSyncEnabled"), settings.autoSyncEnabled ? QStringLiteral("true") : QStringLiteral("false")},
        {QStringLiteral("maintenanceMode"), settings.maintenanceMode ? QStringLiteral("true") : QStringLiteral("false")},
        {QStringLiteral("retryCount"), QString::number(settings.retryCount)},
        {QStringLiteral("maxOrderValueUsd"), QString::number(settings.maxOrderValueUsd, 'f', 2)}
    };

    for (auto it = values.cbegin(); it != values.cend(); ++it) {
        if (!writeSetting(it.key(), it.value(), errorMessage)) {
            db.rollback();
            return false;
        }
    }

    if (!db.commit()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    emit settingsChanged();
    return true;
}

int OfflineStore::createRecord(const QString &module,
                               const QString &title,
                               const QString &subtitle,
                               const QString &status,
                               double amount,
                               const QString &currency,
                               const QString &notes,
                               const QJsonObject &payload,
                               QString *errorMessage) {
    const QString timestamp = nowIso();
    QSqlDatabase db = database();
    if (!db.transaction()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return -1;
    }

    QSqlQuery query(db);
    query.prepare(QStringLiteral(R"sql(
        INSERT INTO records(module, title, subtitle, status, amount, currency, notes, payload_json, dirty, deleted, created_at, updated_at)
        VALUES(:module, :title, :subtitle, :status, :amount, :currency, :notes, :payload, 1, 0, :createdAt, :updatedAt)
    )sql"));
    query.bindValue(QStringLiteral(":module"), module);
    query.bindValue(QStringLiteral(":title"), title);
    query.bindValue(QStringLiteral(":subtitle"), subtitle);
    query.bindValue(QStringLiteral(":status"), status);
    query.bindValue(QStringLiteral(":amount"), amount);
    query.bindValue(QStringLiteral(":currency"), currency);
    query.bindValue(QStringLiteral(":notes"), notes);
    query.bindValue(QStringLiteral(":payload"), QString::fromUtf8(QJsonDocument(payload).toJson(QJsonDocument::Compact)));
    query.bindValue(QStringLiteral(":createdAt"), timestamp);
    query.bindValue(QStringLiteral(":updatedAt"), timestamp);

    if (!query.exec()) {
        if (errorMessage) {
            *errorMessage = query.lastError().text();
        }
        db.rollback();
        return -1;
    }

    const int id = query.lastInsertId().toInt();
    QJsonObject changePayload = recordPayload(id);
    if (!enqueueChange(id, module, QStringLiteral("UPSERT"), changePayload, errorMessage)) {
        db.rollback();
        return -1;
    }

    if (!db.commit()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return -1;
    }

    emit dataChanged();
    emit queueChanged();
    return id;
}

bool OfflineStore::updateRecord(int id,
                                const QString &title,
                                const QString &subtitle,
                                const QString &status,
                                double amount,
                                const QString &currency,
                                const QString &notes,
                                const QJsonObject &payload,
                                QString *errorMessage) {
    QSqlDatabase db = database();
    if (!db.transaction()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    QSqlQuery update(db);
    update.prepare(QStringLiteral(R"sql(
        UPDATE records
        SET title = :title,
            subtitle = :subtitle,
            status = :status,
            amount = :amount,
            currency = :currency,
            notes = :notes,
            payload_json = :payload,
            dirty = 1,
            updated_at = :updatedAt
        WHERE id = :id AND deleted = 0
    )sql"));
    update.bindValue(QStringLiteral(":title"), title);
    update.bindValue(QStringLiteral(":subtitle"), subtitle);
    update.bindValue(QStringLiteral(":status"), status);
    update.bindValue(QStringLiteral(":amount"), amount);
    update.bindValue(QStringLiteral(":currency"), currency);
    update.bindValue(QStringLiteral(":notes"), notes);
    update.bindValue(QStringLiteral(":payload"), QString::fromUtf8(QJsonDocument(payload).toJson(QJsonDocument::Compact)));
    update.bindValue(QStringLiteral(":updatedAt"), nowIso());
    update.bindValue(QStringLiteral(":id"), id);

    if (!update.exec()) {
        if (errorMessage) {
            *errorMessage = update.lastError().text();
        }
        db.rollback();
        return false;
    }

    QJsonObject changePayload = recordPayload(id);
    if (!enqueueChange(id, changePayload.value(QStringLiteral("module")).toString(), QStringLiteral("UPSERT"), changePayload, errorMessage)) {
        db.rollback();
        return false;
    }

    if (!db.commit()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    emit dataChanged();
    emit queueChanged();
    return true;
}

bool OfflineStore::markDeleted(int id, QString *errorMessage) {
    QJsonObject payload = recordPayload(id);
    if (payload.isEmpty()) {
        if (errorMessage) {
            *errorMessage = QStringLiteral("Record not found.");
        }
        return false;
    }

    QSqlDatabase db = database();
    if (!db.transaction()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    QSqlQuery update(db);
    update.prepare(QStringLiteral(R"sql(
        UPDATE records
        SET deleted = 1,
            dirty = 1,
            updated_at = :updatedAt
        WHERE id = :id
    )sql"));
    update.bindValue(QStringLiteral(":updatedAt"), nowIso());
    update.bindValue(QStringLiteral(":id"), id);
    if (!update.exec()) {
        if (errorMessage) {
            *errorMessage = update.lastError().text();
        }
        db.rollback();
        return false;
    }

    payload.insert(QStringLiteral("deleted"), true);
    if (!enqueueChange(id, payload.value(QStringLiteral("module")).toString(), QStringLiteral("DELETE"), payload, errorMessage)) {
        db.rollback();
        return false;
    }

    if (!db.commit()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    emit dataChanged();
    emit queueChanged();
    return true;
}

bool OfflineStore::enqueueChange(int recordId,
                                 const QString &module,
                                 const QString &operation,
                                 const QJsonObject &payload,
                                 QString *errorMessage) {
    QSqlQuery query(database());
    query.prepare(QStringLiteral(R"sql(
        INSERT INTO sync_queue(record_id, module, operation, payload_json, status, created_at, updated_at)
        VALUES(:recordId, :module, :operation, :payload, 'PENDING', :createdAt, :updatedAt)
    )sql"));
    query.bindValue(QStringLiteral(":recordId"), recordId);
    query.bindValue(QStringLiteral(":module"), module);
    query.bindValue(QStringLiteral(":operation"), operation);
    query.bindValue(QStringLiteral(":payload"), QString::fromUtf8(QJsonDocument(payload).toJson(QJsonDocument::Compact)));
    const QString timestamp = nowIso();
    query.bindValue(QStringLiteral(":createdAt"), timestamp);
    query.bindValue(QStringLiteral(":updatedAt"), timestamp);
    if (!query.exec()) {
        if (errorMessage) {
            *errorMessage = query.lastError().text();
        }
        return false;
    }
    return true;
}

QJsonObject OfflineStore::recordPayload(int recordId) const {
    QSqlQuery query(database());
    query.prepare(QStringLiteral(R"sql(
        SELECT id, module, title, subtitle, status, amount, currency, notes, payload_json, remote_id, deleted, created_at, updated_at
        FROM records
        WHERE id = :id
    )sql"));
    query.bindValue(QStringLiteral(":id"), recordId);
    if (!query.exec() || !query.next()) {
        return {};
    }

    QJsonParseError parseError;
    const QJsonDocument extra = QJsonDocument::fromJson(query.value(8).toString().toUtf8(), &parseError);
    QJsonObject payload = parseError.error == QJsonParseError::NoError && extra.isObject() ? extra.object() : QJsonObject();
    payload.insert(QStringLiteral("localId"), query.value(0).toInt());
    payload.insert(QStringLiteral("module"), query.value(1).toString());
    payload.insert(QStringLiteral("title"), query.value(2).toString());
    payload.insert(QStringLiteral("subtitle"), query.value(3).toString());
    payload.insert(QStringLiteral("status"), query.value(4).toString());
    payload.insert(QStringLiteral("amount"), query.value(5).toDouble());
    payload.insert(QStringLiteral("currency"), query.value(6).toString());
    payload.insert(QStringLiteral("notes"), query.value(7).toString());
    payload.insert(QStringLiteral("remoteId"), query.value(9).toString());
    payload.insert(QStringLiteral("deleted"), query.value(10).toInt() == 1);
    payload.insert(QStringLiteral("createdAt"), query.value(11).toString());
    payload.insert(QStringLiteral("updatedAt"), query.value(12).toString());
    return payload;
}

QJsonArray OfflineStore::pendingChanges() const {
    QJsonArray changes;
    QSqlQuery query(database());
    query.prepare(QStringLiteral(R"sql(
        SELECT id, record_id, module, operation, payload_json, attempts, created_at, updated_at
        FROM sync_queue
        WHERE status = 'PENDING'
        ORDER BY id ASC
    )sql"));
    if (!query.exec()) {
        return changes;
    }

    while (query.next()) {
        QJsonParseError parseError;
        QJsonDocument payload = QJsonDocument::fromJson(query.value(4).toString().toUtf8(), &parseError);
        QJsonObject item;
        item.insert(QStringLiteral("queueId"), query.value(0).toInt());
        item.insert(QStringLiteral("recordId"), query.value(1).toInt());
        item.insert(QStringLiteral("module"), query.value(2).toString());
        item.insert(QStringLiteral("operation"), query.value(3).toString());
        item.insert(QStringLiteral("payload"), parseError.error == QJsonParseError::NoError && payload.isObject() ? payload.object() : QJsonObject());
        item.insert(QStringLiteral("attempts"), query.value(5).toInt());
        item.insert(QStringLiteral("createdAt"), query.value(6).toString());
        item.insert(QStringLiteral("updatedAt"), query.value(7).toString());
        changes.append(item);
    }
    return changes;
}

bool OfflineStore::markQueueItemSynced(int queueId, const QString &remoteId, QString *errorMessage) {
    QSqlDatabase db = database();
    if (!db.transaction()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    int recordId = -1;
    {
        QSqlQuery lookup(db);
        lookup.prepare(QStringLiteral("SELECT record_id FROM sync_queue WHERE id = :id"));
        lookup.bindValue(QStringLiteral(":id"), queueId);
        if (lookup.exec() && lookup.next()) {
            recordId = lookup.value(0).toInt();
        }
    }

    QSqlQuery markSynced(db);
    markSynced.prepare(QStringLiteral(R"sql(
        UPDATE sync_queue
        SET status = 'SYNCED',
            updated_at = :updatedAt
        WHERE id = :id
    )sql"));
    markSynced.bindValue(QStringLiteral(":updatedAt"), nowIso());
    markSynced.bindValue(QStringLiteral(":id"), queueId);
    if (!markSynced.exec()) {
        if (errorMessage) {
            *errorMessage = markSynced.lastError().text();
        }
        db.rollback();
        return false;
    }

    if (recordId > 0) {
        QSqlQuery updateRecord(db);
        updateRecord.prepare(QStringLiteral(R"sql(
            UPDATE records
            SET dirty = CASE
                    WHEN EXISTS(SELECT 1 FROM sync_queue WHERE record_id = :recordId AND status = 'PENDING') THEN 1
                    ELSE 0
                END,
                remote_id = COALESCE(NULLIF(:remoteId, ''), remote_id),
                synced_at = :syncedAt
            WHERE id = :recordId
        )sql"));
        updateRecord.bindValue(QStringLiteral(":recordId"), recordId);
        updateRecord.bindValue(QStringLiteral(":remoteId"), remoteId);
        updateRecord.bindValue(QStringLiteral(":syncedAt"), nowIso());
        if (!updateRecord.exec()) {
            if (errorMessage) {
                *errorMessage = updateRecord.lastError().text();
            }
            db.rollback();
            return false;
        }
    }

    if (!db.commit()) {
        if (errorMessage) {
            *errorMessage = db.lastError().text();
        }
        return false;
    }

    emit dataChanged();
    emit queueChanged();
    return true;
}

int OfflineStore::pendingChangeCount() const {
    QSqlQuery query(database());
    if (!query.exec(QStringLiteral("SELECT COUNT(*) FROM sync_queue WHERE status = 'PENDING'")) || !query.next()) {
        return 0;
    }
    return query.value(0).toInt();
}

QVariantMap OfflineStore::localKpis() const {
    QVariantMap values;
    QSqlQuery moduleCounts(database());
    moduleCounts.prepare(QStringLiteral(R"sql(
        SELECT module, COUNT(*)
        FROM records
        WHERE deleted = 0
        GROUP BY module
    )sql"));
    if (moduleCounts.exec()) {
        while (moduleCounts.next()) {
            values.insert(moduleCounts.value(0).toString(), moduleCounts.value(1).toInt());
        }
    }

    values.insert(QStringLiteral("pendingChanges"), pendingChangeCount());

    QSqlQuery dirty(database());
    if (dirty.exec(QStringLiteral("SELECT COUNT(*) FROM records WHERE dirty = 1")) && dirty.next()) {
        values.insert(QStringLiteral("dirtyRecords"), dirty.value(0).toInt());
    }

    return values;
}

QString OfflineStore::nowIso() {
    return QDateTime::currentDateTimeUtc().toString(Qt::ISODateWithMs);
}
