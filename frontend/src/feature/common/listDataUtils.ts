import type { SortCondition } from "./ListToolbar";

export function normalizeSearchText(value: unknown) {
  return String(value).toLowerCase();
}

export function matchesSearch(value: unknown, searchText: string) {
  return normalizeSearchText(value).includes(normalizeSearchText(searchText));
}

export function compareText(left: unknown, right: unknown) {
  return String(left).localeCompare(String(right), "ko");
}

export function compareNumericText(left: unknown, right: unknown) {
  return String(left).localeCompare(String(right), "ko", { numeric: true });
}

export function compareNumberOrText(left: unknown, right: unknown) {
  return typeof left === "number" && typeof right === "number"
    ? left - right
    : compareText(left, right);
}

export function sortByConditions<TItem, TKey extends string, TValue>(
  items: TItem[],
  conditions: SortCondition<TKey>[],
  getValue: (item: TItem, key: TKey) => TValue,
  compareValues: (left: TValue, right: TValue) => number,
) {
  return [...items].sort((left, right) => {
    for (const condition of conditions) {
      const result = compareValues(getValue(left, condition.key), getValue(right, condition.key));
      if (result !== 0) return condition.direction === "asc" ? result : -result;
    }
    return 0;
  });
}

export function updateSortConditions<TKey extends string>(
  current: SortCondition<TKey>[],
  key: TKey,
) {
  const existing = current.find((condition) => condition.key === key);
  if (!existing) return [...current, { key, direction: "asc" as const }];
  if (existing.direction === "asc") {
    return current.map((condition) =>
      condition.key === key ? { ...condition, direction: "desc" as const } : condition,
    );
  }
  return current.filter((condition) => condition.key !== key);
}
