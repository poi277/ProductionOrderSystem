package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderPurchase.PurchaseStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderPurchaseRequest {

	@NotBlank
	private String purchaseId;

	private String customer;

	@NotBlank
	private String productName;

	@NotNull
	private Integer quantity;

	private Integer unitPrice;
	private String purchaseDate;
	private String dueDate;
	private PurchaseStatus status;
	private String note;

}
