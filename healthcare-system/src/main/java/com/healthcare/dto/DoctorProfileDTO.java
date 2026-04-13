package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for doctor profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileDTO {
    private Long id;
    private String email;
    private String specialization;
    private String bio;
    private Double ratingAvg;
    private String departmentName;
}
