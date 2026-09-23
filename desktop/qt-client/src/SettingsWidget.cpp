#include "SettingsWidget.h"

#include <QCheckBox>
#include <QDoubleSpinBox>
#include <QFormLayout>
#include <QGroupBox>
#include <QLabel>
#include <QLineEdit>
#include <QMessageBox>
#include <QPushButton>
#include <QSpinBox>
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
    m_platformNameEdit = new QLineEdit(this);
    m_supportEmailEdit = new QLineEdit(this);
    m_defaultCurrencyEdit = new QLineEdit(this);
    m_defaultCurrencyEdit->setMaxLength(8);

    m_autoSyncCheck = new QCheckBox(QStringLiteral("Auto-sync when online"), this);
    m_maintenanceModeCheck = new QCheckBox(QStringLiteral("Maintenance mode"), this);

    m_retryCountSpin = new QSpinBox(this);
    m_retryCountSpin->setRange(0, 10);

    m_maxOrderValueSpin = new QDoubleSpinBox(this);
    m_maxOrderValueSpin->setRange(0.0, 999999999.99);
    m_maxOrderValueSpin->setDecimals(2);
    m_maxOrderValueSpin->setGroupSeparatorShown(true);

    auto *connectionGroup = new QGroupBox(QStringLiteral("Connection"), this);
    auto *connectionForm = new QFormLayout(connectionGroup);
    connectionForm->addRow(QStringLiteral("API base URL"), m_apiBaseUrlEdit);
    connectionForm->addRow(QStringLiteral("Tenant slug"), m_tenantSlugEdit);
    connectionForm->addRow(QStringLiteral("Operator email"), m_operatorEmailEdit);

    auto *platformGroup = new QGroupBox(QStringLiteral("Platform defaults"), this);
    auto *platformForm = new QFormLayout(platformGroup);
    platformForm->addRow(QStringLiteral("Platform name"), m_platformNameEdit);
    platformForm->addRow(QStringLiteral("Support email"), m_supportEmailEdit);
    platformForm->addRow(QStringLiteral("Default currency"), m_defaultCurrencyEdit);
    platformForm->addRow(QStringLiteral("Max order value (USD)"), m_maxOrderValueSpin);
    platformForm->addRow(m_maintenanceModeCheck);

    auto *syncGroup = new QGroupBox(QStringLiteral("Offline sync"), this);
    auto *syncForm = new QFormLayout(syncGroup);
    syncForm->addRow(m_autoSyncCheck);
    syncForm->addRow(QStringLiteral("Default retry count"), m_retryCountSpin);

    auto *saveButton = new QPushButton(QStringLiteral("Save settings"), this);
    connect(saveButton, &QPushButton::clicked, this, &SettingsWidget::saveSettings);
    connect(m_store, &OfflineStore::settingsChanged, this, &SettingsWidget::loadSettings);

    auto *layout = new QVBoxLayout(this);
    layout->addWidget(title);
    layout->addWidget(description);
    layout->addWidget(connectionGroup);
    layout->addWidget(platformGroup);
    layout->addWidget(syncGroup);
    layout->addWidget(saveButton, 0, Qt::AlignLeft);
    layout->addStretch(1);

    loadSettings();
}

void SettingsWidget::loadSettings() {
    const AppSettings settings = m_store->settings();
    m_apiBaseUrlEdit->setText(settings.apiBaseUrl);
    m_tenantSlugEdit->setText(settings.tenantSlug);
    m_operatorEmailEdit->setText(settings.operatorEmail);
    m_platformNameEdit->setText(settings.platformName);
    m_supportEmailEdit->setText(settings.supportEmail);
    m_defaultCurrencyEdit->setText(settings.defaultCurrency);
    m_autoSyncCheck->setChecked(settings.autoSyncEnabled);
    m_maintenanceModeCheck->setChecked(settings.maintenanceMode);
    m_retryCountSpin->setValue(settings.retryCount);
    m_maxOrderValueSpin->setValue(settings.maxOrderValueUsd);
}

void SettingsWidget::saveSettings() {
    AppSettings settings;
    settings.apiBaseUrl = m_apiBaseUrlEdit->text().trimmed();
    settings.tenantSlug = m_tenantSlugEdit->text().trimmed();
    settings.operatorEmail = m_operatorEmailEdit->text().trimmed();
    settings.platformName = m_platformNameEdit->text().trimmed();
    settings.supportEmail = m_supportEmailEdit->text().trimmed();
    settings.defaultCurrency = m_defaultCurrencyEdit->text().trimmed().toUpper();
    settings.autoSyncEnabled = m_autoSyncCheck->isChecked();
    settings.maintenanceMode = m_maintenanceModeCheck->isChecked();
    settings.retryCount = m_retryCountSpin->value();
    settings.maxOrderValueUsd = m_maxOrderValueSpin->value();

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
