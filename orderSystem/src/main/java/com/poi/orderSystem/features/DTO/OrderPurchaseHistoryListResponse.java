package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.OrderPurchaseHistory;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderPurchaseHistoryListResponse {

	public enum Source {
		PURCHASE,
		HISTORY
	}

	private final Long id;
	private final Source source;
	private final String purchaseId;
	private final String customer;
	private final String productName;
	private final Integer quantity;
	private final Integer price;
	private final String dueDate;
	private final ProcessStatus status;
	private final String note;
	private final LocalDateTime createdTime;

	private OrderPurchaseHistoryListResponse(Long id, Source source, String purchaseId, String customer,
			String productName, Integer quantity, Integer price, String dueDate, ProcessStatus status,
			String note, LocalDateTime createdTime) {
		this.id = id;
		this.source = source;
		this.purchaseId = purchaseId;
		this.customer = customer;
		this.productName = productName;
		this.quantity = quantity;
		this.price = price;
		this.dueDate = dueDate;
		this.status = status;
		this.note = note;
		this.createdTime = createdTime;
	}

	public static OrderPurchaseHistoryListResponse from(OrderPurchase purchase) {
		return new OrderPurchaseHistoryListResponse(purchase.getId(), Source.PURCHASE, purchase.getPurchaseId(),
				purchase.getCustomer(), purchase.getProductName(), purchase.getQuantity(), purchase.getPrice(),
				purchase.getDueDate(), purchase.getStatus(), purchase.getNote(), purchase.getCreatedTime());
	}

	public static OrderPurchaseHistoryListResponse from(OrderPurchaseHistory history) {
		return new OrderPurchaseHistoryListResponse(history.getId(), Source.HISTORY, history.getPurchaseId(),
				history.getCustomer(), history.getProductName(), history.getQuantity(), history.getPrice(),
				history.getDueDate(), history.getStatus(), history.getNote(), history.getCreatedTime());
	}
}
