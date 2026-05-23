# Bertin · Semiology of Graphics audit — v0.2 archetypes (S, D)

Same 15-criterion framework as v0.1. Pass / Partial / Fail / N/A per criterion per archetype.

Reference: `/home/user/workspace/bertin-semiology-research-brief.pplx.md`

---

## S · Schema / Network

| # | Criterion | Result | Note |
|---|-----------|--------|------|
| 1 | Implantation matches data type | **Pass** | Point implantation for each node (hub + leaves). Line implantation for edges (relationships). Bertin's network type, p. 277. |
| 2 | Imposition (planar variables) does the structural work | **Pass** | XY position encodes hub-and-spokes topology. No false dimensions. 16:9 cardinal layout, 1:1 vertical stack with rule-line as relation. |
| 3 | ≤3 active retinal variables (the "image" rule, p. 148) | **Pass** | Active vars: (1) position, (2) value via border weight (2px ink hub vs 1px rule leaves), (3) one nominal — accent color on the focal hub. Tally: 3. |
| 4 | Ordered data uses value, not hue | **N/A** | No ordered data in this diagram. All nodes are nominally distinct. |
| 5 | Hue used only for nominal distinction | **Pass** | Single accent (teal) singles out the focal node. Rest is achromatic ink-tones. |
| 6 | Quantitative data uses length on a common scale | **N/A** | No quantitative encoding. |
| 7 | Selective vs associative variable choice intentional | **Pass** | Accent on hub = selective (singles one node out). Border weight = selective (separates hub from leaves). Position = associative (groups all four leaves as peers). |
| 8 | No redundant encoding without purpose | **Pass** | Hub is both heavier-bordered AND accented — this is *intentional* redundancy reinforcing the focal point. Per Bertin pp. 168-9, redundancy is permissible when it strengthens the perceptual code. |
| 9 | Label placement supports node, doesn't compete | **Pass** | Edge labels in mono on cream background sit on the connector line. Leaf labels inside their cards. No collisions. |
| 10 | Rotation of reading direction handled | **Pass** | 16:9 reads radially from hub outward. 1:1 reads top-down as ranked relation list. Both reading orders honor the central position of the hub. |
| 11 | Honest construction (no Lie Factor inflation) | **Pass** | Equal-sized leaves. Hub centered. No size-by-importance manipulation. |
| 12 | Compact form possible | **Partial** | 1:1 vertical stack is the compact form. No further-reduced single-image. Acceptable for v0.2; can add later if needed. |
| 13 | Edge-label legibility (mono, ≥9px floor via clamp) | **Pass** | `--t-micro` floors at 9px. Teal at 4.93:1 on cream meets AA for graphical text. |
| 14 | Accent applied to one focal element only | **Pass** | Only the hub is accent. Leaves remain neutral. |
| 15 | Diagram tells one fact at a glance | **Pass** | "All four product surfaces answer from one engine." Hub-and-spokes geometry communicates this without reading the labels. |

**Score: 13 Pass · 1 Partial · 0 Fail · 2 N/A**

---

## D · Decision

| # | Criterion | Result | Note |
|---|-----------|--------|------|
| 1 | Implantation matches data type | **Pass** | Zone implantation (card regions per branch). Line implantation implicit via column → rail → column flow. |
| 2 | Imposition does structural work | **Pass** | Horizontal axis = sequence (start → decisions → outcome). Vertical axis within rail = branching alternatives. |
| 3 | ≤3 active retinal variables | **Pass** | Active vars: (1) position (sequence + branches), (2) value (chosen branch full opacity vs alt branch at 0.5 + surface-2 background), (3) one nominal — accent on the final outcome. Tally: 3. |
| 4 | Ordered data uses value, not hue | **Pass** | The "chosenness" of a branch is ordered (chosen > alt). Encoded with value (opacity), not hue. |
| 5 | Hue used only for nominal distinction | **Pass** | Single accent (teal) on the terminal outcome only. No color-coded branches. |
| 6 | Quantitative data uses length on a common scale | **N/A** | No quantitative data. |
| 7 | Selective vs associative variable choice intentional | **Pass** | Value (opacity) is selective — instantly separates chosen from alt. Accent is selective — singles out the outcome. Position is associative — groups branches as pairs. |
| 8 | No redundant encoding without purpose | **Pass** | Alt branches: lower opacity AND surface-2 background. Intentional redundancy to weaken the alt visually without removing it (still readable, per Bertin's value-variable rules p. 73-79). |
| 9 | Label placement supports flow, doesn't compete | **Pass** | Question on left border, tag above lbl above sub. Clear reading order top-down within each branch. |
| 10 | Reading direction explicit | **Pass** | START label upper-left, OUTCOME label upper-right of their columns. Vertical bar before each question reinforces left-to-right scan. |
| 11 | Honest construction | **Pass** | All branches equally sized. Alt is dimmed, not erased. The diagram doesn't lie about the existence of the unchosen path. |
| 12 | Compact form possible | **Pass** | 1:1 vertical flow is the compact form. Same content, top-to-bottom. |
| 13 | Legibility floors hold | **Pass** | All type sourced from `--t-*` clamped ramp tokens. Branch sub at `--t-utility` floors at 10px. Alt branches at 0.5 opacity * ink-2 (3D4A4A) = still ≥3:1 on cream surface-2. |
| 14 | Accent applied to one focal element only | **Pass** | Only `.d-outcome.accent` carries the teal border. No accent leak. |
| 15 | Diagram tells one fact at a glance | **Pass** | "Computer routes through three binary checks, and this is the path it took." The dimmed alternates communicate "we could have gone here but didn't." |

**Score: 14 Pass · 0 Partial · 0 Fail · 1 N/A**

---

## Combined v0.1 + v0.2 Bertin posture

| Archetype | Pass | Partial | Fail | N/A |
|-----------|------|---------|------|-----|
| P · Pipeline (Compact) | 14 | 0 | 0 | 1 |
| P · Pipeline (Full) | documentation-grade figuration — exempt by design |
| T · Timeline | 14 | 0 | 0 | 1 |
| H · Stat Hero | 14 | 0 | 0 | 1 |
| C · Comparison | 14 | 0 | 0 | 1 |
| S · Schema | **13** | **1** | **0** | **2** |
| D · Decision | **14** | **0** | **0** | **1** |

S takes one partial for not yet having a sub-1:1 single-image compact variant. Not blocking; adds to v0.3 backlog if a social-card need surfaces.

---

## Notes

**S construction philosophy:** Bertin's network type is the most tempting place to over-encode. Resisted: color-by-category leaves, size-by-traffic nodes, weight-by-frequency edges. Kept the schema as raw topology + one accent.

**D construction philosophy:** Decision trees usually fall into one of two failure modes: (a) color-coded paths (red = no, green = yes) which violates rule 5, or (b) hidden-alternates which violates rule 11 (you can't see the path not taken). The opacity-50 alt branches solve both: same hue family, present but de-emphasized.
