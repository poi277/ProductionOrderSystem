"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { userEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import DataListTable from "../common/DataListTable";
import type { DataListColumn } from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { matchesSearch } from "../common/listDataUtils";
import { useRowSelection } from "../common/useRowSelection";
import { useAuth } from "../login/AuthContext";

type Role = "USER" | "ADMIN";
type SearchKey = "name" | "role";

type UserRow = {
  id: string;
  name: string;
  role: Role;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const roleLabels: Record<Role, string> = {
  USER: "일반인",
  ADMIN: "관리자",
};

export default function SettingsPermissionsPage() {
  const router = useRouter();
  const { role, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [savedRoles, setSavedRoles] = useState<Record<string, Role>>({});
  const [searchField, setSearchField] = useState<SearchKey>("name");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { selectedIds, setSelectedIds, toggleOne } = useRowSelection<string>();

  useEffect(() => {
    if (!authLoading && role !== "ADMIN") router.replace("/dashboard");
  }, [authLoading, role, router]);

  useEffect(() => {
    if (authLoading || role !== "ADMIN") return;
    let ignore = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await apiClient(userEndpoints.root, { cache: "no-store" });
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "사용자 목록을 불러오지 못했습니다."));
        const result = (await response.json()) as ApiResponse<UserRow[]>;
        if (!ignore) {
          setUsers(result.data);
          setSavedRoles(Object.fromEntries(result.data.map((user) => [user.id, user.role])));
        }
      } catch (caught) {
        if (!ignore) setError(caught instanceof Error ? caught.message : "사용자 목록을 불러오지 못했습니다.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    void loadUsers();
    return () => { ignore = true; };
  }, [authLoading, role]);

  const changedUsers = users.filter((user) => savedRoles[user.id] !== user.role);
  const filteredUsers = users.filter((user) =>
    matchesSearch(searchField === "name" ? user.name : roleLabels[user.role], searchText),
  );
  const searchOptions = Array.from(new Set(users.map((user) =>
    searchField === "name" ? user.name : roleLabels[user.role],
  )));

  const columns = useMemo<DataListColumn<UserRow>[]>(() => [
    { align: "center", header: "이름", key: "name", render: (user) => user.name },
    {
      align: "center",
      header: "Role",
      key: "role",
      render: (user) => (
        <select
          aria-label={`${user.name} 권한`}
          className="h-9 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#143f80]"
          onChange={(event) => {
            const nextRole = event.target.value as Role;
            setUsers((current) => current.map((item) => item.id === user.id ? { ...item, role: nextRole } : item));
            setError("");
          }}
          onClick={(event) => event.stopPropagation()}
          value={user.role}
        >
          <option value="ADMIN">관리자</option>
          <option value="USER">일반인</option>
        </select>
      ),
    },
  ], []);

  const saveRoles = async () => {
    if (changedUsers.length === 0) return;
    setError("");
    const response = await apiClient(userEndpoints.roles, {
      method: "PUT",
      json: changedUsers.map(({ id, role: nextRole }) => ({ id, role: nextRole })),
    });
    if (!response.ok) {
      notifySidebar(await getApiErrorMessage(response, "권한을 저장하지 못했습니다."), true);
      return;
    }
    const result = (await response.json()) as ApiResponse<UserRow[]>;
    setSavedRoles((current) => ({ ...current, ...Object.fromEntries(result.data.map((user) => [user.id, user.role])) }));
    notifySidebar(result.message || "권한을 저장했습니다.");
  };

  const deleteUsers = async () => {
    if (selectedIds.length === 0 || !window.confirm(`${selectedIds.length}명의 사용자를 삭제하시겠습니까?`)) return;
    setError("");
    const response = await apiClient(userEndpoints.root, { method: "DELETE", json: { ids: selectedIds } });
    if (!response.ok) {
      notifySidebar(await getApiErrorMessage(response, "사용자를 삭제하지 못했습니다."), true);
      return;
    }
    const result = (await response.json()) as ApiResponse<null>;
    setUsers((current) => current.filter((user) => !selectedIds.includes(user.id)));
    setSelectedIds([]);
    notifySidebar(result.message || "사용자를 삭제했습니다.");
  };

  if (authLoading || role !== "ADMIN") return null;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="settings"
          extraAction={{ disabled: changedUsers.length === 0, label: "저장", onClick: saveRoles }}
          onDelete={deleteUsers}
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={() => undefined}
          options={[{ key: "name", label: "이름" }, { key: "role", label: "Role" }]}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={selectedIds.length}
          sortConditions={[]}
        />
        <DataListTable
          categoryKey="settings"
          checkedRowIds={selectedIds}
          columns={columns}
          emptyMessage={isLoading ? "사용자 목록을 불러오는 중입니다." : error ? "" : "등록된 사용자가 없습니다."}
          getRowId={(user) => user.id}
          onCheckboxChange={(user) => toggleOne(user.id)}
          rows={filteredUsers}
        />
      </section>
    </main>
  );
}

function notifySidebar(message: string, error = false) {
  window.dispatchEvent(new CustomEvent("order-sidebar-notification", { detail: { error, message } }));
}
