package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "data_import_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DataImportJob {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "import_type", nullable = false)
    private String importType;

    @Column(nullable = false)
    private String source;

    @Column(name = "file_name")
    private String fileName;

    @Column(nullable = false)
    private String status = "PROCESSING";

    @Column(name = "records_total", nullable = false)
    private int recordsTotal;

    @Column(name = "records_success", nullable = false)
    private int recordsSuccess;

    @Column(name = "records_failed", nullable = false)
    private int recordsFailed;

    @Column(name = "error_summary", columnDefinition = "TEXT")
    private String errorSummary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "started_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
