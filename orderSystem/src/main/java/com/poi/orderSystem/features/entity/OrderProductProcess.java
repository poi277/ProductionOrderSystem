package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderProductProcess")
@Getter
@Setter
public class OrderProductProcess {

	@Id
	private String productQr;

	private String productionId;
	private String productName;
	private String lot;
	private String processName;
	private Integer processSequence;

	@Enumerated(EnumType.STRING)
	private ProcessStatus status;

	private Boolean shipped;
	private String startedAt;

	public enum ProcessStatus {
		WAITING, // 공정 시작 전 대기 상태
		IN_PROGRESS, // 현재 공정을 진행 중인 상태
		COMPLETED, // 현재 공정이 완료된 상태
		DEFECTIVE // 공정에서 불량이 발생한 상태
	}

}
