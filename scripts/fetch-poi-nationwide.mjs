/**
 * 全国POI取得スクリプト
 * OpenStreetMap Overpass API から都道府県別に神社・寺院・駅を取得
 *
 * 使い方:
 *   node scripts/fetch-poi-nationwide.mjs              # 全都道府県
 *   node scripts/fetch-poi-nationwide.mjs tokyo osaka   # 指定のみ
 */
import fs from 'fs';
import path from 'path';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OUTPUT_DIR = path.resolve('public/poi');
const DELAY_MS = 12000; // リクエスト間隔（Overpass APIの制限対策）

// 都道府県バウンディングボックス
const PREFECTURES = {
  hokkaido:  { label: '北海道',   bbox: '41.34,139.33,45.56,145.82' },
  aomori:    { label: '青森県',   bbox: '40.21,139.49,41.56,141.68' },
  iwate:     { label: '岩手県',   bbox: '38.74,139.47,40.46,142.07' },
  miyagi:    { label: '宮城県',   bbox: '37.77,140.27,39.00,141.68' },
  akita:     { label: '秋田県',   bbox: '39.03,139.69,40.52,140.98' },
  yamagata:  { label: '山形県',   bbox: '37.73,139.52,39.21,140.64' },
  fukushima: { label: '福島県',   bbox: '36.79,139.16,37.97,141.04' },
  ibaraki:   { label: '茨城県',   bbox: '35.74,139.69,36.96,140.85' },
  tochigi:   { label: '栃木県',   bbox: '36.20,139.33,37.16,140.29' },
  gunma:     { label: '群馬県',   bbox: '36.07,138.64,37.07,139.68' },
  saitama:   { label: '埼玉県',   bbox: '35.75,138.91,36.29,139.91' },
  chiba:     { label: '千葉県',   bbox: '34.90,139.75,36.11,140.87' },
  tokyo:     { label: '東京都',   bbox: '35.50,139.40,35.90,139.95' },
  kanagawa:  { label: '神奈川県', bbox: '35.13,138.91,35.67,139.80' },
  niigata:   { label: '新潟県',   bbox: '36.73,137.64,38.56,140.03' },
  toyama:    { label: '富山県',   bbox: '36.27,136.77,37.00,137.76' },
  ishikawa:  { label: '石川県',   bbox: '36.07,136.23,37.87,137.34' },
  fukui:     { label: '福井県',   bbox: '35.37,135.55,36.29,136.83' },
  yamanashi: { label: '山梨県',   bbox: '35.18,138.18,35.90,139.13' },
  nagano:    { label: '長野県',   bbox: '35.20,137.32,37.03,138.73' },
  gifu:      { label: '岐阜県',   bbox: '35.14,136.26,36.47,137.66' },
  shizuoka:  { label: '静岡県',   bbox: '34.58,137.45,35.64,139.18' },
  aichi:     { label: '愛知県',   bbox: '34.57,136.67,35.42,137.84' },
  mie:       { label: '三重県',   bbox: '33.73,135.85,35.18,137.03' },
  shiga:     { label: '滋賀県',   bbox: '34.77,135.77,35.70,136.45' },
  kyoto:     { label: '京都府',   bbox: '34.70,134.85,35.78,136.06' },
  osaka:     { label: '大阪府',   bbox: '34.27,135.09,34.83,135.74' },
  hyogo:     { label: '兵庫県',   bbox: '34.15,134.26,35.67,135.47' },
  nara:      { label: '奈良県',   bbox: '33.85,135.56,34.74,136.26' },
  wakayama:  { label: '和歌山県', bbox: '33.43,135.07,34.38,136.01' },
  tottori:   { label: '鳥取県',   bbox: '35.07,133.16,35.62,134.53' },
  shimane:   { label: '島根県',   bbox: '34.30,131.66,36.07,133.41' },
  okayama:   { label: '岡山県',   bbox: '34.36,133.25,35.35,134.41' },
  hiroshima: { label: '広島県',   bbox: '34.04,132.04,35.10,133.42' },
  yamaguchi: { label: '山口県',   bbox: '33.74,130.93,34.77,132.27' },
  tokushima: { label: '徳島県',   bbox: '33.55,133.53,34.26,134.81' },
  kagawa:    { label: '香川県',   bbox: '34.05,133.48,34.56,134.43' },
  ehime:     { label: '愛媛県',   bbox: '32.90,132.02,34.17,133.65' },
  kochi:     { label: '高知県',   bbox: '32.71,132.47,33.88,134.31' },
  fukuoka:   { label: '福岡県',   bbox: '33.00,130.02,33.96,131.19' },
  saga:      { label: '佐賀県',   bbox: '32.95,129.74,33.60,130.56' },
  nagasaki:  { label: '長崎県',   bbox: '32.57,128.60,34.71,130.33' },
  kumamoto:  { label: '熊本県',   bbox: '32.06,130.10,33.24,131.30' },
  oita:      { label: '大分県',   bbox: '32.72,130.82,33.75,132.10' },
  miyazaki:  { label: '宮崎県',   bbox: '31.35,130.68,32.85,131.89' },
  kagoshima: { label: '鹿児島県', bbox: '27.01,128.37,32.33,131.20' },
  okinawa:   { label: '沖縄県',   bbox: '24.04,122.93,27.89,131.32' },
};

async function queryOverpass(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (res.ok) return res.json();
      if (i < retries - 1) {
        const wait = 20000 * (i + 1);
        console.log(`  ⏳ ${res.status}エラー、${wait / 1000}秒待機...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw new Error(`Overpass API error: ${res.status}`);
    } catch (e) {
      if (e.message.includes('Overpass API error')) throw e;
      if (i < retries - 1) {
        console.log(`  ⏳ ネットワークエラー、リトライ...`);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
      throw e;
    }
  }
}

async function fetchPrefecture(prefId, pref) {
  const query = `
    [out:json][timeout:120];
    (
      node["amenity"="place_of_worship"]["religion"="shinto"](${pref.bbox});
      way["amenity"="place_of_worship"]["religion"="shinto"](${pref.bbox});
      node["amenity"="place_of_worship"]["religion"="buddhist"](${pref.bbox});
      way["amenity"="place_of_worship"]["religion"="buddhist"](${pref.bbox});
      node["railway"="station"](${pref.bbox});
      node["railway"="halt"](${pref.bbox});
    );
    out center;
  `;

  const data = await queryOverpass(query);

  const pois = data.elements.map(el => {
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat || !lng) return null;

    let category;
    if (el.tags?.railway) category = 'station';
    else if (el.tags?.religion === 'shinto') category = 'shrine';
    else if (el.tags?.religion === 'buddhist') category = 'temple';
    else return null;

    return {
      name: el.tags?.name || el.tags?.['name:ja'] || '名称不明',
      name_en: el.tags?.['name:en'] || '',
      lat, lng, category,
      prefecture: prefId,
      osm_id: el.id,
      spot_type: 'data_spot',
      data_source: 'osm',
    };
  }).filter(Boolean);

  return pois;
}

async function main() {
  const args = process.argv.slice(2);
  const targets = args.length > 0
    ? Object.entries(PREFECTURES).filter(([id]) => args.includes(id))
    : Object.entries(PREFECTURES);

  console.log(`=== 全国POI取得 (${targets.length}都道府県) ===\n`);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const summary = [];
  let totalPOIs = 0;
  let totalShrines = 0, totalTemples = 0, totalStations = 0;

  for (let i = 0; i < targets.length; i++) {
    const [prefId, pref] = targets[i];
    const progress = `[${i + 1}/${targets.length}]`;

    // 既にファイルがあればスキップ
    const outPath = path.join(OUTPUT_DIR, `${prefId}.json`);
    if (fs.existsSync(outPath)) {
      const existing = JSON.parse(fs.readFileSync(outPath));
      const s = existing.filter(p => p.category === 'shrine').length;
      const t = existing.filter(p => p.category === 'temple').length;
      const st = existing.filter(p => p.category === 'station').length;
      console.log(`${progress} ${pref.label}: スキップ（既存 ${existing.length}件: 神社${s}/寺${t}/駅${st}）`);
      summary.push({ prefId, label: pref.label, total: existing.length, shrines: s, temples: t, stations: st });
      totalPOIs += existing.length;
      totalShrines += s; totalTemples += t; totalStations += st;
      continue;
    }

    try {
      console.log(`${progress} ${pref.label}: 取得中...`);
      const pois = await fetchPrefecture(prefId, pref);
      const shrines = pois.filter(p => p.category === 'shrine').length;
      const temples = pois.filter(p => p.category === 'temple').length;
      const stations = pois.filter(p => p.category === 'station').length;

      fs.writeFileSync(outPath, JSON.stringify(pois, null, 2));
      console.log(`  ✅ ${pois.length}件 (神社${shrines}/寺${temples}/駅${stations}) → ${outPath}`);

      summary.push({ prefId, label: pref.label, total: pois.length, shrines, temples, stations });
      totalPOIs += pois.length;
      totalShrines += shrines; totalTemples += temples; totalStations += stations;
    } catch (e) {
      console.log(`  ❌ ${pref.label}: ${e.message}`);
      summary.push({ prefId, label: pref.label, total: 0, shrines: 0, temples: 0, stations: 0, error: e.message });
    }

    // レート制限対策
    if (i < targets.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // サマリー表示
  console.log('\n=== 全国サマリー ===\n');
  console.log('都道府県        | 神社  | 寺院  | 駅    | 合計');
  console.log('--------------- | ----- | ----- | ----- | -----');
  summary.forEach(s => {
    const name = (s.label + '　　　').slice(0, 8);
    console.log(`${name} | ${String(s.shrines).padStart(5)} | ${String(s.temples).padStart(5)} | ${String(s.stations).padStart(5)} | ${String(s.total).padStart(5)}${s.error ? ' ❌' : ''}`);
  });
  console.log(`${'合計'.padEnd(8)} | ${String(totalShrines).padStart(5)} | ${String(totalTemples).padStart(5)} | ${String(totalStations).padStart(5)} | ${String(totalPOIs).padStart(5)}`);

  // サマリーJSON
  const summaryData = {
    generatedAt: new Date().toISOString(),
    totalPOIs, totalShrines, totalTemples, totalStations,
    prefectures: summary,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summaryData, null, 2));
  console.log(`\n📁 ${OUTPUT_DIR}/summary.json`);
  console.log(`\n✅ 完了: 全${totalPOIs}件 (神社${totalShrines}/寺${totalTemples}/駅${totalStations})`);
}

main().catch(console.error);
