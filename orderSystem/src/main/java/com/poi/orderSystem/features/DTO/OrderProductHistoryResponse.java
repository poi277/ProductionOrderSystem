package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderProductHistory;
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

	private OrderProductHistoryResponse(OrderProductHistory history) {
		this.productQr = history.getProductQr();
		this.purchaseId = history.getPurchaseId();
		this.productName = history.getProductName();
		this.isDefect = history.isDefect();
		this.status = history.getProcess();
		this.createdTime = history.getCreatedTime();
	}

	public static OrderProductHistoryResponse from(OrderProductHistory history) {
		return new OrderProductHistoryResponse(history);
	}
}
