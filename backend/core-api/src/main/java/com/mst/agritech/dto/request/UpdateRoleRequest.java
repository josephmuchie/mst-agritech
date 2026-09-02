package com.mst.agritech.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateRoleRequest {
    private String description;
    private List<String> permissions;
}
