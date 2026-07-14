package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderPurchaseResponse {
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
	private final Long productionDbId;
	private final String lot;
	private final Integer productQrQuantity;
	private final String productQr;

	private OrderPurchaseResponse(OrderPurchase purchase) {
		this.id = purchase.getId();
		this.purchaseId = purchase.getPurchaseId();
		this.customer = purchase.getCustomer();
		this.productName = purchase.getProductName();
		this.quantity = purchase.getQuantity();
		this.price = purchase.getPrice();
		this.dueDate = purchase.getDueDate();
		this.status = purchase.getStatus();
		this.note = purchase.getNote();
		this.createdTime = purchase.getCreatedTime();
		var production = purchase.getProduction();
		this.productionDbId = production == null ? null : production.getId();
		this.lot = production == null ? null : production.getLot();
		this.productQrQuantity = production == null ? null : production.getProductQrQuantity();
		this.productQr = production == null || production.getProducts() == null ? null
				: production.getProducts().stream().map(product -> product.getProductQr()).findFirst().orElse(null);
	}

	public static OrderPurchaseResponse from(OrderPurchase purchase) {
		return purchase == null ? null : new OrderPurchaseResponse(purchase);
	}
}
