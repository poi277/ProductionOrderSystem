package com.poi.orderSystem.features.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderLabel;

public interface OrderLabelRepository extends JpaRepository<OrderLabel, String> {
}
