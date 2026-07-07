package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProduction.ProductionStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductionRequest {

	@NotBlank
	private String productionId;

	private String purchaseId;
	private String productName;
	private Integer purchaseQuantity;
	private Integer instructionQuantity;
	private Integer productQrQuantity;
	private Integer completedQuantity;
	private Integer shippedQuantity;
	private ProductionStatus status;

}
