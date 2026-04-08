import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// AI STACK v3 — Powered by Supabase
// The Open Supply Chain Graph of AI
// ============================================================

const supabase = createClient(
  "https://blngbbdrywrndjuswkgy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbmdiYmRyeXdybmRqdXN3a2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDc1MDcsImV4cCI6MjA5MTA4MzUwN30.Z7fwXhJ7TZLoK5ec-ocSNZCzWtHQA1fdB9nZehgehoQ"
);

const LAYERS = [
  { id: 0, name: "Raw Materials & Chemicals", color: "#B45309", desc: "Minerals, gases, wafers, photoresists, CMP" },
  { id: 1, name: "Equipment & IP", color: "#DC2626", desc: "Lithography, etch, deposition, EDA, core IP" },
  { id: 2, name: "Fabrication & Packaging", color: "#7C3AED", desc: "Foundries, memory fabs, OSAT, advanced packaging" },
  { id: 3, name: "Chip Design", color: "#2563EB", desc: "GPU, CPU, ASIC, networking silicon designers" },
  { id: 4, name: "Networking & Interconnect", color: "#0369A1", desc: "Switches, NICs, optical, InfiniBand, NVLink" },
  { id: 5, name: "Systems & Servers", color: "#0E7490", desc: "Server OEMs, ODMs, power, cooling, racks" },
  { id: 6, name: "Cloud & Data Centers", color: "#0891B2", desc: "Hyperscalers, neoclouds, colo providers" },
  { id: 7, name: "AI Labs & Models", color: "#059669", desc: "Frontier model developers and research labs" },
  { id: 8, name: "AI Products & APIs", color: "#65A30D", desc: "Consumer products, developer APIs, agents" },
];

// These get populated from Supabase
let NODES_DATA = [];
let LINKS_DATA = [];

// ═══════════════════════════════════════════════════════════
// ZOOM LEVELS — Google Maps approach to supply chain clarity
// ═══════════════════════════════════════════════════════════

// LEVEL 1: Critical Path (~32 nodes)
// Monopolies, sole sources, and irreplaceable chokepoints.
// If any of these break, the AI supply chain breaks.
const TIER_1 = new Set([
  // Raw Materials — sole sources
  "spruce_pine", "shin_etsu_wafer",
  // Equipment — monopolies
  "asml", "zeiss", "trumpf",
  // Fabrication — irreplaceable
  "tsmc", "samsung_fab", "sk_hynix", "cowos", "micron",
  // Chip Design — dominant
  "nvidia", "amd", "broadcom", "google_tpu",
  // Networking — chokepoints
  "nvidia_networking", "nvlink", "arista",
  // Systems — primary assembler
  "smci",
  // Cloud — where AI runs
  "microsoft_azure", "aws", "google_cloud", "meta_infra", "coreweave", "oracle_cloud",
  // AI Labs — frontier models
  "openai", "anthropic", "google_deepmind", "meta_ai", "xai",
  // Products — where tokens meet humans
  "chatgpt", "claude_ai", "gemini_app",
]);

// LEVEL 2: Major Players (~85 nodes)
// Significant competitors, alternatives, and important secondary players
const TIER_2 = new Set([
  ...TIER_1,
  // More raw materials
  "sumco", "neon_gas", "photoresists", "tok", "entegris", "linde_gas",
  // More equipment
  "applied_materials", "lam_research", "tokyo_electron", "kla",
  "synopsys", "cadence", "arm", "advantest", "disco", "screen_holdings",
  "asm_intl", "lasertec",
  // More fabrication
  "intel_foundry", "samsung_memory", "ase_group", "amkor", "smic", "globalfoundries",
  "cxmt", "ymtc",
  // More chip design
  "marvell", "qualcomm", "aws_trainium", "ms_maia", "apple_silicon",
  "intel_gpu", "cerebras", "groq", "huawei_ascend", "tenstorrent",
  // More networking
  "broadcom_nw", "cisco_dc", "coherent", "lumentum", "innolight",
  "eoptolink", "fabrinet", "celestica",
  // More systems
  "dell_servers", "hpe_servers", "foxconn", "quanta", "vertiv",
  "schneider", "eaton",
  // More cloud
  "lambda_cloud", "equinix", "digital_realty", "nebius", "crusoe",
  // More AI labs
  "mistral", "deepseek", "cohere", "eleven_labs", "runway_ml",
  "hugging_face", "stability",
  // More products
  "github_copilot", "claude_code", "cursor", "perplexity",
  "copilot_ms", "openai_api", "anthropic_api", "aws_bedrock",
  "meta_ai_app", "grok_app",
]);

// LEVEL 3: Full Graph (200+ nodes) — everything

// ═══════════════════════════════════════════════════════════
// GEOPOLITICAL RISK — Country-of-origin color coding
// Based on PRIMARY manufacturing/production location
// ═══════════════════════════════════════════════════════════

const GEO_BLOCS = {
  usa:    { name: "USA",              color: "#2563EB", desc: "Domestic — most secure" },
  europe: { name: "Europe (NATO)",    color: "#059669", desc: "Allied — Netherlands, Germany, France, UK, Finland" },
  allied_asia: { name: "Japan & S. Korea", color: "#7C3AED", desc: "Allied — but proximity to conflict zones" },
  taiwan: { name: "Taiwan",          color: "#D97706", desc: "Critical concentration risk" },
  china:  { name: "China",           color: "#DC2626", desc: "Adversary — export controls, conflict risk" },
  other:  { name: "Other",           color: "#6B7280", desc: "Israel, Canada, Thailand, etc." },
};

const COUNTRY_MAP = {
  // Layer 0 — Raw Materials
  spruce_pine: "usa", shin_etsu_wafer: "allied_asia", sumco: "allied_asia", siltronic: "europe",
  neon_gas: "other", photoresists: "allied_asia", tok: "allied_asia", fujifilm_semi: "allied_asia",
  dupont_semi: "usa", entegris: "usa", cabot_micro: "usa", sumitomo_chem: "allied_asia",
  linde_gas: "europe", air_liquide: "europe", rare_earths: "china", sk_materials: "allied_asia",
  basf_semi: "europe", honeywell_semi: "usa", merck_semi: "europe",
  wacker_chem: "europe", resonac: "allied_asia", sk_siltron: "allied_asia",
  // Layer 1 — Equipment & IP
  asml: "europe", zeiss: "europe", trumpf: "europe", applied_materials: "usa",
  lam_research: "usa", tokyo_electron: "allied_asia", kla: "usa", screen_holdings: "allied_asia",
  asm_intl: "europe", kokusai: "allied_asia", advantest: "allied_asia", teradyne: "usa",
  disco: "allied_asia", nikon_litho: "allied_asia", canon_litho: "allied_asia",
  synopsys: "usa", cadence: "usa", arm: "europe", lasertec: "allied_asia",
  onto_innovation: "usa", nova_measuring: "other", veeco: "usa", ulvac: "allied_asia",
  naura: "china", amec: "china", cohu: "usa", hitachi_ht: "allied_asia", aixtron: "europe",
  // Layer 2 — Fabrication & Packaging
  tsmc: "taiwan", samsung_fab: "allied_asia", intel_foundry: "usa", globalfoundries: "usa",
  umc: "taiwan", smic: "china", sk_hynix: "allied_asia", micron: "usa",
  samsung_memory: "allied_asia", cowos: "taiwan", ase_group: "taiwan", amkor: "usa",
  jcet: "china", rapidus: "allied_asia", powerchip: "taiwan", tower_semi: "other",
  nanya_tech: "taiwan", cxmt: "china", ymtc: "china", vanguard_intl: "taiwan",
  hua_hong: "china", spil: "taiwan",
  // Layer 3 — Chip Design
  nvidia: "usa", amd: "usa", intel_gpu: "usa", broadcom: "usa", marvell: "usa",
  qualcomm: "usa", google_tpu: "usa", aws_trainium: "usa", ms_maia: "usa",
  cerebras: "usa", groq: "usa", tenstorrent: "other", d_matrix: "usa", sambanova: "usa",
  apple_silicon: "usa", mediatek: "taiwan", nvidia_grace: "usa", ampere: "usa",
  aws_graviton: "usa", xilinx_amd: "usa", intel_xeon: "usa", amd_epyc: "usa",
  lattice: "usa", sifive: "usa", hailo: "other", huawei_ascend: "china",
  // Layer 4 — Networking & Interconnect
  nvidia_networking: "usa", arista: "usa", cisco_dc: "usa", juniper_hpe: "usa",
  broadcom_nw: "usa", celestica: "other", coherent: "usa", lumentum: "usa",
  inphi_marvell: "usa", nvlink: "usa", innolight: "china", eoptolink: "china",
  accelink: "china", fabrinet: "other", broadcom_optics: "usa", applied_opto: "usa",
  ciena: "usa", hgtech: "china", extreme_nw: "usa", nokia_dc: "europe",
  // Layer 5 — Systems & Servers
  smci: "usa", dell_servers: "usa", hpe_servers: "usa", lenovo_dcg: "china",
  foxconn: "taiwan", quanta: "taiwan", wistron: "taiwan", inventec: "taiwan",
  vertiv: "usa", schneider: "europe", eaton: "usa", nvent: "usa",
  coolit: "other", ge_vernova: "usa", nextera: "usa", constellation: "usa",
  compal: "taiwan", pegatron: "taiwan", atos: "europe",
  // Layer 6 — Cloud & Data Centers
  microsoft_azure: "usa", google_cloud: "usa", aws: "usa", meta_infra: "usa",
  oracle_cloud: "usa", coreweave: "usa", lambda_cloud: "usa", crusoe: "usa",
  nebius: "europe", equinix: "usa", digital_realty: "usa", vantage_dc: "usa",
  scaleway: "europe", ovhcloud: "europe", gpu_cloud_ibm: "usa", datacrunch: "europe",
  // Layer 7 — AI Labs & Models
  openai: "usa", anthropic: "usa", google_deepmind: "europe", meta_ai: "usa",
  xai: "usa", mistral: "europe", deepseek: "china", cohere: "other",
  ai21: "other", stability: "europe", eleven_labs: "usa", runway_ml: "usa",
  hugging_face: "usa", baidu_ai: "china", inflection: "usa", adept: "usa",
  together_ai: "usa", reka_ai: "usa", aleph_alpha: "europe", zhipu: "china",
  // Layer 8 — AI Products & APIs
  chatgpt: "usa", claude_ai: "usa", gemini_app: "usa", github_copilot: "usa",
  meta_ai_app: "usa", grok_app: "usa", cursor: "usa", perplexity: "usa",
  midjourney: "usa", openai_api: "usa", anthropic_api: "usa", aws_bedrock: "usa",
  siri_apple: "usa", copilot_ms: "usa", claude_code: "usa", replit: "usa",
  notion_ai: "usa", character_ai: "usa", vercel_ai: "usa", poe: "usa",
  hf_inference: "usa", databricks: "usa", snowflake_ai: "usa", scale_ai: "usa",
  glean: "usa", harvey_ai: "usa", openevidence: "usa", sierra_ai: "usa",
  cohere_api: "other",
};

function getGeoColor(nodeId) {
  const bloc = COUNTRY_MAP[nodeId] || "other";
  return GEO_BLOCS[bloc]?.color || "#6B7280";
}
function getGeoBloc(nodeId) {
  return COUNTRY_MAP[nodeId] || "other";
}

// --- UTILITIES ---
const LAYER_COLORS = {};
LAYERS.forEach(l => { LAYER_COLORS[l.id] = l.color; });
function getColor(layer) { return LAYER_COLORS[layer] || "#888"; }
function getRadius(node) {
  const big = ["asml","tsmc","nvidia","openai","anthropic","sk_hynix","cowos","microsoft_azure","aws","google_cloud","samsung_fab","broadcom","meta_infra"];
  if (big.includes(node.id)) return 26;
  const med = ["applied_materials","lam_research","amd","kla","tokyo_electron","intel_foundry","oracle_cloud","coreweave","google_deepmind","meta_ai","xai","micron","arista","smci","chatgpt","claude_ai"];
  if (med.includes(node.id)) return 22;
  return 17;
}

// --- LAYER LEGEND ---
function LayerLegend({ layers, activeLayer, onLayerClick, pathActive }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      position: "absolute", top: 64, left: 16, background: "rgba(255,255,255,0.96)",
      borderRadius: 12, padding: collapsed ? "8px 12px" : "12px 14px", zIndex: 20,
      border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      backdropFilter: "blur(12px)", minWidth: collapsed ? 0 : 200,
      transition: "all 0.2s",
    }}>
      <div onClick={() => setCollapsed(!collapsed)} style={{
        fontSize: 9, letterSpacing: 2, color: "#9ca3af", marginBottom: collapsed ? 0 : 8,
        fontFamily: "var(--mono)", textTransform: "uppercase", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>Supply Chain Layers</span>
        <span style={{ fontSize: 12, marginLeft: 8 }}>{collapsed ? "▶" : "▼"}</span>
      </div>
      {!collapsed && <>
        {layers.map(l => {
          const isActive = activeLayer === null || activeLayer === l.id;
          return (
            <div key={l.id} onClick={() => onLayerClick(l.id)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "4px 8px", borderRadius: 6, cursor: "pointer",
              opacity: isActive ? 1 : 0.3,
              background: activeLayer === l.id ? `${l.color}0a` : "transparent",
              transition: "all 0.2s", marginBottom: 1,
            }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: l.color, flexShrink: 0, boxShadow: `0 0 4px ${l.color}33` }} />
              <div>
                <div style={{ fontSize: 11, color: "#374151", fontWeight: 500, fontFamily: "var(--sans)" }}>{l.name}</div>
                <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)" }}>{l.desc}</div>
              </div>
            </div>
          );
        })}
        {activeLayer !== null && (
          <div onClick={() => onLayerClick(null)} style={{
            marginTop: 6, fontSize: 10, color: "#6b7280", cursor: "pointer", textAlign: "center",
            padding: "3px 6px", borderRadius: 4, border: "1px solid #e5e7eb", fontFamily: "var(--mono)",
          }}>Show all</div>
        )}
        {pathActive && (
          <div style={{ marginTop: 6, fontSize: 9, color: "#059669", textAlign: "center", fontFamily: "var(--mono)" }}>
            ● Path trace active — click background to clear
          </div>
        )}
      </>}
    </div>
  );
}

// --- SEARCH ---
function SearchBar({ nodes, onSelect, onTrace }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = q.length > 0 ? nodes.filter(n =>
    n.label.replace(/\n/g, " ").toLowerCase().includes(q.toLowerCase()) ||
    n.id.toLowerCase().includes(q.toLowerCase()) ||
    (n.ticker && n.ticker.toLowerCase().includes(q.toLowerCase()))
  ) : [];
  return (
    <div style={{ position: "absolute", top: 64, right: 16, zIndex: 20, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
          placeholder="Search companies, tickers..."
          style={{
            background: "rgba(255,255,255,0.96)", border: "1px solid #e5e7eb", borderRadius: 8,
            padding: "7px 12px", color: "#374151", fontSize: 12, width: 220, outline: "none",
            fontFamily: "var(--mono)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }} />
        <button onClick={onTrace} title="Trace: Nvidia's full supply chain"
          style={{
            background: "#059669", border: "none", borderRadius: 8, padding: "7px 12px",
            color: "#fff", fontSize: 10, cursor: "pointer", whiteSpace: "nowrap",
            fontFamily: "var(--mono)", fontWeight: 600, boxShadow: "0 2px 8px rgba(5,150,105,0.3)",
          }}>⬡ Trace Path</button>
      </div>
      {open && filtered.length > 0 && (
        <div style={{
          marginTop: 4, background: "rgba(255,255,255,0.98)", border: "1px solid #e5e7eb",
          borderRadius: 8, maxHeight: 280, overflowY: "auto", width: 320,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}>
          {filtered.slice(0, 12).map(n => (
            <div key={n.id} onClick={() => { onSelect(n.id); setQ(""); setOpen(false); }}
              style={{ padding: "6px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: getColor(n.layer), flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: "#374151", fontFamily: "var(--sans)", fontWeight: 500 }}>
                  {n.label.replace(/\n/g, " ")}
                  {n.ticker && <span style={{ color: "#9ca3af", fontSize: 9, marginLeft: 4 }}>${n.ticker}</span>}
                </div>
                <div style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)" }}>{LAYERS[n.layer]?.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- NODE DETAIL PANEL ---
function NodeDetail({ node, onClose, onNavigate }) {
  if (!node) return null;
  const layer = LAYERS[node.layer];
  const up = LINKS_DATA.filter(l => {
    const t = typeof l.target === "string" ? l.target : l.target.id;
    return t === node.id;
  }).map(l => typeof l.source === "string" ? l.source : l.source.id);
  const down = LINKS_DATA.filter(l => {
    const s = typeof l.source === "string" ? l.source : l.source.id;
    return s === node.id;
  }).map(l => typeof l.target === "string" ? l.target : l.target.id);
  const upN = NODES_DATA.filter(n => up.includes(n.id));
  const downN = NODES_DATA.filter(n => down.includes(n.id));

  return (
    <div style={{
      position: "absolute", bottom: 16, left: 16, right: 16, maxWidth: 560, zIndex: 30,
      background: "rgba(255,255,255,0.98)", borderRadius: 14,
      border: `1px solid ${layer.color}33`, padding: "18px 22px",
      boxShadow: `0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px ${layer.color}11`,
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 10, right: 14, background: "none", border: "none",
        color: "#9ca3af", fontSize: 18, cursor: "pointer",
      }}>×</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: layer.color }} />
        <span style={{ fontSize: 9, color: layer.color, fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
          {layer.name}
        </span>
      </div>
      <h2 style={{ fontSize: 18, color: "#111827", margin: "0 0 3px", fontFamily: "var(--sans)", fontWeight: 700 }}>
        {node.label.replace(/\n/g, " ")}
        {node.ticker && <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6, fontWeight: 400 }}>${node.ticker}</span>}
      </h2>
      <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "var(--sans)" }}>{node.desc || node.description}</p>
      {(node.market_cap || node.marketCap || node.revenue) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          {(node.market_cap || node.marketCap) && <div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1 }}>Mkt Cap</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 600, fontFamily: "var(--sans)" }}>{node.market_cap || node.marketCap}</div>
          </div>}
          {node.revenue && <div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1 }}>Revenue</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 600, fontFamily: "var(--sans)" }}>{node.revenue}</div>
          </div>}
        </div>
      )}
      <p style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.6, margin: "0 0 12px", fontFamily: "var(--sans)" }}>{node.detail}</p>
      <div style={{ display: "flex", gap: 20 }}>
        {upN.length > 0 && <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>↑ Suppliers ({upN.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {upN.slice(0, 12).map(n => (
              <span key={n.id} onClick={() => onNavigate(n.id)} style={{
                fontSize: 9, padding: "1px 6px", borderRadius: 3,
                background: `${getColor(n.layer)}11`, color: getColor(n.layer),
                cursor: "pointer", border: `1px solid ${getColor(n.layer)}22`, fontFamily: "var(--mono)",
              }}>{n.label.replace(/\n/g, " ")}</span>
            ))}
            {upN.length > 12 && <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)" }}>+{upN.length - 12} more</span>}
          </div>
        </div>}
        {downN.length > 0 && <div style={{ flex: 1 }}>
          <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>↓ Customers ({downN.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {downN.slice(0, 12).map(n => (
              <span key={n.id} onClick={() => onNavigate(n.id)} style={{
                fontSize: 9, padding: "1px 6px", borderRadius: 3,
                background: `${getColor(n.layer)}11`, color: getColor(n.layer),
                cursor: "pointer", border: `1px solid ${getColor(n.layer)}22`, fontFamily: "var(--mono)",
              }}>{n.label.replace(/\n/g, " ")}</span>
            ))}
            {downN.length > 12 && <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)" }}>+{downN.length - 12} more</span>}
          </div>
        </div>}
      </div>
    </div>
  );
}

// --- STATS BAR ---
function StatsBar({ zoomLevel }) {
  const { nodes, links } = getFilteredData(zoomLevel || 3);
  return (
    <div style={{
      position: "absolute", bottom: 16, right: 16, background: "rgba(255,255,255,0.95)",
      borderRadius: 10, padding: "8px 14px", zIndex: 15, border: "1px solid #e5e7eb",
      display: "flex", gap: 16, alignItems: "center", fontFamily: "var(--mono)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{nodes.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Nodes</span></div>
      <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{links.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Links</span></div>
      <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{LAYERS.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Layers</span></div>
    </div>
  );
}

// === GRAPH COMPONENT (renders after data loads) ===
// --- ZOOM LEVEL TOGGLE ---
function ZoomToggle({ level, onSetLevel }) {
  const levels = [
    { id: 1, label: "Critical Path", count: TIER_1.size, desc: "Chokepoints & monopolies" },
    { id: 2, label: "Major Players", count: TIER_2.size, desc: "Key competitors & alternatives" },
    { id: 3, label: "Full Graph", count: NODES_DATA.length, desc: "Every company tracked" },
  ];
  return (
    <div style={{
      display: "flex", gap: 2,
      background: "rgba(255,255,255,0.96)", borderRadius: 10,
      border: "1px solid #e5e7eb", padding: 3,
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    }}>
      {levels.map(l => (
        <button key={l.id} onClick={() => onSetLevel(l.id)} style={{
          background: level === l.id ? "#111827" : "transparent",
          color: level === l.id ? "#fff" : "#6b7280",
          border: "none", borderRadius: 8, padding: "6px 14px",
          cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10,
          fontWeight: level === l.id ? 600 : 400,
          transition: "all 0.2s",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
        }}>
          <span>{l.label}</span>
          <span style={{ fontSize: 8, opacity: 0.6 }}>{l.count} nodes</span>
        </button>
      ))}
    </div>
  );
}

// --- GEO RISK TOGGLE ---
function GeoToggle({ active, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 6,
      background: active ? "#111827" : "rgba(255,255,255,0.96)",
      color: active ? "#fff" : "#6b7280",
      border: "1px solid #e5e7eb", borderRadius: 10, padding: "8px 14px",
      cursor: "pointer", fontFamily: "var(--mono)", fontSize: 10,
      fontWeight: active ? 600 : 400,
      boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      transition: "all 0.2s",
    }}>
      <span style={{ fontSize: 12 }}>🌐</span>
      <span>Geo Risk</span>
    </button>
  );
}

// --- GEO RISK LEGEND ---
function GeoLegend() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      position: "absolute", top: 64, left: 16, background: "rgba(255,255,255,0.96)",
      borderRadius: 12, padding: collapsed ? "8px 12px" : "12px 14px", zIndex: 20,
      border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      backdropFilter: "blur(12px)", minWidth: collapsed ? 0 : 200,
      transition: "all 0.2s",
    }}>
      <div onClick={() => setCollapsed(!collapsed)} style={{
        fontSize: 9, letterSpacing: 2, color: "#9ca3af", marginBottom: collapsed ? 0 : 8,
        fontFamily: "var(--mono)", textTransform: "uppercase", cursor: "pointer",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span>Geopolitical Risk — Mfg Location</span>
        <span style={{ fontSize: 12, marginLeft: 8 }}>{collapsed ? "▶" : "▼"}</span>
      </div>
      {!collapsed && Object.entries(GEO_BLOCS).map(([key, bloc]) => (
        <div key={key} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "4px 8px", marginBottom: 1,
        }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: bloc.color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, color: "#374151", fontWeight: 500, fontFamily: "var(--sans)" }}>{bloc.name}</div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)" }}>{bloc.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Helper: filter nodes/links by zoom level ---
function getFilteredData(level) {
  let tierSet = null;
  if (level === 1) tierSet = TIER_1;
  else if (level === 2) tierSet = TIER_2;

  const filteredNodes = tierSet
    ? NODES_DATA.filter(n => tierSet.has(n.id))
    : NODES_DATA;

  const nodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredLinks = LINKS_DATA.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

  return { nodes: filteredNodes, links: filteredLinks };
}

function GraphView({ zoomLevel, geoMode }) {
  const svgRef = useRef(null);
  const simRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeLayer, setActiveLayer] = useState(null);
  const [pathNodes, setPathNodes] = useState(null);
  const [dims, setDims] = useState({ width: 1200, height: 700 });

  useEffect(() => {
    const u = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    u(); window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);

  const tracePath = useCallback((nodeId) => {
    if (pathNodes?.has(nodeId)) { setPathNodes(null); return; }
    const pn = new Set([nodeId]);
    let frontier = [nodeId];
    while (frontier.length) {
      const next = [];
      for (const nid of frontier) {
        LINKS_DATA.forEach(l => {
          const t = typeof l.target === "string" ? l.target : l.target.id;
          const s = typeof l.source === "string" ? l.source : l.source.id;
          if (t === nid && !pn.has(s)) { pn.add(s); next.push(s); }
        });
      }
      frontier = next;
    }
    frontier = [nodeId];
    const visited = new Set([nodeId]);
    while (frontier.length) {
      const next = [];
      for (const nid of frontier) {
        LINKS_DATA.forEach(l => {
          const s = typeof l.source === "string" ? l.source : l.source.id;
          const t = typeof l.target === "string" ? l.target : l.target.id;
          if (s === nid && !visited.has(t)) { pn.add(t); visited.add(t); next.push(t); }
        });
      }
      frontier = next;
    }
    setPathNodes(pn);
  }, [pathNodes]);

  const traceFullPath = useCallback(() => {
    if (pathNodes) { setPathNodes(null); return; }
    tracePath("nvidia");
  }, [pathNodes, tracePath]);

  useEffect(() => {
    if (!svgRef.current || NODES_DATA.length === 0) return;
    const { width, height } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { nodes: filteredNodes, links: filteredLinks } = getFilteredData(zoomLevel);
    const nodes = filteredNodes.map(d => ({ ...d }));
    const links = filteredLinks.map(d => ({ ...d }));
    const layerCount = LAYERS.length;
    const layerW = width / layerCount;
    nodes.forEach(n => {
      const ln = nodes.filter(nn => nn.layer === n.layer);
      const idx = ln.indexOf(n);
      n.x = n.layer * layerW + layerW / 2 + (Math.random() - 0.5) * 40;
      n.y = (idx + 1) * (height / (ln.length + 1)) + (Math.random() - 0.5) * 30;
    });

    const g = svg.append("g");
    const zoom = d3.zoom().scaleExtent([0.15, 5])
      .on("zoom", e => g.attr("transform", e.transform));
    svg.call(zoom);

    const defs = svg.append("defs");
    defs.append("marker").attr("id", "arr").attr("viewBox", "0 -4 8 8")
      .attr("refX", 18).attr("refY", 0).attr("markerWidth", 5).attr("markerHeight", 5)
      .attr("orient", "auto").append("path").attr("d", "M0,-3L7,0L0,3").attr("fill", "#d1d5db");
    const filt = defs.append("filter").attr("id", "ns").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filt.append("feDropShadow").attr("dx", 0).attr("dy", 1).attr("stdDeviation", 2).attr("flood-color", "#000").attr("flood-opacity", 0.06);

    const link = g.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "#e5e7eb").attr("stroke-width", 0.8).attr("marker-end", "url(#arr)");

    const node = g.append("g").selectAll("g").data(nodes).enter().append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    // Adjust physics based on zoom level
    const sizeScale = zoomLevel === 1 ? 1.6 : zoomLevel === 2 ? 1.15 : 1;
    const chargeStr = zoomLevel === 1 ? -600 : zoomLevel === 2 ? -300 : -200;
    const linkDist = zoomLevel === 1 ? 160 : zoomLevel === 2 ? 100 : 80;
    const xStr = zoomLevel === 1 ? 0.6 : 0.5;

    const nodeColor = geoMode
      ? (d) => getGeoColor(d.id)
      : (d) => getColor(d.layer);

    node.append("circle")
      .attr("r", d => getRadius(d) * sizeScale)
      .attr("fill", d => `${nodeColor(d)}18`)
      .attr("stroke", d => nodeColor(d))
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#ns)");

    node.each(function(d) {
      const lines = d.label.split("\n");
      const el = d3.select(this);
      const fs = zoomLevel === 1 ? "10px" : d.label.length > 14 ? "7px" : "8px";
      lines.forEach((line, i) => {
        el.append("text").text(line)
          .attr("text-anchor", "middle")
          .attr("dy", lines.length === 1 ? "0.35em" : `${(i - (lines.length - 1) / 2) * 1.1 + 0.35}em`)
          .attr("fill", "#374151").attr("font-size", fs)
          .attr("font-family", "'IBM Plex Mono', monospace").attr("font-weight", "500")
          .attr("pointer-events", "none");
      });
    });

    node.on("click", (e, d) => { e.stopPropagation(); setSelectedNode(d); });
    node.on("dblclick", (e, d) => { e.stopPropagation(); tracePath(d.id); });
    svg.on("click", () => { setSelectedNode(null); setPathNodes(null); });

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(linkDist).strength(0.25))
      .force("charge", d3.forceManyBody().strength(chargeStr))
      .force("center", d3.forceCenter(width / 2 + 80, height / 2))
      .force("x", d3.forceX(d => (d.layer / (layerCount - 1)) * (width - 350) + 200).strength(xStr))
      .force("y", d3.forceY(height / 2).strength(0.04))
      .force("collision", d3.forceCollide().radius(d => getRadius(d) * sizeScale + 8))
      .on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    simRef.current = { sim, node, link, nodes, links, svg, g, zoom };
    setTimeout(() => {
      svg.transition().duration(800).call(zoom.transform, d3.zoomIdentity.translate(width * 0.12, height * 0.08).scale(0.7));
    }, 600);
    return () => sim.stop();
  }, [dims, tracePath, zoomLevel, geoMode]);

  useEffect(() => {
    if (!simRef.current) return;
    const { node, link } = simRef.current;
    node.select("circle").transition().duration(300)
      .attr("opacity", d => {
        if (pathNodes) return pathNodes.has(d.id) ? 1 : 0.06;
        if (activeLayer === null) return 1;
        return d.layer === activeLayer ? 1 : 0.08;
      })
      .attr("stroke-width", d => pathNodes?.has(d.id) ? 2.5 : 1.5);
    node.selectAll("text").transition().duration(300)
      .attr("opacity", d => {
        if (pathNodes) return pathNodes.has(d.id) ? 1 : 0.04;
        if (activeLayer === null) return 1;
        return d.layer === activeLayer ? 1 : 0.06;
      });
    link.transition().duration(300)
      .attr("stroke", d => {
        const s = typeof d.source === "string" ? d.source : d.source.id;
        const t = typeof d.target === "string" ? d.target : d.target.id;
        if (pathNodes?.has(s) && pathNodes?.has(t)) {
          const sn = NODES_DATA.find(n => n.id === s);
          return sn ? getColor(sn.layer) : "#059669";
        }
        return "#e5e7eb";
      })
      .attr("stroke-width", d => {
        const s = typeof d.source === "string" ? d.source : d.source.id;
        const t = typeof d.target === "string" ? d.target : d.target.id;
        return pathNodes?.has(s) && pathNodes?.has(t) ? 1.8 : 0.8;
      })
      .attr("opacity", d => {
        const sn = NODES_DATA.find(n => n.id === (typeof d.source === "string" ? d.source : d.source.id));
        const tn = NODES_DATA.find(n => n.id === (typeof d.target === "string" ? d.target : d.target.id));
        if (pathNodes) {
          const s = typeof d.source === "string" ? d.source : d.source.id;
          const t = typeof d.target === "string" ? d.target : d.target.id;
          return pathNodes.has(s) && pathNodes.has(t) ? 1 : 0.03;
        }
        if (activeLayer === null) return 1;
        return (sn?.layer === activeLayer || tn?.layer === activeLayer) ? 1 : 0.04;
      });
  }, [activeLayer, pathNodes]);

  const navigateToNode = useCallback((nodeId) => {
    const nd = NODES_DATA.find(n => n.id === nodeId);
    if (nd) setSelectedNode(nd);
    if (simRef.current) {
      const { nodes, svg, zoom } = simRef.current;
      const n = nodes.find(nn => nn.id === nodeId);
      if (n?.x != null) {
        svg.transition().duration(600).call(zoom.transform,
          d3.zoomIdentity.translate(dims.width / 2, dims.height / 2).scale(1.5).translate(-n.x, -n.y));
      }
    }
  }, [dims]);

  return (
    <>
      <div style={{
        position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)",
        zIndex: 15, fontSize: 9, color: "#374151", fontFamily: "var(--mono)", pointerEvents: "none",
      }}>
        Click a node to inspect · Double-click to trace path · Scroll to zoom · Drag to pan
      </div>
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(#e5e7eb 0.5px, transparent 0.5px)",
        backgroundSize: "24px 24px", opacity: 0.5,
      }} />
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ display: "block", position: "relative", zIndex: 1 }} />
      {geoMode ? (
        <GeoLegend />
      ) : (
        <LayerLegend layers={LAYERS} activeLayer={activeLayer}
          onLayerClick={id => { setActiveLayer(prev => prev === id ? null : id); setPathNodes(null); }}
          pathActive={!!pathNodes} />
      )}
      <SearchBar nodes={getFilteredData(zoomLevel).nodes} onSelect={navigateToNode} onTrace={traceFullPath} />
      <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} onNavigate={navigateToNode} />
    </>
  );
}

// === MAIN APP WITH DATA LOADING ===
export default function AIStack() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [geoMode, setGeoMode] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [nodesRes, linksRes] = await Promise.all([
          supabase.from("nodes").select("*"),
          supabase.from("links").select("*"),
        ]);
        if (nodesRes.error) throw nodesRes.error;
        if (linksRes.error) throw linksRes.error;

        // Map Supabase column names to what the UI expects
        NODES_DATA = nodesRes.data.map(n => ({
          ...n,
          desc: n.description,
          marketCap: n.market_cap,
          label: n.label.replace(/\\n/g, "\n"),
        }));
        LINKS_DATA = linksRes.data;
        setLoading(false);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#fafbfc",
      position: "relative", overflow: "hidden",
      "--sans": "'IBM Plex Sans', 'Inter', system-ui, sans-serif",
      "--mono": "'IBM Plex Mono', 'JetBrains Mono', monospace",
      fontFamily: "var(--sans)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 52,
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 25,
        background: "#111827",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <svg width="26" height="26" viewBox="0 0 200 200"><g transform="translate(100,100)"><polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#E8C9A0" opacity="0.5" transform="translate(0,30)"/><polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#D4A0B0" opacity="0.45" transform="translate(0,10)"/><polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#A8B4D4" opacity="0.5" transform="translate(0,-10)"/><polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" fill="#9CC5B8" opacity="0.5" transform="translate(0,-30)"/></g></svg>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#F9FAFB", letterSpacing: -0.5 }}>AI Stack</span>
          <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)", marginLeft: 4 }}>
            The Open Supply Chain Graph of AI
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100%", gap: 16,
        }}>
          <div style={{
            width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#059669",
            borderRadius: "50%", animation: "spin 1s linear infinite",
          }} />
          <div style={{ color: "#9ca3af", fontSize: 13, fontFamily: "var(--mono)" }}>Loading supply chain data...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          height: "100%", gap: 12,
        }}>
          <div style={{ color: "#DC2626", fontSize: 14, fontFamily: "var(--mono)" }}>Failed to load data</div>
          <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "var(--mono)" }}>{error}</div>
        </div>
      ) : (
        <>
          <GraphView zoomLevel={zoomLevel} geoMode={geoMode} />
          {/* Bottom controls bar */}
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            zIndex: 20, display: "flex", gap: 8, alignItems: "center",
          }}>
            <ZoomToggle level={zoomLevel} onSetLevel={setZoomLevel} />
            <GeoToggle active={geoMode} onToggle={() => setGeoMode(!geoMode)} />
          </div>
        </>
      )}
    </div>
  );
}
