package com.mst.agritech.dto.oracle;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Oracle REST collection envelope")
public class OracleCollectionResponse<T> {

    @JsonProperty("items")
    @Schema(description = "Collection members")
    private List<T> items;

    @JsonProperty("count")
    @Schema(description = "Number of items in this response", example = "4")
    private Integer count;

    @JsonProperty("hasMore")
    @Schema(description = "Whether more results exist beyond this page", example = "false")
    private Boolean hasMore;

    @JsonProperty("totalResults")
    @Schema(description = "Total matching records", example = "4")
    private Integer totalResults;

    @JsonProperty("limit")
    @Schema(description = "Page size", example = "25")
    private Integer limit;

    @JsonProperty("offset")
    @Schema(description = "Zero-based offset", example = "0")
    private Integer offset;
}
