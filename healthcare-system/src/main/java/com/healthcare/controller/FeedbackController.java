package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.FeedbackRequest;
import com.healthcare.entity.Feedback;
import com.healthcare.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Feedback management
 * Endpoints: /api/feedback
 */
@RestController
@RequestMapping("/feedback")
@CrossOrigin(origins = "http://localhost:3000")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    /**
     * Submit feedback for an appointment
     * POST /api/feedback
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Feedback>> submitFeedback(@RequestBody FeedbackRequest request) {
        Feedback feedback = feedbackService.submitFeedback(
                request.getAppointmentId(),
                request.getRating(),
                request.getComment()
        );
        if (feedback != null) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Feedback submitted successfully", feedback));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Invalid appointment ID"));
    }

    /**
     * Get feedback by ID
     * GET /api/feedback/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Feedback>> getFeedbackById(@PathVariable Long id) {
        Optional<Feedback> feedback = feedbackService.findFeedbackById(id);
        if (feedback.isPresent()) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Feedback found", feedback.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Feedback not found"));
    }

    /**
     * Get all feedback
     * GET /api/feedback
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Feedback>>> getAllFeedback() {
        List<Feedback> feedbackList = feedbackService.getAllFeedback();
        return ResponseEntity.ok(new ApiResponse<>(true, "All feedback retrieved", feedbackList));
    }

    /**
     * Get approved feedback only
     * GET /api/feedback/approved
     */
    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<Feedback>>> getApprovedFeedback() {
        List<Feedback> feedbackList = feedbackService.getApprovedFeedback();
        return ResponseEntity.ok(new ApiResponse<>(true, "Approved feedback retrieved", feedbackList));
    }

    /**
     * Get pending feedback (awaiting approval)
     * GET /api/feedback/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<Feedback>>> getPendingFeedback() {
        List<Feedback> feedbackList = feedbackService.getPendingFeedback();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pending feedback retrieved", feedbackList));
    }

    /**
     * Get feedback for a doctor
     * GET /api/feedback/doctor/{doctorId}
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Feedback>>> getDoctorFeedback(@PathVariable Long doctorId) {
        List<Feedback> feedbackList = feedbackService.getDoctorFeedback(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Doctor feedback retrieved", feedbackList));
    }

    /**
     * Get average rating for a doctor
     * GET /api/feedback/doctor/{doctorId}/average-rating
     */
    @GetMapping("/doctor/{doctorId}/average-rating")
    public ResponseEntity<ApiResponse<Double>> getAverageDoctorRating(@PathVariable Long doctorId) {
        Double averageRating = feedbackService.getAverageDoctorRating(doctorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Average rating retrieved", averageRating));
    }

    /**
     * Approve feedback (admin only)
     * PUT /api/feedback/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Feedback>> approveFeedback(@PathVariable Long id) {
        Feedback approvedFeedback = feedbackService.approveFeedback(id);
        if (approvedFeedback != null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Feedback approved", approvedFeedback));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Feedback not found"));
    }

    /**
     * Reject feedback (admin only)
     * DELETE /api/feedback/{id}/reject
     */
    @DeleteMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectFeedback(@PathVariable Long id) {
        if (feedbackService.findFeedbackById(id).isPresent()) {
            feedbackService.rejectFeedback(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Feedback rejected and deleted"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Feedback not found"));
    }

    /**
     * Delete feedback by ID
     * DELETE /api/feedback/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(@PathVariable Long id) {
        if (feedbackService.findFeedbackById(id).isPresent()) {
            feedbackService.deleteFeedbackById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "Feedback deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "Feedback not found"));
    }
}
