package com.poi.orderSystem.features.Order.production;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poi.orderSystem.features.DTO.OrderProductionProcessResponse;
import com.poi.orderSystem.features.DTO.OrderProductionRequest;
import com.poi.orderSystem.features.DTO.OrderProductionResponse;
import com.poi.orderSystem.features.entity.OrderProduct;
import com.poi.orderSystem.features.entity.OrderProduction;
import com.poi.orderSystem.features.entity.OrderPurchase;
import com.poi.orderSystem.features.entity.OrderPurchaseHistory;
import com.poi.orderSystem.features.repository.OrderProductRepository;
import com.poi.orderSystem.features.repository.OrderProductionRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseHistoryRepository;
import com.poi.orderSystem.features.repository.OrderPurchaseRepository;
import com.poi.orderSystem.features.util.EnumUtil.ProcessStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderProductionService {
	private final OrderProductionRepository orderProductionRepository;
	private final OrderProductRepository orderProductRepository;
	private final OrderPurchaseRepository orderPurchaseRepository;
	private final OrderPurchaseHistoryRepository orderPurchaseHistoryRepository;

	@Transactional(readOnly = true)
	public List<OrderProductionResponse> findProductions() {
		return orderProductionRepository.findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc().stream()
				.map(this::toProductionResponse).toList();
	}

	@Transactional(readOnly = true)
	public List<OrderProductionProcessResponse> findProductProcesses() {
		return orderProductionRepository.findAllWithPurchaseAndProductsByOrderByCreatedTimeDesc().stream()
				.filter(production -> production.getPurchase().getStatus().ordinal() >= ProcessStatus.INSTRUCTION.ordinal())
				.map(OrderProductionProcessResponse::from).toList();
	}

	@Transactional
	public OrderProductionResponse saveProduction(OrderProductionRequest request) {
		OrderPurchase purchase = findPurchase(request.getPurchaseId());
		OrderProduction production = orderProductionRepository.findByPurchasePurchaseId(request.getPurchaseId())
				.orElseGet(OrderProduction::new);
		int previousQuantity = production.getProductQrQuantity() == null ? 0 : production.getProductQrQuantity();
		production.setPurchase(purchase);
		OrderProduction savedProduction = orderProductionRepository.save(production);
		synchronizeOrderProducts(request, savedProduction, previousQuantity);
		savedProduction.setProductQrQuantity(request.getProductionQuantity());
		savedProduction.setLot(normalizeLot(request.getLot()));
		orderProductionRepository.save(savedProduction);
		if (request.getProductionQuantity() != null && request.getProductionQuantity() > 0) {
			updatePurchaseStatus(purchase, ProcessStatus.INSTRUCTION);
		}
		return toProductionResponse(findProductionWithRelations(savedProduction.getId(), savedProduction));
	}

	@Transactional
	public OrderProductionResponse updateProduction(Long id, OrderProductionRequest request) {
		OrderProduction production = orderProductionRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("생산지시를 찾을 수 없습니다."));
		OrderPurchase purchase = findPurchase(request.getPurchaseId());
		if (!production.getPurchase().getId().equals(purchase.getId())
				&& orderProductionRepository.existsByPurchase_Id(purchase.getId())) {
			throw new IllegalArgumentException("선택한 발주서에 이미 생산지시가 있습니다.");
		}
		int previousQuantity = production.getProductQrQuantity() == null ? 0 : production.getProductQrQuantity();
		production.setPurchase(purchase);
		OrderProduction savedProduction = orderProductionRepository.save(production);
		synchronizeOrderProducts(request, savedProduction, previousQuantity);
		savedProduction.setProductQrQuantity(request.getProductionQuantity());
		savedProduction.setLot(normalizeLot(request.getLot()));
		orderProductionRepository.save(savedProduction);
		if (purchase.getStatus() == ProcessStatus.PURCHASESUBMIT
				&& request.getProductionQuantity() != null
				&& request.getProductionQuantity() > 0) {
			updatePurchaseStatus(purchase, ProcessStatus.INSTRUCTION);
		}
		return toProductionResponse(findProductionWithRelations(savedProduction.getId(), savedProduction));
	}

	@Transactional
	public void deleteProduction(Long id) {
		OrderProduction production = orderProductionRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("생산지시를 찾을 수 없습니다."));
		OrderPurchase purchase = production.getPurchase();
		if (purchase == null) {
			orderProductionRepository.delete(production);
			return;
		}
		saveCancelledPurchaseHistory(purchase);
		orderPurchaseRepository.delete(purchase);
	}

	private void synchronizeOrderProducts(OrderProductionRequest request, OrderProduction production, int previousQuantity) {
		Integer targetQuantity = request.getProductionQuantity();
		String lot = normalizeLot(request.getLot());
		OrderPurchase purchase = production.getPurchase();

		if (targetQuantity == null || targetQuantity < 0) {
			throw new IllegalArgumentException("QR갯수를 0 이상 입력해 주세요.");
		}
		if (purchase.getQuantity() == null) {
			throw new IllegalArgumentException("발주수량이 없습니다.");
		}
		if (targetQuantity > purchase.getQuantity()) {
			throw new IllegalArgumentException("QR갯수는 발주수량을 넘을 수 없습니다.");
		}
		if (targetQuantity < previousQuantity) {
			throw new IllegalArgumentException("QR갯수는 이미 생성된 개수보다 작게 변경할 수 없습니다.");
		}
		if (targetQuantity > 0 && !hasText(lot)) {
			throw new IllegalArgumentException("LOT를 입력해 주세요.");
		}

		List<OrderProduct> existingProducts = new ArrayList<>(
				orderProductRepository.findByProductionPurchasePurchaseId(purchase.getPurchaseId()));
		existingProducts.sort(Comparator.comparingInt(product -> qrSequence(product.getProductQr())));
		List<String> desiredProductQrs = IntStream.rangeClosed(1, targetQuantity)
				.mapToObj(index -> lot + "-" + index)
				.toList();
		Set<String> occupiedProductQrs = orderProductRepository.findAllById(desiredProductQrs).stream()
				.map(OrderProduct::getProductQr)
				.collect(Collectors.toSet());

		List<OrderProduct> productsToSave = new ArrayList<>();
		List<OrderProduct> replacedProducts = new ArrayList<>();
		for (int index = 1; index <= targetQuantity; index++) {
			String desiredQr = lot + "-" + index;
			OrderProduct source = index <= existingProducts.size() ? existingProducts.get(index - 1) : null;

			if (source != null && desiredQr.equals(source.getProductQr())) {
				productsToSave.add(source);
				continue;
			}

			if (occupiedProductQrs.contains(desiredQr)) {
				throw new IllegalArgumentException("이미 사용 중인 제품 QR입니다: " + desiredQr);
			}

			OrderProduct product = new OrderProduct();
			product.setProductQr(desiredQr);
			product.setProduction(production);
			product.setProcess(source == null || source.getProcess() == null
					? ProcessStatus.INSTRUCTION : source.getProcess());
			if (source != null) {
				product.setDefect(source.isDefect());
				product.setCreatedTime(source.getCreatedTime());
				replacedProducts.add(source);
			}
			productsToSave.add(product);
		}

		orderProductRepository.saveAll(productsToSave);
		if (!replacedProducts.isEmpty()) {
			orderProductRepository.deleteAll(replacedProducts);
		}
	}

	private int qrSequence(String productQr) {
		if (!hasText(productQr)) return Integer.MAX_VALUE;
		int separatorIndex = productQr.lastIndexOf('-');
		if (separatorIndex < 0 || separatorIndex == productQr.length() - 1) return Integer.MAX_VALUE;
		try {
			return Integer.parseInt(productQr.substring(separatorIndex + 1));
		} catch (NumberFormatException ignored) {
			return Integer.MAX_VALUE;
		}
	}

	private String normalizeLot(String lot) {
		return lot == null ? "" : lot.trim();
	}

	private OrderProductionResponse toProductionResponse(OrderProduction production) {
		Map<String, Long> counts = OrderProductionResponse.emptyProcessCounts();
		if (production.getProducts() != null) {
			for (OrderProduct product : production.getProducts()) {
				if (product.getProcess() != null) counts.put(product.getProcess().name(), counts.getOrDefault(product.getProcess().name(), 0L) + 1);
			}
		}
		return OrderProductionResponse.from(production, counts);
	}

	private OrderProduction findProductionWithRelations(Long id, OrderProduction fallback) {
		return orderProductionRepository.findByIdWithPurchaseAndProducts(id).orElse(fallback);
	}

	private OrderPurchase findPurchase(String purchaseId) {
		return orderPurchaseRepository.findByPurchaseId(purchaseId)
				.orElseThrow(() -> new IllegalArgumentException("발주서를 찾을 수 없습니다."));
	}

	private void updatePurchaseStatus(OrderPurchase purchase, ProcessStatus status) {
		purchase.setStatus(status);
		orderPurchaseRepository.save(purchase);
	}

	private void saveCancelledPurchaseHistory(OrderPurchase purchase) {
		OrderPurchaseHistory history = orderPurchaseHistoryRepository.findByPurchaseId(purchase.getPurchaseId())
				.orElseGet(OrderPurchaseHistory::new);
		history.setPurchaseId(purchase.getPurchaseId());
		history.setCustomer(purchase.getCustomer());
		history.setProductName(purchase.getProductName());
		history.setQuantity(purchase.getQuantity());
		history.setPrice(purchase.getPrice());
		history.setDueDate(purchase.getDueDate());
		history.setCreatedTime(purchase.getCreatedTime());
		history.setStatus(ProcessStatus.CANCEL);
		history.setNote(purchase.getNote());
		orderPurchaseHistoryRepository.save(history);
	}

	private boolean hasText(String value) {
		return value != null && !value.trim().isEmpty();
	}
}
