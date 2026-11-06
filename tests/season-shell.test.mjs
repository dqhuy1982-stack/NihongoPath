import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const root=new URL('../source/public/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
const bridge=read('season-system.js');
const app=read('app.js');
const page=read('index.html');
const css=read('season-shell.css');

function harness(initial='spring'){
  const storage=new Map([['np-home-season-v1',initial]]);
  const classes=new Set();
  const images=[{src:'',getAttribute(k){return this[k]},setAttribute(k,v){this[k]=v}}];
  const activeLabels=[{innerHTML:'',attrs:{},setAttribute(k,v){this.attrs[k]=v}}];
  const optionButtons=['spring','summer','autumn','winter'].map(season=>({
    dataset:{innerSeasonOption:season}, attrs:{},caption:{textContent:''},
    setAttribute(k,v){this.attrs[k]=v},querySelector(k){return k==='span'?this.caption:null}
  }));
  const document={
    documentElement:{dataset:{}},
    body:{dataset:{},classList:{toggle(k,v){if(v)classes.add(k);else classes.delete(k)}}},
    querySelectorAll(k){
      return k==='[data-season-mark]'?images:
        k==='[data-inner-season-name]'?[]:
        k==='[data-inner-season-toggle]'?activeLabels:
        k==='[data-inner-season-option]'?optionButtons:[];
    },
    addEventListener(){}
  };
  const window={
    Locale:{code:'vi'},
    addEventListener(){}
  };
  const localStorage={
    getItem(k){return storage.get(k)||null},
    setItem(k,v){storage.set(k,v)}
  };
  vm.runInNewContext(bridge,{window,document,localStorage});
  return {window,document,storage,classes,images,activeLabels,optionButtons};
}

test('One persisted season survives Home -> PIN -> Dashboard -> lesson -> Home',()=>{
 const h=harness('spring');
 assert.equal(h.window.NPSeason.current(),'spring');
 h.window.NPSeason.apply('today');
 assert.equal(h.document.body.dataset.season,'spring');
 assert.ok(h.classes.has('np-season-shell'));
 assert.ok(h.images[0].src.includes('horizon-mark-spring.svg'));
 h.window.NPSeason.set('winter');
 assert.equal(h.storage.get('np-home-season-v1'),'winter');
 assert.equal(h.document.documentElement.dataset.season,'winter');
 assert.ok(h.images[0].src.includes('horizon-mark-winter.svg'));
 assert.equal(h.activeLabels[0].attrs['aria-label'],'Đổi mùa · Đông');
 assert.equal(h.optionButtons[3].attrs['aria-pressed'],'true');
 assert.equal(h.optionButtons[0].attrs['aria-pressed'],'false');
 h.window.NPSeason.apply('lesson');
 assert.equal(h.document.body.dataset.season,'winter');
 h.window.NPSeason.apply('login');
 assert.equal(h.document.body.dataset.season,'winter');
 assert.ok(!h.classes.has('np-season-shell'));
 assert.equal(h.window.NPSeason.current(),'winter');
});

test('Inner season selector is accessible and localized in Vietnamese, English and Japanese',()=>{
 const h=harness('autumn');
 const {NPSeason}=h.window;
 for(const [locale,label] of [['vi','Thu'],['en','Autumn'],['ja','秋']]){
  h.window.Locale.code=locale;
  NPSeason.sync();
  assert.equal(NPSeason.label(),label);
  const html=NPSeason.controls();
  assert.ok(html.includes('class="np-inner-seasons"'));
  assert.ok(html.includes('data-inner-season-toggle'));
  assert.equal((html.match(/data-inner-season-option=/g)||[]).length,4);
  assert.ok(html.includes('aria-pressed="true"'));
  assert.ok(html.includes('min-height')===false,'geometry belongs to CSS');
  assert.ok(html.includes(label));
 }
});

test('Route render sets shared season before constructing shell; login and lesson share symbol',()=>{
 assert.ok(page.indexOf('src="season-system.js?v=12"')<page.indexOf('src="login-ui.js?v=10"'));
 assert.ok(page.indexOf('href="season-shell.css?v=12"')>page.indexOf('href="home-v11.css?v=11"'));
 assert.ok(app.includes('window.NPSeason?.apply(route().split(\'/\')[0])'));
 assert.ok(app.includes('window.NPSeason?.controls()'));
 assert.ok(app.includes('window.NPSeason?.mark()'));
 assert.ok(app.includes('data-season-mark'));
 assert.ok(app.includes('window.NPSeason?.sync();applyDevice()'));
 assert.ok(app.includes("window.NPFamilyAccess.open(id,b)"));
 assert.ok(app.includes('window.NPFamilyAccess.unlock'));
});

test('Four seasonal palettes are applied to navigation, dashboard, studying and mobile',()=>{
 assert.ok(css.includes('body.np-season-shell[data-season="summer"]'));
 assert.ok(css.includes('body.np-season-shell[data-season="autumn"]'));
 assert.ok(css.includes('body.np-season-shell[data-season="winter"]'));
 for(const s of ['summer','autumn','winter'])
  assert.ok(css.includes('body.dark.np-season-shell[data-season="'+s+'"]'));
 for(const v of ['--bg:','--surface:','--paper:','--text:','--line:','--navy:','--sage:','--season-ink:','--season-nav:','--season-nav-active:']){
  assert.ok(css.includes(v),v);
 }
 assert.ok(css.includes('.sidebar .navlink.active'));
 assert.ok(css.includes('.topbar .language-switch'));
 assert.ok(css.includes('.topbar .profile-button'));
 assert.ok(css.includes('.pagehead .eyebrow'));
 assert.ok(css.includes('.bottomnav a.active'));
 assert.ok(css.includes('.card,'));
 assert.ok(css.includes('.ks-toolbar'));
 assert.ok(css.includes('.np-inner-season-options'));
 assert.ok(css.includes('@media(max-width:760px)'));
 assert.ok(css.includes('@media(max-width:380px)'));
 assert.ok(css.includes('prefers-reduced-motion:reduce'));
});

test('Correct/wrong feedback and profile learning records do not become seasonal content',()=>{
 assert.ok(css.includes('--learning-success:#397454'));
 assert.ok(css.includes('--learning-warn:#a04c42'));
 assert.ok(css.includes('.n5-option.correct'));
 assert.ok(css.includes('.n5-option.incorrect'));
 assert.ok(css.includes('.n5-feedback.bad'));
 assert.ok(!bridge.includes('db.profiles'));
 assert.ok(!bridge.includes('NPLessonUI.clear'));
 assert.ok(!bridge.includes('NPFamilyAccess.resetPin'));
 assert.ok(bridge.includes("const KEY='np-home-season-v1'"));
});
