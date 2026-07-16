package com.poi.orderSystem.features.Order.product;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderLabelResponse;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderShipmentResponse;
import com.poi.orderSystem.features.DTO.ProductProcessHistoryResponse;
import com.poi.orderSystem.features.DTO.ProductQrDetailResponse;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProductProcessHistory;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.repository.OrderProductProcessHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class OrderProductService {
	private static final Set<ProcessStatus> EDITABLE_PROCESSES = EnumSet.of(
			ProcessStatus.INSTRUCTION, ProcessStatus.ASSEMBLY, ProcessStatus.TEST,
			ProcessStatus.FINAL_INSPECTION, ProcessStatus.PACKAGING);

	private final OrderProductRepository orderProductRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductProcessHistoryRepository orderProductProcessHistoryRepository;

	@Transactional
	public OrderProductProcessResponse updateProductProcess(String productQr, OrderProductProcessRequest request) {
		validateEditableProcess(request.getProcessName());
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);
		if (product == null) {
			return null;
		}

		applyProductProcessRequest(product, request);

		syncPurchaseStatusByProducts(product);

		return OrderProductProcessResponse.from(product);
	}

	@Transactional
	public List<OrderProductProcessResponse> updateProductProcessesByProduction(
			String purchaseId,
			OrderProductProcessRequest request
	) {
		List<OrderProduct> products = orderProductRepository.findByPurchaseIdWithProductionAndPurchase(purchaseId);

		if (request.getProcessName() == null) {
			throw new IllegalArgumentException("변경할 공정 상태가 필요합니다.");
		}
		validateEditableProcess(request.getProcessName());

		for (OrderProduct product : products) {
			changeProductProcessWithHistory(
					product, request.getProcessName(), product.isDefect(),
					orderProductProcessHistoryRepository::save);
		}

		updatePurchaseStatus(purchaseId, request.getProcessName());

		return products.stream().map(OrderProductProcessResponse::from).toList();
	}

	@Transactional(readOnly = true)
	public List<OrderProductProcessResponse> findProducts() {
		return orderProductRepository.findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc(
				List.of(ProcessStatus.PURCHASESUBMIT, ProcessStatus.SHIPPED, ProcessStatus.CANCEL)).stream()
				.map(OrderProductProcessResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderProductProcessResponse findProduct(String productQr) {
		return orderProductRepository.findByProductQrWithProductionAndPurchase(productQr)
				.map(OrderProductProcessResponse::from).orElse(null);
	}

	@Transactional(readOnly = true)
	public ProductQrDetailResponse findProductQrDetail(String productQr) {
		String normalizedQr = productQr == null ? "" : productQr.trim();
		List<ProductProcessHistoryResponse> histories = orderProductProcessHistoryRepository
				.findAllByProductQrOrderByCompletedTimeAscIdAsc(normalizedQr).stream()
				.map(ProductProcessHistoryResponse::from)
				.toList();

		return orderProductRepository.findQrDetailByProductQr(normalizedQr)
				.map(product -> ProductQrDetailResponse.builder()
						.productQr(product.getProductQr())
						.purchaseId(product.getProduction().getPurchaseId())
						.customer(product.getProduction().getPurchase().getCustomer())
						.productName(product.getProduction().getPurchase().getProductName())
						.lot(product.getProduction().getLot())
						.currentProcess(product.getProcess())
						.defect(product.isDefect())
						.createdTime(product.getCreatedTime())
						.processHistories(histories)
						.build())
				.orElseThrow(() -> new ProductQrNotFoundException(normalizedQr));
	}

	@Transactional(readOnly = true)
	public List<OrderShipmentResponse> findShipments() {
		return new ArrayList<>(orderProductRepository
				.findByProcessWithProductionAndPurchaseOrderByCreatedTimeDesc(ProcessStatus.PACKAGING)
				.stream()
				.collect(java.util.stream.Collectors.groupingBy(
						product -> product.getProduction().getPurchaseId(),
						java.util.LinkedHashMap::new,
						java.util.stream.Collectors.toList()))
				.values()).stream()
				.map(OrderShipmentResponse::from)
				.toList();
	}

	@Transactional
	public OrderShipmentResponse completeShipment(String productQr) {
		OrderProduct product = orderProductRepository.findByProductQrWithProductionAndPurchase(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		if (product.getProcess() != ProcessStatus.SHIPPED) {
			List<OrderProductProcessHistory> shipmentHistories = new ArrayList<>();
			OrderProductProcessHistory packagingHistory = createCompletedProcessHistory(
					product, product.getProcess(), product.isDefect());
			if (packagingHistory != null) shipmentHistories.add(packagingHistory);
			changeProductProcessWithHistory(
					product, ProcessStatus.SHIPPED, product.isDefect(),
					shipmentHistories::add);
			orderProductProcessHistoryRepository.saveAll(shipmentHistories);
		}
		syncPurchaseStatusByProducts(product);

		OrderShipmentResponse response = OrderShipmentResponse.from(product);

		return response;
	}

	@Transactional
	public List<OrderShipmentResponse> completeShipments(List<String> productQrs) {
		List<OrderProduct> completedProducts = new ArrayList<>();
		List<OrderProductProcessHistory> completedProcessHistories = new ArrayList<>();
		Set<String> purchaseIds = new LinkedHashSet<>();
		Map<String, OrderProduct> productsByQr = new HashMap<>();
		orderProductRepository.findAllByProductQrInWithProductionAndPurchase(productQrs)
				.forEach(product -> productsByQr.put(product.getProductQr(), product));

		for (String productQr : productQrs) {
			OrderProduct product = productsByQr.get(productQr);

			if (product == null) {
				continue;
			}

			if (product.getProcess() != ProcessStatus.SHIPPED) {
				OrderProductProcessHistory packagingHistory = createCompletedProcessHistory(
						product, product.getProcess(), product.isDefect());
				if (packagingHistory != null) completedProcessHistories.add(packagingHistory);
				changeProductProcessWithHistory(
						product, ProcessStatus.SHIPPED, product.isDefect(),
						completedProcessHistories::add);
			}
			OrderProduction production = product.getProduction();

			completedProducts.add(product);

			if (production != null && hasText(production.getPurchaseId())) {
				purchaseIds.add(production.getPurchaseId());
			}
		}
		if (!completedProcessHistories.isEmpty()) {
			orderProductProcessHistoryRepository.saveAll(completedProcessHistories);
		}
		if (!completedProducts.isEmpty()) {
			orderProductRepository.saveAll(completedProducts);
		}

		purchaseIds.forEach(this::syncPurchaseStatusByPurchaseId);

		List<OrderShipmentResponse> responses = completedProducts.stream()
				.map(OrderShipmentResponse::from).toList();

		return responses;
	}

	@Transactional(readOnly = true)
	public List<OrderLabelResponse> findLabels() {
		return orderProductRepository.findAllWithProductionAndPurchaseByOrderByCreatedTimeDesc(
				List.of(ProcessStatus.PURCHASESUBMIT, ProcessStatus.SHIPPED, ProcessStatus.CANCEL)).stream()
				.map(OrderLabelResponse::from)
				.toList();
	}

	@Transactional
	public Map<String, Integer> cancelProduct(String productQr) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return Map.of("deletedProcessHistories", 0, "deletedProducts", 0);
		}

		int deletedHistories = orderProductProcessHistoryRepository.deleteAllByProductQr(productQr);
		orderProductRepository.deleteById(productQr);
		return Map.of("deletedProcessHistories", deletedHistories, "deletedProducts", 1);
	}


	private void applyProductProcessRequest(OrderProduct product, OrderProductProcessRequest request) {
		if (request.getProcessName() != null && product.getProcess() != request.getProcessName()) {
			boolean defectAtCompletion = request.getIsDefect() == null
					? product.isDefect() : request.getIsDefect();
			changeProductProcessWithHistory(
					product, request.getProcessName(), defectAtCompletion,
					orderProductProcessHistoryRepository::save);
		}
		if (request.getIsDefect() != null && product.isDefect() != request.getIsDefect()) {
			product.setDefect(request.getIsDefect());
		}
	}

	private boolean changeProductProcessWithHistory(
			OrderProduct product,
			ProcessStatus nextProcess,
			boolean defectAtCompletion,
			Consumer<OrderProductProcessHistory> historyWriter
	) {
		if (nextProcess == null || product.getProcess() == nextProcess) {
			return false;
		}

		// 제품 상태가 실제로 변경되면 새 상태와 변경 시각을 공정 이력에 남긴다.
		OrderProductProcessHistory history = createCompletedProcessHistory(
				product, nextProcess, defectAtCompletion);
		if (history != null) {
			historyWriter.accept(history);
		}
		product.setProcess(nextProcess);
		return true;
	}

	private OrderProductProcessHistory createCompletedProcessHistory(
			OrderProduct product, ProcessStatus completedProcess, boolean defect) {
		if (completedProcess == null || product.getProduction() == null
				|| !hasText(product.getProduction().getPurchaseId())) {
			return null;
		}
		OrderProductProcessHistory history = new OrderProductProcessHistory();
		history.setProductQr(product.getProductQr());
		history.setPurchaseId(product.getProduction().getPurchaseId());
		history.setProcess(completedProcess);
		history.setDefect(defect);
		return history;
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}

	private void syncPurchaseStatusByProducts(OrderProduct product) {
		OrderProduction production = product.getProduction();

		if (production == null || !hasText(production.getPurchaseId())) {
			return;
		}

		syncPurchaseStatusByPurchaseId(production.getPurchaseId());
	}

	private void syncPurchaseStatusByPurchaseId(String purchaseId) {
		if (!hasText(purchaseId)) {
			return;
		}

		List<OrderProduct> products = orderProductRepository.findByProductionPurchasePurchaseId(purchaseId);

		if (products.isEmpty()) {
			updatePurchaseStatus(purchaseId, ProcessStatus.INSTRUCTION);
			return;
		}

		// 발주서 상태는 가장 빠르게 진행한 제품이 아니라, 가장 늦게 따라오는 제품의 공정을 따른다.
		ProcessStatus slowestStatus = products.stream().map(OrderProduct::getProcess)
				.filter(status -> status != null)
				.min(Comparator.comparingInt(Enum::ordinal)).orElse(ProcessStatus.INSTRUCTION);

		updatePurchaseStatus(purchaseId, slowestStatus);
	}

	private void validateEditableProcess(ProcessStatus process) {
		if (process != null && !EDITABLE_PROCESSES.contains(process)) {
			throw new IllegalArgumentException("변경할 수 없는 공정 상태입니다: " + process);
		}
	}

	private void updatePurchaseStatus(String purchaseId, ProcessStatus status) {
		if (!hasText(purchaseId) || status == null) {
			return;
		}

		orderPurchaseRepository.findByPurchaseId(purchaseId).ifPresent((purchase) -> {
			purchase.setStatus(status);
			orderPurchaseRepository.save(purchase);
		});
	}
}
