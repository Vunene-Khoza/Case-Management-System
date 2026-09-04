package za.ac.univen.casemanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import za.ac.univen.casemanagement.entity.EmployeeEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.repository.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedEmployees();
        seedUsers();
    }

    private void seedEmployees() {
        seedEmployeeIfNotFound("10012", "Ripfumelo", "Mukosi", "mukosi@univen.ac.za", "+27 15 962 8000", "8501015800081", "Department of Legal Services");
        seedEmployeeIfNotFound("12345", "Tshilidzi", "Avhashoni", "avhashoni.tshilidzi@univen.ac.za", "+27 15 962 8114", "8902155800083", "Office of the Registrar");
        seedEmployeeIfNotFound("31007", "Vhutshilo", "Sinthumule", "sinthumule.vhutshilo@univen.ac.za", "+27 15 962 8452", "9107245800087", "Human Resources Directorate");
        seedEmployeeIfNotFound("40234", "Ndidzulafhi", "Baloyi", "baloyi.ndidzulafhi@univen.ac.za", "+27 15 962 8901", "8405125800084", "Faculty of Management & Law");
        seedEmployeeIfNotFound("51923", "Livhuwani", "Makhuvha", "livhuwani.makhuvha@univen.ac.za", "+27 15 962 8332", "9303185800089", "Information & Communication Technology");
        seedEmployeeIfNotFound("60114", "Khathutshelo", "Nemutanzhela", "nemutanzhela.k@univen.ac.za", "+27 15 962 8776", "8809095800082", "Finance Directorate");
    }

    private void seedEmployeeIfNotFound(String empNum, String name, String surname, String email, String phone, String idNum, String dept) {
        if (!employeeRepository.existsByEmployeeNumber(empNum)) {
            EmployeeEntity emp = EmployeeEntity.builder()
                    .employeeNumber(empNum)
                    .name(name)
                    .surname(surname)
                    .email(email)
                    .phoneNumber(phone)
                    .idNumber(idNum)
                    .department(dept)
                    .build();
            employeeRepository.save(emp);
            log.info("Seeded Univen employee record: {} (Staff #{})", email, empNum);
        }
    }

    private void seedUsers() {
        seedUserIfNotFound("superadmin@univen.ac.za", "System Super Admin", "Super Admin", "00001", "+27 15 962 8001", "8001015800080", "Office of the Vice-Chancellor", "Super@123", UserRole.SUPER_ADMIN);
        seedUserIfNotFound("admin@univen.ac.za", "System Admin", "Admin", "00002", "+27 15 962 8002", "8101015800080", "Office of the Registrar", "Admin@123", UserRole.ADMIN);
        seedUserIfNotFound("officer@univen.ac.za", "D. Blundin", "Blundin", "00003", "+27 15 962 8003", "8201015800080", "Department of Legal Services", "Officer@123", UserRole.LEGAL_OFFICER);
        seedUserIfNotFound("viewer@univen.ac.za", "Standard Viewer", "Viewer", "00004", "+27 15 962 8004", "8301015800080", "Internal Audit", "Viewer@123", UserRole.VIEWER);
    }

    private void seedUserIfNotFound(String email, String name, String surname, String empNum, String phone, String idNum, String dept, String rawPassword, UserRole role) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = UserEntity.builder()
                    .name(name)
                    .surname(surname)
                    .employeeNumber(empNum)
                    .phoneNumber(phone)
                    .idNumber(idNum)
                    .department(dept)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .status("ACTIVE")
                    .mustChangePassword(false)
                    .firstLoginCompleted(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded initial user: {} with role {}", email, role);
        } else {
            user.setName(name);
            user.setSurname(surname);
            user.setEmployeeNumber(empNum);
            user.setPhoneNumber(phone);
            user.setIdNumber(idNum);
            user.setDepartment(dept);
            user.setPassword(passwordEncoder.encode(rawPassword));
            user.setMustChangePassword(false);
            user.setFirstLoginCompleted(true);
            userRepository.save(user);
            log.info("Updated password & attributes for seeded user: {}", email);
        }
    }
}
