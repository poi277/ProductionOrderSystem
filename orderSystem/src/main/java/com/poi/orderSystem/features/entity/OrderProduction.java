package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderProduction")
@Getter
@Setter
public class OrderProduction {

	@Id
	private String productionId;

	private String purchaseId;
	private String productName;
	private Integer purchaseQuantity;
	private Integer instructionQuantity;
	private Integer productQrQuantity;
	private Integer completedQuantity;
	private Integer shippedQuantity;

	@Enumerated(EnumType.STRING)
	private ProductionStatus status;

	public enum ProductionStatus {
		WAITING, // 생산 시작 전 대기 상태
		IN_PROGRESS, // 생산 또는 공정이 진행 중인 상태
		COMPLETED, // 지시 수량 생산이 완료된 상태
		SHIPPED, // 생산품 출하가 완료된 상태
		CANCELED // 생산지시가 취소된 상태
	}

}
