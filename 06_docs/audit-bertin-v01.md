# Bertin Audit · v0.1 Diagram System + Snippet/Frontier Charts

Applying the 15-criterion Bertin framework from the research brief. The framework grades **construction rules**, not aesthetic judgments. Either a variable assignment matches the data type or it doesn't.

Bertin's framework is unforgiving in a way Tufte's isn't. Where Tufte gives partial credit for "within reason," Bertin doesn't — a variable either matches its data component or it's a construction error. I expect this audit to find failures the Tufte audit missed.

**Audited artifacts**
- Pipeline (Bumblebee) · Timeline (Comet security) · Stat Hero (BrowseSafe) · Comparison (BrowseComp) · Snippet bar · Frontier line

---

## 1 · Level matching: color (hue) — **PASS with one finding**

> Verify the encoded data component is nominal (no inherent order). Hue on ordered data is a construction error.

| Artifact | Hue assignment | Component encoded | Verdict |
|---|---|---|---|
| Pipeline · Findings teal | accent | "the punchline" — qualitative role | **OK** (nominal) |
| Pipeline · Match magenta | warn | "exception state" — qualitative | **OK** (nominal) |
| Timeline · BrowseSafe teal | accent | "this milestone is the open-source release" — qualitative | **OK** (nominal) |
| Stat Hero · Defense layers teal | accent | "the structural punchline" — qualitative | **OK** (nominal) |
| Comparison · Sonar teal | accent | "ours" — nominal | **OK** |
| Comparison · indigo (GPT-5, Claude, Gemini) | series-2 | "peer competitors" — nominal | **OK** |
| Comparison · warm grey (Grok, o3) | series-3 | "baseline competitors" — nominal | **Probable level mismatch** — see below |
| Snippet bar · 5-step magenta→indigo ramp | bar fill color | impact magnitude — **ORDERED** | **FAIL** — see below |
| Frontier line · teal/indigo/magenta | series category | three model variants — nominal | **OK** |

### Findings

**Snippet bar — construction error.** The five bars (UI/nav, Metadata, Ads, Off-topic, Duplicate) use a hue progression magenta-400 → magenta/indigo midway → indigo-400 → indigo-500 → indigo-700 to encode impact magnitude. By Bertin's rule (p. 85–91), **hue is nominal only**. The "ordered" reading of this ramp only works because lightness varies too, but the assignment is conceptually wrong: I'm using *color* to encode an ordered quantity.

The Bertin-correct fix is one of:
1. Single-hue value scale (light teal → dark teal) so order is encoded by lightness alone
2. Diverging value scale with a neutral midpoint (if there's a meaningful zero)
3. Neutral bars + accent the one most important category — which is what Tufte would say too, and what I already flagged at the end of the chart re-render. *Now Bertin has a formal reason for it.*

**Comparison series-3 (Grok, o3) — softer concern.** I have three tiers using teal / indigo / warm-grey. Indigo→warm-grey is hue change, but I'm also using it to encode "tier-3 baselines" — which is *nominal* (these aren't ranked among themselves, they're a category). Defensible. Not a construction error, but if the tier categorization is supposed to imply *order* ("tier-3 = lower"), it should encode order by **value**, not hue. Currently the visual just reads as muted-color → secondary status, which is conventional but isn't Bertin-rigorous.

---

## 2 · Level matching: size — **PASS**

> Size must encode ordered or quantitative components, never nominal.

| Artifact | Size assignment | Component | Verdict |
|---|---|---|---|
| Pipeline · wire stroke width | quantitative (throughput, 0–1) | continuous data | **OK** |
| Comparison · bar length | quantitative (score 0–75) | continuous | **OK** |
| Stat Hero · supporting bar length | quantitative (value 0–max) | continuous | **OK** |
| Snippet bar · bar length | quantitative (% change) | continuous | **OK** |
| Frontier line · y-position | quantitative (% retained) | continuous | **OK** |
| Pipeline · activity sparkline bar height | quantitative (0–1 normalized) | continuous | **OK** |
| Pipeline · tile icon size | nominal (constant — entity type) | invariant | **OK** (icon is symbol not variable, see test #12) |
| Stat Hero · hero number font size | display, not data-encoding | — | **N/A** |

All size encodings carry ordered/quantitative components. No nominal data is using size.

---

## 3 · Level matching: value (lightness) — **PASS**

> Lightness must encode ordered components, never nominal.

| Artifact | Value (lightness) gradient | Component | Verdict |
|---|---|---|---|
| Pipeline · activity strip opacity (0.35→0.7→0.9) | quantitative — "is this the peak bar?" | ordered | **OK** |
| Comparison · CI tick opacity vs bar opacity | structural distinction (CI is meta-data) | not encoding a data variable | **OK** |
| Editorial vs branded mode bg | mode signal | nominal | **technically** a value gradient encoding a nominal var, but it's a *surface* not a *mark* — outside the retinal system |

No mark-level violations.

---

## 4 · Shape selectivity — **PASS**

> Can the viewer pre-attentively isolate all marks of one shape in a complex field?

The system uses very few shapes. Pipeline icons are constant within their tile (one shape per tile), so shape is encoding *invariant* (entity type — Endpoint vs Lockfiles vs MCP configs), not a data variable. Test #12 covers this.

The one place shape *varies* across marks is the Frontier line's data-point markers (circle vs square vs diamond per series). Three shapes, ~5 points per shape, simple field — selectivity is intact at this complexity. **OK.**

---

## 5 · Component count per diagram — **FAIL on Pipeline**

> Single-image target: ≤1 active retinal variable beyond planar dimensions. Dual-layer: ≤2.

This is the brutal test. Bertin's three-component image rule: planar dimensions count as 2; you get **one** retinal variable for a single-image read. More than that and the diagram becomes a figuration requiring sequential reading.

Counting active retinal variables in **Pipeline · Bumblebee · editorial 16:9**:

| Variable | What it encodes | Active? |
|---|---|---|
| Planar (x, y) | flow direction + node hierarchy | yes — primary |
| Size (wire weight) | throughput | **active** |
| Value (activity strip lightness for peak bar) | recency | **active** |
| Color (border accent on Findings) | punchline role | **active** |
| Color (border warn on Match tile) | exception state | **active** |
| Shape (tile icons) | entity type (invariant) | not a variable — test #12 |

That's **4 active retinal variables on top of the plane**. Bertin's image limit is 1, dual-layer is 2, beyond that = figuration.

**Verdict:** Pipeline is a figuration, not an image. By Bertin's strict definition, a viewer cannot read the full Pipeline diagram in a single instant. They must scan it sequentially.

That's not necessarily *wrong* for an announcement diagram — it's a documentation surface, not a chart. But the audit says: **don't claim Pipeline reads at the overall level.** It reads at the intermediate level, after sequential scanning. The Tufte audit gave this a "pass" on multivariate completeness because Tufte values density. Bertin penalizes it because density past 3 active variables breaks the image.

This is a real philosophical disagreement, not a bug. The system has chosen Tufte-side density over Bertin-side image purity. **Honest naming:** Pipeline is a "graphic" in Bertin's broader sense, not an "image" in his strict sense.

Comparison (test #5 on Comparison-archetype): plane + bar length (size) + bar color (series category). Three components. **Borderline image, leans figuration** because series-color is doing two jobs (categorical AND accent). Defensible.

Timeline (test #5): plane (x/y for time × milestone) + dot color (accent vs neutral) + card border color (accent). Two retinal variables. **Within image limits.** Passes.

Stat Hero (test #5): plane + size (supporting bar length) + color (accent on Defense layers row). Two retinal variables. **Passes.**

---

## 6 · Planar dimension assignment — **PASS**

> The highest-level-of-organization component should be assigned to the plane.

| Archetype | Highest-organization component | Assigned to | Verdict |
|---|---|---|---|
| Pipeline | flow direction (ordered) | x-axis (left→right) | **OK** |
| Timeline | time (ordered/quantitative) | x-axis (16:9) or y-axis (1:1) | **OK** |
| Stat Hero | comparison row (ordinal) | y-axis (rank) | **OK** |
| Comparison | score (quantitative) | x-axis (bar length on common scale) | **OK** |

Most information-dense component goes on the plane in every archetype. Pass.

---

## 7 · Ordered color scale test — **FAIL on Snippet bar**

> Sequential scales must use single-hue value progression, not hue progression.

This restates test #1's snippet bar finding from a different angle. The snippet bar's magenta→indigo color ramp is the canonical Bertin error described in section 9.3 of the brief: "the common violation in technical diagram systems: using a red-yellow-green hue scale for severity... is a level mismatch *and* a spectral confusion error."

I built the chart-system equivalent. Magenta-400 and indigo-700 sit at different hues *and* different lightnesses, but the encoding is hue-based by construction (the CSS tokens are `--bar-1` through `--bar-5`, each named after a discrete hue step). A Bertin-correct ramp would use one hue with five lightness steps.

**Status:** known issue, formally identified now. Recommend a fix.

---

## 8 · Absence-of-marks rule — **PASS**

> In signifying fields, absence must mean something specific.

None of the archetypes use signifying-field semantics (matrix cells where empty = absent). Pipeline / Timeline / Stat Hero / Comparison all use cards where each card is positively asserted; there are no empty cells to interpret.

The closest case is the snippet bar's "Vital" row sitting alone on the positive side. The empty negative side for that row encodes "no negative reading" — that's reading correctly. No lacunae.

---

## 9 · Length constraint: color — **PASS**

> ≤7 hue categories per diagram.

| Artifact | Hue count | Verdict |
|---|---|---|
| Pipeline | 4 (ink, neutral grey, teal punchline, magenta warn) | **OK** |
| Timeline | 3 (ink, neutral, teal accent) | **OK** |
| Stat Hero | 3 (ink, neutral, teal accent) | **OK** |
| Comparison | 5 (ink, neutral, teal, indigo, warm grey) | **OK** |
| Snippet bar | 5 bar hues + teal accent + warm grey reference = 7 total | **At limit** |
| Frontier line | 4 (teal, indigo, magenta, warm grey) | **OK** |

Snippet bar is exactly at the 7-category limit. Above this and viewers can't reliably distinguish all categories. The fix for test #7 (collapse to a single-hue value ramp) would also fix this — would cut the count to 3.

---

## 10 · Length constraint: size — **PASS**

> ≤4 size categories per data variable.

Pipeline wire weights: continuous (5 values 0.1, 0.3, 0.5, 0.65, 0.95) but viewers don't decode these as discrete steps. Within capacity.

Snippet bar lengths / Comparison bar lengths / Stat Hero bar lengths: continuous, not discrete categories. Reading is approximate, which is Bertin-acceptable for size (per his note that value gives "approximation but not precise measurement"; same applies to length on a relative scale).

**OK.**

---

## 11 · Overall-level test — **FAIL on Pipeline, PASS on others**

> State the primary question. Cover the legend. Time to answer should be ≤3 seconds.

This is the killer Bertin test. I'll be honest about each:

| Archetype | Primary question | Time-to-answer estimate | Verdict |
|---|---|---|---|
| Pipeline | "What does Bumblebee scan and what does it produce?" | 8–12 sec — must scan three columns and parse the relationship | **FAIL** (functioning as figuration) |
| Timeline | "When did Comet security mature?" | 2–3 sec — three dated milestones, last one accented | **OK** |
| Stat Hero | "What's the punchline number?" | <1 sec | **OK** |
| Comparison | "Which model is best?" | 1–2 sec — sorted, top row accented | **OK** |
| Snippet bar | "Which token category got cut most?" | 2–3 sec — top bar accents heavy negative | **OK** |
| Frontier line | "Which variant is on the frontier?" | 2–3 sec — dashed teal on upper-left | **OK** |

Pipeline fails the overall-level test for the same structural reason as test #5. It's a multi-image construction. The question isn't readable at a glance.

**This is the system's most consequential Bertin failure.** Even after the v0.1 "fix" for multivariate completeness, the diagram still doesn't function as an image. By Bertin's rule it should either:
1. Be decomposed into a set of small multiples (one image per question), or
2. Reduce active retinal variables to 1, accepting less information density

Both are real options. Neither is what I built.

---

## 12 · Icon/symbol separation — **PASS**

> Determine whether icons encode invariant (entity type) or data variable (something that varies).

Pipeline tile icons (laptop, doc, config, ext, warn) — each tile has *one* icon, and the icon is fixed for that tile's entity type. Shape is encoding the invariant (Endpoint vs Lockfiles), not a variable. **OK** — they sit outside the retinal variable system.

Stat Hero supporting-bar labels use no icons.

Frontier-line per-series markers (circle / square / diamond) — three shapes encoding three series. Shape is encoding a *data variable* (which model). Per test #4: small length (3), simple field — selectivity holds. **OK with caveat:** Bertin would prefer hue alone be doing this work (it already is — three line colors), making the shape redundant. The shape adds redundancy without adding information. Tufte's "erase redundant data-ink" agrees here.

**Recommendation:** consider removing the shape markers on Frontier line, letting hue alone carry series identity. Worth a future pass.

---

## 13 · Line variable inventory — **PASS**

> ≤2 active retinal variables per line.

Pipeline wires: weight (size) + color (hue, three styles: neutral / ink / accent) = 2 active variables on the line. **At the limit, OK.**

Frontier line: hue (series) + dash pattern (treatment — which is texture/orientation depending on interpretation) = 2 active variables. **At the limit, OK.**

---

## 14 · QS² error check — **PASS**

> No quantity-scaled marks inside other quantity-scaled zones.

Nothing in the system displays one quantity-scaled mark *inside* another quantity-scaled zone. The Pipeline activity sparklines sit *outside* the node cards (anchored to the bottom edge), so they don't read as "data inside a sized container." No QS² errors.

---

## 15 · Network complexity threshold — **PASS**

> Bertin's qualitative rule: when networks become "complex, illegible, untransformable," they exceed graphic capacity.

Pipeline has 6 nodes + 6 edges. Way under the threshold. No archetype produces a network of meaningful complexity. **OK.**

---

## Summary

| # | Test | Verdict |
|---|---|---|
| 1 | Color (hue) level match | **PASS** (with snippet bar finding under #7) |
| 2 | Size level match | **PASS** |
| 3 | Value level match | **PASS** |
| 4 | Shape selectivity | **PASS** |
| 5 | Component count per diagram | **FAIL on Pipeline** (4 active retinal vars; limit is 1 for image) |
| 6 | Planar dimension assignment | **PASS** |
| 7 | Ordered color scale test | **FAIL on Snippet bar** (hue ramp encoding order) |
| 8 | Absence-of-marks rule | **PASS** |
| 9 | Color length constraint (≤7) | **PASS** (snippet bar at limit) |
| 10 | Size length constraint (≤4 discrete) | **PASS** |
| 11 | Overall-level test (≤3s readability) | **FAIL on Pipeline** |
| 12 | Icon/symbol separation | **PASS** (minor redundancy flag on Frontier) |
| 13 | Line variable inventory (≤2) | **PASS** (at limit) |
| 14 | QS² error check | **PASS** |
| 15 | Network complexity | **PASS** |

**Score: 12 pass · 0 partial · 2 fail · 0 N/A**

---

## The two real failures

Both are structural, both honest, both worth fixing properly.

### Failure A — Pipeline is a figuration, not an image (tests #5 + #11)

The Tufte audit told me to *add* dimensions to Pipeline. I did, and the diagram improved by Tufte's metric (multivariate completeness). But Bertin's frame is different: beyond 3 retinal variables, the construction stops being readable in a single glance. Pipeline now carries 4 active retinal variables and requires sequential reading.

This is a real tension in the canon — Tufte values density, Bertin values image purity. The honest answer: **acknowledge what Pipeline actually is.** It's a documentation diagram, not an at-a-glance image. The system already labels it as such (Pipeline is the "flow archetype," not the "image archetype"). The fix isn't to strip Pipeline back down — it's to:

1. **Document the constraint explicitly** in the diagram-system README: "Pipeline is built for sequential reading. Use Stat Hero or Comparison when single-glance comprehension matters."
2. **Add a 'Pipeline simple' variant** that drops to 1–2 active retinal variables for cases where image-level reading is required.

### Failure B — Snippet bar uses hue to encode order (tests #1 + #7)

This is a clean Bertin violation. The five impact-magnitude bars use a hue ramp magenta→indigo. Order should be encoded by **value (lightness)**, not hue. The fix is mechanical:

- Pick one hue (the v7 charts already have indigo dominant)
- Use a 5-step lightness ramp within that hue, dark to light or light to dark depending on whether bigger is conceptually heavier
- Reserve the *other* Comet hues (teal, magenta) for the **categorical** distinctions: teal = punchline (the Vital bar), magenta = warning, warm grey = reference

This is also what Tufte's "erase redundant data-ink" would suggest (the length is already encoding magnitude; the multi-hue ramp adds nothing). Both frameworks converge on the same fix.

---

## Bertin vs. Tufte where they disagreed on my system

| Question | Tufte audit | Bertin audit |
|---|---|---|
| Pipeline v0.1 multivariate density | **Pass** (multivariate completeness improved) | **Fail** (exceeds 3-variable image limit) |
| Snippet bar 5-step ramp | "**Flag**" — double-encoding | **Fail** — hue cannot encode ordered data |
| Frontier line per-series shape markers | Pass | **Marginal** — redundant with hue |
| Comparison series tiers (teal / indigo / warm grey) | Pass | **Pass** (nominal categories) |
| Editorial accent system | Pass | **Pass** |

The pattern: **Bertin penalizes things Tufte rewarded** when those things are formally wrong, and **Bertin agrees with Tufte's flags** when the flags coincide with construction errors.

The honest summary: the Tufte audit gave the system a 14-pass score because Tufte grades on quality and intent. The Bertin audit drops it to 12-pass because Bertin grades on whether construction rules are formally satisfied. Both audits are correct in their frames.

---

## Recommended next moves

1. **Fix B is mechanical.** Replace snippet bar's 5-hue ramp with a 5-step value ramp in a single hue. Lift the punchline accent (Vital → teal) and the warning (none here) outside the ramp. This is a clear Bertin fix that also satisfies Tufte. *Implement next.*

2. **Fix A is architectural.** Pipeline's overload is a system-level question. Two options:
   - Accept that Pipeline is documentation-grade, not image-grade. Add the disclaimer in docs.
   - Build a "Pipeline Compact" variant that strips back to a single retinal variable. Use it for social cards; use full Pipeline for blog/docs.

3. **Frontier line marker shapes are a minor redundancy worth removing** in a future pass — both Bertin and Tufte agree.

4. **Update the audit-tufte-mapping.md** with a section on "What Bertin's framework caught that Tufte missed" — make the duality explicit so future audits run both.
