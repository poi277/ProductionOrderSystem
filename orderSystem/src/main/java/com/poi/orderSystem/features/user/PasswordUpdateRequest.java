package com.poi.orderSystem.features.user;

import jakarta.validation.constraints.NotBlank;

public record PasswordUpdateRequest(
		@NotBlank(message = "새 비밀번호를 입력해주세요.") String password
) {
}
