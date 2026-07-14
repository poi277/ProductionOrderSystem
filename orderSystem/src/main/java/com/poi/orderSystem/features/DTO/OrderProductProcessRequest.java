package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderProductProcessRequest {

	private ProcessStatus processName;
	private Boolean isDefect;
}
