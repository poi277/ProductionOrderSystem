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
		return ResponseEntity.ok().body(new ApiResponse(true, "histories loaded", orderHistoryService.findHistories()));
	}

	@GetMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> getHistory(@PathVariable("historyId") Long historyId) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history loaded", orderHistoryService.findHistory(historyId)));
	}

	@PostMapping("/histories")
	public ResponseEntity<ApiResponse> postHistory(@Valid @RequestBody OrderHistoryRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history saved", orderHistoryService.saveHistory(request)));
	}

	@PutMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> putHistory(
			@PathVariable("historyId") Long historyId,
			@Valid @RequestBody OrderHistoryRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history updated", orderHistoryService.updateHistory(historyId, request)));
	}

	@DeleteMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> deleteHistory(@PathVariable("historyId") Long historyId) {
		orderHistoryService.deleteHistory(historyId);
		return ResponseEntity.ok().body(new ApiResponse(true, "history deleted"));
	}
}
