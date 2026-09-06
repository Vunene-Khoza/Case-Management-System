package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.request.CreateAdminRequest;
import za.ac.univen.casemanagement.dto.request.CreateLegalOfficerRequest;
import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    UserResponse createAdminUser(CreateAdminRequest request);
    UserResponse createAdminUser(CreateAdminRequest request, String creatorUsername);
    UserResponse createLegalOfficerUser(CreateLegalOfficerRequest request);
    UserResponse createLegalOfficerUser(CreateLegalOfficerRequest request, String creatorUsername);
    List<UserResponse> getAllUsers();
    List<UserResponse> getUsers(String currentUsername, boolean isSuperAdmin);
    UserResponse getUserById(Long userId);
    UserResponse getUserById(Long userId, String currentUsername, boolean isSuperAdmin);
    UserResponse updateUser(Long userId, UserRequest request);
    UserResponse updateUser(Long userId, UserRequest request, String currentUsername, boolean isSuperAdmin);
    void deleteUser(Long userId);
    void deleteUser(Long userId, String currentUsername, boolean isSuperAdmin);
}
