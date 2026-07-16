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
		return ResponseEntity.ok().body(new ApiResponse(true, "생산지시 목록을 조회했습니다.", orderProductionService.findProductions()));
	}

	@GetMapping("/product-processes")
	public ResponseEntity<ApiResponse> getProductProcesses() {
		return ResponseEntity.ok()
				.body(new ApiResponse(true, "제품 공정 목록을 조회했습니다.", orderProductionService.findProductProcesses()));
	}

	@PostMapping
	public ResponseEntity<ApiResponse> postProduction(@Valid @RequestBody OrderProductionRequest request) {
		return ResponseEntity.ok().body(new ApiResponse(true, "생산지시를 저장했습니다.", orderProductionService.saveProduction(request)));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse> putProduction(
			@PathVariable("id") Long id,
			@Valid @RequestBody OrderProductionRequest request
	) {
		return ResponseEntity.ok().body(new ApiResponse(true, "생산지시를 수정했습니다.", orderProductionService.updateProduction(id, request)));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse> deleteProduction(@PathVariable("id") Long id) {
		return ResponseEntity.ok().body(new ApiResponse(true, "생산지시를 삭제했습니다.",
				orderProductionService.deleteProduction(id)));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse> handleIllegalArgumentException(IllegalArgumentException exception) {
		return ResponseEntity.badRequest().body(new ApiResponse(false, exception.getMessage()));
	}
}
