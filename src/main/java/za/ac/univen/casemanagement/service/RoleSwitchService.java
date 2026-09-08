package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.response.RoleCountResponse;
import za.ac.univen.casemanagement.dto.response.UserResponse;
import za.ac.univen.casemanagement.enums.UserRole;

import java.util.List;

public interface RoleSwitchService {
    RoleCountResponse getRoleCounts();
    List<UserResponse> getUsersByRole(UserRole role);
}
