package com.poi.orderSystem.features.Order.purChase;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderPurChaseController {

	private final OrderPurChaseService orderPurChaseService;

	@GetMapping
	public ResponseEntity<ApiResponse> getOrders() {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase orders loaded", orderPurChaseService.findPurchases()));
	}

	@GetMapping("/getDashBoard")
	public ResponseEntity<ApiResponse> getdashBoardOrders() {
		return ResponseEntity.ok()
				.body(new ApiResponse(true, "purchase orders loaded", orderPurChaseService.findDashboardOrders()));
	}

	@PostMapping("/post")
	public ResponseEntity<ApiResponse> postOrder(@Valid @RequestBody OrderPurchaseRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order saved", orderPurChaseService.savePurchase(request)));
	}

	@PutMapping("/{purchaseId}")
	public ResponseEntity<ApiResponse> putOrder(
			@PathVariable("purchaseId") String purchaseId,
			@Valid @RequestBody OrderPurchaseRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order updated", orderPurChaseService.updatePurchase(purchaseId, request)));
	}

	@DeleteMapping("/{purchaseId}")
	public ResponseEntity<ApiResponse> deleteOrder(@PathVariable("purchaseId") String purchaseId) {
		orderPurChaseService.deletePurchase(purchaseId);
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order deleted"));
	}
}
