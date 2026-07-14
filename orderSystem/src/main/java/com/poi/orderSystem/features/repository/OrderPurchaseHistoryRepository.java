package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchaseHistory;

public interface OrderPurchaseHistoryRepository extends JpaRepository<OrderPurchaseHistory, Long> {

	Optional<OrderPurchaseHistory> findByPurchaseId(String purchaseId);

	boolean existsByPurchaseId(String purchaseId);

	boolean existsByPurchaseIdAndIdNot(String purchaseId, Long id);

	List<OrderPurchaseHistory> findAllByOrderByCreatedTimeDesc();

	List<OrderPurchaseHistory> findTop30ByOrderByCreatedTimeDesc();

	List<OrderPurchaseHistory> findTop10ByOrderByDueDateAsc();

}
