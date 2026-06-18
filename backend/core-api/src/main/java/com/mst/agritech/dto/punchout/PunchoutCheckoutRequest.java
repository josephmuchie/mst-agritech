package com.mst.agritech.dto.punchout;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/** Cart submitted by the buyer in the PunchOut browse session, transferred back to their procurement system. */
@Data
public class PunchoutCheckoutRequest {
    private List<Item> items;

    @Data
    public static class Item {
        private Long productId;
        private String sku;
        private BigDecimal quantity;
    }
}
