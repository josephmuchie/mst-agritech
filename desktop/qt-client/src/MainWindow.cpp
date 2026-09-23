#include "MainWindow.h"

#include "DataModuleWidget.h"
#include "DataIngestionWidget.h"
#include "SettingsWidget.h"

#include <QFrame>
#include <QGridLayout>
#include <QHeaderView>
#include <QLabel>
#include <QListWidget>
#include <QMenuBar>
#include <QMessageBox>
#include <QPainter>
#include <QPixmap>
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

QPixmap cyanBrandLogo() {
    QPixmap pixmap(188, 52);
    pixmap.fill(Qt::transparent);

    QPainter painter(&pixmap);
    painter.setRenderHint(QPainter::Antialiasing);
    const QColor cyan(QStringLiteral("#00D3F3"));
    const QColor navy(QStringLiteral("#0F172A"));

    QRectF mark(0, 5, 42, 42);
    painter.setBrush(cyan);
    painter.setPen(Qt::NoPen);
    painter.drawRoundedRect(mark, 10, 10);

    QPen whitePen(Qt::white, 2.6, Qt::SolidLine, Qt::RoundCap, Qt::RoundJoin);
    painter.setPen(whitePen);
    painter.drawArc(QRectF(8, 13, 34, 36), 25 * 16, 115 * 16);
    painter.drawArc(QRectF(5, 8, 32, 34), 205 * 16, 95 * 16);
    painter.drawLine(QPointF(20, 36), QPointF(33, 18));

    QFont titleFont(QStringLiteral("Arial"), 15, QFont::DemiBold);
    painter.setFont(titleFont);
    painter.setPen(navy);
    painter.drawText(QRectF(52, 5, 132, 24), Qt::AlignLeft | Qt::AlignVCenter, QStringLiteral("MST"));

    QFont subtitleFont(QStringLiteral("Arial"), 9, QFont::Medium);
    painter.setFont(subtitleFont);
    painter.setPen(cyan.darker(120));
    painter.drawText(QRectF(52, 27, 132, 18), Qt::AlignLeft | Qt::AlignVCenter, QStringLiteral("AGRITECH"));

    return pixmap;
}

} // namespace

MainWindow::MainWindow(OfflineStore *store, QWidget *parent, bool enableBackgroundSync)
    : QMainWindow(parent),
      m_store(store),
      m_syncManager(new SyncManager(store, this)) {
    setWindowTitle(QStringLiteral("MST Agritech Desktop"));
    resize(1280, 820);

    m_navigation = new QListWidget(this);
    m_navigation->setMaximumWidth(230);
    m_navigation->setMinimumWidth(190);

    m_stack = new QStackedWidget(this);
    auto *navPanel = new QFrame(this);
    navPanel->setObjectName(QStringLiteral("NavPanel"));
    auto *navLayout = new QVBoxLayout(navPanel);
    navLayout->setContentsMargins(18, 18, 18, 18);
    m_logoLabel = new QLabel(navPanel);
    m_logoLabel->setPixmap(cyanBrandLogo());
    navLayout->addWidget(m_logoLabel);
    navLayout->addSpacing(12);
    navLayout->addWidget(m_navigation, 1);

    auto *splitter = new QSplitter(this);
    splitter->addWidget(navPanel);
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
    addPage(QStringLiteral("Data Ingestion"), new DataIngestionWidget(m_store, this));
    addPage(QStringLiteral("Settings"), new SettingsWidget(m_store, this));
    addPage(QStringLiteral("Sync Queue"), createSyncPage());

    connect(m_navigation, &QListWidget::currentRowChanged, m_stack, &QStackedWidget::setCurrentIndex);
    m_navigation->setCurrentRow(0);
    buildMenus();

    m_onlineLabel = new QLabel(this);
    m_pendingLabel = new QLabel(this);
    m_databaseLabel = new QLabel(this);
    statusBar()->addPermanentWidget(m_onlineLabel);
    statusBar()->addPermanentWidget(m_pendingLabel);
    statusBar()->addPermanentWidget(m_databaseLabel, 1);

    connect(m_store, &OfflineStore::dataChanged, this, &MainWindow::updateDashboard);
    connect(m_store, &OfflineStore::queueChanged, this, &MainWindow::updateStatusBar);
    connect(m_store, &OfflineStore::queueChanged, this, &MainWindow::refreshSyncQueue);
    connect(m_store, &OfflineStore::settingsChanged, this, &MainWindow::applyTheme);
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

    if (enableBackgroundSync) {
        auto *timer = new QTimer(this);
        timer->setInterval(60000);
        connect(timer, &QTimer::timeout, this, [this]() {
            if (m_store->settings().autoSyncEnabled) {
                m_syncManager->checkConnectivity();
                m_syncManager->syncNow();
            }
        });
        timer->start();
    }

    updateDashboard();
    updateStatusBar();
    refreshSyncQueue();
    applyTheme();
    if (enableBackgroundSync) {
        m_syncManager->checkConnectivity();
    }
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

void MainWindow::buildMenus() {
    auto *fileMenu = menuBar()->addMenu(QStringLiteral("&File"));
    fileMenu->addAction(QStringLiteral("Dashboard"), this, [this]() { selectPage(QStringLiteral("Dashboard")); });
    fileMenu->addAction(QStringLiteral("Data Ingestion"), this, [this]() { selectPage(QStringLiteral("Data Ingestion")); });
    fileMenu->addSeparator();
    fileMenu->addAction(QStringLiteral("Sync Now"), m_syncManager, &SyncManager::syncNow);
    fileMenu->addAction(QStringLiteral("Settings"), this, [this]() { selectPage(QStringLiteral("Settings")); });
    fileMenu->addSeparator();
    fileMenu->addAction(QStringLiteral("Quit"), this, &QWidget::close);

    auto *dataMenu = menuBar()->addMenu(QStringLiteral("&Data"));
    for (const QString &page : {
             QStringLiteral("Farmers"),
             QStringLiteral("Buyers"),
             QStringLiteral("Orders"),
             QStringLiteral("Payments"),
             QStringLiteral("Shipments"),
             QStringLiteral("Marketplace"),
             QStringLiteral("Master Data"),
         }) {
        dataMenu->addAction(page, this, [this, page]() { selectPage(page); });
    }
    dataMenu->addSeparator();
    dataMenu->addAction(QStringLiteral("Data Ingestion"), this, [this]() { selectPage(QStringLiteral("Data Ingestion")); });

    auto *analyticsMenu = menuBar()->addMenu(QStringLiteral("&Analytics"));
    analyticsMenu->addAction(QStringLiteral("Dashboard"), this, [this]() { selectPage(QStringLiteral("Dashboard")); });
    analyticsMenu->addAction(QStringLiteral("Analytics && Reports"), this, [this]() { selectPage(QStringLiteral("Analytics & Reports")); });

    auto *toolsMenu = menuBar()->addMenu(QStringLiteral("&Tools"));
    toolsMenu->addAction(QStringLiteral("Check API Connection"), m_syncManager, &SyncManager::checkConnectivity);
    toolsMenu->addAction(QStringLiteral("Sync Queue"), this, [this]() { selectPage(QStringLiteral("Sync Queue")); });
    toolsMenu->addAction(QStringLiteral("Settings"), this, [this]() { selectPage(QStringLiteral("Settings")); });

    auto *viewMenu = menuBar()->addMenu(QStringLiteral("&View"));
    auto *themeMenu = viewMenu->addMenu(QStringLiteral("Theme"));
    themeMenu->addAction(QStringLiteral("Mukuyu White"), this, [this]() { setTheme(QStringLiteral("mukuyu")); });
    themeMenu->addAction(QStringLiteral("Bundles Blue"), this, [this]() { setTheme(QStringLiteral("bundles")); });
    themeMenu->addAction(QStringLiteral("SAP Fiori"), this, [this]() { setTheme(QStringLiteral("sap")); });
    themeMenu->addAction(QStringLiteral("Oracle Redwood"), this, [this]() { setTheme(QStringLiteral("oracle")); });

    auto *helpMenu = menuBar()->addMenu(QStringLiteral("&Help"));
    helpMenu->addAction(QStringLiteral("About MST Agritech Desktop"), this, [this]() {
        QMessageBox::about(
            this,
            QStringLiteral("MST Agritech Desktop"),
            QStringLiteral("MST Agritech Desktop\n\nOffline-first agricultural trade operations for macOS and Windows.\n\nUse the Data and Tools menus to manage records, ingestion, sync, and settings."));
    });
}

void MainWindow::selectPage(const QString &name) {
    const QList<QListWidgetItem *> matches = m_navigation->findItems(name, Qt::MatchExactly);
    if (!matches.isEmpty()) {
        m_navigation->setCurrentItem(matches.first());
    }
}

void MainWindow::setTheme(const QString &theme) {
    AppSettings settings = m_store->settings();
    settings.desktopTheme = theme;
    QString error;
    if (!m_store->saveSettings(settings, &error)) {
        QMessageBox::warning(this, QStringLiteral("Theme"), QStringLiteral("Could not save theme: %1").arg(error));
        return;
    }
    applyTheme();
}

void MainWindow::applyTheme() {
    const QString theme = m_store->settings().desktopTheme;
    QString accent = QStringLiteral("#00D3F3");
    QString accentDark = QStringLiteral("#0891B2");
    QString soft = QStringLiteral("#E6FAFE");

    if (theme == QStringLiteral("bundles")) {
        accent = QStringLiteral("#2563EB");
        accentDark = QStringLiteral("#1D4ED8");
        soft = QStringLiteral("#EFF6FF");
    } else if (theme == QStringLiteral("sap")) {
        accent = QStringLiteral("#0A6ED1");
        accentDark = QStringLiteral("#0854A0");
        soft = QStringLiteral("#F5FAFF");
    } else if (theme == QStringLiteral("oracle")) {
        accent = QStringLiteral("#C74634");
        accentDark = QStringLiteral("#9E2F22");
        soft = QStringLiteral("#FFF3EF");
    }

    setStyleSheet(QStringLiteral(R"qss(
        QMainWindow, QWidget {
            background: #F6F8FB;
            color: #1F2937;
            font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
        }
        QFrame#NavPanel {
            background: #FFFFFF;
            border-right: 1px solid #E5E7EB;
        }
        QSplitter::handle {
            background: #E5EAF0;
        }
        QMenuBar {
            background: #FFFFFF;
            border-bottom: 1px solid #E5E7EB;
            padding: 4px 10px;
        }
        QMenuBar::item {
            background: transparent;
            border-radius: 8px;
            padding: 7px 11px;
        }
        QMenuBar::item:selected {
            background: %3;
            color: %2;
        }
        QMenu {
            background: #FFFFFF;
            border: 1px solid #DDE4EE;
            border-radius: 8px;
            padding: 6px;
        }
        QMenu::item {
            border-radius: 6px;
            padding: 7px 28px 7px 12px;
        }
        QMenu::item:selected {
            background: %3;
            color: %2;
        }
        QListWidget {
            background: #FFFFFF;
            border: none;
            outline: 0;
            padding-top: 4px;
        }
        QListWidget::item {
            border: 1px solid transparent;
            border-radius: 6px;
            margin: 2px 0;
            padding: 10px 12px 10px 16px;
            color: #475569;
        }
        QListWidget::item:hover {
            background: #F5F7FA;
            border: 1px solid transparent;
            color: #0F172A;
        }
        QListWidget::item:selected {
            background: #EEF3F6;
            color: #111827;
            font-weight: 700;
            border: none;
            border-left: 4px solid %1;
            border-radius: 6px;
            padding-left: 16px;
        }
        QLabel {
            background: transparent;
        }
        QFrame[frameShape="6"], QGroupBox, QTableView, QTabWidget::pane {
            background: #FFFFFF;
            border: 1px solid #E6EAF0;
            border-radius: 14px;
        }
        QTableView {
            gridline-color: #EEF2F7;
            alternate-background-color: #FAFBFC;
            selection-background-color: %3;
            selection-color: #111827;
        }
        QHeaderView::section {
            background: #F8FAFC;
            color: #475569;
            border: none;
            border-bottom: 1px solid #E5E7EB;
            padding: 10px;
            font-weight: 700;
        }
        QPushButton {
            background: #FFFFFF;
            border: 1px solid #CBD5E1;
            border-radius: 10px;
            padding: 8px 14px;
        }
        QPushButton:hover {
            border-color: %1;
            color: %1;
            background: %3;
        }
        QPushButton:pressed {
            background: %2;
            color: #FFFFFF;
        }
        QLineEdit, QTextEdit, QPlainTextEdit, QComboBox, QSpinBox, QDoubleSpinBox {
            background: #FFFFFF;
            border: 1px solid #D7DEE8;
            border-radius: 10px;
            padding: 8px;
        }
        QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QComboBox:focus {
            border: 1px solid %1;
            background: #FFFFFF;
        }
        QTabBar::tab {
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-bottom: none;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            padding: 10px 16px;
            margin-right: 4px;
        }
        QTabBar::tab:selected {
            color: %2;
            background: %3;
            font-weight: 700;
        }
        QStatusBar {
            background: #FFFFFF;
            border-top: 1px solid #E5E7EB;
        }
    )qss").arg(accent, accentDark, soft));
}
