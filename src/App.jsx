import { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";

// ============================================================
// AI STACK v2 — White Theme, 200+ Nodes
// The Open Supply Chain Graph of AI
// ============================================================

// ============================================================
// AI STACK — The Open Supply Chain Graph of AI
// 200+ nodes across the full AI value chain
// Light theme, production-ready prototype
// ============================================================

// --- LAYER DEFINITIONS ---
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

// --- NODE DATA ---
// 200+ nodes across 9 layers
const NODES_DATA = [
  // ═══════════════════════════════════════════════
  // LAYER 0: RAW MATERIALS & CHEMICALS
  // ═══════════════════════════════════════════════
  { id: "spruce_pine", label: "Spruce Pine\nQuartz", layer: 0, desc: "Ultra-pure quartz from NC — sole source of semiconductor-grade silicon", ticker: null, marketCap: null, revenue: null, detail: "Two mines in Spruce Pine, North Carolina supply virtually all high-purity quartz needed for semiconductor-grade silicon wafers worldwide. The entire digital economy depends on this single Appalachian town." },
  { id: "shin_etsu_wafer", label: "Shin-Etsu\nChemical", layer: 0, desc: "World's largest silicon wafer and semiconductor materials producer", ticker: "4063.T", marketCap: "$65B+", revenue: "$18B", detail: "Shin-Etsu Chemical is the world's largest manufacturer of silicon wafers (300mm), PVC, and semiconductor-grade silicones. Dominates ~30% of the global wafer market." },
  { id: "sumco", label: "SUMCO", layer: 0, desc: "Second-largest silicon wafer producer globally", ticker: "3436.T", marketCap: "$7B+", revenue: "$3B", detail: "SUMCO is the #2 silicon wafer producer behind Shin-Etsu, together controlling ~55% of the global market for 300mm wafers." },
  { id: "siltronic", label: "Siltronic", layer: 0, desc: "German silicon wafer manufacturer, major European supplier", ticker: "WAF.DE", marketCap: "$3B+", revenue: "$1.8B", detail: "Germany-based Siltronic is one of the top five silicon wafer producers globally. A subsidiary of Wacker Chemie." },
  { id: "neon_gas", label: "Neon Gas\nSupply", layer: 0, desc: "Noble gases critical for DUV/EUV lithography lasers", ticker: null, marketCap: null, revenue: null, detail: "Neon, krypton, and xenon are essential for the excimer lasers used in lithography. Ukraine historically supplied ~50% of global semiconductor-grade neon." },
  { id: "photoresists", label: "JSR Corp\n(Photoresists)", layer: 0, desc: "Leading EUV/DUV photoresist manufacturer", ticker: null, marketCap: "Private (JIC)", revenue: "$3B+", detail: "JSR was taken private by Japan Investment Corp in 2024. A top photoresist maker — the light-sensitive chemicals that transfer circuit patterns to silicon. Developing metal-oxide resists for High-NA EUV." },
  { id: "tok", label: "Tokyo Ohka\nKogyo (TOK)", layer: 0, desc: "Major photoresist and semiconductor process material supplier", ticker: "4186.T", marketCap: "$3B+", revenue: "$1.4B", detail: "TOK is a leading photoresist manufacturer alongside JSR. Supplies critical resist materials for advanced node lithography at TSMC, Samsung, and Intel fabs." },
  { id: "fujifilm_semi", label: "Fujifilm\nElectronics", layer: 0, desc: "CMP slurries, photoresists, and process chemicals", ticker: "4901.T", marketCap: "$30B+", revenue: "$22B (group)", detail: "Fujifilm's electronics division supplies photoresists, CMP slurries, and process chemicals for semiconductor manufacturing." },
  { id: "dupont_semi", label: "DuPont\nElectronics", layer: 0, desc: "CMP pads, photomasks, advanced materials for chip fabs", ticker: "DD", marketCap: "$30B+", revenue: "$12B", detail: "DuPont Electronics & Industrial supplies critical CMP consumables, photomask materials, and advanced packaging materials for semiconductor manufacturing." },
  { id: "entegris", label: "Entegris", layer: 0, desc: "Ultra-pure materials, filters, and contamination control for fabs", ticker: "ENTG", marketCap: "$15B+", revenue: "$3.5B", detail: "Entegris provides materials purity and contamination control — filters, carriers, and specialty chemicals. Every fab needs Entegris products to prevent nanoscale defects." },
  { id: "cabot_micro", label: "CMC\nMaterials", layer: 0, desc: "CMP slurries and polishing materials for wafer planarization", ticker: null, marketCap: "Acquired by Entegris", revenue: "~$1.3B", detail: "CMC Materials (formerly Cabot Microelectronics) was acquired by Entegris for $6.5B. Leading supplier of CMP slurries used to polish wafers between process steps." },
  { id: "sumitomo_chem", label: "Sumitomo\nChemical", layer: 0, desc: "Photoresists and electronic materials supplier", ticker: "4005.T", marketCap: "$6B+", revenue: "$18B (group)", detail: "Sumitomo Chemical produces photoresists and other electronic materials through its IT-related chemicals division. Expanding EUV resist production." },
  { id: "linde_gas", label: "Linde plc\n(Gases)", layer: 0, desc: "Industrial and specialty gases for semiconductor fabs", ticker: "LIN", marketCap: "$200B+", revenue: "$33B", detail: "Linde supplies ultra-high purity gases (nitrogen, argon, hydrogen, specialty gas mixtures) essential for semiconductor manufacturing. On-site gas generation at major fabs." },
  { id: "air_liquide", label: "Air Liquide\n(Gases)", layer: 0, desc: "Specialty gases and on-site supply for semiconductor fabs", ticker: "AI.PA", marketCap: "$95B+", revenue: "$28B", detail: "Air Liquide provides specialty gases, advanced materials, and on-site supply systems for semiconductor fabrication facilities worldwide." },
  { id: "rare_earths", label: "Rare Earth\nMinerals", layer: 0, desc: "Critical minerals for magnets, optics, and electronic components", ticker: null, marketCap: null, revenue: null, detail: "China controls ~60% of rare earth mining and ~90% of processing. Essential for components throughout the semiconductor and electronics supply chain." },
  { id: "sk_materials", label: "SK Specialty\n(Materials)", layer: 0, desc: "Specialty gases and precursors for semiconductor deposition", ticker: null, marketCap: null, revenue: "$1B+", detail: "SK Specialty (formerly SK Materials) produces NF3, WF6, SiH4, and other specialty gases used in CVD and etching processes at leading fabs." },

  // ═══════════════════════════════════════════════
  // LAYER 1: EQUIPMENT & IP
  // ═══════════════════════════════════════════════
  { id: "asml", label: "ASML", layer: 1, desc: "Monopoly on EUV lithography — most complex machines ever built", ticker: "ASML", marketCap: "$350B+", revenue: "€28B", detail: "ASML is the sole manufacturer of EUV lithography machines ($150-350M each). No EUV = no chips below 7nm. Their High-NA EUV systems enable 2nm and beyond." },
  { id: "zeiss", label: "Zeiss SMT", layer: 1, desc: "Sole supplier of EUV optics — atomically perfect mirrors", ticker: null, marketCap: null, revenue: "~€2B (SMT)", detail: "Carl Zeiss SMT makes mirror systems for ASML's EUV machines, polished to sub-nanometer precision. If their single factory in Oberkochen were destroyed, EUV production halts globally." },
  { id: "trumpf", label: "TRUMPF\nLaser", layer: 1, desc: "Sole supplier of EUV laser light sources to ASML", ticker: null, marketCap: null, revenue: "€5B (group)", detail: "TRUMPF makes CO2 laser systems that generate EUV light by hitting tin droplets 50,000 times per second. Another irreplaceable single point of failure." },
  { id: "applied_materials", label: "Applied\nMaterials", layer: 1, desc: "Largest semiconductor equipment maker — deposition, etch, inspection", ticker: "AMAT", marketCap: "$140B+", revenue: "$27B", detail: "Applied Materials makes machines that deposit thin films, etch patterns, and inspect wafers. Present in virtually every fab worldwide. Broadest portfolio in the industry." },
  { id: "lam_research", label: "Lam\nResearch", layer: 1, desc: "Etch and deposition leader, critical for advanced NAND and logic", ticker: "LRCX", marketCap: "$100B+", revenue: "$17B", detail: "Lam dominates plasma etch — carving circuit patterns into silicon. Also strong in chemical vapor deposition (CVD). Essential for both logic and 3D NAND memory." },
  { id: "tokyo_electron", label: "Tokyo\nElectron", layer: 1, desc: "Coater/developer, etch, deposition — near monopoly in coat/develop", ticker: "8035.T", marketCap: "$100B+", revenue: "$14B", detail: "TEL manufactures thousands of machines across deposition, coating, developing, etching, and cleaning. Near-monopoly in coater/developer equipment and ASML's preferred partner." },
  { id: "kla", label: "KLA Corp", layer: 1, desc: "Process control and inspection — finds defects at the nanoscale", ticker: "KLAC", marketCap: "$90B+", revenue: "$11B", detail: "KLA has 50%+ market share in metrology and inspection. Their optical and e-beam systems find defects invisible to other tools. Essential for yield management in every advanced fab." },
  { id: "screen_holdings", label: "SCREEN\nHoldings", layer: 1, desc: "Wafer cleaning and surface preparation equipment", ticker: "7735.T", marketCap: "$8B+", revenue: "$4B", detail: "SCREEN Holdings dominates wafer cleaning equipment — chips must be cleaned dozens of times during manufacturing. Also makes coating and developing equipment." },
  { id: "asm_intl", label: "ASM\nInternational", layer: 1, desc: "Atomic layer deposition (ALD) and epitaxy equipment leader", ticker: "ASM.AS", marketCap: "$30B+", revenue: "$3B", detail: "ASM International is a leading supplier of ALD and epitaxy equipment. ALD deposits films one atomic layer at a time — essential for gate-all-around transistors at 3nm and beyond." },
  { id: "kokusai", label: "Kokusai\nElectric", layer: 1, desc: "Batch ALD and thermal processing with 70% market share", ticker: "6525.T", marketCap: "$8B+", revenue: "$2B", detail: "Kokusai Electric has ~70% market share in batch atomic layer deposition. Critical for 3D semiconductor architectures. Competes primarily with Tokyo Electron." },
  { id: "advantest", label: "Advantest", layer: 1, desc: "Semiconductor test equipment — 50%+ market share in testers", ticker: "6857.T", marketCap: "$25B+", revenue: "$4B+", detail: "Advantest holds over 50% market share in semiconductor test equipment. Every chip must be tested before shipping. Their testers are essential for HBM, GPUs, and advanced logic." },
  { id: "teradyne", label: "Teradyne", layer: 1, desc: "Semiconductor and system test equipment, plus robotics", ticker: "TER", marketCap: "$18B+", revenue: "$2.8B", detail: "Teradyne provides test equipment for semiconductors, wireless devices, and electronics. Competes with Advantest in the chip testing market." },
  { id: "disco", label: "DISCO Corp", layer: 1, desc: "Wafer dicing, grinding, and polishing — 75% market share", ticker: "6146.T", marketCap: "$15B+", revenue: "$2.5B", detail: "DISCO holds ~75% market share in equipment for cutting (dicing) and thinning (grinding) silicon wafers. Every chip must be cut from its wafer using DISCO tools." },
  { id: "nikon_litho", label: "Nikon\n(Lithography)", layer: 1, desc: "DUV immersion lithography — the only ASML alternative for ArF", ticker: "7731.T", marketCap: "$6B+", revenue: "$5B (group)", detail: "Nikon is the only significant competitor to ASML in ArF immersion (DUV) lithography. Critical for mature nodes and some advanced patterning steps. No EUV capability." },
  { id: "canon_litho", label: "Canon\n(Lithography)", layer: 1, desc: "i-line and KrF lithography, plus nanoimprint for advanced nodes", ticker: "7751.T", marketCap: "$30B+", revenue: "$30B (group)", detail: "Canon makes i-line and KrF lithography systems. Developing nanoimprint lithography (NIL) as a potential alternative to EUV for certain advanced patterning steps." },
  { id: "synopsys", label: "Synopsys", layer: 1, desc: "EDA tools — the software used to design every advanced chip", ticker: "SNPS", marketCap: "$80B+", revenue: "$6.1B", detail: "Along with Cadence, Synopsys provides electronic design automation software. No modern chip can be designed without EDA. A quiet but critical duopoly." },
  { id: "cadence", label: "Cadence", layer: 1, desc: "EDA tools and IP — co-duopoly with Synopsys", ticker: "CDNS", marketCap: "$75B+", revenue: "$4.6B", detail: "Cadence and Synopsys control ~70% of the EDA market. Every chip design from every company flows through their tools." },
  { id: "arm", label: "ARM\nHoldings", layer: 1, desc: "CPU architecture IP licensed for mobile, server, and AI chips", ticker: "ARM", marketCap: "$150B+", revenue: "$3.2B", detail: "ARM doesn't make chips — it licenses the instruction set architecture used by Apple, Qualcomm, AWS Graviton, Nvidia Grace, and virtually every mobile processor." },
  { id: "lasertec", label: "Lasertec", layer: 1, desc: "Only maker of EUV photomask inspection tools", ticker: "6920.T", marketCap: "$10B+", revenue: "$800M", detail: "Lasertec has a monopoly on EUV photomask inspection equipment. Every EUV mask must be inspected with their tools before use in lithography." },
  { id: "onto_innovation", label: "Onto\nInnovation", layer: 1, desc: "Inspection and metrology for advanced packaging", ticker: "ONTO", marketCap: "$8B+", revenue: "$1B", detail: "Onto Innovation provides inspection and metrology equipment, particularly strong in advanced packaging — CoWoS, fan-out, and chiplet architectures." },
  { id: "nova_measuring", label: "Nova Ltd", layer: 1, desc: "Metrology for advanced semiconductor manufacturing", ticker: "NVMI", marketCap: "$6B+", revenue: "$700M", detail: "Nova provides metrology solutions for semiconductor manufacturing, specializing in optical and X-ray measurement for advanced process nodes." },
  { id: "veeco", label: "Veeco", layer: 1, desc: "Ion beam and laser processing equipment for semiconductors", ticker: "VECO", marketCap: "$2B+", revenue: "$700M", detail: "Veeco makes ion beam, laser annealing, and deposition systems for semiconductor and compound semiconductor manufacturing." },
  { id: "ulvac", label: "ULVAC", layer: 1, desc: "Vacuum equipment for sputtering, CVD, and etching", ticker: "6728.T", marketCap: "$5B+", revenue: "$2.5B", detail: "ULVAC provides vacuum-based processing equipment for sputtering, CVD, and etching. Strong in display and semiconductor manufacturing." },

  // ═══════════════════════════════════════════════
  // LAYER 2: FABRICATION & PACKAGING
  // ═══════════════════════════════════════════════
  { id: "tsmc", label: "TSMC", layer: 2, desc: "World's largest foundry — 70% of advanced chips, including Nvidia", ticker: "TSM", marketCap: "$800B+", revenue: "$90B+", detail: "TSMC manufactures ~70% of the world's advanced semiconductors. Their N3 and N2 processes power AI accelerators. Concentrated in Taiwan — major geopolitical risk." },
  { id: "samsung_fab", label: "Samsung\nFoundry", layer: 2, desc: "Second-largest advanced foundry, plus world's largest memory maker", ticker: "005930.KS", marketCap: "$350B+", revenue: "$230B (group)", detail: "Samsung is both a major foundry and the world's largest memory maker. Gate-All-Around transistor technology competes with TSMC at leading edge." },
  { id: "intel_foundry", label: "Intel\nFoundry", layer: 2, desc: "US foundry backed by CHIPS Act, pursuing advanced nodes", ticker: "INTC", marketCap: "$100B+", revenue: "$54B (total)", detail: "Intel Foundry Services, backed by ~$20B in CHIPS Act subsidies, aims to compete with TSMC. Intel 18A process targets parity with TSMC N2." },
  { id: "globalfoundries", label: "Global-\nFoundries", layer: 2, desc: "Specialty foundry for IoT, automotive, and RF — not leading edge", ticker: "GFS", marketCap: "$25B+", revenue: "$7.4B", detail: "GlobalFoundries exited the leading-edge race in 2018 and focuses on specialty technologies — RF, embedded memory, automotive. Fab in Malta, NY." },
  { id: "umc", label: "UMC", layer: 2, desc: "Taiwan-based mature node foundry, strong in 28nm and above", ticker: "2303.TW", marketCap: "$20B+", revenue: "$7B", detail: "United Microelectronics Corporation (UMC) is the third-largest foundry globally, focused on mature process nodes from 28nm to 40nm." },
  { id: "smic", label: "SMIC", layer: 2, desc: "China's largest foundry — under US export controls", ticker: "0981.HK", marketCap: "$30B+", revenue: "$8B", detail: "Semiconductor Manufacturing International Corporation is China's most advanced foundry. Under US export controls limiting access to EUV equipment. Can produce at ~7nm using multi-patterning DUV." },
  { id: "sk_hynix", label: "SK Hynix", layer: 2, desc: "Leading HBM producer — THE critical bottleneck for AI GPUs", ticker: "000660.KS", marketCap: "$100B+", revenue: "$47B", detail: "SK Hynix is the primary supplier of High Bandwidth Memory (HBM) to Nvidia. HBM stacks are the #1 bottleneck constraining GPU production — more valuable per wafer than the GPUs themselves." },
  { id: "micron", label: "Micron", layer: 2, desc: "US-based DRAM and NAND manufacturer, growing HBM supplier", ticker: "MU", marketCap: "$100B+", revenue: "$29B", detail: "Micron is the only US-based major memory manufacturer. HBM3E products are qualified for Nvidia's latest GPUs, providing supply chain diversification from SK Hynix." },
  { id: "samsung_memory", label: "Samsung\nMemory", layer: 2, desc: "World's largest memory maker — DRAM, NAND, and HBM", ticker: null, marketCap: null, revenue: "$60B+ (memory)", detail: "Samsung's memory division is the world's largest, producing DRAM, NAND flash, and HBM. Third HBM supplier alongside SK Hynix and Micron." },
  { id: "cowos", label: "CoWoS\nPackaging", layer: 2, desc: "TSMC's advanced packaging — the #1 bottleneck for AI chips", ticker: null, marketCap: null, revenue: null, detail: "Chip-on-Wafer-on-Substrate packages GPU dies with HBM stacks. CoWoS capacity is the primary bottleneck for AI chip supply. TSMC expanding from 30K to 90K+ wafers/month." },
  { id: "ase_group", label: "ASE Group", layer: 2, desc: "World's largest OSAT — outsourced semiconductor assembly and test", ticker: "3711.TW", marketCap: "$20B+", revenue: "$20B", detail: "ASE Technology Holding is the world's largest outsourced semiconductor assembly and test (OSAT) company. Provides packaging, testing, and system-in-package services." },
  { id: "amkor", label: "Amkor", layer: 2, desc: "Second-largest OSAT — advanced packaging for AI and mobile", ticker: "AMKR", marketCap: "$6B+", revenue: "$7B", detail: "Amkor Technology is the second-largest OSAT, providing advanced packaging including fan-out wafer-level packaging and 2.5D/3D packaging for AI chips." },
  { id: "jcet", label: "JCET Group", layer: 2, desc: "China's largest OSAT — packaging and test services", ticker: "600584.SS", marketCap: "$8B+", revenue: "$5B", detail: "JCET (Jiangsu Changjiang Electronics Technology) is China's largest and the world's third-largest OSAT company." },
  { id: "rapidus", label: "Rapidus", layer: 2, desc: "Japanese foundry startup aiming for 2nm with IBM partnership", ticker: null, marketCap: "Private", revenue: "Pre-revenue", detail: "Rapidus is a Japanese government-backed foundry startup in Hokkaido, partnering with IBM on 2nm technology. Aiming for pilot production by 2025, mass production by 2027." },

  // ═══════════════════════════════════════════════
  // LAYER 3: CHIP DESIGN
  // ═══════════════════════════════════════════════
  { id: "nvidia", label: "NVIDIA", layer: 3, desc: "Dominant AI accelerator — GPUs power ~90% of AI training", ticker: "NVDA", marketCap: "$2.5T+", revenue: "$130B+", detail: "Nvidia designs the GPUs (H100, H200, B200, GB200) that train and serve virtually all frontier AI models. CUDA ecosystem creates massive switching costs. The most important company in AI." },
  { id: "amd", label: "AMD", layer: 3, desc: "Second-largest AI GPU designer — MI300X/MI325X/MI355X", ticker: "AMD", marketCap: "$200B+", revenue: "$26B", detail: "AMD's Instinct MI300X and MI325X GPUs are the primary Nvidia alternative. Meta and Microsoft are significant customers. ~10% AI accelerator market share." },
  { id: "intel_gpu", label: "Intel\nGaudi", layer: 3, desc: "Intel's AI accelerator — Gaudi 3 for training and inference", ticker: null, marketCap: null, revenue: null, detail: "Intel's Gaudi accelerators (acquired from Habana Labs) target AI training and inference. Gaudi 3 competes at the H100 level. Adopted by some cloud providers but limited traction." },
  { id: "broadcom", label: "Broadcom", layer: 3, desc: "Custom AI ASICs for Google TPU and hyperscalers, plus networking", ticker: "AVGO", marketCap: "$800B+", revenue: "$51B", detail: "Broadcom designs custom AI accelerators for Google (TPU) and other hyperscalers, plus dominant networking chips (Memory, Ethernet switching) for AI data centers." },
  { id: "marvell", label: "Marvell", layer: 3, desc: "Custom AI silicon and networking for cloud data centers", ticker: "MRVL", marketCap: "$70B+", revenue: "$5.5B", detail: "Marvell designs custom AI accelerators for Amazon (Trainium) and others, plus networking, storage controllers, and electro-optics for AI data centers." },
  { id: "qualcomm", label: "Qualcomm", layer: 3, desc: "AI inference chips for edge devices, phones, and PCs", ticker: "QCOM", marketCap: "$180B+", revenue: "$39B", detail: "Qualcomm's Snapdragon processors power on-device AI inference in billions of smartphones and increasingly in PCs with Snapdragon X Elite/Plus." },
  { id: "google_tpu", label: "Google\nTPU", layer: 3, desc: "Custom AI accelerator — TPU v6 Trillium powers Gemini", ticker: null, marketCap: null, revenue: null, detail: "Google designs Tensor Processing Units in-house, manufactured by Broadcom at TSMC. TPU v6 (Trillium) powers Gemini training, providing independence from Nvidia." },
  { id: "aws_trainium", label: "AWS\nTrainium", layer: 3, desc: "Amazon's custom AI training chip via Annapurna Labs", ticker: null, marketCap: null, revenue: null, detail: "Amazon designs Trainium chips through Annapurna Labs (with Marvell silicon) for training AI models on AWS. Trainium 3 targets competitive Nvidia performance." },
  { id: "ms_maia", label: "Microsoft\nMaia", layer: 3, desc: "Microsoft's custom AI accelerator for Azure", ticker: null, marketCap: null, revenue: null, detail: "Microsoft designed the Maia 100 AI accelerator for Azure workloads, manufactured at TSMC on 5nm. Part of Microsoft's strategy to reduce Nvidia dependence." },
  { id: "cerebras", label: "Cerebras", layer: 3, desc: "Wafer-scale AI chip — world's largest processor", ticker: null, marketCap: "$8B+ (private)", revenue: null, detail: "Cerebras builds the world's largest AI chips — entire wafer-scale processors. Raised $1.1B and delayed IPO to pursue stronger 2026 listing." },
  { id: "groq", label: "Groq", layer: 3, desc: "LPU inference chip optimized for ultra-low latency AI serving", ticker: null, marketCap: "$2.5B+ (private)", revenue: null, detail: "Groq builds Language Processing Units (LPUs) optimized for AI inference speed. Offers the fastest token generation of any AI chip." },
  { id: "tenstorrent", label: "Tenstorrent", layer: 3, desc: "RISC-V AI accelerator startup led by Jim Keller", ticker: null, marketCap: "$2B+ (private)", revenue: null, detail: "Led by legendary chip architect Jim Keller, Tenstorrent designs RISC-V-based AI accelerators as an open alternative to Nvidia's CUDA ecosystem." },
  { id: "d_matrix", label: "d-Matrix", layer: 3, desc: "Digital in-memory computing chip for AI inference", ticker: null, marketCap: "$1B+ (private)", revenue: null, detail: "d-Matrix builds in-memory computing chips for AI inference, processing data where it's stored rather than shuttling it back and forth to separate memory." },
  { id: "sambanova", label: "SambaNova", layer: 3, desc: "Reconfigurable dataflow architecture for enterprise AI", ticker: null, marketCap: "$5B+ (private)", revenue: null, detail: "SambaNova builds full-stack AI platforms with custom reconfigurable dataflow chips, targeting enterprise and government AI deployments." },
  { id: "apple_silicon", label: "Apple\nSilicon", layer: 3, desc: "M-series and A-series chips with integrated neural engines", ticker: "AAPL", marketCap: "$3T+", revenue: "$391B", detail: "Apple designs ARM-based processors with integrated neural engines for on-device AI. Largest ARM licensee by revenue. Powers iPhones, Macs, and on-device Apple Intelligence." },

  // ═══════════════════════════════════════════════
  // LAYER 4: NETWORKING & INTERCONNECT
  // ═══════════════════════════════════════════════
  { id: "nvidia_networking", label: "Nvidia\nNetworking", layer: 4, desc: "InfiniBand and Spectrum Ethernet — $5B+/quarter from Mellanox", ticker: null, marketCap: null, revenue: "$20B+ (annual)", detail: "Nvidia's networking division (from Mellanox acquisition) provides InfiniBand and Spectrum-X Ethernet for AI data centers. InfiniBand connects GPUs within clusters with <2μs latency." },
  { id: "arista", label: "Arista\nNetworks", layer: 4, desc: "High-speed Ethernet switches for AI data centers", ticker: "ANET", marketCap: "$100B+", revenue: "$8.9B", detail: "Arista builds ultra-fast Ethernet switches connecting GPU clusters. Three of five major hyperscalers use Arista in AI backend networks. Growing AI revenue past $1B." },
  { id: "cisco_dc", label: "Cisco\n(Data Center)", layer: 4, desc: "Ethernet networking and AI infrastructure switches", ticker: "CSCO", marketCap: "$230B+", revenue: "$54B", detail: "Cisco received $2B+ in AI infrastructure orders in FY2025. Building AI-specific Ethernet platforms to compete with Arista and Nvidia networking." },
  { id: "juniper_hpe", label: "HPE/Juniper\nNetworking", layer: 4, desc: "Data center networking from HPE's Juniper acquisition", ticker: "HPE", marketCap: "$25B+", revenue: "$30B", detail: "HPE acquired Juniper Networks for $14B. Juniper's data center switches and Apstra fabric management compete in AI networking alongside Arista and Cisco." },
  { id: "broadcom_nw", label: "Broadcom\nSwitching", layer: 4, desc: "Tomahawk/Jericho switch ASICs powering most Ethernet switches", ticker: null, marketCap: null, revenue: null, detail: "Broadcom's Tomahawk and Jericho switch ASICs are the silicon inside most third-party Ethernet switches, including Arista's. Doubles bandwidth every two years." },
  { id: "celestica", label: "Celestica", layer: 4, desc: "White-box network switches and server assemblies for hyperscalers", ticker: "CLS", marketCap: "$10B+", revenue: "$9B+", detail: "Celestica builds white-box network switches and server platforms. One of the top three vendors in AI data center networking alongside Arista and Nvidia." },
  { id: "coherent", label: "Coherent\n(II-VI)", layer: 4, desc: "Optical transceivers and laser components for data center connectivity", ticker: "COHR", marketCap: "$15B+", revenue: "$5B", detail: "Coherent (formerly II-VI) manufactures 800G and 1.6T optical transceivers, VCSELs, and laser components essential for connecting GPU clusters across data centers." },
  { id: "lumentum", label: "Lumentum", layer: 4, desc: "Optical and photonic products for data center interconnects", ticker: "LITE", marketCap: "$5B+", revenue: "$1.3B", detail: "Lumentum provides optical transceivers, lasers, and photonic components for high-speed data center connectivity. Key supplier for 800G and emerging 1.6T optics." },
  { id: "inphi_marvell", label: "Marvell\nElectro-Optics", layer: 4, desc: "PAM4 DSPs and silicon photonics for optical interconnects", ticker: null, marketCap: null, revenue: null, detail: "Marvell's electro-optics division (from Inphi acquisition) builds PAM4 DSPs and silicon photonics chips inside optical transceivers connecting AI data centers." },
  { id: "nvlink", label: "NVLink &\nNVSwitch", layer: 4, desc: "Nvidia's proprietary GPU-to-GPU interconnect — 1.8 TB/s per GPU", ticker: null, marketCap: null, revenue: null, detail: "NVLink 5 provides 1.8 TB/s bidirectional bandwidth per GPU, connecting up to 576 GPUs at full speed. Proprietary to Nvidia — a key competitive advantage." },

  // ═══════════════════════════════════════════════
  // LAYER 5: SYSTEMS & SERVERS
  // ═══════════════════════════════════════════════
  { id: "smci", label: "Super Micro\n(SMCI)", layer: 5, desc: "GPU server OEM — builds rack-mounted AI server systems", ticker: "SMCI", marketCap: "$25B+", revenue: "$15B+", detail: "Supermicro assembles GPU server systems shipped to data centers. Takes Nvidia GPUs, HBM, and components and builds physical rack-mounted servers. Major liquid cooling provider." },
  { id: "dell_servers", label: "Dell\nServers", layer: 5, desc: "Enterprise AI server systems — PowerEdge with Nvidia GPUs", ticker: "DELL", marketCap: "$75B+", revenue: "$96B", detail: "Dell's PowerEdge servers with Nvidia GPUs serve enterprise AI workloads. Strong presence in on-premise AI infrastructure alongside their cloud partnerships." },
  { id: "hpe_servers", label: "HPE\nServers", layer: 5, desc: "Enterprise AI servers and Cray supercomputers", ticker: "HPE", marketCap: "$25B+", revenue: "$30B", detail: "HPE builds enterprise AI servers and Cray-branded supercomputers. Significant government and research institution customer base for HPC and AI." },
  { id: "lenovo_dcg", label: "Lenovo\nDCG", layer: 5, desc: "Data center servers and AI infrastructure systems", ticker: "0992.HK", marketCap: "$15B+", revenue: "$62B (group)", detail: "Lenovo's Infrastructure Solutions Group builds AI-optimized servers. Growing presence in enterprise AI deployments globally." },
  { id: "foxconn", label: "Foxconn\n(Hon Hai)", layer: 5, desc: "World's largest electronics contract manufacturer — builds GB200 servers", ticker: "2317.TW", marketCap: "$60B+", revenue: "$215B", detail: "Foxconn (Hon Hai) is the world's largest electronics contract manufacturer. Now building Nvidia GB200 NVL72 racks and AI server systems for hyperscalers." },
  { id: "quanta", label: "Quanta\nComputer", layer: 5, desc: "ODM building AI servers for cloud providers", ticker: "2382.TW", marketCap: "$40B+", revenue: "$45B", detail: "Quanta is a major original design manufacturer (ODM) building custom AI server systems for Google, Microsoft, and other hyperscalers." },
  { id: "wistron", label: "Wistron /\nWiwynn", layer: 5, desc: "ODM for cloud server systems and AI infrastructure", ticker: "3231.TW", marketCap: "$10B+", revenue: "$30B", detail: "Wistron and its cloud subsidiary Wiwynn design and manufacture custom server platforms for Microsoft Azure, Meta, and other hyperscalers." },
  { id: "inventec", label: "Inventec", layer: 5, desc: "Server ODM for hyperscaler AI infrastructure", ticker: "2356.TW", marketCap: "$5B+", revenue: "$20B", detail: "Inventec manufactures servers and storage systems for major cloud providers including Amazon and HP." },
  { id: "vertiv", label: "Vertiv", layer: 5, desc: "Power and cooling infrastructure for AI data centers", ticker: "VRT", marketCap: "$45B+", revenue: "$8B", detail: "Vertiv provides critical power, cooling, and infrastructure management for data centers. Liquid cooling demand for AI GPU racks is a major growth driver." },
  { id: "schneider", label: "Schneider\nElectric", layer: 5, desc: "Power distribution, UPS, and cooling for data centers", ticker: "SU.PA", marketCap: "$120B+", revenue: "$40B", detail: "Schneider Electric provides power distribution, UPS systems, and cooling infrastructure for data centers worldwide. Growing AI data center business." },
  { id: "eaton", label: "Eaton\nPower", layer: 5, desc: "Electrical power management for data center infrastructure", ticker: "ETN", marketCap: "$120B+", revenue: "$24B", detail: "Eaton provides power distribution, UPS, and electrical infrastructure for data centers. Key beneficiary of massive AI data center buildout." },
  { id: "nvent", label: "nVent\nElectric", layer: 5, desc: "Liquid cooling and thermal management for GPU racks", ticker: "NVT", marketCap: "$12B+", revenue: "$3B", detail: "nVent provides liquid cooling solutions and enclosures for AI data center racks. Direct-to-chip liquid cooling is essential for high-power GPU clusters." },

  // ═══════════════════════════════════════════════
  // LAYER 6: CLOUD & DATA CENTERS
  // ═══════════════════════════════════════════════
  { id: "microsoft_azure", label: "Microsoft\nAzure", layer: 6, desc: "Primary cloud for OpenAI, massive AI infrastructure buildout", ticker: "MSFT", marketCap: "$3T+", revenue: "$245B", detail: "Microsoft invested $13B+ in OpenAI and provides Azure cloud infrastructure for GPT training. Stargate project plans $500B in AI infrastructure." },
  { id: "google_cloud", label: "Google\nCloud", layer: 6, desc: "GCP with TPU and GPU cloud, powers Gemini", ticker: "GOOGL", marketCap: "$2T+", revenue: "$350B", detail: "Google Cloud provides TPU and Nvidia GPU infrastructure. Powers internal Gemini training and external AI customers. Unique hybrid of cloud + custom silicon." },
  { id: "aws", label: "Amazon\nAWS", layer: 6, desc: "Largest cloud provider, primary partner for Anthropic", ticker: "AMZN", marketCap: "$2T+", revenue: "$640B", detail: "AWS is the largest cloud provider and Anthropic's primary partner ($8B+ invested). Offers Bedrock AI platform plus custom Trainium/Inferentia chips." },
  { id: "meta_infra", label: "Meta\nInfrastructure", layer: 6, desc: "Massive GPU clusters for Llama — not a cloud but key GPU buyer", ticker: "META", marketCap: "$1.5T+", revenue: "$165B", detail: "Meta operates one of the world's largest GPU clusters for Llama training. Not a cloud provider but among the largest Nvidia GPU customers." },
  { id: "oracle_cloud", label: "Oracle\nCloud", layer: 6, desc: "Fast-growing AI cloud, OpenAI Stargate partner", ticker: "ORCL", marketCap: "$400B+", revenue: "$56B", detail: "Oracle Cloud Infrastructure has grown rapidly in AI. $300B deal to supply compute for OpenAI Stargate. Investing $50B in data center capex." },
  { id: "coreweave", label: "CoreWeave", layer: 6, desc: "GPU neocloud — Nvidia-backed, recently IPO'd", ticker: "CRWV", marketCap: "$40B+", revenue: "$1.9B (2024)", detail: "CoreWeave is the largest GPU cloud startup. Recently IPO'd. Purpose-built for AI with massive Nvidia GPU deployments. Microsoft = 67% of revenue." },
  { id: "lambda_cloud", label: "Lambda\nCloud", layer: 6, desc: "GPU cloud for AI researchers and startups", ticker: null, marketCap: "$1.5B+ (private)", revenue: null, detail: "Lambda provides on-demand GPU cloud optimized for AI training and inference. Popular among AI researchers and startups." },
  { id: "crusoe", label: "Crusoe\nEnergy", layer: 6, desc: "Climate-aligned GPU cloud using stranded energy", ticker: null, marketCap: "$3B+ (private)", revenue: null, detail: "Crusoe builds AI data centers powered by stranded natural gas and renewable energy. Converts wasted energy into AI compute." },
  { id: "nebius", label: "Nebius\n(ex-Yandex)", layer: 6, desc: "European AI cloud infrastructure spun from Yandex", ticker: "NBIS", marketCap: "$10B+", revenue: null, detail: "Nebius (formerly Yandex's cloud division) provides AI-focused GPU cloud in Europe. Building large GPU clusters for training and inference." },
  { id: "equinix", label: "Equinix", layer: 6, desc: "World's largest data center REIT — colocation and interconnection", ticker: "EQIX", marketCap: "$80B+", revenue: "$8.5B", detail: "Equinix operates 260+ data centers globally. Provides colocation space where cloud providers and enterprises deploy AI infrastructure." },
  { id: "digital_realty", label: "Digital\nRealty", layer: 6, desc: "Major data center REIT — colocation for hyperscalers", ticker: "DLR", marketCap: "$50B+", revenue: "$5.7B", detail: "Digital Realty provides data center colocation and interconnection services. Key landlord for hyperscalers deploying AI infrastructure." },

  // ═══════════════════════════════════════════════
  // LAYER 7: AI LABS & MODELS
  // ═══════════════════════════════════════════════
  { id: "openai", label: "OpenAI", layer: 7, desc: "Creator of GPT-4/GPT-5 — largest AI lab by revenue", ticker: null, marketCap: "$840B (private)", revenue: "$20B+ ARR", detail: "OpenAI is the leading AI lab, creator of ChatGPT. Raised $110B at $840B valuation. Primary cloud partner is Microsoft Azure. Fastest revenue ramp in tech history." },
  { id: "anthropic", label: "Anthropic", layer: 7, desc: "Creator of Claude — Constitutional AI, safety-focused", ticker: null, marketCap: "$380B (private)", revenue: "$14B ARR", detail: "Anthropic builds Claude models emphasizing AI safety. Raised $30B Series G at $380B valuation. Primary cloud partner is AWS." },
  { id: "google_deepmind", label: "Google\nDeepMind", layer: 7, desc: "Gemini models, AlphaFold — Google's AI research powerhouse", ticker: null, marketCap: null, revenue: null, detail: "DeepMind develops Gemini models and scientific AI like AlphaFold. Unique access to Google's TPU infrastructure and massive data assets." },
  { id: "meta_ai", label: "Meta AI\n(FAIR)", layer: 7, desc: "Llama open-weight models — largest open-source AI effort", ticker: null, marketCap: null, revenue: null, detail: "Meta AI develops Llama, the most widely used open-weight model family. Meta AI reaches 1B+ monthly users across Facebook, Instagram, and WhatsApp." },
  { id: "xai", label: "xAI", layer: 7, desc: "Grok models, merged with SpaceX — targeting IPO", ticker: null, marketCap: "$230B+", revenue: null, detail: "xAI developed Grok models and merged with SpaceX in a ~$1.25T combined entity. Operates the Memphis Colossus GPU cluster. Targeting June 2026 IPO." },
  { id: "mistral", label: "Mistral AI", layer: 7, desc: "European AI champion — open-source models, sovereign AI", ticker: null, marketCap: "$6B+ (private)", revenue: null, detail: "Mistral AI is Europe's largest AI unicorn. Open-source LLMs with sovereign AI focus and French government backing. Competing with US labs on capability." },
  { id: "deepseek", label: "DeepSeek", layer: 7, desc: "Chinese AI lab — highly efficient open models", ticker: null, marketCap: "Private", revenue: null, detail: "DeepSeek builds surprisingly capable open-source models (DeepSeek V3, R1) that achieve near-frontier performance at a fraction of the compute cost." },
  { id: "cohere", label: "Cohere", layer: 7, desc: "Enterprise-focused AI models and RAG platform", ticker: null, marketCap: "$5.5B (private)", revenue: null, detail: "Cohere builds AI models specifically for enterprise use cases — retrieval-augmented generation, search, and multilingual applications." },
  { id: "ai21", label: "AI21 Labs", layer: 7, desc: "Jamba models — enterprise AI with long context", ticker: null, marketCap: "$4B+ (private)", revenue: null, detail: "AI21 Labs develops Jamba models using a Mamba-Transformer hybrid architecture. Focused on enterprise applications with very long context windows." },
  { id: "stability", label: "Stability AI", layer: 7, desc: "Open-source image generation — Stable Diffusion", ticker: null, marketCap: "~$1B (private)", revenue: null, detail: "Stability AI created Stable Diffusion, the most widely used open-source image generation model. Pioneered the open-source generative AI movement." },
  { id: "eleven_labs", label: "ElevenLabs", layer: 7, desc: "Voice AI — text-to-speech and voice cloning", ticker: null, marketCap: "$11B (private)", revenue: "$330M+ ARR", detail: "ElevenLabs builds the leading AI voice generation platform. $500M Series D led by Sequoia. Rapidly approaching IPO readiness." },
  { id: "runway_ml", label: "Runway", layer: 7, desc: "AI video generation — Gen-3 model", ticker: null, marketCap: "$5.3B (private)", revenue: null, detail: "Runway creates AI video generation models (Gen-3). Raised $315M Series E. Used by Hollywood studios and content creators for video production." },
  { id: "hugging_face", label: "Hugging\nFace", layer: 7, desc: "Open-source AI platform — the GitHub of machine learning", ticker: null, marketCap: "$4.5B (private)", revenue: null, detail: "Hugging Face is the central hub for open-source AI models, datasets, and tools. 500K+ models hosted. The infrastructure layer of the open-source AI ecosystem." },

  // ═══════════════════════════════════════════════
  // LAYER 8: AI PRODUCTS & APIs
  // ═══════════════════════════════════════════════
  { id: "chatgpt", label: "ChatGPT", layer: 8, desc: "300M+ weekly users — the consumer face of GPT models", ticker: null, marketCap: null, revenue: null, detail: "ChatGPT is the most widely used AI product globally with 300M+ weekly active users. Subscriptions from free to $200/month." },
  { id: "claude_ai", label: "Claude.ai", layer: 8, desc: "Anthropic's product — chat, Claude Code, Cowork, API", ticker: null, marketCap: null, revenue: null, detail: "Claude.ai serves users via chat, Claude Code (terminal agent), and Cowork (desktop automation). API serves developers. Free to $200/month." },
  { id: "gemini_app", label: "Gemini\nApp", layer: 8, desc: "Google's AI assistant — Search, Workspace, Android", ticker: null, marketCap: null, revenue: null, detail: "Gemini is Google's AI assistant, accessible standalone and integrated into Search, Gmail, Docs, and Android. Powered by Gemini models on TPUs." },
  { id: "github_copilot", label: "GitHub\nCopilot", layer: 8, desc: "AI coding assistant — 15M+ developers", ticker: null, marketCap: null, revenue: "$500M+ ARR", detail: "GitHub Copilot assists developers with AI code generation. Uses OpenAI and Anthropic models. 15M+ paid developers. Most successful dev AI product." },
  { id: "meta_ai_app", label: "Meta AI\nAssistant", layer: 8, desc: "AI across Facebook, Instagram, WhatsApp — 1B+ monthly users", ticker: null, marketCap: null, revenue: null, detail: "Meta AI is integrated across Facebook, Instagram, and WhatsApp. 1B+ monthly active users. Powered by Llama models." },
  { id: "grok_app", label: "Grok", layer: 8, desc: "xAI's AI assistant on the X platform", ticker: null, marketCap: null, revenue: null, detail: "Grok is xAI's AI assistant on the X (formerly Twitter) platform. Real-time information access and fewer content restrictions." },
  { id: "cursor", label: "Cursor", layer: 8, desc: "AI-powered code editor built on VS Code", ticker: null, marketCap: "$9B+ (private)", revenue: "$300M+ ARR", detail: "Cursor is an AI-first code editor using Claude and GPT models. Fastest-growing developer tool, reaching $300M ARR in record time." },
  { id: "perplexity", label: "Perplexity", layer: 8, desc: "AI search engine with citations", ticker: null, marketCap: "$9B+ (private)", revenue: "$100M+ ARR", detail: "Perplexity is an AI-powered answer engine that provides cited responses. Competing with Google Search. Growing rapidly among researchers and professionals." },
  { id: "midjourney", label: "Midjourney", layer: 8, desc: "AI image generation — premium quality, Discord-based", ticker: null, marketCap: "Private", revenue: "$200M+ ARR", detail: "Midjourney creates premium AI-generated images. Primarily accessed through Discord. Profitable and bootstrapped with no external funding." },
  { id: "openai_api", label: "OpenAI\nAPI", layer: 8, desc: "Developer API serving GPT models to thousands of applications", ticker: null, marketCap: null, revenue: null, detail: "OpenAI's API enables developers to integrate GPT models into applications. Powers thousands of AI startups and enterprise applications." },
  { id: "anthropic_api", label: "Anthropic\nAPI", layer: 8, desc: "Claude API for developers — growing enterprise adoption", ticker: null, marketCap: null, revenue: null, detail: "Anthropic's API serves Claude models to developers and enterprises. Available directly and through AWS Bedrock and Google Cloud Vertex AI." },
  { id: "aws_bedrock", label: "AWS\nBedrock", layer: 8, desc: "Managed AI model service offering Claude, Llama, and more", ticker: null, marketCap: null, revenue: null, detail: "AWS Bedrock provides managed access to foundation models from Anthropic, Meta, Mistral, and others. Simplifies enterprise AI deployment on AWS." },
  { id: "siri_apple", label: "Apple\nIntelligence", layer: 8, desc: "On-device AI across iPhone, Mac, iPad", ticker: null, marketCap: null, revenue: null, detail: "Apple Intelligence provides on-device AI features across Apple devices. Writing tools, image generation, smart replies. Powered by Apple Silicon neural engines and cloud models." },
  { id: "copilot_ms", label: "Microsoft\nCopilot", layer: 8, desc: "AI assistant across Windows, Office 365, and Bing", ticker: null, marketCap: null, revenue: null, detail: "Microsoft Copilot integrates AI across Windows, Microsoft 365 (Word, Excel, PowerPoint, Outlook), and Bing. Powered by OpenAI models on Azure." },
  { id: "claude_code", label: "Claude\nCode", layer: 8, desc: "Terminal-based AI coding agent by Anthropic", ticker: null, marketCap: null, revenue: null, detail: "Claude Code is a command-line AI coding agent that can autonomously write, test, and debug code. A key driver of Anthropic's developer adoption." },
  // ── ADDITIONAL NODES (200+ total) ──
  { id: "basf_semi", label: "BASF\nElectronics", layer: 0, desc: "Electronic chemicals, CMP slurries for fabs", ticker: "BAS.DE", marketCap: "$45B+", revenue: "$70B (group)", detail: "BASF provides CMP slurries, dielectrics, and electronic chemicals for semiconductor manufacturing." },
  { id: "honeywell_semi", label: "Honeywell\nElectronics", layer: 0, desc: "Specialty materials and solvents for chip fabs", ticker: "HON", marketCap: "$145B+", revenue: "$37B", detail: "Honeywell supplies specialty materials and performance chemicals for semiconductor processes." },
  { id: "merck_semi", label: "Merck KGaA\nElectronics", layer: 0, desc: "Semiconductor materials, specialty chemicals", ticker: "MRK.DE", marketCap: "$50B+", revenue: "$22B (group)", detail: "Merck KGaA provides photoresists, deposition materials, and specialty gases for chip manufacturing." },
  { id: "naura", label: "NAURA\nTechnology", layer: 1, desc: "China's largest semiconductor equipment maker", ticker: "002371.SZ", marketCap: "$15B+", revenue: "$3B+", detail: "NAURA is China's leading semiconductor equipment manufacturer for etch, deposition, and cleaning tools." },
  { id: "amec", label: "AMEC", layer: 1, desc: "Chinese etch and MOCVD equipment", ticker: "688012.SS", marketCap: "$10B+", revenue: "$1B+", detail: "AMEC specializes in etch and MOCVD systems for Chinese semiconductor fabs." },
  { id: "cohu", label: "Cohu Inc", layer: 1, desc: "Semiconductor test and inspection equipment", ticker: "COHU", marketCap: "$1.5B+", revenue: "$500M", detail: "Cohu provides test handlers, contactors, and inspection equipment for back-end semiconductor manufacturing." },
  { id: "powerchip", label: "Powerchip", layer: 2, desc: "Taiwan specialty foundry for drivers and power ICs", ticker: "6770.TW", marketCap: "$5B+", revenue: "$2B", detail: "Powerchip operates specialty fabs for display driver ICs and power management chips." },
  { id: "tower_semi", label: "Tower Semi", layer: 2, desc: "Specialty analog foundry with Intel partnership", ticker: "TSEM", marketCap: "$5B+", revenue: "$1.5B", detail: "Tower Semiconductor operates specialty analog fabs. Strategic partnership with Intel." },
  { id: "nanya_tech", label: "Nanya Tech", layer: 2, desc: "Taiwan DRAM manufacturer, Micron partnership", ticker: "2408.TW", marketCap: "$5B+", revenue: "$2B", detail: "Nanya Technology produces DRAM with Micron-licensed technology. Taiwan's only domestic DRAM maker." },
  { id: "mediatek", label: "MediaTek", layer: 3, desc: "Mobile SoC designer with AI engines — Dimensity", ticker: "2454.TW", marketCap: "$65B+", revenue: "$18B", detail: "MediaTek is the world's largest mobile chip designer by volume with integrated AI processing units." },
  { id: "nvidia_grace", label: "Nvidia\nGrace CPU", layer: 3, desc: "ARM-based data center CPU for AI workloads", ticker: null, marketCap: null, revenue: null, detail: "Nvidia Grace is an ARM-based server CPU designed to pair with Nvidia GPUs. Grace Hopper Superchip combines CPU + GPU." },
  { id: "ampere", label: "Ampere\nComputing", layer: 3, desc: "Cloud-native ARM server processors", ticker: null, marketCap: "$8B+ (private)", revenue: null, detail: "Ampere designs ARM processors optimized for cloud and AI inference. Backed by Oracle." },
  { id: "aws_graviton", label: "AWS\nGraviton", layer: 3, desc: "Amazon's custom ARM cloud processor", ticker: null, marketCap: null, revenue: null, detail: "AWS Graviton is Amazon's custom ARM processor designed by Annapurna Labs for cost-efficient cloud compute." },
  { id: "xilinx_amd", label: "AMD FPGA\n(Xilinx)", layer: 3, desc: "FPGAs for AI inference and data center acceleration", ticker: null, marketCap: null, revenue: null, detail: "AMD's FPGA division from Xilinx provides reconfigurable computing for AI inference and networking." },
  { id: "ciena", label: "Ciena", layer: 4, desc: "Optical networking for data center interconnects", ticker: "CIEN", marketCap: "$10B+", revenue: "$4B", detail: "Ciena provides optical networking equipment for long-haul and data center interconnect applications." },
  { id: "ge_vernova", label: "GE Vernova\n(Power)", layer: 5, desc: "Power generation and grid equipment for data centers", ticker: "GEV", marketCap: "$90B+", revenue: "$34B", detail: "GE Vernova provides gas turbines, transformers, and grid infrastructure to power AI data centers." },
  { id: "coolit", label: "CoolIT\nSystems", layer: 5, desc: "Direct liquid cooling for GPU racks", ticker: null, marketCap: "Private", revenue: null, detail: "CoolIT provides direct-to-chip liquid cooling essential as GPU power exceeds air cooling capacity." },
  { id: "vantage_dc", label: "Vantage\nData Centers", layer: 6, desc: "Hyperscale data center developer", ticker: null, marketCap: "Private", revenue: null, detail: "Vantage develops hyperscale data centers across North America, EMEA, and APAC for cloud AI deployments." },
  { id: "scaleway", label: "Scaleway", layer: 6, desc: "European cloud with GPU infrastructure", ticker: null, marketCap: null, revenue: null, detail: "Scaleway is the cloud arm of French telecom Iliad, providing GPU cloud in Europe for AI workloads." },
  { id: "baidu_ai", label: "Baidu\nERNIE", layer: 7, desc: "Chinese AI — ERNIE models powering Baidu search", ticker: "BIDU", marketCap: "$35B+", revenue: "$19B", detail: "Baidu develops ERNIE models powering its search engine and cloud services." },
  { id: "replit", label: "Replit", layer: 8, desc: "AI coding platform with browser IDE", ticker: null, marketCap: "$1B+ (private)", revenue: null, detail: "Browser-based IDE with AI agent that builds full applications from descriptions." },
  { id: "notion_ai", label: "Notion AI", layer: 8, desc: "AI writing and knowledge in Notion workspace", ticker: null, marketCap: "$10B+ (private)", revenue: null, detail: "AI writing, summarization, and Q&A integrated into Notion workspace." },
  { id: "character_ai", label: "Character.AI", layer: 8, desc: "AI character chatbot — licensed to Google", ticker: null, marketCap: "Licensed (~$2.7B)", revenue: null, detail: "Conversational AI characters platform, technology licensed to Google." },
  { id: "vercel_ai", label: "Vercel v0", layer: 8, desc: "AI web development tool", ticker: null, marketCap: "$3.5B (private)", revenue: null, detail: "Vercel v0 generates React components from natural language. Growing rapidly." },
  { id: "poe", label: "Poe\n(Quora)", layer: 8, desc: "Multi-model AI aggregator", ticker: null, marketCap: null, revenue: null, detail: "Poe provides access to multiple AI models in one interface with bot creation." },
  { id: "hf_inference", label: "HuggingFace\nInference", layer: 8, desc: "Serverless API for open-source models", ticker: null, marketCap: null, revenue: null, detail: "Serverless inference access to thousands of open-source AI models." },
  // ═══ BATCH 3: 50+ MORE NODES ═══
  // More Raw Materials
  { id: "wacker_chem", label: "Wacker\nChemie", layer: 0, desc: "Polysilicon and silicones for semiconductor wafers", ticker: "WCH.DE", marketCap: "$10B+", revenue: "$7B", detail: "Wacker Chemie produces polysilicon feedstock — the purified silicon that gets drawn into ingots for wafer manufacturing. Parent company of Siltronic." },
  { id: "resonac", label: "Resonac\n(Showa Denko)", layer: 0, desc: "CMP slurries, high-purity gases, and semiconductor materials", ticker: "4004.T", marketCap: "$8B+", revenue: "$10B", detail: "Resonac (formerly Showa Denko) supplies CMP slurries, high-purity gases, SiC substrates, and semiconductor packaging materials." },
  { id: "sk_siltron", label: "SK Siltron", layer: 0, desc: "Korean silicon wafer manufacturer — SK Group subsidiary", ticker: null, marketCap: null, revenue: "$1.5B+", detail: "SK Siltron (SK Group subsidiary) is a top-five silicon wafer producer. Acquired DuPont's SiC wafer business for compound semiconductors." },
  // More Equipment
  { id: "hitachi_ht", label: "Hitachi\nHigh-Tech", layer: 1, desc: "E-beam inspection, measurement, and semiconductor equipment", ticker: null, marketCap: null, revenue: "$8B (group)", detail: "Hitachi High-Tech provides electron beam inspection, CD-SEM measurement, and etching equipment for advanced semiconductor manufacturing." },
  { id: "aixtron", label: "AIXTRON", layer: 1, desc: "MOCVD equipment for compound semiconductors and power devices", ticker: "AIXA.DE", marketCap: "$3B+", revenue: "$700M", detail: "AIXTRON provides MOCVD (metal-organic CVD) systems for GaN and SiC compound semiconductors used in power electronics and RF devices." },
  // More Fabrication
  { id: "vanguard_intl", label: "VIS\n(Vanguard)", layer: 2, desc: "TSMC-affiliated specialty foundry for automotive and power", ticker: "5347.TW", marketCap: "$8B+", revenue: "$2B", detail: "Vanguard International Semiconductor is a TSMC-affiliated foundry specializing in power management, automotive, and industrial chips." },
  { id: "hua_hong", label: "Hua Hong\nSemiconductor", layer: 2, desc: "Chinese specialty foundry — power, RF, and embedded flash", ticker: "1347.HK", marketCap: "$5B+", revenue: "$2B", detail: "Hua Hong is China's second-largest foundry after SMIC, focused on specialty technologies including power management and IGBT." },
  { id: "spil", label: "SPIL\n(ASE Group)", layer: 2, desc: "Semiconductor packaging and test — merged into ASE Group", ticker: null, marketCap: null, revenue: null, detail: "Siliconware Precision Industries merged with ASE to form ASE Technology Holdings. Major packaging and test operation." },
  // More Chip Design
  { id: "intel_xeon", label: "Intel\nXeon / Core", layer: 3, desc: "Server and desktop CPUs — x86 architecture leader", ticker: null, marketCap: null, revenue: null, detail: "Intel's Xeon processors power the majority of existing data center servers. While GPUs dominate AI training, CPUs remain essential for orchestration and general workloads." },
  { id: "amd_epyc", label: "AMD\nEPYC", layer: 3, desc: "Server CPUs gaining share from Intel in data centers", ticker: null, marketCap: null, revenue: null, detail: "AMD EPYC server processors have taken significant share from Intel Xeon. Turin (Zen 5) processors power many AI-adjacent cloud workloads." },
  { id: "lattice", label: "Lattice Semi", layer: 3, desc: "Low-power FPGAs for edge AI and industrial applications", ticker: "LSCC", marketCap: "$6B+", revenue: "$500M", detail: "Lattice Semiconductor designs low-power FPGAs used for edge AI, industrial automation, and automotive applications." },
  { id: "sifive", label: "SiFive", layer: 3, desc: "RISC-V processor IP — open alternative to ARM", ticker: null, marketCap: "$2.5B (private)", revenue: null, detail: "SiFive provides RISC-V processor IP cores as an open-source alternative to ARM. Growing adoption in AI edge devices and custom chips." },
  { id: "hailo", label: "Hailo", layer: 3, desc: "Edge AI processor — specialized for on-device inference", ticker: null, marketCap: "$1B+ (private)", revenue: null, detail: "Hailo designs AI processors for edge devices — cameras, vehicles, drones. High efficiency for on-device inference workloads." },
  // More Networking
  { id: "extreme_nw", label: "Extreme\nNetworks", layer: 4, desc: "Enterprise and data center networking for AI", ticker: "EXTR", marketCap: "$4B+", revenue: "$1.3B", detail: "Extreme Networks provides enterprise networking with growing AI data center capabilities." },
  { id: "nokia_dc", label: "Nokia\n(Data Center)", layer: 4, desc: "Data center networking and optical transport", ticker: "NOK", marketCap: "$25B+", revenue: "$22B", detail: "Nokia provides data center fabric, optical transport (Infinera acquisition), and IP routing for hyperscale and enterprise data centers." },
  // More Systems
  { id: "compal", label: "Compal\nElectronics", layer: 5, desc: "ODM for notebook PCs and growing server business", ticker: "2324.TW", marketCap: "$8B+", revenue: "$35B", detail: "Compal is a major ODM expanding from notebooks into server manufacturing for cloud and AI workloads." },
  { id: "pegatron", label: "Pegatron", layer: 5, desc: "Electronics ODM with growing server and AI hardware business", ticker: "4938.TW", marketCap: "$7B+", revenue: "$40B", detail: "Pegatron is a major electronics contract manufacturer growing its AI server and infrastructure business." },
  { id: "atos", label: "Eviden\n(Atos)", layer: 5, desc: "European HPC and AI server systems — BullSequana", ticker: "ATO.PA", marketCap: "$2B+", revenue: "$11B", detail: "Eviden (Atos spin-off) builds BullSequana supercomputer and AI server systems. Major European HPC provider." },
  // More Cloud
  { id: "ovhcloud", label: "OVHcloud", layer: 6, desc: "European cloud provider with GPU offerings", ticker: "OVH.PA", marketCap: "$2B+", revenue: "$1B", detail: "OVHcloud is the largest European cloud provider, offering GPU instances and AI infrastructure with data sovereignty guarantees." },
  { id: "gpu_cloud_ibm", label: "IBM Cloud\n/ watsonx", layer: 6, desc: "Enterprise cloud with watsonx AI platform", ticker: "IBM", marketCap: "$200B+", revenue: "$63B", detail: "IBM provides enterprise cloud with watsonx AI platform. Generative AI backlog exceeds $12.5B. Focus on hybrid cloud and enterprise AI." },
  { id: "datacrunch", label: "DataCrunch", layer: 6, desc: "European GPU neocloud for AI workloads", ticker: null, marketCap: "Private", revenue: null, detail: "DataCrunch provides affordable GPU cloud in Europe for AI training and inference workloads." },
  // More AI Labs
  { id: "inflection", label: "Inflection AI\n(→Microsoft)", layer: 7, desc: "Built Pi chatbot — team joined Microsoft", ticker: null, marketCap: "Effectively acquired", revenue: null, detail: "Inflection AI built the Pi chatbot. Most of the team joined Microsoft to lead Microsoft AI and Copilot development." },
  { id: "adept", label: "Adept AI\n(→Amazon)", layer: 7, desc: "AI agent startup — team joined Amazon", ticker: null, marketCap: "Effectively acquired", revenue: null, detail: "Adept AI built agent technology for automating software workflows. Key team members joined Amazon to work on AI agents." },
  { id: "together_ai", label: "Together AI", layer: 7, desc: "Open-source model training and inference platform", ticker: null, marketCap: "$3B+ (private)", revenue: null, detail: "Together AI provides infrastructure for training and deploying open-source AI models. Key platform for the open-source AI ecosystem." },
  { id: "reka_ai", label: "Reka AI", layer: 7, desc: "Multimodal AI models — Reka Core", ticker: null, marketCap: "$1B+ (private)", revenue: null, detail: "Reka AI builds multimodal AI models. Founded by ex-Google DeepMind researchers. Models process text, images, and video." },
  // More Products
  { id: "glean", label: "Glean", layer: 8, desc: "Enterprise AI search and knowledge assistant", ticker: null, marketCap: "$4.6B (private)", revenue: "$100M+ ARR", detail: "Glean provides AI-powered enterprise search across all company systems — Slack, Google Drive, Jira, etc." },
  { id: "harvey_ai", label: "Harvey AI", layer: 8, desc: "AI copilot for legal professionals", ticker: null, marketCap: "$8B (private)", revenue: null, detail: "Harvey AI helps lawyers with research, drafting, and analysis. Raised $150M from a16z. Highest-valued legal AI startup." },
  { id: "openevidence", label: "OpenEvidence", layer: 8, desc: "Medical AI assistant for 700K+ physicians", ticker: null, marketCap: "$12B (private)", revenue: null, detail: "OpenEvidence is a medical AI assistant used by 700K+ physicians. Raised $250M Series D." },
  { id: "sierra_ai", label: "Sierra AI", layer: 8, desc: "Enterprise AI agents for customer experience", ticker: null, marketCap: "$4B+ (private)", revenue: null, detail: "Sierra AI builds enterprise conversational AI agents for customer service. Founded by former Salesforce CEO Bret Taylor." },
  { id: "cohere_api", label: "Cohere\nAPI", layer: 8, desc: "Enterprise AI API for RAG and search", ticker: null, marketCap: null, revenue: null, detail: "Cohere's API provides enterprise-grade AI models for RAG, search, and multilingual applications." },
];

// --- LINKS DATA ---
const LINKS_DATA = [
  // ── RAW MATERIALS → EQUIPMENT ──
  { source: "spruce_pine", target: "shin_etsu_wafer" },
  { source: "spruce_pine", target: "sumco" },
  { source: "spruce_pine", target: "siltronic" },
  { source: "neon_gas", target: "asml" },
  { source: "neon_gas", target: "trumpf" },
  { source: "neon_gas", target: "nikon_litho" },
  { source: "rare_earths", target: "zeiss" },
  { source: "rare_earths", target: "asml" },
  { source: "linde_gas", target: "tsmc" },
  { source: "linde_gas", target: "samsung_fab" },
  { source: "linde_gas", target: "intel_foundry" },
  { source: "linde_gas", target: "sk_hynix" },
  { source: "air_liquide", target: "tsmc" },
  { source: "air_liquide", target: "samsung_fab" },
  { source: "sk_materials", target: "tsmc" },
  { source: "sk_materials", target: "sk_hynix" },
  { source: "sk_materials", target: "samsung_fab" },

  // ── RAW MATERIALS → FABS ──
  { source: "shin_etsu_wafer", target: "tsmc" },
  { source: "shin_etsu_wafer", target: "samsung_fab" },
  { source: "shin_etsu_wafer", target: "intel_foundry" },
  { source: "shin_etsu_wafer", target: "sk_hynix" },
  { source: "shin_etsu_wafer", target: "micron" },
  { source: "shin_etsu_wafer", target: "globalfoundries" },
  { source: "sumco", target: "tsmc" },
  { source: "sumco", target: "samsung_fab" },
  { source: "sumco", target: "sk_hynix" },
  { source: "siltronic", target: "intel_foundry" },
  { source: "siltronic", target: "globalfoundries" },
  { source: "photoresists", target: "tsmc" },
  { source: "photoresists", target: "samsung_fab" },
  { source: "photoresists", target: "intel_foundry" },
  { source: "tok", target: "tsmc" },
  { source: "tok", target: "samsung_fab" },
  { source: "fujifilm_semi", target: "tsmc" },
  { source: "fujifilm_semi", target: "samsung_fab" },
  { source: "dupont_semi", target: "tsmc" },
  { source: "dupont_semi", target: "samsung_fab" },
  { source: "dupont_semi", target: "intel_foundry" },
  { source: "entegris", target: "tsmc" },
  { source: "entegris", target: "samsung_fab" },
  { source: "entegris", target: "intel_foundry" },
  { source: "entegris", target: "sk_hynix" },
  { source: "entegris", target: "micron" },
  { source: "sumitomo_chem", target: "tsmc" },
  { source: "sumitomo_chem", target: "samsung_fab" },

  // ── EQUIPMENT INTERNAL ──
  { source: "zeiss", target: "asml" },
  { source: "trumpf", target: "asml" },

  // ── EQUIPMENT → FABS ──
  { source: "asml", target: "tsmc" },
  { source: "asml", target: "samsung_fab" },
  { source: "asml", target: "intel_foundry" },
  { source: "asml", target: "sk_hynix" },
  { source: "asml", target: "micron" },
  { source: "applied_materials", target: "tsmc" },
  { source: "applied_materials", target: "samsung_fab" },
  { source: "applied_materials", target: "intel_foundry" },
  { source: "applied_materials", target: "sk_hynix" },
  { source: "applied_materials", target: "micron" },
  { source: "applied_materials", target: "smic" },
  { source: "lam_research", target: "tsmc" },
  { source: "lam_research", target: "samsung_fab" },
  { source: "lam_research", target: "sk_hynix" },
  { source: "lam_research", target: "micron" },
  { source: "lam_research", target: "intel_foundry" },
  { source: "tokyo_electron", target: "tsmc" },
  { source: "tokyo_electron", target: "samsung_fab" },
  { source: "tokyo_electron", target: "intel_foundry" },
  { source: "tokyo_electron", target: "sk_hynix" },
  { source: "tokyo_electron", target: "smic" },
  { source: "kla", target: "tsmc" },
  { source: "kla", target: "samsung_fab" },
  { source: "kla", target: "intel_foundry" },
  { source: "kla", target: "sk_hynix" },
  { source: "screen_holdings", target: "tsmc" },
  { source: "screen_holdings", target: "samsung_fab" },
  { source: "asm_intl", target: "tsmc" },
  { source: "asm_intl", target: "samsung_fab" },
  { source: "asm_intl", target: "intel_foundry" },
  { source: "kokusai", target: "tsmc" },
  { source: "kokusai", target: "samsung_fab" },
  { source: "kokusai", target: "sk_hynix" },
  { source: "advantest", target: "tsmc" },
  { source: "advantest", target: "samsung_fab" },
  { source: "advantest", target: "sk_hynix" },
  { source: "advantest", target: "nvidia" },
  { source: "teradyne", target: "tsmc" },
  { source: "teradyne", target: "intel_foundry" },
  { source: "disco", target: "tsmc" },
  { source: "disco", target: "samsung_fab" },
  { source: "disco", target: "ase_group" },
  { source: "nikon_litho", target: "tsmc" },
  { source: "nikon_litho", target: "smic" },
  { source: "canon_litho", target: "smic" },
  { source: "lasertec", target: "tsmc" },
  { source: "lasertec", target: "samsung_fab" },
  { source: "lasertec", target: "intel_foundry" },
  { source: "onto_innovation", target: "tsmc" },
  { source: "onto_innovation", target: "ase_group" },
  { source: "nova_measuring", target: "tsmc" },
  { source: "nova_measuring", target: "samsung_fab" },
  { source: "veeco", target: "tsmc" },
  { source: "veeco", target: "samsung_fab" },
  { source: "ulvac", target: "tsmc" },
  { source: "ulvac", target: "samsung_fab" },

  // ── EDA & IP → CHIP DESIGNERS ──
  { source: "synopsys", target: "nvidia" },
  { source: "synopsys", target: "amd" },
  { source: "synopsys", target: "broadcom" },
  { source: "synopsys", target: "marvell" },
  { source: "synopsys", target: "qualcomm" },
  { source: "synopsys", target: "apple_silicon" },
  { source: "cadence", target: "nvidia" },
  { source: "cadence", target: "amd" },
  { source: "cadence", target: "broadcom" },
  { source: "cadence", target: "marvell" },
  { source: "cadence", target: "qualcomm" },
  { source: "cadence", target: "apple_silicon" },
  { source: "arm", target: "nvidia" },
  { source: "arm", target: "qualcomm" },
  { source: "arm", target: "broadcom" },
  { source: "arm", target: "marvell" },
  { source: "arm", target: "apple_silicon" },
  { source: "arm", target: "google_tpu" },
  { source: "arm", target: "aws_trainium" },
  { source: "arm", target: "ms_maia" },
  { source: "arm", target: "cerebras" },
  { source: "arm", target: "tenstorrent" },

  // ── FABS → CHIP DESIGN (manufacturing) ──
  { source: "tsmc", target: "nvidia" },
  { source: "tsmc", target: "amd" },
  { source: "tsmc", target: "broadcom" },
  { source: "tsmc", target: "marvell" },
  { source: "tsmc", target: "qualcomm" },
  { source: "tsmc", target: "apple_silicon" },
  { source: "tsmc", target: "google_tpu" },
  { source: "tsmc", target: "aws_trainium" },
  { source: "tsmc", target: "ms_maia" },
  { source: "tsmc", target: "cerebras" },
  { source: "tsmc", target: "groq" },
  { source: "tsmc", target: "d_matrix" },
  { source: "tsmc", target: "sambanova" },
  { source: "tsmc", target: "cowos" },
  { source: "samsung_fab", target: "nvidia" },
  { source: "samsung_fab", target: "qualcomm" },
  { source: "intel_foundry", target: "intel_gpu" },
  { source: "globalfoundries", target: "amd" },

  // ── MEMORY → CHIPS ──
  { source: "sk_hynix", target: "nvidia" },
  { source: "sk_hynix", target: "amd" },
  { source: "micron", target: "nvidia" },
  { source: "micron", target: "amd" },
  { source: "samsung_memory", target: "nvidia" },
  { source: "samsung_memory", target: "amd" },
  { source: "cowos", target: "nvidia" },
  { source: "cowos", target: "amd" },
  { source: "cowos", target: "broadcom" },

  // ── PACKAGING ──
  { source: "ase_group", target: "nvidia" },
  { source: "ase_group", target: "amd" },
  { source: "ase_group", target: "qualcomm" },
  { source: "amkor", target: "qualcomm" },
  { source: "amkor", target: "apple_silicon" },

  // ── CHIP DESIGN → NETWORKING ──
  { source: "nvidia", target: "nvidia_networking" },
  { source: "nvidia", target: "nvlink" },
  { source: "broadcom", target: "broadcom_nw" },
  { source: "broadcom_nw", target: "arista" },
  { source: "broadcom_nw", target: "cisco_dc" },
  { source: "broadcom_nw", target: "celestica" },
  { source: "marvell", target: "inphi_marvell" },

  // ── CHIP DESIGN → SYSTEMS ──
  { source: "nvidia", target: "smci" },
  { source: "nvidia", target: "dell_servers" },
  { source: "nvidia", target: "hpe_servers" },
  { source: "nvidia", target: "foxconn" },
  { source: "nvidia", target: "quanta" },
  { source: "nvidia", target: "wistron" },
  { source: "nvidia", target: "inventec" },
  { source: "nvidia", target: "lenovo_dcg" },
  { source: "amd", target: "smci" },
  { source: "amd", target: "dell_servers" },
  { source: "amd", target: "hpe_servers" },
  { source: "intel_gpu", target: "dell_servers" },
  { source: "intel_gpu", target: "smci" },

  // ── NETWORKING → SYSTEMS ──
  { source: "nvidia_networking", target: "smci" },
  { source: "nvidia_networking", target: "foxconn" },
  { source: "arista", target: "microsoft_azure" },
  { source: "arista", target: "meta_infra" },
  { source: "arista", target: "google_cloud" },
  { source: "cisco_dc", target: "microsoft_azure" },
  { source: "cisco_dc", target: "aws" },
  { source: "juniper_hpe", target: "aws" },
  { source: "celestica", target: "google_cloud" },
  { source: "celestica", target: "microsoft_azure" },
  { source: "coherent", target: "microsoft_azure" },
  { source: "coherent", target: "google_cloud" },
  { source: "coherent", target: "aws" },
  { source: "lumentum", target: "microsoft_azure" },
  { source: "lumentum", target: "aws" },
  { source: "inphi_marvell", target: "aws" },
  { source: "inphi_marvell", target: "google_cloud" },

  // ── SYSTEMS → CLOUD ──
  { source: "smci", target: "microsoft_azure" },
  { source: "smci", target: "coreweave" },
  { source: "smci", target: "oracle_cloud" },
  { source: "smci", target: "lambda_cloud" },
  { source: "dell_servers", target: "microsoft_azure" },
  { source: "dell_servers", target: "oracle_cloud" },
  { source: "hpe_servers", target: "microsoft_azure" },
  { source: "hpe_servers", target: "aws" },
  { source: "foxconn", target: "microsoft_azure" },
  { source: "foxconn", target: "aws" },
  { source: "foxconn", target: "oracle_cloud" },
  { source: "quanta", target: "google_cloud" },
  { source: "quanta", target: "microsoft_azure" },
  { source: "wistron", target: "microsoft_azure" },
  { source: "wistron", target: "meta_infra" },
  { source: "inventec", target: "aws" },
  { source: "vertiv", target: "microsoft_azure" },
  { source: "vertiv", target: "aws" },
  { source: "vertiv", target: "google_cloud" },
  { source: "vertiv", target: "coreweave" },
  { source: "schneider", target: "microsoft_azure" },
  { source: "schneider", target: "aws" },
  { source: "schneider", target: "equinix" },
  { source: "eaton", target: "equinix" },
  { source: "eaton", target: "digital_realty" },
  { source: "nvent", target: "coreweave" },
  { source: "nvent", target: "microsoft_azure" },
  { source: "equinix", target: "coreweave" },
  { source: "equinix", target: "lambda_cloud" },
  { source: "digital_realty", target: "oracle_cloud" },
  { source: "digital_realty", target: "coreweave" },

  // ── CHIP DESIGN DIRECT → CLOUD (custom silicon) ──
  { source: "google_tpu", target: "google_cloud" },
  { source: "aws_trainium", target: "aws" },
  { source: "ms_maia", target: "microsoft_azure" },
  { source: "nvidia", target: "microsoft_azure" },
  { source: "nvidia", target: "google_cloud" },
  { source: "nvidia", target: "aws" },
  { source: "nvidia", target: "meta_infra" },
  { source: "nvidia", target: "coreweave" },
  { source: "nvidia", target: "oracle_cloud" },
  { source: "nvidia", target: "lambda_cloud" },
  { source: "nvidia", target: "crusoe" },
  { source: "nvidia", target: "nebius" },
  { source: "amd", target: "microsoft_azure" },
  { source: "amd", target: "meta_infra" },
  { source: "amd", target: "oracle_cloud" },
  { source: "groq", target: "groq" }, // self-hosted
  { source: "cerebras", target: "cerebras" }, // self-hosted

  // ── CLOUD → AI LABS ──
  { source: "microsoft_azure", target: "openai" },
  { source: "aws", target: "anthropic" },
  { source: "google_cloud", target: "google_deepmind" },
  { source: "meta_infra", target: "meta_ai" },
  { source: "coreweave", target: "openai" },
  { source: "coreweave", target: "mistral" },
  { source: "oracle_cloud", target: "openai" },
  { source: "oracle_cloud", target: "xai" },
  { source: "aws", target: "cohere" },
  { source: "aws", target: "ai21" },
  { source: "aws", target: "stability" },
  { source: "google_cloud", target: "eleven_labs" },
  { source: "google_cloud", target: "runway_ml" },
  { source: "google_cloud", target: "mistral" },
  { source: "lambda_cloud", target: "stability" },
  { source: "nebius", target: "mistral" },
  { source: "nebius", target: "deepseek" },

  // ── AI LABS → PRODUCTS ──
  { source: "openai", target: "chatgpt" },
  { source: "openai", target: "openai_api" },
  { source: "openai", target: "github_copilot" },
  { source: "openai", target: "copilot_ms" },
  { source: "anthropic", target: "claude_ai" },
  { source: "anthropic", target: "anthropic_api" },
  { source: "anthropic", target: "claude_code" },
  { source: "anthropic", target: "github_copilot" },
  { source: "anthropic", target: "cursor" },
  { source: "anthropic_api", target: "aws_bedrock" },
  { source: "google_deepmind", target: "gemini_app" },
  { source: "meta_ai", target: "meta_ai_app" },
  { source: "meta_ai", target: "hugging_face" },
  { source: "xai", target: "grok_app" },
  { source: "openai", target: "cursor" },
  { source: "openai", target: "perplexity" },
  { source: "anthropic", target: "perplexity" },
  { source: "stability", target: "midjourney" },
  { source: "apple_silicon", target: "siri_apple" },
  { source: "openai", target: "siri_apple" },
  { source: "eleven_labs", target: "eleven_labs" },
  { source: "runway_ml", target: "runway_ml" },
  { source: "deepseek", target: "hugging_face" },
  { source: "mistral", target: "hugging_face" },
  { source: "cohere", target: "aws_bedrock" },
  { source: "mistral", target: "aws_bedrock" },
  // ── ADDITIONAL LINKS FOR NEW NODES ──
  { source: "basf_semi", target: "tsmc" },
  { source: "basf_semi", target: "samsung_fab" },
  { source: "honeywell_semi", target: "tsmc" },
  { source: "honeywell_semi", target: "intel_foundry" },
  { source: "merck_semi", target: "tsmc" },
  { source: "merck_semi", target: "samsung_fab" },
  { source: "naura", target: "smic" },
  { source: "amec", target: "smic" },
  { source: "cohu", target: "ase_group" },
  { source: "cohu", target: "amkor" },
  { source: "tsmc", target: "mediatek" },
  { source: "arm", target: "mediatek" },
  { source: "arm", target: "ampere" },
  { source: "arm", target: "aws_graviton" },
  { source: "arm", target: "nvidia_grace" },
  { source: "tsmc", target: "ampere" },
  { source: "tsmc", target: "aws_graviton" },
  { source: "tsmc", target: "nvidia_grace" },
  { source: "nvidia_grace", target: "smci" },
  { source: "nvidia_grace", target: "dell_servers" },
  { source: "ampere", target: "oracle_cloud" },
  { source: "aws_graviton", target: "aws" },
  { source: "xilinx_amd", target: "microsoft_azure" },
  { source: "xilinx_amd", target: "aws" },
  { source: "ciena", target: "microsoft_azure" },
  { source: "ciena", target: "aws" },
  { source: "ciena", target: "google_cloud" },
  { source: "ge_vernova", target: "equinix" },
  { source: "ge_vernova", target: "digital_realty" },
  { source: "ge_vernova", target: "vantage_dc" },
  { source: "coolit", target: "smci" },
  { source: "coolit", target: "coreweave" },
  { source: "vantage_dc", target: "microsoft_azure" },
  { source: "vantage_dc", target: "coreweave" },
  { source: "scaleway", target: "mistral" },
  { source: "deepseek", target: "hf_inference" },
  { source: "anthropic", target: "replit" },
  { source: "openai", target: "replit" },
  { source: "openai", target: "notion_ai" },
  { source: "anthropic", target: "notion_ai" },
  { source: "google_deepmind", target: "character_ai" },
  { source: "openai", target: "vercel_ai" },
  { source: "anthropic", target: "vercel_ai" },
  { source: "openai", target: "poe" },
  { source: "anthropic", target: "poe" },
  { source: "google_deepmind", target: "poe" },
  { source: "meta_ai", target: "poe" },
  { source: "hugging_face", target: "hf_inference" },
  { source: "baidu_ai", target: "baidu_ai" },
  { source: "tower_semi", target: "intel_foundry" },
  { source: "nanya_tech", target: "micron" },
  // ── LINKS FOR BATCH 3 NODES ──
  { source: "wacker_chem", target: "shin_etsu_wafer" },
  { source: "wacker_chem", target: "siltronic" },
  { source: "resonac", target: "tsmc" },
  { source: "resonac", target: "samsung_fab" },
  { source: "sk_siltron", target: "tsmc" },
  { source: "sk_siltron", target: "sk_hynix" },
  { source: "hitachi_ht", target: "tsmc" },
  { source: "hitachi_ht", target: "samsung_fab" },
  { source: "aixtron", target: "tsmc" },
  { source: "asml", target: "smic" },
  { source: "tsmc", target: "intel_xeon" },
  { source: "tsmc", target: "amd_epyc" },
  { source: "intel_foundry", target: "intel_xeon" },
  { source: "tsmc", target: "lattice" },
  { source: "arm", target: "sifive" },
  { source: "tsmc", target: "hailo" },
  { source: "intel_xeon", target: "smci" },
  { source: "intel_xeon", target: "dell_servers" },
  { source: "intel_xeon", target: "hpe_servers" },
  { source: "amd_epyc", target: "smci" },
  { source: "amd_epyc", target: "dell_servers" },
  { source: "amd_epyc", target: "hpe_servers" },
  { source: "extreme_nw", target: "aws" },
  { source: "nokia_dc", target: "aws" },
  { source: "nokia_dc", target: "google_cloud" },
  { source: "compal", target: "aws" },
  { source: "pegatron", target: "microsoft_azure" },
  { source: "atos", target: "scaleway" },
  { source: "ovhcloud", target: "mistral" },
  { source: "gpu_cloud_ibm", target: "openai" },
  { source: "together_ai", target: "hugging_face" },
  { source: "together_ai", target: "hf_inference" },
  { source: "inflection", target: "copilot_ms" },
  { source: "adept", target: "aws" },
  { source: "openai", target: "glean" },
  { source: "anthropic", target: "glean" },
  { source: "openai", target: "harvey_ai" },
  { source: "openai", target: "openevidence" },
  { source: "anthropic", target: "sierra_ai" },
  { source: "cohere", target: "cohere_api" },
  { source: "reka_ai", target: "hf_inference" },
  { source: "hua_hong", target: "naura" },
  { source: "vanguard_intl", target: "tsmc" },
];

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
  return (
    <div style={{
      position: "absolute", top: 64, left: 16, background: "rgba(255,255,255,0.96)",
      borderRadius: 12, padding: "12px 14px", zIndex: 20,
      border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      backdropFilter: "blur(12px)", minWidth: 200,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: "#9ca3af", marginBottom: 8, fontFamily: "var(--mono)", textTransform: "uppercase" }}>
        Supply Chain Layers
      </div>
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
      <p style={{ fontSize: 11, color: "#6b7280", margin: "0 0 10px", lineHeight: 1.4, fontFamily: "var(--sans)" }}>{node.desc}</p>
      {(node.marketCap || node.revenue) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 10 }}>
          {node.marketCap && <div>
            <div style={{ fontSize: 8, color: "#9ca3af", fontFamily: "var(--mono)", textTransform: "uppercase", letterSpacing: 1 }}>Mkt Cap</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 600, fontFamily: "var(--sans)" }}>{node.marketCap}</div>
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
function StatsBar() {
  return (
    <div style={{
      position: "absolute", bottom: 16, right: 16, background: "rgba(255,255,255,0.95)",
      borderRadius: 10, padding: "8px 14px", zIndex: 15, border: "1px solid #e5e7eb",
      display: "flex", gap: 16, alignItems: "center", fontFamily: "var(--mono)",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    }}>
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{NODES_DATA.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Nodes</span></div>
      <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{LINKS_DATA.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Links</span></div>
      <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
      <div><span style={{ fontSize: 15, color: "#111827", fontWeight: 700, fontFamily: "var(--sans)" }}>{LAYERS.length}</span><span style={{ fontSize: 8, color: "#9ca3af", marginLeft: 3, textTransform: "uppercase", letterSpacing: 1 }}>Layers</span></div>
    </div>
  );
}

// === MAIN APP ===
export default function AIStack() {
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
    // upstream
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
    // downstream
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

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodes = NODES_DATA.map(d => ({ ...d }));
    const links = LINKS_DATA.map(d => ({ ...d }));
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

    // Defs
    const defs = svg.append("defs");
    defs.append("marker").attr("id", "arr").attr("viewBox", "0 -4 8 8")
      .attr("refX", 18).attr("refY", 0).attr("markerWidth", 5).attr("markerHeight", 5)
      .attr("orient", "auto").append("path").attr("d", "M0,-3L7,0L0,3").attr("fill", "#d1d5db");
    // Subtle shadow filter
    const filt = defs.append("filter").attr("id", "ns").attr("x", "-20%").attr("y", "-20%").attr("width", "140%").attr("height", "140%");
    filt.append("feDropShadow").attr("dx", 0).attr("dy", 1).attr("stdDeviation", 2).attr("flood-color", "#000").attr("flood-opacity", 0.06);

    // Links
    const link = g.append("g").selectAll("line").data(links).enter().append("line")
      .attr("stroke", "#e5e7eb").attr("stroke-width", 0.8).attr("marker-end", "url(#arr)");

    // Nodes
    const node = g.append("g").selectAll("g").data(nodes).enter().append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );

    node.append("circle")
      .attr("r", d => getRadius(d))
      .attr("fill", d => `${getColor(d.layer)}12`)
      .attr("stroke", d => getColor(d.layer))
      .attr("stroke-width", 1.5)
      .attr("filter", "url(#ns)");

    node.each(function(d) {
      const lines = d.label.split("\n");
      const el = d3.select(this);
      lines.forEach((line, i) => {
        el.append("text").text(line)
          .attr("text-anchor", "middle")
          .attr("dy", lines.length === 1 ? "0.35em" : `${(i - (lines.length - 1) / 2) * 1.1 + 0.35}em`)
          .attr("fill", "#374151").attr("font-size", d.label.length > 14 ? "7px" : "8px")
          .attr("font-family", "'IBM Plex Mono', monospace").attr("font-weight", "500")
          .attr("pointer-events", "none");
      });
    });

    node.on("click", (e, d) => { e.stopPropagation(); setSelectedNode(d); });
    node.on("dblclick", (e, d) => { e.stopPropagation(); tracePath(d.id); });
    svg.on("click", () => { setSelectedNode(null); setPathNodes(null); });

    const sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(80).strength(0.25))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(d => (d.layer / (layerCount - 1)) * (width - 250) + 125).strength(0.5))
      .force("y", d3.forceY(height / 2).strength(0.04))
      .force("collision", d3.forceCollide().radius(d => getRadius(d) + 5))
      .on("tick", () => {
        link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    simRef.current = { sim, node, link, nodes, links, svg, g, zoom };
    setTimeout(() => {
      svg.transition().duration(800).call(zoom.transform, d3.zoomIdentity.translate(width * 0.02, height * 0.08).scale(0.7));
    }, 600);
    return () => sim.stop();
  }, [dims, tracePath]);

  // Update visual states
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
        background: "linear-gradient(180deg, rgba(250,251,252,0.98) 0%, rgba(250,251,252,0) 100%)",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: "linear-gradient(135deg, #DC2626, #7C3AED, #2563EB, #059669, #65A30D)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "#fff",
          }}>⬡</div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#111827", letterSpacing: -0.5 }}>AI Stack</span>
          <span style={{ fontSize: 9, color: "#9ca3af", fontFamily: "var(--mono)", marginLeft: 4 }}>
            The Open Supply Chain Graph of AI
          </span>
        </div>
      </div>

      {/* Hint */}
      <div style={{
        position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)",
        zIndex: 15, fontSize: 9, color: "#d1d5db", fontFamily: "var(--mono)", pointerEvents: "none",
      }}>
        Click a node to inspect · Double-click to trace path · Scroll to zoom · Drag to pan
      </div>

      {/* Subtle grid background */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "radial-gradient(#e5e7eb 0.5px, transparent 0.5px)",
        backgroundSize: "24px 24px", opacity: 0.5,
      }} />

      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ display: "block", position: "relative", zIndex: 1 }} />

      <LayerLegend layers={LAYERS} activeLayer={activeLayer}
        onLayerClick={id => { setActiveLayer(prev => prev === id ? null : id); setPathNodes(null); }}
        pathActive={!!pathNodes} />
      <SearchBar nodes={NODES_DATA} onSelect={navigateToNode} onTrace={traceFullPath} />
      {!selectedNode && <StatsBar />}
      <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} onNavigate={navigateToNode} />
    </div>
  );
}
