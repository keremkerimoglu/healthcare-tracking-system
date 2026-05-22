package com.healthcare.config;

import com.healthcare.entity.*;
import com.healthcare.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // Tablolar zaten doluysa tekrar ekleme yapmamak için kontrol
        if (departmentRepository.count() > 0) {
            return;
        }

        // 1. Departmanları Ekle
        Department depKardiyoloji = new Department("Kardiyoloji", "Kardiyoloji Departmanı");
        Department depNoroloji = new Department("Nöroloji", "Nöroloji Departmanı");
        Department depOrtopedi = new Department("Ortopedi", "Ortopedi Departmanı");
        Department depDermatoloji = new Department("Dermatoloji", "Dermatoloji Departmanı");
        Department depGoz = new Department("Göz Hastalıkları", "Göz Hastalıkları Departmanı");
        Department depDahiliye = new Department("Dahiliye", "Dahiliye Departmanı");
        Department depCocuk = new Department("Çocuk Sağlığı", "Çocuk Sağlığı Departmanı");
        Department depKbb = new Department("Kulak Burun Boğaz", "KBB Departmanı");

        departmentRepository.saveAll(Arrays.asList(
                depKardiyoloji, depNoroloji, depOrtopedi, depDermatoloji, 
                depGoz, depDahiliye, depCocuk, depKbb
        ));

        // 2. Admin Ekle
        Admin admin = new Admin("11111111111", "pass123", null);
        admin.setEmail("admin@hospital.com");
        userRepository.save(admin);

        // 3. Doktorları Ekle
        // Kardiyoloji
        createDoctor("12345678901", "dr.ahmet.kaya@hospital.com", "Kardiyoloji Uzmanı", depKardiyoloji);
        createDoctor("12345678902", "dr.zeynep.arslan@hospital.com", "Kardiyoloji Uzmanı", depKardiyoloji);
        createDoctor("12345678903", "dr.burak.demir@hospital.com", "Kardiyoloji Uzmanı", depKardiyoloji);

        // Nöroloji
        createDoctor("12345678904", "dr.fatma.celik@hospital.com", "Nöroloji Uzmanı", depNoroloji);
        createDoctor("12345678905", "dr.emre.yildiz@hospital.com", "Nöroloji Uzmanı", depNoroloji);
        createDoctor("12345678906", "dr.ayse.sahin@hospital.com", "Nöroloji Uzmanı", depNoroloji);

        // Ortopedi
        createDoctor("12345678907", "dr.mehmet.ozturk@hospital.com", "Ortopedi Uzmanı", depOrtopedi);
        createDoctor("12345678908", "dr.mustafa.gunes@hospital.com", "Ortopedi Uzmanı", depOrtopedi);
        createDoctor("12345678909", "dr.elif.koc@hospital.com", "Ortopedi Uzmanı", depOrtopedi);

        // Dermatoloji
        createDoctor("12345678910", "dr.selin.aydin@hospital.com", "Dermatoloji Uzmanı", depDermatoloji);
        createDoctor("12345678911", "dr.hasan.dogan@hospital.com", "Dermatoloji Uzmanı", depDermatoloji);
        createDoctor("12345678912", "dr.merve.erdogan@hospital.com", "Dermatoloji Uzmanı", depDermatoloji);

        // Göz Hastalıkları
        createDoctor("12345678913", "dr.basak.yilmaz@hospital.com", "Göz Hastalıkları Uzmanı", depGoz);
        createDoctor("12345678914", "dr.ali.turk@hospital.com", "Göz Hastalıkları Uzmanı", depGoz);
        createDoctor("12345678915", "dr.nazli.cetin@hospital.com", "Göz Hastalıkları Uzmanı", depGoz);

        // Dahiliye
        createDoctor("12345678916", "dr.ibrahim.kurt@hospital.com", "Dahiliye Uzmanı", depDahiliye);
        createDoctor("12345678917", "dr.gulsen.oz@hospital.com", "Dahiliye Uzmanı", depDahiliye);
        createDoctor("12345678918", "dr.cengiz.bal@hospital.com", "Dahiliye Uzmanı", depDahiliye);

        // Çocuk Sağlığı
        createDoctor("12345678919", "dr.nurcan.yuce@hospital.com", "Çocuk Sağlığı Uzmanı", depCocuk);
        createDoctor("12345678920", "dr.tarkan.sen@hospital.com", "Çocuk Sağlığı Uzmanı", depCocuk);
        createDoctor("12345678921", "dr.pinar.ak@hospital.com", "Çocuk Sağlığı Uzmanı", depCocuk);

        // Kulak Burun Boğaz
        createDoctor("12345678922", "dr.serkan.ince@hospital.com", "KBB Uzmanı", depKbb);
        createDoctor("12345678923", "dr.dilek.can@hospital.com", "KBB Uzmanı", depKbb);
        createDoctor("12345678924", "dr.volkan.polat@hospital.com", "KBB Uzmanı", depKbb);

        // 4. Hastaları Ekle (Boy ve Kilo parametreleri eklendi)
        createPatient("98765432101", "ali.veli@email.com", "05321234567", "O+", 175.5, 78.0);
        createPatient("98765432102", "ayse.kaya@email.com", "05359876543", "A+", 165.0, 62.5);
        createPatient("98765432103", "mehmet.oz@email.com", "05425554433", "B+", 182.0, 85.0);
        createPatient("98765432104", "zeynep.er@email.com", "05301112233", "AB+", 160.0, 55.0);
        createPatient("98765432105", "burak.tas@email.com", "05443332211", "0-", 178.0, 75.0);

        System.out.println("✅ Veritabanı başarıyla örnek verilerle dolduruldu!");
    }

    private void createDoctor(String tc, String email, String specialization, Department department) {
        Doctor doctor = new Doctor(tc, "pass123", specialization, department);
        doctor.setEmail(email);
        userRepository.save(doctor);
    }

    // Metot imzasına Double height ve Double weight eklendi
    private void createPatient(String tc, String email, String phone, String bloodType, Double height, Double weight) {
        // Örnek doğum tarihi atıyoruz
        Patient patient = new Patient(tc, "pass123", bloodType, LocalDate.of(1990, 1, 1)); 
        patient.setEmail(email);
        patient.setPhoneNumber(phone);
        patient.setHeight(height); // Boy verisi set ediliyor
        patient.setWeight(weight); // Kilo verisi set ediliyor
        
        userRepository.save(patient);
    }
}