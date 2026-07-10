package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderProductProcessResponse {

	private final String productQr;
	private final String productionId;
	private final String customer;
	private final String productName;
	private final Integer quantity;
	private final String lot;
	private final ProcessStatus process;
	private final String processName;
	private final String processSequence;
	private final String startedAt;
	private final String createdTime;

	private OrderProductProcessResponse(OrderProduct product) {
		OrderProduction production = product.getProduction();
		ProcessStatus process = product.getProcess();

		this.productQr = product.getProductQr();
		this.productionId = production == null ? null : production.getPurchaseId();
		this.customer = production == null || production.getPurchase() == null ? null : production.getPurchase().getCustomer();
		this.productName = product.getProductName();
		this.quantity = 1;
		this.lot = product.getLot();
		this.process = process;
		this.processName = process == null ? null : process.getLabel();
		this.processSequence = process == null ? null : process.getLabel();
		this.startedAt = null;
		this.createdTime = product.getCreatedTime() == null ? null : product.getCreatedTime().toString();
	}

	public static OrderProductProcessResponse from(OrderProduct product) {
		return new OrderProductProcessResponse(product);
	}
}
