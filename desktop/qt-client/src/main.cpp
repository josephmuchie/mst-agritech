#include "MainWindow.h"
#include "OfflineStore.h"

#include <QApplication>
#include <QMessageBox>
#include <QStyleFactory>

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    QCoreApplication::setOrganizationName(QStringLiteral("MST"));
    QCoreApplication::setOrganizationDomain(QStringLiteral("mst.co.zw"));
    QCoreApplication::setApplicationName(QStringLiteral("MST Agritech Desktop"));
    QCoreApplication::setApplicationVersion(QStringLiteral("0.1.0"));

    if (QStyleFactory::keys().contains(QStringLiteral("Fusion"))) {
        QApplication::setStyle(QStringLiteral("Fusion"));
    }

    OfflineStore store;
    QString error;
    if (!store.initialize(&error)) {
        QMessageBox::critical(nullptr, QStringLiteral("Startup failed"), QStringLiteral("Unable to initialize offline store:\n%1").arg(error));
        return 1;
    }

    MainWindow window(&store);
    window.show();
    return app.exec();
}
