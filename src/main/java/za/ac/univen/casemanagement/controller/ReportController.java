package za.ac.univen.casemanagement.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import za.ac.univen.casemanagement.dto.response.ApiResponse;
import za.ac.univen.casemanagement.dto.response.ReportSummaryResponse;
import za.ac.univen.casemanagement.service.ReportService;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReportSummaryResponse>> getSummaryReport() {
        ReportSummaryResponse summary = reportService.getSummaryReport();
        return ResponseEntity.ok(ApiResponse.success(200, "Report summary retrieved successfully", summary));
    }
}
