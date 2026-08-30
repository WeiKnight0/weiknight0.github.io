package com.weiknight.site.api;

/** @description Signals that a requested public identifier is already occupied. */
public final class ResourceConflictException extends RuntimeException {
  /**
   * @description Creates a conflict failure with a client-facing reason.
   * @param message Concise reason identifying the conflicting value.
   */
  public ResourceConflictException(String message) {
    super(message);
  }
}
