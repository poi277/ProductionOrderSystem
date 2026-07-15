package com.poi.orderSystem.features.user;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping("/me")
	public ResponseEntity<ApiResponse> getMyInfo(Authentication authentication) {
		return ResponseEntity.ok(new ApiResponse(true, "내 정보를 조회했습니다.", userService.findUser(authentication.getName())));
	}

	@PutMapping("/me/password")
	public ResponseEntity<ApiResponse> updateMyPassword(
			Authentication authentication,
			@Valid @RequestBody PasswordUpdateRequest request
	) {
		userService.updatePassword(authentication.getName(), request.password());
		return ResponseEntity.ok(new ApiResponse(true, "비밀번호를 재설정했습니다."));
	}

	@PutMapping("/me/name")
	public ResponseEntity<ApiResponse> updateMyName(
			Authentication authentication,
			@Valid @RequestBody NameUpdateRequest request
	) {
		return ResponseEntity.ok(new ApiResponse(true, "이름을 변경했습니다.",
				userService.updateName(authentication.getName(), request.name())));
	}

	@GetMapping
	public ResponseEntity<ApiResponse> getUsers() {
		return ResponseEntity.ok(new ApiResponse(true, "사용자 목록을 조회했습니다.", userService.findUsers()));
	}

	@PutMapping("/roles")
	public ResponseEntity<ApiResponse> updateRoles(@Valid @RequestBody List<@Valid UserRoleUpdateRequest> requests) {
		return ResponseEntity.ok(new ApiResponse(true, "권한을 저장했습니다.", userService.updateRoles(requests)));
	}

	@DeleteMapping
	public ResponseEntity<ApiResponse> deleteUsers(@Valid @RequestBody UserDeleteRequest request) {
		userService.deleteUsers(request.ids());
		return ResponseEntity.ok(new ApiResponse(true, "사용자를 삭제했습니다."));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiResponse(false, exception.getMessage()));
	}
}
