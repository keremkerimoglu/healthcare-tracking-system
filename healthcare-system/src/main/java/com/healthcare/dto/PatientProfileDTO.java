package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for patient profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDTO {
    private Long id;
    private String identityNumber;
    private String email;
    private String phoneNumber;
    private String bloodType;
    private Double height;
    private Double weight;
    private String birthDate;
}
