package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;

public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {

	List<OrderHistory> findAllByOrderByCreatedTimeDesc();

	Optional<OrderHistory> findByHistoryId(Long historyId);

	List<OrderHistory> findByProductQrOrderByHistoryIdDesc(String productQr);

	List<OrderHistory> findByProductionIdOrderByHistoryIdDesc(String productionId);

	List<OrderHistory> findByStatusOrderByHistoryIdDesc(HistoryStatus status);
}
