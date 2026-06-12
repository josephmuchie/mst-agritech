package com.mst.agritech.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Normalizes cloud provider env vars (Railway, Render, etc.) before Spring binds datasource/redis settings.
 * Fixes empty DB_HOST and maps PGHOST/PGPORT and DATABASE_URL to DB_* used in application.yml.
 */
public class CloudEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE = "cloudEnvOverrides";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> overrides = new HashMap<>();

        applyDatabaseUrl(environment, overrides);
        copyIfTargetBlank(environment, overrides, "DB_HOST", "PGHOST");
        copyIfTargetBlank(environment, overrides, "DB_PORT", "PGPORT");
        copyIfTargetBlank(environment, overrides, "DB_NAME", "PGDATABASE");
        copyIfTargetBlank(environment, overrides, "DB_USER", "PGUSER");
        copyIfTargetBlank(environment, overrides, "DB_PASSWORD", "PGPASSWORD");

        copyIfTargetBlank(environment, overrides, "REDIS_HOST", "REDISHOST");
        copyIfTargetBlank(environment, overrides, "REDIS_PORT", "REDISPORT");
        copyIfTargetBlank(environment, overrides, "REDIS_PASSWORD", "REDISPASSWORD");

        // Railway injects PORT — app must listen on that port (overrides Dockerfile SERVER_PORT=8081)
        String railwayPort = firstNonBlank(environment, "PORT");
        if (railwayPort != null) {
            overrides.put("SERVER_PORT", railwayPort);
        }

        // Default public API URL from Railway custom domain when API_BASE_URL is unset
        if (isBlank(environment.getProperty("API_BASE_URL"))) {
            String publicDomain = firstNonBlank(environment, "RAILWAY_PUBLIC_DOMAIN");
            if (publicDomain != null) {
                String scheme = publicDomain.contains("localhost") ? "http" : "https";
                overrides.put("API_BASE_URL", scheme + "://" + publicDomain);
            }
        }

        if (!overrides.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(SOURCE, overrides));
        }
    }

    private static void applyDatabaseUrl(ConfigurableEnvironment env, Map<String, Object> overrides) {
        String databaseUrl = firstNonBlank(env, "DATABASE_URL", "POSTGRES_URL", "DATABASE_PRIVATE_URL");
        if (databaseUrl == null) {
            return;
        }
        try {
            URI uri = URI.create(databaseUrl.replace("postgres://", "postgresql://"));
            if (uri.getUserInfo() == null || uri.getHost() == null) {
                return;
            }
            String[] credentials = uri.getUserInfo().split(":", 2);
            putIfBlank(overrides, "DB_USER", decode(credentials[0]));
            if (credentials.length > 1) {
                putIfBlank(overrides, "DB_PASSWORD", decode(credentials[1]));
            }
            putIfBlank(overrides, "DB_HOST", uri.getHost());
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            putIfBlank(overrides, "DB_PORT", String.valueOf(port));
            String path = uri.getPath();
            if (path != null && path.length() > 1) {
                putIfBlank(overrides, "DB_NAME", path.substring(1));
            }
        } catch (Exception ignored) {
            // Fall back to PG* / DB_* variables
        }
    }

    private static void copyIfTargetBlank(
            ConfigurableEnvironment env, Map<String, Object> overrides, String target, String source) {
        if (!isBlank(env.getProperty(target))) {
            return;
        }
        String value = firstNonBlank(env, source);
        if (value != null) {
            overrides.put(target, value);
        }
    }

    private static void putIfBlank(Map<String, Object> overrides, String key, String value) {
        if (value != null && !value.isBlank()) {
            overrides.putIfAbsent(key, value);
        }
    }

    private static String firstNonBlank(ConfigurableEnvironment env, String... keys) {
        for (String key : keys) {
            String value = env.getProperty(key);
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
