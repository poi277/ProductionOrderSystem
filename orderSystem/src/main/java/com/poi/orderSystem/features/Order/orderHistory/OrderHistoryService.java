package com.poi.orderSystem.features.Order.orderHistory;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.repository.OrderHistoryRepository;
import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {

	private final OrderHistoryRepository orderHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderHistory> findHistories() {
		return orderHistoryRepository.findAllByOrderByCreatedTimeDesc();
	}

	@Transactional(readOnly = true)
	public OrderHistory findHistory(Long historyId) {
		return orderHistoryRepository.findByHistoryId(historyId).orElse(null);
	}

	@Transactional
	public OrderHistory saveHistory(OrderHistoryRequest request) {
		OrderHistory history = new OrderHistory();
		applyHistoryRequest(history, request);

		return orderHistoryRepository.save(history);
	}

	@Transactional
	public OrderHistory updateHistory(Long historyId, OrderHistoryRequest request) {
		OrderHistory history = orderHistoryRepository.findById(historyId).orElseGet(OrderHistory::new);
		history.setHistoryId(historyId);
		applyHistoryRequest(history, request);

		return orderHistoryRepository.save(history);
	}

	@Transactional
	public void deleteHistory(Long historyId) {
		orderHistoryRepository.deleteById(historyId);
	}

	private void applyHistoryRequest(OrderHistory history, OrderHistoryRequest request) {
		history.setProductQr(request.getProductQr());
		history.setProductionId(request.getProductionId());
		history.setProductName(request.getProductName());
		history.setNote(request.getNote());
		history.setStatus(request.getStatus() == null ? HistoryStatus.NORMAL : request.getStatus());
	}
}
