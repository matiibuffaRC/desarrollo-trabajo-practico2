import { useMemo, useRef, useState } from "react";
import { useApp } from "../../lib/AppContext";
import { formatMoney, sumBy, exportCSV } from "../../lib/finance";
import PageHeader from "../Components/PageHeader";
import ConfirmDialog from "../Components/ConfirmDialog";
import { EditIcon, DownloadIcon, UploadIcon, TrashIcon, ChevronRight } from "../Components/Icons";

function ProfilePage() {
  const { movements, setMovements, total, profile, setProfile, monthlyLimit, setMonthlyLimit, showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const stats = useMemo(() => {
    const first = movements.reduce((min, m) => Math.min(min, new Date(m.fecha).getTime()), Infinity);
    return {
      count: movements.length,
      ingresos: sumBy(movements, "Ingreso"),
      gastos: sumBy(movements, "Gasto"),
      since: Number.isFinite(first) ? new Date(first) : null,
    };
  }, [movements]);

  const save = () => {
    if (!draft.name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }
    if (draft.email && !/^\S+@\S+\.\S+$/.test(draft.email)) {
      setError("El correo no es válido");
      return;
    }
    setProfile({ ...draft, name: draft.name.trim(), email: draft.email.trim() });
    setEditing(false);
    setError("");
    showToast("Perfil actualizado");
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify({ version: 1, profile, monthlyLimit, movements }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-gastos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Backup descargado");
  };

  const importBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.movements;
      if (!Array.isArray(list) || !list.every((m) => m && m.id && m.tipo && m.fecha && Number.isFinite(Number(m.monto)))) {
        throw new Error("formato");
      }
      setMovements(list.map((m) => ({ ...m, monto: Number(m.monto) })));
      if (data.profile) setProfile((p) => ({ ...p, ...data.profile }));
      if (Number(data.monthlyLimit) > 0) setMonthlyLimit(Number(data.monthlyLimit));
      showToast(`${list.length} movimientos restaurados`);
    } catch {
      showToast("El archivo no es un backup válido");
    }
  };

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="animate-fade-up">
      <PageHeader eyebrow="Cuenta" title="Mi perfil" subtitle="Tu información, tus datos y la configuración de la app." />

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          {/* Tarjeta de perfil */}
          <section className="card overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-brand-500 via-indigo-400 to-emerald-300" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-ink text-3xl font-extrabold text-white ring-4 ring-white">
                  {initial}
                </div>
                {!editing && (
                  <button
                    onClick={() => {
                      setDraft(profile);
                      setEditing(true);
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                  >
                    <EditIcon className="h-3.5 w-3.5" /> Editar
                  </button>
                )}
              </div>

              {editing ? (
                <div className="animate-fade-up mt-4 grid gap-3">
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500">Nombre</span>
                    <input className="input mt-1" value={draft.name} maxLength={40} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-slate-500">Correo electrónico</span>
                    <input className="input mt-1" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
                  </label>
                  {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-600">
                      Cancelar
                    </button>
                    <button onClick={save} className="flex-[2] rounded-xl bg-ink py-2.5 text-sm font-bold text-white">
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <h2 className="text-xl font-extrabold">{profile.name}</h2>
                  <p className="text-sm text-slate-500">{profile.email}</p>
                  {stats.since && (
                    <p className="mt-2 text-xs text-slate-400">
                      Registrando movimientos desde {stats.since.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Resumen */}
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Saldo actual" value={formatMoney(total)} valueClass={total < 0 ? "text-rose-600" : ""} />
            <Stat label="Movimientos" value={stats.count} />
            <Stat label="Total ingresado" value={formatMoney(stats.ingresos)} valueClass="text-income" />
            <Stat label="Total gastado" value={formatMoney(stats.gastos)} valueClass="text-expense" />
          </div>
        </div>

        {/* Ajustes */}
        <section className="card p-2">
          <p className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-slate-400">Presupuesto</p>
          <div className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3">
            <div>
              <p className="text-sm font-bold">Límite mensual</p>
              <p className="num text-xs text-slate-500">{formatMoney(monthlyLimit)}</p>
            </div>
            <input
              type="number"
              min="1"
              step="1000"
              defaultValue={monthlyLimit}
              key={monthlyLimit}
              onBlur={(e) => {
                const n = Number(e.target.value);
                if (n > 0 && n !== monthlyLimit) {
                  setMonthlyLimit(n);
                  showToast("Límite mensual actualizado");
                } else e.target.value = monthlyLimit;
              }}
              className="input num !w-36 !rounded-xl !py-2 text-right text-sm"
              aria-label="Límite mensual"
            />
          </div>

          <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Tus datos</p>
          <SettingRow icon={DownloadIcon} title="Exportar a CSV" subtitle="Abrilo en Excel o Google Sheets" onClick={() => exportCSV(movements)} disabled={!movements.length} />
          <SettingRow icon={DownloadIcon} title="Descargar backup" subtitle="Archivo JSON con todos tus datos" onClick={exportBackup} />
          <SettingRow icon={UploadIcon} title="Restaurar backup" subtitle="Reemplaza los movimientos actuales" onClick={() => fileRef.current?.click()} />
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importBackup} />

          <p className="px-3 pb-1 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Zona de peligro</p>
          <SettingRow icon={TrashIcon} title="Borrar todos los datos" subtitle="Elimina movimientos y reinicia la app" danger onClick={() => setConfirmReset(true)} />
          <p className="px-3 pb-3 pt-4 text-center text-[11px] text-slate-400">Los datos se guardan solo en este navegador.</p>
        </section>
      </div>

      {confirmReset && (
        <ConfirmDialog
          title="¿Borrar todos los datos?"
          message="Se eliminan todos los movimientos de este navegador. Te recomendamos descargar un backup antes."
          confirmLabel="Borrar todo"
          danger
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            setMovements([]);
            setConfirmReset(false);
            showToast("Se borraron todos los datos");
          }}
        />
      )}
    </div>
  );
}

function Stat({ label, value, valueClass = "" }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`num mt-1 truncate text-lg font-extrabold ${valueClass}`}>{value}</p>
    </div>
  );
}

function SettingRow({ icon: Icon, title, subtitle, onClick, danger, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition disabled:opacity-40 ${danger ? "hover:bg-rose-50" : "hover:bg-slate-50"}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-bold ${danger ? "text-rose-600" : ""}`}>{title}</span>
        <span className="block truncate text-xs text-slate-500">{subtitle}</span>
      </span>
      <ChevronRight className="h-4 w-4 text-slate-300" />
    </button>
  );
}

export default ProfilePage;
