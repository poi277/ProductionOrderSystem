package com.poi.orderSystem.features.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchase;

public interface OrderPurchaseRepository extends JpaRepository<OrderPurchase, String> {
}
