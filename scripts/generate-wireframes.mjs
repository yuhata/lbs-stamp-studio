/**
 * UI ワイヤーフレーム生成
 * 各画面のシンプルなモックアップをSVG→PNGで生成
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT = path.resolve('public/wireframes');
fs.mkdirSync(OUT, { recursive: true });

const W = 375, H = 812; // iPhone サイズ
const BG = '#0f0f1a', CARD = '#1a1a2e', ACCENT = '#ff6b35';
const TEXT = '#e0e0e0', MUTED = '#888899', BORDER = '#2a2a40';
const GREEN = '#4caf50', BLUE = '#42a5f5', RED = '#ef5350';

function phone(content, title = '') {
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" rx="20" fill="${BG}"/>
    <!-- Status bar -->
    <rect x="0" y="0" width="${W}" height="44" fill="${CARD}" rx="20"/>
    <text x="187" y="30" text-anchor="middle" font-size="12" fill="${MUTED}" font-family="sans-serif">9:41</text>
    <!-- Header -->
    ${title ? `<rect x="0" y="44" width="${W}" height="50" fill="${CARD}"/>
    <text x="187" y="76" text-anchor="middle" font-size="16" font-weight="bold" fill="${TEXT}" font-family="sans-serif">${title}</text>` : ''}
    <!-- Content -->
    ${content}
    <!-- Bottom nav -->
    <rect x="0" y="${H - 80}" width="${W}" height="80" fill="${CARD}" rx="0"/>
    <text x="65" y="${H - 42}" text-anchor="middle" font-size="10" fill="${ACCENT}" font-family="sans-serif">マップ</text>
    <circle cx="65" cy="${H - 58}" r="10" fill="none" stroke="${ACCENT}" stroke-width="1.5"/>
    <text x="187" y="${H - 42}" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">コレクション</text>
    <circle cx="187" cy="${H - 58}" r="10" fill="none" stroke="${MUTED}" stroke-width="1.5"/>
    <text x="310" y="${H - 42}" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">プロフィール</text>
    <circle cx="310" cy="${H - 58}" r="10" fill="none" stroke="${MUTED}" stroke-width="1.5"/>
  </svg>`;
}

const screens = {
  // 1. ウェルカム（初回起動）
  '01_welcome': phone(`
    <rect x="20" y="200" width="335" height="300" rx="16" fill="${CARD}"/>
    <text x="187" y="250" text-anchor="middle" font-size="24" font-weight="bold" fill="${TEXT}" font-family="sans-serif">ようこそ！</text>
    <text x="187" y="285" text-anchor="middle" font-size="14" fill="${MUTED}" font-family="sans-serif">現在地の写真を撮って</text>
    <text x="187" y="305" text-anchor="middle" font-size="14" fill="${MUTED}" font-family="sans-serif">最初のスタンプを手に入れよう</text>
    <!-- Camera icon -->
    <circle cx="187" cy="380" r="35" fill="${ACCENT}" opacity="0.2"/>
    <rect x="170" y="365" width="34" height="24" rx="4" fill="${ACCENT}"/>
    <circle cx="187" cy="377" r="7" fill="${BG}"/>
    <rect x="100" y="440" width="175" height="44" rx="22" fill="${ACCENT}"/>
    <text x="187" y="467" text-anchor="middle" font-size="15" font-weight="bold" fill="white" font-family="sans-serif">写真を撮る</text>
  `, ''),

  // 2. マップ画面（メイン）
  '02_map': phone(`
    <!-- Map area -->
    <rect x="0" y="94" width="${W}" height="540" fill="#16213E"/>
    <!-- Grid lines (map feel) -->
    <line x1="0" y1="200" x2="${W}" y2="200" stroke="${BORDER}" stroke-width="0.5"/>
    <line x1="0" y1="350" x2="${W}" y2="350" stroke="${BORDER}" stroke-width="0.5"/>
    <line x1="0" y1="500" x2="${W}" y2="500" stroke="${BORDER}" stroke-width="0.5"/>
    <line x1="125" y1="94" x2="125" y2="634" stroke="${BORDER}" stroke-width="0.5"/>
    <line x1="250" y1="94" x2="250" y2="634" stroke="${BORDER}" stroke-width="0.5"/>
    <!-- Landmark markers -->
    <circle cx="150" cy="280" r="14" fill="${ACCENT}" stroke="${GREEN}" stroke-width="3"/>
    <circle cx="230" cy="350" r="14" fill="${ACCENT}" stroke="${MUTED}" stroke-width="3"/>
    <circle cx="100" cy="420" r="14" fill="${ACCENT}" stroke="${MUTED}" stroke-width="3"/>
    <!-- Data spot markers -->
    <circle cx="200" cy="220" r="8" fill="#E65100" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <circle cx="280" cy="300" r="8" fill="#1565C0" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <circle cx="170" cy="480" r="8" fill="#E65100" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <circle cx="300" cy="450" r="8" fill="#4E342E" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
    <!-- Layer controls -->
    <rect x="10" y="100" width="${W - 20}" height="36" rx="18" fill="${CARD}" opacity="0.9"/>
    <rect x="15" y="104" width="65" height="28" rx="14" fill="${ACCENT}"/>
    <text x="47" y="122" text-anchor="middle" font-size="10" fill="white" font-family="sans-serif">ランドマーク</text>
    <text x="120" y="122" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">神社</text>
    <text x="170" y="122" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">寺院</text>
    <text x="215" y="122" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">駅</text>
    <!-- Nearest spot card -->
    <rect x="20" y="580" width="335" height="48" rx="12" fill="${CARD}" opacity="0.95"/>
    <text x="36" y="600" font-size="11" fill="${MUTED}" font-family="sans-serif">最寄り</text>
    <text x="36" y="618" font-size="13" font-weight="bold" fill="${TEXT}" font-family="sans-serif">雷門  230m →</text>
  `, 'マップ'),

  // 3. スポット詳細
  '03_spot_detail': phone(`
    <!-- Spot image -->
    <rect x="0" y="94" width="${W}" height="200" fill="#16213E"/>
    <rect x="137" y="144" width="100" height="100" rx="8" fill="${CARD}"/>
    <text x="187" y="200" text-anchor="middle" font-size="30" fill="${MUTED}" font-family="sans-serif">📸</text>
    <!-- Info -->
    <rect x="20" y="310" width="335" height="180" rx="12" fill="${CARD}"/>
    <text x="36" y="340" font-size="20" font-weight="bold" fill="${TEXT}" font-family="sans-serif">雷門</text>
    <text x="36" y="365" font-size="12" fill="${ACCENT}" font-family="sans-serif">浅草エリア · ランドマーク</text>
    <text x="36" y="395" font-size="13" fill="${MUTED}" font-family="sans-serif">ミッション:</text>
    <text x="36" y="415" font-size="13" fill="${TEXT}" font-family="sans-serif">この場所の写真を撮影してください</text>
    <text x="36" y="445" font-size="11" fill="${MUTED}" font-family="sans-serif">ヒント: 大きな赤い提灯が目印</text>
    <text x="36" y="465" font-size="11" fill="${MUTED}" font-family="sans-serif">GPS範囲: 100m以内</text>
    <!-- Distance -->
    <rect x="20" y="505" width="335" height="50" rx="12" fill="${CARD}"/>
    <text x="36" y="536" font-size="13" fill="${TEXT}" font-family="sans-serif">📍 現在地から 230m</text>
    <!-- CTA -->
    <rect x="20" y="575" width="335" height="50" rx="25" fill="${ACCENT}"/>
    <text x="187" y="606" text-anchor="middle" font-size="16" font-weight="bold" fill="white" font-family="sans-serif">写真を撮影する</text>
    <!-- Stamp preview -->
    <rect x="20" y="640" width="335" height="70" rx="12" fill="${CARD}"/>
    <text x="36" y="665" font-size="11" fill="${MUTED}" font-family="sans-serif">獲得できるスタンプ（4種からランダム）</text>
    <circle cx="60" cy="695" r="15" fill="${ACCENT}" opacity="0.3"/>
    <circle cx="100" cy="695" r="15" fill="${ACCENT}" opacity="0.3"/>
    <circle cx="140" cy="695" r="15" fill="${ACCENT}" opacity="0.3"/>
    <circle cx="180" cy="695" r="15" fill="${ACCENT}" opacity="0.3"/>
  `, ''),

  // 4. スタンピングUX
  '04_stamping': phone(`
    <text x="187" y="150" text-anchor="middle" font-size="18" font-weight="bold" fill="${TEXT}" font-family="sans-serif">スタンプを押そう</text>
    <text x="187" y="175" text-anchor="middle" font-size="12" fill="${MUTED}" font-family="sans-serif">好きな位置をタップ＆長押し</text>
    <!-- Stamp book page -->
    <rect x="30" y="200" width="315" height="420" rx="8" fill="#F5F0E8"/>
    <!-- Grid lines -->
    <line x1="30" y1="310" x2="345" y2="310" stroke="#E0D8CC" stroke-width="0.5"/>
    <line x1="30" y1="420" x2="345" y2="420" stroke="#E0D8CC" stroke-width="0.5"/>
    <line x1="30" y1="530" x2="345" y2="530" stroke="#E0D8CC" stroke-width="0.5"/>
    <!-- Stamp being pressed -->
    <circle cx="187" cy="380" r="55" fill="${ACCENT}" opacity="0.7"/>
    <circle cx="187" cy="380" r="45" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.5"/>
    <!-- Pressure indicator -->
    <rect x="130" y="640" width="115" height="6" rx="3" fill="${BORDER}"/>
    <rect x="130" y="640" width="70" height="6" rx="3" fill="${ACCENT}"/>
    <text x="187" y="665" text-anchor="middle" font-size="11" fill="${MUTED}" font-family="sans-serif">インク濃度: 60%</text>
    <text x="187" y="690" text-anchor="middle" font-size="11" fill="${MUTED}" font-family="sans-serif">長く押すほど濃くなります</text>
  `, ''),

  // 5. スタンプ獲得結果
  '05_stamp_acquired': phone(`
    <text x="187" y="150" text-anchor="middle" font-size="22" font-weight="bold" fill="${TEXT}" font-family="sans-serif">スタンプ獲得！</text>
    <!-- Stamp display -->
    <circle cx="187" cy="300" r="90" fill="${CARD}"/>
    <circle cx="187" cy="300" r="75" fill="${ACCENT}" opacity="0.15"/>
    <circle cx="187" cy="300" r="70" fill="none" stroke="${ACCENT}" stroke-width="3" opacity="0.8"/>
    <text x="187" y="290" text-anchor="middle" font-size="14" fill="${ACCENT}" font-family="sans-serif">雷門</text>
    <text x="187" y="315" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">2026.04.04 21:30</text>
    <!-- Stats -->
    <text x="187" y="430" text-anchor="middle" font-size="14" fill="${TEXT}" font-family="sans-serif">3個目のスタンプ！</text>
    <!-- Rank up notification -->
    <rect x="40" y="460" width="295" height="60" rx="12" fill="rgba(76,175,80,0.15)" stroke="${GREEN}" stroke-width="1"/>
    <text x="187" y="485" text-anchor="middle" font-size="14" font-weight="bold" fill="${GREEN}" font-family="sans-serif">🎉 コレクターにランクアップ！</text>
    <text x="187" y="505" text-anchor="middle" font-size="11" fill="${MUTED}" font-family="sans-serif">新しいカードデザインが解放されました</text>
    <!-- Action buttons -->
    <rect x="20" y="545" width="160" height="44" rx="22" fill="${ACCENT}"/>
    <text x="100" y="572" text-anchor="middle" font-size="13" font-weight="bold" fill="white" font-family="sans-serif">シェアする</text>
    <rect x="195" y="545" width="160" height="44" rx="22" fill="none" stroke="${BORDER}" stroke-width="1.5"/>
    <text x="275" y="572" text-anchor="middle" font-size="13" fill="${TEXT}" font-family="sans-serif">証明書DL</text>
    <!-- Next spot -->
    <rect x="20" y="610" width="335" height="50" rx="12" fill="${CARD}"/>
    <text x="36" y="640" font-size="12" fill="${TEXT}" font-family="sans-serif">次のスポット: 仲見世通り (120m) →</text>
  `, ''),

  // 6. コレクションブック
  '06_collection': phone(`
    <!-- Rank badge -->
    <rect x="20" y="100" width="335" height="60" rx="12" fill="${CARD}"/>
    <circle cx="50" cy="130" r="18" fill="${ACCENT}" opacity="0.2"/>
    <text x="50" y="135" text-anchor="middle" font-size="14" fill="${ACCENT}" font-family="sans-serif">🏅</text>
    <text x="80" y="125" font-size="14" font-weight="bold" fill="${TEXT}" font-family="sans-serif">コレクター</text>
    <text x="80" y="145" font-size="11" fill="${MUTED}" font-family="sans-serif">12個収集 · 浅草エリア進行中</text>
    <text x="320" y="135" text-anchor="end" font-size="12" fill="${ACCENT}" font-family="sans-serif">シェア</text>
    <!-- Stamp grid -->
    <text x="20" y="190" font-size="12" font-weight="bold" fill="${MUTED}" font-family="sans-serif">ランドマーク (3/20)</text>
    <circle cx="55" cy="235" r="30" fill="${ACCENT}" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="130" cy="235" r="30" fill="${ACCENT}" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="205" cy="235" r="30" fill="${ACCENT}" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="280" cy="235" r="30" fill="${BORDER}" stroke="${BORDER}" stroke-width="2" stroke-dasharray="4"/>
    <text x="280" y="240" text-anchor="middle" font-size="14" fill="${MUTED}" font-family="sans-serif">?</text>
    <text x="20" y="300" font-size="12" font-weight="bold" fill="${MUTED}" font-family="sans-serif">神社 (5)</text>
    <circle cx="55" cy="345" r="30" fill="#E65100" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="130" cy="345" r="30" fill="#E65100" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="205" cy="345" r="30" fill="#E65100" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="280" cy="345" r="30" fill="#E65100" opacity="0.3"/>
    <circle cx="340" cy="345" r="15" fill="${BORDER}"/>
    <text x="340" y="350" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">+2</text>
    <text x="20" y="410" font-size="12" font-weight="bold" fill="${MUTED}" font-family="sans-serif">駅 (2)</text>
    <circle cx="55" cy="455" r="30" fill="#1565C0" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <circle cx="130" cy="455" r="30" fill="#1565C0" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <text x="20" y="520" font-size="12" font-weight="bold" fill="${MUTED}" font-family="sans-serif">季節限定 (1)</text>
    <circle cx="55" cy="565" r="30" fill="#AD1457" opacity="0.3" stroke="${GREEN}" stroke-width="2"/>
    <text x="55" y="570" text-anchor="middle" font-size="8" fill="#AD1457" font-family="sans-serif">桜</text>
    <!-- Timeline toggle -->
    <rect x="240" y="610" width="115" height="32" rx="16" fill="${CARD}"/>
    <text x="297" y="630" text-anchor="middle" font-size="11" fill="${MUTED}" font-family="sans-serif">タイムライン</text>
  `, 'コレクション'),

  // 7. プロフィール
  '07_profile': phone(`
    <!-- Avatar + rank -->
    <circle cx="187" cy="160" r="40" fill="${CARD}"/>
    <text x="187" y="170" text-anchor="middle" font-size="28" fill="${MUTED}" font-family="sans-serif">👤</text>
    <text x="187" y="225" text-anchor="middle" font-size="18" font-weight="bold" fill="${TEXT}" font-family="sans-serif">ユーザー名</text>
    <rect x="147" y="235" width="80" height="24" rx="12" fill="${ACCENT}" opacity="0.2"/>
    <text x="187" y="252" text-anchor="middle" font-size="11" font-weight="bold" fill="${ACCENT}" font-family="sans-serif">コレクター</text>
    <!-- Stats -->
    <rect x="20" y="280" width="105" height="70" rx="10" fill="${CARD}"/>
    <text x="72" y="310" text-anchor="middle" font-size="22" font-weight="bold" fill="${ACCENT}" font-family="sans-serif">12</text>
    <text x="72" y="330" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">スタンプ</text>
    <rect x="135" y="280" width="105" height="70" rx="10" fill="${CARD}"/>
    <text x="187" y="310" text-anchor="middle" font-size="22" font-weight="bold" fill="${GREEN}" font-family="sans-serif">3</text>
    <text x="187" y="330" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">エリア</text>
    <rect x="250" y="280" width="105" height="70" rx="10" fill="${CARD}"/>
    <text x="302" y="310" text-anchor="middle" font-size="22" font-weight="bold" fill="${BLUE}" font-family="sans-serif">2</text>
    <text x="302" y="330" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">称号</text>
    <!-- Badges -->
    <text x="20" y="385" font-size="14" font-weight="bold" fill="${TEXT}" font-family="sans-serif">称号・バッジ</text>
    <rect x="20" y="400" width="160" height="40" rx="8" fill="${CARD}"/>
    <text x="100" y="425" text-anchor="middle" font-size="11" fill="#E65100" font-family="sans-serif">⛩ 鳥居巡り (5社)</text>
    <rect x="190" y="400" width="165" height="40" rx="8" fill="${CARD}"/>
    <text x="272" y="425" text-anchor="middle" font-size="11" fill="#1565C0" font-family="sans-serif">🚉 山手線制覇</text>
    <!-- Rank progress -->
    <text x="20" y="475" font-size="14" font-weight="bold" fill="${TEXT}" font-family="sans-serif">ランク進捗</text>
    <rect x="20" y="490" width="335" height="80" rx="10" fill="${CARD}"/>
    <text x="36" y="515" font-size="12" fill="${TEXT}" font-family="sans-serif">次のランク: エクスプローラー</text>
    <text x="36" y="535" font-size="11" fill="${MUTED}" font-family="sans-serif">あと 8個で到達</text>
    <rect x="36" y="545" width="303" height="8" rx="4" fill="${BORDER}"/>
    <rect x="36" y="545" width="60" height="8" rx="4" fill="${ACCENT}"/>
    <!-- Settings -->
    <rect x="20" y="590" width="335" height="44" rx="10" fill="${CARD}"/>
    <text x="36" y="617" font-size="13" fill="${TEXT}" font-family="sans-serif">🌐 言語設定 · 日本語</text>
    <rect x="20" y="644" width="335" height="44" rx="10" fill="${CARD}"/>
    <text x="36" y="671" font-size="13" fill="${TEXT}" font-family="sans-serif">🔗 Google アカウント連携</text>
  `, 'プロフィール'),

  // 8. シェアカード
  '08_share_card': phone(`
    <text x="187" y="130" text-anchor="middle" font-size="16" font-weight="bold" fill="${TEXT}" font-family="sans-serif">シェアカード作成</text>
    <!-- Card preview -->
    <rect x="37" y="150" width="300" height="300" rx="12" fill="#F5F0E8"/>
    <text x="187" y="185" text-anchor="middle" font-size="14" fill="#8D6E63" font-family="sans-serif">My Stamps</text>
    <!-- Stamp grid in card -->
    <circle cx="112" cy="250" r="28" fill="${ACCENT}" opacity="0.5"/>
    <circle cx="187" cy="250" r="28" fill="#1565C0" opacity="0.5"/>
    <circle cx="262" cy="250" r="28" fill="#E65100" opacity="0.5"/>
    <circle cx="112" cy="330" r="28" fill="#1B5E20" opacity="0.5"/>
    <circle cx="187" cy="330" r="28" fill="#4E342E" opacity="0.5"/>
    <circle cx="262" cy="330" r="28" fill="#6A1B9A" opacity="0.5"/>
    <text x="187" y="395" text-anchor="middle" font-size="12" fill="#8D6E63" font-family="sans-serif">ユーザー名 · 12個収集</text>
    <text x="187" y="415" text-anchor="middle" font-size="10" fill="#AAAAAA" font-family="sans-serif">#LBSスタンプ #デジタルスタンプラリー</text>
    <!-- Design selector -->
    <text x="20" y="485" font-size="12" fill="${MUTED}" font-family="sans-serif">デザインテンプレート</text>
    <rect x="20" y="498" width="70" height="44" rx="8" fill="${CARD}" stroke="${ACCENT}" stroke-width="2"/>
    <text x="55" y="525" text-anchor="middle" font-size="10" fill="${TEXT}" font-family="sans-serif">グリッド</text>
    <rect x="100" y="498" width="70" height="44" rx="8" fill="${CARD}"/>
    <text x="135" y="525" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">タイムライン</text>
    <rect x="180" y="498" width="70" height="44" rx="8" fill="${CARD}"/>
    <text x="215" y="525" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">🔒 ゴールド</text>
    <!-- Share buttons -->
    <rect x="20" y="565" width="335" height="50" rx="25" fill="${ACCENT}"/>
    <text x="187" y="596" text-anchor="middle" font-size="15" font-weight="bold" fill="white" font-family="sans-serif">シェアする</text>
    <rect x="20" y="625" width="335" height="44" rx="22" fill="none" stroke="${BORDER}" stroke-width="1.5"/>
    <text x="187" y="652" text-anchor="middle" font-size="13" fill="${TEXT}" font-family="sans-serif">画像をダウンロード</text>
  `, ''),

  // 9. UGCスポット投稿
  '09_ugc_submit': phone(`
    <!-- Form -->
    <text x="20" y="120" font-size="12" fill="${MUTED}" font-family="sans-serif">スポット名 *</text>
    <rect x="20" y="130" width="335" height="40" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <text x="36" y="155" font-size="13" fill="${TEXT}" font-family="sans-serif">お気に入りの場所を入力</text>
    <text x="20" y="195" font-size="12" fill="${MUTED}" font-family="sans-serif">写真 *</text>
    <rect x="20" y="205" width="160" height="120" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="1" stroke-dasharray="6"/>
    <text x="100" y="265" text-anchor="middle" font-size="24" fill="${MUTED}" font-family="sans-serif">📷</text>
    <text x="100" y="290" text-anchor="middle" font-size="10" fill="${MUTED}" font-family="sans-serif">写真を追加</text>
    <text x="20" y="350" font-size="12" fill="${MUTED}" font-family="sans-serif">位置情報（自動取得）</text>
    <rect x="20" y="360" width="335" height="40" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <text x="36" y="385" font-size="12" fill="${GREEN}" font-family="sans-serif">📍 35.7107, 139.7965</text>
    <text x="20" y="425" font-size="12" fill="${MUTED}" font-family="sans-serif">説明（任意）</text>
    <rect x="20" y="435" width="335" height="80" rx="8" fill="${CARD}" stroke="${BORDER}" stroke-width="1"/>
    <!-- Preview -->
    <rect x="20" y="540" width="335" height="80" rx="10" fill="rgba(255,107,53,0.1)" stroke="${ACCENT}" stroke-width="1"/>
    <text x="36" y="565" font-size="11" fill="${ACCENT}" font-family="sans-serif">💡 投稿後の流れ</text>
    <text x="36" y="585" font-size="10" fill="${MUTED}" font-family="sans-serif">AIがクエスト＋スタンプを自動生成 → 管理者が承認</text>
    <text x="36" y="600" font-size="10" fill="${MUTED}" font-family="sans-serif">→ 承認されると公開スポットとして登録されます</text>
    <!-- Submit -->
    <rect x="20" y="640" width="335" height="50" rx="25" fill="${ACCENT}"/>
    <text x="187" y="671" text-anchor="middle" font-size="15" font-weight="bold" fill="white" font-family="sans-serif">スポットを提案する</text>
  `, 'スポット投稿'),
};

async function main() {
  console.log('=== ワイヤーフレーム生成 ===\n');
  for (const [name, svg] of Object.entries(screens)) {
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const outPath = path.join(OUT, `${name}.png`);
    fs.writeFileSync(outPath, buffer);
    console.log(`✅ ${name}.png (${(buffer.length / 1024).toFixed(0)}KB)`);
  }
  console.log(`\n📁 ${OUT}/`);
  console.log(`✅ ${Object.keys(screens).length}画面生成完了`);
}

main().catch(console.error);
