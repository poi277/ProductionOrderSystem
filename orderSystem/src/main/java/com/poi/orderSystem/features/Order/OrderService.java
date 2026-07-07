package com.poi.orderSystem.features.Order;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderLabelRequest;
import com.poi.orderSystem.features.DTO.OrderHistoryRequest;
import com.poi.orderSystem.features.DTO.OrderProductProcessRequest;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderPurchaseRequest;
import com.poi.orderSystem.features.DTO.OrderShipmentRequest;
import com.poi.orderSystem.features.entity.OrderLabel;
import com.poi.orderSystem.features.entity.OrderHistory;
import com.poi.orderSystem.features.entity.OrderHistory.HistoryStatus;
import com.poi.orderSystem.features.entity.OrderProductProcess;
import com.poi.orderSystem.features.entity.OrderProductProcess.ProcessStatus;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderProduction.ProductionStatus;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.OrderPurchase.PurchaseStatus;
import com.poi.orderSystem.features.entity.OrderShipment;
import com.poi.orderSystem.features.repository.OrderLabelRepository;
import com.poi.orderSystem.features.repository.OrderHistoryRepository;
import com.poi.orderSystem.features.repository.OrderProductProcessRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.repository.OrderShipmentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductProcessRepository orderProductProcessRepository;
	private final OrderShipmentRepository orderShipmentRepository;
	private final OrderLabelRepository orderLabelRepository;
	private final OrderHistoryRepository orderHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderPurchase> findPurchases() {
		return orderPurchaseRepository.findAll();
	}

	@Transactional
	public OrderPurchase savePurchase(OrderPurchaseRequest request) {
		OrderPurchase purchase = new OrderPurchase();
		applyPurchaseRequest(purchase, request);

		return orderPurchaseRepository.save(purchase);
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

		if (!purchaseId.equals(nextPurchaseId)) {
			orderPurchaseRepository.deleteById(purchaseId);
		}

		return savedPurchase;
	}

	@Transactional
	public void deletePurchase(String purchaseId) {
		orderPurchaseRepository.deleteById(purchaseId);
	}

	@Transactional(readOnly = true)
	public List<OrderProduction> findProductions() {
		return orderProductionRepository.findAll();
	}

	@Transactional
	public OrderProduction saveProduction(OrderProductionRequest request) {
		OrderProduction production = new OrderProduction();
		applyProductionRequest(production, request);

		return orderProductionRepository.save(production);
	}

	@Transactional
	public OrderProduction updateProduction(String productionId, OrderProductionRequest request) {
		String nextProductionId = hasText(request.getProductionId()) ? request.getProductionId() : productionId;
		OrderProduction production = productionId.equals(nextProductionId)
				? orderProductionRepository.findById(productionId).orElseGet(OrderProduction::new)
				: new OrderProduction();
		applyProductionRequest(production, request);
		production.setProductionId(nextProductionId);

		OrderProduction savedProduction = orderProductionRepository.save(production);

		if (!productionId.equals(nextProductionId)) {
			orderProductionRepository.deleteById(productionId);
		}

		return savedProduction;
	}

	@Transactional
	public void deleteProduction(String productionId) {
		orderProductionRepository.deleteById(productionId);
	}

	@Transactional(readOnly = true)
	public List<OrderProductProcess> findProductProcesses() {
		return orderProductProcessRepository.findAll();
	}

	@Transactional
	public OrderProductProcess saveProductProcess(OrderProductProcessRequest request) {
		OrderProductProcess productProcess = new OrderProductProcess();
		applyProductProcessRequest(productProcess, request);

		return orderProductProcessRepository.save(productProcess);
	}

	@Transactional
	public OrderProductProcess updateProductProcess(String productQr, OrderProductProcessRequest request) {
		String nextProductQr = hasText(request.getProductQr()) ? request.getProductQr() : productQr;
		OrderProductProcess productProcess = productQr.equals(nextProductQr)
				? orderProductProcessRepository.findById(productQr).orElseGet(OrderProductProcess::new)
				: new OrderProductProcess();
		applyProductProcessRequest(productProcess, request);
		productProcess.setProductQr(nextProductQr);

		OrderProductProcess savedProductProcess = orderProductProcessRepository.save(productProcess);

		if (!productQr.equals(nextProductQr)) {
			orderProductProcessRepository.deleteById(productQr);
		}

		return savedProductProcess;
	}

	@Transactional
	public void deleteProductProcess(String productQr) {
		orderProductProcessRepository.deleteById(productQr);
	}

	@Transactional(readOnly = true)
	public List<OrderShipment> findShipments() {
		return orderShipmentRepository.findAll();
	}

	@Transactional
	public OrderShipment saveShipment(OrderShipmentRequest request) {
		OrderShipment shipment = new OrderShipment();
		applyShipmentRequest(shipment, request);

		return orderShipmentRepository.save(shipment);
	}

	@Transactional
	public OrderShipment updateShipment(String shipmentId, OrderShipmentRequest request) {
		String nextShipmentId = hasText(request.getShipmentId()) ? request.getShipmentId() : shipmentId;
		OrderShipment shipment = shipmentId.equals(nextShipmentId)
				? orderShipmentRepository.findById(shipmentId).orElseGet(OrderShipment::new)
				: new OrderShipment();
		applyShipmentRequest(shipment, request);
		shipment.setShipmentId(nextShipmentId);

		OrderShipment savedShipment = orderShipmentRepository.save(shipment);

		if (!shipmentId.equals(nextShipmentId)) {
			orderShipmentRepository.deleteById(shipmentId);
		}

		return savedShipment;
	}

	@Transactional
	public void deleteShipment(String shipmentId) {
		orderShipmentRepository.deleteById(shipmentId);
	}

	@Transactional(readOnly = true)
	public List<OrderLabel> findLabels() {
		return orderLabelRepository.findAll();
	}

	@Transactional
	public OrderLabel saveLabel(OrderLabelRequest request) {
		OrderLabel label = new OrderLabel();
		applyLabelRequest(label, request);

		return orderLabelRepository.save(label);
	}

	@Transactional
	public OrderLabel updateLabel(String productQr, OrderLabelRequest request) {
		String nextProductQr = hasText(request.getProductQr()) ? request.getProductQr() : productQr;
		OrderLabel label = productQr.equals(nextProductQr)
				? orderLabelRepository.findById(productQr).orElseGet(OrderLabel::new)
				: new OrderLabel();
		applyLabelRequest(label, request);
		label.setProductQr(nextProductQr);

		OrderLabel savedLabel = orderLabelRepository.save(label);

		if (!productQr.equals(nextProductQr)) {
			orderLabelRepository.deleteById(productQr);
		}

		return savedLabel;
	}

	@Transactional
	public void deleteLabel(String productQr) {
		orderLabelRepository.deleteById(productQr);
	}

	@Transactional(readOnly = true)
	public List<OrderHistory> findHistories() {
		return orderHistoryRepository.findAll();
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
		purchase.setStatus(request.getStatus() == null ? PurchaseStatus.INSTRUCTION : request.getStatus());
		purchase.setNote(request.getNote());
	}

	private void applyProductionRequest(OrderProduction production, OrderProductionRequest request) {
		production.setProductionId(request.getProductionId());
		production.setPurchaseId(request.getPurchaseId());
		production.setProductName(request.getProductName());
		production.setPurchaseQuantity(request.getPurchaseQuantity());
		production.setInstructionQuantity(request.getInstructionQuantity());
		production.setProductQrQuantity(request.getProductQrQuantity());
		production.setCompletedQuantity(request.getCompletedQuantity());
		production.setShippedQuantity(request.getShippedQuantity());
		production.setStatus(request.getStatus() == null ? ProductionStatus.WAITING : request.getStatus());
	}

	private void applyProductProcessRequest(OrderProductProcess productProcess, OrderProductProcessRequest request) {
		productProcess.setProductQr(request.getProductQr());
		productProcess.setProductionId(request.getProductionId());
		productProcess.setProductName(request.getProductName());
		productProcess.setLot(request.getLot());
		productProcess.setProcessName(request.getProcessName());
		productProcess.setProcessSequence(request.getProcessSequence());
		productProcess.setStatus(request.getStatus() == null ? ProcessStatus.WAITING : request.getStatus());
		productProcess.setShipped(request.getShipped() == null ? false : request.getShipped());
		productProcess.setStartedAt(request.getStartedAt());
	}

	private void applyShipmentRequest(OrderShipment shipment, OrderShipmentRequest request) {
		shipment.setShipmentId(request.getShipmentId());
		shipment.setProductQr(request.getProductQr());
		shipment.setProductionId(request.getProductionId());
		shipment.setProductProcessNo(request.getProductProcessNo());
		shipment.setProcessName(request.getProcessName());
		shipment.setCompleted(request.getCompleted() == null ? false : request.getCompleted());
		shipment.setShippedAt(request.getShippedAt());
		shipment.setMemo(request.getMemo());
		shipment.setCreatedAt(request.getCreatedAt());
		shipment.setUpdatedAt(request.getUpdatedAt());
	}

	private void applyLabelRequest(OrderLabel label, OrderLabelRequest request) {
		label.setProductQr(request.getProductQr());
		label.setProductionOrderId(request.getProductionOrderId());
		label.setProductionOrderNo(request.getProductionOrderNo());
		label.setProductName(request.getProductName());
		label.setTitle(request.getTitle());
		label.setLine1(request.getLine1());
		label.setLine2(request.getLine2());
		label.setPrintedAt(request.getPrintedAt());
		label.setCreatedAt(request.getCreatedAt());
		label.setUpdatedAt(request.getUpdatedAt());
	}

	private void applyHistoryRequest(OrderHistory history, OrderHistoryRequest request) {
		history.setProductQr(request.getProductQr());
		history.setProductionId(request.getProductionId());
		history.setProductName(request.getProductName());
		history.setProcessName(request.getProcessName());
		history.setJudgment(request.getJudgment());
		history.setDefectType(request.getDefectType());
		history.setWorker(request.getWorker());
		history.setEquipment(request.getEquipment());
		history.setNote(request.getNote());
		history.setStatus(request.getStatus() == null ? HistoryStatus.NORMAL : request.getStatus());
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
