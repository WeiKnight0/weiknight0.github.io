package com.weiknight.site.api;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;

final class SlugGenerator {
  private static final int MAX_BASE_LENGTH = 140;

  private SlugGenerator() {
  }

  static String unique(String title, String fallback, Predicate<String> exists) {
    String normalized = Normalizer.normalize(title, Normalizer.Form.NFKD)
        .toLowerCase(Locale.ROOT)
        .replaceAll("[^a-z0-9]+", "-")
        .replaceAll("^-|-$", "");
    String base = normalized.isEmpty()
        ? fallback + "-" + Integer.toUnsignedString(title.hashCode(), 36)
        : normalized;
    base = base.substring(0, Math.min(base.length(), MAX_BASE_LENGTH));
    if (!exists.test(base)) {
      return base;
    }
    int suffix = 2;
    while (exists.test(base + "-" + suffix)) {
      suffix++;
    }
    return base + "-" + suffix;
  }
}
