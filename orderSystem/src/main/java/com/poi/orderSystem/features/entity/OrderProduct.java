package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "OrderProduct")
@Getter
@Setter
public class OrderProduct {

	@Id
	private String productQr;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "purchaseId", referencedColumnName = "purchaseId")
	private OrderProduction production;

	private String productName;
	private String lot;
	private LocalDateTime createdTime;

	@Enumerated(EnumType.STRING)
	private ProcessStatus process;

	@PrePersist
	private void onCreate() {
		this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}
}

