/**
 * Stampiko ロゴ生成 — Gemini 2.5 Flash Image
 * ブランディングガイドに基づく朱印スタイルのロゴバリエーション
 */
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const OUTPUT_DIR = path.resolve('public/stampiko-logos');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const LOGO_PROMPTS = [
  {
    name: 'shuin_seal_v1',
    desc: '朱印シールスタイル（ガイド準拠）',
    prompt: `Design a logo for "STAMPIKO", a Japanese location-based stamp collection app.

STYLE: Traditional Japanese shuin (御朱印) vermillion seal / rubber stamp aesthetic.

COMPOSITION:
- Double concentric circle border (outer ring + inner ring)
- "STAMPIKO" text arcing along the upper portion inside the inner circle
- Two stylized diagonal footstep shapes (ellipses) in the center, representing forward movement ("iko" = let's go)
- The footsteps should be positioned diagonally: left-back, right-front, showing walking motion

COLOR:
- Vermillion red ink (#C8442A) on pure white (#FFFFFF) background
- Subtle rubber stamp ink texture — slight unevenness, gentle ink bleed
- The stamp impression should look like it was physically pressed

VISUAL RULES:
- Flat vector style, NO gradients, NO 3D effects
- NO photorealism
- Clean, bold, readable at small sizes
- The overall impression should feel like an actual rubber stamp pressed on paper
- Image size: 1024x1024 pixels
- Pure white background outside the seal`,
  },
  {
    name: 'shuin_seal_v2',
    desc: '朱印シール（テクスチャ強め）',
    prompt: `Design a circular rubber stamp logo for "STAMPIKO".

This is a Japanese location-based exploration app. The logo should look like a real vermillion ink stamp (朱印 / shuin style) that has been physically pressed onto paper.

MUST INCLUDE:
- Circular stamp shape with double border rings
- "STAMPIKO" text in the upper arc
- Two footprint/footstep shapes in the center (representing "let's go")
- Authentic rubber stamp texture: ink pressure variations, slight bleeding at edges, areas of lighter/heavier ink impression

COLOR: Deep vermillion red (#C8442A) ink only. Pure white (#FFFFFF) background.
NO other colors. NO gradients. NO 3D.

The stamp should look aged and authentic, like a traditional Japanese temple seal stamp.
Image: 1024x1024 pixels.`,
  },
  {
    name: 'minimal_icon_v1',
    desc: 'ミニマルアイコン（アプリアイコン向け）',
    prompt: `Design a minimal app icon for "STAMPIKO", a stamp collection app.

COMPOSITION:
- Solid vermillion red (#C8442A) square background with rounded corners
- White double concentric circle in the center
- Two white footstep/footprint ellipse shapes inside the circle, positioned diagonally to show forward movement
- NO text (icon must work at 48px)

STYLE:
- Clean, minimal, flat design
- High contrast: white elements on red background
- Subtle rubber stamp ink texture on the circle borders
- Must be instantly recognizable at small sizes

Image: 1024x1024 pixels. Solid red background, no transparency.`,
  },
  {
    name: 'wordmark_v1',
    desc: 'ワードマーク（横長）',
    prompt: `Design a horizontal wordmark logo for "STAMPIKO".

COMPOSITION:
- Left side: Small circular seal icon (double ring + footstep shapes inside)
- Right side: The word "stampiko" in lowercase
  - "stamp" in thin weight, dark color (#2C2C2A)
  - "iko" in bold weight, vermillion red (#C8442A)
- Clean horizontal layout, left-to-right reading

STYLE:
- Modern sans-serif typography
- The seal icon should have subtle ink texture
- Clean, professional, suitable for business cards and presentations
- Pure white (#FFFFFF) background

Image: 1200x400 pixels (3:1 ratio, horizontal).`,
  },
  {
    name: 'shuin_seal_v3',
    desc: '朱印シール（地図ピン融合）',
    prompt: `Design a circular stamp logo for "STAMPIKO" that combines a traditional Japanese seal with a location pin concept.

COMPOSITION:
- Circular rubber stamp shape with double border
- "STAMPIKO" text arcing in the upper portion
- Center: A stylized map pin / location marker that incorporates footstep shapes
- The map pin should feel organic, not digital — as if carved into the stamp

COLOR: Vermillion red (#C8442A) ink on pure white (#FFFFFF).
Rubber stamp texture with authentic ink impression feel.

STYLE: Flat, no gradients, Japanese shuin aesthetic meets modern location-based service.
Image: 1024x1024 pixels.`,
  },
  {
    name: 'shuin_seal_v4',
    desc: '朱印シール（鳥居モチーフ）',
    prompt: `Design a circular rubber stamp logo for "STAMPIKO", a location-based stamp collection app focused on Japanese landmarks.

COMPOSITION:
- Circular stamp with double concentric border rings
- "STAMPIKO" text arcing along the top inside
- Center: A minimalist torii gate silhouette with a path/road leading to it
- Below the torii: two small footstep shapes walking toward the gate

COLOR: Single color — vermillion red (#C8442A) on pure white (#FFFFFF).
Authentic rubber stamp ink texture.

This should look like a traditional Japanese station stamp (ekisutanpu) design.
Flat vector, no gradients, no 3D. 1024x1024 pixels.`,
  },
];

async function main() {
  console.log('=== Stampiko ロゴ生成 ===\n');

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: { responseModalities: ['image', 'text'] }
  });

  for (const logo of LOGO_PROMPTS) {
    console.log(`🎨 ${logo.name}: ${logo.desc}`);
    try {
      const result = await model.generateContent(logo.prompt);
      let imageBuffer = null;
      for (const candidate of result.response.candidates) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            imageBuffer = Buffer.from(part.inlineData.data, 'base64');
          }
        }
      }

      if (!imageBuffer) { console.log('  ❌ No image\n'); continue; }

      const outPath = path.join(OUTPUT_DIR, `${logo.name}.png`);
      fs.writeFileSync(outPath, imageBuffer);
      console.log(`  ✅ ${(imageBuffer.length / 1024).toFixed(0)}KB\n`);

      await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      console.log(`  ❌ ${e.message.substring(0, 120)}\n`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log('📁 Output:');
  fs.readdirSync(OUTPUT_DIR).forEach(f => {
    const size = (fs.statSync(path.join(OUTPUT_DIR, f)).size / 1024).toFixed(0);
    console.log(`  ${f} (${size}KB)`);
  });
}

main().catch(console.error);
