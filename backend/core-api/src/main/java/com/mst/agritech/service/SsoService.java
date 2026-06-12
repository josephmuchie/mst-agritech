package com.mst.agritech.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.SsoCallbackRequest;
import com.mst.agritech.dto.response.AuthResponse;
import com.mst.agritech.dto.response.SsoAuthorizeResponse;
import com.mst.agritech.dto.response.SsoDiscoverResponse;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.*;
import com.mst.agritech.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SsoService {

    private final TenantRepository tenantRepository;
    private final TenantSsoConfigRepository ssoConfigRepository;
    private final SsoAuthStateRepository authStateRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AppSettingRepository appSettingRepository;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;

    private final SecureRandom secureRandom = new SecureRandom();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Value("${app.frontend-url:http://localhost:5173}")
    private String defaultFrontendUrl;

    @Value("${app.api-base-url:http://localhost:8081}")
    private String apiBaseUrl;

    public SsoDiscoverResponse discover(String email, String tenantSlug) {
        Tenant tenant = resolveTenant(email, tenantSlug);
        if (tenant == null) {
            return SsoDiscoverResponse.builder().ssoEnabled(false).allowPasswordLogin(true).build();
        }

        TenantSsoConfig config = ssoConfigRepository.findByTenantId(tenant.getId()).orElse(null);
        if (config == null || !config.isEnabled()) {
            return SsoDiscoverResponse.builder()
                    .ssoEnabled(false)
                    .tenantSlug(tenant.getSlug())
                    .tenantName(tenant.getName())
                    .allowPasswordLogin(config == null || config.isAllowPasswordLogin())
                    .build();
        }

        return SsoDiscoverResponse.builder()
                .ssoEnabled(true)
                .tenantSlug(tenant.getSlug())
                .tenantName(tenant.getName())
                .providerLabel(config.getProviderLabel())
                .allowPasswordLogin(config.isAllowPasswordLogin())
                .build();
    }

    @Transactional
    public SsoAuthorizeResponse authorize(String tenantSlug, String redirectUri, String emailHint) {
        Tenant tenant = tenantRepository.findBySlug(tenantSlug)
                .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + tenantSlug));
        TenantSsoConfig config = ssoConfigRepository.findByTenantId(tenant.getId())
                .orElseThrow(() -> new ConflictException("SSO is not configured for this organization"));
        if (!config.isEnabled()) {
            throw new ConflictException("Single sign-on is disabled for this organization");
        }

        String state = randomUrlSafe(32);
        String codeVerifier = randomUrlSafe(64);
        String safeRedirect = StringUtils.hasText(redirectUri)
                ? redirectUri
                : defaultFrontendUrl + "/login/sso/callback";

        authStateRepository.save(SsoAuthState.builder()
                .state(state)
                .tenant(tenant)
                .codeVerifier(codeVerifier)
                .redirectUri(safeRedirect)
                .emailHint(emailHint)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build());

        String authorizationUrl;
        if ("MOCK".equalsIgnoreCase(config.getProviderType())) {
            if (!isMockEnabled()) {
                throw new ConflictException("Mock SSO provider is disabled on this server");
            }
            authorizationUrl = apiBaseUrl + "/api/v1/auth/sso/mock-authorize?state=" + state;
        } else {
            OidcEndpoints endpoints = resolveOidcEndpoints(config);
            String codeChallenge = base64UrlSha256(codeVerifier);
            String query = joinQuery(Map.of(
                    "response_type", "code",
                    "client_id", config.getClientId(),
                    "redirect_uri", safeRedirect,
                    "scope", config.getScopes().replace(",", " "),
                    "state", state,
                    "code_challenge", codeChallenge,
                    "code_challenge_method", "S256"
            ));
            if (StringUtils.hasText(emailHint)) {
                query += "&login_hint=" + urlEncode(emailHint);
            }
            authorizationUrl = endpoints.authorizationUri + "?" + query;
        }

        return SsoAuthorizeResponse.builder()
                .authorizationUrl(authorizationUrl)
                .state(state)
                .build();
    }

    @Transactional
    public AuthResponse handleCallback(SsoCallbackRequest request) {
        SsoAuthState authState = authStateRepository.findById(request.getState())
                .orElseThrow(() -> new BadCredentialsException("Invalid or expired SSO session"));
        if (authState.getExpiresAt().isBefore(LocalDateTime.now())) {
            authStateRepository.delete(authState);
            throw new BadCredentialsException("SSO session expired — please sign in again");
        }

        Tenant tenant = authState.getTenant();
        TenantSsoConfig config = ssoConfigRepository.findByTenantId(tenant.getId())
                .orElseThrow(() -> new ConflictException("SSO configuration missing for tenant"));

        SsoUserInfo userInfo;
        if (request.getCode().startsWith("mock-") || "MOCK".equalsIgnoreCase(config.getProviderType())) {
            userInfo = buildMockUserInfo(authState, config);
        } else {
            userInfo = exchangeCodeForUserInfo(request.getCode(), authState, config);
        }

        User user = resolveOrProvisionUser(tenant, config, userInfo);
        authStateRepository.delete(authState);
        return buildAuthResponse(user, tenant);
    }

    public String buildMockAuthorizeRedirect(String state) {
        SsoAuthState authState = authStateRepository.findById(state)
                .orElseThrow(() -> new BadCredentialsException("Invalid SSO session"));
        if (authState.getExpiresAt().isBefore(LocalDateTime.now())) {
            authStateRepository.delete(authState);
            throw new BadCredentialsException("SSO session expired");
        }
        String code = "mock-" + UUID.randomUUID();
        return authState.getRedirectUri()
                + "?code=" + urlEncode(code)
                + "&state=" + urlEncode(state);
    }

    public boolean isPasswordLoginAllowed(String email) {
        Tenant tenant = resolveTenant(email, null);
        if (tenant == null) {
            return true;
        }
        return ssoConfigRepository.findByTenantId(tenant.getId())
                .map(TenantSsoConfig::isAllowPasswordLogin)
                .orElse(true);
    }

    private Tenant resolveTenant(String email, String tenantSlug) {
        if (StringUtils.hasText(tenantSlug)) {
            return tenantRepository.findBySlug(tenantSlug).orElse(null);
        }
        if (!StringUtils.hasText(email) || !email.contains("@")) {
            return null;
        }
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase(Locale.ROOT);
        List<Tenant> matches = tenantRepository.findByEmailDomain(domain);
        return matches.isEmpty() ? tenantRepository.findBySlug("mst-agritech").orElse(null) : matches.get(0);
    }

    private SsoUserInfo buildMockUserInfo(SsoAuthState authState, TenantSsoConfig config) {
        String email = authState.getEmailHint();
        if (!StringUtils.hasText(email)) {
            throw new BadCredentialsException("Email is required to complete mock SSO sign-in");
        }
        validateEmailDomain(authState.getTenant(), email);
        String subject = "mock:" + email.toLowerCase(Locale.ROOT);
        String name = email.substring(0, email.indexOf('@')).replace('.', ' ');
        return new SsoUserInfo(subject, email.toLowerCase(Locale.ROOT), capitalize(name));
    }

    private SsoUserInfo exchangeCodeForUserInfo(String code, SsoAuthState authState, TenantSsoConfig config) {
        try {
            OidcEndpoints endpoints = resolveOidcEndpoints(config);
            String body = joinQuery(Map.of(
                    "grant_type", "authorization_code",
                    "code", code,
                    "redirect_uri", authState.getRedirectUri(),
                    "client_id", config.getClientId(),
                    "client_secret", config.getClientSecretEncrypted() != null ? config.getClientSecretEncrypted() : "",
                    "code_verifier", authState.getCodeVerifier()
            ));

            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create(endpoints.tokenUri))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
            if (tokenResponse.statusCode() >= 400) {
                throw new BadCredentialsException("Identity provider rejected the authorization code");
            }

            JsonNode tokenJson = objectMapper.readTree(tokenResponse.body());
            String accessToken = tokenJson.path("access_token").asText(null);
            String idToken = tokenJson.path("id_token").asText(null);

            JsonNode claims;
            if (StringUtils.hasText(endpoints.userinfoUri) && StringUtils.hasText(accessToken)) {
                HttpRequest userInfoRequest = HttpRequest.newBuilder()
                        .uri(URI.create(endpoints.userinfoUri))
                        .header("Authorization", "Bearer " + accessToken)
                        .GET()
                        .build();
                HttpResponse<String> userInfoResponse = httpClient.send(userInfoRequest, HttpResponse.BodyHandlers.ofString());
                claims = objectMapper.readTree(userInfoResponse.body());
            } else if (StringUtils.hasText(idToken)) {
                claims = parseJwtPayload(idToken);
            } else {
                throw new BadCredentialsException("Identity provider did not return user profile information");
            }

            String subject = firstNonBlank(claims, "sub");
            String email = firstNonBlank(claims, "email", "preferred_username", "upn");
            String name = firstNonBlank(claims, "name", "given_name");
            if (!StringUtils.hasText(subject) || !StringUtils.hasText(email)) {
                throw new BadCredentialsException("Identity provider profile is missing required fields");
            }
            return new SsoUserInfo(subject, email.toLowerCase(Locale.ROOT), name != null ? name : email);
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadCredentialsException("Failed to complete SSO with identity provider");
        }
    }

    private User resolveOrProvisionUser(Tenant tenant, TenantSsoConfig config, SsoUserInfo userInfo) {
        validateEmailDomain(tenant, userInfo.email());

        Optional<User> bySubject = userRepository.findByTenantIdAndSsoSubject(tenant.getId(), userInfo.subject());
        if (bySubject.isPresent()) {
            return bySubject.get();
        }

        Optional<User> byEmail = userRepository.findByEmailAndTenantId(userInfo.email(), tenant.getId());
        if (byEmail.isPresent()) {
            User user = byEmail.get();
            user.setSsoSubject(userInfo.subject());
            user.setTenant(tenant);
            return userRepository.save(user);
        }

        Optional<User> legacyUser = userRepository.findByEmail(userInfo.email());
        if (legacyUser.isPresent()) {
            User user = legacyUser.get();
            user.setTenant(tenant);
            user.setSsoSubject(userInfo.subject());
            return userRepository.save(user);
        }

        if (!config.isAutoProvisionUsers()) {
            throw new BadCredentialsException("Your account is not provisioned for this organization. Contact your administrator.");
        }

        Role role = roleRepository.findByName(config.getDefaultRoleName())
                .orElseGet(() -> roleRepository.findByName("FARMER")
                        .orElseThrow(() -> new ConflictException("Default SSO role is not configured")));

        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .email(userInfo.email())
                .fullName(userInfo.fullName())
                .ssoSubject(userInfo.subject())
                .tenant(tenant)
                .active(true)
                .createdAt(now)
                .updatedAt(now)
                .roles(new HashSet<>(Set.of(role)))
                .build();
        return userRepository.save(user);
    }

    private void validateEmailDomain(Tenant tenant, String email) {
        if (!StringUtils.hasText(tenant.getEmailDomains()) || !email.contains("@")) {
            return;
        }
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase(Locale.ROOT);
        String[] allowed = tenant.getEmailDomains().toLowerCase(Locale.ROOT).split("[,;\\s]+");
        boolean match = Arrays.stream(allowed)
                .filter(StringUtils::hasText)
                .anyMatch(d -> d.equals(domain));
        if (!match) {
            throw new BadCredentialsException("Email domain is not authorized for this organization");
        }
    }

    private AuthResponse buildAuthResponse(User user, Tenant tenant) {
        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(user.getEmail(), user.getId(), roles))
                .refreshToken(jwtService.generateRefreshToken(user.getEmail()))
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .tenantId(tenant.getId())
                .tenantSlug(tenant.getSlug())
                .tenantName(tenant.getName())
                .build();
    }

    private OidcEndpoints resolveOidcEndpoints(TenantSsoConfig config) {
        if (StringUtils.hasText(config.getAuthorizationUri()) && StringUtils.hasText(config.getTokenUri())) {
            return new OidcEndpoints(config.getAuthorizationUri(), config.getTokenUri(), config.getUserinfoUri());
        }
        if (!StringUtils.hasText(config.getIssuerUri())) {
            throw new ConflictException("SSO issuer URI or endpoint URLs must be configured");
        }
        try {
            String discoveryUrl = config.getIssuerUri().replaceAll("/$", "") + "/.well-known/openid-configuration";
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(discoveryUrl)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());
            return new OidcEndpoints(
                    json.path("authorization_endpoint").asText(),
                    json.path("token_endpoint").asText(),
                    json.path("userinfo_endpoint").asText(null)
            );
        } catch (Exception ex) {
            throw new ConflictException("Unable to resolve OIDC endpoints from issuer URI");
        }
    }

    private boolean isMockEnabled() {
        return appSettingRepository.findBySettingKey("sso.mock_enabled")
                .map(s -> "true".equalsIgnoreCase(s.getSettingValue()))
                .orElse(true);
    }

    private String randomUrlSafe(int length) {
        byte[] bytes = new byte[length];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes).substring(0, length);
    }

    private String base64UrlSha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to compute PKCE challenge", ex);
        }
    }

    private String joinQuery(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        params.forEach((key, value) -> {
            if (!sb.isEmpty()) sb.append('&');
            sb.append(urlEncode(key)).append('=').append(urlEncode(value));
        });
        return sb.toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private JsonNode parseJwtPayload(String jwt) {
        try {
            String[] parts = jwt.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid JWT");
            }
            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            return objectMapper.readTree(payload);
        } catch (Exception ex) {
            throw new BadCredentialsException("Unable to parse identity token");
        }
    }

    private String firstNonBlank(JsonNode node, String... fields) {
        for (String field : fields) {
            String value = node.path(field).asText(null);
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }

    private String capitalize(String value) {
        if (!StringUtils.hasText(value)) return value;
        String trimmed = value.trim();
        return Character.toUpperCase(trimmed.charAt(0)) + trimmed.substring(1);
    }

    private record SsoUserInfo(String subject, String email, String fullName) {}

    private record OidcEndpoints(String authorizationUri, String tokenUri, String userinfoUri) {}
}
