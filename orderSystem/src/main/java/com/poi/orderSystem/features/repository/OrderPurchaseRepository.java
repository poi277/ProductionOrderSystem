package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchase;

public interface OrderPurchaseRepository extends JpaRepository<OrderPurchase, String> {

	List<OrderPurchase> findAllByOrderByCreatedTimeDesc();
}
