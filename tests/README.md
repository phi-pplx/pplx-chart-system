# Tests

## `integration.test.js`

Skill-authoring integration test. Simulates exactly what a skill does when it integrates with the live chart system, and fails loudly if the contract is broken.

### What it checks

For every archetype declared in the live `manifest.json`:

1. **Fetch** — does the `template_url` return 2xx?
2. **Render** — does the template parse cleanly through the handlebars-style expander (no unclosed `{{#each}}` / `{{#if}}` blocks)?
3. **Placeholders** — after substituting the fixture, are there any remaining `{{ name }}` tokens? If yes, that's a missing placeholder the manifest didn't promise.
4. **PPLX mark** — does the rendered HTML contain the PPLX 2026 mark (inline SVG with `viewBox="0 0 254 275"`)?

Independently, every URL listed under `manifest.assets` is HEAD-checked and reported as 2xx or not.

### Run

```bash
node tests/integration.test.js
# or
npm test
```

### Output

A two-table report:

```
═══ Archetype results ═══

Archetype       Fetch  Render  Placeh.  Mark   Size    Notes
─────────────────────────────────────────────────────────────────
A               PASS   PASS    PASS     PASS    3340
B               PASS   PASS    PASS     PASS    3850
...

═══ Asset URL liveness ═══

Status  URL
─────────────────────────────────────────────────────────────────
200     https://phi-pplx.github.io/pplx-chart-system/fit.js
200     https://phi-pplx.github.io/pplx-chart-system/fonts/...
...

═══ Summary ═══
Archetypes: 9/9 passed all checks
Asset URLs: 18/18 returned 2xx
ALL CHECKS PASSED
```

Exit code is 0 on full pass, 1 on any archetype or asset failure, 2 on an unhandled error in the test itself.

### Pointing the test at a different manifest

Set `MANIFEST_URL` to override the default:

```bash
MANIFEST_URL=https://my-fork.example.com/manifest.json node tests/integration.test.js
```

### Fixtures

The fixture data for each archetype is at the top of `integration.test.js` in the `FIXTURES` const. To add a new archetype to the test, add a new entry there matching its placeholder set in the manifest.

### Zero dependencies

The test uses only the built-in `fetch` (Node 18+). No npm install required.
