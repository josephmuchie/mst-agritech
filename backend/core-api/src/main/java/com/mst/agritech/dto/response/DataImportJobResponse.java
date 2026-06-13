package com.mst.agritech.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataImportJobResponse {
    private Long id;
    private String importType;
    private String source;
    private String fileName;
    private String status;
    private int recordsTotal;
    private int recordsSuccess;
    private int recordsFailed;
    private String errorSummary;
    private String createdByEmail;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
