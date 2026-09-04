package za.ac.univen.casemanagement.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import za.ac.univen.casemanagement.dto.response.EmployeeResponse;
import za.ac.univen.casemanagement.entity.EmployeeEntity;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.service.EmployeeService;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    public EmployeeResponse getEmployeeByNumber(String employeeNumber) {
        String trimmed = employeeNumber != null ? employeeNumber.trim() : "";
        EmployeeEntity emp = employeeRepository.findByEmployeeNumber(trimmed)
                .orElseThrow(() -> new ResourceNotFoundException("No official University of Venda employee found for Staff Number \"" + trimmed + "\". Please verify employee records."));

        return EmployeeResponse.builder()
                .employeeNumber(emp.getEmployeeNumber())
                .name(emp.getName())
                .surname(emp.getSurname())
                .email(emp.getEmail())
                .phoneNumber(emp.getPhoneNumber())
                .idNumber(emp.getIdNumber())
                .department(emp.getDepartment())
                .build();
    }
}
