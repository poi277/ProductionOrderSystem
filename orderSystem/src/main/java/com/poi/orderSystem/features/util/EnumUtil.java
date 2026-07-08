package com.poi.orderSystem.features.util;

public class EnumUtil {

	public enum HistoryStatus {
		NORMAL, // 공정 판정이 정상인 상태
		DEFECTIVE, // 공정 판정이 불량인 상태
		CANCEL, // 주문이 취소된상태
	}

	public enum ProcessStatus {
		WAITING("대기"), // 생산 시작 전 대기 상태
		IN_PROGRESS("생산 중"), // 생산 또는 공정이 진행 중인 상태
		COMPLETED("생산 완료"), // 생산이 완료된 상태
		SHIPPED("출하 완료"), // 출하가 완료된 상태
		CANCELED("취소"); // 발주가 취소된 상태

		private final String label;

		ProcessStatus(String label) {
			this.label = label;
		}

		public String getLabel() {
			return label;
		}
	}

	public enum ProductProcess {
		PRODUCTION_INSTRUCTION_CHECK("생산지시", "투입전"),
		ASSEMBLY("조립", "조립대"),
		FUNCTION_TEST("기능검사", "TEST KIT"),
		SHIPMENT_INSPECTION("출하검사", "출하"),
		SHIPMENT("출하중", "출하중");

		private final String processName;
		private final String workPlace;

		ProductProcess(String processName, String workPlace) {
			this.processName = processName;
			this.workPlace = workPlace;
		}

		public String getProcessName() {
			return processName;
		}

		public String getWorkPlace() {
			return workPlace;
		}
	}
}
