package com.poi.orderSystem.features.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderProduction;

public interface OrderProductionRepository extends JpaRepository<OrderProduction, String> {
}
