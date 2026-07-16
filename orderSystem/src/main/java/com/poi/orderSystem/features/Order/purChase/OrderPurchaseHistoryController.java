package com.poi.orderSystem.features.Order.purChase;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.DTO.OrderPurchaseHistoryListResponse.Source;
import com.poi.orderSystem.features.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order-purchase-history")
@RequiredArgsConstructor
public class OrderPurchaseHistoryController {

	private final OrderPurChaseService orderPurChaseService;

	@GetMapping
	public ResponseEntity<ApiResponse> getOrderPurchaseHistories() {
		return ResponseEntity.ok(new ApiResponse(true, "발주이력 목록을 조회했습니다.",
				orderPurChaseService.findAllPurchaseHistories()));
	}

	@DeleteMapping("/{source}/{id}")
	public ResponseEntity<ApiResponse> deleteOrderPurchaseHistory(
			@PathVariable("source") Source source,
			@PathVariable("id") Long id) {
		return ResponseEntity.ok(new ApiResponse(true, "발주이력을 삭제했습니다.",
				orderPurChaseService.deletePurchaseHistoryItem(source, id)));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiResponse(false, exception.getMessage()));
	}
}
