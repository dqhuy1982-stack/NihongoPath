# HORIZON UI Language Pack

## Scope

`ui-pack.js` is the **user-interface copy** package for Vietnamese (`vi`),
English (`en`) and Japanese (`ja`). Every new screen should get its
labels, navigation, controls, buttons, notifications, ARIA labels and
empty/error states from `Locale.ui('namespace.key', {parameter})`.

`Locale.code` is the single locale state. The language selector stores
`nihongo-path-ui-locale` and dispatches `np:localechange`. Pages with
dynamic UI should re-render on that event without overwriting unsaved edits.
Season preferences are independent, and the season label follows locale.

## Exclusions

**Never** translate, overwrite or modify learning records or user-authored
content as a side effect of switching the UI language. In particular:

- Learner names, PINs, dates, notes, saved words, example sentences and
  stored source attribution remain original; wrap displayed values in
  `data-no-translate`.
- Japanese teaching examples and authored course content belong to the
  **separate lesson content/language pipeline**, not this UI package.
- Existing lesson localization dictionaries (`lesson-locale.js` and
  `foundation-locale.js`) remain independent.

## Maintenance convention

Example:

```js
// i18n/ui-pack.js
"review.panel.empty": {
  "vi": "Học một mẫu, hẹn gặp lại ngày mai.",
  "en": "Learn one pattern, then revisit it tomorrow.",
  "ja": "文型を一つ学び、明日また復習しましょう。"
}

// in a UI renderer (not a learner's stored note)
const title = Locale.ui('review.panel.empty');
const count = Locale.ui('review.panel.due',{count:3});
```

Do not insert an untranslated literal into a template and assume a
DOM text walker will always translate it. Never use live machine translation
on the browser for this demo. `Locale.ui` records unknown keys in
`Locale.missingUIKeys()` and returns a clearly visible diagnostic marker.

Legacy `locale-data.js` and `locale-coverage.js` continue to support
earlier pages during the gradual migration. The UI pack is now the
authoritative source for Review and Learning Journal; do not add new UI copy
to scattered module files.

## QA acceptance

1. Switch VI → EN → 日本語 → VI on Home, Dashboard, Review, Journal.
2. Revisit previously opened pages. No stale labels or placeholders.
3. Review with and without completed lessons; check counts, actions, Michi,
   scheduled reviews and empty states.
4. Journal with empty and populated note list; check search/filter, modal
   actions and preserved note title/body/source; check typed search values.
5. On mobile, confirm controls do not overflow and changing locale does not
   discard edits or modify learning progress.
6. `node --test tests/i18n-ui-pack.test.mjs` plus the Pages QA suite.
