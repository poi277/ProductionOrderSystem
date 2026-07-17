package com.poi.orderSystem.features.Order.purChase;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderPurchaseHistoryListResponse;
import com.poi.orderSystem.features.DTO.OrderPurchaseHistoryListResponse.Source;
import com.poi.orderSystem.features.DTO.OrderPurchaseHistoryResponse;
import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.DTO.OrderPurchaseResponse;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderProductProcessHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderPurChaseService {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductRepository orderProductRepository;
	private final OrderProductProcessHistoryRepository orderProductProcessHistoryRepository;

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
		return orderPurchaseRepository.findAllByStatusOrderByCreatedTimeDesc(ProcessStatus.SHIPPED).stream()
				.map(OrderPurchaseHistoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderPurchaseHistoryResponse findPurchaseHistory(Long id) {
		return orderPurchaseRepository.findById(id)
				.filter(purchase -> purchase.getStatus() == ProcessStatus.SHIPPED)
				.map(OrderPurchaseHistoryResponse::from).orElse(null);
	}

	@Transactional(readOnly = true)
	public List<OrderPurchaseHistoryListResponse> findAllPurchaseHistories() {
		return orderPurchaseRepository.findAllByOrderByCreatedTimeDescIdDesc().stream()
				.map(OrderPurchaseHistoryListResponse::from).toList();
	}

	@Transactional
	public java.util.Map<String, Integer> deletePurchaseHistoryItem(Source source, Long id) {
		if (source != Source.PURCHASE) {
			throw new IllegalArgumentException("현재 발주서 데이터만 삭제할 수 있습니다.");
		}
		return deletePurchase(id);
	}

	@Transactional(readOnly = true)
	public List<OrderPurchaseResponse> findDashboardOrders() {
		List<OrderPurchase> purchases = orderPurchaseRepository.findAllByStatusNotInOrderByCreatedTimeDesc(
				List.of(ProcessStatus.SHIPPED, ProcessStatus.CANCEL)).stream().limit(30).toList();
		if (purchases.isEmpty()) return List.of();

		Map<Long, Map<ProcessStatus, LocalDateTime>> timesByPurchase = new HashMap<>();
		orderProductProcessHistoryRepository.findLatestCompletedTimesByPurchaseDbIds(
				purchases.stream().map(OrderPurchase::getId).toList()).forEach(row -> {
			Long purchaseDbId = (Long) row[0];
			ProcessStatus process = (ProcessStatus) row[1];
			LocalDateTime completedTime = (LocalDateTime) row[2];
			timesByPurchase.computeIfAbsent(purchaseDbId, ignored -> new EnumMap<>(ProcessStatus.class))
					.put(process, completedTime);
		});

		return purchases.stream()
				.map(purchase -> OrderPurchaseResponse.from(
						purchase, timesByPurchase.getOrDefault(purchase.getId(), Map.of())))
				.toList();
	}

	@Transactional
	public OrderPurchaseResponse savePurchase(OrderPurchaseRequest request) {
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
		applyPurchaseRequest(purchase, request);
		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);
		return OrderPurchaseResponse.from(savedPurchase);
	}

	@Transactional
	public java.util.Map<String, Integer> deletePurchase(Long id) {
		OrderPurchase purchase = orderPurchaseRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("발주서를 찾을 수 없습니다."));
		OrderProduction production = purchase.getProduction();
		List<String> productQrs = production == null ? List.of()
				: orderProductRepository.findProductQrsByProductionId(production.getId());
		int historyCount = productQrs.isEmpty() ? 0
				: orderProductProcessHistoryRepository.deleteAllByProductQrIn(productQrs);
		int deletedProducts = production == null ? 0 : orderProductRepository.deleteAllByProductionId(production.getId());
		int deletedProductions = 0;
		if (production != null) {
			orderProductionRepository.deleteById(production.getId());
			deletedProductions = 1;
		}
		orderPurchaseRepository.deleteById(purchase.getId());
		return java.util.Map.of(
				"deletedProcessHistories", historyCount,
				"deletedProducts", deletedProducts,
				"deletedProductions", deletedProductions,
				"deletedPurchases", 1);
	}

	private void applyPurchaseRequest(OrderPurchase purchase, OrderPurchaseRequest request) {
		ProcessStatus currentStatus = purchase.getStatus();

		purchase.setPurchaseId(request.getPurchaseId());
		purchase.setCustomer(request.getCustomer());
		purchase.setProductName(request.getProductName());
		purchase.setQuantity(request.getQuantity());
		purchase.setProductCategory(request.getProductCategory());
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
}
