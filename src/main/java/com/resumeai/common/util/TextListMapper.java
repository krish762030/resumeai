package com.resumeai.common.util;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public final class TextListMapper {

    private TextListMapper() {
    }

    public static String toStorage(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }
        return values.stream()
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.joining("||"));
    }

    public static List<String> fromStorage(String value) {
        if (value == null || value.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split("\\|\\|"))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}
