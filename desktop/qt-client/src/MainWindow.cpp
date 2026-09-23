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
#include <QSvgRenderer>
#include <QTableView>
#include <QTimer>
#include <QVBoxLayout>

namespace {

QFrame *metricCard(const QString &title, QLabel *valueLabel) {
    auto *frame = new QFrame;
    frame->setObjectName(QStringLiteral("MetricCard"));
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

QFrame *quickActionCard(const QString &title, const QString &description, QPushButton *button) {
    auto *frame = new QFrame;
    frame->setObjectName(QStringLiteral("QuickActionCard"));
    frame->setFrameShape(QFrame::StyledPanel);
    auto *titleLabel = new QLabel(QStringLiteral("<b>%1</b>").arg(title), frame);
    auto *descriptionLabel = new QLabel(description, frame);
    descriptionLabel->setWordWrap(true);

    auto *layout = new QVBoxLayout(frame);
    layout->addWidget(titleLabel);
    layout->addWidget(descriptionLabel);
    layout->addStretch(1);
    layout->addWidget(button, 0, Qt::AlignLeft);
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

class BrandLockupWidget : public QWidget {
public:
    explicit BrandLockupWidget(QWidget *parent = nullptr)
        : QWidget(parent),
          m_icon(QStringLiteral(":/brand/icon-cyan.svg")) {
        setMinimumSize(188, 58);
        setMaximumHeight(64);
    }

    QSize sizeHint() const override {
        return QSize(188, 58);
    }

protected:
    void paintEvent(QPaintEvent *) override {
        QPainter painter(this);
        painter.setRenderHint(QPainter::Antialiasing);

        const QColor cyan(QStringLiteral("#00D3F3"));
        const QColor teal(QStringLiteral("#71E6F4"));
        const QColor text(QStringLiteral("#F8FAFC"));

        const QRectF iconRect(0, 7, 44, 44);
        if (m_icon.isValid()) {
            m_icon.render(&painter, iconRect);
        } else {
            painter.setPen(Qt::NoPen);
            painter.setBrush(cyan);
            painter.drawRoundedRect(iconRect, 10, 10);
            painter.setPen(QPen(Qt::white, 2.4, Qt::SolidLine, Qt::RoundCap, Qt::RoundJoin));
            painter.drawArc(QRectF(8, 15, 30, 30), 30 * 16, 115 * 16);
            painter.drawLine(QPointF(19, 38), QPointF(32, 19));
        }

        QFont titleFont(QStringLiteral("Arial"), 16, QFont::DemiBold);
        painter.setFont(titleFont);
        painter.setPen(text);
        painter.drawText(QRectF(56, 7, width() - 58, 25), Qt::AlignLeft | Qt::AlignVCenter, QStringLiteral("MukuyuSmart"));

        QFont subtitleFont(QStringLiteral("Arial"), 8, QFont::Medium);
        subtitleFont.setLetterSpacing(QFont::AbsoluteSpacing, 1.4);
        painter.setFont(subtitleFont);
        painter.setPen(teal);
        painter.drawText(QRectF(57, 33, width() - 60, 16), Qt::AlignLeft | Qt::AlignVCenter, QStringLiteral("TECHNOLOGIES"));

        painter.setBrush(cyan);
        painter.setPen(Qt::NoPen);
        painter.drawRoundedRect(QRectF(57, 52, 80, 3), 1.5, 1.5);
    }

private:
    QSvgRenderer m_icon;
};

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
    navLayout->addWidget(new BrandLockupWidget(navPanel));
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
    auto *hero = new QFrame(page);
    hero->setObjectName(QStringLiteral("WelcomeHero"));
    auto *title = new QLabel(QStringLiteral("<h1>Welcome to MST Agritech Desktop</h1>"), hero);
    auto *description = new QLabel(
        QStringLiteral("Offline-first agricultural trade operations, built for desktop workflows. "
                       "Capture data locally, review queued changes, and sync when the server is available."),
        hero);
    description->setWordWrap(true);

    auto *heroLayout = new QVBoxLayout(hero);
    heroLayout->addWidget(title);
    heroLayout->addWidget(description);

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

    auto *openIngestion = new QPushButton(QStringLiteral("Open ingestion"), page);
    auto *openSettings = new QPushButton(QStringLiteral("Open settings"), page);
    connect(openIngestion, &QPushButton::clicked, this, [this]() { selectPage(QStringLiteral("Data Ingestion")); });
    connect(openSettings, &QPushButton::clicked, this, [this]() { selectPage(QStringLiteral("Settings")); });

    auto *quickGrid = new QGridLayout;
    quickGrid->addWidget(quickActionCard(QStringLiteral("Server sync"), QStringLiteral("Check connectivity and push queued offline changes to the backend."), syncButton), 0, 0);
    quickGrid->addWidget(quickActionCard(QStringLiteral("Data ingestion"), QStringLiteral("Stage JSON/file imports or submit online ingestion payloads."), openIngestion), 0, 1);
    quickGrid->addWidget(quickActionCard(QStringLiteral("Connection settings"), QStringLiteral("Configure API URL, tenant, operator, and access token."), openSettings), 0, 2);
    quickGrid->addWidget(quickActionCard(QStringLiteral("API health"), QStringLiteral("Verify the configured backend is reachable before syncing."), checkButton), 0, 3);

    auto *layout = new QVBoxLayout(page);
    layout->setContentsMargins(26, 24, 26, 24);
    layout->addWidget(hero);
    layout->addLayout(grid);
    layout->addLayout(quickGrid);
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
            background: #ECEFF3;
            color: #20242A;
            font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
            font-size: 13px;
        }
        QFrame#NavPanel {
            background: #252A31;
            border-right: 1px solid #1B1F25;
        }
        QSplitter::handle {
            background: #D8DEE6;
        }
        QMenuBar {
            background: #F8FAFC;
            border-bottom: 1px solid #D8DEE6;
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
            background: #252A31;
            border: none;
            outline: 0;
            padding-top: 4px;
        }
        QListWidget::item {
            border: 1px solid transparent;
            border-radius: 6px;
            margin: 3px 0;
            padding: 11px 12px 11px 15px;
            color: #C8D0DA;
        }
        QListWidget::item:hover {
            background: #303641;
            border: 1px solid transparent;
            color: #FFFFFF;
        }
        QListWidget::item:selected {
            background: #343B46;
            color: #FFFFFF;
            font-weight: 700;
            border: none;
            border-left: 4px solid %1;
            border-radius: 6px;
            padding-left: 15px;
        }
        QLabel {
            background: transparent;
        }
        QFrame[frameShape="6"], QFrame#MetricCard, QFrame#QuickActionCard, QGroupBox, QTableView, QTabWidget::pane {
            background: #FFFFFF;
            border: 1px solid #E6EAF0;
            border-radius: 14px;
        }
        QFrame#WelcomeHero {
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                        stop:0 #FFFFFF, stop:1 %3);
            border: 1px solid #D8DEE6;
            border-radius: 16px;
            padding: 8px;
        }
        QFrame#MetricCard, QFrame#QuickActionCard {
            border: 1px solid #DDE3EA;
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
