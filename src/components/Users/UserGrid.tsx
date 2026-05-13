"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type ColDef,
  type GridApi,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";
import {
  updateUserType,
  upgradeUserTier,
  downgradeUserTier,
  deleteUser,
  resetUserPassword,
} from "@/lib/admin/action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  Search,
  RefreshCcw,
  Loader2,
  FilterX,
  FileDown,
  TrendingUp,
  TrendingDown,
  Trash2,
  Key,
  Edit,
  Mail,
} from "lucide-react";

ModuleRegistry.registerModules([AllCommunityModule]);

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  role: string;
  isActive: boolean;
  tier?: string;
};

type UserGridProps = { users?: User[] };

const UserGrid: React.FC<UserGridProps> = ({ users = [] }) => {
  const router = useRouter();
  const [quickFilter, setQuickFilter] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [tierFilter, setTierFilter] = useState<string>("ALL");
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const gridApiRef = useRef<GridApi | null>(null);
  // columnApi kaldırıldı; güncel AG Grid versiyonunda doğrudan gridApi yeterli

  // Derived filtered data for client-side pre-filter (optional)
  const filteredUsers = useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return [];
    }
    return users.filter((u) => {
      if (userTypeFilter !== "ALL" && u.userType !== userTypeFilter)
        return false;
      if (activeFilter !== "ALL") {
        const shouldBeActive = activeFilter === "ACTIVE";
        if (u.isActive !== shouldBeActive) return false;
      }
      if (tierFilter !== "ALL" && (u.tier || "FREE") !== tierFilter)
        return false;
      return true;
    });
  }, [users, userTypeFilter, activeFilter, tierFilter]);

  const handleExport = useCallback(() => {
    if (!gridApiRef.current) return;
    gridApiRef.current.exportDataAsCsv({
      fileName: `kullanicilar-${new Date().toISOString().slice(0, 10)}.csv`,
      columnKeys: [
        "id",
        "firstName",
        "lastName",
        "email",
        "userType",
        "role",
        "tier",
        "isActive",
      ],
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setUserTypeFilter("ALL");
    setActiveFilter("ALL");
    setTierFilter("ALL");
    setQuickFilter("");
    gridApiRef.current?.setFilterModel(null as any);
    gridApiRef.current?.setGridOption?.("quickFilterText", "");
  }, []);

  const handleToggleUserType = useCallback(
    async (row: User) => {
      const isAuthor = row.userType === "AUTHOR";
      const targetType = isAuthor ? "REGULAR" : "AUTHOR";
      const toastId = toast.loading("Güncelleniyor...");
      setUpdatingIds((prev) => new Set(prev).add(row.id));
      try {
        await updateUserType(row.id, { userType: targetType });
        toast.update(toastId, {
          render: `${row.firstName || "Kullanıcı"} artık ${targetType === "AUTHOR" ? "YAZAR" : "REGULAR"
            }`,
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast.update(toastId, {
          render: err?.message || "Güncellenemedi",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [router]
  );

  const handleUpgradeTier = useCallback(
    async (row: User) => {
      const toastId = toast.loading("Tier yükseltiliyor...");
      setUpdatingIds((prev) => new Set(prev).add(row.id));
      try {
        await upgradeUserTier(row.id);
        toast.update(toastId, {
          render: `${row.firstName || "Kullanıcı"}'nın tier'ı yükseltildi`,
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast.update(toastId, {
          render: err?.message || "Tier yükseltilemedi",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [router]
  );

  const handleDowngradeTier = useCallback(
    async (row: User) => {
      const toastId = toast.loading("Tier düşürülüyor...");
      setUpdatingIds((prev) => new Set(prev).add(row.id));
      try {
        await downgradeUserTier(row.id);
        toast.update(toastId, {
          render: `${row.firstName || "Kullanıcı"}'nın tier'ı düşürüldü`,
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast.update(toastId, {
          render: err?.message || "Tier düşürülemedi",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [router]
  );

  const handleDeleteUser = useCallback(
    async (row: User) => {
      const result = await Swal.fire({
        title: "Kullanıcıyı Sil?",
        text: `${row.firstName} ${row.lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Evet, Sil",
        cancelButtonText: "İptal",
      });

      if (!result.isConfirmed) return;

      const toastId = toast.loading("Kullanıcı siliniyor...");
      setUpdatingIds((prev) => new Set(prev).add(row.id));
      try {
        await deleteUser(row.id);
        toast.update(toastId, {
          render: `${row.firstName || "Kullanıcı"} başarıyla silindi`,
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
        router.refresh();
      } catch (err: any) {
        console.error(err);
        toast.update(toastId, {
          render: err?.message || "Kullanıcı silinemedi",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [router]
  );

  const handleResetPassword = useCallback(
    async (row: User) => {
      const result = await Swal.fire({
        title: "Şifre Sıfırla",
        text: `${row.firstName} ${row.lastName} kullanıcısının şifresini sıfırlamak istediğinizden emin misiniz?`,
        input: "password",
        inputLabel: "Yeni Şifre",
        inputPlaceholder: "En az 6 karakter",
        inputAttributes: {
          minLength: "6",
        },
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Şifreyi Sıfırla",
        cancelButtonText: "İptal",
        inputValidator: (value) => {
          if (!value || value.length < 6) {
            return "Şifre en az 6 karakter olmalıdır";
          }
          return null;
        },
      });

      if (!result.isConfirmed || !result.value) return;

      const toastId = toast.loading("Şifre sıfırlanıyor...");
      setUpdatingIds((prev) => new Set(prev).add(row.id));
      try {
        await resetUserPassword(row.id, result.value);
        toast.update(toastId, {
          render: `${row.firstName || "Kullanıcı"
            }'nın şifresi başarıyla sıfırlandı`,
          type: "success",
          isLoading: false,
          autoClose: 2500,
        });
      } catch (err: any) {
        console.error(err);
        toast.update(toastId, {
          render: err?.message || "Şifre sıfırlanamadı",
          type: "error",
          isLoading: false,
          autoClose: 3500,
        });
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
      }
    },
    [router]
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 110,
      flex: 1,
    }),
    []
  );

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      // {
      //   headerName: "ID",
      //   field: "id",
      //   minWidth: 140,
      //   maxWidth: 180,
      //   cellClass: "font-mono text-[11px] tracking-tight",
      // },
      {
        headerName: "Ad Soyad",
        valueGetter: (p) =>
          `${p.data?.firstName || ""} ${p.data?.lastName || ""}`.trim(),
        minWidth: 160,
        cellRenderer: (params: any) => (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800 truncate max-w-[180px]">
              {params.value || "—"}
            </span>
            {!params.data.isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                PASİF
              </span>
            )}
          </div>
        ),
      },
      {
        headerName: "Email",
        field: "email",
        minWidth: 220,
        cellRenderer: (p: any) => (
          <button
            onClick={() => {
              navigator.clipboard.writeText(p.value || "");
              toast.success("E-posta kopyalandı", { autoClose: 1500 });
            }}
            className="text-left group truncate max-w-[240px] hover:text-blue-600 focus:outline-none"
            title={p.value}
          >
            <span className="group-hover:underline">{p.value}</span>
          </button>
        ),
      },
      {
        headerName: "Tip",
        field: "userType",
        minWidth: 110,
        maxWidth: 130,
        cellRenderer: (p: any) => (
          <span
            className={
              p.value === "AUTHOR"
                ? "px-2 py-0.5 rounded text-[11px] font-semibold bg-green-100 text-green-700 border border-purple-200"
                : "px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
            }
          >
            {p.value === "AUTHOR" ? "YAZAR" : "REGULAR"}
          </span>
        ),
      },
      {
        headerName: "Rol",
        field: "role",
        minWidth: 110,
        maxWidth: 140,
        cellRenderer: (p: any) => (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            {p.value || "—"}
          </span>
        ),
      },
      {
        headerName: "Tier",
        field: "tier",
        minWidth: 100,
        maxWidth: 120,
        cellRenderer: (p: any) => {
          const tier = p.value || "FREE";
          const tierColors = {
            FREE: "bg-gray-100 text-gray-700 border-gray-200",
            PAID: "bg-blue-100 text-blue-700 border-blue-200",
            PREMIUM: "bg-purple-100 text-purple-700 border-purple-200",
            VIP: "bg-yellow-100 text-yellow-700 border-yellow-200",
          };
          return (
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${tierColors[tier as keyof typeof tierColors] || tierColors.FREE
                }`}
            >
              {tier}
            </span>
          );
        },
      },
      {
        headerName: "Aktif",
        field: "isActive",
        minWidth: 90,
        maxWidth: 110,
        cellRenderer: (p: any) => (
          <span
            className={
              p.value
                ? "text-green-600 font-semibold text-xs"
                : "text-red-500 font-medium text-xs"
            }
          >
            {p.value ? "Evet" : "Hayır"}
          </span>
        ),
      },
      {
        headerName: "İşlem",
        field: "id",
        minWidth: 380,
        maxWidth: 420,
        sortable: false,
        filter: false,
        cellRenderer: (params: any) => {
          const row: User = params.data;
          const isAuthor = row.userType === "AUTHOR";
          const loading = updatingIds.has(row.id);
          const currentTier = row.tier || "FREE";

          // Tier seviyesi kontrolü
          const canUpgrade = currentTier !== "VIP";
          const canDowngrade = ["PAID", "PREMIUM", "VIP"].includes(currentTier);

          return (
            <div className="flex items-center gap-1">
              <button
                disabled={loading}
                onClick={() => router.push(`/users/edit/${row.id}`)}
                className="px-2 py-1 bg-zinc-700 hover:bg-zinc-800 disabled:opacity-30 text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                title="Düzenle"
              >
                <Edit className="w-3 h-3" />
                Düz.
              </button>

              <button
                disabled={loading}
                onClick={() => handleToggleUserType(row)}
                className={
                  isAuthor
                    ? "px-2 py-1 bg-green-500 hover:bg-yellow-600 disabled:opacity-50 text-white rounded text-[10px] font-medium transition"
                    : "px-2 py-1 bg-zinc-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-[10px] font-medium transition"
                }
              >
                {loading ? (
                  <Loader2 className="animate-spin w-3 h-3" />
                ) : isAuthor ? (
                  "Kullanıcı Yap"
                ) : (
                  "Yazar Yap"
                )}
              </button>

              <button
                disabled={loading || !canUpgrade}
                onClick={() => handleUpgradeTier(row)}
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30  text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                title={
                  canUpgrade ? "Tier'ı yükselt" : "Maksimum tier seviyesinde"
                }
              >
                <TrendingUp className="w-3 h-3" />
                {loading ? "..." : "↑"}
              </button>

              <button
                disabled={loading}
                onClick={() => handleDowngradeTier(row)}
                className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:opacity-30  text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                title={
                  canDowngrade ? "Tier'ı düşür" : "Minimum tier seviyesinde"
                }
              >
                <TrendingDown className="w-3 h-3" />
                {loading ? "..." : "↓"}
              </button>

              <button
                disabled={loading}
                onClick={() => handleResetPassword(row)}
                className="px-2 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-30 text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                title="Şifre sıfırla"
              >
                <Key className="w-3 h-3" />
                {loading ? "..." : "Şifre"}
              </button>

              <button
                disabled={loading}
                onClick={() => handleDeleteUser(row)}
                className="px-2 py-1 bg-red-500 hover:bg-red-600 disabled:opacity-30 text-white rounded text-[10px] font-medium transition flex items-center gap-1"
                title="Kullanıcıyı sil"
              >
                <Trash2 className="w-3 h-3" />
                {loading ? "..." : "Sil"}
              </button>
            </div>
          );
        },
      },
    ],
    [
      handleToggleUserType,
      handleUpgradeTier,
      handleDowngradeTier,
      handleDeleteUser,
      handleResetPassword,
      updatingIds,
    ]
  );

  useEffect(() => {
    if (gridApiRef.current?.setGridOption) {
      gridApiRef.current.setGridOption("quickFilterText", quickFilter);
    }
  }, [quickFilter]);

  const total = users?.length || 0;
  const afterPrimaryFilter = filteredUsers.length;

  return (
    <div className="w-full max-w-7xl my-10 mx-auto px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-end gap-4 justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Kullanıcılar
          </h1>
          <p className="text-sm text-gray-500">
            Toplam {total} kayıt • Filtre sonrası {afterPrimaryFilter}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={quickFilter}
              onChange={(e) => setQuickFilter(e.target.value)}
              placeholder="Hızlı ara (ad, email...)"
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={userTypeFilter}
              onChange={(e) => setUserTypeFilter(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tip: Hepsi</option>
              <option value="AUTHOR">Yazar</option>
              <option value="REGULAR">Regular</option>
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tier: Hepsi</option>
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
              <option value="PREMIUM">Premium</option>
              <option value="VIP">VIP</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Durum: Hepsi</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PASSIVE">Pasif</option>
            </select>
            <button
              onClick={handleClearFilters}
              className="px-3 py-2.5 flex items-center gap-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
            >
              <FilterX className="w-4 h-4" /> Sıfırla
            </button>
            <button
              onClick={() => router.refresh()}
              className="px-3 py-2.5 flex items-center gap-1 text-sm rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-blue-300"
            >
              <RefreshCcw className="w-4 h-4" /> Yenile
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2.5 flex items-center gap-1 text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white border border-green-600"
            >
              <FileDown className="w-4 h-4" /> CSV
            </button>
            <button
              onClick={() => router.push("/users/send-bulk-email")}
              className="px-3 py-2.5 flex items-center gap-1 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white border border-blue-600"
            >
              <Mail className="w-4 h-4" /> Toplu Mail
            </button>
          </div>
        </div>
      </div>

      <div className="w-full ag-theme-material rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        <style>{`
          .ag-theme-material .ag-header {
            background: #f9fafb;
            font-weight: 600;
            font-size: 0.78rem;
            letter-spacing: .5px;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }
          .ag-theme-material .ag-row {
            font-size: 0.82rem;
            line-height: 1.3;
            min-height: 40px !important;
            max-height: 40px !important;
          }
          .ag-theme-material .ag-cell {
            padding: 4px 8px !important;
            white-space: nowrap;
          }
          .ag-theme-material .ag-row:nth-child(even) { background: #fafbfc; }
          .ag-theme-material .ag-row:hover { background: #eef5ff !important; }
          .ag-theme-material .ag-root-wrapper { border-radius: 0; }
          .ag-theme-material .inactive-row { opacity: .6; }
          @media (max-width: 900px){
            .ag-theme-material .ag-header, .ag-theme-material .ag-row { font-size: 0.75rem; }
          }
        `}</style>
        <AgGridReact
          rowData={filteredUsers}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={25}
          paginationPageSizeSelector={[25, 50, 100]}
          domLayout="autoHeight"
          rowHeight={40}
          headerHeight={42}
          suppressCellFocus
          enableCellTextSelection
          animateRows
          overlayNoRowsTemplate="<div class='p-6 text-gray-500 flex flex-col items-center text-sm'><span class='mb-1 font-medium'>Kayıt bulunamadı</span><span>Filtreleri değiştirin veya sıfırlayın.</span></div>"
          onGridReady={(params) => {
            gridApiRef.current = params.api;
            setTimeout(() => {
              params.api.sizeColumnsToFit();
            }, 80);
          }}
          getRowClass={(p) => (!p.data?.isActive ? "inactive-row" : "")}
        />
      </div>
    </div>
  );
};

export default UserGrid;
