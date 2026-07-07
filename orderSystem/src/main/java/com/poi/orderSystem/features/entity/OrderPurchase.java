package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderPurchase")
@Getter
@Setter
public class OrderPurchase {

	@Id
	private String purchaseId;

	private String customer;
	private String productName;
	private Integer quantity;
	private Integer price;
	private String purchaseDate;
	private String dueDate;

	@Enumerated(EnumType.STRING)
	private PurchaseStatus status;

	private String note;

	public enum PurchaseStatus {
		INSTRUCTION, // 생산지시 대기 또는 지시 가능 상태
		PRODUCING, // 생산이 진행 중인 상태
		COMPLETED, // 생산이 완료된 상태
		SHIPPED, // 출하가 완료된 상태
		CANCELED // 발주가 취소된 상태
	}

}
