package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderPurchaseHistoryResponse {
	private final Long id;
	private final String purchaseId;
	private final String customer;
	private final String productName;
	private final Integer quantity;
	private final String dueDate;
	private final ProcessStatus status;
	private final String note;
	private final LocalDateTime createdTime;

	private OrderPurchaseHistoryResponse(OrderPurchase purchase) {
		this.id = purchase.getId();
		this.purchaseId = purchase.getPurchaseId();
		this.customer = purchase.getCustomer();
		this.productName = purchase.getProductName();
		this.quantity = purchase.getQuantity();
		this.dueDate = purchase.getDueDate();
		this.status = purchase.getStatus();
		this.note = purchase.getNote();
		this.createdTime = purchase.getCreatedTime();
	}

	public static OrderPurchaseHistoryResponse from(OrderPurchase purchase) {
		return purchase == null ? null : new OrderPurchaseHistoryResponse(purchase);
	}
}
