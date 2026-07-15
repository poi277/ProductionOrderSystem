package com.poi.orderSystem.features.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
		@NotBlank(message = "아이디를 입력해주세요") String id,
		@NotBlank(message = "이름을 입력해주세요") String name,
		@NotBlank(message = "비밀번호를 입력해주세요") String password
) {
}
