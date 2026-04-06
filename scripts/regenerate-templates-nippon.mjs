/**
 * テンプレートスタンプ再生成 — 日本の伝統色パレット (nipponcolors.com)
 * Gemini 2.5 Flash Imageで9カテゴリ分のベースデザイン + テキスト合成版を生成
 *
 * 使い方:
 *   node scripts/regenerate-templates-nippon.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';
import sharp from 'sharp';
import fs from 'fs';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const OUTPUT_DIR = path.resolve('public/template-designs-v3');
const WITH_TEXT_DIR = path.join(OUTPUT_DIR, 'with-text');

// 日本の伝統色パレット
const CATEGORIES = {
  shrine: {
    color: '#9E3D3F',  // 蘇芳 suou
    illustration: 'Torii gate with path and pine trees',
    textName: '明治神宮',
  },
  temple: {
    color: '#8F8667',  // 鶸茶 hiwacha
    illustration: '3-story pagoda with garden element',
    textName: '金閣寺',
  },
  station: {
    color: '#2B618F',  // 縹色 hanada
    illustration: 'Station building with clock tower and short tracks',
    textName: '東京駅',
  },
  castle: {
    color: '#6C6A6C',  // 鈍色 nibi-iro
    illustration: 'Japanese castle with stone walls and moat',
    textName: '姫路城',
  },
  lighthouse: {
    color: '#2B4B6F',  // 紺青 konjou
    illustration: 'Lighthouse with light beams and seagulls, no waves',
    textName: '犬吠埼灯台',
  },
  rest_area: {
    color: '#769164',  // 老竹 oitake
    illustration: 'Mountains, rustic building, road',
    textName: '道の駅 富士吉田',
  },
  onsen: {
    color: '#B4866B',  // 丁子茶 choujicha
    illustration: 'Steam lines, hot spring bath, rocks, bamboo fence',
    textName: '草津温泉',
  },
  museum: {
    color: '#745399',  // 江戸紫 edomurasaki
    illustration: 'Classical building with columns and art palette',
    textName: '東京国立博物館',
  },
  zoo: {
    color: '#5B8930',  // 萌黄 moegi
    illustration: 'Elephant, giraffe, penguin, trees, fence',
    textName: '旭山動物園',
  },
};

function buildPrompt(category, color, illustration) {
  return `Japanese rubber stamp design for a location-based stamp collection app.
Category: ${category}

=== LAYOUT ===
Top 70-75%: Illustration. Bottom 25-30%: Empty for text overlay.

=== STAMP FORMAT ===
- CIRCULAR stamp, double concentric border rings with generous inner margin
- Single ink color: ${color} on pure white (#FFFFFF)
- Rubber stamp ink texture (slight unevenness)
- 1024x1024 pixels

=== ILLUSTRATION ===
${illustration}

=== RULES ===
- NO text, NO letters, NO numbers
- Flat, Showa-era retro style
- Bottom 25% MUST be blank`;
}

// 円外の白背景を透過
async function removeBackgroundOutsideCircle(imageBuffer) {
  const { data, info } = await sharp(imageBuffer)
    .resize(1024, 1024)
    .ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height;
  const cx = w / 2, cy = h / 2;

  // 円の半径を検出
  let stampRadius = 0;
  for (let r = Math.min(cx, cy) - 1; r > 50; r--) {
    let darkPixels = 0;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const px = Math.round(cx + r * Math.cos(angle));
      const py = Math.round(cy + r * Math.sin(angle));
      const idx = (py * w + px) * 4;
      const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      if (avg < 200) darkPixels++;
    }
    if (darkPixels >= 3) { stampRadius = r + 5; break; }
  }
  if (stampRadius === 0) stampRadius = Math.min(cx, cy) * 0.9;

  const threshold = 240;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const idx = (y * w + x) * 4;
      if (dist > stampRadius) {
        if (data[idx] > threshold && data[idx + 1] > threshold && data[idx + 2] > threshold) {
          data[idx + 3] = 0;
        }
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

// テキスト合成: Sharp SVGオーバーレイでスポット名を追加
async function compositeText(baseBuffer, text, color) {
  const meta = await sharp(baseBuffer).metadata();
  const w = meta.width || 1024;
  const h = meta.height || 1024;

  // テキストのY位置: 画像の75%
  const textY = Math.round(h * 0.75);
  const nameLen = text.length;
  const fontSize = nameLen <= 4 ? 56 : nameLen <= 6 ? 46 : nameLen <= 8 ? 38 : 30;

  const textSvg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <text x="${w / 2}" y="${textY}" text-anchor="middle"
          font-size="${fontSize}" font-weight="bold"
          font-family="Hiragino Sans, Noto Sans JP, sans-serif"
          fill="${color}" opacity="0.9">${text}</text>
  </svg>`;

  return sharp(baseBuffer)
    .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not found. Check ../../.env');
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(WITH_TEXT_DIR, { recursive: true });

  console.log('=== テンプレートスタンプ再生成 v3 (日本の伝統色) ===\n');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: { responseModalities: ['image', 'text'] },
  });

  const categories = Object.entries(CATEGORIES);
  let generated = 0, failed = 0;

  for (const [cat, def] of categories) {
    console.log(`\n--- ${cat} (${def.color}) ---`);

    const basePath = path.join(OUTPUT_DIR, `${cat}.png`);
    const textPath = path.join(WITH_TEXT_DIR, `${cat}_${def.textName.replace(/[\/\\:*?"<>| ]/g, '_')}.png`);

    try {
      // 1. Geminiで基本デザイン生成
      const prompt = buildPrompt(cat, def.color, def.illustration);
      console.log('  Generating base design...');
      const result = await model.generateContent(prompt);

      let imageBuffer = null;
      for (const candidate of result.response.candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          }
        }
      }

      if (!imageBuffer) {
        console.log('  [FAIL] No image returned');
        failed++;
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      // 2. 背景透過
      console.log('  Removing background...');
      const transparent = await removeBackgroundOutsideCircle(imageBuffer);
      fs.writeFileSync(basePath, transparent);
      const size = (transparent.length / 1024).toFixed(0);
      console.log(`  [OK] Base: ${basePath} (${size}KB)`);

      // 3. テキスト合成版
      console.log(`  Compositing text: ${def.textName}`);
      const withText = await compositeText(transparent, def.textName, def.color);
      fs.writeFileSync(textPath, withText);
      console.log(`  [OK] With text: ${textPath}`);

      generated++;

      // レート制限回避: 5秒待機
      if (categories.indexOf([cat, def]) < categories.length - 1) {
        console.log('  Waiting 5s...');
        await new Promise(r => setTimeout(r, 5000));
      }
    } catch (e) {
      console.log(`  [FAIL] ${e.message.substring(0, 150)}`);
      failed++;
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log(`\n=== 完了 ===`);
  console.log(`生成: ${generated}件, 失敗: ${failed}件`);
  console.log(`出力先: ${OUTPUT_DIR}`);

  // ファイル一覧
  console.log('\nBase designs:');
  fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png')).forEach(f => {
    const size = (fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024).toFixed(0);
    console.log(`  ${f} (${size}KB)`);
  });
  console.log('\nWith text:');
  if (fs.existsSync(WITH_TEXT_DIR)) {
    fs.readdirSync(WITH_TEXT_DIR).forEach(f => {
      const size = (fs.statSync(path.join(WITH_TEXT_DIR, f)).size / 1024).toFixed(0);
      console.log(`  ${f} (${size}KB)`);
    });
  }
}

main().catch(console.error);
