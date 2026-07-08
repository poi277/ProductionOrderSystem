package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.validation.constraints.NotBlank;
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

	private Integer quantity;

	private Integer unitPrice;
	private String purchaseDate;
	private String dueDate;
	private ProcessStatus status;
	private String note;

}
