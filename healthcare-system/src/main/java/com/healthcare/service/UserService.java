package com.healthcare.service;

import com.healthcare.entity.User;
import com.healthcare.entity.UserRole;
import com.healthcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service layer for User entity
 * Handles authentication and user management
 */
@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Find user by ID
     */
    public Optional<User> findUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * Find user by email
     */
    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Save or update user
     */
    public User saveUser(User user) {
        if (user.getPassword() != null && !user.getPassword().startsWith("$2")) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    /**
     * Delete user by ID
     */
    public void deleteUserById(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * Reset user password
     */
    public void resetPassword(Long userId, String newPassword) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            User u = user.get();
            u.setPassword(passwordEncoder.encode(newPassword));
            u.setUpdatedAt(LocalDateTime.now());
            userRepository.save(u);
        }
    }

    /**
     * Authenticate user with email and password
     */
    public Optional<User> authenticate(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user;
        }
        return Optional.empty();
    }

    /**
     * Count users by role
     */
    public long countUsersByRole(UserRole role) {
        List<User> allUsers = userRepository.findAll();
        return allUsers.stream()
                .filter(u -> u.getRole() == role)
                .count();
    }
}
