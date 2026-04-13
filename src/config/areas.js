/**
 * Stampiko 25エリア（正式マスター）
 * 同期元: stampiko-app/LBS_Stamp_API/scripts/seed-areas-collection.js
 *
 * エリア編集・追加/削除は管理者パネルから可能。ここは初期値。
 */

export const CANONICAL_AREAS = [
  // Zone A（北東・下町）
  { id: 'asakusa',       name: '浅草・雷門',           name_en: 'Asakusa',             zone: 'A', color: '#C8442A' },
  { id: 'ueno',          name: '上野',                 name_en: 'Ueno',                zone: 'A', color: '#2E7D32' },
  { id: 'skytree',       name: 'スカイツリー・押上',   name_en: 'Skytree',             zone: 'A', color: '#00ACC1' },
  { id: 'yanesen',       name: '谷中・根津・千駄木',   name_en: 'Yanesen',             zone: 'A', color: '#795548' },
  { id: 'akihabara',     name: '秋葉原・神田',         name_en: 'Akihabara',           zone: 'A', color: '#E91E63' },
  { id: 'akabane',       name: '赤羽・王子',           name_en: 'Akabane-Oji',         zone: 'A', color: '#FF7043' },

  // Zone B（中央・都心）
  { id: 'tokyo',         name: '東京・丸の内',         name_en: 'Tokyo-Marunouchi',    zone: 'B', color: '#1565C0' },
  { id: 'ginza',         name: '銀座・築地',           name_en: 'Ginza-Tsukiji',       zone: 'B', color: '#FFD700' },
  { id: 'shimbashi',     name: '新橋・東京タワー',     name_en: 'Shimbashi-TokyoTower',zone: 'B', color: '#FF5722' },
  { id: 'hamamatsucho',  name: '浜松町',               name_en: 'Hamamatsucho',        zone: 'B', color: '#78909C' },
  { id: 'shinagawa',     name: '品川',                 name_en: 'Shinagawa',           zone: 'B', color: '#5C6BC0' },
  { id: 'odaiba',        name: 'お台場・豊洲',         name_en: 'Odaiba-Toyosu',       zone: 'B', color: '#26C6DA' },
  { id: 'roppongi',      name: '六本木・麻布',         name_en: 'Roppongi',            zone: 'B', color: '#AB47BC' },
  { id: 'akasaka',       name: '赤坂・永田町',         name_en: 'Akasaka',             zone: 'B', color: '#C62828' },
  { id: 'suidobashi',    name: '水道橋・御茶ノ水',     name_en: 'Suidobashi',          zone: 'B', color: '#0277BD' },
  { id: 'iidabashi',     name: '飯田橋・神楽坂',       name_en: 'Iidabashi-Kagurazaka',zone: 'B', color: '#00897B' },

  // Zone C（北西）
  { id: 'sugamo',        name: '巣鴨・駒込',           name_en: 'Sugamo',              zone: 'C', color: '#8D6E63' },
  { id: 'ikebukuro',     name: '池袋',                 name_en: 'Ikebukuro',           zone: 'C', color: '#F57C00' },
  { id: 'takadanobaba',  name: '高田馬場・早稲田',     name_en: 'Takadanobaba',        zone: 'C', color: '#7B1FA2' },

  // Zone D（西南）
  { id: 'shinjuku',      name: '新宿',                 name_en: 'Shinjuku',            zone: 'D', color: '#303F9F' },
  { id: 'yoyogi',        name: '代々木',               name_en: 'Yoyogi',              zone: 'D', color: '#388E3C' },
  { id: 'harajuku',      name: '原宿・表参道',         name_en: 'Harajuku',            zone: 'D', color: '#E040FB' },
  { id: 'shibuya',       name: '渋谷',                 name_en: 'Shibuya',             zone: 'D', color: '#745399' },
  { id: 'ebisu',         name: '恵比寿・中目黒',       name_en: 'Ebisu-Nakameguro',    zone: 'D', color: '#EF6C00' },
  { id: 'shimokitazawa', name: '下北沢',               name_en: 'Shimokitazawa',       zone: 'D', color: '#009688' },
]

// id → 表示名 マップ
export const AREA_LABELS = Object.fromEntries(
  CANONICAL_AREAS.map(a => [a.id, a.name])
)

// id → 代表色 マップ
export const AREA_COLORS = Object.fromEntries(
  CANONICAL_AREAS.map(a => [a.id, a.color])
)

// AreaRules の初期設定フォーマット
export const DEFAULT_AREA_CONFIG = Object.fromEntries(
  CANONICAL_AREAS.map(a => [
    a.id,
    {
      label: `${a.name}エリア`,
      palette: [a.color],
      style: '円形',
      description: `${a.name}（Zone ${a.zone}）`,
    },
  ])
)
