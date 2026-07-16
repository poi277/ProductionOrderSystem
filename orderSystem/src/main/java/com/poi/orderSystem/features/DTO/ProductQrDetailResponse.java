package com.poi.orderSystem.features.DTO;

import java.time.LocalDateTime;
import java.util.List;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProductQrDetailResponse {
	private String productQr;
	private String purchaseId;
	private String customer;
	private String productName;
	private String lot;
	private ProcessStatus currentProcess;
	private boolean defect;
	private LocalDateTime createdTime;
	private List<ProductProcessHistoryResponse> processHistories;
}
