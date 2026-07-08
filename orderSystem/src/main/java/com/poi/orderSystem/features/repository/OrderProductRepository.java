package com.poi.orderSystem.features.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

public interface OrderProductRepository extends JpaRepository<OrderProduct, String> {

	List<OrderProduct> findAllByOrderByCreatedTimeDesc();

	List<OrderProduct> findByProcessOrderByCreatedTimeDesc(ProductProcess process);

	@Query("""
			select product
			from OrderProduct product
			left join fetch product.production production
			left join fetch production.purchase
			order by product.createdTime desc
			""")
	List<OrderProduct> findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc();

	@Query("""
			select product
			from OrderProduct product
			left join fetch product.production production
			left join fetch production.purchase
			where product.process = :process
			order by product.createdTime desc
			""")
	List<OrderProduct> findByProcessWithProductionAndPurchaseOrderByCreatedTimeDesc(@Param("process") ProductProcess process);

	List<OrderProduct> findByProductionPurchaseId(String purchaseId);

	Long countByProductionPurchaseId(String purchaseId);

	Long countByProductionPurchaseIdAndProcess(String purchaseId, ProductProcess process);

	void deleteByProductionPurchaseId(String purchaseId);
}
