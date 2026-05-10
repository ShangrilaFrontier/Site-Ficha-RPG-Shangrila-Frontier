import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Download, RotateCcw, Plus, Minus, Heart, Zap, Droplets, Sword, Shield, Star, Sparkles, Trash2 } from "lucide-react";

const emptyCard = { nome: "", descricao: "", dano: "", critico: "", custo: "", tipo: "" };

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
  ataques: [],
  habilidadesAtivas: [],
  habilidadesPassivas: [],
  magias: [],
  perks: [],
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
  inventarioGeral: [],
};

const attrInfo = [
  ["forca", "FORÇA", "Aumenta o dano físico e a capacidade de carga.", "text-rose-600", Sword],
  ["destreza", "DESTREZA", "Melhor precisão, esquiva e velocidade.", "text-cyan-600", Zap],
  ["vitalidade", "VITALIDADE", "Aumenta HP máximo e resistência física.", "text-green-600", Heart],
  ["inteligencia", "INTELIGÊNCIA", "Aumenta mana e poder de habilidades.", "text-blue-600", Sparkles],
  ["percepcao", "PERCEPÇÃO", "Melhor detecção e chance de crítico.", "text-amber-600", Star],
  ["sorte", "SORTE", "Quedas crescentes, eventos raros e críticos.", "text-violet-600", Star],
];

const tabs = [
  { id: "atributos", label: "ATRIBUTOS" },
  { id: "combate", label: "COMBATE", button: "Novo Ataque", list: "ataques", search: "Filtrar ataques" },
  { id: "habilidades", label: "HABILIDADES", button: "Nova Habilidade", list: "habilidadesAtivas", search: "Filtrar habilidades" },
  { id: "magias", label: "MAGIAS", button: "Nova Magia", list: "magias", search: "Filtrar magias" },
  { id: "inventario", label: "INVENTÁRIO", button: "Novo Item", list: "inventarioGeral", search: "Filtrar itens" },
  { id: "perks", label: "VANTAGENS", button: "Nova Perk", list: "perks", search: "Filtrar perks" },
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
    <label className="grid grid-cols-[86px_1fr] items-center gap-2 text-[11px] font-bold uppercase text-zinc-300">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
        className="w-full border-b border-zinc-700 bg-transparent px-1 py-1 outline-none focus:border-blue-700"
      />
    </label>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-xl border border-zinc-700 bg-[#1d1f26] p-3 shadow-[0_0_18px_rgba(37,99,235,0.16)] ${className}`}
    >
      {title && <h2 className="mb-3 text-center text-base font-black tracking-[0.28em] text-purple-300">{title}</h2>}
      {children}
    </motion.section>
  );
}

function Bar({ icon: Icon, label, current, max, color, onCurrent, onMax }) {
  const percent = Math.max(0, Math.min(100, max ? (current / max) * 100 : 0));
  return (
    <Panel>
      <div className="flex items-center gap-3">
        <Icon className={color} size={24} />
        <div className="flex-1">
          <div className={`text-lg font-black ${color}`}>{label}</div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <input type="number" value={current} onChange={(e) => onCurrent(Number(e.target.value))} className="w-16 border-b border-zinc-700 bg-transparent text-center outline-none" />
            <span>/</span>
            <input type="number" value={max} onChange={(e) => onMax(Number(e.target.value))} className="w-16 border-b border-zinc-700 bg-transparent text-center outline-none" />
          </div>
          <div className="mt-2 h-3 rounded-full bg-zinc-800">
            <div className="h-3 rounded-full bg-purple-700 transition-all" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Panel>
  );
}

function CardList({ title, button, list, onAdd, onUpdate, onDelete, search, setSearch, compact = false }) {
  const filtered = list.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
  return (
    <Panel title={title} className="min-h-[520px]">
      <div className="mb-3 grid gap-3 md:grid-cols-[1fr_auto]">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filtrar..." className="rounded-lg border border-zinc-700 bg-[#101116] px-3 py-2 text-sm outline-none focus:border-blue-700" />
        <button onClick={onAdd} className="rounded-lg border border-purple-500 bg-purple-700 px-4 py-2 text-sm font-black text-white hover:bg-blue-800">
          <Plus size={16} className="inline" /> {button}
        </button>
      </div>

      <div className={compact ? "grid gap-3 md:grid-cols-2" : "space-y-3"}>
        {filtered.map((item, i) => {
          const realIndex = list.indexOf(item);
          return (
            <div key={realIndex} className="rounded-xl border border-zinc-700 bg-[#15161b] p-3">
              <div className="flex gap-2">
                <input value={item.nome} onChange={(e) => onUpdate(realIndex, { ...item, nome: e.target.value })} placeholder="Nome" className="w-full border-b border-zinc-700 bg-transparent font-bold outline-none" />
                <button onClick={() => onDelete(realIndex)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
              </div>
              <div className="mt-2 grid gap-2 md:grid-cols-4">
                <input value={item.dano} onChange={(e) => onUpdate(realIndex, { ...item, dano: e.target.value })} placeholder="Dano" className="rounded border border-zinc-700 bg-[#101116] px-2 py-1 text-sm outline-none" />
                <input value={item.critico} onChange={(e) => onUpdate(realIndex, { ...item, critico: e.target.value })} placeholder="Crítico" className="rounded border border-zinc-700 bg-[#101116] px-2 py-1 text-sm outline-none" />
                <input value={item.custo} onChange={(e) => onUpdate(realIndex, { ...item, custo: e.target.value })} placeholder="Custo" className="rounded border border-zinc-700 bg-[#101116] px-2 py-1 text-sm outline-none" />
                <input value={item.tipo} onChange={(e) => onUpdate(realIndex, { ...item, tipo: e.target.value })} placeholder="Tipo" className="rounded border border-zinc-700 bg-[#101116] px-2 py-1 text-sm outline-none" />
              </div>
              <textarea value={item.descricao} onChange={(e) => onUpdate(realIndex, { ...item, descricao: e.target.value })} placeholder="Descrição / efeito" className="mt-2 h-20 w-full resize-none rounded border border-zinc-700 bg-[#101116] p-2 text-sm outline-none" />
            </div>
          );
        })}
        {filtered.length === 0 && <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center text-sm font-bold text-blue-400">Clique em {button} para adicionar.</div>}
      </div>
    </Panel>
  );
}

export default function App() {
  const [sheet, setSheet] = useState(() => {
    try {
      return { ...initialSheet, ...JSON.parse(localStorage.getItem("shangri-frontier-ficha")) };
    } catch {
      return initialSheet;
    }
  });
  const [saved, setSaved] = useState(false);
  const [active, setActive] = useState("combate");
  const [search, setSearch] = useState("");

  useEffect(() => {
    localStorage.setItem("shangri-frontier-ficha", JSON.stringify(sheet));
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 900);
    return () => clearTimeout(t);
  }, [sheet]);

  const set = (key, value) => setSheet((s) => ({ ...s, [key]: value }));
  const setNested = (group, key, value) => setSheet((s) => ({ ...s, [group]: { ...s[group], [key]: value } }));
  const totalAtributos = useMemo(() => Object.values(sheet.atributos).reduce((a, b) => a + Number(b || 0), 0), [sheet.atributos]);
  const currentTab = tabs.find((t) => t.id === active);

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

  function addToList(listName) {
    setSheet((s) => ({ ...s, [listName]: [...s[listName], { ...emptyCard }] }));
  }

  function updateList(listName, index, value) {
    setSheet((s) => ({ ...s, [listName]: s[listName].map((item, i) => (i === index ? value : item)) }));
  }

  function deleteFromList(listName, index) {
    setSheet((s) => ({ ...s, [listName]: s[listName].filter((_, i) => i !== index) }));
  }

  function renderTab() {
    if (active === "atributos") {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Bar icon={Heart} label="HP" current={sheet.hpAtual} max={sheet.hpMax} color="text-green-400" onCurrent={(v) => set("hpAtual", v)} onMax={(v) => set("hpMax", v)} />
            <Bar icon={Zap} label="RESISTÊNCIA" current={sheet.staminaAtual} max={sheet.staminaMax} color="text-cyan-400" onCurrent={(v) => set("staminaAtual", v)} onMax={(v) => set("staminaMax", v)} />
            <Bar icon={Droplets} label="MANA" current={sheet.manaAtual} max={sheet.manaMax} color="text-violet-400" onCurrent={(v) => set("manaAtual", v)} onMax={(v) => set("manaMax", v)} />
          </div>

          <Panel title="ATRIBUTOS">
            <div className="space-y-2">
              {attrInfo.map(([key, label, desc, color, Icon]) => (
                <div key={key} className="grid grid-cols-[30px_130px_70px_1fr_80px] items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 p-2 text-sm">
                  <Icon className={color} size={20} />
                  <span className={`font-black ${color}`}>{label}</span>
                  <input type="number" value={sheet.atributos[key]} onChange={(e) => setNested("atributos", key, Number(e.target.value))} className="rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-center font-bold text-zinc-100 outline-none" />
                  <span className="text-xs text-zinc-400">{desc}</span>
                  <div className="flex overflow-hidden rounded-lg border border-zinc-700">
                    <button onClick={() => setNested("atributos", key, Number(sheet.atributos[key]) - 1)} className="flex-1 p-2 hover:bg-zinc-800"><Minus size={14}/></button>
                    <button onClick={() => setNested("atributos", key, Number(sheet.atributos[key]) + 1)} className="flex-1 p-2 hover:bg-zinc-800"><Plus size={14}/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-xs font-black text-zinc-300">TOTAL DE ATRIBUTOS: {totalAtributos}</div>
          </Panel>
        </div>
      );
    }

    if (active === "combate") {
      return <CardList title="COMBATE" button="Novo Ataque" list={sheet.ataques} search={search} setSearch={setSearch} onAdd={() => addToList("ataques")} onUpdate={(i, v) => updateList("ataques", i, v)} onDelete={(i) => deleteFromList("ataques", i)} />;
    }

    if (active === "habilidades") {
      return (
        <div className="space-y-4">
          <CardList title="HABILIDADES ATIVAS" button="Nova Habilidade" list={sheet.habilidadesAtivas} search={search} setSearch={setSearch} onAdd={() => addToList("habilidadesAtivas")} onUpdate={(i, v) => updateList("habilidadesAtivas", i, v)} onDelete={(i) => deleteFromList("habilidadesAtivas", i)} compact />
          <CardList title="HABILIDADES PASSIVAS" button="Nova Habilidade Passiva" list={sheet.habilidadesPassivas} search={search} setSearch={setSearch} onAdd={() => addToList("habilidadesPassivas")} onUpdate={(i, v) => updateList("habilidadesPassivas", i, v)} onDelete={(i) => deleteFromList("habilidadesPassivas", i)} compact />
        </div>
      );
    }

    if (active === "magias") {
      return <CardList title="MAGIAS" button="Nova Magia" list={sheet.magias} search={search} setSearch={setSearch} onAdd={() => addToList("magias")} onUpdate={(i, v) => updateList("magias", i, v)} onDelete={(i) => deleteFromList("magias", i)} />;
    }

    if (active === "inventario") {
      return <CardList title="INVENTÁRIO" button="Novo Item" list={sheet.inventarioGeral} search={search} setSearch={setSearch} onAdd={() => addToList("inventarioGeral")} onUpdate={(i, v) => updateList("inventarioGeral", i, v)} onDelete={(i) => deleteFromList("inventarioGeral", i)} compact />;
    }

    return <CardList title="VANTAGENS" button="Nova Perk" list={sheet.perks} search={search} setSearch={setSearch} onAdd={() => addToList("perks")} onUpdate={(i, v) => updateList("perks", i, v)} onDelete={(i) => deleteFromList("perks", i)} compact />;
  }

  return (
    <main className="min-h-screen bg-[#0d0e12] p-4 text-zinc-100">
      <div className="mx-auto max-w-[1280px] rounded-[1.5rem] border border-zinc-700 bg-[#17181d] p-3 shadow-2xl shadow-black/40">
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-700 bg-[#1d1f26] p-3">
          <div>
            <h1 className="text-3xl font-black tracking-[0.22em] text-zinc-100">FRONTEIRA DE SHANGRÍ-LA</h1>
            <p className="text-xs font-bold tracking-[0.35em] text-purple-300">FICHA DIGITAL DE PERSONAGEM</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <button onClick={exportarFicha} className="rounded-lg border border-zinc-600 px-3 py-2 font-bold text-zinc-200 hover:bg-zinc-800"><Download size={15} className="inline" /> Exportar</button>
            <label className="cursor-pointer rounded-lg border border-zinc-600 px-3 py-2 font-bold text-zinc-200 hover:bg-zinc-800"><Upload size={15} className="inline" /> Importar<input type="file" accept=".json" onChange={importarFicha} className="hidden" /></label>
            <button onClick={() => confirm("Resetar ficha?") && setSheet(initialSheet)} className="rounded-lg border border-red-500/60 px-3 py-2 font-bold text-red-300 hover:bg-red-950/40"><RotateCcw size={15} className="inline" /> Redefinir</button>
            <div className="rounded-lg bg-purple-700 px-3 py-2 font-bold text-white"><Save size={15} className="inline" /> {saved ? "Salvando..." : "Salvo"}</div>
          </div>
        </header>

        <nav className="mb-3 flex flex-wrap gap-2 rounded-xl border border-zinc-700 bg-[#1d1f26] p-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActive(tab.id); setSearch(""); }} className={`rounded-lg px-4 py-2 text-sm font-black tracking-wider transition ${active === tab.id ? "bg-purple-700 text-white" : "text-zinc-300 hover:bg-zinc-800"}`}>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[280px_1fr_300px]">
          <aside className="space-y-3">
            <Panel>
              <div className="mb-2 aspect-[3/4] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                {sheet.imagem ? <img src={sheet.imagem} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-center text-sm font-bold text-zinc-500">IMAGEM DO PERSONAGEM</div>}
              </div>
              <label className="block cursor-pointer rounded-lg bg-purple-700 px-3 py-2 text-center text-xs font-black text-white hover:bg-purple-600">imagem<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
            </Panel>

            <Panel title="DADOS">
              <div className="space-y-2">
                <Field label="NOME" value={sheet.nome} onChange={(v) => set("nome", v)} />
                <Field label="TÍTULO" value={sheet.titulo} onChange={(v) => set("titulo", v)} />
                <Field label="NÍVEL" type="number" value={sheet.nivel} onChange={(v) => set("nivel", v)} />
                <Field label="RAÇA" value={sheet.raca} onChange={(v) => set("raca", v)} />
                <Field label="ORIGEM" value={sheet.origem} onChange={(v) => set("origem", v)} />
                <Field label="CLASSE" value={sheet.classe} onChange={(v) => set("classe", v)} />
              </div>
            </Panel>
          </aside>

          <section>
            {renderTab()}
          </section>

          <aside className="space-y-3">
            <Panel title="STATUS">
              <div className="space-y-2">
                {Object.keys(sheet.status).map((key) => <Field key={key} label={key.toUpperCase()} value={sheet.status[key]} onChange={(v) => setNested("status", key, v)} />)}
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </main>
  );
}
