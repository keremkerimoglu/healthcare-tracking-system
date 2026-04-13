package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.dto.LoginRequest;
import com.healthcare.dto.UserProfileDTO;
import com.healthcare.entity.User;
import com.healthcare.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for User management
 * Endpoints: /api/users
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.findUserById(id);
        if (user.isPresent()) {
            UserProfileDTO dto = convertToDTO(user.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "User found", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "User not found"));
    }

    /**
     * Get user by email
     * GET /api/users/email/{email}
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findUserByEmail(email);
        if (user.isPresent()) {
            UserProfileDTO dto = convertToDTO(user.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "User found", dto));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "User not found"));
    }

    /**
     * Get all users
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileDTO>>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserProfileDTO> dtos = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Users retrieved", dtos));
    }

    /**
     * Login user
     * POST /api/users/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserProfileDTO>> loginUser(@RequestBody LoginRequest loginRequest) {
        Optional<User> user = userService.authenticate(loginRequest.getEmail(), loginRequest.getPassword());
        if (user.isPresent()) {
            UserProfileDTO dto = convertToDTO(user.get());
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", dto));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, "Invalid email or password"));
    }

    /**
     * Delete user by ID
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        if (userService.findUserById(id).isPresent()) {
            userService.deleteUserById(id);
            return ResponseEntity.ok(new ApiResponse<>(true, "User deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "User not found"));
    }

    /**
     * Reset user password
     * PUT /api/users/{id}/reset-password
     */
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@PathVariable Long id, @RequestParam String newPassword) {
        if (userService.findUserById(id).isPresent()) {
            userService.resetPassword(id, newPassword);
            return ResponseEntity.ok(new ApiResponse<>(true, "Password reset successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, "User not found"));
    }

    /**
     * Helper method to convert User entity to DTO
     */
    private UserProfileDTO convertToDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().toString());
        dto.setCreatedAt(user.getCreatedAt().toString());
        dto.setUpdatedAt(user.getUpdatedAt().toString());
        return dto;
    }
}
