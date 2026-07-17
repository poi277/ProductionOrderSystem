package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
			where production.purchase.status not in :excludedStatuses
			order by product.createdTime desc
			""")
	List<OrderProduct> findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc(
			@Param("excludedStatuses") List<ProcessStatus> excludedStatuses);

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

	@Query("""
			select product
			from OrderProduct product
			join fetch product.production production
			join fetch production.purchase purchase
			where purchase.status = :status
			order by product.createdTime desc
			""")
	List<OrderProduct> findByPurchaseStatusWithProductionAndPurchaseOrderByCreatedTimeDesc(
			@Param("status") ProcessStatus status);

	List<OrderProduct> findByProduction_Purchase_Id(Long purchaseDbId);

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
			join fetch production.purchase purchase
			where product.productQr = :productQr
			""")
	Optional<OrderProduct> findQrDetailByProductQr(@Param("productQr") String productQr);

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
			where production.purchase.id = :purchaseDbId
			order by product.createdTime desc
			""")
	List<OrderProduct> findByPurchaseDbIdWithProductionAndPurchase(@Param("purchaseDbId") Long purchaseDbId);

	Long countByProduction_Purchase_Id(Long purchaseDbId);

	Long countByProduction_Purchase_IdAndProcess(Long purchaseDbId, ProcessStatus process);

	@Query("select product.productQr from OrderProduct product where product.production.id = :productionId")
	List<String> findProductQrsByProductionId(@Param("productionId") Long productionId);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProduct product where product.production.id = :productionId")
	int deleteAllByProductionId(@Param("productionId") Long productionId);

}
