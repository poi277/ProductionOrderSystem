package com.poi.orderSystem.features.Order.product;

public class ProductQrNotFoundException extends RuntimeException {
	public ProductQrNotFoundException(String productQr) {
		super("제품을 찾을 수 없습니다: " + productQr);
	}
}
