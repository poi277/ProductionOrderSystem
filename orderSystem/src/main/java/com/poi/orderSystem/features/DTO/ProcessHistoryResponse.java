package com.poi.orderSystem.features.DTO;

import com.poi.orderSystem.features.entity.ProcessHistory;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.Getter;

@Getter
public class ProcessHistoryResponse {

	private final Long processId;
	private final String purchaseId;
	private final String productQr;
	private final String productName;
	private final ProcessStatus productProcess;
	private final boolean isSuccess;
	private final String createdTime;

	private ProcessHistoryResponse(ProcessHistory history, String productName) {
		this.processId = history.getProcessId();
		this.purchaseId = history.getPurchaseId();
		this.productQr = history.getProductQr();
		this.productName = productName;
		this.productProcess = history.getProductProcess();
		this.isSuccess = history.isSuccess();
		this.createdTime = history.getCreatedTime() == null ? null : history.getCreatedTime().toString();
	}

	public static ProcessHistoryResponse from(ProcessHistory history, String productName) {
		return new ProcessHistoryResponse(history, productName);
	}
}
