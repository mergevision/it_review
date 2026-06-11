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
function validateField(id, errMsg) {
  const el = document.getElementById(id);
  const val = el.value.trim();
  const wrap = el.parentElement;
  if (!val) {
    el.style.borderColor = 'var(--red)';
    let e = wrap.querySelector('.field-err');
    if (!e) { e = document.createElement('p'); e.className = 'field-err err-msg'; wrap.appendChild(e); }
    e.textContent = errMsg;
    return false;
  }
  el.style.borderColor = '';
  const e = wrap.querySelector('.field-err');
  if (e) e.remove();
  return true;
}

async function entryNext() {
  const name    = document.getElementById('f-name').value.trim();
  const company = document.getElementById('f-company').value.trim();
  const email   = document.getElementById('f-email').value.trim();
  const errEl   = document.getElementById('entry-err');

  // フィールドごとの個別エラー表示
  let ok = true;
  if (!validateField('f-name',    'お名前を入力してください')) ok = false;
  if (!validateField('f-company', '会社名を入力してください')) ok = false;
  if (!validateField('f-email',   'メールアドレスを入力してください')) ok = false;
  if (!validateField('f-size',    '従業員数を選択してください')) ok = false;
  if (!validateField('f-industry','業種を選択してください')) ok = false;
  if (!ok) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const el = document.getElementById('f-email');
    el.style.borderColor = 'var(--red)';
    const wrap = el.parentElement;
    let e = wrap.querySelector('.field-err');
    if (!e) { e = document.createElement('p'); e.className = 'field-err err-msg'; wrap.appendChild(e); }
    e.textContent = 'メールアドレスの形式が正しくありません';
    return;
  }

  errEl.style.display = 'none';
  currentUser = {
    name, company, email,
    employee_size: document.getElementById('f-size').value,
    industry:      document.getElementById('f-industry').value,
  };

  const initial = name.charAt(0);
  document.getElementById('user-initial').textContent = initial;
  document.getElementById('banner-name').textContent = name + '（' + company + '）';

  // formspreeでメール通知
  const FORMSPREE_URL = 'https://formspree.io/f/mykadwdl';
  if (FORMSPREE_URL && FORMSPREE_URL !== 'YOUR_FORMSPREE_URL') {
    try {
      await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          subject: '【IT診断】新規診断開始：' + company + ' / ' + name,
          name, company, email,
          employee_size: currentUser.employee_size || '未入力',
          industry:      currentUser.industry || '未入力',
          message: name + '（' + company + '）さんがIT診断を開始しました。\n\nメール：' + email +
            '\n従業員数：' + (currentUser.employee_size || '未入力') +
            '\n業種：' + (currentUser.industry || '未入力'),
        })
      });
    } catch(e) { /* 通知失敗しても診断は続行 */ }
  }

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
  <button class="btn btn-dark" onclick="aPDF()">📥 PDFで保存</button>
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
// PDF出力（大型canvas一括描画方式）
// A4を2480×3508px(300dpi)相当のcanvasに全部描いてPDFに貼る
// ============================================================

// SVGテキストをcanvasに描画するヘルパー
function drawSvgText(ctx, text, x, y, opts={}) {
  const { fontSize=28, bold=false, color='#1a2e35', align='left', maxWidth } = opts;
  const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const w = maxWidth || 1200;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${fontSize*2}">
    <text x="${align==='center'?w/2:align==='right'?w:0}" y="${fontSize*1.1}"
      font-size="${fontSize}" font-family="'Noto Sans JP',sans-serif"
      font-weight="${bold?'700':'500'}" fill="${color}"
      text-anchor="${align==='center'?'middle':align==='right'?'end':'start'}">${escaped}</text></svg>`;
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, x, y - fontSize*1.1, w, fontSize*2);
      res();
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

// 正多角形レーダーチャートをcanvasに描画
function drawRadarOnCanvas(ctx, cx, cy, size, catDefs, catData) {
  const maxR = size * 0.34;
  const labelR = size * 0.47;
  const n = catDefs.length;
  const angle = i => (Math.PI*2/n)*i - Math.PI/2;
  const pt = (r,i) => [cx + r*Math.cos(angle(i)), cy + r*Math.sin(angle(i))];

  // グリッド
  [25,50,75,100].forEach(lv => {
    const r = maxR*lv/100;
    ctx.beginPath();
    for(let i=0;i<n;i++){const [x,y]=pt(r,i);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
    ctx.closePath();
    ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=2; ctx.stroke();
    if(lv<100){
      ctx.fillStyle='#aac0c8'; ctx.font='22px sans-serif'; ctx.textAlign='center';
      ctx.fillText(String(lv), cx, cy-r+26);
    }
  });
  // 軸線
  for(let i=0;i<n;i++){
    const [x,y]=pt(maxR,i);
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);
    ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=2;ctx.stroke();
  }
  // データ
  const vals = catDefs.map(c=>catData[c.id]??0);
  ctx.beginPath();
  vals.forEach((v,i)=>{const r=maxR*v/100;const [x,y]=pt(r,i);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.closePath();
  ctx.fillStyle='rgba(29,158,117,0.18)';ctx.fill();
  ctx.strokeStyle='#1D9E75';ctx.lineWidth=4;ctx.stroke();
  // ドット
  vals.forEach((v,i)=>{
    const [x,y]=pt(maxR*v/100,i);
    ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);
    ctx.fillStyle='#1D9E75';ctx.fill();
    ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
  });
  // ラベル位置を返す
  return catDefs.map((cat,i)=>{
    const [lx,ly]=pt(labelR,i);
    return {cat, lx, ly};
  });
}

async function buildPDF(type, scoreVal, riskLabel, catData, catDefs) {
  // A4 300dpi相当
  const CW = 2480, CH = 3508;
  const PAD = 120;
  const cv = document.createElement('canvas');
  cv.width=CW; cv.height=CH;
  const ctx = cv.getContext('2d');

  // 背景白
  ctx.fillStyle='#f8fafa'; ctx.fillRect(0,0,CW,CH);

  // ========== ヘッダー ==========
  ctx.fillStyle='#0A2A35'; ctx.fillRect(0,0,CW,220);
  await drawSvgText(ctx,'IT簡易診断レポート',PAD,150,{fontSize:72,bold:true,color:'#ffffff'});
  const d=new Date();
  const dateStr=d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate();
  const subText = currentUser ? currentUser.name+' / '+currentUser.company+'　'+dateStr : dateStr;
  await drawSvgText(ctx,subText,PAD,195,{fontSize:36,color:'#9FE1CB',maxWidth:1800});

  let y = 280;

  // ========== 総合スコア ==========
  await drawSvgText(ctx,'総合スコア',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const [sr,sg,sb]=scoreVal>=75?[29,158,117]:scoreVal>=50?[186,117,22]:[226,75,74];
  ctx.fillStyle=`rgb(240,250,248)`; roundRect(ctx,PAD,y,CW-PAD*2,200,20,'fill');
  // スコア数字
  ctx.fillStyle=`rgb(${sr},${sg},${sb})`; ctx.font='bold 160px Arial,sans-serif'; ctx.textAlign='left';
  ctx.fillText(String(scoreVal), CW/2-160, y+148);
  ctx.fillStyle='#7a9ca8'; ctx.font='80px Arial,sans-serif';
  ctx.fillText('/100', CW/2+30, y+148);
  // リスクバッジ
  ctx.fillStyle=`rgb(${sr},${sg},${sb})`; roundRect(ctx,CW/2+220,y+60,260,80,16,'fill');
  await drawSvgText(ctx,riskLabel,CW/2+230,y+118,{fontSize:42,bold:true,color:'#ffffff',maxWidth:240});
  y+=240;

  // ========== レーダーチャート ==========
  await drawSvgText(ctx,'カテゴリ別レーダーチャート',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const radarSize=800;
  const rcx=CW/2, rcy=y+radarSize/2+30;
  const labelPositions = drawRadarOnCanvas(ctx,rcx,rcy,radarSize,catDefs,catData);
  // ラベル描画
  for(const {cat,lx,ly} of labelPositions){
    await drawSvgText(ctx,cat.name,lx-160,ly+20,{fontSize:42,bold:true,color:'#1a2e35',align:'center',maxWidth:320});
  }
  y += radarSize+80;

  // ========== カテゴリ別スコア ==========
  await drawSvgText(ctx,'カテゴリ別スコア',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const colW=(CW-PAD*2-40)/2;
  const unit=type==='詳細監査'?'%':'点';
  for(let i=0;i<catDefs.length;i++){
    const cat=catDefs[i];
    const p=catData[cat.id]??0;
    const [cr,cg,cb]=p>=75?[29,158,117]:p>=50?[186,117,22]:[226,75,74];
    const cx2=i%2===0?PAD:PAD+colW+40;
    if(i%2===0&&i>0) y+=130;
    ctx.fillStyle='#ffffff'; roundRect(ctx,cx2,y,colW,120,12,'fill');
    ctx.strokeStyle='#dde8e8'; ctx.lineWidth=2; roundRect(ctx,cx2,y,colW,120,12,'stroke');
    await drawSvgText(ctx,cat.name,cx2+20,y+58,{fontSize:34,color:'#506470',maxWidth:colW-200});
    // スコア数字をcanvas直接描画（SVGだと右寄せがはみ出すため）
    ctx.font = `bold 40px Arial,sans-serif`;
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.textAlign = 'right';
    ctx.fillText(String(p)+unit, cx2+colW-30, y+70);
    ctx.textAlign = 'left';
    ctx.fillStyle='#dde8e8'; ctx.fillRect(cx2+20,y+75,colW-40,14);
    ctx.fillStyle=`rgb(${cr},${cg},${cb})`; ctx.fillRect(cx2+20,y+75,(colW-40)*p/100,14);
  }
  if(catDefs.length%2!==0) y+=130; else y+=130;
  y+=20;

  // ========== フィードバック ==========
  await drawSvgText(ctx,'フィードバック',PAD,y+48,{fontSize:44,bold:true,color:'#1a2e35'});
  y+=60;
  const fbMap={
    asset:   {ok:'資産管理は概ね良好です。',       mid:'資産管理に改善の余地があります。',   ng:'資産管理のリスクが高い状態です。'},
    sec:     {ok:'セキュリティは概ね良好です。',   mid:'セキュリティに改善の余地があります。',ng:'セキュリティリスクが高い状態です。'},
    backup:  {ok:'バックアップは概ね良好です。',   mid:'バックアップに改善の余地があります。',ng:'バックアップが不十分です。'},
    lic:     {ok:'ライセンス管理は良好です。',     mid:'ライセンス管理に改善が必要です。',    ng:'ライセンス管理が不十分です。'},
    dx:      {ok:'DX化は概ね進んでいます。',       mid:'紙業務が一部残っています。',          ng:'紙業務が多く残っています。'},
    helpdesk:{ok:'ヘルプデスクは良好です。',       mid:'ヘルプデスクに改善が必要です。',      ng:'ヘルプデスク体制が不十分です。'},
    software:{ok:'ソフト管理は良好です。',         mid:'ソフト管理に改善が必要です。',        ng:'ソフト管理が不十分です。'},
    server:  {ok:'サーバ管理は良好です。',         mid:'サーバ管理に改善が必要です。',        ng:'サーバ管理が不十分です。'},
    security:{ok:'セキュリティ管理は良好です。',   mid:'セキュリティ管理に改善が必要です。',  ng:'セキュリティ管理が不十分です。'},
    access:  {ok:'アクセス管理は良好です。',       mid:'アクセス管理に改善が必要です。',      ng:'アクセス管理が不十分です。'},
    info_sec:{ok:'情報セキュリティ教育は良好です。',mid:'情報セキュリティ教育に改善が必要です。',ng:'情報セキュリティ教育が不十分です。'},
    audit:   {ok:'監査対応は良好です。',           mid:'監査対応に改善が必要です。',          ng:'監査対応が不十分です。'},
  };
  for(const cat of catDefs){
    const p=catData[cat.id]??0;
    const [fr,fg,fb2]=p>=75?[234,243,222]:p>=50?[250,238,218]:[252,235,235];
    const [lr,lg,lb]=p>=75?[99,153,34]:p>=50?[186,117,22]:[226,75,74];
    const fb=fbMap[cat.id]||{ok:'良好です。',mid:'改善の余地があります。',ng:'要対応です。'};
    const msg=p>=75?fb.ok:p>=50?fb.mid:fb.ng;
    ctx.fillStyle=`rgb(${fr},${fg},${fb2})`; roundRect(ctx,PAD,y,CW-PAD*2,95,10,'fill');
    ctx.fillStyle=`rgb(${lr},${lg},${lb})`; ctx.fillRect(PAD,y,14,95);
    await drawSvgText(ctx,cat.name,PAD+30,y+60,{fontSize:34,bold:true,color:'#28404a',maxWidth:280});
    await drawSvgText(ctx,msg,PAD+330,y+60,{fontSize:34,color:'#28404a',maxWidth:CW-PAD*2-360});
    y+=110;
  }
  y+=20;

  // ========== CTA ==========
  ctx.fillStyle='#0A2A35'; roundRect(ctx,PAD,y,CW-PAD*2,170,16,'fill');
  await drawSvgText(ctx,'この結果を専門家に見てもらいませんか？',PAD+60,y+80,{fontSize:46,bold:true,color:'#1D9E75',maxWidth:CW-PAD*2-120});
  await drawSvgText(ctx,'IT担当がいなくても大丈夫。まず話を聞かせてください。　s.nakata@mergevision.co.jp',PAD+60,y+136,{fontSize:34,color:'#9FE1CB',maxWidth:CW-PAD*2-120});

  // ========== PDFに変換 ==========
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation:'p', unit:'mm', format:'a4', compress:true });
  const imgData = cv.toDataURL('image/jpeg', 0.92);
  doc.addImage(imgData,'JPEG',0,0,210,297);
  doc.save('IT診断レポート.pdf');
}

// canvas角丸矩形ヘルパー
function roundRect(ctx, x, y, w, h, r, mode) {
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  if(mode==='fill') ctx.fill(); else ctx.stroke();
}

function sPDF() {
  const { catPct, total } = calcSScores();
  const risk = total>=75?'低リスク':total>=50?'中リスク':'高リスク';
  buildPDF('簡易診断', total, risk, catPct, SCATS);
}

function aPDF() {
  const catR = AUDIT_CATS.map(cat => {
    const done = (aChecked[cat.id] || new Set()).size;
    return { ...cat, pct: Math.round((done / cat.items.length) * 100) };
  });
  const totalDone = AUDIT_CATS.reduce((a,c)=>a+(aChecked[c.id]||new Set()).size, 0);
  const totalItems = AUDIT_CATS.reduce((a,c)=>a+c.items.length, 0);
  const pct = Math.round((totalDone/totalItems)*100);
  const status = pct>=80?'管理良好':pct>=50?'要改善':'未整備が多い';
  const details = Object.fromEntries(catR.map(c=>[c.id, c.pct]));
  buildPDF('詳細監査', pct, status, details, AUDIT_CATS);
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

// カテゴリ定義（詳細表示用）
const ADMIN_SCATS = [
  {id:'asset',name:'資産管理'}, {id:'sec',name:'セキュリティ'},
  {id:'backup',name:'バックアップ'}, {id:'lic',name:'ライセンス'}, {id:'dx',name:'書類・DX'},
];
const ADMIN_ACATS = [
  {id:'helpdesk',name:'ヘルプデスク'}, {id:'asset',name:'IT資産管理'},
  {id:'software',name:'ソフト・ライセンス'}, {id:'server',name:'サーバ・NW'},
  {id:'security',name:'セキュリティ'}, {id:'access',name:'アクセス管理'},
  {id:'info_sec',name:'情報教育'}, {id:'audit',name:'監査・契約'},
];

function renderTable() {
  const filterType = document.getElementById('filter-type').value;
  const filtered = filterType ? allResults.filter(r => r.type === filterType) : allResults;
  document.getElementById('admin-count').textContent = '全' + filtered.length + '件';
  const tbody = document.getElementById('admin-tbody'); tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem">データがありません</td></tr>';
    return;
  }
  // テーブルヘッダーを差し替え
  document.querySelector('.results-tbl thead tr').innerHTML =
    '<th>日時</th><th>名前 / 会社名</th><th>種別</th><th>総合スコア</th><th>カテゴリ別</th>';

  filtered.forEach((r,idx) => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0')
      +' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    const sc = r.score>=75?'#1D9E75':r.score>=50?'#BA7517':'#E24B4A';
    const rb = r.risk==='低リスク'||r.risk==='管理良好'?'background:#E1F5EE;color:#085041'
      :r.risk==='中リスク'||r.risk==='要改善'?'background:#FAEEDA;color:#412402'
      :'background:#FCEBEB;color:#501313';
    const unit = r.type==='詳細監査'?'%':'点';
    const cats = r.type==='詳細監査' ? ADMIN_ACATS : ADMIN_SCATS;
    const details = r.details || {};

    // カテゴリ別ミニバー
    const miniBars = cats.map(c => {
      const p = details[c.id] ?? null;
      if (p === null) return '';
      const bc = p>=75?'#1D9E75':p>=50?'#BA7517':'#E24B4A';
      return `<div style="margin-bottom:3px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-bottom:1px">
          <span>${c.name}</span><span style="color:${bc};font-weight:500">${p}${unit}</span>
        </div>
        <div style="height:4px;background:#dde8e8;border-radius:2px">
          <div style="height:4px;border-radius:2px;background:${bc};width:${p}%"></div>
        </div>
      </div>`;
    }).join('');

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td style="white-space:nowrap;color:var(--text-muted);font-size:11px">${ds}</td>
      <td><div style="font-weight:500;font-size:13px">${r.name}</div>
          <div style="font-size:11px;color:var(--text-muted)">${r.company}</div>
          <div style="font-size:10px;color:var(--text-muted)">${r.email}</div></td>
      <td><span class="pill" style="background:#E6F1FB;color:#185FA5">${r.type}</span></td>
      <td style="text-align:center">
        <div style="font-size:22px;font-weight:700;color:${sc};line-height:1">${r.score}<span style="font-size:12px;font-weight:400;color:var(--text-muted)">${unit}</span></div>
        <span class="pill" style="${rb};margin-top:4px;display:inline-block">${r.risk}</span>
      </td>
      <td style="min-width:160px">${miniBars || '<span style="font-size:11px;color:var(--text-muted)">詳細なし</span>'}</td>`;
    tr.onclick = () => openDetail(r);
    tbody.appendChild(tr);
  });
}

// 詳細モーダル
function openDetail(r) {
  const unit = r.type==='詳細監査'?'%':'点';
  const cats = r.type==='詳細監査' ? ADMIN_ACATS : ADMIN_SCATS;
  const details = r.details || {};
  const sc = r.score>=75?'#1D9E75':r.score>=50?'#BA7517':'#E24B4A';
  const rb = r.risk==='低リスク'||r.risk==='管理良好'?'color:#085041;background:#9FE1CB'
    :r.risk==='中リスク'||r.risk==='要改善'?'color:#412402;background:#FAC775'
    :'color:#501313;background:#F7C1C1';
  const d = new Date(r.created_at);
  const ds = d.getFullYear()+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+String(d.getDate()).padStart(2,'0');

  const fbMap = {
    asset:   {ok:'資産管理は概ね良好です。',       mid:'資産管理に改善の余地があります。',   ng:'資産管理のリスクが高い状態です。'},
    sec:     {ok:'セキュリティは概ね良好です。',   mid:'セキュリティに改善の余地があります。',ng:'セキュリティリスクが高い状態です。'},
    backup:  {ok:'バックアップは概ね良好です。',   mid:'バックアップに改善の余地があります。',ng:'バックアップが不十分です。'},
    lic:     {ok:'ライセンス管理は良好です。',     mid:'ライセンス管理に改善が必要です。',    ng:'ライセンス管理が不十分です。'},
    dx:      {ok:'DX化は概ね進んでいます。',       mid:'紙業務が一部残っています。',          ng:'紙業務が多く残っています。'},
    helpdesk:{ok:'ヘルプデスクは良好です。',       mid:'ヘルプデスクに改善が必要です。',      ng:'ヘルプデスク体制が不十分です。'},
    software:{ok:'ソフト管理は良好です。',         mid:'ソフト管理に改善が必要です。',        ng:'ソフト管理が不十分です。'},
    server:  {ok:'サーバ管理は良好です。',         mid:'サーバ管理に改善が必要です。',        ng:'サーバ管理が不十分です。'},
    security:{ok:'セキュリティ管理は良好です。',   mid:'セキュリティ管理に改善が必要です。',  ng:'セキュリティ管理が不十分です。'},
    access:  {ok:'アクセス管理は良好です。',       mid:'アクセス管理に改善が必要です。',      ng:'アクセス管理が不十分です。'},
    info_sec:{ok:'情報教育は良好です。',           mid:'情報教育に改善が必要です。',          ng:'情報教育が不十分です。'},
    audit:   {ok:'監査対応は良好です。',           mid:'監査対応に改善が必要です。',          ng:'監査対応が不十分です。'},
  };

  const catBars = cats.map(c => {
    const p = details[c.id] ?? null;
    if (p === null) return '';
    const bc = p>=75?'#1D9E75':p>=50?'#BA7517':'#E24B4A';
    const fb = fbMap[c.id]||{ok:'良好です。',mid:'改善の余地があります。',ng:'要対応です。'};
    const msg = p>=75?fb.ok:p>=50?fb.mid:fb.ng;
    const [fr,fg,fb2] = p>=75?[234,243,222]:p>=50?[250,238,218]:[252,235,235];
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:var(--text)">${c.name}</span>
        <span style="font-size:15px;font-weight:700;color:${bc}">${p}${unit}</span>
      </div>
      <div style="height:8px;background:#dde8e8;border-radius:4px;margin-bottom:5px">
        <div style="height:8px;border-radius:4px;background:${bc};width:${p}%"></div>
      </div>
      <div style="font-size:12px;color:#28404a;padding:6px 10px;background:rgb(${fr},${fg},${fb2});border-radius:6px;border-left:3px solid ${bc}">${msg}</div>
    </div>`;
  }).join('');

  // レーダーチャートcanvas用ID
  const chartId = 'modal-radar-'+Date.now();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.innerHTML = `
    <div style="background:var(--surface);border-radius:16px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;padding:1.5rem;position:relative">
      <button onclick="this.closest('[style*=fixed]').remove()" style="position:absolute;top:12px;right:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;width:30px;height:30px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center">×</button>
      <div style="margin-bottom:1.25rem">
        <p style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${ds}　${r.type}</p>
        <h3 style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:2px">${r.name}</h3>
        <p style="font-size:13px;color:var(--text-muted)">${r.company}　${r.email}</p>
        ${r.employee_size?`<p style="font-size:12px;color:var(--text-muted);margin-top:2px">従業員：${r.employee_size}　業種：${r.industry||'—'}</p>`:''}
      </div>
      <div style="text-align:center;margin-bottom:1.25rem;padding:1rem;background:var(--bg);border-radius:12px">
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:4px">総合スコア</p>
        <div style="font-size:48px;font-weight:700;color:${sc};line-height:1">${r.score}<span style="font-size:18px;font-weight:400;color:var(--text-muted)">${unit}</span></div>
        <span style="display:inline-block;padding:4px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-top:8px;${rb}">${r.risk}</span>
      </div>
      <div style="position:relative;width:100%;height:240px;margin-bottom:1.25rem">
        <canvas id="${chartId}"></canvas>
      </div>
      <div style="margin-bottom:1rem">${catBars}</div>
    </div>`;
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };
  document.body.appendChild(overlay);

  // レーダーチャート描画
  setTimeout(() => {
    const canvas = document.getElementById(chartId);
    if (!canvas || !window.Chart) return;
    const catVals = cats.map(c => details[c.id] ?? 0);
    new Chart(canvas, {
      type: 'radar',
      data: {
        labels: cats.map(c => c.name),
        datasets: [{ label: 'スコア', data: catVals,
          backgroundColor: 'rgba(29,158,117,0.15)', borderColor: '#1D9E75',
          borderWidth: 2, pointBackgroundColor: '#1D9E75', pointRadius: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min:0, max:100,
          ticks: { stepSize:25, font:{size:10}, color:'#7A9CA8', backdropColor:'transparent' },
          grid: { color:'rgba(0,0,0,0.08)' },
          angleLines: { color:'rgba(0,0,0,0.08)' },
          pointLabels: { font:{size:11,family:"'Noto Sans JP',sans-serif"}, color:'#1a2e35' }
        }}
      }
    });
  }, 100);
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

  // 簡易診断用カテゴリ
  const sCatDefs = [
    {id:'asset', name:'資産管理'},
    {id:'sec',   name:'セキュリティ'},
    {id:'backup',name:'バックアップ'},
    {id:'lic',   name:'ライセンス'},
    {id:'dx',    name:'書類・DX'},
  ];
  // 詳細監査用カテゴリ
  const aCatDefs = [
    {id:'helpdesk', name:'ヘルプデスク'},
    {id:'asset',    name:'IT資産管理'},
    {id:'software', name:'ソフト・ライセンス'},
    {id:'server',   name:'サーバ・NW'},
    {id:'security', name:'セキュリティ管理'},
    {id:'access',   name:'アクセス管理'},
    {id:'info_sec', name:'情報教育'},
    {id:'audit',    name:'監査・契約'},
  ];

  const judgement = (p, type) => {
    if (type === '詳細監査') return p >= 80 ? '管理良好' : p >= 50 ? '要改善' : '未整備が多い';
    return p >= 75 ? '良好' : p >= 50 ? '要改善' : '高リスク';
  };

  // 全カテゴリ名をヘッダーに（簡易+詳細の全カテゴリ）
  const sHeaders = sCatDefs.flatMap(c => [c.name+'_スコア', c.name+'_判定']);
  const aHeaders = aCatDefs.flatMap(c => [c.name+'_スコア', c.name+'_判定']);

  const headers = [
    '日時', '名前', '会社名', 'メール', '従業員数', '業種', '種別', '総合スコア', '総合判定',
    ...sHeaders, ...aHeaders
  ];

  const rows = allResults.map(r => {
    const d = new Date(r.created_at);
    const ds = d.getFullYear() + '/' + String(d.getMonth()+1).padStart(2,'0') + '/' + String(d.getDate()).padStart(2,'0')
      + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
    const details = r.details || {};
    const isSimple = r.type === '簡易診断';

    // 簡易診断カテゴリ列（詳細監査の場合は空欄）
    const sCols = sCatDefs.flatMap(c => {
      if (!isSimple) return ['', ''];
      const p = details[c.id] ?? '';
      return [p, p !== '' ? judgement(p, '簡易診断') : ''];
    });
    // 詳細監査カテゴリ列（簡易診断の場合は空欄）
    const aCols = aCatDefs.flatMap(c => {
      if (isSimple) return ['', ''];
      const p = details[c.id] ?? '';
      return [p, p !== '' ? judgement(p, '詳細監査') : ''];
    });

    return [
      ds, r.name, r.company, r.email,
      r.employee_size || '', r.industry || '',
      r.type, r.score, r.risk,
      ...sCols, ...aCols
    ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',');
  });

  const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = 'it-shindan-results.csv';
  a.click();
}
