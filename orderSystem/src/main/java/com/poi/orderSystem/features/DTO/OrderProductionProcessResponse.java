package com.poi.orderSystem.features.DTO;

import java.util.List;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderProductionProcessResponse {
	private final Long id;
	private final Long productionDbId;
	private final Long purchaseDbId;

	private final String productQr;
	private final String productionId;
	private final String customer;
	private final String productName;
	private final Integer quantity;
	private final Integer productQrQuantity;
	private final String lot;
	private final ProcessStatus process;
	private final String processName;
	private final String processSequence;
	private final String startedAt;
	private final String createdTime;

	private OrderProductionProcessResponse(OrderProduction production) {
		OrderPurchase purchase = production.getPurchase();
		List<OrderProduct> products = production.getProducts() == null ? List.of() : production.getProducts();
		ProcessStatus currentProcess = purchase == null || purchase.getStatus() == null
				? ProcessStatus.INSTRUCTION
				: purchase.getStatus();
		OrderProduct firstProduct = products.stream().findFirst().orElse(null);

		this.productQr = firstProduct == null ? null : firstProduct.getProductQr();
		this.id = production.getId();
		this.productionDbId = production.getId();
		this.purchaseDbId = purchase == null ? null : purchase.getId();
		this.productionId = production.getPurchaseId();
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.productName = purchase == null ? null : purchase.getProductName();
		this.quantity = purchase == null ? null : purchase.getQuantity();
		this.productQrQuantity = production.getProductQrQuantity();
		this.lot = production.getLot();
		this.process = currentProcess;
		this.processName = currentProcess.getLabel();
		this.processSequence = currentProcess.getLabel();
		this.startedAt = null;
		this.createdTime = production.getCreatedTime() == null ? null : production.getCreatedTime().toString();
	}

	public static OrderProductionProcessResponse from(OrderProduction production) {
		return new OrderProductionProcessResponse(production);
	}
}
