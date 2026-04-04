/**
 * 公開データPOI取得 v2
 * 1クエリで3エリアの神社・駅・寺院を一括取得
 */
import fs from 'fs';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const AREAS = {
  asakusa: { south: 35.705, west: 139.790, north: 35.720, east: 139.815, label: '浅草' },
  shibuya: { south: 35.650, west: 139.690, north: 35.680, east: 139.710, label: '渋谷' },
  shinjuku: { south: 35.685, west: 139.688, north: 35.700, east: 139.710, label: '新宿' },
};

// 全エリアを包含するbbox
const ALL_BBOX = '35.650,139.688,35.720,139.815';

async function queryOverpass(query, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (res.ok) return res.json();
    if (i < retries - 1) {
      const wait = 15000 * (i + 1);
      console.log(`  ⏳ ${res.status}エラー、${wait / 1000}秒待機... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    throw new Error(`Overpass API error: ${res.status}`);
  }
}

function classifyArea(lat, lng) {
  for (const [id, bbox] of Object.entries(AREAS)) {
    if (lat >= bbox.south && lat <= bbox.north && lng >= bbox.west && lng <= bbox.east) {
      return id;
    }
  }
  return null;
}

async function main() {
  console.log('=== 公開データPOI取得 v2 ===\n');

  // 1クエリで神社・寺院・駅を全エリア一括取得
  const query = `
    [out:json][timeout:60];
    (
      node["amenity"="place_of_worship"]["religion"="shinto"](${ALL_BBOX});
      way["amenity"="place_of_worship"]["religion"="shinto"](${ALL_BBOX});
      node["amenity"="place_of_worship"]["religion"="buddhist"](${ALL_BBOX});
      way["amenity"="place_of_worship"]["religion"="buddhist"](${ALL_BBOX});
      node["railway"="station"](${ALL_BBOX});
      node["railway"="halt"](${ALL_BBOX});
    );
    out center;
  `;

  console.log('🔍 3エリア一括取得中...');
  const data = await queryOverpass(query);
  console.log(`  → ${data.elements.length}件取得\n`);

  // パース・分類
  const pois = data.elements.map(el => {
    const lat = el.lat || el.center?.lat;
    const lng = el.lon || el.center?.lon;
    if (!lat || !lng) return null;

    let category;
    if (el.tags?.railway) {
      category = 'station';
    } else if (el.tags?.religion === 'shinto') {
      category = 'shrine';
    } else if (el.tags?.religion === 'buddhist') {
      category = 'temple';
    }

    return {
      name: el.tags?.name || el.tags?.['name:ja'] || '名称不明',
      name_en: el.tags?.['name:en'] || '',
      lat, lng, category,
      area: classifyArea(lat, lng),
      osm_id: el.id,
      spot_type: 'data_spot',
      data_source: 'osm',
    };
  }).filter(p => p && p.area);

  // エリア別サマリー
  console.log('=== パイロットエリア結果 ===\n');
  for (const [areaId, areaCfg] of Object.entries(AREAS)) {
    const areaPois = pois.filter(p => p.area === areaId);
    const shrines = areaPois.filter(p => p.category === 'shrine');
    const temples = areaPois.filter(p => p.category === 'temple');
    const stations = areaPois.filter(p => p.category === 'station');

    console.log(`📍 ${areaCfg.label} (${areaPois.length}件)`);
    console.log(`   神社: ${shrines.length}件`);
    shrines.filter(s => s.name !== '名称不明').forEach(s => console.log(`     ⛩ ${s.name}`));
    console.log(`   寺院: ${temples.length}件`);
    temples.filter(t => t.name !== '名称不明').forEach(t => console.log(`     🏛 ${t.name}`));
    console.log(`   駅: ${stations.length}件`);
    stations.filter(s => s.name !== '名称不明').forEach(s => console.log(`     🚉 ${s.name}`));
    console.log('');
  }

  console.log(`合計: ${pois.length}件 (神社${pois.filter(p => p.category === 'shrine').length} / 寺${pois.filter(p => p.category === 'temple').length} / 駅${pois.filter(p => p.category === 'station').length})`);

  // 東京都全体の神社（スケール確認）
  console.log('\n--- 東京都全体の神社（スケール確認）---');
  await new Promise(r => setTimeout(r, 10000));
  const tokyoQuery = `
    [out:json][timeout:90];
    (
      node["amenity"="place_of_worship"]["religion"="shinto"](35.50,139.40,35.90,139.95);
      way["amenity"="place_of_worship"]["religion"="shinto"](35.50,139.40,35.90,139.95);
    );
    out center;
  `;
  console.log('🔍 東京都全体取得中...');
  const tokyoData = await queryOverpass(tokyoQuery);
  const tokyoShrines = tokyoData.elements.filter(el => el.tags?.name).length;
  console.log(`  → 全${tokyoData.elements.length}件（名前あり: ${tokyoShrines}件）\n`);

  // 保存
  const outputDir = '/Users/yuhata/claude-workspace/outputs/poi_data';
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(`${outputDir}/pilot_pois.json`, JSON.stringify(pois, null, 2));
  console.log(`📁 ${outputDir}/pilot_pois.json (${pois.length}件)`);

  const tokyoPois = tokyoData.elements
    .map(el => ({
      name: el.tags?.name || '名称不明',
      name_en: el.tags?.['name:en'] || '',
      lat: el.lat || el.center?.lat,
      lng: el.lon || el.center?.lon,
      category: 'shrine',
      osm_id: el.id,
      spot_type: 'data_spot',
      data_source: 'osm',
    }))
    .filter(p => p.lat && p.lng);
  fs.writeFileSync(`${outputDir}/tokyo_shrines.json`, JSON.stringify(tokyoPois, null, 2));
  console.log(`📁 ${outputDir}/tokyo_shrines.json (${tokyoPois.length}件)`);

  // レポート
  const report = `# 公開データPOI取得レポート
日時: ${new Date().toISOString()}
データソース: OpenStreetMap (Overpass API)

## パイロットエリア結果
${Object.entries(AREAS).map(([id, cfg]) => {
  const ap = pois.filter(p => p.area === id);
  return `### ${cfg.label}
- 神社: ${ap.filter(p => p.category === 'shrine').length}件
- 寺院: ${ap.filter(p => p.category === 'temple').length}件
- 駅: ${ap.filter(p => p.category === 'station').length}件
- **合計: ${ap.length}件**`;
}).join('\n\n')}

パイロット合計: ${pois.length}件

## 東京都全体（スケール確認）
- 神社: ${tokyoData.elements.length}件（名前あり: ${tokyoShrines}件）

## 所見
- OSMの日本の神社データは名前・座標ともに充実
- パイロットエリアだけでデータスポット層の密度確保が可能
- 全国展開時は都道府県別バッチで取得可能

## 次のステップ
1. テンプレートスタンプ合成パイプラインの構築
2. lbs-stamp-studioのマップにデータスポットを統合
3. 全国展開用の都道府県別バッチスクリプト
`;
  fs.writeFileSync(`${outputDir}/poi_report.md`, report);
  console.log(`📋 ${outputDir}/poi_report.md`);
  console.log('\n✅ 完了');
}

main().catch(console.error);
