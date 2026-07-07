package com.poi.orderSystem.features.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderShipment;

public interface OrderShipmentRepository extends JpaRepository<OrderShipment, String> {
}
