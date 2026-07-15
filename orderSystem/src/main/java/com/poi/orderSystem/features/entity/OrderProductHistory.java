package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Persistable;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderProductHistory", indexes = {
		@Index(name = "idx_order_product_history_purchase_id", columnList = "purchase_id"),
		@Index(name = "idx_order_product_history_created_time", columnList = "created_time")
})
@Getter
@Setter
public class OrderProductHistory implements Persistable<String> {

	@Id
	private String productQr;

	private String purchaseId;

	private String productName;

	private boolean isDefect;

	@Enumerated(EnumType.STRING)
	private ProcessStatus process;

	private LocalDateTime createdTime;

	@Transient
	private boolean newEntity = true;

	@Override
	public String getId() {
		return productQr;
	}

	@Override
	public boolean isNew() {
		return newEntity;
	}

	@PrePersist
	@PreUpdate
	private void updateTime() {
		createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
	}

	@PostLoad
	@PostPersist
	private void markNotNew() {
		newEntity = false;
	}
}
