"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import DeleteActionButton from "./DeleteActionButton";
import { getCategoryActiveClass } from "./categoryActiveStyles";
import type { CategoryActiveKey } from "./categoryActiveStyles";

export type SortDirection = "asc" | "desc";

export type SortCondition<TKey extends string> = {
  key: TKey;
  direction: SortDirection;
};

export type ListOption<TKey extends string> = {
  label: string;
  key: TKey;
};

type ListToolbarProps<TKey extends string> = {
  categoryKey?: CategoryActiveKey;
  options: ListOption<TKey>[];
  sortConditions: SortCondition<TKey>[];
  searchField: TKey;
  searchOptions: string[];
  searchText: string;
  onSearchFieldChange: (key: TKey) => void;
  onSearchTextChange: (value: string) => void;
  onSort: (key: TKey) => void;
  extraAction?: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
  };
  extraActions?: Array<{
    disabled?: boolean;
    label: string;
    onClick: () => void;
  }>;
  onDelete?: () => void;
  afterDelete?: ReactNode;
  selectedCount?: number;
};

export default function ListToolbar<TKey extends string>({
  categoryKey = "settings",
  options,
  sortConditions,
  searchField,
  searchOptions,
  searchText,
  onSearchFieldChange,
  onSearchTextChange,
  onSort,
  extraAction,
  extraActions,
  onDelete,
  afterDelete,
  selectedCount = 0,
}: ListToolbarProps<TKey>) {
  const [isFieldDropdownOpen, setIsFieldDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const visibleSearchOptions = searchOptions.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="mb-3 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {options.map((button) => {
          const condition = sortConditions.find((item) => item.key === button.key);

          return (
            <button
              className={`flex h-9 items-center gap-2 rounded-full px-4 text-xs font-bold ${
                condition
                  ? getCategoryActiveClass(categoryKey)
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
              key={button.key}
              onClick={() => onSort(button.key)}
              type="button"
            >
              {button.label}
              <SortIcon active={Boolean(condition)} direction={condition?.direction ?? "asc"} />
            </button>
          );
        })}
      </div>

      <div className="flex w-full items-start gap-2">
        <div
          className="relative min-w-[360px] max-w-[560px] flex-1"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsFieldDropdownOpen(false);
              setIsSearchDropdownOpen(false);
            }
          }}
        >
          <div className="flex h-10 overflow-hidden rounded-lg bg-[#f6f7f9]">
            <div className="relative shrink-0 border-r border-slate-200">
              <button
                className="flex h-full min-w-40 items-center justify-between gap-2 bg-transparent pl-3 pr-8 text-sm font-semibold text-slate-500 outline-none"
                onClick={() => {
                  setIsFieldDropdownOpen((current) => !current);
                  setIsSearchDropdownOpen(false);
                }}
                type="button"
              >
                {options.find((button) => button.key === searchField)?.label}
              </button>
              <ChevronDownIcon />
            </div>
            <div className="relative min-w-0 flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-slate-400">
                <SearchIcon />
              </div>
              <input
                className="h-full w-full bg-transparent pl-10 pr-10 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                onChange={(event) => {
                  onSearchTextChange(event.target.value);
                  setIsFieldDropdownOpen(false);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => {
                  setIsFieldDropdownOpen(false);
                  setIsSearchDropdownOpen(true);
                }}
                placeholder="검색어를 입력해주세요"
                value={searchText}
              />
              {searchText && (
                <button
                  aria-label="검색어 초기화"
                  className="absolute right-3 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-400 text-white hover:bg-slate-500"
                  onClick={() => {
                    onSearchTextChange("");
                    setIsSearchDropdownOpen(true);
                  }}
                  type="button"
                >
                  <XIcon />
                </button>
              )}
            </div>
          </div>

          {isFieldDropdownOpen && (
            <div className="absolute left-0 top-12 z-40 max-h-56 w-44 overflow-y-auto rounded-lg border border-slate-100 bg-white py-2 text-sm shadow-lg">
              {options.map((button) => (
                <button
                  className={`block w-full px-4 py-2 text-left font-semibold hover:bg-[#f6f7f9] ${
                    searchField === button.key ? "text-[#143f80]" : "text-slate-600"
                  }`}
                  key={button.key}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    onSearchFieldChange(button.key);
                    onSearchTextChange("");
                    setIsFieldDropdownOpen(false);
                    setIsSearchDropdownOpen(false);
                  }}
                  type="button"
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}

          {isSearchDropdownOpen && (
            <div className="absolute left-0 top-12 z-30 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-100 bg-white py-2 text-sm shadow-lg">
              {visibleSearchOptions.length > 0 ? (
                visibleSearchOptions.map((option) => (
                  <button
                    className="block w-full px-4 py-2 text-left font-semibold text-slate-600 hover:bg-[#f6f7f9]"
                    key={option}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      onSearchTextChange(option);
                      setIsSearchDropdownOpen(false);
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))
              ) : (
                <p className="px-4 py-3 text-slate-400">검색 결과가 없습니다.</p>
              )}
            </div>
          )}
        </div>
        {onDelete && <DeleteActionButton disabled={selectedCount === 0} onClick={onDelete} selectedCount={selectedCount} />}
        {afterDelete}
        {extraAction && (
          <button
            className="h-10 rounded-lg bg-teal-600 px-4 text-sm font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={extraAction.disabled}
            onClick={extraAction.onClick}
            type="button"
          >
            {extraAction.label}
          </button>
        )}
        {extraActions?.map((action) => (
          <button
            className="h-10 rounded-lg bg-slate-800 px-4 text-sm font-bold text-white transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={action.disabled}
            key={action.label}
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <svg
      aria-hidden="true"
      className={`size-3 ${active ? "opacity-100" : "opacity-40"}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d={direction === "asc" ? "m6 15 6-6 6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-3"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
