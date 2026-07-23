package za.ac.univen.casemanagement.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private int statusCode;
    private String errorCode;
    private String message;
    private T data;
    private List<ErrorDetail> errors;

    public static <T> ApiResponse<T> success(int statusCode, String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .statusCode(statusCode)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(200, "Operation successful", data);
    }

    public static <T> ApiResponse<T> error(int statusCode, String errorCode, String message, List<ErrorDetail> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .statusCode(statusCode)
                .errorCode(errorCode)
                .message(message)
                .errors(errors)
                .build();
    }

    public static <T> ApiResponse<T> error(int statusCode, String errorCode, String message) {
        return error(statusCode, errorCode, message, null);
    }
}
