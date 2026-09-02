package com.mst.agritech.controller;

import com.mst.agritech.dto.request.CreateRoleRequest;
import com.mst.agritech.dto.request.UpdateRoleRequest;
import com.mst.agritech.dto.response.PermissionResponse;
import com.mst.agritech.dto.response.RoleResponse;
import com.mst.agritech.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

    @GetMapping("/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "List all permission keys available to assign to a role")
    public ResponseEntity<List<PermissionResponse>> listPermissions() {
        return ResponseEntity.ok(roleService.listPermissions());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a role")
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody CreateRoleRequest request) {
        return ResponseEntity.ok(roleService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Update a role's description and permissions",
            description = "A role's name cannot be changed after creation — it's referenced by literal string in authorization checks.")
    public ResponseEntity<RoleResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(roleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            summary = "Delete a role",
            description = "Fails if the role is one of the built-in system roles, or if any user is currently assigned to it.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
