package com.poi.orderSystem.features.DTO;

import java.util.LinkedHashMap;
import java.util.Map;

import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

import lombok.Getter;

@Getter
public class OrderProductionResponse {

	private final String purchaseId;
	private final String customer;
	private final String dueDate;
	private final String productName;
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

		this.purchaseId = production.getPurchaseId();
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.dueDate = purchase == null ? null : purchase.getDueDate();
		this.productName = purchase == null ? null : purchase.getProductName();
		this.lot = production.getProducts() == null
				? ""
				: production.getProducts().stream()
						.map((product) -> product.getLot())
						.filter((lot) -> lot != null && !lot.isBlank())
						.findFirst()
						.orElse("");
		this.productQr = production.getProducts() == null
				? ""
				: production.getProducts().stream()
						.map((product) -> product.getProductQr())
						.filter((productQr) -> productQr != null && !productQr.isBlank())
						.findFirst()
						.orElse("");
		this.purchaseQuantity = purchase == null ? productCount : purchase.getQuantity();
		this.instructionQuantity = productCount;
		this.productQrQuantity = productCount;
		this.completedQuantity = 0;
		this.shippedQuantity = processCounts.getOrDefault(ProductProcess.SHIPMENT.name(), 0L).intValue();
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

		for (ProductProcess process : ProductProcess.values()) {
			counts.put(process.name(), 0L);
		}

		return counts;
	}

	public static Map<String, String> processLabels() {
		Map<String, String> labels = new LinkedHashMap<>();

		for (ProductProcess process : ProductProcess.values()) {
			labels.put(process.name(), process.getProcessName());
		}

		return labels;
	}
}
