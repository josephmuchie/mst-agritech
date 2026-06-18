package com.mst.agritech.service.punchout;

import com.fasterxml.jackson.databind.JsonNode;
import com.mst.agritech.domain.entity.PunchoutCredential;
import com.mst.agritech.domain.entity.PunchoutSession;
import com.mst.agritech.dto.punchout.PunchoutCheckoutRequest;
import com.mst.agritech.dto.punchout.PunchoutCheckoutResponse;
import com.mst.agritech.dto.punchout.PunchoutSessionResponse;
import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.PunchoutCredentialRepository;
import com.mst.agritech.repository.PunchoutSessionRepository;
import com.mst.agritech.service.MarketplaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Orchestrates PunchOut sessions for both cXML (Ariba/Coupa/Jaggaer) and OCI (Oracle/SAP SRM).
 * A session is created from an inbound setup request, the buyer browses the marketplace landing
 * page, then transfers their cart back to their procurement system.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PunchoutService {

    private final PunchoutSessionRepository sessionRepository;
    private final PunchoutCredentialRepository credentialRepository;
    private final MarketplaceService marketplaceService;
    private final CxmlMessageBuilder cxml;
    private final ProcurementSettingsService procurementSettings;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ── cXML PunchOutSetupRequest ──────────────────────────────────

    @Transactional
    public String handleCxmlSetup(String requestBody) {
        if (!procurementSettings.isCxmlEnabled()) {
            return cxml.errorResponse(412, "cXML PunchOut is currently disabled");
        }
        JsonNode root;
        try {
            root = cxml.parse(requestBody);
        } catch (IllegalArgumentException ex) {
            return cxml.errorResponse(406, "Could not parse cXML request");
        }

        JsonNode request = root.path("Request").path("PunchOutSetupRequest");
        if (request.isMissingNode()) {
            return cxml.errorResponse(400, "Not a PunchOutSetupRequest");
        }

        String operation = cxml.attr(request, "operation");
        String buyerCookie = request.path("BuyerCookie").asText(null);
        String browserFormPostUrl = request.path("BrowserFormPost").path("URL").asText(null);

        JsonNode sender = root.path("Header").path("Sender").path("Credential");
        String senderIdentity = sender.path("Identity").asText(null);
        String sharedSecret = sender.path("SharedSecret").asText(null);
        String fromIdentity = root.path("Header").path("From").path("Credential").path("Identity").asText(null);
        String toIdentity = root.path("Header").path("To").path("Credential").path("Identity").asText(null);

        if (senderIdentity == null || sharedSecret == null) {
            return cxml.errorResponse(401, "Missing sender credentials");
        }

        PunchoutCredential credential = credentialRepository
                .findByIdentityAndActiveTrue(senderIdentity)
                .orElse(null);
        if (credential == null || !credential.getSharedSecret().equals(sharedSecret)) {
            log.warn("PunchOut auth failed for sender identity {}", senderIdentity);
            return cxml.errorResponse(401, "Authentication failed");
        }

        String token = newToken();
        PunchoutSession session = PunchoutSession.builder()
                .sessionToken(token)
                .protocol("CXML")
                .operation(operation)
                .buyerCookie(buyerCookie)
                .fromIdentity(fromIdentity)
                .toIdentity(toIdentity)
                .senderIdentity(senderIdentity)
                .browserFormPostUrl(browserFormPostUrl)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusHours(4))
                .build();
        sessionRepository.save(session);

        String startPage = frontendUrl + "/punchout?sid=" + token;
        log.info("Created cXML PunchOut session {} for buyer {}", token, credential.getBuyerName());
        return cxml.successSetupResponse(startPage);
    }

    // ── OCI start (Oracle / SAP SRM) ───────────────────────────────

    @Transactional
    public String handleOciStart(String hookUrl, String username, String password, String operation) {
        if (!procurementSettings.isOciEnabled()) {
            throw new IllegalArgumentException("OCI PunchOut is currently disabled");
        }
        if (hookUrl == null || hookUrl.isBlank()) {
            throw new IllegalArgumentException("HOOK_URL is required for OCI punchout");
        }
        // Optional credential check for OCI buyers
        if (username != null && password != null) {
            credentialRepository.findByIdentityAndActiveTrue(username)
                    .filter(c -> c.getSharedSecret().equals(password))
                    .orElseThrow(() -> new IllegalArgumentException("OCI authentication failed"));
        }

        String token = newToken();
        PunchoutSession session = PunchoutSession.builder()
                .sessionToken(token)
                .protocol("OCI")
                .operation(operation)
                .senderIdentity(username)
                .hookUrl(hookUrl)
                .status("ACTIVE")
                .expiresAt(LocalDateTime.now().plusHours(4))
                .build();
        sessionRepository.save(session);
        log.info("Created OCI PunchOut session {} -> HOOK_URL {}", token, hookUrl);
        return token;
    }

    // ── Session lookup for the frontend landing page ──────────────

    @Transactional(readOnly = true)
    public PunchoutSessionResponse getSession(String token) {
        PunchoutSession session = requireSession(token);
        String buyerName = session.getSenderIdentity() == null ? null
                : credentialRepository.findByIdentityAndActiveTrue(session.getSenderIdentity())
                    .map(PunchoutCredential::getBuyerName).orElse(session.getSenderIdentity());
        return PunchoutSessionResponse.builder()
                .token(session.getSessionToken())
                .protocol(session.getProtocol())
                .status(session.getStatus())
                .operation(session.getOperation())
                .buyerName(buyerName)
                .build();
    }

    @Transactional(readOnly = true)
    public java.util.List<MarketplaceProductResponse> catalog(String token, String search, String category) {
        requireSession(token);
        return marketplaceService.listProducts(search, category);
    }

    @Transactional(readOnly = true)
    public java.util.List<String> categories(String token) {
        requireSession(token);
        return marketplaceService.listCategories();
    }

    // ── Cart transfer (checkout) ───────────────────────────────────

    @Transactional
    public PunchoutCheckoutResponse checkout(String token, PunchoutCheckoutRequest request) {
        PunchoutSession session = requireSession(token);
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        PunchoutCheckoutResponse response = "OCI".equalsIgnoreCase(session.getProtocol())
                ? buildOciResponse(session, request)
                : buildCxmlResponse(session, request);

        session.setStatus("COMPLETED");
        sessionRepository.save(session);
        return response;
    }

    private PunchoutCheckoutResponse buildCxmlResponse(PunchoutSession session, PunchoutCheckoutRequest request) {
        StringBuilder items = new StringBuilder();
        BigDecimal total = BigDecimal.ZERO;
        String currency = "USD";

        for (PunchoutCheckoutRequest.Item item : request.getItems()) {
            MarketplaceProductResponse p = resolve(item);
            BigDecimal qty = item.getQuantity() == null ? BigDecimal.ONE : item.getQuantity();
            BigDecimal unitPrice = p.getPriceUsd() == null ? BigDecimal.ZERO : p.getPriceUsd();
            currency = p.getCurrency() != null ? p.getCurrency() : currency;
            total = total.add(unitPrice.multiply(qty));

            items.append("      <ItemIn quantity=\"").append(qty.toPlainString()).append("\">\n")
                 .append("        <ItemID><SupplierPartID>").append(cxml.escape(p.getSku())).append("</SupplierPartID></ItemID>\n")
                 .append("        <ItemDetail>\n")
                 .append("          <UnitPrice><Money currency=\"").append(currency).append("\">")
                 .append(unitPrice.toPlainString()).append("</Money></UnitPrice>\n")
                 .append("          <Description xml:lang=\"en\">").append(cxml.escape(p.getName())).append("</Description>\n")
                 .append("          <UnitOfMeasure>").append(cxml.escape(unitOrDefault(p.getUnit()))).append("</UnitOfMeasure>\n")
                 .append("          <Classification domain=\"UNSPSC\">").append(cxml.escape(orEmpty(p.getUnspscCode()))).append("</Classification>\n")
                 .append("          <ManufacturerName>").append(cxml.escape(orEmpty(p.getSupplier()))).append("</ManufacturerName>\n")
                 .append("        </ItemDetail>\n")
                 .append("      </ItemIn>\n");
        }

        String supplierDomain = procurementSettings.supplierDomain();
        String supplierIdentity = procurementSettings.supplierIdentity();
        String body = cxml.header() +
                "<cXML payloadID=\"" + cxml.payloadId() + "\" timestamp=\"" + cxml.timestamp() + "\" xml:lang=\"en-US\">\n" +
                "  <Header>\n" +
                "    <From><Credential domain=\"" + cxml.escape(supplierDomain) + "\"><Identity>" + cxml.escape(supplierIdentity) + "</Identity></Credential></From>\n" +
                "    <To><Credential domain=\"" + cxml.escape(supplierDomain) + "\"><Identity>" + cxml.escape(orEmpty(session.getFromIdentity())) + "</Identity></Credential></To>\n" +
                "    <Sender><Credential domain=\"" + cxml.escape(supplierDomain) + "\"><Identity>" + cxml.escape(supplierIdentity) + "</Identity></Credential><UserAgent>MST AgriTech Marketplace</UserAgent></Sender>\n" +
                "  </Header>\n" +
                "  <Message>\n" +
                "    <PunchOutOrderMessage>\n" +
                "      <BuyerCookie>" + cxml.escape(orEmpty(session.getBuyerCookie())) + "</BuyerCookie>\n" +
                "      <PunchOutOrderMessageHeader operationAllowed=\"edit\">\n" +
                "        <Total><Money currency=\"" + currency + "\">" + total.toPlainString() + "</Money></Total>\n" +
                "      </PunchOutOrderMessageHeader>\n" +
                items +
                "    </PunchOutOrderMessage>\n" +
                "  </Message>\n" +
                "</cXML>\n";

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("cxml-urlencoded", body);

        return PunchoutCheckoutResponse.builder()
                .protocol("CXML")
                .method("POST")
                .postUrl(session.getBrowserFormPostUrl())
                .fields(fields)
                .build();
    }

    private PunchoutCheckoutResponse buildOciResponse(PunchoutSession session, PunchoutCheckoutRequest request) {
        Map<String, String> fields = new LinkedHashMap<>();
        int idx = 1;
        for (PunchoutCheckoutRequest.Item item : request.getItems()) {
            MarketplaceProductResponse p = resolve(item);
            BigDecimal qty = item.getQuantity() == null ? BigDecimal.ONE : item.getQuantity();
            BigDecimal unitPrice = p.getPriceUsd() == null ? BigDecimal.ZERO : p.getPriceUsd();
            String currency = p.getCurrency() != null ? p.getCurrency() : "USD";

            fields.put("NEW_ITEM-DESCRIPTION[" + idx + "]", orEmpty(p.getName()));
            fields.put("NEW_ITEM-MATNR[" + idx + "]", orEmpty(p.getSku()));
            fields.put("NEW_ITEM-VENDORMAT[" + idx + "]", orEmpty(p.getSku()));
            fields.put("NEW_ITEM-QUANTITY[" + idx + "]", qty.toPlainString());
            fields.put("NEW_ITEM-UNIT[" + idx + "]", unitOrDefault(p.getUnit()));
            fields.put("NEW_ITEM-PRICE[" + idx + "]", unitPrice.toPlainString());
            fields.put("NEW_ITEM-PRICEUNIT[" + idx + "]", "1");
            fields.put("NEW_ITEM-CURRENCY[" + idx + "]", currency);
            fields.put("NEW_ITEM-LEADTIME[" + idx + "]", p.getLeadTimeDays() == null ? "" : String.valueOf(p.getLeadTimeDays()));
            fields.put("NEW_ITEM-MATGROUP[" + idx + "]", orEmpty(p.getUnspscCode()));
            fields.put("NEW_ITEM-VENDOR[" + idx + "]", orEmpty(p.getSupplier()));
            fields.put("NEW_ITEM-LONGTEXT_" + idx + ":132[]", orEmpty(p.getDescription()));
            idx++;
        }

        return PunchoutCheckoutResponse.builder()
                .protocol("OCI")
                .method("POST")
                .postUrl(session.getHookUrl())
                .fields(fields)
                .build();
    }

    private MarketplaceProductResponse resolve(PunchoutCheckoutRequest.Item item) {
        if (item.getProductId() != null) {
            return marketplaceService.getProduct(item.getProductId());
        }
        if (item.getSku() != null && !item.getSku().isBlank()) {
            return marketplaceService.getProductBySku(item.getSku());
        }
        throw new IllegalArgumentException("Cart item requires productId or sku");
    }

    private PunchoutSession requireSession(String token) {
        return sessionRepository.findBySessionToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("PunchOut session", token));
    }

    private String newToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String orEmpty(String v) { return v == null ? "" : v; }

    private String unitOrDefault(String unit) { return unit == null || unit.isBlank() ? "EA" : unit; }
}
