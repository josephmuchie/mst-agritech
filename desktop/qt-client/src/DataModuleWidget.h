#pragma once

#include "OfflineStore.h"

#include <QWidget>

class QLineEdit;
class QPushButton;
class QSqlTableModel;
class QTableView;

class DataModuleWidget : public QWidget {
    Q_OBJECT

public:
    explicit DataModuleWidget(const QString &module,
                              const QString &description,
                              const QStringList &statusOptions,
                              OfflineStore *store,
                              QWidget *parent = nullptr);

public slots:
    void refresh();

private:
    int selectedRecordId() const;
    void applyFilter();
    void createRecord();
    void editSelectedRecord();
    void deleteSelectedRecord();

    QString m_module;
    QStringList m_statusOptions;
    OfflineStore *m_store = nullptr;
    QSqlTableModel *m_model = nullptr;
    QTableView *m_table = nullptr;
    QLineEdit *m_searchEdit = nullptr;
    QPushButton *m_editButton = nullptr;
    QPushButton *m_deleteButton = nullptr;
};
