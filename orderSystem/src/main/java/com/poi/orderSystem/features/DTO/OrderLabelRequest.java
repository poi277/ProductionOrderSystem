package com.poi.orderSystem.features.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderLabelRequest {

	@NotBlank
	private String productQr;

	private String productionOrderId;
	private String productionOrderNo;
	private String productName;
	private String title;
	private String line1;
	private String line2;
	private String printedAt;
	private String createdAt;
	private String updatedAt;

}
