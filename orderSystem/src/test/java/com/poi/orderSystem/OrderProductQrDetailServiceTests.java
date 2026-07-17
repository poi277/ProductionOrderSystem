package com.poi.orderSystem;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.ProductQrDetailResponse;
import com.poi.orderSystem.features.Order.product.OrderProductService;
import com.poi.orderSystem.features.Order.product.ProductQrNotFoundException;
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

@ExtendWith(MockitoExtension.class)
class OrderProductQrDetailServiceTests {

	@Mock OrderProductRepository productRepository;
	@Mock OrderProductionRepository productionRepository;
	@Mock OrderPurchaseRepository purchaseRepository;
	@Mock OrderProductProcessHistoryRepository processHistoryRepository;
	@Mock OrderPurChaseService purchaseService;
	@InjectMocks OrderProductService service;

	@Test
	void processChangeCreatesHistoryForTheCompletedPreviousProcess() {
		OrderProduct product = currentProduct(ProcessStatus.ASSEMBLY);
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1")).thenReturn(Optional.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L)).thenReturn(List.of(product));

		service.updateProductProcess("QR-1", request(ProcessStatus.TEST, false));

		ArgumentCaptor<OrderProductProcessHistory> captor = ArgumentCaptor.forClass(OrderProductProcessHistory.class);
		verify(processHistoryRepository).save(captor.capture());
		assertThat(captor.getValue().getProcess()).isEqualTo(ProcessStatus.TEST);
		assertThat(product.getProcess()).isEqualTo(ProcessStatus.TEST);
	}

	@Test
	void sameProcessDoesNotCreateHistory() {
		OrderProduct product = currentProduct(ProcessStatus.TEST);
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1")).thenReturn(Optional.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L)).thenReturn(List.of(product));

		service.updateProductProcess("QR-1", request(ProcessStatus.TEST, true));

		verify(processHistoryRepository, never()).save(any());
		assertThat(product.isDefect()).isTrue();
	}

	@Test
	void productChangeUpdatesPurchaseToSlowestProductProcess() {
		OrderProduct changedProduct = currentProduct(ProcessStatus.ASSEMBLY);
		OrderProduct laterProduct = currentProduct(ProcessStatus.FINAL_INSPECTION);
		laterProduct.setProductQr("QR-2");
		OrderPurchase purchase = changedProduct.getProduction().getPurchase();
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1"))
				.thenReturn(Optional.of(changedProduct));
		when(productRepository.findByProduction_Purchase_Id(1L))
				.thenReturn(List.of(changedProduct, laterProduct));
		when(purchaseRepository.findById(1L)).thenReturn(Optional.of(purchase));

		service.updateProductProcess("QR-1", request(ProcessStatus.TEST, false));

		assertThat(changedProduct.getProcess()).isEqualTo(ProcessStatus.TEST);
		assertThat(purchase.getStatus()).isEqualTo(ProcessStatus.TEST);
		verify(purchaseRepository).save(purchase);
	}

	@Test
	void reworkToEarlierStepPreservesRepeatedProcessRows() {
		OrderProduct product = currentProduct(ProcessStatus.ASSEMBLY);
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1")).thenReturn(Optional.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L)).thenReturn(List.of(product));

		service.updateProductProcess("QR-1", request(ProcessStatus.TEST, false));
		service.updateProductProcess("QR-1", request(ProcessStatus.ASSEMBLY, true));
		service.updateProductProcess("QR-1", request(ProcessStatus.TEST, false));

		ArgumentCaptor<OrderProductProcessHistory> captor = ArgumentCaptor.forClass(OrderProductProcessHistory.class);
		verify(processHistoryRepository, org.mockito.Mockito.times(3)).save(captor.capture());
		assertThat(captor.getAllValues()).extracting(OrderProductProcessHistory::getProcess)
				.containsExactly(ProcessStatus.TEST, ProcessStatus.ASSEMBLY, ProcessStatus.TEST);
	}

	@Test
	void shipmentKeepsIndependentHistoriesAfterProductDeletion() {
		OrderProduct product = currentProduct(ProcessStatus.PACKAGING);
		OrderProduction production = product.getProduction();
		OrderPurchase purchase = production.getPurchase();
		purchase.setId(1L);
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1")).thenReturn(Optional.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L)).thenReturn(List.of(product));
		when(purchaseRepository.findById(1L)).thenReturn(Optional.of(purchase));
		service.completeShipment("QR-1");

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<OrderProductProcessHistory>> processCaptor = ArgumentCaptor.forClass(List.class);
		verify(processHistoryRepository).saveAll(processCaptor.capture());
		assertThat(processCaptor.getValue()).extracting(OrderProductProcessHistory::getProcess)
				.containsExactly(ProcessStatus.PACKAGING, ProcessStatus.SHIPPED);
		assertThat(product.getProcess()).isEqualTo(ProcessStatus.SHIPPED);
		assertThat(purchase.getStatus()).isEqualTo(ProcessStatus.SHIPPED);
	}

	@Test
	void repeatedShipmentRequestDoesNotDuplicatePackagingHistory() {
		OrderProduct product = currentProduct(ProcessStatus.PACKAGING);
		OrderPurchase purchase = product.getProduction().getPurchase();
		when(productRepository.findByProductQrWithProductionAndPurchase("QR-1"))
				.thenReturn(Optional.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L))
				.thenReturn(List.of(product));
		when(purchaseRepository.findById(1L)).thenReturn(Optional.of(purchase));

		service.completeShipment("QR-1");
		service.completeShipment("QR-1");

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<OrderProductProcessHistory>> captor = ArgumentCaptor.forClass(List.class);
		verify(processHistoryRepository, org.mockito.Mockito.times(1)).saveAll(captor.capture());
		assertThat(captor.getValue()).extracting(OrderProductProcessHistory::getProcess)
				.containsExactly(ProcessStatus.PACKAGING, ProcessStatus.SHIPPED);
		assertThat(product.getProcess()).isEqualTo(ProcessStatus.SHIPPED);
	}

	@Test
	void bulkShipmentCollectsHistoriesAndIgnoresDuplicateQr() {
		OrderProduct product = currentProduct(ProcessStatus.PACKAGING);
		OrderPurchase purchase = product.getProduction().getPurchase();
		when(productRepository.findAllByProductQrInWithProductionAndPurchase(List.of("QR-1", "QR-1")))
				.thenReturn(List.of(product));
		when(productRepository.findByProduction_Purchase_Id(1L))
				.thenReturn(List.of(product));
		when(purchaseRepository.findById(1L)).thenReturn(Optional.of(purchase));

		service.completeShipments(List.of("QR-1", "QR-1"));

		@SuppressWarnings("unchecked")
		ArgumentCaptor<List<OrderProductProcessHistory>> captor = ArgumentCaptor.forClass(List.class);
		verify(processHistoryRepository).saveAll(captor.capture());
		assertThat(captor.getValue()).extracting(OrderProductProcessHistory::getProcess)
				.containsExactly(ProcessStatus.PACKAGING, ProcessStatus.SHIPPED);
		assertThat(product.getProcess()).isEqualTo(ProcessStatus.SHIPPED);
	}

	@Test
	void currentQrDetailContainsPurchaseProductionAndHistories() {
		OrderProduct product = currentProduct(ProcessStatus.FINAL_INSPECTION);
		OrderProductProcessHistory history = history(1L, ProcessStatus.TEST);
		when(processHistoryRepository.findAllByProductQrOrderByCompletedTimeAscIdAsc("QR-1")).thenReturn(List.of(history));
		when(productRepository.findQrDetailByProductQr("QR-1")).thenReturn(Optional.of(product));

		ProductQrDetailResponse detail = service.findProductQrDetail(" QR-1 ");

		assertThat(detail.getPurchaseId()).isEqualTo("PO-1");
		assertThat(detail.getCustomer()).isEqualTo("고객사");
		assertThat(detail.getLot()).isEqualTo("LOT-1");
		assertThat(detail.getProcessHistories()).hasSize(1);
	}

	@Test
	void shippedQrDetailUsesArchivedProductAndHistories() {
		OrderProduct shippedProduct = currentProduct(ProcessStatus.SHIPPED);
		when(productRepository.findQrDetailByProductQr("QR-1")).thenReturn(Optional.of(shippedProduct));
		when(processHistoryRepository.findAllByProductQrOrderByCompletedTimeAscIdAsc("QR-1"))
				.thenReturn(List.of(history(1L, ProcessStatus.PACKAGING)));

		ProductQrDetailResponse detail = service.findProductQrDetail("QR-1");

		assertThat(detail.getCurrentProcess()).isEqualTo(ProcessStatus.SHIPPED);
		assertThat(detail.getCustomer()).isEqualTo("고객사");
		assertThat(detail.getLot()).isEqualTo("LOT-1");
		assertThat(detail.getProcessHistories()).hasSize(1);
	}

	@Test
	void missingQrThrowsNotFoundException() {
		when(productRepository.findQrDetailByProductQr("MISSING")).thenReturn(Optional.empty());
		when(processHistoryRepository.findAllByProductQrOrderByCompletedTimeAscIdAsc("MISSING")).thenReturn(List.of());

		assertThatThrownBy(() -> service.findProductQrDetail("MISSING"))
				.isInstanceOf(ProductQrNotFoundException.class);
	}

	private OrderProduct currentProduct(ProcessStatus process) {
		OrderPurchase purchase = new OrderPurchase();
		purchase.setId(1L);
		purchase.setPurchaseId("PO-1");
		purchase.setCustomer("고객사");
		purchase.setProductName("제품");
		purchase.setQuantity(1);
		OrderProduction production = new OrderProduction();
		production.setId(10L);
		production.setPurchase(purchase);
		production.setLot("LOT-1");
		OrderProduct product = new OrderProduct();
		product.setProductQr("QR-1");
		product.setProduction(production);
		product.setProcess(process);
		product.setCreatedTime(LocalDateTime.of(2026, 7, 16, 9, 0));
		return product;
	}

	private OrderProductProcessRequest request(ProcessStatus process, boolean defect) {
		OrderProductProcessRequest request = new OrderProductProcessRequest();
		request.setProcessName(process);
		request.setIsDefect(defect);
		return request;
	}

	private OrderProductProcessHistory history(Long id, ProcessStatus process) {
		OrderProductProcessHistory history = new OrderProductProcessHistory();
		history.setId(id);
		history.setProductQr("QR-1");
		history.setPurchaseId("PO-1");
		history.setProcess(process);
		history.setCompletedTime(LocalDateTime.now());
		return history;
	}
}
