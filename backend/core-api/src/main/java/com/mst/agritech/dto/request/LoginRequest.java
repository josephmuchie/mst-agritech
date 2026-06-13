package com.mst.agritech.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank @Email
    @Schema(example = "info@mst.co.zw")
    private String email;
    @NotBlank
    @Schema(example = "Admin123!")
    private String password;
}
