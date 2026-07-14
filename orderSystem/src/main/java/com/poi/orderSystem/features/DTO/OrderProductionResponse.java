package com.poi.orderSystem.features.DTO;

import java.util.LinkedHashMap;
import java.util.Map;

import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderProductionResponse {

	private final Long id;
	private final Long purchaseDbId;
	private final String purchaseId;
	private final String customer;
	private final String dueDate;
	private final String productName;
	private final Integer price;
	private final ProcessStatus status;
	private final String note;
	private final String purchaseCreatedTime;
	private final String lot;
	private final String productQr;
	private final Integer purchaseQuantity;
	private final Integer instructionQuantity;
	private final Integer productQrQuantity;
	private final Integer completedQuantity;
	private final Integer shippedQuantity;
	private final String createdTime;
	private final Map<String, Long> processCounts;
	private final Map<String, String> processLabels;

	private OrderProductionResponse(OrderProduction production) {
		this(production, emptyProcessCounts());
	}

	private OrderProductionResponse(OrderProduction production, Map<String, Long> processCounts) {
		OrderPurchase purchase = production.getPurchase();
		Integer productCount = processCounts.values().stream()
				.mapToInt(Long::intValue)
				.sum();

		this.id = production.getId();
		this.purchaseDbId = purchase == null ? null : purchase.getId();
		this.purchaseId = production.getPurchaseId();
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.dueDate = purchase == null ? null : purchase.getDueDate();
		this.productName = purchase == null ? null : purchase.getProductName();
		this.price = purchase == null ? null : purchase.getPrice();
		this.status = purchase == null ? null : purchase.getStatus();
		this.note = purchase == null ? null : purchase.getNote();
		this.purchaseCreatedTime = purchase == null || purchase.getCreatedTime() == null ? null : purchase.getCreatedTime().toString();
		this.lot = production.getLot() == null ? "" : production.getLot();
		this.productQr = production.getProducts() == null
				? ""
				: production.getProducts().stream()
						.map((product) -> product.getProductQr())
						.filter((productQr) -> productQr != null && !productQr.isBlank())
						.findFirst()
						.orElse("");
		this.purchaseQuantity = purchase == null ? productCount : purchase.getQuantity();
		this.instructionQuantity = productCount;
		this.productQrQuantity = production.getProductQrQuantity();
		this.completedQuantity = 0;
		this.shippedQuantity = processCounts.getOrDefault(ProcessStatus.WAITING_FOR_SHIPMENT.name(), 0L).intValue();
		this.createdTime = production.getCreatedTime() == null ? null : production.getCreatedTime().toString();
		this.processCounts = processCounts;
		this.processLabels = processLabels();
	}

	public static OrderProductionResponse from(OrderProduction production) {
		return new OrderProductionResponse(production);
	}

	public static OrderProductionResponse from(OrderProduction production, Map<String, Long> processCounts) {
		return new OrderProductionResponse(production, processCounts);
	}

	public static Map<String, Long> emptyProcessCounts() {
		Map<String, Long> counts = new LinkedHashMap<>();

		for (ProcessStatus process : ProcessStatus.values()) {
			counts.put(process.name(), 0L);
		}

		return counts;
	}

	public static Map<String, String> processLabels() {
		Map<String, String> labels = new LinkedHashMap<>();

		for (ProcessStatus process : ProcessStatus.values()) {
			labels.put(process.name(), process.getLabel());
		}

		return labels;
	}
}
