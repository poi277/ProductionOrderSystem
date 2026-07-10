package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchaseHistory;

public interface OrderPurchaseHistoryRepository extends JpaRepository<OrderPurchaseHistory, Long> {

	List<OrderPurchaseHistory> findAllByOrderByCreatedTimeDesc();

	List<OrderPurchaseHistory> findTop30ByOrderByCreatedTimeDesc();

}