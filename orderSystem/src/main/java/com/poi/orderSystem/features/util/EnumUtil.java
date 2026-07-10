package com.poi.orderSystem.features.util;

public class EnumUtil {

	public enum HistoryStatus {
		NORMAL, // 공정 판정이 정상인 상태
		DEFECTIVE, // 공정 판정이 불량인 상태
		CANCEL, // 주문이 취소된상태
	}

	public enum ProcessStatus {
		INSTRUCTION("생산 지시"), // 제품 QR 생성
		ASSEMBLY("생산"), // 조립 공정
		TEST("TEST"), // 테스트 공정
		FINAL_INSPECTION("최종검수"), // 최종 검수
		PACKAGING("포장"), // 포장
		WAITING_FOR_SHIPMENT("납품대기"), // 납품 대기
		SHIPPED("출하 완료"); // 출하 완료

		private final String label;

		ProcessStatus(String label) {
			this.label = label;
		}

		public String getLabel() {
			return label;
		}
	}
}
