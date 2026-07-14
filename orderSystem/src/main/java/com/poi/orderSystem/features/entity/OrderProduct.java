package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.springframework.data.domain.Persistable;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;
@Entity
@Table(name = "OrderProduct")
@Getter
@Setter
public class OrderProduct implements Persistable<String> {

	@Id
	private String productQr;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "production_id", nullable = false)
	private OrderProduction production;

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
	private void onCreate() {
		if (this.createdTime == null) {
			this.createdTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
		}
	}

	@PostLoad
	@PostPersist
	private void markNotNew() {
		this.newEntity = false;
	}
}

