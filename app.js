// ============================================================
// 設定：Supabaseの値に書き換えてください
// ============================================================
const SUPABASE_URL = 'https://wvhwxpookqktbzfofxcy.supabase.co';       // 例: https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aHd4cG9va3FrdGJ6Zm9meGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNzM4ODAsImV4cCI6MjA5NjY0OTg4MH0.wzKen3asNkQ0zttVvUnpzmJZRUjTf7fzHBd3Go23ptE'; // anon publicキー
const ADMIN_PASSWORD = 'Shitan21@';             // 管理者パスワード（任意で変更）

// ============================================================
// Supabase初期化
// ============================================================
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================
// 診断データ定義
// ============================================================
const SCATS = [
  { id: 'asset',  name: '資産管理',     icon: '🖥️' },
  { id: 'sec',    name: 'セキュリティ', icon: '🛡️' },
  { id: 'backup', name: 'バックアップ', icon: '☁️' },
  { id: 'lic',    name: 'ライセンス',   icon: '📄' },
  { id: 'dx',     name: '書類・DX',     icon: '📂' },
];

const SQS = [
  { cat:'asset', q:'PC・スマートフォン・タブレットなど社内のIT機器を一覧で把握できていますか？', hint:'台数・型番・担当者の割り当てが管理されているかどうかが目安です。', opts:['台帳やシステムで管理できている','Excelで管理しているが古いかもしれない','担当者の記憶頼みになっている','特に管理していない'], sc:[3,2,1,0] },
  { cat:'asset', q:'退職者のアカウント（メール・各種クラウドサービス）は速やかに削除・無効化できていますか？', opts:['手順が決まっており速やかに対応できる','都度対応しているが漏れが心配','対応が遅れることがある','管理できていない'], sc:[3,2,1,0] },
  { cat:'asset', q:'社員が使うPCのOSやアプリは定期的にアップデートされていますか？', opts:['自動更新などで常に最新化できている','ある程度対応している','バラバラで把握できていない','ほとんど更新していない'], sc:[3,2,1,0] },
  { cat:'asset', q:'会社のWi-Fiルーターやネットワーク機器は把握・管理できていますか？', opts:['機器一覧があり管理できている','おおよそ把握している','よくわからない','管理できていない'], sc:[3,2,1,0] },
  { cat:'asset', q:'IT機器の購入・廃棄のルールや手順が決まっていますか？', opts:['ルールが明確にある','なんとなく決まっている','担当者任せになっている','特にルールはない'], sc:[3,2,1,0] },
  { cat:'sec', q:'社員が使うPCにウイルス対策ソフトは導入されていますか？', opts:['全台に導入・有効期限も管理している','一部は導入している','導入しているか不明','導入していない'], sc:[3,2,1,0] },
  { cat:'sec', q:'業務上重要なシステムやサービスのパスワードは安全に管理されていますか？', hint:'付箋・共有メモ・使い回し等は要注意です。', opts:['パスワードマネージャー等で管理している','ある程度ルールがある','担当者任せで共有方法が曖昧','付箋や共有スプレッドシートに書いている'], sc:[3,2,1,0] },
  { cat:'sec', q:'業務データや情報の持ち出しルール（USBメモリ・クラウド利用等）はありますか？', opts:['明確なルールがある','なんとなくのルールはある','ルールがあいまい','特にルールはない'], sc:[3,2,1,0] },
  { cat:'sec', q:'不審なメールや添付ファイルへの対応についてスタッフに周知できていますか？', opts:['定期的に研修・周知している','一度は説明したことがある','あまり周知できていない','特に対応していない'], sc:[3,2,1,0] },
  { cat:'sec', q:'万が一セキュリティ事故が起きたときの連絡・対応フローは決まっていますか？', opts:['マニュアルや連絡先が整備されている','おおよそは決まっている','ほぼ決まっていない','まったく決まっていない'], sc:[3,2,1,0] },
  { cat:'backup', q:'会社の重要データはバックアップを取っていますか？', opts:['自動バックアップで定期的に取れている','手動で時々取っている','たまに取るが不定期','バックアップを取っていない'], sc:[3,2,1,0] },
  { cat:'backup', q:'バックアップデータから実際に復元できるか確認（テスト）したことがありますか？', opts:['定期的にテスト復元している','一度は試したことがある','試したことはない','バックアップ自体していない'], sc:[3,2,1,0] },
  { cat:'backup', q:'バックアップデータは元データと別の場所（クラウドや別拠点）に保管していますか？', opts:['別の場所に保管している','同じPC・サーバー内に保存している','わからない','バックアップしていない'], sc:[3,2,1,0] },
  { cat:'backup', q:'基幹システムやファイルサーバーが突然使えなくなった場合、業務をどう継続するか決まっていますか？', opts:['BCP・対応手順が決まっている','なんとなく決まっている','ほぼ決まっていない','考えたことがない'], sc:[3,2,1,0] },
  { cat:'backup', q:'クラウドサービス（Google Workspace・Microsoft 365等）のデータもバックアップしていますか？', opts:['別途バックアップツールで対応している','クラウド任せにしている（バックアップなし）','クラウドサービス自体使っていない','わからない'], sc:[3,2,1,0] },
  { cat:'lic', q:'会社で使用しているソフトウェアのライセンスを一覧で管理していますか？', opts:['ライセンス台帳があり管理している','おおよそ把握している','担当者任せで把握できていない','特に管理していない'], sc:[3,2,1,0] },
  { cat:'lic', q:'ライセンスの更新期限を把握・管理できていますか？', opts:['期限管理ができており更新漏れはない','都度確認しているが不安がある','期限切れに気づかないことがある','管理できていない'], sc:[3,2,1,0] },
  { cat:'lic', q:'退職者のSaaSアカウント（Adobe、Slack等）のライセンス解放を適切に行っていますか？', opts:['ルールに基づき適切に対応できている','都度対応しているが漏れが心配','よく見落とすことがある','管理できていない'], sc:[3,2,1,0] },
  { cat:'lic', q:'無料トライアルで始めたサービスが有料課金に切り替わっていないか把握できていますか？', opts:['契約サービスを一覧管理している','大きいものは把握している','あまり把握できていない','まったく把握できていない'], sc:[3,2,1,0] },
  { cat:'lic', q:'サポートが終了したソフトウェア（Windows旧バージョン等）を使い続けていませんか？', opts:['最新・サポート内のものを使っている','ほぼ問題ない','一部使い続けている','よくわからない'], sc:[3,2,1,0] },
  { cat:'dx', q:'契約書・注文書・見積書などの書類は紙で保管していますか？', opts:['すべてデジタルで管理している','一部デジタル化している','ほとんど紙で保管している','紙とデジタルが混在して把握しにくい'], sc:[3,2,1,0] },
  { cat:'dx', q:'契約の更新期限や満了日を手動（カレンダー・Excel等）で管理していますか？', opts:['契約管理ツールを使って一元管理している','Excelやカレンダーで管理している','担当者の記憶や付箋に頼っている','特に管理していない'], sc:[3,2,1,0] },
  { cat:'dx', q:'領収書・経費精算は紙で行っていますか？', opts:['電子申請・クラウド経費システムを使っている','一部デジタル化している','ほぼ紙で行っている','よくわからない'], sc:[3,2,1,0] },
  { cat:'dx', q:'社内の申請・承認（休暇・購入等）はメールや紙で行っていますか？', opts:['ワークフローシステムで電子化している','一部メール・チャットで対応','ほぼ紙や口頭','システムがなく属人的'], sc:[3,2,1,0] },
  { cat:'dx', q:'取引先とのやり取り（見積書・請求書送付等）を電子化できていますか？', opts:['電子取引で完結している','一部電子化している','ほぼ郵送・FAX','まったく電子化していない'], sc:[3,2,1,0] },
];

const AUDIT_CATS = [
  { id:'helpdesk', name:'ヘルプデスク', icon:'🎧', items:[
    { id:1, t:'PC・スマホ・プリンター等の問い合わせ対応体制がある', imp:'高', type:'トラブル対応' },
    { id:2, t:'ソフトウェアのインストール申請フローがある', imp:'中', type:'サポート' },
    { id:3, t:'IT機器の貸出管理が行われている', imp:'中', type:'サポート' },
    { id:4, t:'ソフトウェア・アプリのトラブル対応ができる体制がある', imp:'高', type:'トラブル対応' },
    { id:5, t:'社内LAN・Wi-Fiのトラブル対応ができる（ネットワーク構成図あり）', imp:'高', type:'トラブル対応' },
  ]},
  { id:'asset', name:'IT資産管理', icon:'🖥️', items:[
    { id:6, t:'PC・スマホのキッティング手順書がある', imp:'高', type:'キッティング' },
    { id:7, t:'社内PC・スマホ・ハードウェアを台帳で管理している', imp:'高', type:'管理' },
    { id:8, t:'PCのインベントリ情報を定期取得している', imp:'中', type:'管理' },
    { id:9, t:'外部記憶媒体（USB等）の管理・制御をしている', imp:'中', type:'管理' },
    { id:10, t:'廃棄予定IT機器のデータ消去手順がある', imp:'中', type:'管理' },
  ]},
  { id:'software', name:'ソフトウェア・ライセンス', icon:'📄', items:[
    { id:11, t:'ソフトウェアライセンスを台帳で管理している', imp:'中', type:'管理' },
    { id:12, t:'ライセンスの更新期限を管理している', imp:'中', type:'管理' },
    { id:13, t:'OS・アプリ・ファームウェアの更新を管理している', imp:'高', type:'セキュリティ' },
  ]},
  { id:'server', name:'サーバ・ネットワーク', icon:'🗄️', items:[
    { id:14, t:'バックアップの定期実行を確認・管理している', imp:'高', type:'監視' },
    { id:15, t:'バックアップデータの復元テストを実施している（年1回以上）', imp:'中', type:'管理' },
    { id:16, t:'サーバ・ネットワーク機器の状態を定期監視している', imp:'中', type:'監視' },
    { id:17, t:'サーバ・ネットワーク機器のログを定期確認している', imp:'高', type:'監視' },
    { id:18, t:'サーバ・ネットワーク機器のセキュリティパッチを適用している', imp:'高', type:'セキュリティ' },
  ]},
  { id:'security', name:'セキュリティ管理', icon:'🛡️', items:[
    { id:19, t:'脅威情報・脆弱性情報を定期収集している（JPCERT・IPA等）', imp:'高', type:'情報収集' },
    { id:20, t:'ウイルス対策ソフトの定義ファイル更新状況を確認している', imp:'高', type:'監視' },
    { id:21, t:'ウイルス感染時の隔離・除去手順がある', imp:'高', type:'セキュリティ' },
    { id:22, t:'不審なアクティビティ検出時の初動対応手順がある', imp:'高', type:'セキュリティ' },
    { id:23, t:'社内セキュリティポリシーが策定・運用されている', imp:'高', type:'セキュリティ' },
  ]},
  { id:'access', name:'アクセス管理', icon:'🔐', items:[
    { id:24, t:'ファイルストレージ・社内システムのアクセス権限を管理している', imp:'中', type:'管理' },
    { id:25, t:'退職者のアカウントを速やかに削除・無効化している', imp:'高', type:'セキュリティ' },
    { id:26, t:'アクセス権限の定期見直しを実施している（四半期に1回以上）', imp:'高', type:'セキュリティ' },
  ]},
  { id:'info_sec', name:'情報セキュリティ・教育', icon:'👤', items:[
    { id:27, t:'不審メールの報告・対応フローがある', imp:'中', type:'サポート' },
    { id:28, t:'セキュリティ最新情報を定期的に社内共有している', imp:'低', type:'周知・教育' },
  ]},
  { id:'audit', name:'監査・契約・その他', icon:'📋', items:[
    { id:29, t:'外部監査への対応体制がある', imp:'低', type:'監査' },
    { id:30, t:'契約書の締結・管理フローがある（台帳・期限管理含む）', imp:'中', type:'契約書' },
    { id:31, t:'退職者のデータ保管ルールがある', imp:'中', type:'管理' },
  ]},
];

// ============================================================
// 状態管理
// ============================================================
let currentUser = null;
let sAnswers = {}, sCur = 0;
let aChecked = {};
let radarChart = null;
let allResults = [];

// ============================================================
// 画面制御
// ============================================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showAdminLogin() {
  showScreen('sc-admin-login');
  document.getElementById('admin-pw').value = '';
  document.getElementById('admin-err').style.display = 'none';
}

// ============================================================
// 企業情報入力
// ============================================================
function entryNext() {
  const name = document.getElementById('f-name').value.trim();
  const company = document.getElementById('f-company').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const errEl = document.getElementById('entry-err');

  if (!name || !company || !email) {
    errEl.textContent = 'お名前・会社名・メールアドレスは必須です';
    errEl.style.display = 'block'; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errEl.textContent = 'メールアドレスの形式が正しくありません';
    errEl.style.display = 'block'; return;
  }
  errEl.style.display = 'none';

  currentUser = {
    name, company, email,
    employee_size: document.getElementById('f-size').value,
    industry: document.getElementById('f-industry').value,
  };

  const initial = name.charAt(0);
  document.getElementById('user-initial').textContent = initial;
  document.getElementById('banner-name').textContent = name + '（' + company + '）';

  sAnswers = {}; sCur = 0; aChecked = {};
  resetSimpleUI();
  showScreen('sc-mode');
  switchMode('simple');
}

function goEntry() { showScreen('sc-entry'); }

// ============================================================
// モード切替
// ============================================================
function switchMode(m) {
  document.getElementById('tab-s').classList.toggle('active', m === 'simple');
  document.getElementById('tab-a').classList.toggle('active', m === 'audit');
  document.getElementById('mode-simple').style.display = m === 'simple' ? 'block' : 'none';
  document.getElementById('mode-audit').style.display = m === 'audit' ? 'block' : 'none';
}

function resetSimpleUI() {
  document.getElementById('ss-start').style.display = 'block';
  document.getElementById('ss-quiz').style.display = 'none';
  document.getElementById('ss-result').style.display = 'none';
}

// ============================================================
// 簡易診断
// ============================================================
function sStart() {
  document.getElementById('ss-start').style.display = 'none';
  document.getElementById('ss-quiz').style.display = 'block';
  sRenderQ();
}

function sRenderQ() {
  const q = SQS[sCur];
  const pct = Math.round((sCur / SQS.length) * 100);
  document.getElementById('s-prog').style.width = pct + '%';
  const cat = SCATS.find(c => c.id === q.cat);
  document.getElementById('s-cat').textContent = cat.icon + ' ' + cat.name;
  document.getElementById('s-cat-label').textContent = cat.name;
  document.getElementById('s-q').textContent = q.q;
  const hint = document.getElementById('s-hint');
  if (q.hint) { hint.textContent = q.hint; hint.style.display = 'block'; }
  else hint.style.display = 'none';
  document.getElementById('s-num').textContent = (sCur + 1) + ' / ' + SQS.length;
  document.getElementById('s-back').disabled = sCur === 0;
  const saved = sAnswers[sCur];
  const c = document.getElementById('s-choices'); c.innerHTML = '';
  q.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'choice-btn' + (saved === i ? ' selected' : '');
    b.innerHTML = '<span class="choice-dot"></span>' + o;
    b.onclick = () => {
      sAnswers[sCur] = i;
      document.querySelectorAll('.choice-btn').forEach((x, j) => x.classList.toggle('selected', j === i));
      document.getElementById('s-next').disabled = false;
    };
    c.appendChild(b);
  });
  document.getElementById('s-next').disabled = saved === undefined;
  document.getElementById('s-next').textContent = sCur === SQS.length - 1 ? '結果を見る' : '次へ →';
}

function sBack() { if (sCur > 0) { sCur--; sRenderQ(); } }
function sNext() {
  if (sAnswers[sCur] === undefined) return;
  if (sCur < SQS.length - 1) { sCur++; sRenderQ(); }
  else sShowResult();
}

function calcSScores() {
  const catPct = {};
  SCATS.forEach(c => {
    const qs = SQS.filter(q => q.cat === c.id);
    const tot = qs.reduce((a, q) => { const idx = SQS.indexOf(q); return a + (q.sc[sAnswers[idx] ?? 0]); }, 0);
    catPct[c.id] = Math.round((tot / (qs.length * 3)) * 100);
  });
  return { catPct, total: Math.round(Object.values(catPct).reduce((a, b) => a + b) / SCATS.length) };
}

function sShowResult() {
  const { catPct, total } = calcSScores();
  const risk = total >= 75 ? '低リスク' : total >= 50 ? '中リスク' : '高リスク';
  const scoreColor = total >= 75 ? '#1D9E75' : total >= 50 ? '#BA7517' : '#E24B4A';
  const riskStyle = total >= 75
    ? 'color:#085041;background:#9FE1CB'
    : total >= 50 ? 'color:#412402;background:#FAC775'
    : 'color:#501313;background:#F7C1C1';

  saveResult('簡易診断', total, risk, catPct);

  const el = document.getElementById('ss-result');
  el.innerHTML = `
<div class="score-display">
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:6px">総合スコア</p>
  <div class="score-num" style="color:${scoreColor}">${total}<span class="score-unit">点</span></div>
  <div class="risk-pill" style="${riskStyle}">${risk}</div>
  <p class="saved-note">✓ この結果は保存されました</p>
</div>
<div class="chart-wrap"><canvas id="s-radar" role="img" aria-label="IT診断レーダーチャート"></canvas></div>
<div class="fb-list" id="s-fb"></div>
<div class="flex-row flex-center flex-wrap mb-2">
  <button class="btn btn-dark" onclick="sPDF()">📥 PDFで保存</button>
  <button class="btn btn-primary" onclick="switchMode('audit');aStart()">📋 詳細監査もやる</button>
  <button class="btn btn-secondary" onclick="sAnswers={};sCur=0;resetSimpleUI();sStart()">↺ もう一度</button>
</div>
<div class="cta-box">
  <h3>この結果、専門家に見てもらいませんか？</h3>
  <p>IT担当がいなくても大丈夫。まず話を聞かせてください。</p>
  <a href="mailto:s.nakata@mergevision.co.jp?subject=IT診断の結果について相談したい&body=診断結果：総合スコア${total}点（${risk}）%0D%0A会社名：${currentUser?.company}%0D%0Aお名前：${currentUser?.name}" class="btn btn-primary">メールで相談する</a>
</div>`;

  document.getElementById('ss-quiz').style.display = 'none';
  el.style.display = 'block';

  const fbEl = document.getElementById('s-fb');
  SCATS.forEach(c => {
    const p = catPct[c.id];
    const lv = p >= 75 ? 'green' : p >= 50 ? 'yellow' : 'red';
    const ic = p >= 75 ? '✓' : p >= 50 ? '⚠' : '✕';
    const msg = p >= 75 ? '管理は概ね良好です。' : p >= 50 ? '改善の余地があります。' : 'リスクが高い状態です。早急な整備をおすすめします。';
    const d = document.createElement('div');
    d.className = 'fb-item ' + lv;
    d.innerHTML = `<span style="font-size:15px;flex-shrink:0">${ic}</span><div><strong>${c.name} ${p}点</strong>　${msg}</div>`;
    fbEl.appendChild(d);
  });

  setTimeout(() => {
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('s-radar'), {
      type: 'radar',
      data: {
        labels: SCATS.map(c => c.name),
        datasets: [{ label: 'スコア', data: SCATS.map(c => catPct[c.id]), backgroundColor: 'rgba(29,158,117,0.15)', borderColor: '#1D9E75', borderWidth: 2, pointBackgroundColor: '#1D9E75', pointRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 }, color: '#7A9CA8', backdropColor: 'transparent' }, grid: { color: 'rgba(0,0,0,0.08)' }, angleLines: { color: 'rgba(0,0,0,0.08)' }, pointLabels: { font: { size: 12, family: "'Noto Sans JP', sans-serif" }, color: '#1a2e35' } } }
      }
    });
  }, 100);
}

// ============================================================
// 詳細監査
// ============================================================
function aStart() {
  document.getElementById('as-start').style.display = 'none';
  document.getElementById('as-body').style.display = 'block';
  if (document.getElementById('audit-list').innerHTML !== '') return;

  const ul = document.getElementById('audit-list');
  AUDIT_CATS.forEach(cat => {
    const wrap = document.createElement('div'); wrap.className = 'audit-cat';
    const hd = document.createElement('div'); hd.className = 'audit-cat-hd';
    hd.innerHTML = `<div class="audit-cat-hd-left"><span>${cat.icon}</span>${cat.name}</div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="cat-badge" id="badge-${cat.id}">0 / ${cat.items.length}</span>
        <span class="chevron">▼</span>
      </div>`;
    const body = document.createElement('div'); body.className = 'audit-cat-body';
    cat.items.forEach(item => {
      const row = document.createElement('div'); row.className = 'audit-item';
      row.innerHTML = `<input type="checkbox" id="chk-${item.id}" onchange="aToggle('${cat.id}',${item.id},this.checked)">
        <div class="audit-item-main">
          <label for="chk-${item.id}" class="audit-item-title">${item.t}</label>
          <div class="audit-tags">
            <span class="tag ${item.imp==='高'?'tag-hi':item.imp==='中'?'tag-mid':'tag-lo'}">重要度:${item.imp}</span>
            <span class="tag tag-type">${item.type}</span>
          </div>
        </div>`;
      body.appendChild(row);
    });
    hd.onclick = () => { body.classList.toggle('open'); hd.classList.toggle('open'); };
    wrap.appendChild(hd); wrap.appendChild(body); ul.appendChild(wrap);
  });
  document.querySelector('.audit-cat-body').classList.add('open');
  document.querySelector('.audit-cat-hd').classList.add('open');
}

function aToggle(catId, itemId, checked) {
  if (!aChecked[catId]) aChecked[catId] = new Set();
  checked ? aChecked[catId].add(itemId) : aChecked[catId].delete(itemId);
  const cat = AUDIT_CATS.find(c => c.id === catId);
  const done = (aChecked[catId] || new Set()).size;
  const badge = document.getElementById('badge-' + catId);
  badge.textContent = done + ' / ' + cat.items.length;
  badge.style.background = done === cat.items.length ? '#E1F5EE' : done > 0 ? '#FAEEDA' : '';
  badge.style.color = done === cat.items.length ? '#085041' : done > 0 ? '#854F0B' : '';
}

function aShowResult() {
  const catR = AUDIT_CATS.map(cat => {
    const done = (aChecked[cat.id] || new Set()).size;
    return { ...cat, done, total: cat.items.length, pct: Math.round((done / cat.items.length) * 100) };
  });
  const totalDone = catR.reduce((a, c) => a + c.done, 0);
  const totalItems = catR.reduce((a, c) => a + c.total, 0);
  const pct = Math.round((totalDone / totalItems) * 100);
  const status = pct >= 80 ? '管理良好' : pct >= 50 ? '要改善' : '未整備が多い';
  const details = Object.fromEntries(catR.map(c => [c.id, c.pct]));
  saveResult('詳細監査', pct, status, details);

  const notDone = AUDIT_CATS.flatMap(cat => cat.items.filter(i => i.imp === '高' && !(aChecked[cat.id] || new Set()).has(i.id)));
  const scoreColor = pct >= 80 ? '#1D9E75' : pct >= 50 ? '#BA7517' : '#E24B4A';
  const riskStyle = pct >= 80 ? 'color:#085041;background:#9FE1CB' : pct >= 50 ? 'color:#412402;background:#FAC775' : 'color:#501313;background:#F7C1C1';

  const el = document.getElementById('as-result');
  el.innerHTML = `
<div class="score-display">
  <p style="font-size:13px;color:var(--text-muted);margin-bottom:6px">実施率</p>
  <div class="score-num" style="color:${scoreColor}">${pct}<span class="score-unit">%</span></div>
  <div class="risk-pill" style="${riskStyle}">${status}</div>
  <p class="saved-note">✓ この結果は保存されました</p>
</div>
<div class="chart-wrap"><canvas id="a-radar" role="img" aria-label="IT監査レーダーチャート"></canvas></div>
<div style="margin-bottom:1.5rem">${catR.map(c => {
  const bc = c.pct >= 80 ? '#1D9E75' : c.pct >= 50 ? '#BA7517' : '#E24B4A';
  return `<div style="margin-bottom:9px">
    <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">
      <span>${c.icon} ${c.name}</span>
      <span style="color:${bc};font-weight:500">${c.done}/${c.total}</span>
    </div>
    <div style="height:6px;background:#dde8e8;border-radius:3px">
      <div style="height:6px;border-radius:3px;background:${bc};width:${c.pct}%;transition:width .6s"></div>
    </div></div>`;
}).join('')}</div>
${notDone.length > 0 ? `<div style="margin-bottom:1.5rem">
  <p style="font-size:14px;font-weight:700;margin-bottom:8px;color:var(--text)">⚠ 未実施の高優先度項目（${notDone.length}件）</p>
  ${notDone.map(i => `<div class="fb-item red"><span>✕</span><span style="font-size:12px">${i.t}</span></div>`).join('')}
</div>` : ''}
<div class="flex-row flex-center flex-wrap mb-2">
  <button class="btn btn-secondary" onclick="document.getElementById('as-body').style.display='block';document.getElementById('as-result').style.display='none'">← 戻る</button>
  <button class="btn btn-secondary" onclick="aReset()">↺ リセット</button>
</div>
<div class="cta-box">
  <h3>対応の優先順位を整理しませんか？</h3>
  <p>未実施項目が多い場合でも、優先度の高いものから整理するだけで大きく改善できます。</p>
  <a href="mailto:s.nakata@mergevision.co.jp?subject=IT監査チェックリストの結果について&body=実施率：${pct}%（${status}）%0D%0A会社名：${currentUser?.company}%0D%0Aお名前：${currentUser?.name}" class="btn btn-primary">メールで相談する</a>
</div>`;

  document.getElementById('as-body').style.display = 'none';
  el.style.display = 'block';

  setTimeout(() => {
    if (radarChart) radarChart.destroy();
    radarChart = new Chart(document.getElementById('a-radar'), {
      type: 'radar',
      data: {
        labels: catR.map(c => c.name),
        datasets: [{ label: '実施率', data: catR.map(c => c.pct), backgroundColor: 'rgba(29,158,117,0.15)', borderColor: '#1D9E75', borderWidth: 2, pointBackgroundColor: '#1D9E75', pointRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 10 }, color: '#7A9CA8', backdropColor: 'transparent' }, grid: { color: 'rgba(0,0,0,0.08)' }, angleLines: { color: 'rgba(0,0,0,0.08)' }, pointLabels: { font: { size: 11, family: "'Noto Sans JP', sans-serif" }, color: '#1a2e35' } } }
      }
    });
  }, 100);
}

function aReset() {
  aChecked = {};
  document.querySelectorAll('#audit-list input[type="checkbox"]').forEach(c => c.checked = false);
  AUDIT_CATS.forEach(cat => {
    const b = document.getElementById('badge-' + cat.id);
    if (b) { b.textContent = '0 / ' + cat.items.length; b.style.background = ''; b.style.color = ''; }
  });
  document.getElementById('as-result').style.display = 'none';
  document.getElementById('as-body').style.display = 'block';
}

// ============================================================
// Supabase保存
// ============================================================
async function saveResult(type, score, risk, details) {
  if (!currentUser) return;
  try {
    const { error } = await db.from('results').insert({
      name: currentUser.name,
      company: currentUser.company,
      email: currentUser.email,
      employee_size: currentUser.employee_size || null,
      industry: currentUser.industry || null,
      type, score, risk,
      details,
    });
    if (error) console.error('保存エラー:', error);
  } catch (e) {
    console.error('Supabase接続エラー:', e);
  }
}

// ============================================================
// PDF出力（文字化け対策：英語ベース）
// ============================================================
function sPDF() {
  const { catPct, total } = calcSScores();
  const risk = total >= 75 ? 'Low Risk' : total >= 50 ? 'Medium Risk' : 'High Risk';
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
  const W = 210, pad = 20;

  doc.setFillColor(10, 42, 53); doc.rect(0, 0, W, 38, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(255, 255, 255);
  doc.text('IT Diagnosis Report', pad, 15);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(157, 225, 203);
  if (currentUser) doc.text(currentUser.name + ' / ' + currentUser.company, pad, 24);
  const d = new Date();
  doc.setTextColor(157, 225, 203);
  doc.text(d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate(), W - pad, 24, { align: 'right' });

  let y = 50;
  const [sr, sg, sb] = total >= 75 ? [29,158,117] : total >= 50 ? [186,117,22] : [226,75,74];
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 46, 53);
  doc.text('Overall Score', pad, y); y += 7;
  doc.setFillColor(240, 250, 248); doc.roundedRect(pad, y, W - pad * 2, 28, 3, 3, 'F');
  doc.setFontSize(36); doc.setTextColor(sr, sg, sb);
  doc.text(String(total), W / 2 - 14, y + 19);
  doc.setFontSize(16); doc.setTextColor(100, 140, 150); doc.text('/ 100', W / 2 + 8, y + 19);
  doc.setFillColor(sr, sg, sb); doc.roundedRect(W / 2 + 30, y + 7, 32, 12, 3, 3, 'F');
  doc.setFontSize(9); doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
  doc.text(risk, W / 2 + 46, y + 14, { align: 'center' });
  y += 38;

  const nameMap = { asset: 'Asset Mgmt', sec: 'Security', backup: 'Backup', lic: 'License', dx: 'Doc/DX' };
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 46, 53);
  doc.text('Category Scores', pad, y); y += 7;
  const cw = (W - pad * 2 - 8) / 2;
  SCATS.forEach((cat, i) => {
    const p = catPct[cat.id];
    const [cr, cg, cb] = p >= 75 ? [29,158,117] : p >= 50 ? [186,117,22] : [226,75,74];
    const cx = i % 2 === 0 ? pad : pad + cw + 8;
    if (i % 2 === 0 && i > 0) y += 19;
    doc.setFillColor(248, 252, 252); doc.roundedRect(cx, y, cw, 16, 2, 2, 'F');
    doc.setDrawColor(220, 235, 235); doc.roundedRect(cx, y, cw, 16, 2, 2, 'S');
    doc.setFontSize(9); doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 100, 110);
    doc.text(nameMap[cat.id] || cat.name, cx + 4, y + 6.5);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(cr, cg, cb);
    doc.text(String(p), cx + cw - 4, y + 6.5, { align: 'right' });
    doc.setFillColor(220, 235, 235); doc.rect(cx + 4, y + 9, cw - 8, 3, 'F');
    doc.setFillColor(cr, cg, cb); doc.rect(cx + 4, y + 9, (cw - 8) * p / 100, 3, 'F');
  });
  y += 28;

  const fbMap = {
    asset: { ok: 'Asset mgmt is in good shape.', mid: 'Improvements needed in asset tracking.', ng: 'Urgent: asset mgmt needs attention.' },
    sec:   { ok: 'Security posture is solid.', mid: 'Security has room for improvement.', ng: 'High security risk. Act immediately.' },
    backup:{ ok: 'Backup practices are solid.', mid: 'Backup setup needs improvements.', ng: 'Insufficient backup. Risk of data loss.' },
    lic:   { ok: 'License mgmt is under control.', mid: 'License mgmt could be more systematic.', ng: 'License mgmt is inadequate.' },
    dx:    { ok: 'Digitalization is progressing well.', mid: 'Some paper-based processes remain.', ng: 'Heavy paper reliance. DX recommended.' },
  };
  doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(26, 46, 53);
  doc.text('Feedback', pad, y); y += 7;
  SCATS.forEach(cat => {
    const p = catPct[cat.id];
    const [fr, fg, fb2] = p >= 75 ? [234,243,222] : p >= 50 ? [250,238,218] : [252,235,235];
    const [lr, lg, lb] = p >= 75 ? [99,153,34] : p >= 50 ? [186,117,22] : [226,75,74];
    const msg = p >= 75 ? fbMap[cat.id].ok : p >= 50 ? fbMap[cat.id].mid : fbMap[cat.id].ng;
    doc.setFillColor(fr, fg, fb2); doc.roundedRect(pad, y, W - pad * 2, 14, 2, 2, 'F');
    doc.setFillColor(lr, lg, lb); doc.rect(pad, y, 2, 14, 'F');
    doc.setFontSize(8.5); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 60, 70);
    doc.text((nameMap[cat.id] || cat.name) + ' - ' + p + 'pts', pad + 5, y + 6);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(60, 80, 90);
    doc.text(msg, pad + 5, y + 11);
    y += 16;
  });

  y = Math.max(y + 6, 258);
  doc.setFillColor(10, 42, 53); doc.roundedRect(pad, y, W - pad * 2, 24, 3, 3, 'F');
  doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(29, 158, 117);
  doc.text('Want an expert to review your results?', W / 2, y + 9, { align: 'center' });
  doc.setFontSize(8.5); doc.setFont('helvetica', 'normal'); doc.setTextColor(157, 200, 200);
  doc.text('IT support available even without a dedicated IT team.', W / 2, y + 15, { align: 'center' });
  doc.text('contact@nakty.jp', W / 2, y + 21, { align: 'center' });

  doc.save('IT-Diagnosis-Report.pdf');
}

// ============================================================
// 管理画面
// ============================================================
function adminLogin() {
  const pw = document.getElementById('admin-pw').value;
  if (pw !== ADMIN_PASSWORD) {
    document.getElementById('admin-err').style.display = 'block'; return;
  }
  showScreen('sc-admin');
  loadAdminData();
}

function adminLogout() { showScreen('sc-entry'); }

async function loadAdminData() {
  document.getElementById('admin-loading').style.display = 'flex';
  document.getElementById('admin-content').style.display = 'none';
  try {
    const { data, error } = await db.from('results').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    allResults = data || [];
  } catch (e) {
    allResults = [];
    console.error('取得エラー:', e);
  }
  document.getElementById('admin-loading').style.display = 'none';
  document.getElementById('admin-content').style.display = 'block';

  const companies = new Set(allResults.map(r => r.company)).size;
  const avg = allResults.length ? Math.round(allResults.reduce((a, r) => a + r.score, 0) / allResults.length) : 0;
  const avgColor = avg >= 75 ? '#1D9E75' : avg >= 50 ? '#BA7517' : '#E24B4A';
  document.getElementById('admin-stats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${allResults.length}</div><div class="stat-lbl">総診断数</div></div>
    <div class="stat-card"><div class="stat-num">${companies}</div><div class="stat-lbl">企業数</div></div>
    <div class="stat-card"><div class="stat-num" style="color:${avgColor}">${avg}</div><div class="stat-lbl">平均スコア</div></div>`;

  renderTable();
}

function renderTable() {
  const filterType = document.getElementById('filter-type').value;
  const filtered = filterType ? allResults.filter(r => r.type === filterType) : allResults;
  document.getElementById('admin-count').textContent = '全' + filtered.length + '件';
  const tbody = document.getElementById('admin-tbody'); tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--text-muted);padding:2rem">データがありません</td></tr>';
    return;
  }
  filtered.forEach(r => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear() + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getDate()).padStart(2,'0') + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const sc = r.score >= 75 ? '#1D9E75' : r.score >= 50 ? '#BA7517' : '#E24B4A';
    const rb = r.risk === '低リスク' || r.risk === '管理良好' ? 'background:#E1F5EE;color:#085041' : r.risk === '中リスク' || r.risk === '要改善' ? 'background:#FAEEDA;color:#412402' : 'background:#FCEBEB;color:#501313';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="white-space:nowrap;color:var(--text-muted)">${ds}</td>
      <td style="font-weight:500">${r.name}</td>
      <td>${r.company}</td>
      <td style="color:var(--text-muted)">${r.email}</td>
      <td>${r.employee_size || '—'}</td>
      <td>${r.industry || '—'}</td>
      <td><span class="pill" style="background:#E6F1FB;color:#185FA5">${r.type}</span></td>
      <td style="font-weight:700;color:${sc}">${r.score}${r.type === '詳細監査' ? '%' : '点'}</td>
      <td><span class="pill" style="${rb}">${r.risk}</span></td>`;
    tbody.appendChild(tr);
  });
}

async function clearAllData() {
  if (!confirm('全データを削除しますか？この操作は取り消せません。')) return;
  try {
    await db.from('results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    loadAdminData();
  } catch (e) { alert('削除に失敗しました'); }
}

function exportCSV() {
  if (!allResults.length) { alert('データがありません'); return; }
  const headers = ['日時', '名前', '会社名', 'メール', '従業員数', '業種', '種別', 'スコア', '判定'];
  const rows = allResults.map(r => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
    return [ds, r.name, r.company, r.email, r.employee_size || '', r.industry || '', r.type, r.score, r.risk].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
  });
  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'it-shindan-results.csv';
  a.click();
}
