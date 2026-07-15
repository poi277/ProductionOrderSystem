package com.poi.orderSystem.features.DTO;


import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderHistoryRequest {

	@NotBlank
	private String productQr;

	private String productionId;
	private Boolean isDefect;
	private ProcessStatus process;

}
