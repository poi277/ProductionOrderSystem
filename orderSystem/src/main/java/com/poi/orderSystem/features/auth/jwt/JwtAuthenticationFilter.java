package com.poi.orderSystem.features.auth.jwt;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.poi.orderSystem.features.util.EnumUtil.Role;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private static final String BEARER_PREFIX = "Bearer ";

	private final JwtProvider jwtProvider;

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain
	) throws ServletException, IOException {
		String authorization = request.getHeader("Authorization");

		if (authorization != null && authorization.startsWith(BEARER_PREFIX)) {
			try {
				Claims claims = jwtProvider.parseAccessToken(authorization.substring(BEARER_PREFIX.length()));
				String userId = claims.getSubject();
				Role role = Role.valueOf(claims.get("role", String.class));

				if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
					UsernamePasswordAuthenticationToken authentication =
							new UsernamePasswordAuthenticationToken(
									userId,
									null,
									List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
							);
					SecurityContextHolder.getContext().setAuthentication(authentication);
				}
			} catch (InvalidJwtException | IllegalArgumentException exception) {
				SecurityContextHolder.clearContext();
			}
		}

		filterChain.doFilter(request, response);
	}
}
