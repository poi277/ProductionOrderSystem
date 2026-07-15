package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

public interface OrderProductRepository extends JpaRepository<OrderProduct, String> {

	List<OrderProduct> findAllByOrderByCreatedTimeDesc();

	List<OrderProduct> findByProcessOrderByCreatedTimeDesc(ProcessStatus process);

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
	List<OrderProduct> findByProcessWithProductionAndPurchaseOrderByCreatedTimeDesc(
			@Param("process") ProcessStatus process);

	@Query("""
			    select p
			    from OrderProduct p
			    left join fetch p.production pr
			    left join fetch pr.purchase
			    where p.process in :process
			    order by p.createdTime desc
			""")
	List<OrderProduct> findByProcessInWithProductionAndPurchaseOrderByCreatedTimeDesc(
			@Param("process") List<ProcessStatus> processes);

	List<OrderProduct> findByProductionPurchasePurchaseId(String purchaseId);

	@Query("""
			select product
			from OrderProduct product
			join fetch product.production production
			join fetch production.purchase
			where product.productQr = :productQr
			""")
	Optional<OrderProduct> findByProductQrWithProductionAndPurchase(@Param("productQr") String productQr);

	@Query("""
			select product
			from OrderProduct product
			join fetch product.production production
			join fetch production.purchase
			where product.productQr in :productQrs
			""")
	List<OrderProduct> findAllByProductQrInWithProductionAndPurchase(
			@Param("productQrs") List<String> productQrs);

	@Query("""
			select product
			from OrderProduct product
			join fetch product.production production
			join fetch production.purchase
			where production.purchase.purchaseId = :purchaseId
			order by product.createdTime desc
			""")
	List<OrderProduct> findByPurchaseIdWithProductionAndPurchase(@Param("purchaseId") String purchaseId);

	Long countByProductionPurchasePurchaseId(String purchaseId);

	Long countByProductionPurchasePurchaseIdAndProcess(String purchaseId, ProcessStatus process);

	void deleteByProductionPurchasePurchaseId(String purchaseId);
}
