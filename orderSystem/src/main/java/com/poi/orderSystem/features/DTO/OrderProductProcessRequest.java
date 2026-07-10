package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductProcessRequest {

	private String productQr;
	private String productionId;
	private String productName;
	private String lot;
	private ProcessStatus processName;
}
