package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.ProcessHistory;

public interface ProcessHistoryRepository extends JpaRepository<ProcessHistory, Long> {

	List<ProcessHistory> findAllByOrderByCreatedTimeDesc();
}
