# Ukrainian translation pass — remaining 13 routes

Scope: added `translations.uk` (route-level + per-stage) to `src/data/official-routes.ts`.
No other file touched. `nameEs`, `slug`, and all numeric/structural fields left untouched.

## Routes completed (13 / 13)

All thirteen previously-untranslated routes now carry a complete `translations.uk` block
plus `translations: { uk: {...} }` on every stage:

1. `camino-portugues-costa` — Португальський шлях (Прибережний)
2. `camino-del-norte` — Північний шлях
3. `camino-primitivo` — Первісний шлях
4. `camino-ingles` — Англійський шлях
5. `via-de-la-plata` — Срібний шлях
6. `camino-sanabres` — Санабрійський шлях
7. `camino-fisterra-muxia` — Шлях Фістерра–Мушія
8. `camino-de-invierno` — Зимовий шлях
9. `camino-aragones` — Арагонський шлях
10. `camino-del-salvador` — Шлях Сальвадора
11. `camino-lebaniego` — Лебанійський шлях
12. `camino-baztanes` — Бастанський шлях
13. `ruta-do-mar-de-arousa-e-ulla` — Шлях морем Ароуса і річкою Улья

`camino-frances` and `camino-portugues-central` were not modified (verified: the diff removes
zero lines that already contained `translations`).

All 15 routes now have a `uk` name; all 191 stages have `uk` `fromPlace`/`toPlace`; `notes`
presence in the `uk` object matches the English stage exactly in all 191 cases (0 mismatches).

## Glossary reuse

Reused verbatim from the two reference routes: Сантьяго-де-Компостела, Арсуа, О Педроусо,
Падрон, Редондела, Понтеведра, Кальдас-де-Рейс, Порту, Асторга, Леон, Пуенте-ла-Рейна,
Памплона.

Chosen once and used identically across this batch for the cross-route repeats:

| English | Ukrainian | Appears in |
| --- | --- | --- |
| Oviedo | Овʼєдо | `camino-primitivo` (start), `camino-del-salvador` (end) |
| Granja de Moreruela | Гранха-де-Мореруела | `via-de-la-plata`, `camino-sanabres` (start) |
| Lalín | Лалін | `camino-sanabres`, `camino-de-invierno` |
| Silleda | Сільєда | `camino-sanabres`, `camino-de-invierno` |
| Ponte Ulla | Понте-Улья | `camino-sanabres`, `camino-de-invierno` |

House-style notes followed: the modifier-letter apostrophe `ʼ` (U+02BC) is used for the
Ukrainian apostrophe throughout, matching the existing `Вільяфранка-дель-Бʼєрсо`; Galician/
Spanish leading articles are kept as a separate word (`А Гуарда`, `О Кадаво`, `А Фонсаграда`,
`А Руа`, `А Гудінья`, `О Барко-де-Вальдеоррас`), matching the existing `О Себрейро` /
`О Педроусо`.

## Verification

`npm test`:

```
 RUN  v4.1.11 /Users/nakan/Projects/Study/caminos-hub

 Test Files  5 passed (5)
      Tests  105 passed (105)
   Start at  12:09:01
   Duration  270ms (transform 327ms, setup 0ms, import 401ms, tests 50ms, environment 0ms)
```

This includes the cross-dataset place-name consistency test and the per-route Ukrainian
chain-consistency tests, now exercised over all 15 routes.

`npm run type-check` — clean (no output).
`npm run lint` — clean (no output).

`npx prisma db seed`:

```
Loaded Prisma config from prisma.config.ts.

Running seed command `npx tsx prisma/seed.ts` ...
Seeded 15 official routes and 191 stages.

🌱  The seed command has been executed.
```

## Place names I am not fully confident about

These are consistent within and across the dataset, but a native-speaker / gazetteer pass
would be worthwhile. Basque names in particular have no settled Ukrainian convention.

Basque (Camino del Norte, Camino Baztanés):

- `Zarautz` → **Сараутс** — Basque `z` = /s/, `tz` = /ts/. "Сараус" is also seen in the wild.
- `Markina-Xemein` → **Маркіна-Шемейн** — Basque `x` = /ʃ/. Rendered as one hyphenated compound.
- `Ustaritz` → **Устаріц**
- `Urdax` → **Урдас** — Basque/Spanish spelling `Urdazubi/Urdax`; final `x` here reads as /s/,
  unlike the Galician `x`. This is the pairing I am least sure of.
- `Baztanés` (route name) → **Бастанський шлях**, valley `Baztan` → **Бастан**.
- `Bayonne` → **Байонна** (French, standard).
- `Güemes` → **Гуемес** (the diaeresis just forces the /gw/; "Гуемес" over "Гвемес").

Galician `x` = /ʃ/, rendered as **ш** throughout:

- `Muxía` → **Мушія**, `Xunqueira de Ambía` → **Шункейра-де-Амбія**.
  (Contrast `Sobrado dos Monxes` → **Собрадо-дос-Монхес** — kept with **х** because the
  Castilianised form is the one commonly used; flagging the inconsistency deliberately.)

Other small settlements with no established Ukrainian form:

- `Cee` → **Сее**, `Oia` → **Ойя**, `Sebrayo` → **Себрайо**, `Miraz` → **Мірас**,
  `Cades` → **Кадес**, `Cabañes` → **Кабаньєс**, `Olague` → **Олаге**,
  `Sigüeiro` → **Сігуейро**, `Arrés` → **Аррес**, `Ruesta` → **Руеста**.
- `Alcuéscar` → **Алькуескар**, `Valdesalor` → **Вальдесалор**,
  `El Cubo de la Tierra del Vino` → **Ель-Кубо-де-ла-Тʼєрра-дель-Віно**,
  `Fuenterroble de Salvatierra` → **Фуентерробле-де-Сальватʼєрра** (the `tie` → `тʼє`
  treatment follows the same choice made in `Боо-де-Пʼєлагос`).
- `Finisterre` → **Фіністерре** for the stage/cape; the certificate is rendered
  «Фістеррана» and «Мушіана», following the Galician forms used in the English text.

Portuguese (Coastal Way) uses European-Portuguese pronunciation, consistent with the existing
`Барселуш` / `Рубіайнш` in the Central route: `Esposende` → **Ешпозенде**,
`Viana do Castelo` → **Віана-ду-Каштелу**, `Vila do Conde` → **Віла-ду-Конде**,
`Caminha` → **Камінья**, `Matosinhos` → **Матозіньюш** (in notes only).

## Concerns

- Route names are translated semantically (`Original Way` → «Первісний шлях»,
  `Silver Way` → «Срібний шлях») rather than transliterated, matching the existing
  «Французький шлях» / «Португальський шлях (Центральний)» treatment. The Coastal Way was
  named «Португальський шлях (Прибережний)» specifically to parallel the existing Central
  route's parenthetical form.
- Two proper nouns are intentionally left in Latin script inside prose, because they read as
  brand/title strings rather than place names: `Vía de la Plata` (in its own and the
  Sanabrés' description) and `Senda Litoral` (in the Coastal Way's `waymarking`). The
  existing translated routes have no precedent either way; easy to change if the house style
  says otherwise.
- The `Hospitales` variant on the Primitivo is transliterated **Оспіталес** (Spanish silent
  `h`), while the English Way's `Hospital de Bruma` becomes **Оспіталь-де-Брума**. Same root,
  different grammatical form — deliberate, but worth a second opinion.
- No `notes` text was invented: the `uk` object omits `notes` wherever the English stage has
  none.
