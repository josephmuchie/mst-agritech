package com.mst.agritech.controller;

import com.mst.agritech.dto.response.DashboardKpiResponse;
import com.mst.agritech.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "KPI and streaming endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @GetMapping("/dashboard/kpis")
    @Operation(summary = "Get current KPI snapshot")
    public ResponseEntity<DashboardKpiResponse> getKpis() {
        return ResponseEntity.ok(dashboardService.getKpis());
    }

    @GetMapping(value = "/stream/dashboard/kpis", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Server-Sent Events stream for live KPI updates")
    public SseEmitter streamKpis() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("kpi")
                        .data(dashboardService.getKpis()));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        }, 0, 5, TimeUnit.SECONDS);

        emitter.onCompletion(() -> future.cancel(true));
        emitter.onTimeout(() -> { future.cancel(true); emitter.complete(); });
        emitter.onError(ex -> future.cancel(true));
        return emitter;
    }
}
