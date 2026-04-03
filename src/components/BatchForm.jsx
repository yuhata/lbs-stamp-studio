import { useState } from 'react'

const STYLES = [
  { value: 'circular', label: '円形スタンプ（駅スタンプ風）' },
  { value: 'square', label: '方形スタンプ' },
  { value: 'freeform', label: 'フリーフォーム' },
]

const PRESET_PALETTES = [
  { name: '浅草（赤系）', colors: ['#C0392B', '#8B4513'] },
  { name: '渋谷（紫系）', colors: ['#6A1B9A', '#1A237E'] },
  { name: '新宿（橙系）', colors: ['#BF360C', '#F57F17'] },
  { name: '自然（緑系）', colors: ['#1B5E20', '#3E2723'] },
  { name: '海（青系）', colors: ['#0D47A1', '#546E7A'] },
]

export default function BatchForm({ stamps, setStamps }) {
  const [spotName, setSpotName] = useState('')
  const [palette, setPalette] = useState(['#C0392B', '#8B4513'])
  const [style, setStyle] = useState('circular')
  const [count, setCount] = useState(10)
  const [generating, setGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!spotName.trim()) return
    setGenerating(true)

    // Gemini API未接続時はダミー生成のメッセージを表示
    setTimeout(() => {
      alert(`Gemini APIが未接続です。\n\n接続後、以下の設定でバッチ生成されます:\n\nスポット: ${spotName}\nパレット: ${palette.join(', ')}\nスタイル: ${style}\n候補数: ${count}`)
      setGenerating(false)
    }, 500)
  }

  return (
    <div className="batch-form">
      <div className="form-group">
        <label>スポット名</label>
        <input
          type="text"
          placeholder="例: 雷門、渋谷スクランブル交差点"
          value={spotName}
          onChange={e => setSpotName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>構図スタイル</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          {STYLES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>パレットプリセット</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_PALETTES.map(p => (
            <button
              key={p.name}
              className="filter-btn"
              style={{
                border: JSON.stringify(palette) === JSON.stringify(p.colors)
                  ? '2px solid var(--accent)' : undefined
              }}
              onClick={() => setPalette(p.colors)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.colors.map((c, i) => (
                  <span key={i} style={{
                    width: 12, height: 12, borderRadius: 3,
                    background: c, display: 'inline-block'
                  }} />
                ))}
                <span>{p.name}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="palette-preview">
          {palette.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
              <div className="color-swatch" style={{ background: c }} />
              <input
                type="text"
                value={c}
                onChange={e => {
                  const next = [...palette]
                  next[i] = e.target.value
                  setPalette(next)
                }}
                style={{ width: 90, padding: '4px 8px', fontSize: 12 }}
              />
            </div>
          ))}
          <button
            className="filter-btn"
            style={{ marginTop: 8, alignSelf: 'flex-end' }}
            onClick={() => setPalette([...palette, '#666666'])}
          >+ 色追加</button>
        </div>
      </div>

      <div className="form-group">
        <label>候補数: {count}</label>
        <input
          type="range"
          min={5}
          max={20}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      <div className="form-group">
        <label>プロンプトテンプレート（読み取り専用）</label>
        <textarea
          rows={6}
          readOnly
          style={{ fontSize: 11, opacity: 0.7 }}
          value={`Japanese station stamp — a rubber ink impression.
Subject silhouette: ${spotName || '{SPOT_NAME}'}
Palette: ${palette.join(', ')}
Style: ${style}

No letters, kanji, kana, numbers, dates, labels, or symbols anywhere.
CIRCULAR ink stamp, Showa-era retro illustration, flat graphic shapes.`}
        />
      </div>

      <button
        className="generate-btn"
        disabled={!spotName.trim() || generating}
        onClick={handleGenerate}
      >
        {generating ? '生成中...' : `${count}候補を一括生成`}
      </button>

      <div className="api-notice">
        Gemini API未接続 — 課金設定後に実画像生成が有効になります。
        現在はダミー画像でワークフローを確認できます。
      </div>
    </div>
  )
}
