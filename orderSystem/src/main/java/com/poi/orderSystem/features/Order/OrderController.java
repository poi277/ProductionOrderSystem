package com.poi.orderSystem.features.Order;

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
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {

	private final OrderService orderService;

	@GetMapping
	public ResponseEntity<ApiResponse> getOrders() {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase orders loaded", orderService.findPurchases()));
	}

	@PostMapping("/post")
	public ResponseEntity<ApiResponse> postOrder(@Valid @RequestBody OrderPurchaseRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order saved", orderService.savePurchase(request)));
	}

	@PutMapping("/{purchaseId}")
	public ResponseEntity<ApiResponse> putOrder(
			@PathVariable("purchaseId") String purchaseId,
			@Valid @RequestBody OrderPurchaseRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order updated", orderService.updatePurchase(purchaseId, request)));
	}

	@DeleteMapping("/{purchaseId}")
	public ResponseEntity<ApiResponse> deleteOrder(@PathVariable("purchaseId") String purchaseId) {
		orderService.deletePurchase(purchaseId);
		return ResponseEntity.ok().body(new ApiResponse(true, "purchase order deleted"));
	}

	@GetMapping("/productions")
	public ResponseEntity<ApiResponse> getProductions() {
		return ResponseEntity.ok().body(new ApiResponse(true, "production orders loaded", orderService.findProductions()));
	}

	@PostMapping("/productions")
	public ResponseEntity<ApiResponse> postProduction(@Valid @RequestBody OrderProductionRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production order saved", orderService.saveProduction(request)));
	}

	@PutMapping("/productions/{purchaseId}")
	public ResponseEntity<ApiResponse> putProduction(
			@PathVariable("purchaseId") String purchaseId,
			@Valid @RequestBody OrderProductionRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production order updated", orderService.updateProduction(purchaseId, request)));
	}

	@DeleteMapping("/productions/{purchaseId}")
	public ResponseEntity<ApiResponse> deleteProduction(@PathVariable("purchaseId") String purchaseId) {
		orderService.deleteProduction(purchaseId);
		return ResponseEntity.ok().body(new ApiResponse(true, "production order deleted"));
	}

	@GetMapping("/product-processes")
	public ResponseEntity<ApiResponse> getProductProcesses() {
		return ResponseEntity.ok().body(new ApiResponse(true, "product processes loaded", orderService.findProductProcesses()));
	}

	@DeleteMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> cancelProductProcess(@PathVariable("productQr") String productQr) {
		orderService.cancelProduct(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "product canceled"));
	}

	@PutMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> putProductProcess(
			@PathVariable("productQr") String productQr,
			@RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "product process updated", orderService.updateProductProcess(productQr, request)));
	}

	@GetMapping("/shipments")
	public ResponseEntity<ApiResponse> getShipments() {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipments loaded", orderService.findShipments()));
	}

	@DeleteMapping("/shipments/{productQr}")
	public ResponseEntity<ApiResponse> cancelShipmentProduct(@PathVariable("productQr") String productQr) {
		orderService.cancelProduct(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "product canceled"));
	}

	@GetMapping("/labels")
	public ResponseEntity<ApiResponse> getLabels() {
		return ResponseEntity.ok().body(new ApiResponse(true, "labels loaded", orderService.findLabels()));
	}

	@GetMapping("/histories")
	public ResponseEntity<ApiResponse> getHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "histories loaded", orderService.findHistories()));
	}

	@GetMapping("/process-histories")
	public ResponseEntity<ApiResponse> getProcessHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "process histories loaded", orderService.findProcessHistories()));
	}

	@GetMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> getHistory(@PathVariable("historyId") Long historyId) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history loaded", orderService.findHistory(historyId)));
	}

	@PostMapping("/histories")
	public ResponseEntity<ApiResponse> postHistory(@Valid @RequestBody OrderHistoryRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history saved", orderService.saveHistory(request)));
	}

	@PutMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> putHistory(
			@PathVariable("historyId") Long historyId,
			@Valid @RequestBody OrderHistoryRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "history updated", orderService.updateHistory(historyId, request)));
	}

	@DeleteMapping("/histories/{historyId}")
	public ResponseEntity<ApiResponse> deleteHistory(@PathVariable("historyId") Long historyId) {
		orderService.deleteHistory(historyId);
		return ResponseEntity.ok().body(new ApiResponse(true, "history deleted"));
	}

}
