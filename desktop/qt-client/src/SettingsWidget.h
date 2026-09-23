#pragma once

#include "OfflineStore.h"

#include <QWidget>

class QCheckBox;
class QComboBox;
class QDoubleSpinBox;
class QLineEdit;
class QSpinBox;

class SettingsWidget : public QWidget {
    Q_OBJECT

public:
    explicit SettingsWidget(OfflineStore *store, QWidget *parent = nullptr);

public slots:
    void loadSettings();

private:
    void saveSettings();

    OfflineStore *m_store = nullptr;
    QLineEdit *m_apiBaseUrlEdit = nullptr;
    QLineEdit *m_tenantSlugEdit = nullptr;
    QLineEdit *m_operatorEmailEdit = nullptr;
    QLineEdit *m_apiAccessTokenEdit = nullptr;
    QLineEdit *m_platformNameEdit = nullptr;
    QLineEdit *m_supportEmailEdit = nullptr;
    QLineEdit *m_defaultCurrencyEdit = nullptr;
    QComboBox *m_themeCombo = nullptr;
    QCheckBox *m_autoSyncCheck = nullptr;
    QCheckBox *m_maintenanceModeCheck = nullptr;
    QCheckBox *m_oracleEnabledCheck = nullptr;
    QCheckBox *m_ssoEnabledCheck = nullptr;
    QCheckBox *m_autoProvisionUsersCheck = nullptr;
    QCheckBox *m_allowPasswordLoginCheck = nullptr;
    QSpinBox *m_retryCountSpin = nullptr;
    QDoubleSpinBox *m_maxOrderValueSpin = nullptr;
    QLineEdit *m_providerLabelEdit = nullptr;
    QComboBox *m_providerTypeCombo = nullptr;
    QLineEdit *m_issuerUriEdit = nullptr;
    QLineEdit *m_clientIdEdit = nullptr;
    QLineEdit *m_scopesEdit = nullptr;
    QLineEdit *m_defaultRoleNameEdit = nullptr;
    QLineEdit *m_emailDomainsEdit = nullptr;
};
