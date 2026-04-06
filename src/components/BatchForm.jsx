import { useState } from 'react'

const STYLES = [
  { value: 'circular', label: '円形スタンプ（駅スタンプ風）' },
  { value: 'square', label: '方形スタンプ' },
  { value: 'freeform', label: 'フリーフォーム' },
]

const PRESET_PALETTES = [
  { name: '蘇芳（神社）', colors: ['#9E3D3F', '#6B3A3A'] },
  { name: '鶸茶（寺院）', colors: ['#8F8667', '#6B6347'] },
  { name: '縹色（駅）', colors: ['#2B618F', '#1E4460'] },
  { name: '老竹（道の駅）', colors: ['#769164', '#4D6340'] },
  { name: '丁子茶（温泉）', colors: ['#B4866B', '#8B6347'] },
  { name: '江戸紫（美術館）', colors: ['#745399', '#523A70'] },
]

const STORAGE_KEY = 'lbs-stamp-studio-gemini-key'

export default function BatchForm({ stamps, setStamps, ngReasons }) {
  const [spotName, setSpotName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [area, setArea] = useState('asakusa')
  const [palette, setPalette] = useState(['#9E3D3F', '#6B3A3A'])
  const [style, setStyle] = useState('circular')
  const [count, setCount] = useState(4)
  const [generating, setGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState([])
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [showKeyInput, setShowKeyInput] = useState(false)

  const DEFAULT_PROMPT = `Japanese rubber stamp design for a location-based stamp collection app.
Category: Location Stamp

=== BACKGROUND (CRITICAL) ===
The background outside the stamp circle MUST be PURE WHITE (#FFFFFF).
NO texture, NO grain, NO off-white outside the circle.

=== STAMP FORMAT ===
CIRCULAR ink stamp, fills ~90% canvas height. Pure white background outside.
NO rectangular frames. NOT a postage stamp.

=== INSIDE THE STAMP ===
Street View perspective of {SPOT_NAME}. Landmark silhouette fills ~45–55% of the circle.

=== INK TEXTURE ===
Subtle rubber-stamp ink effect. Gentle ink bleed at edges.

=== COLOR ===
Use 2–4 ink colors from: {PALETTE}.
Colors appear as absorbed ink, slightly muted. DO NOT use white inside.

=== VISUAL STYLE ===
Flat graphic shapes, Showa-era retro. NO gradients, NO 3D, NO photorealism.
Image size: 1024x1024 pixels.`

  const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT)

  const saveApiKey = (key) => {
    setApiKey(key)
    if (key) localStorage.setItem(STORAGE_KEY, key)
    else localStorage.removeItem(STORAGE_KEY)
  }

  const handleGenerate = async () => {
    if (!spotName.trim()) return
    if (!apiKey) {
      setShowKeyInput(true)
      return
    }

    setGenerating(true)
    setGeneratedImages([])

    const prompt = promptTemplate
      .replace(/\{SPOT_NAME\}/g, spotName)
      .replace(/\{PALETTE\}/g, palette.join(', '))

    try {
      // Dynamic import of Gemini SDK
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-image',
        generationConfig: { responseModalities: ['image', 'text'] },
      })

      const results = []
      for (let i = 0; i < count; i++) {
        try {
          const result = await model.generateContent(prompt)
          for (const candidate of result.response.candidates) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                const dataUrl = `data:image/png;base64,${part.inlineData.data}`
                results.push({
                  id: `gen_${Date.now()}_${i}`,
                  dataUrl,
                  spotName,
                  variant: i,
                })
              }
            }
          }
          // レート制限対策
          if (i < count - 1) await new Promise(r => setTimeout(r, 3000))
        } catch (err) {
          console.error(`Generation ${i} failed:`, err)
          results.push({ id: `err_${i}`, error: err.message, variant: i })
        }
      }

      setGeneratedImages(results)
    } catch (err) {
      alert(`Gemini API error: ${err.message}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="batch-form">
      {/* API Key設定 */}
      <div className="form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Gemini API Key</label>
          <span style={{ fontSize: 11, color: apiKey ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {apiKey ? '✅ 設定済み' : '❌ 未設定'}
          </span>
        </div>
        {(!apiKey || showKeyInput) ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={e => saveApiKey(e.target.value)}
              style={{ flex: 1 }}
            />
            {showKeyInput && apiKey && (
              <button className="filter-btn" onClick={() => setShowKeyInput(false)}>OK</button>
            )}
          </div>
        ) : (
          <button className="filter-btn" onClick={() => setShowKeyInput(true)} style={{ fontSize: 11 }}>
            キーを変更
          </button>
        )}
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
          Google AI Studio で取得: https://aistudio.google.com/
        </p>
      </div>

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
        <label>エリア</label>
        <select value={area} onChange={e => setArea(e.target.value)}>
          <option value="asakusa">浅草</option>
          <option value="shibuya">渋谷</option>
          <option value="shinjuku">新宿</option>
        </select>
      </div>

      <div className="form-group">
        <label>位置情報（緯度・経度）</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" step="0.0001" placeholder="緯度" value={lat} onChange={e => setLat(e.target.value)} style={{ flex: 1 }} />
          <input type="number" step="0.0001" placeholder="経度" value={lng} onChange={e => setLng(e.target.value)} style={{ flex: 1 }} />
        </div>
      </div>

      <div className="form-group">
        <label>構図スタイル</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          {STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label>パレットプリセット（日本の伝統色）</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_PALETTES.map(p => (
            <button key={p.name} className="filter-btn"
              style={{ border: JSON.stringify(palette) === JSON.stringify(p.colors) ? '2px solid var(--accent)' : undefined }}
              onClick={() => setPalette(p.colors)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {p.colors.map((c, i) => (
                  <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, display: 'inline-block' }} />
                ))}
                <span>{p.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>候補数: {count}</label>
        <input type="range" min={1} max={10} value={count} onChange={e => setCount(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div className="form-group">
        <label>プロンプトテンプレート（編集可能）</label>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
          変数: {'{SPOT_NAME}'} → スポット名 / {'{PALETTE}'} → パレット
        </div>
        <textarea rows={10} style={{ fontSize: 12, lineHeight: 1.5 }} value={promptTemplate} onChange={e => setPromptTemplate(e.target.value)} />
      </div>

      <button className="generate-btn" disabled={!spotName.trim() || generating} onClick={handleGenerate}>
        {generating ? `生成中...` : `${count}候補を生成`}
      </button>

      {/* 生成結果 */}
      {generatedImages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
            生成結果 ({generatedImages.filter(g => g.dataUrl).length}/{count})
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
            {generatedImages.map(img => (
              <div key={img.id} style={{ background: 'var(--bg)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                {img.dataUrl ? (
                  <>
                    <img src={img.dataUrl} alt={`v${img.variant}`} style={{ width: '100%', borderRadius: 6 }} />
                    <a href={img.dataUrl} download={`${spotName}_v${img.variant}.png`}
                      style={{ fontSize: 10, color: 'var(--accent)', display: 'block', marginTop: 4 }}>
                      ダウンロード
                    </a>
                  </>
                ) : (
                  <div style={{ padding: 20, color: 'var(--accent-red)', fontSize: 11 }}>
                    ❌ {img.error?.substring(0, 50)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
