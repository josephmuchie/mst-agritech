package com.mst.agritech.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ApiIngestionRequest {
    @NotBlank
    private String importType;
    @NotEmpty
    private List<Map<String, String>> records;
}
