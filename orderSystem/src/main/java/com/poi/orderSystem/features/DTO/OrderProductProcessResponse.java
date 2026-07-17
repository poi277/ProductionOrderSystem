package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProductCategory;

import lombok.Getter;

@Getter
public class OrderProductProcessResponse {

	private final Long productionDbId;
	private final Long purchaseDbId;
	private final String productQr;
	private final String purchaseId;
	private final String productionId;
	private final String customer;
	private final String productName;
	private final ProductCategory productCategory;
	private final String dueDate;
	private final ProcessStatus purchaseStatus;
	private final String note;
	private final String purchaseCreatedTime;
	private final Integer productQrQuantity;
	private final Integer quantity;
	private final String lot;
	private final ProcessStatus process;
	private final String processName;
	private final String processSequence;
	private final Boolean isDefect;
	private final String startedAt;
	private final String createdTime;

	private OrderProductProcessResponse(OrderProduct product) {
		OrderProduction production = product.getProduction();
		OrderPurchase purchase = production == null ? null : production.getPurchase();
		ProcessStatus process = product.getProcess();

		this.productQr = product.getProductQr();
		this.purchaseId = production == null ? null : production.getPurchaseId();
		this.productionDbId = production == null ? null : production.getId();
		this.purchaseDbId = purchase == null ? null : purchase.getId();
		this.productionId = this.purchaseId;
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.productName = purchase == null ? null : purchase.getProductName();
		this.productCategory = purchase == null ? null : purchase.getProductCategory();
		this.dueDate = purchase == null ? null : purchase.getDueDate();
		this.purchaseStatus = purchase == null ? null : purchase.getStatus();
		this.note = purchase == null ? null : purchase.getNote();
		this.purchaseCreatedTime = purchase == null || purchase.getCreatedTime() == null ? null : purchase.getCreatedTime().toString();
		this.productQrQuantity = production == null ? null : production.getProductQrQuantity();
		this.quantity = purchase == null ? 1 : purchase.getQuantity();
		this.lot = production == null ? null : production.getLot();
		this.process = process;
		this.processName = process == null ? null : process.getLabel();
		this.processSequence = process == null ? null : process.getLabel();
		this.isDefect = product.isDefect();
		this.startedAt = null;
		this.createdTime = product.getCreatedTime() == null ? null : product.getCreatedTime().toString();
	}

	public static OrderProductProcessResponse from(OrderProduct product) {
		return new OrderProductProcessResponse(product);
	}
}
