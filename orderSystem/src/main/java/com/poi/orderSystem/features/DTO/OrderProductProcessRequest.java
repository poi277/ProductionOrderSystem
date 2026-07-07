package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.OrderProductProcess.ProcessStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductProcessRequest {

	@NotBlank
	private String productQr;

	private String productionId;
	private String productName;
	private String lot;
	private String processName;
	private Integer processSequence;
	private ProcessStatus status;
	private Boolean shipped;
	private String startedAt;

}
