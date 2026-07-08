package com.poi.orderSystem.features.DTO;


import com.poi.orderSystem.features.util.EnumUtil.HistoryStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderHistoryRequest {

	@NotBlank
	private String productQr;

	private String productionId;
	private String productName;
	private String processName;
	private String judgment;
	private String defectType;
	private String worker;
	private String equipment;
	private String note;
	private HistoryStatus status;

}
