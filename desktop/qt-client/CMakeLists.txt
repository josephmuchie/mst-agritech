cmake_minimum_required(VERSION 3.21)

project(MSTAgritechDesktop
    VERSION 0.1.0
    DESCRIPTION "MST Agritech cross-platform desktop client"
    LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 6.4 REQUIRED COMPONENTS Core Gui Widgets Sql Network)

qt_add_executable(MSTAgritechDesktop
    MACOSX_BUNDLE
    WIN32
    src/main.cpp
    src/DataModuleWidget.cpp
    src/DataModuleWidget.h
    src/MainWindow.cpp
    src/MainWindow.h
    src/OfflineStore.cpp
    src/OfflineStore.h
    src/RecordDialog.cpp
    src/RecordDialog.h
    src/SettingsWidget.cpp
    src/SettingsWidget.h
    src/SyncManager.cpp
    src/SyncManager.h
)

target_link_libraries(MSTAgritechDesktop
    PRIVATE
        Qt6::Core
        Qt6::Gui
        Qt6::Widgets
        Qt6::Sql
        Qt6::Network
)

set_target_properties(MSTAgritechDesktop PROPERTIES
    OUTPUT_NAME "MST Agritech"
    MACOSX_BUNDLE_BUNDLE_NAME "MST Agritech"
    MACOSX_BUNDLE_GUI_IDENTIFIER "zw.co.mst.agritech.desktop"
    MACOSX_BUNDLE_SHORT_VERSION_STRING ${PROJECT_VERSION}
    MACOSX_BUNDLE_BUNDLE_VERSION ${PROJECT_VERSION}
    WIN32_EXECUTABLE TRUE
)

install(TARGETS MSTAgritechDesktop
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)
