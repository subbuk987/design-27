# Book Writing, Anti-AI Prose Craft & Multi-Format Editorial Typesetting (`v4.0.0`)

Load this module alongside `SKILL.md` whenever writing or editing nonfiction books, technical monographs, long-form essays, engineering manuals, or typesetting web-books, CSS Paged Media PDFs, and Typst print masters.

> **Emotion levers ([`emotion-science.md`](emotion-science.md) §0; study codes in [`emotion-evidence.md`](emotion-evidence.md)):** Lock the Emotional Target first. Predictable structure lets readers anticipate (S1); scene openers drive transportation (S2); typesetting moves mood, not speed (T1, T4).

---

## 1. Pre-Draft Manuscript Architecture (Decisions Before Drafting)

Never draft chapters cold. Unplanned manuscripts drift into bloated summaries, meandering voice shifts, and throat-clearing filler. Lock two compact planning artifacts before writing sentence one.

### A. The Book Charter (One Page, Locked Before Chapter 1)
Every book or long-form monograph requires four explicit commitments:

1. **Core Thesis:** One falsifiable claim the entire book exists to prove. *(Bad: "A guide to distributed databases." Good: "Most consensus bugs come from unmodeled clocks, queues, and operator retries.")*
2. **Target Reader & Transformation:** Who picks this up on page 1, what false assumption they hold, and what concrete mental model or decision rule they carry out on the final page.
3. **Voice Register (Pick Exactly One):**
   - **Clinical Systems Engineer** — Measurements, causal chains, failure boundaries, terse active verbs, zero hype.
   - **Investigative Narrative** — Chronological scenes, named people and places, archival artifacts, tension held before resolution.
   - **Opinionated Practitioner** — Hard-won field rules, sharp trade-offs, direct accountability, zero polite hedging.
   - **Scholarly Monograph** — Primary-source citations, explicit counter-arguments, scope limits, layered marginalia.
4. **Evidence Standard:** Declare what counts as proof in this manuscript (reproducible benchmarks, postmortem logs, primary historical records, worked proofs, or explicitly labeled field heuristics). Never cite phantom authority (*"studies show"*, *"researchers agree"*).

### B. Chapter Beat Cards (5-Beat Structural Skeleton)
Draft every chapter from a 5-beat card so prose moves forward with mechanical tension:

| Beat | Job in the Chapter | Hard Constraint |
| :--- | :--- | :--- |
| **1. Cold-Open Artifact / Incident** | Drop the reader into a timestamped outage, lab measurement, historical exhibit, or physical scene. | Zero dictionary definitions, zero *"Since the dawn of..."* scope-ups, zero *"In this chapter we will..."*. |
| **2. Conventional Wisdom Failure** | State the textbook rule practitioners follow—and show the exact boundary condition where it snaps. | Name the real cost of following the naive rule. |
| **3. Mechanism / Proof / Diagram** | Explain *why* it snaps using causal mechanics, numbers, equations, code, or a schematic figure. | Pair abstract claims with concrete nouns, units, and reproducible steps. |
| **4. Counter-Case & Boundary** | Show where the chapter's own thesis stops holding or requires an uncomfortable trade-off. | Earns reader trust by refusing one-size-fits-all dogma. |
| **5. Sharp Implication** | Close on the concrete decision, diagnostic check, or mental shift that follows immediately. | Never end with a cozy recap paragraph (*"In summary, we have seen..."*). |

### C. Story Craft (Narrative, Memoir, Investigative Registers & Launch Copy)
- **Scene vs. Summary:** Scenes (one place, one time, one person acting) carry emotion; summary carries time. Open and close chapters in scene; summarize only the stretches between.
- **Point of View & Distance:** Pick first/third person and a narrator distance (close = thoughts, far = camera) per chapter, and never drift mid-scene.
- **Character = Desire + Obstacle:** Every person on the page wants something concrete and meets a specific obstacle. No obstacle, no scene.
- **Escalating Stakes:** Each beat raises what is lost if it fails (time → money → people → trust). Flat stakes read as a report.
- **Dialogue:** Dialogue moves the scene or reveals the character, never delivers exposition. Use "said" and cut adverbs.
- **Endings:** End chapters on an open loop (a question the next chapter answers) or a turned expectation, never on a recap. Plan the whole-book arc as the reader's change from page 1 to the last page (Charter item 2).
- **Truth:** Use real people, dates and documents only (Tier 1 Zero Fabrication). Invented anecdotes break trust and the verisimilitude that drives transportation (`emotion-evidence.md` S2).

---

## 2. Chapter Dramaturgy & Sentence Burstiness

AI-generated prose fails primarily through **metronomic uniformity**: every sentence runs `16–20` words, every paragraph holds `3` neat sentences, and every turn arrives announced by a polite transition word. Human editorial prose breathes through contrast.

### Sentence-Length Burstiness Law
Vary sentence length **by meaning, not by pattern**: short declarative sentences (`5–9` words) for verdicts, analytical clauses (`22–35` words) for evidence and causal chains. Never emit four consecutive medium-length (`14–20` word) sentences, and never a run of fragments (`low-sentence-burstiness` also flags `> 40%` of sentences at `<= 4` words — strict alternation is a pattern too).

- **Short Strike (`5–9` words):** Lands a claim or verdict. *"The clock drifted four seconds."*
- **Long Analytical Clause (`22–35` words):** Unpacks the causal chain or exact measurement without splitting every clause into choppy fragments.
- **Paragraph Rhythm Variety:** Contrast **single-sentence pivot paragraphs** (sparingly, at genuine turns) against **4–6 sentence evidentiary blocks**. Never repeat identical 3-sentence blocks down an entire section.

### Concrete Anchoring Rule
Replace vague abstractions with **observable objects, numbers, dates, and verbs**:
- Weak: *"Teams often experience significant latency degradation during high-traffic events due to suboptimal resource allocation."*
- Strong: *"At 14:02 UTC, checkout p99 latency jumped from 42ms to 4.8s because three payment workers shared one unindexed connection pool."*

---

## 3. Hard Anti-AI-Prose Purge (`d27-check --medium=book`)

Automated editorial checks (`node scripts/d27-check.mjs --medium=book`) flag vocabulary and structural tics that immediately expose unedited machine prose. Scrub every draft through this filter before typesetting.

### A. Banned AI Vocabulary (`no-ai-slop-vocabulary`)
Never emit these words in manuscript prose. Under `--medium=book` they `FLOOR`-fail at `>= 2` hits **and** `>= 3` hits per 1,000 words; inside quotation marks they only warn (verbatim quotes and dialogue are allowed):
- `delve` / `delves` / `delving`
- `tapestry`
- `testament`
- `landscape` *(warn only; metaphorical use, e.g., "the evolving security landscape". `landscape mode` is exempt)*
- `pivotal`
- `underscore` / `underscores` / `underscoring` *(warn only; `leading underscore` and similar literal uses are exempt)*
- `realm`
- `beacon` *(warn only)*
- `vibrant`
- `intricate`
- `multifaceted`
- `overarching`
- `foster` *(warn only)*
- `garner`

Also cut editorial filler verbs (`showcase`, `leverage`, `embark`, `spearhead`; literal `leverage ratio` / `breaker bar` uses are exempt) in favor of plain physical verbs (`show`, `use`, `start`, `lead`). Generic phrasing warns too: `plays a vital role`, `stands as a`, `navigate the complexities`, `holistic`, `harness the power`, `elevate`, `empower`, `seamless`.

### B. Banned Structural Tells
1. **Negative Parallelisms (`no-negative-parallelism-tic`):** Ban *"It's not just X — it's Y"*, *"Not merely X, but Y"*, and *"X isn't about A. It's about B."* State what X actually is directly.
2. **Throat-Clearing Openers (`no-throat-clearing-opener`):** Ban paragraphs starting with `Moreover,`, `Furthermore,`, `Additionally,`, `In conclusion,`, `It is worth noting`, `Crucially,`, or `Interestingly,`. If a fact matters, state it without announcing that it is worth noting.
3. **Compulsive Rule-of-Three Lists (`no-triad-overload`, `> 3` per 1k words):** Stop padding every claim with three parallel adjectives (*"fast, reliable, and scalable"*). Pick the single decisive trait or name a concrete metric.
4. **Self-Answering Rhetorical Questions (`no-self-answered-question`):** Cut *"The result? Happier users."* and *"So why does this fail? Because..."*—state the cause cleanly. Openers such as `Ultimately,`, `At its core,`, `Here's the thing`, `Let's dive in` and `In this chapter, we will` are flagged as throat-clearing.
5. **Em-Dash Rationing:** Cap em-dashes (`—`) at **`<= 2` per paragraph**. Use commas, colons, parentheses, or full stops for varied punctuation cadence.

### C. Slop vs. Humanized Rewrites

**Example 1 — Chapter Opener (Systems Engineering)**
- **Slop:** *"In today's rapidly evolving cloud landscape, database migrations have become a pivotal challenge. It's not just about moving bytes — it's about preserving trust. Moreover, understanding lock queues is crucial for building resilient, scalable, and reliable systems."*
- **Humanized:** *"A single `ALTER TABLE` locked our order table for eleven minutes on a Tuesday morning. Nothing crashed. Every checkout request simply queued behind one unguarded metadata lock until the gateway timed out at 30 seconds."*

**Example 2 — Mechanism Explanation (Investigative / Technical)**
- **Slop:** *"Furthermore, it is worth noting that the intricate interplay between battery chemistry and cold weather underscores a multifaceted engineering constraint. Why does range drop in January? Because lithium ions move slower through cold electrolyte."*
- **Humanized:** *"Below 0°C, electrolyte viscosity climbs sharply and slows lithium-ion diffusion into the graphite anode. A cell that accepts 150kW at 22°C may throttle to 38kW at -10°C. The battery is not damaged; the charger throttles to stop metallic lithium from plating onto the electrode surface."*

**Example 3 — Practitioner Trade-Off**
- **Slop:** *"Code review is a vibrant tapestry of collaboration and rigor, serving as a beacon of quality across modern engineering realms."*
- **Humanized:** *"Slow code review trains engineers to hide risky changes inside tiny refactors. Keep pull requests under 250 lines or drop async review for pairing on architectural changes."*

### D. Three-Pass Revision Protocol
1. **Pass 1 — Developmental (Beat Card Audit):** Cut whole sections that drift off the Book Charter's thesis; confirm every chapter opens on an artifact/scene and holds a real counter-case.
2. **Pass 2 — Line & Burstiness Edit:** Read paragraphs aloud; break uniform `16–20` word cadence with short strikes; replace passive hedging with concrete verbs and measurements.
3. **Pass 3 — Copy & `d27-check` Audit:** Run `node scripts/d27-check.mjs manuscript.md --medium=book --strict`, purge flagged vocabulary/tics, verify citations and figure numbers, and lock typography rules.

---

## 4. Three-Format Book Typesetting & Production Patterns

Never ship a book in one sloppy template. Match the typesetting engine to the output medium while enforcing **Zero Double-Signaled Paragraphs** (`no-double-signaled-paragraphs`): choose **EITHER** first-line indent (`text-indent: 1.4em; margin: 0;`) **XOR** block paragraph gap (`text-indent: 0; margin: 0 0 0.75em 0;`)—**never both together**.

---

### Format A — Interactive Digital Web-Book (`HTML`)

Use a three-track desktop reading grid (`60–66ch` main prose + wide margin track for Tufte `<aside class="sidenote">` marginalia) that collapses cleanly inline on mobile, paired with a sticky chapter TOC rail, scroll progress indicator, Paper/Sepia/Night polarity switcher, `tabular-nums` tables, and baked-in `@media print` pagination.

```html
<!doctype html>
<html lang="en" data-theme="paper">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Chapter 01 — The Metadata Lock</title>
  <style>
    :root, [data-theme="paper"] {
      --canvas: #faf8f3; --elevated: #f1ede4; --ink: #1b1917;
      --ink-muted: #57534e; --accent: #9a3412; --rule: #ded8cc;
    }
    [data-theme="sepia"] {
      --canvas: #f2e8d5; --elevated: #e8dcc4; --ink: #2a2118;
      --ink-muted: #5e4f3e; --accent: #7c2d12; --rule: #d4c4a8;
    }
    [data-theme="night"] {
      --canvas: #141619; --elevated: #1c2026; --ink: #e8e6e1;
      --ink-muted: #a1a1aa; --accent: #f59e0b; --rule: #2b303a;
    }
    * { box-sizing: border-box; }
    html, body { overflow-x: clip; }
    body {
      margin: 0; background: var(--canvas); color: var(--ink);
      font: 400 1.0625rem/1.68 "Source Serif 4", Georgia, serif;
      -webkit-font-smoothing: antialiased;
    }
    .read-progress {
      position: fixed; top: 0; left: 0; height: 3px; width: 0%;
      background: var(--accent); z-index: 40;
    }
    .book-shell {
      max-width: 1280px; margin: 0 auto; padding: 3rem 1.5rem 6rem;
      display: grid; grid-template-columns: 14rem minmax(0, 64ch) minmax(14rem, 19rem);
      gap: 2.5rem; align-items: start;
    }
    .toc-rail {
      position: sticky; top: 2.5rem; font: 500 0.84rem/1.5 "IBM Plex Sans", system-ui, sans-serif;
      color: var(--ink-muted); border-top: 1px solid var(--rule); padding-top: 1rem;
    }
    .toc-rail a { display: block; color: inherit; text-decoration: none; padding: 0.25rem 0; }
    .toc-rail a:hover { color: var(--accent); }
    .theme-switch { display: flex; gap: 0.35rem; margin-bottom: 1rem; }
    .theme-switch button {
      background: var(--elevated); color: var(--ink); border: 1px solid var(--rule);
      padding: 0.25rem 0.55rem; font: 500 0.75rem/1.2 inherit; cursor: pointer;
    }
    :focus-visible { outline: 2px solid var(--accent, #8C2D19); outline-offset: 2px; }
    .prose { grid-column: 2; max-width: 64ch; position: relative; }
    .prose h1 {
      font: 700 clamp(2rem, 3.6vw, 2.8rem)/1.08 "Source Serif 4", Georgia, serif;
      letter-spacing: -0.02em; margin: 0 0 1.5rem;
    }
    .prose h2 {
      font: 600 1.35rem/1.25 "IBM Plex Sans", system-ui, sans-serif;
      margin: 2.5rem 0 0.75rem;
    }
    /* Classic indent-only book rhythm: zero paragraph bottom margin (no double-signaling) */
    .prose p { margin: 0; text-indent: 1.4em; hyphens: auto; }
    .prose h1 + p, .prose h2 + p, .prose figure + p { text-indent: 0; }
    .sidenote {
      float: right; clear: right; width: 17.5rem; margin-right: -20rem;
      font: 400 0.85rem/1.5 "IBM Plex Sans", system-ui, sans-serif;
      color: var(--ink-muted); border-left: 2px solid var(--rule); padding-left: 0.85rem;
    }
    .sn-num { font-variant-numeric: tabular-nums; color: var(--accent); font-weight: 600; }
    table {
      width: 100%; border-collapse: collapse; margin: 1.75rem 0;
      font: 400 0.9rem/1.45 "IBM Plex Sans", system-ui, sans-serif;
      font-variant-numeric: tabular-nums lining-nums;
    }
    th, td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid var(--rule); }
    th { border-bottom: 1.5px solid var(--ink); font-weight: 600; }

    @media (max-width: 1080px) {
      .book-shell { grid-template-columns: 1fr; max-width: 66ch; }
      .toc-rail { position: static; }
      .prose { grid-column: 1; }
      .sidenote {
        float: none; width: auto; margin: 0.9rem 0; padding: 0.65rem 0.9rem;
        background: var(--elevated); border-left: 2px solid var(--accent);
      }
    }
    @media print {
      .read-progress, .toc-rail { display: none; }
      body { background: #fff; color: #000; font-size: 10.5pt; line-height: 1.45; }
      .book-shell { display: block; padding: 0; }
      .sidenote { font-size: 8.5pt; width: 38%; margin-right: 0; margin-left: 1rem; }
    }
  </style>
</head>
<body>
  <div class="read-progress" id="readProgress" aria-hidden="true"></div>
  <div class="book-shell">
    <nav class="toc-rail" aria-label="Chapter contents">
      <div class="theme-switch" role="group" aria-label="Reading theme">
        <button type="button" data-set-theme="paper">Paper</button>
        <button type="button" data-set-theme="sepia">Sepia</button>
        <button type="button" data-set-theme="night">Night</button>
      </div>
      <a href="#incident">01 · The Tuesday Lock</a>
      <a href="#queue">02 · Queue Mechanics</a>
      <a href="#limits">03 · Failure Boundaries</a>
    </nav>

    <article class="prose" id="chapterBody">
      <h1 id="incident">Chapter 01: The Metadata Lock</h1>
      <p>At 14:02 UTC on a quiet Tuesday, checkout latency climbed from 42ms to 4.8s without a single CPU alarm firing.<a href="#sn-1" aria-describedby="sn-1"><sup class="sn-num">1</sup></a></p>
      <aside class="sidenote" id="sn-1" role="note" aria-label="Sidenote 1"><span class="sn-num">1.</span> Measured at the edge proxy across 18,400 requests; database host CPU remained below 19%.</aside>
      <p>Engineers checked disk throughput, network saturation, and garbage-collection pauses before noticing one waiting migration behind a seven-minute analytics query.</p>
      <h2 id="queue">Queue Mechanics</h2>
      <p>Postgres grants an <code>ACCESS EXCLUSIVE</code> lock only after every active reader finishes, yet any new reader arriving behind that migration must wait in line.</p>
      <table>
        <thead><tr><th>Lock Mode</th><th>Blocks Reads</th><th>Queued Behind</th></tr></thead>
        <tbody>
          <tr><td>SHARE UPDATE EXCLUSIVE</td><td>No</td><td>Concurrent DDL</td></tr>
          <tr><td>ACCESS EXCLUSIVE</td><td>Yes</td><td>Active Queries</td></tr>
        </tbody>
      </table>
      <h2 id="limits">Failure Boundaries</h2>
      <p>Short lock timeouts protect production traffic only when the migration runner backs off cleanly instead of retrying on a tight loop.</p>
    </article>
  </div>

  <script>
    const root = document.documentElement;
    let saved = null;
    try { saved = localStorage.getItem("d27-book-theme"); } catch { /* sandboxed iframe */ }
    if (saved) root.setAttribute("data-theme", saved);
    document.querySelectorAll("[data-set-theme]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = btn.getAttribute("data-set-theme");
        root.setAttribute("data-theme", t);
        try { localStorage.setItem("d27-book-theme", t); } catch { /* sandboxed iframe */ }
      });
    });
    const bar = document.getElementById("readProgress");
    window.addEventListener("scroll", () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      bar.style.width = `${Math.min(100, (window.scrollY / max) * 100).toFixed(2)}%`;
    }, { passive: true });
  </script>
</body>
</html>
```

---

### Format B — Commercial Print & PDF (`CSS Paged Media` `@page`)

Target WeasyPrint, Prince, or Vivliostyle using **Tschichold `2:3:4:6` facing spread proportions** (`inner : top : outer : bottom`), `recto` chapter starts, vertical chapter sinkage (`25–35%`), suppressed headers/folios on blank versos and chapter openers, and strict widow/orphan protection:

```css
/* Trade 6in x 9in (152.4mm x 228.6mm) | Binding-aware inner gutter: 15mm (<=120pp saddle-stitch), 20mm (121-250pp perfect-bound default), 22mm (251-400pp), 25mm (>400pp) */
@page {
  size: 152.4mm 228.6mm;
  margin-top: 22.5mm;
  margin-bottom: 45mm;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 8.5pt;
  color: #57534e;
}
@page :left {
  margin-left: 28mm;   /* outer */
  margin-right: 20mm;  /* inner binding gutter (perfect-bound default) */
  @top-left { content: counter(page); font-variant-numeric: tabular-nums lining-nums; }
  @top-right { content: string(book-title); letter-spacing: 0.08em; text-transform: uppercase; font-size: 7.5pt; }
}
@page :right {
  margin-left: 20mm;   /* inner binding gutter (perfect-bound default) */
  margin-right: 28mm;  /* outer */
  @top-left { content: string(chapter-title); font-style: italic; }
  @top-right { content: counter(page); font-variant-numeric: tabular-nums lining-nums; }
}
@page chapter-opener {
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: counter(page); font-variant-numeric: tabular-nums lining-nums; }
}
@page :blank {
  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-center { content: none; }
}

section.chapter {
  break-before: right; /* Recto chapter starts */
  page: chapter-opener;
}
section.chapter > h1 {
  string-set: chapter-title content();
  margin-top: 28%; /* 25-35% vertical chapter sinkage */
  margin-bottom: 2.2rem;
  break-after: avoid;
}
h2, h3 { break-after: avoid; }
p {
  margin: 0;
  text-indent: 1.4em; /* Never combine with positive margin-bottom */
  widows: 3;
  orphans: 3;
  hyphens: auto;
  hyphenate-limit-chars: 6 3 3;
}
h1 + p, h2 + p, h3 + p, blockquote + p, figure + p { text-indent: 0; }
```

---

### Format C — `Typst` Book Master (`main.typ`)

Use this complete, runnable Typst facing-spread master with Tschichold `2:3:4:6` margins, `odd` (recto) chapter starts, suppressed headers on blank versos and chapter openers, sticky headings, lining tabular folios, and zero double-signaled paragraphs (`spacing == leading`):

```typst
// Book Master — US Trade (6in x 9in) Facing Spreads
#let book-title = "SYSTEMS UNDER LOAD"
#let chapter-state = state("chapter-title", "")

#set document(title: book-title)
#set page(
  paper: "us-trade",
  binding: left,
  margin: (inside: 20mm, top: 22.5mm, outside: 28mm, bottom: 45mm),
  header: context {
    let pg = counter(page).get().first()
    let on-opener = query(heading.where(level: 1)).any(h => h.location().page() == pg)
    if not on-opener {
      set text(font: "IBM Plex Sans", size: 8pt, fill: luma(95), number-type: "lining", features: ("tnum",))
      if calc.even(pg) {
        [#pg #h(1fr) #upper(book-title)]
      } else {
        [#emph(chapter-state.get()) #h(1fr) #pg]
      }
    }
  },
  footer: context {
    let pg = counter(page).get().first()
    let on-opener = query(heading.where(level: 1)).any(h => h.location().page() == pg)
    if on-opener {
      set align(center)
      set text(font: "IBM Plex Sans", size: 8.5pt, number-type: "lining", features: ("tnum",))
      [#pg]
    }
  },
)

#set text(
  font: "Source Serif 4",
  size: 10.5pt,
  lang: "en",
  hyphenate: true,
  number-type: "old-style",
)

// Zero double-signaled paragraphs: spacing equals leading when first-line-indent is active
#set par(
  justify: true,
  leading: 0.68em,
  spacing: 0.68em,
  first-line-indent: (amount: 1.4em, all: false),
)

#show heading: set block(sticky: true)
#show heading.where(level: 1): it => {
  pagebreak(to: "odd", weak: true)
  chapter-state.update(it.body)
  v(28%) // 25-35% vertical chapter sinkage
  set text(font: "Source Serif 4", size: 22pt, weight: "bold")
  block(below: 2.2em, it.body)
}
#show heading.where(level: 2): it => {
  set text(font: "IBM Plex Sans", size: 12pt, weight: "semibold")
  block(above: 1.8em, below: 0.7em, it.body)
}

// Tabular lining numerals in tables and code metrics
#show table: set text(font: "IBM Plex Sans", size: 9pt, number-type: "lining", features: ("tnum",))

= Chapter 1: The Metadata Lock

At 14:02 UTC on a quiet Tuesday, checkout latency climbed from 42ms to 4.8s without a single CPU alarm firing. Engineers inspected disk queues, network links, and memory pressure before finding one schema migration parked behind a seven-minute reporting query.

== Queue Mechanics

Postgres grants an `ACCESS EXCLUSIVE` lock only after active readers finish, yet every new reader arriving behind the queued migration blocks behind it.
```

---

## 5. Empirical Typography & Anti-AI Prose Research

- **Screen Comprehension vs. Skimming:** Wider lines (`~100 cpl`) maximize raw skimming speed, but **`55 cpl`** outperforms `100 cpl` on comprehension; scale `line-height` upward with measure (`1.35` at `55ch` → `1.45` at `72ch`) ([Dyson, 2004](https://stu.westga.edu/~ssynan1/literacy/Dyson.pdf); [Butterick's Practical Typography](https://practicaltypography.com/summary-of-key-rules.html)).
- **Hyphenation-Gated Justification:** Greedy browser line-breaking creates rivers in 69% of paragraphs compared to optimal-fit TeX/Typst breaking ([Knuth & Plass, 1981](https://gwern.net/doc/design/typography/tex/1981-knuth.pdf)); ban `text-align: justify` on web books unless `hyphens: auto` is active, and use progressive `2:3:4:6` margins on print spreads ([Van de Graaf Canon](https://en.wikipedia.org/wiki/Canons_of_page_construction)).
- **Empirical Excess-Vocabulary & Burstiness Metrics:** A 15.1M-abstract analysis isolated 379 excess LLM style markers (*delves* `r = 28.0`, *underscores* `r = 13.8`, *showcasing* `r = 10.7`; [Kobak et al., 2025, *Science Advances*](https://arxiv.org/html/2406.07016v5)), while sentence-length variance (`CV = σ / μ`) and short/long tail presence (`<= 10w` / `>= 35w`) strongly separate human from AI prose ([Desaire et al., 2023, *Cell Reports Physical Science*](https://pmc.ncbi.nlm.nih.gov/articles/PMC10328544/)). Enforced via `low-sentence-burstiness` in `scripts/lib/prose-audit.mjs`.

---

## Final Medium Gate (Stage 4, with `qa-and-critique.md`)

Book Charter + Chapter Beat Cards locked; every chapter opens with a concrete scene/artifact/measurement; **zero AI prose slop** (*delve, tapestry, testament, pivotal, underscore*, negative parallelisms, throat-clearing openers, `<= 2` em-dashes/para) + strong sentence burstiness; web-books include accessible Tufte sidenotes (`aria-describedby` + `role="note"`) + TOC rail + `@media print`; print/Typst obeys binding-aware inner gutter (`15mm` `<= 120pp` saddle-stitch, `18–22mm` perfect-bound `121–400pp`, `25mm` `> 400pp`), suppressed running headers on openers/versos, and **zero double-signaled paragraphs** (`text-indent` XOR `margin-bottom`).
