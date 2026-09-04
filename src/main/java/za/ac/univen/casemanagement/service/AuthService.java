package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.request.ChangeFirstTimePasswordRequest;
import za.ac.univen.casemanagement.dto.request.LoginRequest;
import za.ac.univen.casemanagement.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);

    void changeFirstTimePassword(ChangeFirstTimePasswordRequest request);
}
