package com.poi.orderSystem.features.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderShipmentRequest {

	@NotBlank
	private String shipmentId;

	private String productQr;
	private String productionId;
	private String productProcessNo;
	private String processName;
	private Boolean completed;
	private String shippedAt;
	private String memo;
	private String createdAt;
	private String updatedAt;

}
