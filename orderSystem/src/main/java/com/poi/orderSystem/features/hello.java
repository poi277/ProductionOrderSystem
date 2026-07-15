package com.poi.orderSystem.features;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.util.ApiResponse;

@RestController
public class hello {

	@GetMapping("/hello")
	public ResponseEntity<ApiResponse> helloRes() {
		return ResponseEntity.ok(new ApiResponse(true, "정상적으로 응답했습니다."));
	}
}
