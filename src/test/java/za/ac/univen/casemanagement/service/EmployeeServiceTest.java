package za.ac.univen.casemanagement.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import za.ac.univen.casemanagement.dto.response.EmployeeResponse;
import za.ac.univen.casemanagement.entity.EmployeeEntity;
import za.ac.univen.casemanagement.exception.ResourceNotFoundException;
import za.ac.univen.casemanagement.repository.EmployeeRepository;
import za.ac.univen.casemanagement.service.impl.EmployeeServiceImpl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private EmployeeEntity sampleEmployee;

    @BeforeEach
    void setUp() {
        sampleEmployee = EmployeeEntity.builder()
                .id(1L)
                .employeeNumber("10012")
                .name("Ripfumelo")
                .surname("Mukosi")
                .email("mukosi@univen.ac.za")
                .phoneNumber("+27 15 962 8000")
                .idNumber("8501015800081")
                .department("Department of Legal Services")
                .build();
    }

    @Test
    void testGetEmployeeByNumber_Success() {
        when(employeeRepository.findByEmployeeNumber("10012")).thenReturn(Optional.of(sampleEmployee));

        EmployeeResponse response = employeeService.getEmployeeByNumber("10012");

        assertNotNull(response);
        assertEquals("10012", response.getEmployeeNumber());
        assertEquals("Ripfumelo", response.getName());
        assertEquals("Mukosi", response.getSurname());
        assertEquals("mukosi@univen.ac.za", response.getEmail());
        assertEquals("Department of Legal Services", response.getDepartment());
        verify(employeeRepository, times(1)).findByEmployeeNumber("10012");
    }

    @Test
    void testGetEmployeeByNumber_NotFound_ThrowsException() {
        when(employeeRepository.findByEmployeeNumber("99999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            employeeService.getEmployeeByNumber("99999");
        });
        verify(employeeRepository, times(1)).findByEmployeeNumber("99999");
    }
}
