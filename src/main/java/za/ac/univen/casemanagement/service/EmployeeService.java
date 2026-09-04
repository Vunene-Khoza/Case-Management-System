package za.ac.univen.casemanagement.service;

import za.ac.univen.casemanagement.dto.response.EmployeeResponse;

public interface EmployeeService {

    EmployeeResponse getEmployeeByNumber(String employeeNumber);
}
