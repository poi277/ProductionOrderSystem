package com.poi.orderSystem.features.Order.product;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderLabelResponse;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderShipmentResponse;
import com.poi.orderSystem.features.Order.purChase.OrderPurChaseService;
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
public class OrderProductService {

	private final OrderProductRepository orderProductRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderHistoryRepository orderHistoryRepository;
	private final OrderPurChaseService orderPurChaseService;

	@Transactional
	public OrderProductProcessResponse updateProductProcess(String productQr, OrderProductProcessRequest request) {
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);
		if (product == null) {
			return null;
		}

		applyProductProcessRequest(product, request);

		OrderProduct savedProduct = orderProductRepository.save(product);
		syncPurchaseStatusByProducts(savedProduct);

		return OrderProductProcessResponse.from(savedProduct);
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

		for (OrderProduct product : products) {
			product.setProcess(request.getProcessName());
		}

		List<OrderProduct> savedProducts = orderProductRepository.saveAll(products);
		updatePurchaseStatus(purchaseId, request.getProcessName());

		return savedProducts.stream().map(OrderProductProcessResponse::from).toList();
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
		return orderProductRepository
				.findByProcessInWithProductionAndPurchaseOrderByCreatedTimeDesc(
						List.of(ProcessStatus.PACKAGING))
				.stream().map(OrderShipmentResponse::from).toList();
	}

	@Transactional
	public OrderShipmentResponse completeShipment(String productQr) {
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		product.setProcess(ProcessStatus.WAITING_FOR_SHIPMENT);
		OrderProduct savedProduct = orderProductRepository.saveAndFlush(product);
		syncPurchaseStatusByProducts(savedProduct);

		OrderShipmentResponse response = OrderShipmentResponse.from(savedProduct);
		removeCompletedOrderIfReady(savedProduct);

		return response;
	}

	@Transactional
	public List<OrderShipmentResponse> completeShipments(List<String> productQrs) {
		List<OrderProduct> completedProducts = new ArrayList<>();
		Set<String> purchaseIds = new LinkedHashSet<>();

		for (String productQr : productQrs) {
			OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

			if (product == null) {
				continue;
			}

			product.setProcess(ProcessStatus.WAITING_FOR_SHIPMENT);
			OrderProduct savedProduct = orderProductRepository.save(product);
			OrderProduction production = savedProduct.getProduction();

			completedProducts.add(savedProduct);

			if (production != null && hasText(production.getPurchaseId())) {
				purchaseIds.add(production.getPurchaseId());
			}
		}

		orderProductRepository.flush();

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
		if (request.getProcessName() != null) {
			product.setProcess(request.getProcessName());
		}
		if (request.getIsDefect() != null) {
			product.setDefect(request.getIsDefect());
		}
	}

	private void saveCancelHistory(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderHistory history = new OrderHistory();

		history.setProductQr(product.getProductQr());
		history.setProductionId(production == null ? null : production.getPurchaseId());
		history.setProductName(production == null || production.getPurchase() == null
				? null : production.getPurchase().getProductName());
		history.setNote("제품 취소");
		history.setStatus(HistoryStatus.CANCEL);

		orderHistoryRepository.save(history);
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

		if (purchase == null || purchase.getQuantity() == null) {
			return;
		}

		Long shippedCount = orderProductRepository.countByProductionPurchasePurchaseIdAndProcess(purchaseId,
				ProcessStatus.WAITING_FOR_SHIPMENT);

		if (shippedCount < purchase.getQuantity()) {
			return;
		}

		purchase.setStatus(ProcessStatus.WAITING_FOR_SHIPMENT);
		orderPurchaseRepository.saveAndFlush(purchase);
		orderPurChaseService.savePurchaseHistory(purchase);

		orderProductRepository.deleteByProductionPurchasePurchaseId(purchaseId);

		if (production != null) orderProductionRepository.delete(production);

		orderPurchaseRepository.deleteById(purchase.getId());
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
