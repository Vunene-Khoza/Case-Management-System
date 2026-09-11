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

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final za.ac.univen.casemanagement.repository.CaseRepository caseRepository;
    private final za.ac.univen.casemanagement.repository.CaseNoteRepository caseNoteRepository;
    private final za.ac.univen.casemanagement.repository.ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedEmployees();
        seedUsers();
        backfillExistingRecords();
    }

    private void seedEmployees() {
        seedEmployeeIfNotFound("10012", "Ripfumelo", "Mukosi", "mukosi@univen.ac.za", "+27 15 962 8000", "8501015800081", "Department of Legal Services");
        seedEmployeeIfNotFound("12345", "Tshilidzi", "Avhashoni", "avhashoni.tshilidzi@univen.ac.za", "+27 15 962 8114", "8902155800083", "Office of the Registrar");
        seedEmployeeIfNotFound("31007", "Vhutshilo", "Sinthumule", "sinthumule.vhutshilo@univen.ac.za", "+27 15 962 8452", "9107245800087", "Human Resources Directorate");
        seedEmployeeIfNotFound("40234", "Ndidzulafhi", "Baloyi", "baloyi.ndidzulafhi@univen.ac.za", "+27 15 962 8901", "8405125800084", "Faculty of Management & Law");
        seedEmployeeIfNotFound("51923", "Livhuwani", "Makhuvha", "livhuwani.makhuvha@univen.ac.za", "+27 15 962 8332", "9303185800089", "Information & Communication Technology");
        seedEmployeeIfNotFound("60114", "Khathutshelo", "Nemutanzhela", "nemutanzhela.k@univen.ac.za", "+27 15 962 8776", "8809095800082", "Finance Directorate");
        seedEmployeeIfNotFound("71205", "Rudzani", "Madzivhandila", "madzivhandila.rudzani@univen.ac.za", "+27 15 962 8510", "9004125800085", "Faculty of Science, Engineering & Agriculture");
        seedEmployeeIfNotFound("82341", "Ndivhuwo", "Ramabulana", "ramabulana.ndivhuwo@univen.ac.za", "+27 15 962 8625", "8711035800081", "Facilities Management & Campus Security");
        seedEmployeeIfNotFound("93452", "Funanani", "Netshifhefhe", "netshifhefhe.funanani@univen.ac.za", "+27 15 962 8734", "9408225800086", "Directorate of Research & Innovation");
        seedEmployeeIfNotFound("24563", "Mulatedzi", "Mudau", "mudau.mulatedzi@univen.ac.za", "+27 15 962 8840", "8606155800082", "Academic Affairs & Examinations");
        seedEmployeeIfNotFound("35674", "Thanyani", "Khorommbi", "khorommbi.thanyani@univen.ac.za", "+27 15 962 8955", "9212055800088", "Student Affairs & Governance");
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
        // Super Admin
        seedUserIfNotFound("superadmin@univen.ac.za", "System Super Admin", "Super Admin", "00001", "+27 15 962 8001", "8001015800080", "Office of the Vice-Chancellor", "Super@123", UserRole.SUPER_ADMIN, "SYSTEM");

        // System Admin (created by Super Admin)
        seedUserIfNotFound("admin@univen.ac.za", "System Admin", "Admin", "00002", "+27 15 962 8002", "8101015800080", "Office of the Registrar", "Admin@123", UserRole.ADMIN, "superadmin@univen.ac.za");

        // Legal Officers (created by admin@univen.ac.za)
        seedUserIfNotFound("officer@univen.ac.za", "Adv. D. Blundin", "Blundin", "00003", "+27 15 962 8003", "8201015800080", "Department of Legal Services", "Officer@123", UserRole.LEGAL_OFFICER, "admin@univen.ac.za");
        seedUserIfNotFound("baloyi.ndidzulafhi@univen.ac.za", "Ndidzulafhi", "Baloyi", "40234", "+27 15 962 8901", "8405125800084", "Faculty of Management & Law", "Officer@123", UserRole.LEGAL_OFFICER, "admin@univen.ac.za");
        seedUserIfNotFound("sinthumule.vhutshilo@univen.ac.za", "Vhutshilo", "Sinthumule", "31007", "+27 15 962 8452", "9107245800087", "Human Resources Directorate", "Officer@123", UserRole.LEGAL_OFFICER, "admin@univen.ac.za");

        // Viewers (created by superadmin@univen.ac.za)
        seedUserIfNotFound("viewer@univen.ac.za", "Standard Viewer", "Viewer", "00004", "+27 15 962 8004", "8301015800080", "Internal Audit", "Viewer@123", UserRole.VIEWER, "superadmin@univen.ac.za");
        seedUserIfNotFound("nemutanzhela.k@univen.ac.za", "Khathutshelo", "Nemutanzhela", "60114", "+27 15 962 8776", "8809095800082", "Finance Directorate", "Viewer@123", UserRole.VIEWER, "superadmin@univen.ac.za");
    }

    private void seedUserIfNotFound(String email, String name, String surname, String empNum, String phone, String idNum, String dept, String rawPassword, UserRole role, String createdBy) {
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
                    .createdBy(createdBy)
                    .build();
            user = userRepository.save(user);
            if (role == UserRole.ADMIN) {
                user.setAdminOwnerId(user.getUserId());
                userRepository.save(user);
            }
            log.info("Seeded initial user: {} with role {} (createdBy: {})", email, role, createdBy);
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
            if (user.getCreatedBy() == null) {
                user.setCreatedBy(createdBy);
            }
            if (role == UserRole.ADMIN && user.getAdminOwnerId() == null) {
                user.setAdminOwnerId(user.getUserId());
            }
            userRepository.save(user);
            log.info("Updated password & attributes for seeded user: {}", email);
        }
    }

    private void backfillExistingRecords() {
        // 1. Backfill users
        UserEntity defaultAdmin = userRepository.findByEmailIgnoreCase("admin@univen.ac.za").orElse(null);
        Long defaultAdminId = defaultAdmin != null ? defaultAdmin.getUserId() : null;

        java.util.List<UserEntity> allUsers = userRepository.findAll();
        for (UserEntity u : allUsers) {
            boolean modified = false;
            if (u.getRole() == UserRole.ADMIN && u.getAdminOwnerId() == null) {
                u.setAdminOwnerId(u.getUserId());
                modified = true;
            } else if ((u.getRole() == UserRole.LEGAL_OFFICER || u.getRole() == UserRole.VIEWER) && u.getAdminOwnerId() == null) {
                if (u.getCreatedBy() != null && !u.getCreatedBy().isBlank()) {
                    userRepository.findByEmailIgnoreCase(u.getCreatedBy()).ifPresent(creator -> {
                        u.setAdminOwnerId(creator.getUserId());
                    });
                }
                if (u.getAdminOwnerId() == null && defaultAdminId != null) {
                    u.setAdminOwnerId(defaultAdminId);
                }
                modified = true;
            }
            if (modified) {
                userRepository.save(u);
            }
        }

        // 2. Backfill existing cases
        if (defaultAdminId != null) {
            java.util.List<za.ac.univen.casemanagement.entity.CaseEntity> allCases = caseRepository.findAll();
            for (za.ac.univen.casemanagement.entity.CaseEntity c : allCases) {
                if (c.getAdminOwnerId() == null) {
                    c.setAdminOwnerId(defaultAdminId);
                    if (c.getCreatedBy() == null) {
                        c.setCreatedBy("admin@univen.ac.za");
                    }
                    caseRepository.save(c);
                    log.info("Backfilled case {} with adminOwnerId {}", c.getCaseId(), defaultAdminId);
                }
            }
        }

        // 3. Backfill case notes
        java.util.List<za.ac.univen.casemanagement.entity.CaseNoteEntity> allNotes = caseNoteRepository.findAll();
        for (za.ac.univen.casemanagement.entity.CaseNoteEntity n : allNotes) {
            if (n.getAdminOwnerId() == null) {
                caseRepository.findById(n.getCaseId()).ifPresent(c -> {
                    n.setAdminOwnerId(c.getAdminOwnerId());
                    caseNoteRepository.save(n);
                });
            }
        }

        // 4. Backfill activity logs
        java.util.List<za.ac.univen.casemanagement.entity.ActivityLogEntity> allLogs = activityLogRepository.findAll();
        for (za.ac.univen.casemanagement.entity.ActivityLogEntity l : allLogs) {
            if (l.getAdminOwnerId() == null && l.getUserEmail() != null) {
                userRepository.findByEmailIgnoreCase(l.getUserEmail()).ifPresent(u -> {
                    if (u.getRole() == UserRole.ADMIN) {
                        l.setAdminOwnerId(u.getUserId());
                    } else if (u.getAdminOwnerId() != null) {
                        l.setAdminOwnerId(u.getAdminOwnerId());
                    }
                    activityLogRepository.save(l);
                });
            }
        }
    }
}
