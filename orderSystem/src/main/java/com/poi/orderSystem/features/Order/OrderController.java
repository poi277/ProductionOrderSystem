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

import com.poi.orderSystem.features.DTO.OrderLabelRequest;
import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.DTO.OrderShipmentRequest;
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

	@PutMapping("/productions/{productionId}")
	public ResponseEntity<ApiResponse> putProduction(
			@PathVariable("productionId") String productionId,
			@Valid @RequestBody OrderProductionRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production order updated", orderService.updateProduction(productionId, request)));
	}

	@DeleteMapping("/productions/{productionId}")
	public ResponseEntity<ApiResponse> deleteProduction(@PathVariable("productionId") String productionId) {
		orderService.deleteProduction(productionId);
		return ResponseEntity.ok().body(new ApiResponse(true, "production order deleted"));
	}

	@GetMapping("/product-processes")
	public ResponseEntity<ApiResponse> getProductProcesses() {
		return ResponseEntity.ok().body(new ApiResponse(true, "product processes loaded", orderService.findProductProcesses()));
	}

	@PostMapping("/product-processes")
	public ResponseEntity<ApiResponse> postProductProcess(@Valid @RequestBody OrderProductProcessRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "product process saved", orderService.saveProductProcess(request)));
	}

	@PutMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> putProductProcess(
			@PathVariable("productQr") String productQr,
			@Valid @RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "product process updated", orderService.updateProductProcess(productQr, request)));
	}

	@DeleteMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> deleteProductProcess(@PathVariable("productQr") String productQr) {
		orderService.deleteProductProcess(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "product process deleted"));
	}

	@GetMapping("/shipments")
	public ResponseEntity<ApiResponse> getShipments() {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipments loaded", orderService.findShipments()));
	}

	@PostMapping("/shipments")
	public ResponseEntity<ApiResponse> postShipment(@Valid @RequestBody OrderShipmentRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipment saved", orderService.saveShipment(request)));
	}

	@PutMapping("/shipments/{shipmentId}")
	public ResponseEntity<ApiResponse> putShipment(
			@PathVariable("shipmentId") String shipmentId,
			@Valid @RequestBody OrderShipmentRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipment updated", orderService.updateShipment(shipmentId, request)));
	}

	@DeleteMapping("/shipments/{shipmentId}")
	public ResponseEntity<ApiResponse> deleteShipment(@PathVariable("shipmentId") String shipmentId) {
		orderService.deleteShipment(shipmentId);
		return ResponseEntity.ok().body(new ApiResponse(true, "shipment deleted"));
	}

	@GetMapping("/labels")
	public ResponseEntity<ApiResponse> getLabels() {
		return ResponseEntity.ok().body(new ApiResponse(true, "labels loaded", orderService.findLabels()));
	}

	@PostMapping("/labels")
	public ResponseEntity<ApiResponse> postLabel(@Valid @RequestBody OrderLabelRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "label saved", orderService.saveLabel(request)));
	}

	@PutMapping("/labels/{productQr}")
	public ResponseEntity<ApiResponse> putLabel(
			@PathVariable("productQr") String productQr,
			@Valid @RequestBody OrderLabelRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "label updated", orderService.updateLabel(productQr, request)));
	}

	@DeleteMapping("/labels/{productQr}")
	public ResponseEntity<ApiResponse> deleteLabel(@PathVariable("productQr") String productQr) {
		orderService.deleteLabel(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "label deleted"));
	}

	@GetMapping("/histories")
	public ResponseEntity<ApiResponse> getHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "histories loaded", orderService.findHistories()));
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
