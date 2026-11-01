"""Build the fictional design-review dataset and a real, portable SQLite fixture.

Run: python scripts/build-demo.py. No personal data, network or production writes.
"""
import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'demo-data'
OUT.mkdir(parents=True, exist_ok=True)
NOW = datetime.fromisoformat('2026-11-01T09:00:00+09:00')


def at(days=0, minutes=0):
    return (NOW + timedelta(days=days, minutes=minutes)).isoformat()


def tr(vi, en, ja):
    return [vi, en, ja]


# These are authored samples for reviewing behavior, not official JLPT questions.
# question: prompt, Japanese stimulus, options, correct index, explanation, skill.
BANK = {
    'foundation': [
        ('Chữ này đọc thế nào?', 'ま', ['ma', 'ha', 'na'], 0, 'ま đọc là ma. So với は (ha), hãy chú ý hình dáng phần cuối rồi thử nhận diện lại khi không có gợi ý.', 'kana-recognition'),
        ('Chọn Katakana của âm ra.', 'ra', ['ラ', 'ロ', 'ワ'], 0, 'ラ là ra; ロ là ro; ワ là wa. Đừng chỉ học đúng thứ tự bảng chữ: cần nhận diện khi các chữ bị xáo trộn.', 'kana-recognition'),
        ('Chọn cách đọc đúng của âm ghép.', 'きゃ', ['kiya', 'kya', 'ka'], 1, 'ゃ nhỏ kết hợp với き thành một nhịp kya. きや với や lớn được đọc thành ki-ya.', 'kana-yoon'),
    ],
    'N5': [
        ('Mai tự giới thiệu điều gì?', 'はじめまして。マイです。ベトナムから来ました。', ['Mai đến từ Việt Nam.', 'Mai sắp đi Việt Nam.', 'Mai là giáo viên.'], 0, 'ベトナムから来ました nghĩa là đã đến từ Việt Nam. から chỉ nơi xuất phát. Câu không nói nghề nghiệp của Mai.', 'self-introduction'),
        ('は trong câu này đọc thế nào?', 'わたしは学生です。', ['ha', 'wa', 'ba'], 1, 'Khi làm trợ từ nêu chủ đề, は được đọc là wa. Không áp dụng cách đọc này cho mọi chữ は trong từ vựng.', 'particle-wa'),
        ('Chọn câu hỏi lịch sự tương ứng.', 'Bạn là học sinh/sinh viên phải không?', ['学生ですか。', '学生でした。', '学生ではありません。'], 0, 'ですか tạo câu hỏi lịch sự. でした là quá khứ; ではありません là phủ định. 学生 bao gồm học sinh/sinh viên tùy bối cảnh.', 'copula-question'),
    ],
    'N4': [
        ('Yuki đang đề nghị điều gì?', 'すみません。明日、早く帰ってもいいですか。', ['Xin phép về sớm ngày mai.', 'Yêu cầu người khác về sớm.', 'Nói rằng hôm qua đã về sớm.'], 0, 'Vて + もいいですか dùng để xin phép. 明日 là ngày mai. Đây là câu hỏi, không phải thông báo đã được đồng ý.', 'permission'),
        ('Chọn lời nhờ lịch sự.', 'Vui lòng đợi ở đây.', ['ここで待ってください。', 'ここで待ちました。', 'ここで待ちませんでした。'], 0, 'Vてください dùng để nhờ/yêu cầu. 待ちました chỉ việc đã đợi; 待ちませんでした là đã không đợi.', 'te-request'),
        ('Người nói đang làm gì?', '今、日本語を勉強しています。', ['Đang học tiếng Nhật.', 'Chưa từng học tiếng Nhật.', 'Ngày mai mới học tiếng Nhật.'], 0, 'Vています trong câu này diễn tả việc đang diễn ra. 今 làm rõ thời điểm hiện tại; không nên dịch mọi trường hợp ています thành “đang”.', 'te-iru'),
    ],
    'N3': [
        ('Tờ giấy ở đây vì sao?', '会議の予定は、入口に貼ってあります。', ['Có người đã dán để mọi người xem.', 'Tờ giấy tự bay đến.', 'Cuộc họp bị hủy.'], 0, '貼ってあります diễn tả trạng thái kết quả của hành động có chủ ý. Câu không nói cuộc họp bị hủy. So sánh với 貼っています khi tập trung vào hành động hoặc chủ thể.', 'te-aru'),
        ('Điều gì được khuyên làm khi còn thời gian?', '時間があるうちに、資料を確認しておきましょう。', ['Kiểm tra tài liệu trước khi hết thời gian.', 'Đợi hết thời gian mới kiểm tra.', 'Không cần kiểm tra tài liệu.'], 0, '〜うちに nhấn mạnh làm trong khi điều kiện còn tồn tại; 〜ておく chỉ chuẩn bị trước. “Còn thời gian” không có nghĩa là được trì hoãn vô hạn.', 'uchi-ni'),
        ('Chọn ý phù hợp.', '忘れないように、メモしておきます。', ['Ghi lại để không quên.', 'Ghi lại vì đã quên hết.', 'Không ghi vì không thể quên.'], 0, '〜ないように nêu mục đích tránh một việc. メモしておきます là ghi trước để chuẩn bị. Không có kết luận người nói chắc chắn sẽ nhớ.', 'you-ni'),
    ],
    'N2': [
        ('Điều kiện được nêu là gì?', 'このサービスは、契約が有効である限り利用できます。', ['Có thể dùng trong thời gian hợp đồng còn hiệu lực.', 'Có thể dùng mãi dù hợp đồng kết thúc.', 'Chỉ được dùng một lần.'], 0, '〜限り ở đây đặt điều kiện duy trì: chừng nào hợp đồng còn hiệu lực. Không bỏ phần điều kiện để kết luận dịch vụ dùng vĩnh viễn.', 'conditional-scope'),
        ('Phạm vi của thông báo gồm ai?', 'この研修は、新入社員に限らず、希望する社員も参加できます。', ['Không chỉ nhân viên mới, nhân viên có nguyện vọng cũng tham gia được.', 'Chỉ nhân viên mới.', 'Tất cả nhân viên bắt buộc tham gia.'], 0, '〜に限らず mở rộng phạm vi “không chỉ”. 参加できます nói khả năng/quyền tham gia, không phải nghĩa vụ tham gia.', 'scope-expansion'),
        ('Người nói phủ nhận điều gì?', '経験が長ければ、必ず上手に教えられるとは限りません。', ['Kinh nghiệm lâu không bảo đảm luôn dạy tốt.', 'Mọi người có kinh nghiệm đều dạy kém.', 'Không ai có thể dạy tốt.'], 0, '〜とは限らない bác bỏ tính tuyệt đối, không đảo thành “tất cả đều không”. 必ず là dấu hiệu cần đọc kỹ phạm vi phủ định.', 'partial-negation'),
    ],
    'N1': [
        ('Kết luận phụ thuộc vào đâu?', '実施するかどうかは、調査の結果いかんによります。', ['Tùy kết quả khảo sát.', 'Đã quyết định chắc chắn thực hiện.', 'Không cần xem kết quả khảo sát.'], 0, '〜いかんによる nghĩa là tùy thuộc vào. 実施するかどうか vẫn là vấn đề chưa được quyết định; không suy diễn thành phê duyệt thực hiện.', 'argument-condition'),
        ('Sắc thái của câu là gì?', '彼は十年目にして、ようやく目標を達成した。', ['Mãi đến năm thứ mười mới đạt mục tiêu.', 'Năm nào cũng đạt cùng mục tiêu.', 'Chưa từng đạt mục tiêu.'], 0, '〜にして kết hợp với ようやく nhấn mạnh đến mốc đó mới đạt. Không hiểu 十年目 thành số lần thực hiện.', 'milestone-expression'),
        ('Ý của người nói là gì?', 'その点は、改めて説明するまでもありません。', ['Điều đó rõ đến mức không cần giải thích lại.', 'Tuyệt đối cấm mọi người giải thích.', 'Không ai biết cách giải thích.'], 0, '〜までもない diễn tả chưa cần đến mức làm một việc vì không cần thiết. Đây không phải lệnh cấm và cũng không nói về thiếu khả năng.', 'argument-necessity'),
    ],
}

titles = {
    'foundation': tr('Nhận mặt chữ, từng chút một', 'Kana, one small step', '文字を少しずつ'),
    'N5': tr('Lần đầu gặp nhau', 'A first introduction', '初めての自己紹介'),
    'N4': tr('Một lời xin phép rõ ràng', 'A clear request', '許可を求める'),
    'N3': tr('Đọc đúng điều đã chuẩn bị', 'Read the prepared state', '準備された状態を読む'),
    'N2': tr('Đừng bỏ qua điều kiện', 'Keep the condition in view', '条件を読み落とさない'),
    'N1': tr('Kết luận trong đúng giới hạn', 'Conclusions within scope', '結論の範囲を読む'),
}
cast = {'foundation': ['aoi'], 'N5': ['mai', 'aoi'], 'N4': ['mai', 'yuki'], 'N3': ['misaki', 'kenta'], 'N2': ['mei', 'arun'], 'N1': ['emma', 'sophie']}
content, questions = [], []
for level, rows in BANK.items():
    for kind, minutes in [('lesson', 6), ('review', 3), ('practice', 8)]:
        cid = f'{level.lower()}-{kind}'
        qids = []
        for i, (prompt, text, options, answer, why, skill) in enumerate(rows):
            # Rotate options, preserving the correct answer rather than memorizing A.
            shift = (i + {'lesson': 0, 'review': 1, 'practice': 2}[kind]) % 3
            opts = options[shift:] + options[:shift]
            qid = f'{cid}-q{i+1}'
            qids.append(qid)
            questions.append(dict(id=qid, contentId=cid, version=1, contentVersion=1, level=level, skill=skill,
                                  prompt=prompt, text=text, options=opts, answer=(answer-shift) % 3,
                                  explanation=why, reading={'学生': 'がくせい', '日本語': 'にほんご'}))
        content.append(dict(id=cid, version=1, moduleId='learning' if kind=='lesson' else 'review' if kind=='review' else 'exams',
                            level=level, kind=kind, title=titles[level], minutes=minutes,
                            status='demo', requirements={'audio': False, 'speech': False, 'writing': False},
                            questionIds=qids, characterIds=cast[level], explanationLocale='vi',
                            requiredSkillIds=list(dict.fromkeys([row[-1] for row in rows]+(['kana-recognition'] if level=='N5' else []))),
                            source='authored-demo', prerequisiteIds=[] if level=='foundation' else ['foundation-lesson']))

# The complete N5 pilot uses its own state machine; include its versioned content
# in the same handoff database without mixing it into the older 3-question simulator.
pilot = json.loads((ROOT / 'content' / 'n5-introduction.v1.json').read_text())
pilot_qids = [pilot['id'] + ':' + q['id'] for q in pilot['questions']]
content.append(dict(id=pilot['id'],version=pilot['version'],moduleId='learning',level='N5',kind='lesson',
                    title=tr(pilot['title'],'Introducing yourself','自己紹介'),minutes=15,status='pilot',
                    engine='lesson/v1',route='lesson',questionIds=pilot_qids,definition=pilot,
                    characterIds=['mai','aoi'],requirements={'audio':False,'speech':False,'writing':False},
                    source='authored-demo',requiredSkillIds=['identity','topic-wa','sentence-order','polite-question','origin']))
for q in pilot['questions']:
    questions.append(dict(q,id=pilot['id']+':'+q['id'],contentId=pilot['id'],contentVersion=pilot['version'],
                          version=1,skill=q['conceptId'],level='N5',source='authored-pilot'))

learners = [
    dict(id='demo-linh', name='Linh', ageBand='child', target='foundation', minutes=5, completed=0, lastStudyAt=None, focus='kana-recognition', managed=True),
    dict(id='demo-minh', name='Minh', ageBand='adult', target='N5', minutes=15, completed=7, lastStudyAt=at(-1), focus='kana-recognition', managed=False),
    dict(id='demo-bao', name='Bảo', ageBand='child', target='N4', minutes=10, completed=12, lastStudyAt=at(-6), focus='permission', managed=True),
    dict(id='demo-an', name='An', ageBand='teen', target='N3', minutes=15, completed=21, lastStudyAt=at(-1), focus='te-aru', managed=False),
    dict(id='demo-trang', name='Trang', ageBand='adult', target='N2', minutes=30, completed=36, lastStudyAt=at(-1), focus='conditional-scope', managed=False),
    dict(id='demo-quan', name='Quân', ageBand='adult', target='N1', minutes=30, completed=45, lastStudyAt=at(-1), focus='argument-condition', managed=False),
]
for l in learners:
    l.update(familyId='demo-family', locale='vi', assessedLevel=None, timezone='Asia/Tokyo', fictional=True, studyPriority='adaptive')

attempts, reviews, sessions, goals = [], [], [], []
for li, l in enumerate(learners):
    goals.append(dict(id='goal-'+l['id'], learnerId=l['id'], target=l['target'], chosenAt=at(-30), source='self-selected'))
    if li == 0:
        continue
    own = [q for q in questions if q['contentId'] == l['target'].lower()+'-review']
    # Per-question historical attempts retain their source version and evidence.
    for cycle in range(3):
        for qi, q in enumerate(own):
            correct = qi != 0
            attempts.append(dict(id=f'history-{li}-{cycle}-{qi}', learnerId=l['id'], questionId=q['id'], contentVersion=1,
                                 selected=q['answer'] if correct else (q['answer']+1) % 3, correct=correct, hintUsed=False,
                                 responseMs=4800 if correct else 9200, at=at(-10+cycle*2), source='synthetic-history', sessionId=None))
    if l['id']=='demo-minh':
        for i in range(4):
            q = next(q for q in questions if q['id']=='foundation-review-q1')
            attempts.append(dict(id=f'kana-slow-{i}', learnerId=l['id'], questionId=q['id'], contentVersion=1,
                                 selected=q['answer'], correct=True, hintUsed=False, responseMs=8100+i*700,
                                 at=at(-7+i), source='synthetic-history', sessionId=None))
    for qi, q in enumerate(own):
        reviews.append(dict(id='review-'+l['id']+'-'+str(qi), learnerId=l['id'], questionId=q['id'], dueAt=at(-qi-1), intervalDays=1, lapses=3 if qi==0 else 0))
    if l['id']=='demo-minh':
        reviews.append(dict(id='review-minh-kana', learnerId=l['id'], questionId='foundation-review-q1', dueAt=at(-1), intervalDays=1, lapses=0))
    if l['id'] in ['demo-minh', 'demo-trang', 'demo-quan']:
        cid=l['target'].lower()+'-lesson'
        ids=next(c['questionIds'] for c in content if c['id']==cid)
        q=next(q for q in questions if q['id']==ids[0])
        sid='draft-'+l['id']
        aid='draft-answer-'+l['id']
        attempts.append(dict(id=aid, learnerId=l['id'], questionId=q['id'], contentVersion=1, selected=q['answer'], correct=True,
                             hintUsed=False, responseMs=5400, at=at(-1), source='synthetic-history', sessionId=sid))
        sessions.append(dict(id=sid, learnerId=l['id'], contentId=cid, contentVersion=1, questionIds=ids, index=1,
                             phase='question', status='paused', checkedAttemptIds=[aid], selected=None, hintUsed=False,
                             startedAt=at(-1), updatedAt=at(-1), completedAt=None))

scenarios = [
    ('first-step','demo-linh','Bắt đầu từ số 0','Không có lịch sử học. Một phiên đầu ngắn, không dựng điểm số giả.',5,'desk',False),
    ('commute','demo-minh','5 phút trên tàu','Có bài N5 đang dở, mục ôn đến hạn và chữ Kana nhận diện còn chậm.',5,'train',False),
    ('office','demo-an','Giờ nghỉ ở công ty','15 phút yên lặng; cùng một điểm ngữ pháp đã sai ở nhiều lượt.',15,'office',False),
    ('desk','demo-trang','30 phút tại bàn học','Tiếp tục phần đọc N2, ôn điều kiện và luyện một bộ ngắn.',30,'desk',True),
    ('return','demo-bao','Trở lại sau 6 ngày','Khởi động lại nhẹ nhàng, không ép học bù hoặc tạo cảm giác mắc nợ.',5,'desk',False),
    ('advanced','demo-quan','N1 · đọc kỹ giới hạn','Đang dở bài đọc; có lỗi lặp lại về điều kiện của kết luận.',15,'desk',True),
    ('no-audio','demo-trang','Có tai nghe, chưa có audio','Kiểm tra fallback khi module nghe chưa phát hành: vẫn có bài đọc phù hợp.',15,'train',True),
    ('short-break','demo-minh','Đổi kế hoạch giữa ngày','Cùng hồ sơ N5 nhưng có 15 phút ở công ty; kế hoạch khác phiên trên tàu.',15,'office',False),
]
scenarios=[dict(id=i,learnerId=l,title=t,description=d,context={'minutes':m,'place':p,'headphones':h,'speech':False},requestedModule='listening' if i=='no-audio' else None) for i,l,t,d,m,p,h in scenarios]
rules=[
    dict(id='priority-adaptive',priority=1,trigger='learner preference = adaptive (default)',action='resume by default; review first only when recorded errors block the pending activity'),
    dict(id='priority-resume',priority=1,trigger='learner preference = resume',action='continue the pending activity before ordinary review; keep the review queue'),
    dict(id='priority-review',priority=1,trigger='learner preference = review',action='select a small due-review segment first; resume afterward if time permits'),
    dict(id='blocking-error',priority=25,trigger='repeated-error or slow-recall skill appears in requiredSkillIds of the pending activity',action='review that prerequisite briefly, then return to the saved activity'),
    dict(id='return-gently', priority=10, trigger='days_since_last_study >= 4', action='review at most 3 items, then offer a short lesson; no catch-up debt'),
    dict(id='new-learner', priority=20, trigger='no attempts and no completed learning', action='start with foundation; no inferred proficiency'),
    dict(id='repeated-error', priority=30, trigger='same skill incorrect at least 3 times in recorded attempts', action='review the relevant skill before adding new material'),
    dict(id='slow-recall', priority=35, trigger='at least 3 correct unassisted kana responses slower than 5 seconds', action='offer retrieval practice; never label a diagnosis'),
    dict(id='resume', priority=40, trigger='unfinished session for this learner', action='continue at the saved question ID and content version'),
    dict(id='due-review', priority=50, trigger='dueAt <= simulated asOf', action='limit items to available minutes, show remaining without pressure'),
    dict(id='environment', priority=5, trigger='train or office', action='only silent, no writing required; never autoplay'),
    dict(id='availability', priority=0, trigger='module not available or missing required media', action='exclude from mandatory plan, explain fallback'),
]
modules=[
    dict(id='learning',title='Bài học',status='demo',provider='local-fixture',eventContract='learning-event/v1'),
    dict(id='review',title='Ôn tập',status='demo',provider='local-fixture',eventContract='learning-event/v1'),
    dict(id='exams',title='Luyện đề',status='demo',provider='local-fixture',eventContract='learning-event/v1'),
    dict(id='listening',title='Luyện nghe',status='planned',provider=None,eventContract='learning-event/v1'),
    dict(id='external-ai',title='API trợ lí',status='planned',provider=None,eventContract='advice/v1'),
]
for r in attempts + reviews:
    r['questionVersion'] = 1
    r.setdefault('contentVersion', 1)
    r['contentId'] = next(q['contentId'] for q in questions if q['id'] == r['questionId'])
authoring = json.loads((ROOT / 'public' / 'admin-data' / 'seed.json').read_text())

data=dict(meta={'schemaVersion':1,'databaseSchemaVersion':2,'seedVersion':'atelier-09.1','asOf':NOW.isoformat(),'fictional':True,'locale':'vi','note':'Design simulation only; not a validated curriculum or adaptive assessment.'},
          families=[{'id':'demo-family','name':'Gia đình mẫu','fictional':True}],learners=learners,goals=goals,
          modules=modules,content=content,questions=questions,attempts=attempts,reviews=reviews,sessions=sessions,scenarios=scenarios,rules=rules,authoring=authoring)
(OUT/'seed.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
(OUT/'seed.js').write_text('/* Generated by scripts/build-demo.py; fictional data only. */\nwindow.NP_DEMO_SEED = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')

schema='''-- Nihongo Path / disposable design fixture / schema v2
PRAGMA foreign_keys = ON;
CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE families (id TEXT PRIMARY KEY, name TEXT NOT NULL, fictional INTEGER NOT NULL CHECK(fictional=1));
CREATE TABLE learners (id TEXT PRIMARY KEY, family_id TEXT NOT NULL REFERENCES families(id), name TEXT NOT NULL, target TEXT NOT NULL, age_band TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)));
CREATE TABLE goals (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id), target TEXT NOT NULL, chosen_at TEXT NOT NULL, source TEXT NOT NULL);
CREATE TABLE modules (id TEXT PRIMARY KEY, status TEXT NOT NULL CHECK(status IN ('demo','planned')), payload TEXT NOT NULL CHECK(json_valid(payload)));
CREATE TABLE content (id TEXT NOT NULL, version INTEGER NOT NULL, module_id TEXT NOT NULL REFERENCES modules(id), level TEXT NOT NULL, kind TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), PRIMARY KEY(id,version));
CREATE TABLE questions (id TEXT NOT NULL, content_id TEXT NOT NULL, content_version INTEGER NOT NULL, version INTEGER NOT NULL, skill TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), PRIMARY KEY(id,version,content_version,content_id), FOREIGN KEY(content_id,content_version) REFERENCES content(id,version));
CREATE TABLE sessions (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id), content_id TEXT NOT NULL, content_version INTEGER NOT NULL, status TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), UNIQUE(id,learner_id,content_id,content_version), FOREIGN KEY(content_id,content_version) REFERENCES content(id,version));
CREATE TABLE attempts (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id), question_id TEXT NOT NULL, question_version INTEGER NOT NULL, content_id TEXT NOT NULL, session_id TEXT, content_version INTEGER NOT NULL, correct INTEGER NOT NULL CHECK(correct IN(0,1)), at TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), FOREIGN KEY(session_id,learner_id,content_id,content_version) REFERENCES sessions(id,learner_id,content_id,content_version), FOREIGN KEY(question_id,question_version,content_version,content_id) REFERENCES questions(id,version,content_version,content_id));
CREATE TABLE reviews (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id), question_id TEXT NOT NULL, question_version INTEGER NOT NULL, content_id TEXT NOT NULL, content_version INTEGER NOT NULL, due_at TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), FOREIGN KEY(question_id,question_version,content_version,content_id) REFERENCES questions(id,version,content_version,content_id));
CREATE TABLE scenarios (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL REFERENCES learners(id), payload TEXT NOT NULL CHECK(json_valid(payload)));
CREATE TABLE rules (id TEXT PRIMARY KEY, priority INTEGER NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)));
CREATE TABLE content_drafts (id TEXT PRIMARY KEY, content_id TEXT NOT NULL, base_version INTEGER, target_version INTEGER NOT NULL, revision INTEGER NOT NULL, status TEXT NOT NULL CHECK(status IN ('draft','published')), payload TEXT NOT NULL CHECK(json_valid(payload)), FOREIGN KEY(content_id,base_version) REFERENCES content(id,version));
CREATE TABLE content_releases (content_id TEXT NOT NULL, version INTEGER NOT NULL, source TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)), PRIMARY KEY(content_id,version), FOREIGN KEY(content_id,version) REFERENCES content(id,version));
CREATE TABLE content_editor_events (id TEXT PRIMARY KEY, draft_id TEXT REFERENCES content_drafts(id), type TEXT NOT NULL, at TEXT NOT NULL, payload TEXT NOT NULL CHECK(json_valid(payload)));
CREATE TRIGGER content_no_update BEFORE UPDATE ON content BEGIN SELECT RAISE(ABORT,'Content versions are immutable'); END;
CREATE TRIGGER content_no_delete BEFORE DELETE ON content BEGIN SELECT RAISE(ABORT,'Content versions are immutable'); END;
CREATE TRIGGER questions_no_update BEFORE UPDATE ON questions BEGIN SELECT RAISE(ABORT,'Question versions are immutable'); END;
CREATE TRIGGER questions_no_delete BEFORE DELETE ON questions BEGIN SELECT RAISE(ABORT,'Question versions are immutable'); END;
CREATE TRIGGER releases_no_update BEFORE UPDATE ON content_releases BEGIN SELECT RAISE(ABORT,'Content releases are immutable'); END;
CREATE TRIGGER releases_no_delete BEFORE DELETE ON content_releases BEGIN SELECT RAISE(ABORT,'Content releases are immutable'); END;
CREATE TRIGGER attempts_no_update BEFORE UPDATE ON attempts BEGIN SELECT RAISE(ABORT,'Recorded answers are immutable'); END;
CREATE INDEX attempts_learner_time ON attempts(learner_id, at);
CREATE INDEX reviews_learner_due ON reviews(learner_id, due_at);
CREATE INDEX sessions_learner_status ON sessions(learner_id, status);
'''
(OUT/'schema.sql').write_text(schema)
dbfile=OUT/'nihongo-demo.sqlite'
if dbfile.exists():
    dbfile.unlink()  # generated fixture only; never a runtime database
db=sqlite3.connect(dbfile)
db.executescript(schema)
dump=lambda r:json.dumps(r,ensure_ascii=False,separators=(',',':'))
db.executemany('INSERT INTO metadata VALUES (?,?)',[(k,dump(v)) for k,v in data['meta'].items()])
db.executemany('INSERT INTO families VALUES (?,?,?)',[(r['id'],r['name'],1) for r in data['families']])
db.executemany('INSERT INTO learners VALUES (?,?,?,?,?,?)',[(r['id'],r['familyId'],r['name'],r['target'],r['ageBand'],dump(r)) for r in learners])
db.executemany('INSERT INTO goals VALUES (?,?,?,?,?)',[(r['id'],r['learnerId'],r['target'],r['chosenAt'],r['source']) for r in goals])
db.executemany('INSERT INTO modules VALUES (?,?,?)',[(r['id'],r['status'],dump(r)) for r in modules])
db.executemany('INSERT INTO content VALUES (?,?,?,?,?,?)',[(r['id'],r['version'],r['moduleId'],r['level'],r['kind'],dump(r)) for r in content])
db.executemany('INSERT INTO questions VALUES (?,?,?,?,?,?)',[(r['id'],r['contentId'],r['contentVersion'],r['version'],r['skill'],dump(r)) for r in questions])
db.executemany('INSERT INTO sessions VALUES (?,?,?,?,?,?)',[(r['id'],r['learnerId'],r['contentId'],r['contentVersion'],r['status'],dump(r)) for r in sessions])
db.executemany('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?,?,?)',[(r['id'],r['learnerId'],r['questionId'],r['questionVersion'],r['contentId'],r['sessionId'],r['contentVersion'],int(r['correct']),r['at'],dump(r)) for r in attempts])
db.executemany('INSERT INTO reviews VALUES (?,?,?,?,?,?,?,?)',[(r['id'],r['learnerId'],r['questionId'],r['questionVersion'],r['contentId'],r['contentVersion'],r['dueAt'],dump(r)) for r in reviews])
db.executemany('INSERT INTO scenarios VALUES (?,?,?)',[(r['id'],r['learnerId'],dump(r)) for r in scenarios])
db.executemany('INSERT INTO rules VALUES (?,?,?)',[(r['id'],r['priority'],dump(r)) for r in rules])
db.executemany('INSERT INTO content_drafts VALUES (?,?,?,?,?,?,?)',[(d['id'],d['content']['id'],d['baseVersion'] or None,d['content']['version'],d['revision'],d['status'],dump(d)) for d in authoring['drafts']])
db.execute('INSERT INTO content_releases VALUES (?,?,?,?)',(pilot['id'],pilot['version'],'bundled-sample',dump({'contentId':pilot['id'],'version':pilot['version'],'review':None,'source':'bundled-sample'})))
assert not db.execute('PRAGMA foreign_key_check').fetchall()
assert db.execute('PRAGMA integrity_check').fetchone()[0]=='ok'
db.commit()
db.close()
print(json.dumps({'learners':len(learners),'scenarios':len(scenarios),'activities':len(content),'questions':len(questions),'historicalAnswers':len(attempts),'reviewItems':len(reviews),'sqlite':str(dbfile)}))
