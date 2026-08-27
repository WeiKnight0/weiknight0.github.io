package com.weiknight.site.api;

/**
 * @description Signals that a requested site resource does not exist.
 */
public final class ResourceNotFoundException extends RuntimeException {
  /**
   * @description Creates a not-found failure with a client-facing reason.
   * @param message Concise reason identifying the absent resource.
   */
  public ResourceNotFoundException(String message) {
    super(message);
  }
}
