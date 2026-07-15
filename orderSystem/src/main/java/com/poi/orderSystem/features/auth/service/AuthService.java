package com.poi.orderSystem.features.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.auth.dto.AuthTokenResponse;
import com.poi.orderSystem.features.auth.dto.LoginRequest;
import com.poi.orderSystem.features.auth.dto.RegisterRequest;
import com.poi.orderSystem.features.auth.dto.RegisteredUserResponse;
import com.poi.orderSystem.features.auth.jwt.JwtProvider;
import com.poi.orderSystem.features.auth.repository.InsteckUserRepository;
import com.poi.orderSystem.features.entity.InsteckUser;
import com.poi.orderSystem.features.util.EnumUtil.Role;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private static final String INVALID_CREDENTIALS_MESSAGE = "아이디 또는 비밀번호가 올바르지 않습니다";

	private final InsteckUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtProvider jwtProvider;

	@Transactional
	public RegisteredUserResponse register(RegisterRequest request) {
		if (userRepository.existsById(request.id())) {
			throw new IllegalArgumentException("이미 존재하는 아이디입니다");
		}

		InsteckUser user = new InsteckUser();
		user.setId(request.id());
		user.setName(request.name());
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole(Role.USER);
		InsteckUser savedUser = userRepository.save(user);

		return new RegisteredUserResponse(savedUser.getId(), savedUser.getName());
	}

	@Transactional(readOnly = true)
	public AuthTokenResponse login(LoginRequest request) {
		InsteckUser user = userRepository.findById(request.id())
				.orElseThrow(() -> new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE));

		if (!passwordEncoder.matches(request.password(), user.getPassword())) {
			throw new InvalidCredentialsException(INVALID_CREDENTIALS_MESSAGE);
		}

		Role role = user.getRole() == null ? Role.USER : user.getRole();
		String name = user.getName() == null || user.getName().isBlank() ? user.getId() : user.getName();
		String accessToken = jwtProvider.createAccessToken(
				user.getId(),
				name,
				role.name()
		);
		return new AuthTokenResponse(
				accessToken,
				"Bearer",
				jwtProvider.getAccessExpiration(),
				user.getId(),
				name,
				role.name()
		);
	}
}
