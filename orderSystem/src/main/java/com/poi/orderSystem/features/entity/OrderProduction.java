package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
	private String purchaseId;

	@JsonIgnore
	@OneToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "purchaseId", referencedColumnName = "purchaseId", insertable = false, updatable = false)
	private OrderPurchase purchase;

	@JsonIgnore
	@OneToMany(mappedBy = "production", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)

	private List<OrderProduct> products;

	private LocalDateTime createdTime;

	@PrePersist
	private void onCreate() {
		this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}
}
