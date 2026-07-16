package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderProductHistoryResponse {
	private final String productQr;
	private final String purchaseId;
	private final String productName;
	private final boolean isDefect;
	private final ProcessStatus status;
	private final LocalDateTime createdTime;

	private OrderProductHistoryResponse(OrderProduct product) {
		this.productQr = product.getProductQr();
		this.purchaseId = product.getProduction() == null ? null : product.getProduction().getPurchaseId();
		this.productName = product.getProduction() == null || product.getProduction().getPurchase() == null
				? null : product.getProduction().getPurchase().getProductName();
		this.isDefect = product.isDefect();
		this.status = product.getProcess();
		this.createdTime = product.getCreatedTime();
	}

	public static OrderProductHistoryResponse from(OrderProduct product) {
		return new OrderProductHistoryResponse(product);
	}
}
