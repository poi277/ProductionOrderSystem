package com.poi.orderSystem.features.Order;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.DTO.OrderLabelResponse;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessResponse;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderProductionResponse;
import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.DTO.OrderShipmentResponse;
import com.poi.orderSystem.features.DTO.ProcessHistoryResponse;
import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.ProcessHistory;
import com.poi.orderSystem.features.repository.OrderHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.repository.ProcessHistoryRepository;
import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductRepository orderProductRepository;
	private final OrderHistoryRepository orderHistoryRepository;
	private final ProcessHistoryRepository processHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderPurchase> findPurchases() {
		return orderPurchaseRepository.findAllByOrderByCreatedTimeDesc();
	}

	@Transactional
	public OrderPurchase savePurchase(OrderPurchaseRequest request) {
		OrderPurchase purchase = new OrderPurchase();
		applyPurchaseRequest(purchase, request);

		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);

		return savedPurchase;
	}

	@Transactional
	public OrderPurchase updatePurchase(String purchaseId, OrderPurchaseRequest request) {
		String nextPurchaseId = hasText(request.getPurchaseId()) ? request.getPurchaseId() : purchaseId;
		OrderPurchase purchase = purchaseId.equals(nextPurchaseId)
				? orderPurchaseRepository.findById(purchaseId).orElseGet(OrderPurchase::new)
				: new OrderPurchase();
		applyPurchaseRequest(purchase, request);
		purchase.setPurchaseId(nextPurchaseId);

		OrderPurchase savedPurchase = orderPurchaseRepository.save(purchase);
		saveInitialProduction(savedPurchase);

		if (!purchaseId.equals(nextPurchaseId)) {
			deleteProductionIfExists(purchaseId);
			orderPurchaseRepository.deleteById(purchaseId);
		}

		return savedPurchase;
	}

	@Transactional
	public void deletePurchase(String purchaseId) {
		deleteProductionIfExists(purchaseId);
		orderPurchaseRepository.deleteById(purchaseId);
	}

	@Transactional(readOnly = true)
	public List<OrderProductionResponse> findProductions() {
		return orderProductionRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(this::toProductionResponse)
				.toList();
	}

	@Transactional
	public OrderProductionResponse saveProduction(OrderProductionRequest request) {
		OrderProduction production = orderProductionRepository.findById(request.getPurchaseId()).orElseGet(OrderProduction::new);
		applyProductionRequest(production, request);
		OrderProduction savedProduction = orderProductionRepository.save(production);

		createOrderProducts(request);
		savedProduction = orderProductionRepository.findById(savedProduction.getPurchaseId()).orElse(savedProduction);
		updatePurchaseStatus(request.getPurchaseId(), ProcessStatus.IN_PROGRESS);

		return toProductionResponse(savedProduction);
	}

	@Transactional
	public OrderProductionResponse updateProduction(String purchaseId, OrderProductionRequest request) {
		String nextPurchaseId = hasText(request.getPurchaseId()) ? request.getPurchaseId() : purchaseId;
		OrderProduction production = purchaseId.equals(nextPurchaseId)
				? orderProductionRepository.findById(purchaseId).orElseGet(OrderProduction::new)
				: new OrderProduction();
		applyProductionRequest(production, request);
		production.setPurchaseId(nextPurchaseId);

		OrderProduction savedProduction = orderProductionRepository.save(production);

		if (!purchaseId.equals(nextPurchaseId)) {
			orderProductionRepository.deleteById(purchaseId);
		}

		createOrderProducts(request);
		savedProduction = orderProductionRepository.findById(savedProduction.getPurchaseId()).orElse(savedProduction);
		updatePurchaseStatus(nextPurchaseId, ProcessStatus.IN_PROGRESS);

		return toProductionResponse(savedProduction);
	}

	@Transactional
	public void deleteProduction(String purchaseId) {
		deleteProductionIfExists(purchaseId);
	}

	@Transactional(readOnly = true)
	public List<OrderProductProcessResponse> findProductProcesses() {
		return orderProductRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderProductProcessResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<OrderShipmentResponse> findShipments() {
		return orderProductRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderShipmentResponse::from)
				.toList();
	}

	@Transactional
	public OrderProductProcessResponse updateProductProcess(String productQr, OrderProductProcessRequest request) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return null;
		}

		applyProductProcessRequest(product, request);

		return OrderProductProcessResponse.from(orderProductRepository.save(product));
	}

	@Transactional(readOnly = true)
	public List<OrderLabelResponse> findLabels() {
		return orderProductRepository.findAllByOrderByCreatedTimeDesc().stream()
				.map(OrderLabelResponse::from)
				.toList();
	}

	@Transactional
	public void cancelProduct(String productQr) {
		OrderProduct product = orderProductRepository.findById(productQr).orElse(null);

		if (product == null) {
			return;
		}

		saveCancelHistory(product);
		orderProductRepository.delete(product);
	}

	@Transactional(readOnly = true)
	public List<OrderHistory> findHistories() {
		return orderHistoryRepository.findAllByOrderByCreatedTimeDesc();
	}

	@Transactional(readOnly = true)
	public List<ProcessHistoryResponse> findProcessHistories() {
		return processHistoryRepository.findAllByOrderByCreatedTimeDesc().stream().map(this::toProcessHistoryResponse)
				.toList();
	}

	@Transactional(readOnly = true)
	public OrderHistory findHistory(Long historyId) {
		return orderHistoryRepository.findByHistoryId(historyId).orElse(null);
	}

	@Transactional
	public OrderHistory saveHistory(OrderHistoryRequest request) {
		OrderHistory history = new OrderHistory();
		applyHistoryRequest(history, request);

		return orderHistoryRepository.save(history);
	}

	@Transactional
	public OrderHistory updateHistory(Long historyId, OrderHistoryRequest request) {
		OrderHistory history = orderHistoryRepository.findById(historyId).orElseGet(OrderHistory::new);
		history.setHistoryId(historyId);
		applyHistoryRequest(history, request);

		return orderHistoryRepository.save(history);
	}

	@Transactional
	public void deleteHistory(Long historyId) {
		orderHistoryRepository.deleteById(historyId);
	}

	private void applyPurchaseRequest(OrderPurchase purchase, OrderPurchaseRequest request) {
		purchase.setPurchaseId(request.getPurchaseId());
		purchase.setCustomer(request.getCustomer());
		purchase.setProductName(request.getProductName());
		purchase.setQuantity(request.getQuantity());
		purchase.setPrice(request.getUnitPrice());
		purchase.setPurchaseDate(request.getPurchaseDate());
		purchase.setDueDate(request.getDueDate());
		purchase.setStatus(request.getStatus() == null ? ProcessStatus.WAITING : request.getStatus());
		purchase.setNote(request.getNote());
	}

	private void applyProductionRequest(OrderProduction production, OrderProductionRequest request) {
		production.setPurchaseId(request.getPurchaseId());
	}

	private void saveInitialProduction(OrderPurchase purchase) {
		if (!hasText(purchase.getPurchaseId()) || orderProductionRepository.existsById(purchase.getPurchaseId())) {
			return;
		}

		OrderProduction production = new OrderProduction();
		production.setPurchaseId(purchase.getPurchaseId());

		orderProductionRepository.save(production);
	}

	private void deleteProductionIfExists(String purchaseId) {
		saveCancelHistoriesByPurchaseId(purchaseId);
		orderProductRepository.deleteByProductionPurchaseId(purchaseId);

		if (orderProductionRepository.existsById(purchaseId)) {
			orderProductionRepository.deleteById(purchaseId);
		}
	}

	private void applyHistoryRequest(OrderHistory history, OrderHistoryRequest request) {
		history.setProductQr(request.getProductQr());
		history.setProductionId(request.getProductionId());
		history.setProductName(request.getProductName());
		history.setNote(request.getNote());
		history.setStatus(request.getStatus() == null ? HistoryStatus.NORMAL : request.getStatus());
	}

	private void createOrderProducts(OrderProductionRequest request) {
		String productCodePrefix = request.getProductCodePrefix();
		Integer productionQuantity = request.getProductionQuantity();

		if (!hasText(request.getPurchaseId()) || !hasText(productCodePrefix) || productionQuantity == null || productionQuantity <= 0) {
			return;
		}

		OrderProduction production = orderProductionRepository.findById(request.getPurchaseId()).orElse(null);

		for (int index = 1; index <= productionQuantity; index++) {
			String setProductQr = productCodePrefix + "-" + index;
			OrderProduct product = new OrderProduct();

			product.setProductQr(setProductQr);
			product.setProduction(production);
			product.setProductName(production.getPurchase().getProductName());
			product.setLot(request.getLot());
			product.setProcess(ProductProcess.PRODUCTION_INSTRUCTION_CHECK);

			orderProductRepository.save(product);
		}
	}

	private void applyProductProcessRequest(OrderProduct product, OrderProductProcessRequest request) {
		if (hasText(request.getProductName())) {
			product.setProductName(request.getProductName());
		}

		product.setLot(request.getLot());

		if (request.getProcess() != null) {
			product.setProcess(request.getProcess());
		}
	}

	private void saveCancelHistory(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderHistory history = new OrderHistory();

		history.setProductQr(product.getProductQr());
		history.setProductionId(production == null ? null : production.getPurchaseId());
		history.setProductName(product.getProductName());
		history.setNote("제품 취소");
		history.setStatus(HistoryStatus.CANCEL);

		orderHistoryRepository.save(history);
	}

	private void saveCancelHistoriesByPurchaseId(String purchaseId) {
		orderProductRepository.findByProductionPurchaseId(purchaseId).forEach(this::saveCancelHistory);
	}

	private OrderProductionResponse toProductionResponse(OrderProduction production) {
		Map<String, Long> processCounts = OrderProductionResponse.emptyProcessCounts();

		for (ProductProcess process : ProductProcess.values()) {
			processCounts.put(
					process.name(),
					orderProductRepository.countByProductionPurchaseIdAndProcess(production.getPurchaseId(), process)
			);
		}

		return OrderProductionResponse.from(production, processCounts);
	}

	private ProcessHistoryResponse toProcessHistoryResponse(ProcessHistory history) {
		String productName = orderProductRepository.findById(history.getProductQr()).map(OrderProduct::getProductName)
				.orElse(null);

		return ProcessHistoryResponse.from(history, productName);
	}

	private Integer getProductionQuantity(OrderProductionRequest request) {
		if (request.getProductionQuantity() != null) {
			return request.getProductionQuantity();
		}

		if (request.getInstructionQuantity() != null) {
			return request.getInstructionQuantity();
		}

		return 0;
	}

	private void updatePurchaseStatus(String purchaseId, ProcessStatus status) {
		if (!hasText(purchaseId)) {
			return;
		}

		orderPurchaseRepository.findById(purchaseId).ifPresent((purchase) -> {
			purchase.setStatus(status);
			orderPurchaseRepository.save(purchase);
		});
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
