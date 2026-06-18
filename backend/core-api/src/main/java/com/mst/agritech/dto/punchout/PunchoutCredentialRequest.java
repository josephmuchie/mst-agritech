package com.mst.agritech.dto.punchout;

import lombok.Data;

/** Create/update payload for a buyer PunchOut credential. On update a blank sharedSecret keeps the existing one. */
@Data
public class PunchoutCredentialRequest {
    private String buyerName;
    private String domain;
    private String identity;
    private String sharedSecret;
    private String protocol;
    private Boolean active;
}
