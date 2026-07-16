package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

public interface OrderPurchaseRepository extends JpaRepository<OrderPurchase, Long> {

	Optional<OrderPurchase> findByPurchaseId(String purchaseId);

	boolean existsByPurchaseId(String purchaseId);

	boolean existsByPurchaseIdAndIdNot(String purchaseId, Long id);

	List<OrderPurchase> findAllByOrderByCreatedTimeDesc();

	List<OrderPurchase> findAllByStatusOrderByCreatedTimeDesc(ProcessStatus status);

	List<OrderPurchase> findAllByStatusNotInOrderByCreatedTimeDesc(List<ProcessStatus> statuses);

	List<OrderPurchase> findAllByOrderByCreatedTimeDescIdDesc();
}
