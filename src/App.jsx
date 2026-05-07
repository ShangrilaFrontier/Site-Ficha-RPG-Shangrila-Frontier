import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Download, RotateCcw, Plus, Minus, Heart, Zap, Droplets, Sword, Shield, Star, Backpack, Sparkles } from "lucide-react";

const initialSheet = {
  nome: "",
  titulo: "",
  nivel: 1,
  raca: "",
  origem: "",
  classe: "",
  alinhamento: "",
  exp: 0,
  proximoNivel: 100,
  hpAtual: 10,
  hpMax: 10,
  manaAtual: 10,
  manaMax: 10,
  staminaAtual: 10,
  staminaMax: 10,
  pontosDisponiveis: 0,
  atributos: {
    forca: 0,
    destreza: 0,
    vitalidade: 0,
    inteligencia: 0,
    percepcao: 0,
    sorte: 0,
  },
  status: {
    ataque: "",
    defesa: "",
    ataqueMagico: "",
    defesaMagica: "",
    precisao: "",
    esquiva: "",
    critico: "",
    danoCritico: "",
    velocidade: "",
    recarga: "",
    reducaoDano: "",
    rouboVida: "",
  },
  imagem: "",
  biografia: "",
  habilidadesAtivas: Array(6).fill(""),
  habilidadesPassivas: Array(7).fill(""),
  perks: Array(10).fill(""),
  equipamentos: {
    arma: "",
    subarma: "",
    cabeca: "",
    peito: "",
    luvas: "",
    pernas: "",
    botas: "",
    acessorio1: "",
    acessorio2: "",
  },
  inventarioRapido: Array(10).fill(""),
  inventarioGeral: Array(40).fill(""),
};

const attrInfo = [
  ["forca", "FORÇA", "Aumenta dano físico e capacidade de carga.", "text-rose-600", Sword],
  ["destreza", "DESTREZA", "Melhora precisão, esquiva e velocidade.", "text-cyan-600", Zap],
  ["vitalidade", "VITALIDADE", "Aumenta HP máximo e resistência física.", "text-green-600", Heart],
  ["inteligencia", "INTELIGÊNCIA", "Aumenta mana e poder de habilidades.", "text-blue-600", Sparkles],
  ["percepcao", "PERCEPÇÃO", "Melhora detecção e chance de crítico.", "text-amber-600", Star],
  ["sorte", "SORTE", "Aumenta drops, eventos raros e críticos.", "text-violet-600", Star],
];

const equipLabels = {
  arma: "Arma",
  subarma: "Subarma",
  cabeca: "Cabeça",
  peito: "Peito",
  luvas: "Luvas",
  pernas: "Pernas",
  botas: "Botas",
  acessorio1: "Acessório 1",
  acessorio2: "Acessório 2",
};

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="grid grid-cols-[120px_1fr] items-center gap-2 text-xs font-semibold text-blue-950">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full border-b border-blue-300 bg-transparent px-2 py-1 outline-none focus:border-blue-700"
      />
    </label>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border border-blue-400/70 bg-white/85 p-4 shadow-[0_0_24px_rgba(37,99,235,0.18)] backdrop-blur ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-white/70" />
      {title && <h2 className="mb-3 text-center text-lg font-black tracking-[0.18em] text-blue-900">{title}</h2>}
      {children}
    </motion.section>
  );
}

function Bar({ icon: Icon, label, current, max, color, onCurrent, onMax }) {
  const percent = Math.max(0, Math.min(100, max ? (current / max) * 100 : 0));
  return (
    <Panel className="min-h-[116px]">
      <div className="flex items-center gap-3">
        <Icon className={color} size={34} />
        <div className="flex-1">
          <div className={`text-xl font-black ${color}`}>{label}</div>
          <div className="mt-2 flex items-center gap-2">
            <input type="number" value={current} onChange={(e) => onCurrent(Number(e.target.value))} className="w-20 border-b border-blue-300 bg-transparent text-center outline-none" />
            <span>/</span>
            <input type="number" value={max} onChange={(e) => onMax(Number(e.target.value))} className="w-20 border-b border-blue-300 bg-transparent text-center outline-none" />
          </div>
          <div className="mt-3 h-3 rounded-full bg-blue-100">
            <div className="h-3 rounded-full bg-current transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

export default function App() {
  const [sheet, setSheet] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shangri-frontier-ficha")) || initialSheet;
    } catch {
      return initialSheet;
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem("shangri-frontier-ficha", JSON.stringify(sheet));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 900);
    return () => clearTimeout(t);
  }, [sheet]);

  const set = (key, value) => setSheet((s) => ({ ...s, [key]: value }));
  const setNested = (group, key, value) => setSheet((s) => ({ ...s, [group]: { ...s[group], [key]: value } }));
  const setArray = (group, index, value) => setSheet((s) => ({ ...s, [group]: s[group].map((item, i) => (i === index ? value : item)) }));

  const totalAtributos = useMemo(() => Object.values(sheet.atributos).reduce((a, b) => a + Number(b || 0), 0), [sheet.atributos]);

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("imagem", reader.result);
    reader.readAsDataURL(file);
  }

  function exportarFicha() {
    const blob = new Blob([JSON.stringify(sheet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheet.nome || "ficha"}-shangri-frontier.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importarFicha(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        setSheet({ ...initialSheet, ...JSON.parse(reader.result) });
      } catch {
        alert("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eff6ff,#ffffff_45%,#dbeafe)] p-4 text-blue-950">
      <div className="mx-auto max-w-[1500px] rounded-[2rem] border-2 border-blue-500 bg-white/55 p-4 shadow-[0_0_35px_rgba(37,99,235,0.45)]">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-300 bg-white/80 p-4">
          <div>
            <h1 className="text-4xl font-black tracking-widest text-blue-950">SHANGRI-LA FRONTIER</h1>
            <p className="text-sm font-bold tracking-[0.3em] text-blue-700">FICHA DIGITAL DE PERSONAGEM</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportarFicha} className="flex items-center gap-2 rounded-xl border border-blue-400 px-3 py-2 font-bold hover:bg-blue-50"><Download size={18}/> Exportar</button>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-400 px-3 py-2 font-bold hover:bg-blue-50"><Upload size={18}/> Importar<input type="file" accept=".json" onChange={importarFicha} className="hidden" /></label>
            <button onClick={() => confirm("Resetar ficha?") && setSheet(initialSheet)} className="flex items-center gap-2 rounded-xl border border-red-300 px-3 py-2 font-bold text-red-600 hover:bg-red-50"><RotateCcw size={18}/> Resetar</button>
            <div className="flex items-center gap-2 rounded-xl bg-blue-900 px-3 py-2 font-bold text-white"><Save size={18}/> {saved ? "Salvando..." : "Salvo"}</div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr_360px]">
          <aside className="space-y-4">
            <Panel>
              <div className="mb-3 aspect-[3/4] overflow-hidden rounded-2xl border border-blue-300 bg-blue-50/70">
                {sheet.imagem ? <img src={sheet.imagem} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-center text-sm font-bold text-blue-300">IMAGEM DO PERSONAGEM</div>}
              </div>
              <label className="block cursor-pointer rounded-xl bg-blue-900 px-3 py-2 text-center font-bold text-white hover:bg-blue-800">Enviar imagem<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
            </Panel>

            <Panel title="DADOS">
              <div className="space-y-2">
                <Field label="NOME" value={sheet.nome} onChange={(v) => set("nome", v)} />
                <Field label="TÍTULO" value={sheet.titulo} onChange={(v) => set("titulo", v)} />
                <Field label="NÍVEL" type="number" value={sheet.nivel} onChange={(v) => set("nivel", v)} />
                <Field label="RAÇA" value={sheet.raca} onChange={(v) => set("raca", v)} />
                <Field label="ORIGEM" value={sheet.origem} onChange={(v) => set("origem", v)} />
                <Field label="CLASSE" value={sheet.classe} onChange={(v) => set("classe", v)} />
                <Field label="EXP" type="number" value={sheet.exp} onChange={(v) => set("exp", v)} />
                <Field label="PRÓX. NÍVEL" type="number" value={sheet.proximoNivel} onChange={(v) => set("proximoNivel", v)} />
              </div>
            </Panel>

            <Panel title="BIOGRAFIA">
              <textarea value={sheet.biografia} onChange={(e) => set("biografia", e.target.value)} className="h-40 w-full resize-none rounded-xl border border-blue-200 bg-white/60 p-3 outline-none focus:border-blue-600" />
            </Panel>
          </aside>

          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Bar icon={Heart} label="HP" current={sheet.hpAtual} max={sheet.hpMax} color="text-green-600" onCurrent={(v) => set("hpAtual", v)} onMax={(v) => set("hpMax", v)} />
              <Bar icon={Zap} label="STAMINA" current={sheet.staminaAtual} max={sheet.staminaMax} color="text-blue-600" onCurrent={(v) => set("staminaAtual", v)} onMax={(v) => set("staminaMax", v)} />
              <Bar icon={Droplets} label="MANA" current={sheet.manaAtual} max={sheet.manaMax} color="text-violet-600" onCurrent={(v) => set("manaAtual", v)} onMax={(v) => set("manaMax", v)} />
            </div>

            <Panel title="ATRIBUTOS">
              <div className="space-y-2">
                {attrInfo.map(([key, label, desc, color, Icon]) => (
                  <div key={key} className="grid grid-cols-[44px_150px_80px_1fr_100px] items-center gap-3 rounded-xl border border-blue-200 bg-white/70 p-2">
                    <Icon className={color} />
                    <span className={`font-black ${color}`}>{label}</span>
                    <input type="number" value={sheet.atributos[key]} onChange={(e) => setNested("atributos", key, Number(e.target.value))} className="rounded-lg border border-blue-200 bg-white p-2 text-center font-bold outline-none" />
                    <span className="text-sm">{desc}</span>
                    <div className="flex overflow-hidden rounded-lg border border-blue-200">
                      <button onClick={() => setNested("atributos", key, Number(sheet.atributos[key]) - 1)} className="flex-1 p-2 hover:bg-blue-50"><Minus size={16}/></button>
                      <button onClick={() => setNested("atributos", key, Number(sheet.atributos[key]) + 1)} className="flex-1 p-2 hover:bg-blue-50"><Plus size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center text-sm font-bold">TOTAL DE ATRIBUTOS: {totalAtributos}</div>
            </Panel>

            <Panel title="HABILIDADES ATIVAS">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                {sheet.habilidadesAtivas.map((v, i) => <textarea key={i} value={v} onChange={(e) => setArray("habilidadesAtivas", i, e.target.value)} placeholder={`${i + 1}`} className="h-24 resize-none rounded-xl border border-blue-200 bg-white/70 p-2 text-sm outline-none" />)}
              </div>
            </Panel>

            <Panel title="HABILIDADES PASSIVAS">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
                {sheet.habilidadesPassivas.map((v, i) => <textarea key={i} value={v} onChange={(e) => setArray("habilidadesPassivas", i, e.target.value)} placeholder={`Passiva ${i + 1}`} className="h-24 resize-none rounded-2xl border border-blue-200 bg-white/70 p-2 text-sm outline-none" />)}
              </div>
            </Panel>

            <Panel title="EQUIPAMENTOS">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {Object.entries(equipLabels).map(([key, label]) => <textarea key={key} value={sheet.equipamentos[key]} onChange={(e) => setNested("equipamentos", key, e.target.value)} placeholder={label} className="h-28 resize-none rounded-xl border border-blue-200 bg-white/70 p-2 text-sm outline-none" />)}
              </div>
            </Panel>
          </section>

          <aside className="space-y-4">
            <Panel title="STATUS">
              <div className="space-y-2">
                {Object.keys(sheet.status).map((key) => <Field key={key} label={key.toUpperCase()} value={sheet.status[key]} onChange={(v) => setNested("status", key, v)} />)}
              </div>
            </Panel>

            <Panel title="PERKS">
              <div className="grid grid-cols-2 gap-3">
                {sheet.perks.map((v, i) => <textarea key={i} value={v} onChange={(e) => setArray("perks", i, e.target.value)} placeholder={`Perk ${i + 1}`} className="h-20 resize-none rounded-xl border border-blue-200 bg-white/70 p-2 text-sm outline-none" />)}
              </div>
            </Panel>

            <Panel title="INVENTÁRIO RÁPIDO">
              <div className="grid grid-cols-5 gap-2">
                {sheet.inventarioRapido.map((v, i) => <input key={i} value={v} onChange={(e) => setArray("inventarioRapido", i, e.target.value)} placeholder={`${i === 9 ? 0 : i + 1}`} className="h-14 rounded-lg border border-blue-200 bg-white/70 p-1 text-center text-xs outline-none" />)}
              </div>
            </Panel>

            <Panel title="INVENTÁRIO GERAL">
              <div className="grid grid-cols-2 gap-2">
                {sheet.inventarioGeral.map((v, i) => <input key={i} value={v} onChange={(e) => setArray("inventarioGeral", i, e.target.value)} placeholder={`Item ${i + 1}`} className="rounded-lg border border-blue-200 bg-white/70 p-2 text-xs outline-none" />)}
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}
