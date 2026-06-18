package com.mst.agritech.soap;

import com.mst.agritech.dto.response.MarketplaceProductResponse;
import com.mst.agritech.repository.PunchoutCredentialRepository;
import com.mst.agritech.service.MarketplaceService;
import com.mst.agritech.service.punchout.ProcurementSettingsService;
import com.mst.agritech.soap.catalog.*;
import lombok.RequiredArgsConstructor;
import org.springframework.ws.server.endpoint.annotation.Endpoint;
import org.springframework.ws.server.endpoint.annotation.PayloadRoot;
import org.springframework.ws.server.endpoint.annotation.RequestPayload;
import org.springframework.ws.server.endpoint.annotation.ResponsePayload;
import org.springframework.ws.soap.server.endpoint.annotation.SoapFault;
import org.springframework.ws.soap.server.endpoint.annotation.FaultCode;

/**
 * SOAP endpoint exposing the marketplace catalog to external procurement systems.
 * Optional shared-secret authentication: if a username is supplied it must match an
 * active PunchOut credential.
 */
@Endpoint
@RequiredArgsConstructor
public class CatalogEndpoint {

    private final MarketplaceService marketplaceService;
    private final PunchoutCredentialRepository credentialRepository;
    private final ProcurementSettingsService procurementSettings;

    @PayloadRoot(namespace = CatalogNamespace.NS, localPart = "GetProductsRequest")
    @ResponsePayload
    public GetProductsResponse getProducts(@RequestPayload GetProductsRequest request) {
        requireSoapEnabled();
        authenticate(request.getUsername(), request.getPassword());
        GetProductsResponse response = new GetProductsResponse();
        marketplaceService.listProducts(request.getSearch(), request.getCategory())
                .forEach(p -> response.getProduct().add(map(p)));
        return response;
    }

    @PayloadRoot(namespace = CatalogNamespace.NS, localPart = "GetProductRequest")
    @ResponsePayload
    public GetProductResponse getProduct(@RequestPayload GetProductRequest request) {
        requireSoapEnabled();
        authenticate(request.getUsername(), request.getPassword());
        GetProductResponse response = new GetProductResponse();
        response.setProduct(map(marketplaceService.getProductBySku(request.getSku())));
        return response;
    }

    private void requireSoapEnabled() {
        if (!procurementSettings.isSoapEnabled()) {
            throw new CatalogAuthException("SOAP catalog access is currently disabled");
        }
    }

    private void authenticate(String username, String password) {
        if (username == null || username.isBlank()) {
            return; // catalog browse is open; authentication is optional
        }
        credentialRepository.findByIdentityAndActiveTrue(username)
                .filter(c -> c.getSharedSecret().equals(password))
                .orElseThrow(() -> new CatalogAuthException("Invalid SOAP catalog credentials"));
    }

    private SoapProduct map(MarketplaceProductResponse p) {
        SoapProduct sp = new SoapProduct();
        sp.setId(p.getId());
        sp.setSku(p.getSku());
        sp.setName(p.getName());
        sp.setDescription(p.getDescription());
        sp.setCategory(p.getCategory());
        sp.setSupplier(p.getSupplier());
        sp.setCountry(p.getCountry());
        sp.setOriginRegion(p.getOriginRegion());
        sp.setImageUrl(p.getImageUrl());
        sp.setPriceUsd(p.getPriceUsd());
        sp.setCurrency(p.getCurrency());
        sp.setUnit(p.getUnit());
        sp.setStock(p.getStock());
        sp.setAvailable(p.isAvailable());
        sp.setMinOrderQuantity(p.getMinOrderQuantity());
        sp.setLeadTimeDays(p.getLeadTimeDays());
        sp.setIncoterms(p.getIncoterms());
        sp.setPackaging(p.getPackaging());
        sp.setCertifications(p.getCertifications());
        sp.setHsCode(p.getHsCode());
        sp.setUnspscCode(p.getUnspscCode());
        return sp;
    }

    @SoapFault(faultCode = FaultCode.CLIENT)
    static class CatalogAuthException extends RuntimeException {
        CatalogAuthException(String message) { super(message); }
    }
}
