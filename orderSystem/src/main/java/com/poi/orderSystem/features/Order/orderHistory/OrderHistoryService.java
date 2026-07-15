package com.poi.orderSystem.features.Order.orderHistory;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.DTO.OrderProductHistoryResponse;
import com.poi.orderSystem.features.entity.OrderProductHistory;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.repository.OrderProductHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {

	private final OrderProductHistoryRepository orderProductHistoryRepository;
	private final OrderProductionRepository orderProductionRepository;

	@Transactional(readOnly = true)
	public List<OrderProductHistoryResponse> findHistories() {
		return orderProductHistoryRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderProductHistoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderProductHistoryResponse findHistory(String productQr) {
		return orderProductHistoryRepository.findById(productQr).map(OrderProductHistoryResponse::from).orElse(null);
	}

	@Transactional
	public OrderProductHistoryResponse saveHistory(OrderHistoryRequest request) {
		OrderProductHistory history = new OrderProductHistory();
		applyHistoryRequest(history, request);

		return OrderProductHistoryResponse.from(orderProductHistoryRepository.save(history));
	}

	@Transactional
	public OrderProductHistoryResponse updateHistory(String productQr, OrderHistoryRequest request) {
		OrderProductHistory history = orderProductHistoryRepository.findById(productQr)
				.orElseThrow(() -> new IllegalArgumentException("제품이력을 찾을 수 없습니다."));
		request.setProductQr(productQr);
		applyHistoryRequest(history, request);

		return OrderProductHistoryResponse.from(orderProductHistoryRepository.save(history));
	}

	@Transactional
	public void deleteHistory(String productQr) {
		orderProductHistoryRepository.deleteById(productQr);
	}

	private void applyHistoryRequest(OrderProductHistory history, OrderHistoryRequest request) {
		history.setProductQr(request.getProductQr());
		OrderProduction production = orderProductionRepository.findByPurchasePurchaseId(request.getProductionId())
				.orElseThrow(() -> new IllegalArgumentException("생산지시를 찾을 수 없습니다."));
		history.setPurchaseId(production.getPurchaseId());
		history.setProductName(production.getPurchase() == null ? null : production.getPurchase().getProductName());
		history.setDefect(Boolean.TRUE.equals(request.getIsDefect()));
		history.setProcess(request.getProcess() == null ? ProcessStatus.CANCEL : request.getProcess());
	}
}
