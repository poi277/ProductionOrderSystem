package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

public interface OrderProductRepository extends JpaRepository<OrderProduct, String> {

	List<OrderProduct> findAllByOrderByCreatedTimeDesc();

	List<OrderProduct> findByProductionPurchaseId(String purchaseId);

	Long countByProductionPurchaseIdAndProcess(String purchaseId, ProductProcess process);

	void deleteByProductionPurchaseId(String purchaseId);
}
