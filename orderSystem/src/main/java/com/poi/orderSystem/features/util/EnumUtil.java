package com.poi.orderSystem.features.util;

public class EnumUtil {

	public enum HistoryStatus {
		NORMAL,
		DEFECTIVE,
		CANCEL,
	}

	public enum ProductCategory {
		AUTOMATIC_DAMPER("오토댐퍼"), LEAK_SENSOR("리크센서"), DISPENSER("디스펜서"), GATE("게이트");

		private final String label;

		ProductCategory(String label) {
			this.label = label;
		}

		public String getLabel() {
			return label;
		}
	}

	public enum ProcessStatus {
		PURCHASESUBMIT("발주서 접수"),
		INSTRUCTION("생산지시"),
		ASSEMBLY("조립"),
		TEST("기능검사"),
		FINAL_INSPECTION("최종검수"),
		PACKAGING("포장"),
		SHIPPED("출하"),
		CANCEL("취소");

		private final String label;

		ProcessStatus(String label) {
			this.label = label;
		}

		public String getLabel() {
			return label;
		}
	}

	public enum Role {
		USER("일반"), ADMIN("관리자");
		private final String label;

		Role(String label) {
			this.label = label;
		}

		public String getLabel() {
			return label;
		}
	}
}
