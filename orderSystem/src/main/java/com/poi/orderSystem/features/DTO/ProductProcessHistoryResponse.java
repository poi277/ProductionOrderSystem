package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;

import com.poi.orderSystem.features.entity.OrderProductProcessHistory;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductProcessHistoryResponse {
	private Long id;
	private ProcessStatus process;
	private LocalDateTime completedTime;
	private boolean defect;

	public static ProductProcessHistoryResponse from(OrderProductProcessHistory history) {
		return ProductProcessHistoryResponse.builder()
				.id(history.getId())
				.process(history.getProcess())
				.completedTime(history.getCompletedTime())
				.defect(history.isDefect())
				.build();
	}
}
