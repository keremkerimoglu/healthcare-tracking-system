package com.healthcare.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for login request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    @Size(min = 11, max = 11, message = "T.C. Kimlik Numarası 11 haneli olmalıdır.")
    @Pattern(regexp = "\\d{11}", message = "T.C. Kimlik Numarası sadece rakamlardan oluşmalıdır.")
    private String identityNumber;

    private String password;
}
