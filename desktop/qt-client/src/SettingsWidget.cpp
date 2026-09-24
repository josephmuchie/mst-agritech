#include "SettingsWidget.h"

#include <QCheckBox>
#include <QComboBox>
#include <QDoubleSpinBox>
#include <QFormLayout>
#include <QGroupBox>
#include <QLabel>
#include <QLineEdit>
#include <QMessageBox>
#include <QPushButton>
#include <QSpinBox>
#include <QTabWidget>
#include <QVBoxLayout>

SettingsWidget::SettingsWidget(OfflineStore *store, QWidget *parent)
    : QWidget(parent),
      m_store(store) {
    auto *title = new QLabel(QStringLiteral("<h2>Settings</h2>"), this);
    auto *description = new QLabel(
        QStringLiteral("Configure the desktop client, API endpoint, sync policy, and platform defaults. "
                       "All settings are saved locally and are available while offline."),
        this);
    description->setWordWrap(true);

    m_apiBaseUrlEdit = new QLineEdit(this);
    m_tenantSlugEdit = new QLineEdit(this);
    m_operatorEmailEdit = new QLineEdit(this);
    m_apiAccessTokenEdit = new QLineEdit(this);
    m_apiAccessTokenEdit->setEchoMode(QLineEdit::Password);
    m_apiAccessTokenEdit->setPlaceholderText(QStringLiteral("Bearer token for online ingestion/settings APIs"));

    m_platformNameEdit = new QLineEdit(this);
    m_supportEmailEdit = new QLineEdit(this);
    m_defaultCurrencyEdit = new QLineEdit(this);
    m_defaultCurrencyEdit->setMaxLength(8);

    m_themeCombo = new QComboBox(this);
    m_themeCombo->addItem(QStringLiteral("Mukuyu White"), QStringLiteral("mukuyu"));
    m_themeCombo->addItem(QStringLiteral("Bundles Blue"), QStringLiteral("bundles"));
    m_themeCombo->addItem(QStringLiteral("SAP Fiori"), QStringLiteral("sap"));
    m_themeCombo->addItem(QStringLiteral("Oracle Redwood"), QStringLiteral("oracle"));

    m_autoSyncCheck = new QCheckBox(QStringLiteral("Auto-sync when online"), this);
    m_maintenanceModeCheck = new QCheckBox(QStringLiteral("Maintenance mode"), this);
    m_oracleEnabledCheck = new QCheckBox(QStringLiteral("Enable Oracle ERP connector"), this);
    m_ssoEnabledCheck = new QCheckBox(QStringLiteral("Enable SSO"), this);
    m_autoProvisionUsersCheck = new QCheckBox(QStringLiteral("Auto-provision users"), this);
    m_allowPasswordLoginCheck = new QCheckBox(QStringLiteral("Allow password login"), this);

    m_retryCountSpin = new QSpinBox(this);
    m_retryCountSpin->setRange(0, 10);

    m_maxOrderValueSpin = new QDoubleSpinBox(this);
    m_maxOrderValueSpin->setRange(0.0, 999999999.99);
    m_maxOrderValueSpin->setDecimals(2);
    m_maxOrderValueSpin->setGroupSeparatorShown(true);

    m_providerLabelEdit = new QLineEdit(this);
    m_providerTypeCombo = new QComboBox(this);
    m_providerTypeCombo->addItems({QStringLiteral("OIDC"), QStringLiteral("MOCK")});
    m_issuerUriEdit = new QLineEdit(this);
    m_clientIdEdit = new QLineEdit(this);
    m_scopesEdit = new QLineEdit(this);
    m_defaultRoleNameEdit = new QLineEdit(this);
    m_emailDomainsEdit = new QLineEdit(this);

    auto *tabs = new QTabWidget(this);

    auto *connectionPage = new QWidget(this);
    auto *connectionForm = new QFormLayout(connectionPage);
    connectionForm->addRow(QStringLiteral("API base URL"), m_apiBaseUrlEdit);
    connectionForm->addRow(QStringLiteral("Tenant slug"), m_tenantSlugEdit);
    connectionForm->addRow(QStringLiteral("Operator email"), m_operatorEmailEdit);
    connectionForm->addRow(QStringLiteral("API access token"), m_apiAccessTokenEdit);
    tabs->addTab(connectionPage, QStringLiteral("Connection"));

    auto *platformPage = new QWidget(this);
    auto *platformForm = new QFormLayout(platformPage);
    platformForm->addRow(QStringLiteral("Platform name"), m_platformNameEdit);
    platformForm->addRow(QStringLiteral("Support email"), m_supportEmailEdit);
    platformForm->addRow(QStringLiteral("Default currency"), m_defaultCurrencyEdit);
    platformForm->addRow(QStringLiteral("Max order value (USD)"), m_maxOrderValueSpin);
    platformForm->addRow(m_maintenanceModeCheck);
    tabs->addTab(platformPage, QStringLiteral("Platform"));

    auto *integrationPage = new QWidget(this);
    auto *integrationForm = new QFormLayout(integrationPage);
    integrationForm->addRow(m_oracleEnabledCheck);
    integrationForm->addRow(m_autoSyncCheck);
    integrationForm->addRow(QStringLiteral("Default retry count"), m_retryCountSpin);
    tabs->addTab(integrationPage, QStringLiteral("Integrations"));

    auto *ssoPage = new QWidget(this);
    auto *ssoForm = new QFormLayout(ssoPage);
    ssoForm->addRow(m_ssoEnabledCheck);
    ssoForm->addRow(QStringLiteral("Button label"), m_providerLabelEdit);
    ssoForm->addRow(QStringLiteral("Provider type"), m_providerTypeCombo);
    ssoForm->addRow(QStringLiteral("Issuer URI"), m_issuerUriEdit);
    ssoForm->addRow(QStringLiteral("Client ID"), m_clientIdEdit);
    ssoForm->addRow(QStringLiteral("Scopes"), m_scopesEdit);
    ssoForm->addRow(QStringLiteral("Default role"), m_defaultRoleNameEdit);
    ssoForm->addRow(QStringLiteral("Email domains"), m_emailDomainsEdit);
    ssoForm->addRow(m_autoProvisionUsersCheck);
    ssoForm->addRow(m_allowPasswordLoginCheck);
    tabs->addTab(ssoPage, QStringLiteral("SSO"));

    auto *themePage = new QWidget(this);
    auto *themeForm = new QFormLayout(themePage);
    themeForm->addRow(QStringLiteral("Desktop theme"), m_themeCombo);
    auto *themeHelp = new QLabel(QStringLiteral("Mukuyu White is the default enterprise white theme. Bundles, SAP Fiori, and Oracle Redwood apply alternate accent palettes."), themePage);
    themeHelp->setWordWrap(true);
    themeForm->addRow(themeHelp);
    tabs->addTab(themePage, QStringLiteral("Theme"));

    auto *saveButton = new QPushButton(QStringLiteral("Save settings"), this);
    connect(saveButton, &QPushButton::clicked, this, &SettingsWidget::saveSettings);
    connect(m_store, &OfflineStore::settingsChanged, this, &SettingsWidget::loadSettings);

    auto *layout = new QVBoxLayout(this);
    layout->addWidget(title);
    layout->addWidget(description);
    layout->addWidget(tabs, 1);
    layout->addWidget(saveButton, 0, Qt::AlignLeft);

    loadSettings();
}

void SettingsWidget::loadSettings() {
    const AppSettings settings = m_store->settings();
    m_apiBaseUrlEdit->setText(settings.apiBaseUrl);
    m_tenantSlugEdit->setText(settings.tenantSlug);
    m_operatorEmailEdit->setText(settings.operatorEmail);
    m_apiAccessTokenEdit->setText(settings.apiAccessToken);
    m_platformNameEdit->setText(settings.platformName);
    m_supportEmailEdit->setText(settings.supportEmail);
    m_defaultCurrencyEdit->setText(settings.defaultCurrency);
    const int themeIndex = m_themeCombo->findData(settings.desktopTheme);
    m_themeCombo->setCurrentIndex(themeIndex >= 0 ? themeIndex : 0);
    m_autoSyncCheck->setChecked(settings.autoSyncEnabled);
    m_maintenanceModeCheck->setChecked(settings.maintenanceMode);
    m_oracleEnabledCheck->setChecked(settings.oracleEnabled);
    m_ssoEnabledCheck->setChecked(settings.ssoEnabled);
    m_autoProvisionUsersCheck->setChecked(settings.autoProvisionUsers);
    m_allowPasswordLoginCheck->setChecked(settings.allowPasswordLogin);
    m_retryCountSpin->setValue(settings.retryCount);
    m_maxOrderValueSpin->setValue(settings.maxOrderValueUsd);
    m_providerLabelEdit->setText(settings.providerLabel);
    m_providerTypeCombo->setCurrentText(settings.providerType);
    m_issuerUriEdit->setText(settings.issuerUri);
    m_clientIdEdit->setText(settings.clientId);
    m_scopesEdit->setText(settings.scopes);
    m_defaultRoleNameEdit->setText(settings.defaultRoleName);
    m_emailDomainsEdit->setText(settings.emailDomains);
}

void SettingsWidget::saveSettings() {
    AppSettings settings;
    settings.apiBaseUrl = m_apiBaseUrlEdit->text().trimmed();
    settings.tenantSlug = m_tenantSlugEdit->text().trimmed();
    settings.operatorEmail = m_operatorEmailEdit->text().trimmed();
    settings.apiAccessToken = m_apiAccessTokenEdit->text().trimmed();
    settings.platformName = m_platformNameEdit->text().trimmed();
    settings.supportEmail = m_supportEmailEdit->text().trimmed();
    settings.defaultCurrency = m_defaultCurrencyEdit->text().trimmed().toUpper();
    settings.desktopTheme = m_themeCombo->currentData().toString();
    settings.autoSyncEnabled = m_autoSyncCheck->isChecked();
    settings.maintenanceMode = m_maintenanceModeCheck->isChecked();
    settings.oracleEnabled = m_oracleEnabledCheck->isChecked();
    settings.ssoEnabled = m_ssoEnabledCheck->isChecked();
    settings.autoProvisionUsers = m_autoProvisionUsersCheck->isChecked();
    settings.allowPasswordLogin = m_allowPasswordLoginCheck->isChecked();
    settings.retryCount = m_retryCountSpin->value();
    settings.maxOrderValueUsd = m_maxOrderValueSpin->value();
    settings.providerLabel = m_providerLabelEdit->text().trimmed();
    settings.providerType = m_providerTypeCombo->currentText();
    settings.issuerUri = m_issuerUriEdit->text().trimmed();
    settings.clientId = m_clientIdEdit->text().trimmed();
    settings.scopes = m_scopesEdit->text().trimmed();
    settings.defaultRoleName = m_defaultRoleNameEdit->text().trimmed();
    settings.emailDomains = m_emailDomainsEdit->text().trimmed();

    if (settings.apiBaseUrl.isEmpty() || settings.platformName.isEmpty()) {
        QMessageBox::warning(this, QStringLiteral("Missing settings"), QStringLiteral("API base URL and platform name are required."));
        return;
    }

    QString error;
    if (!m_store->saveSettings(settings, &error)) {
        QMessageBox::critical(this, QStringLiteral("Save failed"), error);
        return;
    }

    QMessageBox::information(this, QStringLiteral("Settings saved"), QStringLiteral("Desktop settings have been saved locally."));
}
