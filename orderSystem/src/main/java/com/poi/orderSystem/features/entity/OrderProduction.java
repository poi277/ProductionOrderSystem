package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderProduction")
@Getter
@Setter
public class OrderProduction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@JsonIgnore
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "purchase_order_id", nullable = false, unique = true)
	private OrderPurchase purchase;

	@JsonIgnore
	@OneToMany(mappedBy = "production", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
	private List<OrderProduct> products;

	// 생산지시 수량
	private Integer productQrQuantity;

	// 생산지시 전체가 공유하는 LOT
	private String lot;

	// 생산지시 생성 시간
	private LocalDateTime createdTime;

	@PrePersist
	private void onCreate() {
		this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}

	public String getPurchaseId() {
		return purchase == null ? null : purchase.getPurchaseId();
	}
}
