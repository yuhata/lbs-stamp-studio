// 共通ヘルパー
// - console.error を補足して test 側で assert できるようにする
// - localStorage シーディングを統一

export function attachConsoleErrorCollector(page) {
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Firestore/Firebase の匿名認証は e2e 環境では 400 を返すことがあるため無視
      if (/firestore|FIRESTORE|firebase|installations|identitytoolkit|WebChannelConnection/i.test(text)) return
      // react-leaflet / Vite HMR のノイズも無視
      if (/\[vite\]/i.test(text)) return
      errors.push(text)
    }
  })
  page.on('pageerror', err => {
    errors.push(`pageerror: ${err.message}`)
  })
  return errors
}

export async function clearStudioStorage(page) {
  await page.addInitScript(() => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('lbs-stamp-studio-'))
        .forEach(k => localStorage.removeItem(k))
    } catch {}
  })
}

export async function seedLegacyAreas(page) {
  // 旧 14 エリア形式を localStorage に投入
  await page.addInitScript(() => {
    const LEGACY = {
      asakusa: { label: '浅草エリア', palette: ['#9E3D3F'], style: '円形', description: '旧' },
      shibuya: { label: '渋谷エリア', palette: ['#745399'], style: '円形', description: '旧' },
      shinjuku: { label: '新宿エリア', palette: ['#B4866B'], style: '円形', description: '旧' },
      akihabara: { label: '秋葉原エリア', palette: ['#2B618F'], style: '円形', description: '旧' },
      ueno: { label: '上野エリア', palette: ['#5B8930'], style: '円形', description: '旧' },
      harajuku: { label: '原宿エリア', palette: ['#E87BA1'], style: '円形', description: '旧' },
      roppongi: { label: '六本木エリア', palette: ['#1A1A2E'], style: '円形', description: '旧' },
      ginza: { label: '銀座エリア', palette: ['#C0A36E'], style: '円形', description: '旧' },
      nihonbashi: { label: '日本橋エリア', palette: ['#6C6A6C'], style: '円形', description: '旧' },
      tsukiji: { label: '築地エリア', palette: ['#2B618F'], style: '円形', description: '旧' },
      ikebukuro: { label: '池袋エリア', palette: ['#FF6B35'], style: '円形', description: '旧' },
      ryogoku: { label: '両国エリア', palette: ['#9E3D3F'], style: '円形', description: '旧' },
      skytree: { label: 'スカイツリー', palette: ['#2B4B6F'], style: '円形', description: '旧' },
      tokyotower: { label: '東京タワー', palette: ['#FF6B35'], style: '円形', description: '旧' },
    }
    localStorage.setItem('lbs-stamp-studio-areas', JSON.stringify(LEGACY))
  })
}

export async function gotoTab(page, tabLabel) {
  await page.getByRole('button', { name: tabLabel, exact: true }).click()
}

// App コンポーネント（管理画面）を描画するには #studio ハッシュが必要
export async function gotoStudio(page) {
  await page.goto('./#studio')
}
