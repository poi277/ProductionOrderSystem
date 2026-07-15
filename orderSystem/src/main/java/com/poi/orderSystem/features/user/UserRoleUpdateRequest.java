package com.poi.orderSystem.features.user;

import com.poi.orderSystem.features.util.EnumUtil.Role;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateRequest(
		@NotBlank String id,
		@NotNull Role role
) {
}
