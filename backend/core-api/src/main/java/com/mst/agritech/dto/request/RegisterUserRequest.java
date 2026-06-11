package com.mst.agritech.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserRequest {
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 8, max = 100)
    private String password;
    @NotBlank
    private String fullName;
    private Long roleId;
}
