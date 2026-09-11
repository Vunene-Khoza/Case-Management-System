package za.ac.univen.casemanagement.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import za.ac.univen.casemanagement.entity.CaseEntity;
import za.ac.univen.casemanagement.entity.UserEntity;
import za.ac.univen.casemanagement.enums.UserRole;
import za.ac.univen.casemanagement.exception.BadRequestException;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.UserRepository;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OwnershipService {

    private final UserRepository userRepository;

    public UserEntity getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("User is not authenticated");
        }
        if (auth.getPrincipal() instanceof CustomUserDetails cud) {
            return cud.getUserEntity();
        }
        String username = auth.getName();
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            throw new AccessDeniedException("Anonymous access is not permitted");
        }
        return userRepository.findByEmailIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found with email: " + username));
    }

    public boolean isSuperAdmin(UserEntity user) {
        return user != null && user.getRole() == UserRole.SUPER_ADMIN;
    }

    public boolean isAdmin(UserEntity user) {
        return user != null && user.getRole() == UserRole.ADMIN;
    }

    public Long resolveAdminOwnerId(UserEntity user) {
        if (user == null) {
            return null;
        }
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            return null; // System-wide / unrestricted
        }
        if (user.getRole() == UserRole.ADMIN) {
            return user.getUserId();
        }
        if (user.getRole() == UserRole.LEGAL_OFFICER || user.getRole() == UserRole.VIEWER) {
            return user.getAdminOwnerId();
        }
        return null;
    }

    public boolean canAccessCase(CaseEntity caseEntity, UserEntity user) {
        if (isSuperAdmin(user)) {
            return true;
        }
        Long userAdminOwnerId = resolveAdminOwnerId(user);
        if (userAdminOwnerId == null || caseEntity.getAdminOwnerId() == null ||
                !caseEntity.getAdminOwnerId().equals(userAdminOwnerId)) {
            throw new AccessDeniedException("Access denied: You do not have permission to access or modify this case.");
        }
        return true;
    }

    public boolean canAccessUser(UserEntity targetUser, UserEntity currentUser) {
        if (isSuperAdmin(currentUser)) {
            return true;
        }
        Long currentAdminOwnerId = resolveAdminOwnerId(currentUser);
        if (currentAdminOwnerId == null || targetUser.getAdminOwnerId() == null ||
                !targetUser.getAdminOwnerId().equals(currentAdminOwnerId)) {
            throw new AccessDeniedException("Access denied: You do not have permission to view or manage this user account.");
        }
        return true;
    }

    public void validateOfficerAssignment(String assignedOfficer, Long adminOwnerId) {
        if (assignedOfficer == null || assignedOfficer.isBlank()) {
            return;
        }
        if (adminOwnerId == null) {
            return; // Super Admin workspace / unrestricted
        }

        List<UserEntity> officers = userRepository.findByAdminOwnerIdAndRole(adminOwnerId, UserRole.LEGAL_OFFICER);
        String trimmedOfficer = assignedOfficer.trim().toLowerCase();

        boolean matches = officers.stream().anyMatch(o -> {
            String fullName = ((o.getName() != null ? o.getName() : "") + " " +
                    (o.getSurname() != null ? o.getSurname() : "")).trim().toLowerCase();
            return fullName.equalsIgnoreCase(trimmedOfficer)
                    || (o.getEmail() != null && o.getEmail().equalsIgnoreCase(trimmedOfficer))
                    || (o.getName() != null && o.getName().equalsIgnoreCase(trimmedOfficer))
                    || (o.getSurname() != null && o.getSurname().equalsIgnoreCase(trimmedOfficer))
                    || (o.getEmployeeNumber() != null && o.getEmployeeNumber().equalsIgnoreCase(trimmedOfficer));
        });

        if (!matches) {
            throw new BadRequestException("Assigned Legal Officer '" + assignedOfficer + "' does not belong to your administrative workspace.");
        }
    }
}
