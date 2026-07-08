package com.poi.orderSystem.features.Order.product;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderLabelResponse;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderShipmentResponse;
import com.poi.orderSystem.features.DTO.ProcessHistoryResponse;
import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.ProcessHistory;
import com.poi.orderSystem.features.repository.OrderHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.repository.ProcessHistoryRepository;
import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderProductService {

	private final OrderProductRepository orderProductRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderHistoryRepository orderHistoryRepository;
	private final ProcessHistoryRepository processHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderProductProcessResponse> findProductProcesses() {
		return orderProductRepository.findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc().stream()
				.map(OrderProductProcessResponse::from)
				.toList();
	}

	@Transactional
	public OrderProductProcessResponse updateProductProcess(String productQr, OrderProductProcessRequest request) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		applyProductProcessRequest(product, request);

		return OrderProductProcessResponse.from(orderProductRepository.save(product));
	}

	@Transactional(readOnly = true)
	public List<OrderShipmentResponse> findShipments() {
		return orderProductRepository.findByProcessWithProductionAndPurchaseOrderByCreatedTimeDesc(ProductProcess.SHIPMENT_INSPECTION).stream()
				.map(OrderShipmentResponse::from)
				.toList();
	}

	@Transactional
	public OrderShipmentResponse completeShipment(String productQr) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		product.setProcess(ProductProcess.SHIPMENT);
		OrderProduct savedProduct = orderProductRepository.saveAndFlush(product);
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

			product.setProcess(ProductProcess.SHIPMENT);
			OrderProduct savedProduct = orderProductRepository.save(product);
			OrderProduction production = savedProduct.getProduction();

			completedProducts.add(savedProduct);

			if (production != null && hasText(production.getPurchaseId())) {
				purchaseIds.add(production.getPurchaseId());
			}
		}

		orderProductRepository.flush();

		List<OrderShipmentResponse> responses = completedProducts.stream()
				.map(OrderShipmentResponse::from)
				.toList();

		purchaseIds.forEach(this::removeCompletedOrderIfReady);

		return responses;
	}

	@Transactional(readOnly = true)
	public List<OrderLabelResponse> findLabels() {
		return orderProductRepository.findAllByOrderByCreatedTimeDesc().stream()
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

	@Transactional(readOnly = true)
	public List<ProcessHistoryResponse> findProcessHistories() {
		return processHistoryRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(this::toProcessHistoryResponse)
				.toList();
	}

	private void applyProductProcessRequest(OrderProduct product, OrderProductProcessRequest request) {
		if (hasText(request.getProductName())) {
			product.setProductName(request.getProductName());
		}

		product.setLot(request.getLot());

		if (request.getProcess() != null) {
			product.setProcess(request.getProcess());
		}
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

	private void saveNormalHistory(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderHistory history = new OrderHistory();

		history.setProductQr(product.getProductQr());
		history.setProductionId(production == null ? null : production.getPurchaseId());
		history.setProductName(product.getProductName());
		history.setNote("납품출하 완료");
		history.setStatus(HistoryStatus.NORMAL);

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

		OrderProduction production = orderProductionRepository.findById(purchaseId).orElse(null);
		OrderPurchase purchase = production == null || production.getPurchase() == null
				? orderPurchaseRepository.findById(purchaseId).orElse(null)
				: production.getPurchase();

		if (purchase == null || purchase.getQuantity() == null) {
			return;
		}

		Long shippedCount = orderProductRepository.countByProductionPurchaseIdAndProcess(purchaseId, ProductProcess.SHIPMENT);

		if (shippedCount < purchase.getQuantity()) {
			return;
		}

		orderProductRepository.findByProductionPurchaseId(purchaseId).forEach(this::saveNormalHistory);
		orderProductRepository.deleteByProductionPurchaseId(purchaseId);

		if (orderProductionRepository.existsById(purchaseId)) {
			orderProductionRepository.deleteById(purchaseId);
		}

		orderPurchaseRepository.deleteById(purchaseId);
	}

	private ProcessHistoryResponse toProcessHistoryResponse(ProcessHistory history) {
		String productName = orderProductRepository.findById(history.getProductQr())
				.map(OrderProduct::getProductName)
				.orElse(null);

		return ProcessHistoryResponse.from(history, productName);
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
