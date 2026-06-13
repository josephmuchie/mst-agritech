package com.mst.agritech.controller;

import com.mst.agritech.dto.request.ApiIngestionRequest;
import com.mst.agritech.dto.response.DataImportJobResponse;
import com.mst.agritech.dto.response.DataImportTypeInfoResponse;
import com.mst.agritech.dto.response.DataIngestionAccessResponse;
import com.mst.agritech.ingestion.DataImportType;
import com.mst.agritech.service.DataIngestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/config/ingestion")
@RequiredArgsConstructor
@Tag(name = "Data Ingestion", description = "Excel and API bulk data import (admin / authorized users)")
@SecurityRequirement(name = "bearerAuth")
public class DataIngestionController {

    private final DataIngestionService dataIngestionService;

    @GetMapping("/access")
    @Operation(summary = "Check whether current user can ingest data")
    public ResponseEntity<DataIngestionAccessResponse> access(Authentication authentication) {
        return ResponseEntity.ok(dataIngestionService.checkAccess(authentication));
    }

    @GetMapping("/types")
    @PreAuthorize("@dataIngestionAuth.canIngest(authentication)")
    @Operation(summary = "List supported import types and column definitions")
    public ResponseEntity<List<DataImportTypeInfoResponse>> types() {
        return ResponseEntity.ok(dataIngestionService.listTypes());
    }

    @GetMapping("/template/{importType}")
    @PreAuthorize("@dataIngestionAuth.canIngest(authentication)")
    @Operation(summary = "Download Excel template for an import type")
    public ResponseEntity<byte[]> template(@PathVariable String importType) throws IOException {
        DataImportType type = DataImportType.valueOf(importType.toUpperCase());
        byte[] bytes = dataIngestionService.buildTemplate(type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=mst-import-" + type.name().toLowerCase() + "-template.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @PostMapping(value = "/excel", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("@dataIngestionAuth.canIngest(authentication)")
    @Operation(summary = "Upload Excel file (.xlsx) for bulk import")
    public ResponseEntity<DataImportJobResponse> uploadExcel(
            @RequestParam String importType,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {
        DataImportType type = DataImportType.valueOf(importType.toUpperCase());
        return ResponseEntity.ok(dataIngestionService.ingestExcel(type, file, authentication));
    }

    @PostMapping("/api")
    @PreAuthorize("@dataIngestionAuth.canIngest(authentication)")
    @Operation(summary = "Submit records as JSON for bulk import")
    public ResponseEntity<DataImportJobResponse> uploadApi(
            @Valid @RequestBody ApiIngestionRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(dataIngestionService.ingestApi(request, authentication));
    }

    @GetMapping("/jobs")
    @PreAuthorize("@dataIngestionAuth.canIngest(authentication)")
    @Operation(summary = "List import job history")
    public ResponseEntity<Page<DataImportJobResponse>> jobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(dataIngestionService.listJobs(
                PageRequest.of(page, size, Sort.by("startedAt").descending())));
    }
}
