package com.weiknight.site.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.io.IOException;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.NoSuchFileException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ApiExceptionHandler {
  private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

  @ExceptionHandler(AccessDeniedException.class)
  ResponseEntity<ApiError> accessDenied() {
    return response(HttpStatus.FORBIDDEN, "access_denied", "Access denied");
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  ResponseEntity<ApiError> notFound(ResourceNotFoundException exception) {
    return response(HttpStatus.NOT_FOUND, "not_found", exception.getMessage());
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  ResponseEntity<ApiError> conflict() {
    return response(HttpStatus.CONFLICT, "conflict", "The resource conflicts with existing data");
  }

  @ExceptionHandler(IllegalArgumentException.class)
  ResponseEntity<ApiError> badRequest(IllegalArgumentException exception) {
    return response(HttpStatus.BAD_REQUEST, "invalid_request", exception.getMessage());
  }

  @ExceptionHandler(JsonProcessingException.class)
  ResponseEntity<ApiError> invalidJson(JsonProcessingException exception) {
    return response(HttpStatus.BAD_REQUEST, "invalid_content", "The editor content is not valid JSON");
  }

  @ExceptionHandler(FileAlreadyExistsException.class)
  ResponseEntity<ApiError> fileAlreadyExists(FileAlreadyExistsException exception) {
    return response(HttpStatus.CONFLICT, "file_exists", "The file already exists");
  }

  @ExceptionHandler(NoSuchFileException.class)
  ResponseEntity<ApiError> fileNotFound(NoSuchFileException exception) {
    return response(HttpStatus.NOT_FOUND, "not_found", "The file does not exist");
  }

  @ExceptionHandler(IOException.class)
  ResponseEntity<ApiError> fileOperationFailed(IOException exception) {
    log.error("File operation failed", exception);
    return response(HttpStatus.INTERNAL_SERVER_ERROR, "file_operation_failed", "The file operation failed");
  }

  @ExceptionHandler(InterruptedException.class)
  ResponseEntity<ApiError> interrupted(InterruptedException exception) {
    Thread.currentThread().interrupt();
    log.error("Request processing was interrupted", exception);
    return response(HttpStatus.INTERNAL_SERVER_ERROR, "operation_interrupted", "The operation was interrupted");
  }

  private ResponseEntity<ApiError> response(HttpStatus status, String code, String message) {
    return ResponseEntity.status(status).body(new ApiError(code, message));
  }

  record ApiError(String code, String message) {
  }
}
