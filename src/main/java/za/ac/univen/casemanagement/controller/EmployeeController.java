package za.ac.univen.casemanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.EmployeeResponse;
import za.ac.univen.casemanagement.service.EmployeeService;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/{employeeNumber}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeByNumber(@PathVariable String employeeNumber) {
        EmployeeResponse response = employeeService.getEmployeeByNumber(employeeNumber);
        return ResponseEntity.ok(ApiResponse.success(200, "Employee record retrieved successfully", response));
    }
}
