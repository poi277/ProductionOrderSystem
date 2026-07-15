package com.poi.orderSystem.features.auth.jwt;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtProvider {

	private final SecretKey secretKey;
	private final long accessExpiration;
	private final Clock clock;

	@Autowired
	public JwtProvider(
			@Value("${jwt.secret}") String secret,
			@Value("${jwt.access-expiration}") long accessExpiration
	) {
		this(secret, accessExpiration, Clock.systemUTC());
	}

	JwtProvider(String secret, long accessExpiration, Clock clock) {
		this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
		this.accessExpiration = accessExpiration;
		this.clock = clock;
	}

	public String createAccessToken(String userId, String name, String role) {
		Instant issuedAt = clock.instant();
		Instant expiresAt = issuedAt.plusMillis(accessExpiration);

		return Jwts.builder()
				.subject(userId)
				.claim("type", "access")
				.claim("name", name)
				.claim("role", role)
				.issuedAt(Date.from(issuedAt))
				.expiration(Date.from(expiresAt))
				.signWith(secretKey)
				.compact();
	}

	public long getAccessExpiration() {
		return accessExpiration;
	}

	public Claims parseAccessToken(String token) {
		Claims claims;
		try {
			claims = Jwts.parser()
					.verifyWith(secretKey)
					.build()
					.parseSignedClaims(token)
					.getPayload();
		} catch (JwtException | IllegalArgumentException exception) {
			throw new InvalidJwtException("유효하지 않은 인증 토큰입니다", exception);
		}

		if (!"access".equals(claims.get("type", String.class))) {
			throw new InvalidJwtException("Access Token이 아닙니다");
		}
		return claims;
	}
}
