import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'content/n5-introduction.v1.json'),'utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const first=clone(base);first.version=2;first.storyTitle='Ở lớp tiếng Nhật của cô Aoi.';first.storyIntro='Mai là du học sinh Việt Nam, đang học cùng cô Aoi. Đọc trước để nắm ý; chưa cần nhớ hết.';first.headline=['Một lời chào.','Một kết nối mới.'];first.lead='Giới thiệu bản thân cùng Mai và cô Aoi.';
const second=clone(first);second.id='n5-introduction-extension';second.title='Giới thiệu bản thân · Bản mở rộng';second.version=1;second.questions[0].explanation='';second.questions[0].answer='';
for(const content of [first,second]){content.engine='lesson/v1';content.template='self-introduction/v1';content.translationKey='lesson.'+content.id+'.v'+content.version;}
const data={schemaVersion:1,fictional:true,note:'Two sample editorial drafts. No reviewer approval or learner evidence is fabricated.',drafts:[
  {id:'sample-intro-v2',status:'draft',revision:0,baseVersion:1,content:first,updatedAt:null,review:{by:'',rights:'original',note:'',confirmed:false}},
  {id:'sample-intro-extension',status:'draft',revision:0,baseVersion:0,content:second,updatedAt:null,review:{by:'',rights:'original',note:'',confirmed:false}}
]};
const out=path.join(root,'public/admin-data');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'seed.json'),JSON.stringify(data,null,2)+'\n');fs.writeFileSync(path.join(out,'seed.js'),'/* Generated editorial samples; no approval or learner history. */\nwindow.NP_AUTHORING_SEED='+JSON.stringify(data)+';\n');
console.log('Authoring seed: two drafts, one intentionally missing answer/explanation.');
