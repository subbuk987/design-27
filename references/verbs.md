# Design 27 — Steerable Studio Verbs

Load this module when the user steers an existing artifact with a targeted command (`polish`, `bolder`, `quieter`, `distill`, `clarify`, `harden`, `redesign`, `critique`) instead of asking for a greenfield build.

**Preservation Law:** Every verb except `redesign` preserves the incumbent brand palette, typography, product wiring, and factual content outside the requested scope.

---

| Verb | Intent & Scope | Concrete Moves | Hard Guardrail |
| :--- | :--- | :--- | :--- |
| **`polish`** | Final pre-ship craft pass on a mostly solid design. | Align spacing to `4px`/`8px` rhythm, fix nested radii (`max(outer - padding, 4px)`), balance heading orphans, tighten `tabular-nums`, run `scripts/d27-check.mjs` and `qa-and-critique.md`. | Never swap the brand palette, typeface, or section order. |
| **`bolder`** | Amplify safe, timid, or lifeless work (Persuade / Experience / Posters). | Increase display-to-body scale ratio (`>= 3×`), commit to one full-bleed visual anchor or high-contrast inverted band, sharpen focal accent contrast, add one deliberate asymmetric split or grid-break. | Never break Tier 1 contrast floors (`>= 4.5:1`) or add decorative blobs/glows. |
| **`quieter`** | Tone down noisy, over-styled, or fatiguing work (Operate / Read). | Strip unnecessary borders/shadows/pills/badges, replace rainbow accents with 1 focal signal + neutral ramp, calm surface tints, kill gratuitous looping animations. | Preserve clear hierarchy and interactive affordances (`:focus-visible`, active states). |
| **`distill`** | Cut visual and cognitive clutter to the core thesis. | Merge redundant sections, cut hero copy to headline + 1 sentence + 1 primary CTA, collapse repetitive 3-col cards into an open hairline strip or table, remove filler visuals. | Never delete real product functionality, links, or user-supplied proof. |
| **`clarify`** | Exorcise AI hype copy and vague UI labels. | Replace buzzwords (`supercharge`, `seamless`, `unlock`, `magic`), strip exclamation marks (`!`, `!!`) and `"Welcome back! 👋"` greetings, add explicit comparison context (`+12% vs last month`), unify numeric precision. | Never invent metrics, customer counts, testimonials, or unverified claims. |
| **`harden`** | Make UI production-ready across edge cases. | Add `:focus-visible`, `prefers-reduced-motion`, empty/loading/error states, `overflow-x: clip`, `minmax(0, 1fr)`, `min-width: 0; overflow-wrap: break-word`, `>= 44×44px` mobile tap targets, and RTL/long-string resilience. | Verify zero layout shift and zero horizontal scroll at `390px`, `1280px`, and `1920px`. |
| **`redesign`** | Replace a heavily slopped visual world while keeping product truth. | Inventory all existing routes, links, handlers, and real facts first; run Stages 1–4 fresh with a new Surface World and Direction; verify zero lost content or wiring. | Never silently drop real features or fabricate replacement proof. |
| **`critique`** | Audit-only review with zero unsolicited edits. | Run `scripts/d27-check.mjs` (if available) + `references/qa-and-critique.md` Passes 1–7, rank findings by Tier (*Floor / Reflex / Finish*) with exact `file:line` citations, and output the Art Director Sign-Off. | Report honestly; if there is no slop, say so and suggest at most 2–3 surgical refinements. |
