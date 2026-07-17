package com.poi.orderSystem.features.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "order_product_process_history", indexes = {
		@Index(name = "idx_product_process_history_product_time", columnList = "product_qr, completed_time"),
		@Index(name = "idx_product_process_history_purchase_db_id", columnList = "purchase_db_id")
})
@Getter
@Setter
public class OrderProductProcessHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_product_process_history_seq")
	@SequenceGenerator(
			name = "order_product_process_history_seq",
			sequenceName = "order_product_process_history_seq",
			allocationSize = 50)
	private Long id;

	@Column(name = "product_qr", nullable = false)
	private String productQr;

	@Column(name = "purchase_id", nullable = false)
	private String purchaseId;

	@Column(name = "purchase_db_id")
	private Long purchaseDbId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ProcessStatus process;

	@Column(name = "completed_time", nullable = false)
	private LocalDateTime completedTime;

	@Column(nullable = false)
	private boolean defect;

	@PrePersist
	private void onCreate() {
		if (completedTime == null) {
			completedTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
		}
	}
}
