package com.poi.orderSystem.features.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderProductProcess;

public interface OrderProductProcessRepository extends JpaRepository<OrderProductProcess, String> {
}
