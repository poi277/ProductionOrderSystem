package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class OrderShipmentResponse {

	private final Long productionDbId;
	private final Long purchaseDbId;
	private final String shipmentId;
	private final String productQr;
	private final List<String> productQrs;
	private final String productName;
	private final String productionId;
	private final String customer;
	private final Integer quantity;
	private final Integer packedQuantity;
	private final String lot;
	private final String productProcessNo;
	private final String processName;
	private final String shippedAt;
	private final String memo;
	private final String createdAt;
	private final String updatedAt;
	private final String dueDate;
	private final ProcessStatus purchaseStatus;
	private final String note;
	private final String purchaseCreatedTime;
	private final Integer productQrQuantity;
	private final ProcessStatus process;
	private final Boolean isDefect;

	private OrderShipmentResponse(List<OrderProduct> products) {
		OrderProduct product = products.get(0);
		OrderProduction production = product.getProduction();
		OrderPurchase purchase = production == null ? null : production.getPurchase();
		ProcessStatus process = product.getProcess();
		LocalDateTime latestCreatedTime = products.stream()
				.map(OrderProduct::getCreatedTime)
				.filter(time -> time != null)
				.max(Comparator.naturalOrder())
				.orElse(null);

		this.shipmentId = purchase == null ? product.getProductQr() : purchase.getPurchaseId();
		this.productionDbId = production == null ? null : production.getId();
		this.purchaseDbId = purchase == null ? null : purchase.getId();
		this.productQr = product.getProductQr();
		this.productQrs = products.stream().map(OrderProduct::getProductQr).toList();
		this.productName = purchase == null ? null : purchase.getProductName();
		this.productionId = production == null ? null : production.getPurchaseId();
		this.customer = purchase == null ? null : purchase.getCustomer();
		this.quantity = purchase == null ? null : purchase.getQuantity();
		this.packedQuantity = products.size();
		this.lot = production == null ? null : production.getLot();
		this.productProcessNo = product.getProductQr();
		this.processName = process == null ? null : process.getLabel();
		this.shippedAt = null;
		this.memo = production == null ? null : production.getLot();
		this.createdAt = latestCreatedTime == null ? null : latestCreatedTime.toString();
		this.updatedAt = this.createdAt;
		this.dueDate = purchase == null ? null : purchase.getDueDate();
		this.purchaseStatus = purchase == null ? null : purchase.getStatus();
		this.note = purchase == null ? null : purchase.getNote();
		this.purchaseCreatedTime = purchase == null || purchase.getCreatedTime() == null ? null : purchase.getCreatedTime().toString();
		this.productQrQuantity = production == null ? null : production.getProductQrQuantity();
		this.process = product.getProcess();
		this.isDefect = product.isDefect();
	}

	public static OrderShipmentResponse from(List<OrderProduct> products) {
		return new OrderShipmentResponse(products);
	}

	public static OrderShipmentResponse from(OrderProduct product) {
		return new OrderShipmentResponse(List.of(product));
	}
}
