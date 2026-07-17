package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;
import com.poi.orderSystem.features.util.EnumUtil.ProductCategory;

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
	private final ProductCategory productCategory;
	private final String dueDate;
	private final ProcessStatus status;
	private final String note;
	private final LocalDateTime createdTime;

	private OrderPurchaseHistoryListResponse(Long id, Source source, String purchaseId, String customer,
			String productName, Integer quantity, ProductCategory productCategory, String dueDate, ProcessStatus status,
			String note, LocalDateTime createdTime) {
		this.id = id;
		this.source = source;
		this.purchaseId = purchaseId;
		this.customer = customer;
		this.productName = productName;
		this.quantity = quantity;
		this.productCategory = productCategory;
		this.dueDate = dueDate;
		this.status = status;
		this.note = note;
		this.createdTime = createdTime;
	}

	public static OrderPurchaseHistoryListResponse from(OrderPurchase purchase) {
		return new OrderPurchaseHistoryListResponse(purchase.getId(), Source.PURCHASE, purchase.getPurchaseId(),
				purchase.getCustomer(), purchase.getProductName(), purchase.getQuantity(), purchase.getProductCategory(),
				purchase.getDueDate(), purchase.getStatus(), purchase.getNote(), purchase.getCreatedTime());
	}

}
