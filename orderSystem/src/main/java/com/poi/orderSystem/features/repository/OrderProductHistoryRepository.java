package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderProductHistory;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

public interface OrderProductHistoryRepository extends JpaRepository<OrderProductHistory, String> {

	List<OrderProductHistory> findAllByOrderByCreatedTimeDesc();

	List<OrderProductHistory> findByProductQrOrderByCreatedTimeDesc(String productQr);

	List<OrderProductHistory> findByPurchaseIdOrderByCreatedTimeDesc(String purchaseId);

	List<OrderProductHistory> findByProcessOrderByCreatedTimeDesc(ProcessStatus process);

	void deleteByPurchaseId(String purchaseId);
}
