package com.poi.orderSystem.features.Order.product;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderProductController {

	private final OrderProductService orderProductService;

	@DeleteMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> cancelProductProcess(@PathVariable("productQr") String productQr) {
		orderProductService.cancelProduct(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "product canceled"));
	}

	@PutMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> putProductProcess(
			@PathVariable("productQr") String productQr,
			@RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "product process updated", orderProductService.updateProductProcess(productQr, request)));
	}

	@PutMapping("/product-processes/by-production/{purchaseId}")
	public ResponseEntity<ApiResponse> putProductProcessesByProduction(
			@PathVariable("purchaseId") String purchaseId,
			@RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production product processes updated",
				orderProductService.updateProductProcessesByProduction(purchaseId, request)));
	}

	@GetMapping("/shipments")
	public ResponseEntity<ApiResponse> getShipments() {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipments loaded", orderProductService.findShipments()));
	}

	@DeleteMapping("/shipments/{productQr}")
	public ResponseEntity<ApiResponse> cancelShipmentProduct(@PathVariable("productQr") String productQr) {
		orderProductService.cancelProduct(productQr);
		return ResponseEntity.ok().body(new ApiResponse(true, "product canceled"));
	}

	@PutMapping("/shipments/{productQr}/complete")
	public ResponseEntity<ApiResponse> completeShipment(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipment completed", orderProductService.completeShipment(productQr)));
	}

	@PutMapping("/shipments/complete")
	public ResponseEntity<ApiResponse> completeShipments(@RequestBody java.util.List<String> productQrs) {
		return ResponseEntity.ok().body(new ApiResponse(true, "shipments completed", orderProductService.completeShipments(productQrs)));
	}
	@PutMapping("/shipments/{productQr}")
	public ResponseEntity<ApiResponse> putShipment(
	        @PathVariable("productQr") String productQr,
	        @RequestBody OrderProductProcessRequest request
	) {
	    return ResponseEntity.ok().body(
	            new ApiResponse(true, "shipment updated", orderProductService.updateProductProcess(productQr, request))
	    );
	}

	@GetMapping("/labels")
	public ResponseEntity<ApiResponse> getLabels() {
		return ResponseEntity.ok().body(new ApiResponse(true, "labels loaded", orderProductService.findLabels()));
	}

	@GetMapping("/process-histories")
	public ResponseEntity<ApiResponse> getProcessHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "products loaded", orderProductService.findProducts()));
	}

	@GetMapping("/products/{productQr}")
	public ResponseEntity<ApiResponse> getProduct(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "product loaded", orderProductService.findProduct(productQr)));
	}
	
}
