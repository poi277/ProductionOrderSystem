package com.poi.orderSystem.features.Order.production;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/order/productions")
@RequiredArgsConstructor
public class OrderProductionController {

	private final OrderProductionService orderProductionService;

	@GetMapping
	public ResponseEntity<ApiResponse> getProductions() {
		return ResponseEntity.ok().body(new ApiResponse(true, "production orders loaded", orderProductionService.findProductions()));
	}

	@GetMapping("/product-processes")
	public ResponseEntity<ApiResponse> getProductProcesses() {
		return ResponseEntity.ok()
				.body(new ApiResponse(true, "product processes loaded", orderProductionService.findProductProcesses()));
	}

	@PostMapping
	public ResponseEntity<ApiResponse> postProduction(@Valid @RequestBody OrderProductionRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production order saved", orderProductionService.saveProduction(request)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse> putProduction(
			@PathVariable("id") Long id,
			@Valid @RequestBody OrderProductionRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "production order updated", orderProductionService.updateProduction(id, request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse> deleteProduction(@PathVariable("id") Long id) {
		orderProductionService.deleteProduction(id);
		return ResponseEntity.ok().body(new ApiResponse(true, "production order deleted"));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiResponse(false, exception.getMessage()));
	}
}
