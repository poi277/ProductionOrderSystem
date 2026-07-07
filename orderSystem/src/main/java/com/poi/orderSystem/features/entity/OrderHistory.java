package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderHistory")
@Getter
@Setter
public class OrderHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long historyId;

	private String productQr;
	private String productionId;
	private String productName;
	private String processName;
	private String judgment;
	private String defectType;
	private String worker;
	private String equipment;
	private String note;

	@Enumerated(EnumType.STRING)
	private HistoryStatus status;

	public enum HistoryStatus {
		NORMAL, // 공정 판정이 정상인 상태
		DEFECTIVE // 공정 판정이 불량인 상태
	}

}
