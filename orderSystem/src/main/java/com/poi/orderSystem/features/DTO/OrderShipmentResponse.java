package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderShipmentResponse {

	private final String shipmentId;
	private final String productQr;
	private final String productName;
	private final String productionId;
	private final String customer;
	private final Integer quantity;
	private final String lot;
	private final String productProcessNo;
	private final String processName;
	private final String shippedAt;
	private final String memo;
	private final String createdAt;
	private final String updatedAt;

	private OrderShipmentResponse(OrderProduct product) {
		OrderProduction production = product.getProduction();
		ProcessStatus process = product.getProcess();

		this.shipmentId = product.getProductQr();
		this.productQr = product.getProductQr();
		this.productName = product.getProductName();
		this.productionId = production == null ? null : production.getPurchaseId();
		this.customer = production == null || production.getPurchase() == null ? null : production.getPurchase().getCustomer();
		this.quantity = 1;
		this.lot = product.getLot();
		this.productProcessNo = product.getProductQr();
		this.processName = process == null ? null : process.getLabel();
		this.shippedAt = null;
		this.memo = product.getLot();
		this.createdAt = product.getCreatedTime() == null ? null : product.getCreatedTime().toString();
		this.updatedAt = null;
	}

	public static OrderShipmentResponse from(OrderProduct product) {
		return new OrderShipmentResponse(product);
	}
}
