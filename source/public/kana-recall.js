/* Recall Lab: separate opt-in Kana recognition practice. Browser-local, per learner. */
(function(){
  'use strict';
  const M=window.NPKanaRecallModel;
  if(!M)return;
  const t=(vi,en,ja)=>typeof I==='function'?I(vi,en,ja):vi;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storeKey=id=>'nihongo-kana-recall-local-v1:'+id;
  const groups=[
    ['hiragana','Hiragana · 46','Hiragana · 46','ひらがな · 46'],
    ['katakana','Katakana · 46','Katakana · 46','カタカナ · 46'],
    ['confusing','Dễ nhầm · Ha/Ma/Ra','Lookalikes · Ha/Ma/Ra','似た文字 · ハ/マ/ラ'],
    ['extended','Âm đục + âm ghép','Voiced + combined','濁音・拗音'],
    ['all','Trộn tất cả','All Kana mixed','すべて混合'],
    ['weak','Chữ cần ôn lại','Review weak Kana','苦手な文字']
  ];
  let dialog=null,profile='',history={},locked=false,warning='',run=null;
  const groupText=g=>{const x=groups.find(row=>row[0]===g);return x?t(x[1],x[2],x[3]):'';};
  function read(id){
    warning='';locked=false;
    try {
      const raw=localStorage.getItem(storeKey(id));
      if(!raw)return {};
      const stored=JSON.parse(raw);
      if(!stored||stored.schemaVersion!==1||!stored.history||typeof stored.history!=='object')throw new Error('schema');
      return M.cleanHistory(stored.history);
    }catch(_){
      locked=true;
      warning=t(
        'Không đọc được tiến độ ôn cục bộ. Chưa ghi đè dữ liệu cũ; phiên này chỉ giữ tạm trên màn hình.',
        'Could not read saved recall history. Existing data was not overwritten; this session is temporary.',
        '保存データを読み込めません。上書きせず、この回だけ一時的に保持します。'
      );
      return {};
    }
  }
  function write(){
    if(locked)return;
    try{
      localStorage.setItem(storeKey(profile),JSON.stringify({schemaVersion:1,history}));
    }catch(_){
      locked=true;
      warning=t(
        'Trình duyệt không cho phép lưu. Kết quả phiên này chưa được giữ lại trên thiết bị.',
        'Browser storage is unavailable. This session is not saved on the device.',
        '端末に保存できません。この回の記録は保持されません。'
      );
    }
  }
  function shell(body){
    return '<div class="npr-shell"><header class="npr-header"><div><span class="npr-eyebrow">FOUNDATION · RECALL LAB</span>'+
      '<h2 id="npr-title">'+t('Ôn nhận mặt Kana','Kana Recognition','かな識別トレーニング')+'</h2>'+
      '<p>'+t('Nhìn chữ → chọn cách đọc → xem phản hồi','See the Kana → choose its reading → get feedback','文字を見て読み方を選ぶ')+'</p></div>'+
      '<button type="button" class="npr-close" data-npr="close" aria-label="'+t('Đóng','Close','閉じる')+'">×</button></header>'+
      (warning?'<p class="npr-warning" role="alert">'+escape(warning)+'</p>':'')+body+
      '<footer class="npr-foot">'+t(
        'Mục tiêu phản xạ 3–5 giây · Không phải bài thi JLPT · Lưu trên trình duyệt này, không đồng bộ tài khoản.',
        '3–5 second recall goal · Not a JLPT test · Stored in this browser, not account-synced.',
        '目安は3〜5秒 · JLPT試験ではありません · 記録はこのブラウザ内のみ'
      )+'</footer></div>';
  }
  function home(){
    const s=M.stats(history);
    const tiles=groups.map(([g])=>{
      const available=M.pool(g,history).length;
      return '<button type="button" class="npr-deck" data-npr="start" data-group="'+g+'" '+
        (available?'':'disabled')+'><strong>'+escape(groupText(g))+'</strong>'+
        '<span>'+ (g==='weak'
          ?t(available+' chữ cần ôn',available+' due cards',available+'文字を復習')
          :t(available+' chữ · 12 câu/buổi',available+' cards · 12 per session',available+'文字 · 1回12問'))+
        '</span></button>';
    }).join('');
    return shell('<section class="npr-intro"><div class="npr-stats"><strong>'+s.attempted+'</strong><span>'+
      t('chữ đã thử nhận diện','Kana attempted','確認した文字')+'</span></div><div class="npr-stats"><strong>'+s.waiting+'</strong><span>'+
      t('chữ đang cần ôn','Kana due for review','要復習の文字')+'</span></div></section>'+
      '<h3 class="npr-section-title">'+t('Chọn bộ luyện','Choose a deck','練習するセット')+'</h3>'+
      '<div class="npr-decks">'+tiles+'</div>'+
      '<p class="npr-hint">'+t(
        'Câu sai hoặc đúng quá 5 giây sẽ được nhắc ôn lại. Chữ mới được chọn thêm để tránh chỉ luyện chữ quen.',
        'Wrong or slow answers return to review. Unseen Kana are mixed in for variety.',
        '間違えた文字や5秒を超えた文字は復習対象です。新しい文字も出題します。'
      )+'</p>');
  }
  function start(group){
    const cards=M.session(group,history);
    if(!cards.length){run=null;render();return;}
    run={group,cards,index:0,results:[],choice:null,feedback:null,options:[],startedAt:0};
    question();
  }
  function question(){
    if(!run)return;
    run.choice=null;run.feedback=null;
    const item=run.cards[run.index];
    run.options=M.options(item);
    run.startedAt=performance.now();
    render();
  }
  function quiz(){
    const c=run.cards[run.index],pos=run.index+1,length=run.cards.length;
    const feedback=run.feedback;
    const choices=run.options.map((o,i)=>{
      const status=feedback ? (o===c.romaji?' correct':o===run.choice&&!feedback.correct?' incorrect':'') : '';
      return '<button type="button" class="npr-option'+status+'" data-npr="answer" data-answer="'+escape(o)+'" '+
        (feedback?'disabled':'')+'><span>'+String(i+1)+'</span><strong>'+escape(o)+'</strong></button>';
    }).join('');
    const verdict=feedback?'<div class="npr-feedback '+(feedback.correct?'ok':'miss')+'" role="status" aria-live="polite"><strong>'+
      (feedback.quick?t('Nhớ nhanh!','Quick recall!','すばやく正解！'):feedback.correct
        ?t('Đúng rồi — tiếp tục luyện tốc độ','Correct — keep practising speed','正解！次は速さにも挑戦')
        :t('Chưa đúng — ghi nhớ rồi thử lại','Not yet — learn and retry','もう一度覚えてみよう'))+
      '</strong><span>'+t('Đáp án','Answer','答え')+': '+escape(c.romaji)+' · '+
        (feedback.elapsedMs/1000).toFixed(1)+'s</span></div>':'<p class="npr-prompt">'+
      t('Chọn cách đọc đúng. Không cần vội — mục tiêu là nhớ chắc.','Choose the correct reading. Accuracy first.','正しい読み方を選びましょう。')+'</p>';
    return shell('<div class="npr-quiz-top"><span>'+escape(groupText(run.group))+'</span><strong>'+pos+' / '+length+'</strong></div>'+
      '<div class="npr-progress"><span style="width:'+(pos-1)/length*100+'%"></span></div>'+
      '<section class="npr-question" aria-label="'+t('Chữ cần nhận diện','Kana to recognize','文字')+'">'+
      '<div class="npr-character" lang="ja">'+escape(c.char)+'</div>'+
      '<div class="npr-options" role="group" aria-label="'+t('Chọn âm đọc','Choose the reading','読み方を選択')+'">'+choices+'</div>'+
      verdict+'</section><div class="npr-actions">'+
      '<button type="button" class="npr-link" data-npr="home">'+t('Đổi bộ luyện','Change deck','セットを変更')+'</button>'+
      (feedback?'<button type="button" class="npr-next" data-npr="next">'+
        (pos===length?t('Xem kết quả','See results','結果を見る'):t('Chữ tiếp theo','Next Kana','次の文字'))+' →</button>':'')+
      '</div>');
  }
  function summary(){
    const r=run.results,correct=r.filter(x=>x.correct).length,fast=r.filter(x=>x.quick).length;
    return shell('<section class="npr-summary"><span class="npr-eyebrow">'+escape(groupText(run.group))+'</span>'+
      '<h3>'+t('Hoàn thành buổi ôn','Session complete','今回の練習が完了')+'</h3>'+
      '<div class="npr-summary-grid"><div><strong>'+correct+'/'+r.length+'</strong><span>'+
      t('Đọc đúng','Correct','正解')+'</span></div><div><strong>'+fast+'/'+r.length+'</strong><span>'+
      t('Đúng trong 5 giây','Correct in 5s','5秒以内の正解')+'</span></div></div>'+
      '<p>'+t(
        'Chữ chưa nhớ hoặc đọc chậm sẽ được đưa vào bộ cần ôn. Không có điểm thành thạo viết nét nào bị thay đổi.',
        'Wrong and slow Kana are scheduled for review. Writing practice records are not modified.',
        '間違えた文字と時間がかかった文字は復習対象になります。書き方の記録は変わりません。'
      )+'</p><div class="npr-actions"><button class="npr-link" type="button" data-npr="home">'+
      t('Chọn bộ khác','Choose another deck','他のセット')+'</button><button class="npr-next" type="button" data-npr="restart">'+
      t('Luyện thêm 12 câu','Practise 12 more','さらに12問')+' →</button></div></section>');
  }
  function render(){
    if(!dialog)return;
    dialog.innerHTML=run?(run.index<run.cards.length?quiz():summary()):home();
  }
  function open(){
    const parent=document.querySelector('.ks-studio');
    if(!parent)return;
    const id=parent.getAttribute('data-learner')||'demo';
    if(!dialog){
      dialog=document.createElement('dialog');
      dialog.className='npr-dialog';
      dialog.setAttribute('aria-labelledby','npr-title');
      document.body.appendChild(dialog);
      dialog.addEventListener('close',()=>{run=null;});
      dialog.addEventListener('click',event=>{
        if(event.target===dialog)dialog.close();
      });
    }
    profile=id;history=read(id);run=null;
    render();
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    dialog.querySelector('[data-npr="start"]:not([disabled])')?.focus();
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-npr]');
    if(!target)return;
    event.preventDefault();
    const action=target.dataset.npr;
    if(action==='open'){open();return;}
    if(!dialog?.open)return;
    if(action==='close'){dialog.close();return;}
    if(action==='home'){run=null;render();return;}
    if(action==='start'){start(target.dataset.group);return;}
    if(action==='restart'){start(run?.group||'all');return;}
    if(action==='answer'&&run&&!run.feedback){
      const item=run.cards[run.index],answer=target.dataset.answer;
      if(!run.options.includes(answer))return;
      const result=M.grade(history,item,answer,performance.now()-run.startedAt);
      history=result.history;write();
      run.choice=answer;run.feedback=result;run.results.push(result);
      render();dialog.querySelector('[data-npr="next"]')?.focus();return;
    }
    if(action==='next'&&run&&run.feedback){
      run.index++;
      if(run.index<run.cards.length)question();
      else render();
    }
  });
  window.NPKanaRecall={open,stats:()=>M.stats(history)};
})();
