package com.mst.agritech.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "integration_sync_runs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IntegrationSyncRun {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "integration_config_id", nullable = false)
    private IntegrationConfig integrationConfig;

    @Column(name = "flow_type", nullable = false)
    private String flowType;

    @Column(name = "trigger_type", nullable = false)
    private String triggerType = "MANUAL";

    @Column(nullable = false)
    private String status;

    @Column(name = "records_processed", nullable = false)
    private int recordsProcessed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
