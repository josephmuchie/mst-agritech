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

if(APPLE)
    # Some Homebrew Qt builds still export the deprecated AGL framework even
    # though recent macOS SDKs no longer ship it. The desktop client does not
    # use AGL/OpenGL APIs directly, so strip only that stale framework entry.
    function(remove_imported_apple_framework target_name framework_name)
        foreach(prop_name IN ITEMS INTERFACE_LINK_LIBRARIES INTERFACE_LINK_OPTIONS)
            get_target_property(prop_values ${target_name} ${prop_name})
            if(NOT prop_values)
                continue()
            endif()

            set(filtered_values "")
            list(LENGTH prop_values prop_length)
            set(index 0)
            while(index LESS prop_length)
                list(GET prop_values ${index} value)
                if(value STREQUAL "-framework")
                    math(EXPR next_index "${index} + 1")
                    if(next_index LESS prop_length)
                        list(GET prop_values ${next_index} next_value)
                        if(next_value STREQUAL framework_name)
                            math(EXPR index "${index} + 2")
                            continue()
                        endif()
                    endif()
                endif()

                if(value MATCHES "^-framework[= ]${framework_name}$"
                    OR value MATCHES "^SHELL:-framework[= ]${framework_name}$"
                    OR value STREQUAL framework_name)
                    math(EXPR index "${index} + 1")
                    continue()
                endif()

                list(APPEND filtered_values "${value}")
                math(EXPR index "${index} + 1")
            endwhile()

            set_property(TARGET ${target_name} PROPERTY ${prop_name} "${filtered_values}")
        endforeach()
    endfunction()

    remove_imported_apple_framework(Qt6::Gui AGL)
endif()

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
