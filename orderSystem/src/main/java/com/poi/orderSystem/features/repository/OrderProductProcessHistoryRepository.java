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

	List<OrderProductProcessHistory> findAllByPurchaseDbIdOrderByCompletedTimeAscIdAsc(Long purchaseDbId);

	@Query("""
			select history.purchaseDbId, history.process, max(history.completedTime)
			from OrderProductProcessHistory history
			where history.purchaseDbId in :purchaseDbIds
			group by history.purchaseDbId, history.process
			""")
	List<Object[]> findLatestCompletedTimesByPurchaseDbIds(@Param("purchaseDbIds") Collection<Long> purchaseDbIds);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.purchaseDbId = :purchaseDbId")
	int deleteAllByPurchaseDbId(@Param("purchaseDbId") Long purchaseDbId);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.productQr = :productQr")
	int deleteAllByProductQr(@Param("productQr") String productQr);

	@Modifying(flushAutomatically = true, clearAutomatically = true)
	@Query("delete from OrderProductProcessHistory history where history.productQr in :productQrs")
	int deleteAllByProductQrIn(@Param("productQrs") Collection<String> productQrs);
}
