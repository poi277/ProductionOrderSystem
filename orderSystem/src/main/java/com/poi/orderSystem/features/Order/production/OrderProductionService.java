package com.poi.orderSystem.features.Order.production;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderProductionResponse;
import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderProductionService {

	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductRepository orderProductRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderHistoryRepository orderHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderProductionResponse> findProductions() {
		return orderProductionRepository.findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc().stream()
				.map(this::toProductionResponse)
				.toList();
	}

	@Transactional
	public OrderProductionResponse saveProduction(OrderProductionRequest request) {
		OrderProduction production = orderProductionRepository.findById(request.getPurchaseId()).orElseGet(OrderProduction::new);
		applyProductionRequest(production, request);
		OrderProduction savedProduction = orderProductionRepository.save(production);

		createOrderProducts(request);
		savedProduction = findProductionWithRelations(savedProduction.getPurchaseId(), savedProduction);

		return toProductionResponse(savedProduction);
	}

	@Transactional
	public OrderProductionResponse updateProduction(String purchaseId, OrderProductionRequest request) {
		String nextPurchaseId = hasText(request.getPurchaseId()) ? request.getPurchaseId() : purchaseId;
		OrderProduction production = purchaseId.equals(nextPurchaseId)
				? orderProductionRepository.findById(purchaseId).orElseGet(OrderProduction::new)
				: new OrderProduction();
		applyProductionRequest(production, request);
		production.setPurchaseId(nextPurchaseId);

		OrderProduction savedProduction = orderProductionRepository.save(production);

		if (!purchaseId.equals(nextPurchaseId)) {
			deleteProductionIfExists(purchaseId);
		}

		createOrderProducts(request);
		savedProduction = findProductionWithRelations(savedProduction.getPurchaseId(), savedProduction);
		updatePurchaseStatus(nextPurchaseId, ProcessStatus.INSTRUCTION);

		return toProductionResponse(savedProduction);
	}

	@Transactional
	public void deleteProduction(String purchaseId) {
		deleteProductionIfExists(purchaseId);
	}

	private void applyProductionRequest(OrderProduction production, OrderProductionRequest request) {
		production.setPurchaseId(request.getPurchaseId());
	}

	private void createOrderProducts(OrderProductionRequest request) {
		String productCodePrefix = request.getProductCodePrefix();
		Integer productionQuantity = request.getProductionQuantity();

		if (!hasText(request.getPurchaseId()) || !hasText(productCodePrefix) || productionQuantity == null || productionQuantity <= 0) {
			return;
		}

		OrderProduction production = orderProductionRepository.findById(request.getPurchaseId()).orElse(null);
		OrderPurchase purchase = production == null || production.getPurchase() == null
				? orderPurchaseRepository.findById(request.getPurchaseId()).orElse(null)
				: production.getPurchase();
		validateProductionQuantityLimit(request.getPurchaseId(), productionQuantity, purchase);
		String productDisplayName = purchase == null ? productCodePrefix : purchase.getProductName();

		for (int index = 1; index <= productionQuantity; index++) {
			String setProductQr = productCodePrefix + "-" + index;
			OrderProduct product = new OrderProduct();

			product.setProductQr(setProductQr);
			product.setProduction(production);
			product.setProductName(productDisplayName);
			product.setLot(request.getLot());
			product.setProcess(ProcessStatus.ASSEMBLY);

			orderProductRepository.save(product);
		}
	}

	private void validateProductionQuantityLimit(String purchaseId, Integer productionQuantity, OrderPurchase purchase) {
		if (purchase == null || purchase.getQuantity() == null) {
			throw new IllegalArgumentException("발주서를 찾을 수 없거나 발주수량이 없습니다.");
		}

		Long currentProductQuantity = orderProductRepository.countByProductionPurchaseId(purchaseId);

		if (currentProductQuantity + productionQuantity > purchase.getQuantity()) {
			throw new IllegalArgumentException("생산수량은 발주수량을 넘을 수 없습니다.");
		}
	}

	private void deleteProductionIfExists(String purchaseId) {
		saveCancelHistoriesByPurchaseId(purchaseId);
		orderProductRepository.deleteByProductionPurchaseId(purchaseId);

		if (orderProductionRepository.existsById(purchaseId)) {
			orderProductionRepository.deleteById(purchaseId);
		}
	}

	private void saveCancelHistoriesByPurchaseId(String purchaseId) {
		orderProductRepository.findByProductionPurchaseId(purchaseId).forEach(this::saveCancelHistory);
	}

	private void saveCancelHistory(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderHistory history = new OrderHistory();

		history.setProductQr(product.getProductQr());
		history.setProductionId(production == null ? null : production.getPurchaseId());
		history.setProductName(product.getProductName());
		history.setNote("제품 취소");
		history.setStatus(HistoryStatus.CANCEL);

		orderHistoryRepository.save(history);
	}

	private OrderProductionResponse toProductionResponse(OrderProduction production) {
		Map<String, Long> processCounts = OrderProductionResponse.emptyProcessCounts();

		if (production.getProducts() != null) {
			for (OrderProduct product : production.getProducts()) {
				ProcessStatus process = product.getProcess();

				if (process != null) {
					processCounts.put(process.name(), processCounts.getOrDefault(process.name(), 0L) + 1);
				}
			}
		}

		return OrderProductionResponse.from(production, processCounts);
	}

	private OrderProduction findProductionWithRelations(String purchaseId, OrderProduction fallback) {
		return orderProductionRepository.findByPurchaseIdWithPurchaseAndProducts(purchaseId).orElse(fallback);
	}

	private void updatePurchaseStatus(String purchaseId, ProcessStatus status) {
		if (!hasText(purchaseId)) {
			return;
		}

		orderPurchaseRepository.findById(purchaseId).ifPresent((purchase) -> {
			purchase.setStatus(status);
			orderPurchaseRepository.save(purchase);
		});
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
