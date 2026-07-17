package com.poi.orderSystem.features.Order.product;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
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
		return ResponseEntity.ok().body(new ApiResponse(true, "제품을 삭제했습니다.",
				orderProductService.cancelProduct(productQr)));
	}

	@PutMapping("/product-processes/{productQr}")
	public ResponseEntity<ApiResponse> putProductProcess(
			@PathVariable("productQr") String productQr,
			@RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품 공정을 수정했습니다.", orderProductService.updateProductProcess(productQr, request)));
	}

	@PutMapping("/product-processes/by-production/{purchaseDbId}")
	public ResponseEntity<ApiResponse> putProductProcessesByProduction(
			@PathVariable("purchaseDbId") Long purchaseDbId,
			@RequestBody OrderProductProcessRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "생산 제품 공정을 수정했습니다.",
				orderProductService.updateProductProcessesByProduction(purchaseDbId, request)));
	}

	@GetMapping("/shipments")
	public ResponseEntity<ApiResponse> getShipments() {
		return ResponseEntity.ok().body(new ApiResponse(true, "납품/출하 목록을 조회했습니다.", orderProductService.findShipments()));
	}

	@DeleteMapping("/shipments/{productQr}")
	public ResponseEntity<ApiResponse> cancelShipmentProduct(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "납품/출하 항목을 삭제했습니다.",
				orderProductService.cancelProduct(productQr)));
	}

	@PutMapping("/shipments/{productQr}/complete")
	public ResponseEntity<ApiResponse> completeShipment(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "출하되었습니다.", orderProductService.completeShipment(productQr)));
	}

	@PutMapping("/shipments/complete")
	public ResponseEntity<ApiResponse> completeShipments(@RequestBody java.util.List<String> productQrs) {
		return ResponseEntity.ok().body(new ApiResponse(true, "출하되었습니다.", orderProductService.completeShipments(productQrs)));
	}
	@PutMapping("/shipments/{productQr}")
	public ResponseEntity<ApiResponse> putShipment(
	        @PathVariable("productQr") String productQr,
	        @RequestBody OrderProductProcessRequest request
	) {
	    return ResponseEntity.ok().body(
	            new ApiResponse(true, "납품/출하 정보를 수정했습니다.", orderProductService.updateProductProcess(productQr, request))
	    );
	}

	@GetMapping("/labels")
	public ResponseEntity<ApiResponse> getLabels() {
		return ResponseEntity.ok().body(new ApiResponse(true, "라벨 목록을 조회했습니다.", orderProductService.findLabels()));
	}

	@GetMapping("/process-histories")
	public ResponseEntity<ApiResponse> getProcessHistories() {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품 공정 목록을 조회했습니다.", orderProductService.findProducts()));
	}

	@GetMapping("/products/{productQr}")
	public ResponseEntity<ApiResponse> getProduct(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok().body(new ApiResponse(true, "제품 정보를 조회했습니다.", orderProductService.findProduct(productQr)));
	}

	@GetMapping("/products/qr/{productQr}")
	public ResponseEntity<ApiResponse> getProductQrDetail(@PathVariable("productQr") String productQr) {
		return ResponseEntity.ok(new ApiResponse(true, "제품 QR 상세 정보를 조회했습니다.",
				orderProductService.findProductQrDetail(productQr)));
	}

	@ExceptionHandler(ProductQrNotFoundException.class)
	public ResponseEntity<ApiResponse> handleProductQrNotFound(ProductQrNotFoundException exception) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(new ApiResponse(false, exception.getMessage()));
	}
	
}
