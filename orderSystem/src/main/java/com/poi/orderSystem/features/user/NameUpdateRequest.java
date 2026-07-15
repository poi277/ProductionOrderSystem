package com.poi.orderSystem.features.user;

import jakarta.validation.constraints.NotBlank;

public record NameUpdateRequest(
		@NotBlank(message = "이름을 입력해주세요.") String name
) {
}
