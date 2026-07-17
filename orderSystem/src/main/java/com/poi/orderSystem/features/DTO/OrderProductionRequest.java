package com.poi.orderSystem.features.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductionRequest {

	@NotNull
	private Long purchaseDbId;

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
