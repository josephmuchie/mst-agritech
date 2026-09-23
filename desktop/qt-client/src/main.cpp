#include "MainWindow.h"
#include "OfflineStore.h"

#include <QApplication>
#include <QDebug>
#include <QMessageBox>
#include <QStyleFactory>
#include <cstdlib>
#include <cstring>

int main(int argc, char *argv[]) {
    bool smokeTest = std::getenv("MST_AGRITECH_SMOKE_TEST") != nullptr;
    for (int i = 1; i < argc; ++i) {
        if (std::strcmp(argv[i], "--smoke-test") == 0) {
            smokeTest = true;
            break;
        }
    }

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
        if (smokeTest) {
            qCritical() << "Unable to initialize offline store:" << error;
            return 1;
        }
        QMessageBox::critical(nullptr, QStringLiteral("Startup failed"), QStringLiteral("Unable to initialize offline store:\n%1").arg(error));
        return 1;
    }

    if (smokeTest) {
        return 0;
    }

    MainWindow window(&store, nullptr, !smokeTest);
    window.show();
    return app.exec();
}
