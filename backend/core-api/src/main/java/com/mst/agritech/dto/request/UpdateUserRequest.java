package com.mst.agritech.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String password;
    private Boolean active;
    private List<String> roles;
}
