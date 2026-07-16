package com.poi.orderSystem.features.repository;

import java.util.List;
import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.poi.orderSystem.features.entity.OrderProductProcessHistory;

public interface OrderProductProcessHistoryRepository
		extends JpaRepository<OrderProductProcessHistory, Long> {

	List<OrderProductProcessHistory> findAllByProductQrOrderByCompletedTimeAscIdAsc(String productQr);

	List<OrderProductProcessHistory> findAllByPurchaseIdOrderByCompletedTimeAscIdAsc(String purchaseId);

	@Query("""
			select history.purchaseId, history.process, max(history.completedTime)
			from OrderProductProcessHistory history
			where history.purchaseId in :purchaseIds
			group by history.purchaseId, history.process
			""")
	List<Object[]> findLatestCompletedTimesByPurchaseIds(@Param("purchaseIds") Collection<String> purchaseIds);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.purchaseId = :purchaseId")
	int deleteAllByPurchaseId(@Param("purchaseId") String purchaseId);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.productQr = :productQr")
	int deleteAllByProductQr(@Param("productQr") String productQr);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.productQr in :productQrs")
	int deleteAllByProductQrIn(@Param("productQrs") Collection<String> productQrs);
}
