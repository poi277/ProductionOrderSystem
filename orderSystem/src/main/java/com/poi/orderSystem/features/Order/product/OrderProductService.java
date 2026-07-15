package com.poi.orderSystem.features.Order.product;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderLabelResponse;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderShipmentResponse;
import com.poi.orderSystem.features.Order.purChase.OrderPurChaseService;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProductHistory;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class OrderProductService {

	private final OrderProductRepository orderProductRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductHistoryRepository orderProductHistoryRepository;
	private final OrderPurChaseService orderPurChaseService;

	@Transactional
	public OrderProductProcessResponse updateProductProcess(String productQr, OrderProductProcessRequest request) {
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);
		if (product == null) {
			return null;
		}

		applyProductProcessRequest(product, request);

		syncPurchaseStatusByProducts(product);

		return OrderProductProcessResponse.from(product);
	}

	@Transactional
	public List<OrderProductProcessResponse> updateProductProcessesByProduction(
			String purchaseId,
			OrderProductProcessRequest request
	) {
		List<OrderProduct> products = orderProductRepository.findByPurchaseIdWithProductionAndPurchase(purchaseId);

		if (request.getProcessName() == null) {
			throw new IllegalArgumentException("변경할 공정 상태가 필요합니다.");
		}

		LocalDateTime packingCompletedTime = request.getProcessName() == ProcessStatus.PACKAGING
				? currentMinute()
				: null;
		for (OrderProduct product : products) {
			if (product.getProcess() != request.getProcessName()) {
				product.setProcess(request.getProcessName());
				if (packingCompletedTime != null) {
					product.setPackingCompletedTime(packingCompletedTime);
				}
			}
		}

		updatePurchaseStatus(purchaseId, request.getProcessName());

		return products.stream().map(OrderProductProcessResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public List<OrderProductProcessResponse> findProducts() {
		return orderProductRepository.findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc().stream()
				.map(OrderProductProcessResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderProductProcessResponse findProduct(String productQr) {
		return orderProductRepository.findByProductQrWithProductionAndPurchase(productQr)
				.map(OrderProductProcessResponse::from).orElse(null);
	}

	@Transactional(readOnly = true)
	public List<OrderShipmentResponse> findShipments() {
		return new ArrayList<>(orderProductRepository
				.findByProcessInWithProductionAndPurchaseOrderByCreatedTimeDesc(
						List.of(ProcessStatus.PACKAGING))
				.stream()
				.collect(java.util.stream.Collectors.groupingBy(
						product -> product.getProduction().getPurchaseId(),
						java.util.LinkedHashMap::new,
						java.util.stream.Collectors.toList()))
				.values()).stream()
				.map(OrderShipmentResponse::from)
				.toList();
	}

	@Transactional
	public OrderShipmentResponse completeShipment(String productQr) {
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		product.setProcess(ProcessStatus.WAITING_FOR_SHIPMENT);
		syncPurchaseStatusByProducts(product);

		OrderShipmentResponse response = OrderShipmentResponse.from(product);
		removeCompletedOrderIfReady(product);

		return response;
	}

	@Transactional
	public List<OrderShipmentResponse> completeShipments(List<String> productQrs) {
		List<OrderProduct> completedProducts = new ArrayList<>();
		Set<String> purchaseIds = new LinkedHashSet<>();
		Map<String, OrderProduct> productsByQr = new HashMap<>();
		orderProductRepository.findAllByProductQrInWithProductionAndPurchase(productQrs)
				.forEach(product -> productsByQr.put(product.getProductQr(), product));

		for (String productQr : productQrs) {
			OrderProduct product = productsByQr.get(productQr);

			if (product == null) {
				continue;
			}

			if (product.getProcess() != ProcessStatus.WAITING_FOR_SHIPMENT) {
				product.setProcess(ProcessStatus.WAITING_FOR_SHIPMENT);
			}
			OrderProduction production = product.getProduction();

			completedProducts.add(product);

			if (production != null && hasText(production.getPurchaseId())) {
				purchaseIds.add(production.getPurchaseId());
			}
		}

		purchaseIds.forEach(this::syncPurchaseStatusByPurchaseId);

		List<OrderShipmentResponse> responses = completedProducts.stream()
				.map(OrderShipmentResponse::from).toList();

		purchaseIds.forEach(this::removeCompletedOrderIfReady);

		return responses;
	}

	@Transactional(readOnly = true)
	public List<OrderLabelResponse> findLabels() {
		return orderProductRepository.findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc().stream()
				.map(OrderLabelResponse::from)
				.toList();
	}

	@Transactional
	public void cancelProduct(String productQr) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return;
		}

		saveCancelHistory(product);
		orderProductRepository.delete(product);
	}


	private void applyProductProcessRequest(OrderProduct product, OrderProductProcessRequest request) {
		if (request.getProcessName() != null && product.getProcess() != request.getProcessName()) {
			product.setProcess(request.getProcessName());
			if (request.getProcessName() == ProcessStatus.PACKAGING) {
				product.setPackingCompletedTime(currentMinute());
			}
		}
		if (request.getIsDefect() != null && product.isDefect() != request.getIsDefect()) {
			product.setDefect(request.getIsDefect());
		}
	}

	private void saveCancelHistory(OrderProduct product) {
		OrderProduction production = product.getProduction();
		if (production == null) return;
		OrderProductHistory history = new OrderProductHistory();
		history.setProductQr(product.getProductQr());
		history.setPurchaseId(production.getPurchaseId());
		history.setProductName(production.getPurchase() == null ? null : production.getPurchase().getProductName());
		history.setDefect(product.isDefect());
		history.setProcess(ProcessStatus.CANCEL);
		history.setCreatedTime(product.getCreatedTime());
		orderProductHistoryRepository.save(history);
	}

	private void removeCompletedOrderIfReady(OrderProduct product) {
		OrderProduction production = product.getProduction();

		if (production == null || !hasText(production.getPurchaseId())) {
			return;
		}

		removeCompletedOrderIfReady(production.getPurchaseId());
	}

	private void removeCompletedOrderIfReady(String purchaseId) {
		if (!hasText(purchaseId)) {
			return;
		}

		OrderProduction production = orderProductionRepository.findByPurchasePurchaseId(purchaseId).orElse(null);
		OrderPurchase purchase = production == null || production.getPurchase() == null
				? orderPurchaseRepository.findByPurchaseId(purchaseId).orElse(null)
				: production.getPurchase();

		if (purchase == null) {
			return;
		}

		List<OrderProduct> products = orderProductRepository.findByProductionPurchasePurchaseId(purchaseId);

		if (products.isEmpty() || products.stream()
				.anyMatch(product -> product.getProcess() != ProcessStatus.WAITING_FOR_SHIPMENT)) {
			return;
		}

		purchase.setStatus(ProcessStatus.WAITING_FOR_SHIPMENT);
		orderPurchaseRepository.saveAndFlush(purchase);
		orderPurChaseService.savePurchaseHistory(purchase);
		saveCompletedProductHistories(products, production);

		orderProductRepository.deleteByProductionPurchasePurchaseId(purchaseId);

		if (production != null) orderProductionRepository.delete(production);

		orderPurchaseRepository.deleteById(purchase.getId());
	}

	private void saveCompletedProductHistories(List<OrderProduct> products, OrderProduction production) {
		if (production == null) {
			return;
		}

		List<String> productQrs = products.stream().map(OrderProduct::getProductQr).toList();
		Map<String, OrderProductHistory> historiesByQr = new HashMap<>();
		orderProductHistoryRepository.findAllById(productQrs)
				.forEach(history -> historiesByQr.put(history.getProductQr(), history));

		List<OrderProductHistory> histories = products.stream()
				.map(product -> {
					OrderProductHistory history = historiesByQr.getOrDefault(
							product.getProductQr(), new OrderProductHistory());
					history.setProductQr(product.getProductQr());
					history.setPurchaseId(production.getPurchaseId());
					history.setProductName(production.getPurchase() == null ? null : production.getPurchase().getProductName());
					history.setDefect(product.isDefect());
					history.setProcess(product.getProcess());
					return history;
				})
				.toList();

		orderProductHistoryRepository.saveAll(histories);
	}

	private LocalDateTime currentMinute() {
		return LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}


	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

	private void syncPurchaseStatusByProducts(OrderProduct product) {
		OrderProduction production = product.getProduction();

		if (production == null || !hasText(production.getPurchaseId())) {
			return;
		}

		syncPurchaseStatusByPurchaseId(production.getPurchaseId());
	}

	private void syncPurchaseStatusByPurchaseId(String purchaseId) {
		if (!hasText(purchaseId)) {
			return;
		}

		List<OrderProduct> products = orderProductRepository.findByProductionPurchasePurchaseId(purchaseId);

		if (products.isEmpty()) {
			updatePurchaseStatus(purchaseId, ProcessStatus.INSTRUCTION);
			return;
		}

		ProcessStatus earliestStatus = products.stream().map(OrderProduct::getProcess).filter(status -> status != null)
				.min(Comparator.comparingInt(Enum::ordinal)).orElse(ProcessStatus.INSTRUCTION);

		updatePurchaseStatus(purchaseId, earliestStatus);
	}

	private void updatePurchaseStatus(String purchaseId, ProcessStatus status) {
		if (!hasText(purchaseId) || status == null) {
			return;
		}

		orderPurchaseRepository.findByPurchaseId(purchaseId).ifPresent((purchase) -> {
			purchase.setStatus(status);
			orderPurchaseRepository.save(purchase);
		});
	}
}
