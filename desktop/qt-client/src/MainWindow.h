#pragma once

#include "OfflineStore.h"
#include "SyncManager.h"

#include <QMainWindow>

class QLabel;
class QListWidget;
class QSqlTableModel;
class QStackedWidget;
class QTableView;

class MainWindow : public QMainWindow {
    Q_OBJECT

public:
    explicit MainWindow(OfflineStore *store,
                        QWidget *parent = nullptr,
                        bool enableBackgroundSync = true);

private:
    QWidget *createDashboardPage();
    QWidget *createSyncPage();
    QWidget *createModulePage(const QString &module,
                              const QString &description,
                              const QStringList &statusOptions);
    void addPage(const QString &name, QWidget *page);
    void updateDashboard();
    void updateStatusBar();
    void refreshSyncQueue();

    OfflineStore *m_store = nullptr;
    SyncManager *m_syncManager = nullptr;
    QListWidget *m_navigation = nullptr;
    QStackedWidget *m_stack = nullptr;
    QLabel *m_onlineLabel = nullptr;
    QLabel *m_pendingLabel = nullptr;
    QLabel *m_databaseLabel = nullptr;
    QLabel *m_farmerCountLabel = nullptr;
    QLabel *m_buyerCountLabel = nullptr;
    QLabel *m_orderCountLabel = nullptr;
    QLabel *m_pendingChangesLabel = nullptr;
    QLabel *m_dirtyRecordsLabel = nullptr;
    QSqlTableModel *m_queueModel = nullptr;
    QTableView *m_queueTable = nullptr;
};
