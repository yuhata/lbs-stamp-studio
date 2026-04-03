/**
 * ダミースタンプ画像を生成（Gemini課金前の代替）
 * パイロットエリアのスポットごとに複数候補を生成
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.resolve('public/stamps');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// パイロットエリアのスポット
const spots = [
  { id: 'kaminarimon', name: '雷門', area: 'asakusa', palette: ['#C0392B', '#8B4513'] },
  { id: 'sensoji', name: '浅草寺', area: 'asakusa', palette: ['#B71C1C', '#4E342E'] },
  { id: 'skytree', name: 'スカイツリー', area: 'asakusa', palette: ['#1565C0', '#37474F'] },
  { id: 'scramble', name: '渋谷スクランブル', area: 'shibuya', palette: ['#6A1B9A', '#1A237E'] },
  { id: 'hachiko', name: 'ハチ公像', area: 'shibuya', palette: ['#E65100', '#4E342E'] },
  { id: 'meiji', name: '明治神宮', area: 'shibuya', palette: ['#1B5E20', '#3E2723'] },
  { id: 'omoide', name: '思い出横丁', area: 'shinjuku', palette: ['#BF360C', '#F57F17'] },
  { id: 'godzilla', name: 'ゴジラヘッド', area: 'shinjuku', palette: ['#212121', '#1B5E20'] },
  { id: 'tocho', name: '東京都庁', area: 'shinjuku', palette: ['#0D47A1', '#546E7A'] },
];

// スタンプSVGテンプレート — バリエーションを複数パターン生成
function generateStampSVG(spot, variant) {
  const size = 512;
  const cx = size / 2, cy = size / 2;
  const r = size * 0.42;
  const c1 = spot.palette[0], c2 = spot.palette[1];

  // バリエーション別の構図
  const variants = {
    0: { // 中央にランドマーク（大）
      landmark: `
        <polygon points="256,90 230,240 282,240" fill="${c1}" opacity="0.9"/>
        <rect x="220" y="240" width="72" height="50" fill="${c1}" opacity="0.8"/>
        <rect x="190" y="270" width="132" height="25" fill="${c2}" opacity="0.7"/>
        <ellipse cx="256" cy="340" rx="130" ry="18" fill="${c2}" opacity="0.4"/>`,
      texture: `
        <circle cx="170" cy="170" r="45" fill="${c2}" opacity="0.12"/>
        <circle cx="340" cy="310" r="35" fill="${c1}" opacity="0.08"/>`,
    },
    1: { // 左寄りランドマーク + 右に木
      landmark: `
        <polygon points="200,110 178,260 222,260" fill="${c1}" opacity="0.85"/>
        <rect x="175" y="260" width="50" height="40" fill="${c1}" opacity="0.75"/>
        <circle cx="330" cy="230" r="45" fill="${c2}" opacity="0.5"/>
        <rect x="326" y="270" width="8" height="50" fill="${c2}" opacity="0.6"/>
        <ellipse cx="256" cy="340" rx="120" ry="16" fill="${c2}" opacity="0.35"/>`,
      texture: `
        <circle cx="350" cy="150" r="30" fill="${c1}" opacity="0.1"/>
        <circle cx="150" cy="330" r="25" fill="${c2}" opacity="0.08"/>`,
    },
    2: { // ワイド構図
      landmark: `
        <rect x="160" y="180" width="192" height="100" rx="8" fill="${c1}" opacity="0.8"/>
        <polygon points="256,120 180,180 332,180" fill="${c1}" opacity="0.85"/>
        <rect x="200" y="210" width="25" height="40" fill="white" opacity="0.3"/>
        <rect x="245" y="210" width="25" height="40" fill="white" opacity="0.3"/>
        <rect x="290" y="210" width="25" height="40" fill="white" opacity="0.3"/>
        <ellipse cx="256" cy="330" rx="140" ry="20" fill="${c2}" opacity="0.4"/>`,
      texture: `
        <circle cx="160" cy="360" r="20" fill="${c1}" opacity="0.12"/>
        <circle cx="370" cy="170" r="28" fill="${c2}" opacity="0.09"/>`,
    },
    3: { // 丸みのある構造物
      landmark: `
        <circle cx="256" cy="200" r="70" fill="${c1}" opacity="0.8"/>
        <circle cx="256" cy="200" r="50" fill="${c2}" opacity="0.3"/>
        <rect x="240" y="270" width="32" height="50" fill="${c1}" opacity="0.7"/>
        <rect x="210" y="310" width="92" height="15" fill="${c2}" opacity="0.6"/>
        <ellipse cx="256" cy="350" rx="100" ry="14" fill="${c2}" opacity="0.3"/>`,
      texture: `
        <circle cx="170" cy="300" r="22" fill="${c1}" opacity="0.1"/>
        <circle cx="350" cy="170" r="18" fill="${c2}" opacity="0.07"/>`,
    },
  };

  const v = variants[variant % 4];
  // インクのかすれ・にじみ効果（バリエーション別に変える）
  const inkBlots = Array.from({ length: 3 + variant }, (_, i) => {
    const bx = 100 + Math.floor((i * 137 + variant * 53) % 312);
    const by = 100 + Math.floor((i * 173 + variant * 89) % 312);
    const br = 3 + (i * 7 + variant * 3) % 6;
    return `<circle cx="${bx}" cy="${by}" r="${br}" fill="${i % 2 === 0 ? c1 : c2}" opacity="${0.15 + (i % 3) * 0.08}"/>`;
  }).join('\n    ');

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#FFFFFF"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c1}" stroke-width="${7 + variant}" opacity="${0.85 + variant * 0.03}"/>
    <circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="${c1}" stroke-width="2.5" opacity="${0.55 + variant * 0.05}"/>
    ${v.landmark}
    ${v.texture}
    ${inkBlots}
  </svg>`;
}

async function main() {
  console.log('=== ダミースタンプ生成 ===\n');
  const candidatesPerSpot = 4;
  const manifest = [];

  for (const spot of spots) {
    const spotDir = path.join(OUTPUT_DIR, spot.area);
    if (!fs.existsSync(spotDir)) fs.mkdirSync(spotDir, { recursive: true });

    for (let v = 0; v < candidatesPerSpot; v++) {
      const svg = generateStampSVG(spot, v);
      const buffer = await sharp(Buffer.from(svg)).png().toBuffer();

      // Sharp透過処理
      const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const threshold = 230;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > threshold && data[i+1] > threshold && data[i+2] > threshold) {
          data[i+3] = 0;
        }
      }
      const transparent = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 }
      }).png().toBuffer();

      const filename = `${spot.id}_v${v}.png`;
      const filepath = path.join(spotDir, filename);
      fs.writeFileSync(filepath, transparent);

      manifest.push({
        id: `${spot.id}_v${v}`,
        spotId: spot.id,
        spotName: spot.name,
        area: spot.area,
        variant: v,
        filename,
        path: `stamps/${spot.area}/${filename}`,
        status: 'draft',
        designerNote: null,
      });
    }
    console.log(`✅ ${spot.name}: ${candidatesPerSpot}候補生成`);
  }

  // マニフェストJSON出力（UIが読み込む）
  const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest: ${manifestPath} (${manifest.length}件)`);
}

main().catch(console.error);
