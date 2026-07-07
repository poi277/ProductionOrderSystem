package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderLabel")
@Getter
@Setter
public class OrderLabel {

	@Id
	private String productQr;

	private String productionOrderId;
	private String productionOrderNo;
	private String productName;
	private String title;
	private String line1;
	private String line2;
	private String printedAt;
	private String createdAt;
	private String updatedAt;

}
