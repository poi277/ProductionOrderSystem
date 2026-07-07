package com.poi.orderSystem.features.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "orderShipment")
@Getter
@Setter
public class OrderShipment {

	@Id
	private String shipmentId;

	private String productQr;
	private String productionId;
	private String productProcessNo;
	private String processName;
	private Boolean completed;
	private String shippedAt;
	private String memo;
	private String createdAt;
	private String updatedAt;

}
