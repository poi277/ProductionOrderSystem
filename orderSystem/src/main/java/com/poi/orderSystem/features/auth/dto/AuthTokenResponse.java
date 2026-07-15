package com.poi.orderSystem.features.auth.dto;

public record AuthTokenResponse(
		String accessToken,
		String tokenType,
		long expiresIn,
		String userId,
		String name,
		String role
) {
}
