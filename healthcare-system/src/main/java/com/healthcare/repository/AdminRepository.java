package com.healthcare.repository;

import com.healthcare.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByIdentityNumber(String identityNumber);
    Optional<Admin> findByEmail(String email);
}
