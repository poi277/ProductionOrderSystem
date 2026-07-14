package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderLabelResponse {

	private final Long productionDbId;
	private final Long purchaseDbId;
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
	private final String customer;
	private final Integer quantity;
	private final Integer price;
	private final String dueDate;
	private final ProcessStatus purchaseStatus;
	private final String note;
	private final String purchaseCreatedTime;
	private final Integer productQrQuantity;
	private final ProcessStatus process;
	private final Boolean isDefect;

	private OrderLabelResponse(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderPurchase purchase = production == null ? null : production.getPurchase();
		String productionId = production == null ? null : production.getPurchaseId();

		this.productQr = product.getProductQr();
		this.productionDbId = production == null ? null : production.getId();
		this.purchaseDbId = purchase == null ? null : purchase.getId();
		this.productionOrderId = productionId;
		this.productionOrderNo = productionId;
		this.productName = purchase == null ? null : purchase.getProductName();
		this.title = purchase == null ? null : purchase.getProductName();
		this.line1 = production == null ? null : production.getLot();
		this.line2 = null;
		this.printedAt = null;
		this.createdAt = product.getCreatedTime() == null ? null : product.getCreatedTime().toString();
		this.updatedAt = null;
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.quantity = purchase == null ? null : purchase.getQuantity();
		this.price = purchase == null ? null : purchase.getPrice();
		this.dueDate = purchase == null ? null : purchase.getDueDate();
		this.purchaseStatus = purchase == null ? null : purchase.getStatus();
		this.note = purchase == null ? null : purchase.getNote();
		this.purchaseCreatedTime = purchase == null || purchase.getCreatedTime() == null ? null : purchase.getCreatedTime().toString();
		this.productQrQuantity = production == null ? null : production.getProductQrQuantity();
		this.process = product.getProcess();
		this.isDefect = product.isDefect();
	}

	public static OrderLabelResponse from(OrderProduct product) {
		return new OrderLabelResponse(product);
	}
}
