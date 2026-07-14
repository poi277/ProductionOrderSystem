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
import org.springframework.web.bind.annotation.ExceptionHandler;

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

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse> getOrder(@PathVariable("id") Long id) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order loaded",
				orderPurChaseService.findPurchase(id)));
	}

	@GetMapping("/purchase-histories")
	public ResponseEntity<ApiResponse> getPurchaseHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase histories loaded",
				orderPurChaseService.findPurchaseHistories()));
	}

	@GetMapping("/purchase-histories/{id}")
	public ResponseEntity<ApiResponse> getPurchaseHistory(@PathVariable("id") Long id) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase history loaded",
				orderPurChaseService.findPurchaseHistory(id)));
	}

	@PostMapping("/post")
	public ResponseEntity<ApiResponse> postOrder(@Valid @RequestBody OrderPurchaseRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order saved", orderPurChaseService.savePurchase(request)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse> putOrder(
			@PathVariable("id") Long id,
			@Valid @RequestBody OrderPurchaseRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order updated", orderPurChaseService.updatePurchase(id, request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse> deleteOrder(@PathVariable("id") Long id) {
		orderPurChaseService.deletePurchase(id);
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order deleted"));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiResponse(false, exception.getMessage()));
	}
}
