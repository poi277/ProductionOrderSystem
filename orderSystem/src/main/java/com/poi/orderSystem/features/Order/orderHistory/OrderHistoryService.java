package com.poi.orderSystem.features.Order.orderHistory;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.DTO.OrderProductHistoryResponse;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderHistoryService {

	private final OrderProductRepository orderProductRepository;

	@Transactional(readOnly = true)
	public List<OrderProductHistoryResponse> findHistories() {
		// 현재 출하이력 화면은 최종 출하가 아닌 출하 상태를 이력 기준으로 사용한다.
		return orderProductRepository
				.findByPurchaseStatusWithProductionAndPurchaseOrderByCreatedTimeDesc(
						ProcessStatus.SHIPPED).stream()
				.map(OrderProductHistoryResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public OrderProductHistoryResponse findHistory(String productQr) {
		return orderProductRepository.findByProductQrWithProductionAndPurchase(productQr)
				.filter(product -> product.getProduction().getPurchase().getStatus()
						== ProcessStatus.SHIPPED)
				.map(OrderProductHistoryResponse::from).orElse(null);
	}

	@Transactional
	public OrderProductHistoryResponse saveHistory(OrderHistoryRequest request) {
		throw new IllegalArgumentException("출하 완료 이력은 별도로 생성할 수 없습니다.");
	}

	@Transactional
	public OrderProductHistoryResponse updateHistory(String productQr, OrderHistoryRequest request) {
		throw new IllegalArgumentException("출하 완료 이력은 수정할 수 없습니다.");
	}

	@Transactional
	public void deleteHistory(String productQr) {
		throw new IllegalArgumentException("출하 완료 이력은 삭제할 수 없습니다.");
	}
}
