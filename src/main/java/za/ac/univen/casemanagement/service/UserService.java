package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.request.UserRequest;
import za.ac.univen.casemanagement.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse createUser(UserRequest request);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long userId);
    UserResponse updateUser(Long userId, UserRequest request);
    void deleteUser(Long userId);
}
