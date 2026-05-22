package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for prescription request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequest {
    private Long appointmentId;
    private String medicineList;
    private String dosage;
}
