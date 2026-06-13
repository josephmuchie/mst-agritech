package com.mst.agritech.controller;

import com.mst.agritech.dto.response.RoleResponse;
import com.mst.agritech.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Role management")
@SecurityRequirement(name = "bearerAuth")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "List all roles",
            description = "Returns all platform role definitions (e.g. ADMIN, FARMER, BUYER, LOGISTICS, ANALYST). Admin only.")
    public ResponseEntity<List<RoleResponse>> list() {
        return ResponseEntity.ok(roleService.listAll());
    }
}
