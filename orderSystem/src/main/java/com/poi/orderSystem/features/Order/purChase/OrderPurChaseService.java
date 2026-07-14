package com.poi.orderSystem.features.Order.purChase;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.DTO.OrderPurchaseResponse;
import com.poi.orderSystem.features.DTO.OrderPurchaseHistoryResponse;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.OrderPurchaseHistory;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseHistoryRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderPurChaseService {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderPurchaseHistoryRepository orderPurchaseHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderPurchaseResponse> findPurchases() {
		return orderPurchaseRepository.findAllByStatusOrderByCreatedTimeDesc(ProcessStatus.PURCHASESUBMIT).stream()
				.map(OrderPurchaseResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderPurchaseResponse findPurchase(Long id) {
		return orderPurchaseRepository.findById(id).map(OrderPurchaseResponse::from).orElse(null);
	}

	@Transactional(readOnly = true)
	public List<OrderPurchaseHistoryResponse> findPurchaseHistories() {
		return orderPurchaseHistoryRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderPurchaseHistoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderPurchaseHistoryResponse findPurchaseHistory(Long id) {
		return orderPurchaseHistoryRepository.findById(id)
				.map(OrderPurchaseHistoryResponse::from).orElse(null);
	}

	@Transactional(readOnly = true)
	public List<Object> findDashboardOrders() {
		List<Object> orders = new ArrayList<>();
		orders.addAll(orderPurchaseRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderPurchaseResponse::from).toList());
		orders.addAll(orderPurchaseHistoryRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderPurchaseHistoryResponse::from).toList());

		return orders.stream()
				.sorted(Comparator.comparing(this::getDueDate, Comparator.nullsLast(String::compareTo)))
				.limit(30)
				.toList();
	}

	private String getDueDate(Object order) {
		if (order instanceof OrderPurchaseResponse purchase) {
			return purchase.getDueDate();
		}

		if (order instanceof OrderPurchaseHistoryResponse history) {
			return history.getDueDate();
		}

		return null;
	}

	@Transactional
	public OrderPurchaseResponse savePurchase(OrderPurchaseRequest request) {
		if (orderPurchaseRepository.existsByPurchaseId(request.getPurchaseId())) {
			throw new IllegalArgumentException("이미 사용 중인 발주번호입니다.");
		}
		OrderPurchase purchase = new OrderPurchase();
		applyPurchaseRequest(purchase, request);
		purchase.setStatus(ProcessStatus.PURCHASESUBMIT);

		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);

		return OrderPurchaseResponse.from(savedPurchase);
	}

	@Transactional
	public OrderPurchaseResponse updatePurchase(Long id, OrderPurchaseRequest request) {
		OrderPurchase purchase = orderPurchaseRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("발주서를 찾을 수 없습니다."));
		if (orderPurchaseRepository.existsByPurchaseIdAndIdNot(request.getPurchaseId(), id)) {
			throw new IllegalArgumentException("이미 사용 중인 발주번호입니다.");
		}
		applyPurchaseRequest(purchase, request);
		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);
		return OrderPurchaseResponse.from(savedPurchase);
	}

	@Transactional
	public void deletePurchase(Long id) {
		OrderPurchase purchase = orderPurchaseRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("발주서를 찾을 수 없습니다."));
		saveCancelledPurchaseHistory(purchase);
		orderPurchaseRepository.delete(purchase);
	}

	private void applyPurchaseRequest(OrderPurchase purchase, OrderPurchaseRequest request) {
		ProcessStatus currentStatus = purchase.getStatus();

		purchase.setPurchaseId(request.getPurchaseId());
		purchase.setCustomer(request.getCustomer());
		purchase.setProductName(request.getProductName());
		purchase.setQuantity(request.getQuantity());
		purchase.setPrice(request.getUnitPrice());
		purchase.setDueDate(request.getDueDate());
		purchase.setStatus(currentStatus == null ? ProcessStatus.PURCHASESUBMIT : currentStatus);
		purchase.setNote(request.getNote());
	}

	private void saveInitialProduction(OrderPurchase purchase) {
		if (!hasText(purchase.getPurchaseId()) || orderProductionRepository.existsByPurchase_Id(purchase.getId())) {
			return;
		}

		OrderProduction production = new OrderProduction();
		production.setPurchase(purchase);
		production.setProductQrQuantity(0);

		orderProductionRepository.save(production);
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

	public void savePurchaseHistory(OrderPurchase purchase) {
		if (orderPurchaseHistoryRepository.existsByPurchaseId(purchase.getPurchaseId())) return;
		OrderPurchaseHistory history = new OrderPurchaseHistory();

		history.setPurchaseId(purchase.getPurchaseId());
		history.setCustomer(purchase.getCustomer());
		history.setProductName(purchase.getProductName());
		history.setQuantity(purchase.getQuantity());
		history.setPrice(purchase.getPrice());
		history.setDueDate(purchase.getDueDate());
		history.setCreatedTime(purchase.getCreatedTime());
		history.setStatus(ProcessStatus.WAITING_FOR_SHIPMENT);
		history.setNote(purchase.getNote());

		orderPurchaseHistoryRepository.save(history);
	}

	private void saveCancelledPurchaseHistory(OrderPurchase purchase) {
		OrderPurchaseHistory history = orderPurchaseHistoryRepository.findByPurchaseId(purchase.getPurchaseId())
				.orElseGet(OrderPurchaseHistory::new);
		history.setPurchaseId(purchase.getPurchaseId());
		history.setCustomer(purchase.getCustomer());
		history.setProductName(purchase.getProductName());
		history.setQuantity(purchase.getQuantity());
		history.setPrice(purchase.getPrice());
		history.setDueDate(purchase.getDueDate());
		history.setCreatedTime(purchase.getCreatedTime());
		history.setStatus(ProcessStatus.CANCEL);
		history.setNote(purchase.getNote());
		orderPurchaseHistoryRepository.save(history);
	}
}
