package com.poi.orderSystem.features.Order.purChase;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
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
public class OrderPurChaseService {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductRepository orderProductRepository;
	private final OrderHistoryRepository orderHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderPurchase> findPurchases() {
		return orderPurchaseRepository.findAllByOrderByCreatedTimeDesc();
	}

	@Transactional
	public OrderPurchase savePurchase(OrderPurchaseRequest request) {
		OrderPurchase purchase = new OrderPurchase();
		applyPurchaseRequest(purchase, request);
		purchase.setStatus(ProcessStatus.INSTRUCTION);

		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);

		return savedPurchase;
	}

	@Transactional
	public OrderPurchase updatePurchase(String purchaseId, OrderPurchaseRequest request) {
		String nextPurchaseId = hasText(request.getPurchaseId()) ? request.getPurchaseId() : purchaseId;
		OrderPurchase purchase = purchaseId.equals(nextPurchaseId)
				? orderPurchaseRepository.findById(purchaseId).orElseGet(OrderPurchase::new)
				: new OrderPurchase();
		applyPurchaseRequest(purchase, request);
		purchase.setPurchaseId(nextPurchaseId);

		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);

		if (!purchaseId.equals(nextPurchaseId)) {
			deleteProductionIfExists(purchaseId);
			orderPurchaseRepository.deleteById(purchaseId);
		}

		return savedPurchase;
	}

	@Transactional
	public void deletePurchase(String purchaseId) {
		deleteProductionIfExists(purchaseId);
		orderPurchaseRepository.deleteById(purchaseId);
	}

	private void applyPurchaseRequest(OrderPurchase purchase, OrderPurchaseRequest request) {
		ProcessStatus currentStatus = purchase.getStatus();

		purchase.setPurchaseId(request.getPurchaseId());
		purchase.setCustomer(request.getCustomer());
		purchase.setProductName(request.getProductName());
		purchase.setQuantity(request.getQuantity());
		purchase.setPrice(request.getUnitPrice());
		purchase.setPurchaseDate(request.getPurchaseDate());
		purchase.setDueDate(request.getDueDate());
		purchase.setStatus(currentStatus == null ? ProcessStatus.INSTRUCTION : currentStatus);
		purchase.setNote(request.getNote());
	}

	private void saveInitialProduction(OrderPurchase purchase) {
		if (!hasText(purchase.getPurchaseId()) || orderProductionRepository.existsById(purchase.getPurchaseId())) {
			return;
		}

		OrderProduction production = new OrderProduction();
		production.setPurchaseId(purchase.getPurchaseId());

		orderProductionRepository.save(production);
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

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
