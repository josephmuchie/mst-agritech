package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Permission;
import com.mst.agritech.domain.entity.Role;
import com.mst.agritech.dto.request.CreateRoleRequest;
import com.mst.agritech.dto.request.UpdateRoleRequest;
import com.mst.agritech.dto.response.PermissionResponse;
import com.mst.agritech.dto.response.RoleResponse;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.PermissionRepository;
import com.mst.agritech.repository.RoleRepository;
import com.mst.agritech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoleService {

    // Referenced by literal string in @PreAuthorize("hasRole(...)") checks throughout the
    // codebase — renaming or deleting these out from under those checks would silently
    // break authorization, so they're protected from deletion here.
    private static final Set<String> SYSTEM_ROLES = Set.of("ADMIN", "FARMER", "BUYER", "LOGISTICS", "ANALYST");

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> listAll() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PermissionResponse> listPermissions() {
        return permissionRepository.findAll().stream()
                .sorted(Comparator.comparing(Permission::getResource).thenComparing(Permission::getAction))
                .map(p -> PermissionResponse.builder().id(p.getId()).resource(p.getResource()).action(p.getAction()).build())
                .toList();
    }

    @Transactional
    public RoleResponse create(CreateRoleRequest request) {
        String name = request.getName().trim();
        roleRepository.findByName(name).ifPresent(existing -> {
            throw new ConflictException("Role already exists: " + name);
        });
        Role role = Role.builder()
                .name(name)
                .description(request.getDescription())
                .permissions(resolvePermissions(request.getPermissions()))
                .build();
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public RoleResponse update(Long id, UpdateRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getPermissions() != null) {
            role.setPermissions(resolvePermissions(request.getPermissions()));
        }
        return toResponse(roleRepository.save(role));
    }

    @Transactional
    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
        if (SYSTEM_ROLES.contains(role.getName())) {
            throw new ConflictException("Built-in role cannot be deleted: " + role.getName());
        }
        long assignedUsers = userRepository.countByRolesId(id);
        if (assignedUsers > 0) {
            throw new ConflictException(
                    "Cannot delete role — " + assignedUsers + " user(s) are currently assigned to it");
        }
        roleRepository.delete(role);
    }

    private Set<Permission> resolvePermissions(List<String> keys) {
        if (keys == null || keys.isEmpty()) {
            return new HashSet<>();
        }
        Set<Permission> resolved = new HashSet<>();
        for (String key : keys) {
            String[] parts = key.split(":", 2);
            if (parts.length != 2) {
                throw new ResourceNotFoundException("Permission key must be in resource:action form: " + key);
            }
            Permission permission = permissionRepository.findByResourceAndAction(parts[0], parts[1])
                    .orElseThrow(() -> new ResourceNotFoundException("Permission", key));
            resolved.add(permission);
        }
        return resolved;
    }

    private RoleResponse toResponse(Role role) {
        List<String> permissions = role.getPermissions().stream()
                .map(p -> p.getResource() + ":" + p.getAction())
                .sorted()
                .toList();
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .permissions(permissions)
                .build();
    }
}
