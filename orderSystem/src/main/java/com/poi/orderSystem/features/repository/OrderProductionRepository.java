package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poi.orderSystem.features.entity.OrderProduction;

public interface OrderProductionRepository extends JpaRepository<OrderProduction, String> {

	List<OrderProduction> findAllByOrderByCreatedTimeDesc();

	@Query("""
			select distinct production
			from OrderProduction production
			left join fetch production.purchase
			left join fetch production.products
			order by production.createdTime desc
			""")
	List<OrderProduction> findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc();

	@Query("""
			select distinct production
			from OrderProduction production
			left join fetch production.purchase
			left join fetch production.products
			where production.purchaseId = :purchaseId
			""")
	Optional<OrderProduction> findByPurchaseIdWithPurchaseAndProducts(@Param("purchaseId") String purchaseId);
}
