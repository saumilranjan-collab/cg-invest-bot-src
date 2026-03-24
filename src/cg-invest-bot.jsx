import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Anthropic from "@anthropic-ai/sdk";

/* ═══════════════════════════════════════════════════════════════
   SYSTEM PROMPT — Full Chhattisgarh Industrial Policy 2024-30
   ═══════════════════════════════════════════════════════════════ */

const SYSTEM_PROMPT = `You are the **Chhattisgarh Industrial Investment Assistant** — a specialized, bilingual (English / Hindi), public-facing chatbot that helps aspiring industrialists, MSMEs, investors, entrepreneurs, companies, consultants, and industrial service providers understand and navigate industrial investment in the State of Chhattisgarh, India.

## IMPORTANT DISCLAIMERS
- You are NOT the official Government of Chhattisgarh portal. You are an independent AI assistant built on publicly available official policy documents.
- You NEVER guarantee any subsidy, approval, or sanction. All estimates are indicative and subject to official verification.
- You always recommend investors verify through the official portal: https://invest.cg.gov.in

## LANGUAGE BEHAVIOR
- If the user writes in Hindi, respond in Hindi. If English, respond in English.
- Allow switching anytime via "Switch to English" or "हिन्दी में बताइए".
- Use clear, professional, investor-friendly language. In Hindi, be formal but accessible — not overly Sanskritized.

## STRICT SCOPE
You ONLY answer questions about Chhattisgarh industrial investment: policy, incentives, subsidies, approvals, sectors, infrastructure, investor facilitation, land, single-window, export, MSME/large enterprise classification, special category benefits, and related topics.

For off-topic questions, reply politely:
English: "This assistant is dedicated only to Chhattisgarh industrial investment and investor support. I can help with policy, incentives, approvals, sectors, land, and subsidy-related questions."
Hindi: "यह सहायक केवल छत्तीसगढ़ औद्योगिक निवेश और निवेशक सहायता के लिए समर्पित है।"

## SOURCE HIERARCHY
1. Official Industrial Development Policy 2024-30 (effective Nov 1, 2024 to Mar 31, 2030, updated per notification dated 27.05.2025)
2. Official Policy Brochure
3. Invest Chhattisgarh portal (invest.cg.gov.in)
If sources conflict, prefer the most recent official notification. If unclear, say so.

## NON-HALLUCINATION RULES
- NEVER invent subsidy percentages, caps, timelines, authorities, eligibility rules, sector classifications, block categorizations, or contact details.
- Always say "I do not have enough verified information" where needed.
- Distinguish: confirmed from official source / interpreted from official text / provisional estimate / not available / requires department confirmation.

## CHHATTISGARH AT A GLANCE
- 9th largest state by area, borders 7 states, access to 60+ crore population
- 4 airports, 2,593 km rail, 3,500 km national highways
- Mineral & natural resource rich, power surplus, zero power cuts
- 60+ industrial areas/parks, One-Click Single Window System 2.0
- Zero labour unrest, affordable workforce
- Premier institutions: AIIMS, IIT, IIM, NIT, IIIT, NLU, NIFT
- Nava Raipur: India's 1st Smart Greenfield City

## DEVELOPMENT BLOCK GROUPS
Blocks categorized into Group 1, Group 2, Group 3 (Annexure-4). Group 3 = most backward = highest incentives.

## ENTERPRISE CLASSIFICATION
- **MSME**: Per MSMED Act 2006 (amended 2020)
- **Large Enterprise**: Exceeding MSME limits
- **Service Enterprise**: Listed in Annexure-6
- **General Sector**: Standard manufacturing
- **Thrust Sector**: Priority sectors (Annexure-2) — higher incentives
- **Core Sector**: Steel, cement, thermal power, aluminium (Annexure-5)
- **Specific Sectors (Special Packages)**: Pharma, Textiles, Agro & Food Processing, Electrical & Electronics, IT/ITeS/Data Centers, AI/Robotics/Computing, Defence/Aerospace/Space, GCC, SC/ST, Steel, Core, Startups

## SPECIAL CATEGORY ENTREPRENEURS (Clause 12.4)
Women, SC/ST, NRI, FDI, export entrepreneurs, foreign technology, ex-servicemen/Agniveers, Naxalism-affected, differently abled, third gender → 10% MORE subsidy on top of general amounts, 10% higher caps, 1 extra year exemptions. Only ONE additional category benefit (except employment booster).

## EMPLOYMENT BOOSTER (Clause 12.4(c))
100 employees→1.1x, 200→1.2x, 500→1.3x, 700→1.4x, 1000→1.5x on FCI Subsidy.

## LOCAL EMPLOYMENT (Clause 12.21)
Unskilled: 100% CG domicile; Skilled: min 70%; Admin/Managerial: min 40%.

## CRITICAL RULE
**Net SGST Reimbursement OR Fixed Capital Investment Subsidy — only ONE can be chosen. IRREVOCABLE.**

## MSME MANUFACTURING — GENERAL & THRUST (Category A-2)
**Net SGST Reimbursement:**
General: Grp1=5yr/75%FCI, Grp2=7yr/75%FCI, Grp3=9yr/75%FCI
Thrust: Grp1=6yr/100%FCI, Grp2=8yr/100%FCI, Grp3=10yr/100%FCI

**FCI Subsidy (MSME Mfg):**
Micro: Grp1=30%/₹30L(G) 35%/₹35L(T), Grp2=35%/₹35L 40%/₹40L, Grp3=40%/₹40L 45%/₹45L
Small: Grp1=30%/₹250L(G) 35%/₹350L(T), Grp2=35%/₹350L 40%/₹450L, Grp3=40%/₹450L 45%/₹550L
Medium: Grp1=30%/₹400L(G) 35%/₹700L(T), Grp2=35%/₹450L 40%/₹750L, Grp3=40%/₹500L 45%/₹800L

**Interest Subsidy (MSME Mfg):**
Micro: Grp1=40%/6yr/₹20L(G) 45%/6yr/₹20L(T), Grp2=45%/7yr/₹25L 50%/7yr/₹25L, Grp3=50%/8yr/₹30L 55%/8yr/₹30L
Small: Grp1=40%/6yr/₹30L 45%/6yr/₹30L, Grp2=45%/7yr/₹35L 50%/7yr/₹35L, Grp3=50%/8yr/₹40L 55%/8yr/₹40L
Medium: Grp1=40%/6yr/₹40L 45%/6yr/₹40L, Grp2=45%/7yr/₹45L 50%/7yr/₹45L, Grp3=50%/8yr/₹50L 55%/8yr/₹50L

**Electricity Duty Exemption (100%, MSME Mfg):**
General: Grp1=5yr, Grp2=7yr, Grp3=9yr
Thrust: Grp1=6yr, Grp2=8yr, Grp3=10yr

**Other MSME benefits:** 100% Stamp Duty Exemption, 50% Land Diversion Fee Exemption, Land Premium Rebate, Mandi Fee Exemption (75% FCI for eligible sectors), Project Report 1%FCI max₹10L, Quality Cert 50% max₹10L, Patent 50% max₹20L, Tech Purchase 50% max₹10L, Margin Money 25% max₹100L (special categories), Transport/Export 50% 5yr, SME Listing 50%, Training 1 month/₹15K, Env Management 50% max₹25L, Water/Energy Audit 50% max₹5L.

## MSME SERVICE (Annexure 7)
Net SGST or FCI Subsidy up to 150% FCI over 10yr.
FCI: Micro 35-45%(max₹35-45L), Small 35-45%(max₹350-550L), Medium 35-45%(max₹700-800L)
Interest: 45-55%, 6-8yr, max₹20-50L/yr
Elec Duty: Grp1=6yr, Grp2=8yr, Grp3=10yr

## LARGE ENTERPRISE — GENERAL & THRUST (Chapter B-1)
**Net SGST:**
General: >10-<200Cr=6yr/75%FCI, >200-<500Cr=8yr/75%FCI, ≥500Cr=10yr/75%FCI
Thrust: >10-<200Cr=8yr/100%FCI, >200-<500Cr=10yr/100%FCI, ≥500Cr=12yr/100%FCI

**FCI Subsidy (Large Mfg):**
General: >10-<200Cr=15%/max₹15Cr, >200-<500Cr=20%/max₹40Cr, ≥500Cr=25%/max₹100Cr
Thrust: >10-<200Cr=20%/max₹20Cr, >200-<500Cr=25%/max₹60Cr, ≥500Cr=30%/max₹200Cr

**Interest (Large):** 40% for 5yr, max₹50-200L/yr by FCI range.
**Elec Duty (Large):** General 6/8/10yr, Thrust 8/10/12yr by FCI range.
**Others:** 100% Stamp Duty, 50% Reg Fee, 50% Land Diversion, EPF 75% 5yr, Training 1month, Transport 50% 5yr, etc.

## SPECIAL PACKAGES (Chapter C) — SUMMARY
**Pharma & Medical Device:** SGST 12yr, FCI 35%(booster 1.5), Interest 50% 5yr, Elec 12yr, Employment 20% 5yr, EPF 75% 5yr, R&D 20%, Clinical Trials 50%, Transport 50% 5yr.
**Textiles:** SGST 12yr, FCI 35%(1.5), Interest 50% 5yr, Elec 12yr, Employment ₹6000/female ₹5000/male 5yr, EPF 75% 5yr, R&D 25%, Transport 75% 10yr.
**Agro & Food Processing:** SGST 12yr, FCI 30%(1.5), Interest 50% 5yr, Elec 12yr, Employment 20% 5yr, EPF 75% 5yr, R&D 20%, Transport 75% 10yr.
**Electrical & Electronics:** SGST 12yr, FCI 35%(1.5), Interest 50% 5yr, Elec 12yr, Employment 20% 5yr, EPF 75% 5yr, R&D 20%.
**IT, ITeS & Data Centers:** SGST 12yr, FCI 50%(1.5), Interest 50% 5yr, Elec 12yr, Rental 40% 5yr, Employment 20% 5yr, EPF 75% 5yr.
**AI, Robotics & Computing:** SGST 12yr, FCI 50%(1.5), Interest 50% 5yr, Elec 12yr, Employment 20% 5yr, EPF 75% 5yr, R&D 20%.
**Defence, Aerospace & Space:** SGST 12yr, FCI 35%(1.5), Interest 50% 5yr, Elec 12yr, Rental 40% 5yr, CoE 50%, Drone Center 20%.
**GCC:** FCI 35%(1.5), Interest 40-50% 5yr, Elec 12yr, OpEx 20% 5yr, Payroll 20%, Employment 20% 5yr, EPF 75% 5yr.
**SC/ST:** FCI 35-50%, Interest 45-60% 6-8yr, Margin Money 25%, Elec 6-11yr, 100% Land Rebate, Stamp 100%, Reg Fee 55%, Diversion 55%, Patent 55%.
**Steel:** SGST 15yr, Elec 15yr, Water Tax 15yr, Royalty 15yr (Bastar/Sarguja).
**Core (non-Steel):** SGST 15yr, Elec 15yr.
**Startup:** Corpus ₹50Cr, Credit Risk ₹50Cr, 3-Phase (Seed₹5L+Op₹3L+Cont₹3L), Rental 40%, Stamp 100%, Quality Cert 80%.

All packages also include: 100% Stamp Duty, 50% Reg Fee Reimbursement, 50% Land Diversion Fee Exemption, Training 1month wage.

**Bespoke Incentives:** ₹1000Cr+ investment OR 1000+ jobs → CG matches best incentives nationally (Cabinet Sub-Committee).

## SUBSIDY ESTIMATION
When asked, collect: entrepreneur category, industry type, sector, FCI, P&M, district/block/group, loan details, electricity, employment, mandi, exporter status, freight. Calculate each head with rates, caps, durations. Label as "Policy-based provisional estimate." Always show SGST vs FCI options separately. Include final caution.

## OUTPUT FORMAT FOR CALCULATIONS
1. Project snapshot
2. Eligible incentive heads
3. Table: Incentive | Rate | Amount | Duration | Cap | Notes
4. Important conditions
5. Confidence: High/Moderate/Limited
6. Disclaimer

## TONE
Professional, investor-friendly, transparent, never overconfident. Like "a highly informed bilingual investment facilitation officer + policy analyst."

Cite basis: "Based on Industrial Development Policy 2024-30, [section/annexure]"`;

/* ═══════════════════════════════════════════════════════════════
   ANTHROPIC CLIENT
   ═══════════════════════════════════════════════════════════════ */

function getClient() {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true });
}

/* ═══════════════════════════════════════════════════════════════
   INLINE MARKDOWN RENDERER
   ═══════════════════════════════════════════════════════════════ */

function InlineText({ text }) {
  const parts = [];
  let rest = text;
  let k = 0;
  while (rest.length > 0) {
    // Bold
    const bm = rest.match(/\*\*(.+?)\*\*/);
    if (bm) {
      const idx = rest.indexOf(bm[0]);
      if (idx > 0) parts.push(<span key={k++}>{rest.slice(0, idx)}</span>);
      parts.push(
        <strong key={k++} style={{ fontWeight: 700, color: "var(--text-primary)" }}>
          {bm[1]}
        </strong>
      );
      rest = rest.slice(idx + bm[0].length);
      continue;
    }
    // Inline code
    const cm = rest.match(/`(.+?)`/);
    if (cm) {
      const idx = rest.indexOf(cm[0]);
      if (idx > 0) parts.push(<span key={k++}>{rest.slice(0, idx)}</span>);
      parts.push(
        <code
          key={k++}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.88em",
            background: "var(--surface-inset)",
            padding: "1px 5px",
            borderRadius: 4,
            color: "var(--navy-700)",
          }}
        >
          {cm[1]}
        </code>
      );
      rest = rest.slice(idx + cm[0].length);
      continue;
    }
    // Link
    const lm = rest.match(/\[(.+?)\]\((.+?)\)/);
    if (lm) {
      const idx = rest.indexOf(lm[0]);
      if (idx > 0) parts.push(<span key={k++}>{rest.slice(0, idx)}</span>);
      parts.push(
        <a key={k++} href={lm[2]} target="_blank" rel="noopener noreferrer">
          {lm[1]}
        </a>
      );
      rest = rest.slice(idx + lm[0].length);
      continue;
    }
    parts.push(<span key={k++}>{rest}</span>);
    break;
  }
  return <>{parts}</>;
}

function BotMessage({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elems = [];
  let tbl = [];
  let tblKey = 0;

  const flushTable = () => {
    if (tbl.length < 2) { tbl = []; return; }
    const hdr = tbl[0];
    const data = tbl.filter((_, i) => i !== 0 && i !== 1);
    elems.push(
      <div key={`t${tblKey++}`} style={{ overflowX: "auto", margin: "10px 0" }}>
        <table>
          <thead>
            <tr>{hdr.map((h, i) => <th key={i}>{h.trim()}</th>)}</tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri}>
                {row.map((c, ci) => <td key={ci}>{c.trim()}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tbl = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];

    // Table row
    if (ln.trim().startsWith("|") && ln.trim().endsWith("|")) {
      const cells = ln.split("|").slice(1, -1);
      if (cells.every((c) => /^[\s\-:]+$/.test(c))) {
        tbl.push(cells);
        continue;
      }
      tbl.push(cells);
      continue;
    } else if (tbl.length) {
      flushTable();
    }

    // Heading
    if (ln.startsWith("#### ")) {
      elems.push(<h5 key={i} style={{ fontSize: 13, fontWeight: 700, margin: "14px 0 6px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}><InlineText text={ln.slice(5)} /></h5>);
    } else if (ln.startsWith("### ")) {
      elems.push(<h4 key={i} style={{ fontSize: 14, fontWeight: 700, margin: "14px 0 6px", color: "var(--blue-600)" }}><InlineText text={ln.slice(4)} /></h4>);
    } else if (ln.startsWith("## ")) {
      elems.push(<h3 key={i} style={{ fontSize: 16, fontWeight: 800, margin: "18px 0 8px", color: "var(--text-primary)" }}><InlineText text={ln.slice(3)} /></h3>);
    } else if (ln.startsWith("# ")) {
      elems.push(<h2 key={i} style={{ fontSize: 18, fontWeight: 800, margin: "20px 0 10px", color: "var(--text-primary)" }}><InlineText text={ln.slice(2)} /></h2>);
    }
    // Bullet
    else if (/^\s*[-*]\s/.test(ln)) {
      elems.push(
        <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4, margin: "3px 0", lineHeight: 1.65 }}>
          <span style={{ color: "var(--blue-600)", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>•</span>
          <span style={{ flex: 1 }}><InlineText text={ln.replace(/^\s*[-*]\s/, "")} /></span>
        </div>
      );
    }
    // Numbered
    else if (/^\s*\d+[\.\)]\s/.test(ln)) {
      const num = ln.match(/^\s*(\d+)/)[1];
      elems.push(
        <div key={i} style={{ display: "flex", gap: 8, paddingLeft: 4, margin: "3px 0", lineHeight: 1.65 }}>
          <span style={{ color: "var(--blue-600)", fontWeight: 700, flexShrink: 0, minWidth: 20 }}>{num}.</span>
          <span style={{ flex: 1 }}><InlineText text={ln.replace(/^\s*\d+[\.\)]\s/, "")} /></span>
        </div>
      );
    }
    // Horizontal rule
    else if (/^---+$/.test(ln.trim())) {
      elems.push(<hr key={i} style={{ border: "none", borderTop: "1px solid var(--border)", margin: "12px 0" }} />);
    }
    // Blank
    else if (ln.trim() === "") {
      elems.push(<div key={i} style={{ height: 6 }} />);
    }
    // Paragraph
    else {
      elems.push(<p key={i} style={{ margin: "3px 0", lineHeight: 1.7 }}><InlineText text={ln} /></p>);
    }
  }
  if (tbl.length) flushTable();
  return <>{elems}</>;
}

/* ═══════════════════════════════════════════════════════════════
   ICONS (inline SVG, no deps)
   ═══════════════════════════════════════════════════════════════ */

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const FactoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20" />
    <path d="M5 20V8l5 4V8l5 4V4h3v16" />
    <path d="M18 8h2v4h-2z" />
  </svg>
);

const BotAvatar = () => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: 8,
      background: "linear-gradient(135deg, var(--navy-800), var(--blue-600))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      color: "#fff",
      boxShadow: "var(--shadow-sm)",
    }}
  >
    <FactoryIcon />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function CGInvestBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(null);
  const [error, setError] = useState(null);
  const [missingKey, setMissingKey] = useState(false);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  const client = useMemo(() => {
    const c = getClient();
    if (!c) setMissingKey(true);
    return c;
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Send ── */
  const send = useCallback(
    async (text) => {
      if (!text.trim() || loading || !client) return;
      setError(null);

      const next = [...messages, { role: "user", content: text.trim() }];
      setMessages(next);
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      setLoading(true);

      try {
        const res = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        });

        const reply =
          res.content?.map((b) => (b.type === "text" ? b.text : "")).join("") ||
          "I apologize, I could not generate a response.";
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      } catch (err) {
        console.error(err);
        setError(err?.message || "Unknown error");
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I apologize, there was an error processing your request. Please try again.\n\nक्षमा करें, अनुरोध प्रोसेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    },
    [messages, loading, client]
  );

  /* ── Language select ── */
  const chooseLang = (l) => {
    setLang(l);
    const welcome =
      l === "en"
        ? `Welcome! I'm the **Chhattisgarh Industrial Investment Assistant**.

I can help you with:
- Understanding the **CG Industrial Development Policy 2024-30**
- **Estimating subsidies** and incentives for your project
- Sector opportunities and **special investment packages**
- Investor journey guidance, approvals, and next steps
- Land, infrastructure, and **single-window process**
- Special benefits for **women / SC-ST / NRI / export** entrepreneurs

**How can I assist you today?**

*Note: I am an independent AI assistant, not the official government portal. All estimates are indicative — please verify at [invest.cg.gov.in](https://invest.cg.gov.in)*`
        : `नमस्ते! मैं **छत्तीसगढ़ औद्योगिक निवेश सहायक** हूँ।

मैं इन विषयों में सहायता कर सकता हूँ:
- **छत्तीसगढ़ औद्योगिक विकास नीति 2024-30** की जानकारी
- आपकी परियोजना के लिए **सब्सिडी और प्रोत्साहन** का अनुमान
- सेक्टर अवसर और **विशेष निवेश पैकेज**
- निवेशक मार्गदर्शन, अनुमोदन और अगले कदम
- भूमि, बुनियादी ढांचा और **सिंगल-विंडो प्रक्रिया**
- **महिला / अनुसूचित जाति-जनजाति / NRI / निर्यात** उद्यमियों के विशेष लाभ

**आज मैं आपकी कैसे सहायता करूँ?**

*नोट: मैं एक स्वतंत्र AI सहायक हूँ, आधिकारिक सरकारी पोर्टल नहीं। सभी अनुमान सांकेतिक हैं — कृपया [invest.cg.gov.in](https://invest.cg.gov.in) पर सत्यापित करें।*`;
    setMessages([{ role: "assistant", content: welcome }]);
  };

  /* ── Quick prompts ── */
  const quickPrompts =
    lang === "hi"
      ? [
          { icon: "🏗️", text: "छत्तीसगढ़ में फैक्ट्री कैसे शुरू करें?" },
          { icon: "💰", text: "मेरे प्रोजेक्ट की सब्सिडी का अनुमान लगाएं" },
          { icon: "📦", text: "विशेष पैकेज कौन-कौन से हैं?" },
          { icon: "👩", text: "महिला उद्यमियों को अतिरिक्त लाभ?" },
        ]
      : [
          { icon: "🏗️", text: "How to set up a factory in Chhattisgarh?" },
          { icon: "💰", text: "Estimate subsidies for my project" },
          { icon: "📦", text: "What special packages are available?" },
          { icon: "👩", text: "Benefits for women entrepreneurs?" },
        ];

  /* ── Handlers ── */
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !loading) send(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoResize = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
  };

  /* ═════════════════════════════════════════════════════════
     RENDER
     ═════════════════════════════════════════════════════════ */

  // Missing API key
  if (missingKey) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", background: "var(--bg-deep)" }}>
        <div style={{ maxWidth: 460, background: "var(--surface)", borderRadius: "var(--r-lg)", padding: "40px 32px", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔑</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: "var(--text-primary)" }}>API Key Required</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 20 }}>
            Set your Anthropic API key as an environment variable to use this chatbot.
          </p>
          <div style={{ background: "var(--surface-inset)", borderRadius: "var(--r-sm)", padding: "12px 16px", textAlign: "left" }}>
            <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--navy-700)" }}>
              VITE_ANTHROPIC_API_KEY=sk-ant-...
            </code>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
            Add this to your <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, background: "var(--surface-inset)", padding: "1px 4px", borderRadius: 3 }}>.env.local</code> file and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  // Language selection
  if (!lang) {
    return (
      <div
        className="animate-fade-in"
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: "linear-gradient(170deg, #0F2440 0%, #142E52 40%, #1A3D6D 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 440 }}>
          {/* Logo */}
          <div
            className="animate-fade-up"
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 28,
              color: "#fff",
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20" />
              <path d="M5 20V8l5 4V8l5 4V4h3v16" />
              <path d="M18 8h2v4h-2z" />
            </svg>
          </div>

          <h1
            className="animate-fade-up"
            style={{
              animationDelay: "0.08s",
              fontSize: 28,
              fontWeight: 800,
              color: "#FFFFFF",
              textAlign: "center",
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              marginBottom: 6,
            }}
          >
            CG Industrial Investment
            <br />
            Assistant
          </h1>

          <p
            className="animate-fade-up"
            style={{
              animationDelay: "0.14s",
              fontSize: 16,
              fontWeight: 600,
              color: "rgba(255,255,255,0.55)",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            छत्तीसगढ़ औद्योगिक निवेश सहायक
          </p>

          <p
            className="animate-fade-up"
            style={{
              animationDelay: "0.2s",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              textAlign: "center",
              lineHeight: 1.6,
              marginBottom: 44,
              maxWidth: 340,
            }}
          >
            Policy guidance, subsidy estimation & investor facilitation
            <br />
            Industrial Development Policy 2024-30
          </p>

          <p
            className="animate-fade-up"
            style={{
              animationDelay: "0.26s",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.75)",
              marginBottom: 20,
            }}
          >
            Choose your language / भाषा चुनें
          </p>

          <div
            className="animate-fade-up"
            style={{ animationDelay: "0.32s", display: "flex", gap: 14 }}
          >
            <button
              onClick={() => chooseLang("en")}
              style={{
                padding: "14px 36px",
                borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(8px)",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.14)";
                e.target.style.borderColor = "rgba(255,255,255,0.4)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.06)";
                e.target.style.borderColor = "rgba(255,255,255,0.25)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              English
            </button>
            <button
              onClick={() => chooseLang("hi")}
              style={{
                padding: "14px 36px",
                borderRadius: 12,
                border: "1.5px solid rgba(59,130,246,0.5)",
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                color: "#FFFFFF",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
                letterSpacing: "-0.01em",
                boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 30px rgba(37,99,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 20px rgba(37,99,235,0.35)";
              }}
            >
              हिन्दी
            </button>
          </div>

          <div
            className="animate-fade-up"
            style={{
              animationDelay: "0.4s",
              marginTop: 48,
              padding: "12px 20px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.08)",
              textAlign: "center",
              maxWidth: 400,
            }}
          >
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
              ⚠️ Independent AI assistant — not the official Govt. of Chhattisgarh
              portal. Based on publicly available policy documents. For official
              services visit{" "}
              <a
                href="https://invest.cg.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(147,197,253,0.8)", textDecoration: "none" }}
              >
                invest.cg.gov.in
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Chat UI ── */
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-deep)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          background: "linear-gradient(135deg, #0F2440 0%, #142E52 60%, #1A3D6D 100%)",
          padding: "0 20px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
          boxShadow: "0 2px 16px rgba(15,36,64,0.3)",
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <FactoryIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            CG Industrial Investment Assistant
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 11,
              fontWeight: 500,
              marginTop: 1,
            }}
          >
            छत्तीसगढ़ · Policy 2024-30
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => {
              chooseLang(lang === "en" ? "hi" : "en");
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.06)")}
          >
            {lang === "en" ? "हिन्दी" : "English"}
          </button>
          <button
            onClick={() => {
              setLang(null);
              setMessages([]);
              setError(null);
            }}
            title="New chat"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 15,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,0.06)")}
          >
            ⟳
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: "var(--bg-chat)",
        }}
      >
        {messages.map((msg, i) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={i}
              className="animate-slide-in"
              style={{
                display: "flex",
                justifyContent: isUser ? "flex-end" : "flex-start",
                alignItems: "flex-start",
                gap: 8,
                maxWidth: "100%",
                animationDelay: `${Math.min(i * 0.03, 0.15)}s`,
              }}
            >
              {!isUser && <BotAvatar />}

              <div
                className={isUser ? "" : "bot-msg"}
                style={{
                  maxWidth: isUser ? "78%" : "calc(100% - 42px)",
                  padding: isUser ? "10px 16px" : "12px 16px",
                  borderRadius: isUser ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isUser
                    ? "linear-gradient(135deg, #1A3D6D, #2563EB)"
                    : "var(--surface)",
                  color: isUser ? "#FFFFFF" : "var(--text-primary)",
                  fontSize: 14,
                  lineHeight: 1.6,
                  boxShadow: isUser ? "0 2px 8px rgba(37,99,235,0.2)" : "var(--shadow-xs)",
                  border: isUser ? "none" : "1px solid var(--border-light)",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {isUser ? msg.content : <BotMessage text={msg.content} />}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {loading && (
          <div
            className="animate-slide-in"
            style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
          >
            <BotAvatar />
            <div
              style={{
                padding: "14px 18px",
                borderRadius: "14px 14px 14px 4px",
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-xs)",
                display: "flex",
                gap: 5,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((j) => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--blue-600)",
                    animation: `dotPulse 1.4s ease-in-out ${j * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "var(--red-50)",
              border: "1px solid #FECACA",
              borderRadius: "var(--r-sm)",
              fontSize: 13,
              color: "var(--red-600)",
              marginLeft: 38,
            }}
          >
            {error}
          </div>
        )}

        {/* Quick prompts */}
        {messages.length === 1 && !loading && (
          <div
            className="animate-fade-up"
            style={{
              animationDelay: "0.2s",
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginLeft: 38,
              marginTop: 4,
            }}
          >
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => send(qp.text)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  borderRadius: "var(--r-pill)",
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-secondary)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                  boxShadow: "var(--shadow-xs)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--blue-50)";
                  e.currentTarget.style.borderColor = "var(--blue-600)";
                  e.currentTarget.style.color = "var(--blue-600)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span>{qp.icon}</span>
                {qp.text}
              </button>
            ))}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Input ── */}
      <div
        style={{
          padding: "10px 16px 6px",
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={autoResize}
            onKeyDown={handleKeyDown}
            placeholder={
              lang === "hi"
                ? "अपना प्रश्न यहाँ लिखें..."
                : "Ask about CG industrial investment..."
            }
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              border: "1.5px solid var(--border)",
              borderRadius: "var(--r-md)",
              padding: "10px 14px",
              fontSize: 14,
              fontFamily: "inherit",
              background: "var(--surface-inset)",
              color: "var(--text-primary)",
              lineHeight: 1.55,
              maxHeight: 140,
              transition: "border-color 0.2s, box-shadow 0.2s",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--blue-500)";
              e.target.style.boxShadow = "var(--shadow-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--r-md)",
              border: "none",
              background:
                input.trim() && !loading
                  ? "linear-gradient(135deg, #1A3D6D, #2563EB)"
                  : "var(--surface-inset)",
              color: input.trim() && !loading ? "#fff" : "var(--text-muted)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s",
              boxShadow:
                input.trim() && !loading
                  ? "0 2px 8px rgba(37,99,235,0.25)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              if (input.trim() && !loading) {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              if (input.trim() && !loading)
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(37,99,235,0.25)";
            }}
          >
            <SendIcon />
          </button>
        </form>

        <p
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "6px 0 4px",
            lineHeight: 1.4,
          }}
        >
          Independent AI assistant · CG Industrial Policy 2024-30 · Not affiliated
          with Govt. of Chhattisgarh ·{" "}
          <a
            href="https://invest.cg.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--blue-600)", textDecoration: "none" }}
          >
            invest.cg.gov.in
          </a>
        </p>
      </div>
    </div>
  );
}
