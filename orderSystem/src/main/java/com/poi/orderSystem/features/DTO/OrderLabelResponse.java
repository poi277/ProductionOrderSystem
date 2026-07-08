package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;

import lombok.Getter;

@Getter
public class OrderLabelResponse {

	private final String productQr;
	private final String productionOrderId;
	private final String productionOrderNo;
	private final String productName;
	private final String title;
	private final String line1;
	private final String line2;
	private final String printedAt;
	private final String createdAt;
	private final String updatedAt;

	private OrderLabelResponse(OrderProduct product) {
		OrderProduction production = product.getProduction();
		String productionId = production == null ? null : production.getPurchaseId();

		this.productQr = product.getProductQr();
		this.productionOrderId = productionId;
		this.productionOrderNo = productionId;
		this.productName = product.getProductName();
		this.title = product.getProductName();
		this.line1 = product.getLot();
		this.line2 = null;
		this.printedAt = null;
		this.createdAt = product.getCreatedTime() == null ? null : product.getCreatedTime().toString();
		this.updatedAt = null;
	}

	public static OrderLabelResponse from(OrderProduct product) {
		return new OrderLabelResponse(product);
	}
}
