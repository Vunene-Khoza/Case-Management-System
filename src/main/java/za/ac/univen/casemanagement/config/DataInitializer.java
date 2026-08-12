package za.ac.univen.casemanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.repository.UserRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUserIfNotFound("superadmin@univen.ac.za", "System Super Admin", "Super@123", UserRole.SUPER_ADMIN);
        seedUserIfNotFound("admin@univen.ac.za", "System Admin", "Admin@123", UserRole.ADMIN);
        seedUserIfNotFound("officer@univen.ac.za", "D. Blundin", "Officer@123", UserRole.LEGAL_OFFICER);
        seedUserIfNotFound("viewer@univen.ac.za", "Standard Viewer", "Viewer@123", UserRole.VIEWER);
    }

    private void seedUserIfNotFound(String email, String name, String rawPassword, UserRole role) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = UserEntity.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .status("ACTIVE")
                    .build();
            userRepository.save(user);
            log.info("Seeded initial user: {} with role {}", email, role);
        } else {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            log.info("Updated password for seeded user: {}", email);
        }
    }
}
