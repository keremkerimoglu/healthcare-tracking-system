package com.healthcare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for feedback request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    private Long appointmentId;
    private Integer rating;
    private String comment;
}
