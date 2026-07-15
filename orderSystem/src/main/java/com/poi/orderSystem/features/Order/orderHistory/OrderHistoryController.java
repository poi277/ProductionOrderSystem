package com.poi.orderSystem.features.Order.orderHistory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderHistoryController {

	private final OrderHistoryService orderHistoryService;

	@GetMapping("/histories")
	public ResponseEntity<ApiResponse> getHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품이력 목록을 조회했습니다.", orderHistoryService.findHistories()));
	}

	@GetMapping("/histories/{productQr}")
	public ResponseEntity<ApiResponse> getHistory(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품이력을 조회했습니다.", orderHistoryService.findHistory(productQr)));
	}

	@PostMapping("/histories")
	public ResponseEntity<ApiResponse> postHistory(@Valid @RequestBody OrderHistoryRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품이력을 저장했습니다.", orderHistoryService.saveHistory(request)));
	}

	@PutMapping("/histories/{productQr}")
	public ResponseEntity<ApiResponse> putHistory(
			@PathVariable("productQr") String productQr,
			@Valid @RequestBody OrderHistoryRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품이력을 수정했습니다.", orderHistoryService.updateHistory(productQr, request)));
	}

	@DeleteMapping("/histories/{productQr}")
	public ResponseEntity<ApiResponse> deleteHistory(@PathVariable("productQr") String productQr) {
		orderHistoryService.deleteHistory(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "제품이력을 삭제했습니다."));
	}
}
