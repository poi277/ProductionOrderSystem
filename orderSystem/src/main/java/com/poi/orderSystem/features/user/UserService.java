package com.poi.orderSystem.features.user;

import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.poi.orderSystem.features.auth.repository.InsteckUserRepository;
import com.poi.orderSystem.features.entity.InsteckUser;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

	private final InsteckUserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	@Transactional(readOnly = true)
	public UserResponse findUser(String id) {
		return toResponse(findUserById(id));
	}

	@Transactional
	public void updatePassword(String id, String password) {
		InsteckUser user = findUserById(id);
		user.setPassword(passwordEncoder.encode(password));
	}

	@Transactional
	public UserResponse updateName(String id, String name) {
		InsteckUser user = findUserById(id);
		user.setName(name.trim());
		return toResponse(user);
	}

	@Transactional(readOnly = true)
	public List<UserResponse> findUsers() {
		return userRepository.findAll().stream()
				.sorted(Comparator.comparing(InsteckUser::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public List<UserResponse> updateRoles(List<UserRoleUpdateRequest> requests) {
		return requests.stream().map(request -> {
			InsteckUser user = userRepository.findById(request.id())
					.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + request.id()));
			user.setRole(request.role());
			return toResponse(user);
		}).toList();
	}

	@Transactional
	public void deleteUsers(List<String> ids) {
		List<InsteckUser> users = userRepository.findAllById(ids);
		if (users.size() != ids.stream().distinct().count()) {
			throw new IllegalArgumentException("삭제할 사용자를 찾을 수 없습니다.");
		}
		userRepository.deleteAll(users);
	}

	private UserResponse toResponse(InsteckUser user) {
		return new UserResponse(user.getId(), user.getName(), user.getRole());
	}

	private InsteckUser findUserById(String id) {
		return userRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
	}
}
