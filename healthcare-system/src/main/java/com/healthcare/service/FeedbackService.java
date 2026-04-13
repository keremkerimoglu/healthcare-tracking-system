package com.healthcare.service;

import com.healthcare.entity.Appointment;
import com.healthcare.entity.Feedback;
import com.healthcare.repository.AppointmentRepository;
import com.healthcare.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service layer for Feedback entity
 * Handles patient feedback and ratings
 */
@Service
@Transactional
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    /**
     * Submit feedback for an appointment
     */
    public Feedback submitFeedback(Long appointmentId, Integer rating, String comment) {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(appointmentId);
        if (appointmentOpt.isPresent()) {
            Feedback feedback = new Feedback();
            feedback.setAppointment(appointmentOpt.get());
            feedback.setRating(rating);
            feedback.setComment(comment);
            feedback.setIsApproved(false);  // Admin approval needed
            return feedbackRepository.save(feedback);
        }
        return null;
    }

    /**
     * Find feedback by ID
     */
    public Optional<Feedback> findFeedbackById(Long id) {
        return feedbackRepository.findById(id);
    }

    /**
     * Get all feedback
     */
    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }

    /**
     * Get approved feedback
     */
    public List<Feedback> getApprovedFeedback() {
        return feedbackRepository.findAll().stream()
                .filter(Feedback::getIsApproved)
                .collect(Collectors.toList());
    }

    /**
     * Get pending feedback (awaiting approval)
     */
    public List<Feedback> getPendingFeedback() {
        return feedbackRepository.findAll().stream()
                .filter(f -> !f.getIsApproved())
                .collect(Collectors.toList());
    }

    /**
     * Approve feedback
     */
    public Feedback approveFeedback(Long feedbackId) {
        Optional<Feedback> feedbackOpt = feedbackRepository.findById(feedbackId);
        if (feedbackOpt.isPresent()) {
            Feedback feedback = feedbackOpt.get();
            feedback.setIsApproved(true);
            return feedbackRepository.save(feedback);
        }
        return null;
    }

    /**
     * Reject feedback
     */
    public void rejectFeedback(Long feedbackId) {
        feedbackRepository.deleteById(feedbackId);
    }

    /**
     * Get feedback for a doctor
     */
    public List<Feedback> getDoctorFeedback(Long doctorId) {
        return feedbackRepository.findAll().stream()
                .filter(f -> f.getAppointment().getDoctor().getId().equals(doctorId) && f.getIsApproved())
                .collect(Collectors.toList());
    }

    /**
     * Get average rating for a doctor
     */
    public Double getAverageDoctorRating(Long doctorId) {
        return getDoctorFeedback(doctorId).stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
    }

    /**
     * Delete feedback by ID
     */
    public void deleteFeedbackById(Long id) {
        feedbackRepository.deleteById(id);
    }
}
