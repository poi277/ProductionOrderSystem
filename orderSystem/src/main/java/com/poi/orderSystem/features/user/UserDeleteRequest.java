package com.poi.orderSystem.features.user;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;

public record UserDeleteRequest(@NotEmpty List<String> ids) {
}
