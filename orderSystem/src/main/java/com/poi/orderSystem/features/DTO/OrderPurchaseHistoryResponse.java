package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderPurchaseHistory;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderPurchaseHistoryResponse {
	private final Long id;
	private final String purchaseId;
	private final String customer;
	private final String productName;
	private final Integer quantity;
	private final Integer price;
	private final String dueDate;
	private final ProcessStatus status;
	private final String note;
	private final LocalDateTime createdTime;

	private OrderPurchaseHistoryResponse(OrderPurchaseHistory history) {
		this.id = history.getId();
		this.purchaseId = history.getPurchaseId();
		this.customer = history.getCustomer();
		this.productName = history.getProductName();
		this.quantity = history.getQuantity();
		this.price = history.getPrice();
		this.dueDate = history.getDueDate();
		this.status = history.getStatus();
		this.note = history.getNote();
		this.createdTime = history.getCreatedTime();
	}

	public static OrderPurchaseHistoryResponse from(OrderPurchaseHistory history) {
		return history == null ? null : new OrderPurchaseHistoryResponse(history);
	}
}
