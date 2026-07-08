package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderProduction;

public interface OrderProductionRepository extends JpaRepository<OrderProduction, String> {

	List<OrderProduction> findAllByOrderByCreatedTimeDesc();
}
