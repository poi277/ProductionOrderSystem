package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.poi.orderSystem.features.util.EnumUtil.ProductProcess;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "processHistory")
@Getter
@Setter
public class ProcessHistory {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long processId;
	private String purchaseId;
	private String productQr;

	@Enumerated(EnumType.STRING)
	private ProductProcess productProcess;
	private boolean isSuccess;
	private LocalDateTime createdTime;

	@PrePersist
	private void onCreate() {
		this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}
}
