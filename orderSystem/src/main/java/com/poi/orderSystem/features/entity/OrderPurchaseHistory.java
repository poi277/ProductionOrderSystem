package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
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
@Table(name = "orderPurchaseHistory")
@Getter
@Setter
public class OrderPurchaseHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true)
	private String purchaseId;

	private String customer;
	private String productName;
	private Integer quantity;
	private Integer price;
	private String dueDate;
	private LocalDateTime createdTime;

	@Enumerated(EnumType.STRING)
	private ProcessStatus status;

	private String note;

	@PrePersist
	private void onCreate() {
		this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}
}
