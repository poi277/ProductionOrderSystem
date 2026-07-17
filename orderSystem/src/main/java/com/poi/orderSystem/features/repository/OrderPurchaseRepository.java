package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

public interface OrderPurchaseRepository extends JpaRepository<OrderPurchase, Long> {

	List<OrderPurchase> findAllByOrderByCreatedTimeDesc();

	List<OrderPurchase> findAllByStatusOrderByCreatedTimeDesc(ProcessStatus status);

	List<OrderPurchase> findAllByStatusNotInOrderByCreatedTimeDesc(List<ProcessStatus> statuses);

	List<OrderPurchase> findAllByOrderByCreatedTimeDescIdDesc();
}
