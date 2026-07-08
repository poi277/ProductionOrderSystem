package com.poi.orderSystem.features.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductionRequest {

	@NotBlank
	private String purchaseId;

	private String productCodePrefix;
	private String lot;
	private Integer productionQuantity;
	private String productName;
	private Integer purchaseQuantity;
	private Integer instructionQuantity;
	private Integer productQrQuantity;
	private Integer completedQuantity;
	private Integer shippedQuantity;

}
