package com.poi.orderSystem;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.Order.product.OrderProductService;
import com.poi.orderSystem.features.Order.production.OrderProductionService;
import com.poi.orderSystem.features.Order.purChase.OrderPurChaseService;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductProcessHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

@ExtendWith(MockitoExtension.class)
class WorkflowPolicyServiceTests {

	@Mock OrderPurchaseRepository purchaseRepository;
	@Mock OrderProductionRepository productionRepository;
	@Mock OrderProductRepository productRepository;
	@Mock OrderProductProcessHistoryRepository processHistoryRepository;
	@InjectMocks OrderPurChaseService purchaseService;
	@InjectMocks OrderProductionService productionService;
	@InjectMocks OrderProductService productService;

	@Test
	void newPurchaseAlwaysStartsAsPurchaseSubmit() {
		OrderPurchaseRequest request = new OrderPurchaseRequest();
		request.setPurchaseId("PO-1");
		request.setQuantity(1);
		when(purchaseRepository.save(org.mockito.ArgumentMatchers.any())).thenAnswer(invocation -> invocation.getArgument(0));

		assertThat(purchaseService.savePurchase(request).getStatus()).isEqualTo(ProcessStatus.PURCHASESUBMIT);
	}

	@Test
	void dashboardExcludesWaitingAndCancelInRepositoryCall() {
		purchaseService.findDashboardOrders();
		verify(purchaseRepository).findAllByStatusNotInOrderByCreatedTimeDesc(
				List.of(ProcessStatus.SHIPPED, ProcessStatus.CANCEL));
	}

	@Test
	void purchaseReceptionReadsOnlyPurchaseSubmit() {
		purchaseService.findPurchases();
		verify(purchaseRepository).findAllByStatusOrderByCreatedTimeDesc(ProcessStatus.PURCHASESUBMIT);
	}

	@Test
	void productionAndProcessPagesUseTheirOwnRepositoryExclusions() {
		productionService.findProductions();
		verify(productionRepository).findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc(
				List.of(ProcessStatus.SHIPPED, ProcessStatus.CANCEL));

		productionService.findProductProcesses();
		verify(productionRepository).findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc(
				List.of(ProcessStatus.PURCHASESUBMIT, ProcessStatus.SHIPPED, ProcessStatus.CANCEL));
	}

	@Test
	void shipmentPageReadsOnlyPackagingProducts() {
		productService.findShipments();
		verify(productRepository).findByProcessWithProductionAndPurchaseOrderByCreatedTimeDesc(
				ProcessStatus.PACKAGING);
	}

	@Test
	void purchaseHistoryReadsEveryCurrentPurchase() {
		purchaseService.findAllPurchaseHistories();
		verify(purchaseRepository).findAllByOrderByCreatedTimeDescIdDesc();
	}

	@Test
	void productDeleteRemovesOnlyItsHistoriesAndProduct() {
		OrderProduct product = new OrderProduct();
		product.setProductQr("QR-1");
		when(productRepository.findById("QR-1")).thenReturn(Optional.of(product));
		when(processHistoryRepository.deleteAllByProductQr("QR-1")).thenReturn(3);

		var result = productService.cancelProduct("QR-1");

		InOrder order = inOrder(processHistoryRepository, productRepository);
		order.verify(processHistoryRepository).deleteAllByProductQr("QR-1");
		order.verify(productRepository).deleteById("QR-1");
		assertThat(result).containsEntry("deletedProcessHistories", 3).containsEntry("deletedProducts", 1);
	}

	@Test
	void productionDeleteRemovesChildrenThenOneToOnePurchase() {
		OrderPurchase purchase = new OrderPurchase();
		purchase.setId(1L);
		purchase.setPurchaseId("PO-1");
		OrderProduction production = new OrderProduction();
		production.setId(10L);
		production.setPurchase(purchase);
		when(productionRepository.findById(10L)).thenReturn(Optional.of(production));
		when(productRepository.findProductQrsByProductionId(10L)).thenReturn(List.of("QR-1", "QR-2"));
		when(processHistoryRepository.deleteAllByProductQrIn(List.of("QR-1", "QR-2"))).thenReturn(4);
		when(productRepository.deleteAllByProductionId(10L)).thenReturn(2);

		var result = productionService.deleteProduction(10L);

		InOrder order = inOrder(processHistoryRepository, productRepository, productionRepository, purchaseRepository);
		order.verify(processHistoryRepository).deleteAllByProductQrIn(List.of("QR-1", "QR-2"));
		order.verify(productRepository).deleteAllByProductionId(10L);
		order.verify(productionRepository).deleteById(10L);
		order.verify(purchaseRepository).deleteById(1L);
		assertThat(result).containsEntry("deletedProducts", 2).containsEntry("deletedPurchases", 1);
	}
}
