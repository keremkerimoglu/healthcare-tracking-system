package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for user profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDTO {
    private Long id;
    private String identityNumber;
    private String email;
    private String phoneNumber;
    private String role;
    private String createdAt;
    private String updatedAt;
}
