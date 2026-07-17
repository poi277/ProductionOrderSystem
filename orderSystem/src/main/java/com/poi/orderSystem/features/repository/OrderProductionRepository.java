package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poi.orderSystem.features.entity.OrderProduction;

public interface OrderProductionRepository extends JpaRepository<OrderProduction, Long> {

	Optional<OrderProduction> findByPurchase_Id(Long purchaseDbId);

	boolean existsByPurchase_Id(Long purchaseOrderId);

	List<OrderProduction> findAllByOrderByCreatedTimeDesc();

	@Query("""
			select distinct production
			from OrderProduction production
			left join fetch production.purchase
			left join fetch production.products
			where production.purchase.status not in :excludedStatuses
			order by production.createdTime desc
			""")
	List<OrderProduction> findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc(
			@Param("excludedStatuses") List<com.poi.orderSystem.features.util.EnumUtil.ProcessStatus> excludedStatuses);

	@Query("""
			select distinct production
			from OrderProduction production
			left join fetch production.purchase
			left join fetch production.products
			where production.purchase.id = :purchaseDbId
			""")
	Optional<OrderProduction> findByPurchaseDbIdWithPurchaseAndProducts(@Param("purchaseDbId") Long purchaseDbId);

	@Query("""
			select distinct production
			from OrderProduction production
			left join fetch production.purchase
			left join fetch production.products
			where production.id = :id
			""")
	Optional<OrderProduction> findByIdWithPurchaseAndProducts(@Param("id") Long id);
}
