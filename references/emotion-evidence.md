# Emotion Evidence — Graded Studies Behind Each Lever

Open this file only when you must justify or tune an emotional lever. The always-loaded summary is [`emotion-science.md`](emotion-science.md). Grades: **A** = meta-analysis, very large cross-cultural sample, or independent replication; **B** = solid peer-reviewed studies, limited replication; **C** = mixed, contested or failed replication (craft intuition only, never claim it). Lab averages never override `DESIGN.md` or real user research.

---

## 1. Colour

- **C1 · Arousal follows chroma and lightness more than hue (B: one well-controlled study, N = 62, full-field light).** In a factorial study of hue × saturation × brightness, saturated and bright colours raised arousal. Saturated colours also raised valence. Hue had smaller effects that interacted with the other two ([Wilms & Oberfeld 2018](https://pubmed.ncbi.nlm.nih.gov/28612080/), N = 62, with skin conductance and heart rate). **Rule:** set arousal with chroma (relative to the hue's sRGB maximum) and `L` first. Choose hue second, for meaning (C3).
- **C2 · Colour-emotion links are mostly shared across cultures (A).** 4,598 people in 30 nations matched 20 emotions to 12 colour terms. Their patterns had an average similarity of `r = .88`. Nation still added signal, and nations that share borders or languages were more alike ([Jonauskaite et al. 2020](https://biopen.bi.no/bi-xmlui/bitstream/11250/2761614/1/Jonauskaite_etal_2020_PsychScience.pdf)). **Rule:** use common associations for global products. For a localized product, check the local meaning of the accent hue before you lock it.
- **C3 · People like a colour when they like the objects it evokes (B).** The Ecological Valence Theory predicted colour preference from liking ratings for colour-associated objects. It fit better than cone-contrast and colour-appearance models ([Palmer & Schloss 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342)). **Rule:** tie the accent to a *liked object in the brief's domain*. This is the Diegetic Metaphor law in colour form: brass on an instrument, phosphor on a scope, enamel on a sign. Avoid hues whose domain associations are unpleasant (for example, murky dark yellow-olives that read as decay).
- **C4 · Arousal budget = the 60/30/10 law.** High-chroma area is the arousal dose. On `calm` / `focused` targets, keep high-chroma pixels on the single focal signal (`<= 10%` of the viewport). On `energetic`, raise the dose on the focal plate only. Keep body text surfaces near-achromatic (`websites.md` §2 Achromatic Ink Lock).
- **C5 · Myth (C): "Red lowers performance / red drives urgency."** A meta-analysis of 67 effects found no evidential value for red on intellectual performance after bias correction ([Gnambs 2020](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7704521/)). **Rule:** never justify red with "science". Justify it with domain meaning (C3) or with an A/B test.

---

## 2. Typography

- **T1 · Good typesetting improves mood, not reading speed (B).** Readers of well-typeset text did better on mood-sensitive creative tasks and on subjective duration than readers of poorly set text ([Larson & Picard 2005](https://www.media.mit.edu/publications/the-aesthetics-of-reading-2)). The 2007 follow-up adds that speed and comprehension tests often miss these effects. Creative-task performance and frown-muscle (corrugator) activity detect them ([Larson, Hazlett, Chaparro & Picard 2007](https://www.microsoft.com/en-us/research/?p=754147)). **Rule:** do not accept "it reads fast enough" as typographic QA. Fix leading, measure, kerning, and rag, because readers *feel* them.
- **T2 · Congruent typeface personality speeds emotional processing (B).** Readers were faster on an emotion lexical-decision task when the typeface personality matched the word's meaning ([Hazlett, Larson, Shaikh & Chaparro 2013](https://microsoft.com/en-us/research/uploads/prod/2021/06/Hazlett-Larson-Shaikh-Chaparo-2013-two-studies-on-how-a-typeface-congruent-with-content-can-enhance-onscreen-communication.pdf)). **Rule:** pick the display face for the Emotional Target, and pick the body face for fluency (T5).
- **T3 · Curves feel safer than points (A for shapes, B for type).** People prefer curved objects over sharp-angled ones ([Bar & Neta 2006](https://pubmed.ncbi.nlm.nih.gov/16913943/)). Sharp everyday objects drew more amygdala activity than their curved versions in the 2007 follow-up. Later work finds the preference in newborns, and questions whether "threat" fully explains it. Across countries, people rated round typefaces sweeter, and angular typefaces more bitter, salty and sour ([Velasco et al. 2018](https://biopen.bi.no/bi-xmlui/bitstream/handle/11250/2499581/The%20tase%20of%20typefaces%202018.pdf?sequence=4)). **Rule:**

  | Target | Display terminals & counters | Corner radii |
  | :--- | :--- | :--- |
  | `calm`, `inviting` | Rounded or humanist (open counters, soft terminals) | `8–24px` (nested-radius law still applies) |
  | `focused` | Neutral grotesk or mono | `2–8px` |
  | `energetic` | High-contrast or condensed display; curves allowed | Mixed |
  | `urgent` | Angular, condensed, sharp terminals | `0–2px` |

- **T4 · Line length: speed and preference disagree (B).** Long lines (about 100 cpl) were read faster on screen than very short lines (25 cpl), with equal comprehension. But readers *rated* moderate lines (about 55 cpl) easiest ([Dyson & Kipping 1998](https://journals.uc.edu/index.php/vl/article/view/5671)). **Rule:** *Read* surfaces target comfort: `55–70ch` (the existing `64ch` target). *Operate* scan surfaces (logs, tables) may run longer, because there task speed wins.
- **T5 · Fluency feels good (A).** Easy processing is experienced as positive. Figure-ground contrast, symmetry, repetition, and prototypicality raise fluency and beauty judgments ([Reber, Schwarz & Winkielman 2004](https://pages.ucsd.edu/~pwinkielman/reber-schwarz-winkielman-beauty-PSPR-2004.pdf)). Effortful but *resolved* disfluency can produce interest ([Graf & Landwehr 2017](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5519602/)). **Rule:** make body text, labels, and controls maximally fluent. Spend disfluency (odd scale, tight tracking, expressive display) only on one focal moment, and make sure it resolves.

---

## 3. Story & Writing

- **S1 · Listeners' brains couple to the storyteller's brain (B: single fMRI study, extended by the same lab).** The speaker's brain activity predicted the listeners' activity, and the coupling vanished when communication failed. Some listener regions *anticipated* the speaker, and anticipation tracked comprehension ([Stephens, Silbert & Hasson 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2922522)). **Rule:** let the reader predict the next beat. Use one idea per section, a stable section order, signposting headings, and setup before payoff. Do not add surprise in structure. Put surprise in content: a thumbnail anomaly or a motion hook is *content* surprise inside a predictable frame (status quo → turn → proof → new world), so it does not conflict with S1.
- **S2 · Transportation persuades (A).** A meta-analysis of 132 effect sizes from 76 articles supports narrative transportation: readers who mentally enter the story world change attitudes and intentions ([van Laer et al. 2014](https://openaccess.city.ac.uk/id/eprint/6755/)). The model names identifiable characters, an imaginable plot, and verisimilitude as story-side drivers. **Rule:** open the hero or chapter with a scene: a named role, a place, a stake, and one concrete detail. Real detail only: the Zero Fabrication floor still applies. An invented customer story breaks the floor *and* the verisimilitude driver.
- **S3 · People remember the peak and the end (A).** In remembered experiences, the average of the most intense moment and the final moment predicts global ratings well, and duration adds little ([Fredrickson & Kahneman 1993](https://bear.warrington.ufl.edu/brenner/mar7588/Papers/fredr-kahneman-jpsp1993.pdf)). A 2022 meta-analysis of 174 effect sizes supports the rule, and also finds that the whole-experience average predicts about as well ([Alaybek et al. 2022](https://ideas.repec.org/a/eee/jobhdp/v170y2022ics0749597822000334.html)). **Rule:** design one **peak** (usually the Interactive Proof or motion climax). Design the **end** on purpose: a resolved CTA, a signed end card, or a last paragraph with the implication. Do not let it end on a link dump. Do not let the middle sag either, because the average still counts.
- **S4 · Myth (C): "Stories release oxytocin, which makes people trust or donate."** Intranasal-oxytocin trust effects failed well-powered replication ([Lane et al. 2015](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4569325/)), and typical oxytocin studies are badly underpowered ([Walum, Waldman & Young 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4690817)). **Rule:** never cite oxytocin as a reason for a story. Cite S1–S3.

---

## 4. Art & Composition

- **A1 · Aesthetic experience needs three systems (B).** Aesthetic experience emerges from sensory-motor, emotion-valuation, and meaning-knowledge systems working together ([Chatterjee & Vartanian 2014](https://neuroaesthetics.med.upenn.edu/assets/user-content/documents/publications/chatterjee-vartanian-2014-01.pdf)). **Rule:** pass all three before Sign-Off:
  1. **Sensory:** is it fluent and legible, with contrast that passes (T5, Tier 1)?
  2. **Emotion:** does it hit the locked Emotional Target (§0)?
  3. **Meaning:** does the Diegetic Metaphor carry real domain knowledge (C3, `direction-matrix.md`)?
- **A2 · Being moved is personal (B).** Only the artworks a viewer rated *most moving* engaged default-mode-network regions linked to self-relevance. Viewers disagreed a lot about which works those were ([Vessel, Starr & Rubin 2012](https://www.frontiersin.org/articles/10.3389/fnhum.2012.00066/pdf)). **Rule:** create self-relevance. Let the visitor put *their* input into the Interactive Proof (their file size, their latency, their name on the mascot badge). One user-specific moment does more than a generic "wow".
- **A3 · Mid-range fractal detail is preferred (B).** Preference for fractal patterns peaks around fractal dimension `D ≈ 1.3–1.5`, on a scale from `1.1` (sparse) to `1.9` (dense) ([Taylor 2006](https://is.muni.cz/el/phil/podzim2015/DU2727/Taylor_Reduction_Stress_Using_Fractal_Art_and_Architecture_2006.pdf?lang=en)). The often-quoted "60% stress reduction" figure comes from secondary sources: **do not quote it.** **Rule:** keep grain, foliage, noise, and illustration detail in the mid range. Sparse is clinical. Dense is noise. For `feTurbulence` grain, use low `numOctaves` (`2–3`) and low opacity (`<= 0.08`).
- **A4 · Complexity: interest goes up, pleasantness goes down (C for the inverted-U).** Berlyne's inverted-U has mixed support. Studies often find "interesting" rises with complexity while "pleasant" falls ([Marin et al. 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC5095118)). **Rule:** pick complexity by target. `calm` / `focused` stay low. `energetic` may raise complexity on the focal plate only. Never raise it on navigation or forms.
- **A5 · Baby schema triggers reward (B, mascots).** Infant faces edited to higher baby schema (a large round head, big low-set eyes, a small nose and mouth) raised nucleus-accumbens activity and caretaking motivation ([Glocker et al. 2009](https://pmc.ncbi.nlm.nih.gov/articles/PMC2690007)). **Rule:** for `calm` / `inviting` mascots, push head-to-body ratio and eye size up. For authority or `urgent` mascots (security, incident bots), pull them down. A cute alarm reads as a toy.

---

## 5. Design & First Impressions

- **D1 · Visual appeal is judged in 50 ms (A).** Appeal ratings after 50 ms exposures matched ratings after longer viewing ([Lindgaard et al. 2006](https://tandfonline.com/doi/abs/10.1080/01449290500330448)). Visual complexity affects appeal even at 17 ms. Sites with **low complexity and high prototypicality** were rated most appealing ([Tuch et al. 2012](https://research.google/pubs/pub38315/)). **Rule:** the first viewport must read as one gist: one focal anchor, few competing elements, no clutter. Keep *structure* typical for the category (nav at top, primary action where users expect it). Spend novelty on the Material World and the Diegetic Artifact, not on navigation. This is how anti-convergence and prototypicality coexist.
- **D2 · Myth (C): "Beautiful means usable."** Tractinsky et al. found perceived aesthetics drove perceived usability ([Tractinsky, Katz & Ikar 2000](https://academic.oup.com/iwc/article-abstract/13/2/127/898608)). Later work challenged the direction and the size of the effect. **Rule:** beauty does not excuse a broken flow. Pass the usability floors anyway.

---

## 6. Motion

- **M1 · Speed and acceleration alone carry emotion and life (B).** Observers read happiness and fear from the kinematics of a single moving shape ([Roberti et al. 2024](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11006184/)). Speed and acceleration drive perceived animacy and intention in simple geometric displays ([2023 review](https://pubmed.ncbi.nlm.nih.gov/37333577/)). In body movement, fast goes with anger and slow with sadness ([PMC4075474](https://pmc.ncbi.nlm.nih.gov/articles/PMC4075474)). **Rule:** map motion to the target:

  | Target | Duration | Easing | Overshoot |
  | :--- | :--- | :--- | :--- |
  | `calm` | `300–600ms` (sections/pages; overlays stay `< 300ms`) | Quintic / expo-out, long settle | None |
  | `focused` | `120–240ms` | Quart-out | None |
  | `inviting` | `200–400ms` | Expo-out or critically damped spring | `<= 2%` |
  | `energetic` | `150–300ms` | Spring with light bounce | `3–8%` |
  | `urgent` | `100–200ms` | Sharp out, hard cuts | None (bounce reads playful) |

  The `animations.md` Frequency Test and the `< 300ms` UI ceiling still win for high-frequency UI. These ranges set the *personality* inside those limits.
- **M2 · One motion peak, then a settle (S3 applied).** Put one choreographed peak in each scene or page. End on a hold: the existing `>= 1.2s` lockup hold (`motion-design.md`) is the "end" of the peak-end rule.
- **M3 · Reduced motion is not optional.** `prefers-reduced-motion` stays a Tier 1 floor. A calm target is not an excuse to skip it.

---

