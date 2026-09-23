#pragma once

#include "OfflineStore.h"

#include <QWidget>

class QCheckBox;
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
    QLineEdit *m_platformNameEdit = nullptr;
    QLineEdit *m_supportEmailEdit = nullptr;
    QLineEdit *m_defaultCurrencyEdit = nullptr;
    QCheckBox *m_autoSyncCheck = nullptr;
    QCheckBox *m_maintenanceModeCheck = nullptr;
    QSpinBox *m_retryCountSpin = nullptr;
    QDoubleSpinBox *m_maxOrderValueSpin = nullptr;
};
