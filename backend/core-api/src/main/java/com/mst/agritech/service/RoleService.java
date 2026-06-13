package com.mst.agritech.service;

import com.mst.agritech.domain.entity.Role;
import com.mst.agritech.dto.response.RoleResponse;
import com.mst.agritech.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public List<RoleResponse> listAll() {
        return roleRepository.findAll().stream().map(this::toResponse).toList();
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
