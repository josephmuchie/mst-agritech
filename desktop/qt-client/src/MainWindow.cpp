#include "MainWindow.h"

#include "DataModuleWidget.h"
#include "SettingsWidget.h"

#include <QFrame>
#include <QGridLayout>
#include <QHeaderView>
#include <QLabel>
#include <QListWidget>
#include <QMessageBox>
#include <QPushButton>
#include <QSplitter>
#include <QSqlTableModel>
#include <QStackedWidget>
#include <QStatusBar>
#include <QTableView>
#include <QTimer>
#include <QVBoxLayout>

namespace {

QFrame *metricCard(const QString &title, QLabel *valueLabel) {
    auto *frame = new QFrame;
    frame->setFrameShape(QFrame::StyledPanel);
    frame->setMinimumHeight(100);

    auto *titleLabel = new QLabel(QStringLiteral("<b>%1</b>").arg(title), frame);
    valueLabel->setText(QStringLiteral("0"));
    QFont font = valueLabel->font();
    font.setPointSize(font.pointSize() + 10);
    font.setBold(true);
    valueLabel->setFont(font);

    auto *layout = new QVBoxLayout(frame);
    layout->addWidget(titleLabel);
    layout->addWidget(valueLabel);
    layout->addStretch(1);
    return frame;
}

QStringList statusOptionsFor(const QString &module) {
    if (module == QStringLiteral("Farmers") || module == QStringLiteral("Buyers")) {
        return {QStringLiteral("PENDING"), QStringLiteral("VERIFIED"), QStringLiteral("SUSPENDED")};
    }
    if (module == QStringLiteral("Orders")) {
        return {QStringLiteral("DRAFT"), QStringLiteral("PENDING"), QStringLiteral("CONFIRMED"), QStringLiteral("PROCESSING"),
                QStringLiteral("SHIPPED"), QStringLiteral("DELIVERED"), QStringLiteral("CANCELLED"), QStringLiteral("DISPUTED")};
    }
    if (module == QStringLiteral("Payments")) {
        return {QStringLiteral("PENDING"), QStringLiteral("COMPLETED"), QStringLiteral("FAILED"), QStringLiteral("REFUNDED")};
    }
    if (module == QStringLiteral("Shipments")) {
        return {QStringLiteral("CREATED"), QStringLiteral("IN_TRANSIT"), QStringLiteral("DELIVERED"), QStringLiteral("DELAYED"), QStringLiteral("CANCELLED")};
    }
    if (module == QStringLiteral("Marketplace")) {
        return {QStringLiteral("AVAILABLE"), QStringLiteral("LOW_STOCK"), QStringLiteral("OUT_OF_STOCK"), QStringLiteral("INACTIVE")};
    }
    if (module == QStringLiteral("Analytics & Reports")) {
        return {QStringLiteral("DRAFT"), QStringLiteral("READY"), QStringLiteral("EXPORTED")};
    }
    return {QStringLiteral("ACTIVE"), QStringLiteral("INACTIVE")};
}

} // namespace

MainWindow::MainWindow(OfflineStore *store, QWidget *parent)
    : QMainWindow(parent),
      m_store(store),
      m_syncManager(new SyncManager(store, this)) {
    setWindowTitle(QStringLiteral("MST Agritech Desktop"));
    resize(1280, 820);

    m_navigation = new QListWidget(this);
    m_navigation->setMaximumWidth(230);
    m_navigation->setMinimumWidth(190);

    m_stack = new QStackedWidget(this);
    auto *splitter = new QSplitter(this);
    splitter->addWidget(m_navigation);
    splitter->addWidget(m_stack);
    splitter->setStretchFactor(1, 1);
    setCentralWidget(splitter);

    addPage(QStringLiteral("Dashboard"), createDashboardPage());
    addPage(QStringLiteral("Farmers"), createModulePage(
        QStringLiteral("Farmers"),
        QStringLiteral("Capture farmer details, farm information, verification status, acreage, and offline notes."),
        statusOptionsFor(QStringLiteral("Farmers"))));
    addPage(QStringLiteral("Buyers"), createModulePage(
        QStringLiteral("Buyers"),
        QStringLiteral("Manage buyer companies, contacts, buyer type, verification status, and relationship notes."),
        statusOptionsFor(QStringLiteral("Buyers"))));
    addPage(QStringLiteral("Orders"), createModulePage(
        QStringLiteral("Orders"),
        QStringLiteral("Create and update orders, references, order value, currency, status, and fulfilment notes."),
        statusOptionsFor(QStringLiteral("Orders"))));
    addPage(QStringLiteral("Payments"), createModulePage(
        QStringLiteral("Payments"),
        QStringLiteral("Record payments, gateways, amount, currency, status, and reconciliation notes while offline."),
        statusOptionsFor(QStringLiteral("Payments"))));
    addPage(QStringLiteral("Shipments"), createModulePage(
        QStringLiteral("Shipments"),
        QStringLiteral("Track carriers, routes, shipment status, ETA notes, and field updates without connectivity."),
        statusOptionsFor(QStringLiteral("Shipments"))));
    addPage(QStringLiteral("Marketplace"), createModulePage(
        QStringLiteral("Marketplace"),
        QStringLiteral("Maintain product catalogue records, availability, stock values, prices, and product notes."),
        statusOptionsFor(QStringLiteral("Marketplace"))));
    addPage(QStringLiteral("Analytics & Reports"), createModulePage(
        QStringLiteral("Analytics & Reports"),
        QStringLiteral("Capture report requests and offline analytics observations for later synchronization."),
        statusOptionsFor(QStringLiteral("Analytics & Reports"))));
    addPage(QStringLiteral("Master Data"), createModulePage(
        QStringLiteral("Master Data"),
        QStringLiteral("Manage countries, currencies, product categories, logistics companies, and other reference data."),
        statusOptionsFor(QStringLiteral("Master Data"))));
    addPage(QStringLiteral("Settings"), new SettingsWidget(m_store, this));
    addPage(QStringLiteral("Sync Queue"), createSyncPage());

    connect(m_navigation, &QListWidget::currentRowChanged, m_stack, &QStackedWidget::setCurrentIndex);
    m_navigation->setCurrentRow(0);

    m_onlineLabel = new QLabel(this);
    m_pendingLabel = new QLabel(this);
    m_databaseLabel = new QLabel(this);
    statusBar()->addPermanentWidget(m_onlineLabel);
    statusBar()->addPermanentWidget(m_pendingLabel);
    statusBar()->addPermanentWidget(m_databaseLabel, 1);

    connect(m_store, &OfflineStore::dataChanged, this, &MainWindow::updateDashboard);
    connect(m_store, &OfflineStore::queueChanged, this, &MainWindow::updateStatusBar);
    connect(m_store, &OfflineStore::queueChanged, this, &MainWindow::refreshSyncQueue);
    connect(m_syncManager, &SyncManager::onlineStateChanged, this, &MainWindow::updateStatusBar);
    connect(m_syncManager, &SyncManager::statusMessage, this, [this](const QString &message) {
        statusBar()->showMessage(message, 5000);
    });
    connect(m_syncManager, &SyncManager::syncFinished, this, [this](bool success, const QString &message) {
        statusBar()->showMessage(message, 7000);
        if (!success) {
            QMessageBox::warning(this, QStringLiteral("Sync"), message);
        }
        updateDashboard();
        updateStatusBar();
        refreshSyncQueue();
    });

    auto *timer = new QTimer(this);
    timer->setInterval(60000);
    connect(timer, &QTimer::timeout, this, [this]() {
        if (m_store->settings().autoSyncEnabled) {
            m_syncManager->checkConnectivity();
            m_syncManager->syncNow();
        }
    });
    timer->start();

    updateDashboard();
    updateStatusBar();
    refreshSyncQueue();
    m_syncManager->checkConnectivity();
}

void MainWindow::addPage(const QString &name, QWidget *page) {
    m_navigation->addItem(name);
    m_stack->addWidget(page);
}

QWidget *MainWindow::createDashboardPage() {
    auto *page = new QWidget(this);
    auto *title = new QLabel(QStringLiteral("<h1>MST Agritech Desktop</h1>"), page);
    auto *description = new QLabel(
        QStringLiteral("Work with agricultural trade data offline on macOS and Windows. "
                       "New and updated records are stored in SQLite and queued for sync when the API is reachable."),
        page);
    description->setWordWrap(true);

    m_farmerCountLabel = new QLabel(page);
    m_buyerCountLabel = new QLabel(page);
    m_orderCountLabel = new QLabel(page);
    m_pendingChangesLabel = new QLabel(page);
    m_dirtyRecordsLabel = new QLabel(page);

    auto *grid = new QGridLayout;
    grid->addWidget(metricCard(QStringLiteral("Farmers"), m_farmerCountLabel), 0, 0);
    grid->addWidget(metricCard(QStringLiteral("Buyers"), m_buyerCountLabel), 0, 1);
    grid->addWidget(metricCard(QStringLiteral("Orders"), m_orderCountLabel), 0, 2);
    grid->addWidget(metricCard(QStringLiteral("Pending sync changes"), m_pendingChangesLabel), 1, 0);
    grid->addWidget(metricCard(QStringLiteral("Dirty local records"), m_dirtyRecordsLabel), 1, 1);

    auto *syncButton = new QPushButton(QStringLiteral("Sync now"), page);
    auto *checkButton = new QPushButton(QStringLiteral("Check API connection"), page);
    connect(syncButton, &QPushButton::clicked, m_syncManager, &SyncManager::syncNow);
    connect(checkButton, &QPushButton::clicked, m_syncManager, &SyncManager::checkConnectivity);

    auto *actions = new QHBoxLayout;
    actions->addWidget(syncButton);
    actions->addWidget(checkButton);
    actions->addStretch(1);

    auto *layout = new QVBoxLayout(page);
    layout->addWidget(title);
    layout->addWidget(description);
    layout->addLayout(grid);
    layout->addLayout(actions);
    layout->addStretch(1);
    return page;
}

QWidget *MainWindow::createModulePage(const QString &module,
                                      const QString &description,
                                      const QStringList &statusOptions) {
    return new DataModuleWidget(module, description, statusOptions, m_store, this);
}

QWidget *MainWindow::createSyncPage() {
    auto *page = new QWidget(this);
    auto *title = new QLabel(QStringLiteral("<h2>Sync Queue</h2>"), page);
    auto *description = new QLabel(
        QStringLiteral("Every offline create, update, or delete is queued here until it is accepted by the configured API endpoint."),
        page);
    description->setWordWrap(true);

    m_queueModel = new QSqlTableModel(page, m_store->database());
    m_queueModel->setTable(QStringLiteral("sync_queue"));
    m_queueModel->setSort(m_queueModel->fieldIndex(QStringLiteral("id")), Qt::AscendingOrder);
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("module")), Qt::Horizontal, QStringLiteral("Module"));
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("operation")), Qt::Horizontal, QStringLiteral("Operation"));
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("status")), Qt::Horizontal, QStringLiteral("Status"));
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("attempts")), Qt::Horizontal, QStringLiteral("Attempts"));
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("last_error")), Qt::Horizontal, QStringLiteral("Last error"));
    m_queueModel->setHeaderData(m_queueModel->fieldIndex(QStringLiteral("updated_at")), Qt::Horizontal, QStringLiteral("Updated"));

    m_queueTable = new QTableView(page);
    m_queueTable->setModel(m_queueModel);
    m_queueTable->setAlternatingRowColors(true);
    m_queueTable->horizontalHeader()->setStretchLastSection(true);
    m_queueTable->hideColumn(m_queueModel->fieldIndex(QStringLiteral("payload_json")));

    auto *syncButton = new QPushButton(QStringLiteral("Sync now"), page);
    auto *refreshButton = new QPushButton(QStringLiteral("Refresh"), page);
    connect(syncButton, &QPushButton::clicked, m_syncManager, &SyncManager::syncNow);
    connect(refreshButton, &QPushButton::clicked, this, &MainWindow::refreshSyncQueue);

    auto *actions = new QHBoxLayout;
    actions->addWidget(syncButton);
    actions->addWidget(refreshButton);
    actions->addStretch(1);

    auto *layout = new QVBoxLayout(page);
    layout->addWidget(title);
    layout->addWidget(description);
    layout->addLayout(actions);
    layout->addWidget(m_queueTable, 1);
    return page;
}

void MainWindow::updateDashboard() {
    const QVariantMap kpis = m_store->localKpis();
    m_farmerCountLabel->setText(QString::number(kpis.value(QStringLiteral("Farmers")).toInt()));
    m_buyerCountLabel->setText(QString::number(kpis.value(QStringLiteral("Buyers")).toInt()));
    m_orderCountLabel->setText(QString::number(kpis.value(QStringLiteral("Orders")).toInt()));
    m_pendingChangesLabel->setText(QString::number(kpis.value(QStringLiteral("pendingChanges")).toInt()));
    m_dirtyRecordsLabel->setText(QString::number(kpis.value(QStringLiteral("dirtyRecords")).toInt()));
}

void MainWindow::updateStatusBar() {
    m_onlineLabel->setText(m_syncManager->isOnline() ? QStringLiteral("Online") : QStringLiteral("Offline"));
    m_pendingLabel->setText(QStringLiteral("Pending changes: %1").arg(m_store->pendingChangeCount()));
    m_databaseLabel->setText(QStringLiteral("Local DB: %1").arg(m_store->databasePath()));
}

void MainWindow::refreshSyncQueue() {
    if (m_queueModel) {
        m_queueModel->select();
    }
}
