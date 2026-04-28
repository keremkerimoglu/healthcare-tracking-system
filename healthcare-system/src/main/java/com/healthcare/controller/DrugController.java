package com.healthcare.controller;

import com.healthcare.dto.ApiResponse;
import com.healthcare.entity.Drug;
import com.healthcare.repository.DrugRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drugs")
@CrossOrigin
public class DrugController {

    @Autowired
    private DrugRepository drugRepository;

    @GetMapping
    public ResponseEntity<?> searchDrugs(@RequestParam String search) {
        List<Drug> drugs = drugRepository.findByNameContainingIgnoreCase(search);
        return ResponseEntity.ok(new ApiResponse<>(true, "İlaçlar başarıyla getirildi", drugs));
    }
}