package com.healthcare.repository;

import com.healthcare.entity.Drug;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DrugRepository extends JpaRepository<Drug, Long> {
    // İsim içinde geçen kelimeye göre arama yap (Case-insensitive)
    List<Drug> findByNameContainingIgnoreCase(String name);
}