package com.poi.orderSystem;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestConstructor;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.Order.product.OrderProductService;
import com.poi.orderSystem.features.Order.production.OrderProductionService;
import com.poi.orderSystem.features.Order.purChase.OrderPurChaseService;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProductProcessHistory;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductProcessHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;

@SpringBootTest
@Transactional
@RequiredArgsConstructor
@TestConstructor(autowireMode = TestConstructor.AutowireMode.ALL)
class DeletionPersistenceIntegrationTests {

	private final OrderPurChaseService purchaseService;
	private final OrderProductionService productionService;
	private final OrderProductService productService;
	private final OrderPurchaseRepository purchaseRepository;
	private final OrderProductionRepository productionRepository;
	private final OrderProductRepository productRepository;
	private final OrderProductProcessHistoryRepository historyRepository;
	private final EntityManager entityManager;

	@Test
	void purchaseDeleteRemovesAllConnectedRowsAndClearsPersistenceContext() {
		Fixture fixture = fixture(2);

		purchaseService.deletePurchase(fixture.purchase().getId());
		entityManager.flush();
		entityManager.clear();

		assertDeletedFixture(fixture);
	}

	@Test
	void productionDeleteAlsoRemovesConnectedPurchase() {
		Fixture fixture = fixture(2);

		productionService.deleteProduction(fixture.production().getId());
		entityManager.flush();
		entityManager.clear();

		assertDeletedFixture(fixture);
	}

	@Test
	void singleProductDeleteKeepsSiblingProductionAndPurchase() {
		Fixture fixture = fixture(2);
		String deletedQr = fixture.productQrs().get(0);
		String remainingQr = fixture.productQrs().get(1);

		productService.cancelProduct(deletedQr);
		entityManager.flush();
		entityManager.clear();

		assertThat(historyRepository.findAllByProductQrOrderByCompletedTimeAscIdAsc(deletedQr)).isEmpty();
		assertThat(productRepository.findById(deletedQr)).isEmpty();
		assertThat(productRepository.findById(remainingQr)).isPresent();
		assertThat(productionRepository.findById(fixture.production().getId())).isPresent();
		assertThat(purchaseRepository.findById(fixture.purchase().getId())).isPresent();
	}

	private void assertDeletedFixture(Fixture fixture) {
		for (String productQr : fixture.productQrs()) {
			assertThat(historyRepository.findAllByProductQrOrderByCompletedTimeAscIdAsc(productQr)).isEmpty();
			assertThat(productRepository.findById(productQr)).isEmpty();
		}
		assertThat(productionRepository.findById(fixture.production().getId())).isEmpty();
		assertThat(purchaseRepository.findById(fixture.purchase().getId())).isEmpty();
	}

	private Fixture fixture(int productCount) {
		String suffix = UUID.randomUUID().toString().substring(0, 8);
		OrderPurchase purchase = new OrderPurchase();
		purchase.setPurchaseId("DELETE-" + suffix);
		purchase.setQuantity(productCount);
		purchase.setStatus(ProcessStatus.PACKAGING);
		purchaseRepository.saveAndFlush(purchase);

		OrderProduction production = new OrderProduction();
		production.setPurchase(purchase);
		production.setLot("LOT-" + suffix);
		production.setProductQrQuantity(productCount);
		productionRepository.saveAndFlush(production);

		List<String> productQrs = java.util.stream.IntStream.rangeClosed(1, productCount)
				.mapToObj(index -> "DELETE-QR-" + suffix + "-" + index).toList();
		for (String productQr : productQrs) {
			OrderProduct product = new OrderProduct();
			product.setProductQr(productQr);
			product.setProduction(production);
			product.setProcess(ProcessStatus.PACKAGING);
			productRepository.save(product);

			OrderProductProcessHistory history = new OrderProductProcessHistory();
			history.setProductQr(productQr);
			history.setPurchaseId(purchase.getPurchaseId());
			history.setProcess(ProcessStatus.TEST);
			historyRepository.save(history);
		}
		entityManager.flush();
		entityManager.clear();
		return new Fixture(
				purchaseRepository.findById(purchase.getId()).orElseThrow(),
				productionRepository.findById(production.getId()).orElseThrow(),
				productQrs);
	}

	private record Fixture(OrderPurchase purchase, OrderProduction production, List<String> productQrs) {}
}
