package com.poi.orderSystem;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestConstructor;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.Order.product.OrderProductService;
import com.poi.orderSystem.features.Order.production.OrderProductionService;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderProductHistoryRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;

@SpringBootTest(properties = "spring.jpa.properties.hibernate.generate_statistics=true")
@Transactional
@RequiredArgsConstructor
@TestConstructor(autowireMode = TestConstructor.AutowireMode.ALL)
class OrderProductNormalizationIntegrationTests {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductHistoryRepository orderProductHistoryRepository;
	private final OrderProductionService orderProductionService;
	private final OrderProductService orderProductService;
	private final EntityManager entityManager;
	private final EntityManagerFactory entityManagerFactory;

	@Test
	void existingProductLotsAreUniformPerProduction() {
		Number legacyLotColumns = (Number) entityManager.createNativeQuery("""
				select count(*)
				from information_schema.columns
				where table_schema = current_schema()
				  and table_name = 'order_product'
				  and column_name = 'lot'
				""").getSingleResult();

		assertThat(legacyLotColumns.longValue()).isZero();
	}

	@Test
	void createsAndReadsSevenHundredProductsWithoutNPlusOne() {
		String suffix = UUID.randomUUID().toString().substring(0, 8);
		String purchaseId = "NORMALIZE-" + suffix;
		String firstLot = "LOT-" + suffix;
		String changedLot = "LOT-CHANGED-" + suffix;

		OrderPurchase purchase = new OrderPurchase();
		purchase.setPurchaseId(purchaseId);
		purchase.setCustomer("customer-before");
		purchase.setProductName("product-before");
		purchase.setQuantity(700);
		purchase.setStatus(ProcessStatus.PURCHASESUBMIT);
		orderPurchaseRepository.saveAndFlush(purchase);

		OrderProductionRequest createRequest = productionRequest(purchaseId, firstLot, 700);
		Statistics statistics = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
		statistics.clear();
		long createStartedAt = System.nanoTime();
		orderProductionService.saveProduction(createRequest);
		entityManager.flush();
		long createElapsedMillis = (System.nanoTime() - createStartedAt) / 1_000_000;
		long createInsertCount = statistics.getEntityInsertCount();
		long createPreparedStatementCount = statistics.getPrepareStatementCount();
		System.out.printf("PERF create700Ms=%d inserts=%d preparedStatements=%d%n",
				createElapsedMillis, createInsertCount, createPreparedStatementCount);
		assertThat(createInsertCount).isEqualTo(701L);
		entityManager.clear();

		OrderProduction production = orderProductionRepository.findByPurchasePurchaseId(purchaseId).orElseThrow();
		assertThat(production.getProductQrQuantity()).isEqualTo(700);
		assertThat(production.getLot()).isEqualTo(firstLot);
		assertThat(orderProductService.findProduct(firstLot + "-700")).isNotNull();

		OrderProductProcessRequest productUpdate = new OrderProductProcessRequest();
		productUpdate.setProcessName(ProcessStatus.TEST);
		productUpdate.setIsDefect(true);
		OrderProductProcessResponse updatedProduct = orderProductService.updateProductProcess(firstLot + "-1", productUpdate);
		assertThat(updatedProduct.getProcess()).isEqualTo(ProcessStatus.TEST);
		assertThat(updatedProduct.getIsDefect()).isTrue();

		OrderPurchase changedPurchase = orderPurchaseRepository.findByPurchaseId(purchaseId).orElseThrow();
		changedPurchase.setCustomer("customer-after");
		changedPurchase.setProductName("product-after");
		orderPurchaseRepository.save(changedPurchase);

		OrderProductionRequest updateRequest = productionRequest(purchaseId, changedLot, 700);
		orderProductionService.updateProduction(production.getId(), updateRequest);
		entityManager.flush();
		entityManager.clear();

		statistics.clear();
		long noChangeStartedAt = System.nanoTime();
		orderProductionService.updateProduction(production.getId(), updateRequest);
		entityManager.flush();
		long noChangeElapsedMillis = (System.nanoTime() - noChangeStartedAt) / 1_000_000;
		System.out.printf("PERF updateSame700Ms=%d inserts=%d updates=%d deletes=%d preparedStatements=%d%n",
				noChangeElapsedMillis,
				statistics.getEntityInsertCount(),
				statistics.getEntityUpdateCount(),
				statistics.getEntityDeleteCount(),
				statistics.getPrepareStatementCount());
		assertThat(statistics.getEntityInsertCount()).isZero();
		assertThat(statistics.getEntityUpdateCount()).isZero();
		assertThat(statistics.getEntityDeleteCount()).isZero();
		entityManager.clear();

		OrderProductProcessResponse relationBasedResponse = orderProductService.findProduct(changedLot + "-1");
		assertThat(relationBasedResponse.getCustomer()).isEqualTo("customer-after");
		assertThat(relationBasedResponse.getProductName()).isEqualTo("product-after");
		assertThat(relationBasedResponse.getLot()).isEqualTo(changedLot);
		assertThat(relationBasedResponse.getProcess()).isEqualTo(ProcessStatus.TEST);
		assertThat(relationBasedResponse.getIsDefect()).isTrue();

		statistics.clear();
		List<OrderProductProcessResponse> products = orderProductService.findProducts();
		long selectCount = statistics.getPrepareStatementCount();

		assertThat(products.stream().filter(product -> purchaseId.equals(product.getProductionId())).count())
				.isEqualTo(700);
		assertThat(selectCount).isEqualTo(1L);

		List<String> productQrs = IntStream.rangeClosed(1, 700)
				.mapToObj(index -> changedLot + "-" + index)
				.toList();
		statistics.clear();
		long historyStartedAt = System.nanoTime();
		assertThat(orderProductService.completeShipments(productQrs)).hasSize(700);
		entityManager.flush();
		long historyElapsedMillis = (System.nanoTime() - historyStartedAt) / 1_000_000;
		long historyQueryCount = statistics.getQueryExecutionCount();
		System.out.printf("PERF completeAndHistory700Ms=%d queryExecutions=%d preparedStatements=%d historyInserts=%d%n",
				historyElapsedMillis,
				historyQueryCount,
				statistics.getPrepareStatementCount(),
				statistics.getEntityInsertCount());
		assertThat(historyQueryCount).isLessThanOrEqualTo(10L);
		assertThat(orderProductHistoryRepository.findByPurchaseIdOrderByCreatedTimeDesc(purchaseId)).hasSize(700);
	}

	private OrderProductionRequest productionRequest(String purchaseId, String lot, int quantity) {
		OrderProductionRequest request = new OrderProductionRequest();
		request.setPurchaseId(purchaseId);
		request.setLot(lot);
		request.setProductionQuantity(quantity);
		return request;
	}
}
