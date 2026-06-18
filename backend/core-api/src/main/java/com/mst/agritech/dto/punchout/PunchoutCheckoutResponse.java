package com.mst.agritech.dto.punchout;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Instructions the browser uses to auto-post the cart back to the buyer's procurement
 * system. For cXML this carries a single {@code cxml-urlencoded} field; for OCI it carries
 * the {@code NEW_ITEM-*} form fields. The frontend builds a hidden form and submits it.
 */
@Data
@Builder
public class PunchoutCheckoutResponse {
    private String protocol;
    private String postUrl;
    private String method;
    private Map<String, String> fields;
}
