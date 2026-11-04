/**
 * Read-only audit of the Nihongo Path learning content and demo fixtures.
 * Run from the repository root: node tools/audit-learning-data.mjs
 * This never opens/changes hosted D1, browser data or learner records.
 */
import { readFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const json = async relative => JSON.parse(await readFile(join(root, relative), 'utf8'));
const exists = async relative => access(join(root, relative)).then(() => true, () => false);
const unique = items => new Set(items).size === items.length;

function validatePilot(content, filename) {
  const prefix = filename + ': ';
  check(typeof content.id === 'string' && content.id.length > 0, prefix + 'missing content ID');
  check(Number.isInteger(content.version) && content.version >= 1, prefix + 'invalid version');
  check(Array.isArray(content.concepts) && Array.isArray(content.questions), prefix + 'missing concepts/questions');
  const conceptIds = (content.concepts || []).map(item => item.id);
  const questionIds = (content.questions || []).map(item => item.id);
  const cardIds = Array.isArray(content.cards)
    ? content.cards.map(item => item.id) : Object.keys(content.cards || {});
  const units = content.units || {};
  check(unique(conceptIds), prefix + 'duplicate concept IDs');
  check(unique(questionIds), prefix + 'duplicate question IDs');
  check(unique(cardIds), prefix + 'duplicate card IDs');
  for (const [id, unit] of Object.entries(units)) {
    if (unit.questionId) check(questionIds.includes(unit.questionId), prefix + 'unit ' + id + ' refers to unknown question');
    if (unit.cardId) check(cardIds.includes(unit.cardId), prefix + 'unit ' + id + ' refers to unknown card');
  }
  for (const q of content.questions || []) {
    check(conceptIds.includes(q.conceptId), prefix + 'question ' + q.id + ' refers to unknown concept');
    if (q.type === 'choice') {
      const options = (q.options || []).map(item => item.id);
      check(options.length >= 2 && unique(options), prefix + 'invalid options for ' + q.id);
      check(options.includes(q.answer), prefix + 'answer missing from options for ' + q.id);
    } else {
      check(q.type === 'order', prefix + 'unrecognized question type ' + q.type + ' for ' + q.id);
    }
  }
  for (const duration of ['3', '5', '15']) {
    const plan = content.plans?.[duration];
    check(Array.isArray(plan) && plan.length > 0, prefix + 'missing ' + duration + '-minute plan');
    for (const unitId of Array.isArray(plan) ? plan : []) {
      check(Object.hasOwn(units, unitId), prefix + duration + '-minute plan uses missing unit ' + unitId);
    }
  }
  return {
    id: content.id,
    version: content.version,
    level: content.level,
    concepts: conceptIds.length,
    questions: questionIds.length,
    units: Object.keys(units).length,
    planLengths: Object.fromEntries(Object.entries(content.plans || {}).map(([k, p]) => [k, p.length]))
  };
}

async function main() {
  const foundationPath = 'source/content/foundation-vowels.v1.json';
  const n5Path = 'source/content/n5-introduction.v1.json';
  const foundation = await json(foundationPath);
  const n5 = await json(n5Path);
  const browserN5 = await json('source/public/lesson-data/n5-introduction.v1.json');
  const demo = await json('source/public/demo-data/seed.json');
  const editor = await json('source/public/admin-data/seed.json');
  const d1 = await Promise.all([
    readFile(join(root, 'source/drizzle/0000_tranquil_korg.sql'), 'utf8'),
    readFile(join(root, 'source/drizzle/0001_many_blackheart.sql'), 'utf8')
  ]).then(parts => parts.join('\n'));
  const pilots = [validatePilot(foundation, foundationPath), validatePilot(n5, n5Path)];

  check(JSON.stringify(n5) === JSON.stringify(browserN5),
    'N5 browser copy has diverged from canonical source/content version.');
  check(demo.meta?.fictional === true, 'Simulation fixture must explicitly be fictional.');
  check(editor.fictional === true, 'Authoring fixture must explicitly be fictional.');
  check(Array.isArray(demo.learners) && demo.learners.length > 0, 'Missing sample learners.');
  check(unique((demo.learners || []).map(item => item.id)), 'Duplicate sample learner IDs.');
  const familyIds = new Set((demo.families || []).map(item => item.id));
  for (const learner of demo.learners || []) {
    check(familyIds.has(learner.familyId), 'Sample learner ' + learner.id + ' has no family.');
  }
  for (const table of [
    'learners', 'learning_states', 'learning_attempts', 'command_receipts',
    'kana_states', 'kana_drawings', 'kana_practices'
  ]) {
    check(new RegExp('CREATE TABLE [`"]' + table + '[`"]').test(d1),
      'Missing D1 table in packaged migrations: ' + table);
  }
  const avatarPaths = ['demo-a', 'demo-b', 'demo-c', 'demo-d']
    .map(name => 'source/public/assets/family/' + name + '.webp');
  for (const avatar of avatarPaths) check(await exists(avatar), 'Missing demo avatar: ' + avatar);
  check(await exists('source/public/demo-data/nihongo-demo.sqlite'), 'Missing SQLite simulation fixture.');

  const result = {
    status: errors.length ? 'failed' : 'passed',
    scope: 'source content, fictional simulation fixtures, packaged D1 schema',
    pilots,
    simulation: {
      fictional: !!demo.meta?.fictional,
      learners: demo.learners?.length || 0,
      contentItems: demo.content?.length || 0,
      questionRecords: demo.questions?.length || 0,
      sampleAttempts: demo.attempts?.length || 0,
      scheduledReviews: demo.reviews?.length || 0
    },
    note: 'This verifies repository contracts only. It does not prove hosted D1, authentication, sync or live curriculum completeness.',
    errors
  };
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  if (errors.length) process.exitCode = 1;
}

main().catch(error => {
  console.error('Audit could not run:', error.message);
  process.exitCode = 1;
});
