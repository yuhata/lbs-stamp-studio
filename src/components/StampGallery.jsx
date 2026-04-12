import { useState, useEffect, useRef } from 'react'
import {
  DEFAULT_PROMPT, STORAGE_KEYS, API_URL,
  MOOD_OPTIONS, COLOR_COUNT_OPTIONS,
  buildDesignOptionsBlock,
} from '../config/promptDefaults'

const AREA_LABELS = {
  asakusa: '浅草',
  shibuya: '渋谷',
  shinjuku: '新宿',
  akihabara: '秋葉原',
  ueno: '上野',
  harajuku: '原宿',
  roppongi: '六本木',
  ginza: '銀座',
  nihonbashi: '日本橋',
  tsukiji: '築地',
  ikebukuro: '池袋',
  ryogoku: '両国',
  skytree: 'スカイツリー',
  tokyotower: '東京タワー',
  yanesen: '谷中・根津・千駄木',
  sugamo: '巣鴨・駒込',
  shimokitazawa: '下北沢',
  ebisu: '恵比寿・中目黒',
  iidabashi: '飯田橋・神楽坂',
  suidobashi: '水道橋・御茶ノ水',
  tokyo: '東京・丸の内',
  akabane: '赤羽・王子',
  akasaka: '赤坂・永田町',
  yoyogi: '代々木',
  takadanobaba: '高田馬場・早稲田',
  hamamatsucho: '浜松町',
  shinagawa: '品川',
  odaiba: 'お台場・豊洲',
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全て' },
  { value: 'draft', label: '未レビュー' },
  { value: 'approved', label: '承認済み' },
  { value: 'rejected', label: '却下' },
  { value: 'needs_edit', label: '要修正' },
]

// よくあるNG理由のプリセット（蓄積されたログから自動追加も可能）
const NG_PRESETS = [
  { label: 'テキスト混入', category: 'content', promptHint: 'テキスト・文字・数字の禁止を強化' },
  { label: '構図が偏っている', category: 'composition', promptHint: '中央配置・余白バランスの指示を追加' },
  { label: 'デジタル感が強い', category: 'texture', promptHint: 'インクテクスチャ・かすれ効果の指示を強化' },
  { label: 'パレット逸脱', category: 'color', promptHint: 'パレット制限の指示を厳格化' },
  { label: 'ランドマーク不明瞭', category: 'recognition', promptHint: 'シルエットの明確さ・サイズ比率の指示を追加' },
  { label: '背景が白くない', category: 'background', promptHint: '背景色 #FFFFFF の指定を明示' },
  { label: 'グラデーションあり', category: 'style', promptHint: 'NO gradients の指示を強調' },
  { label: '写実的すぎる', category: 'style', promptHint: 'flat graphic shapes, geometric simplification を強調' },
]

export default function StampGallery({
  stamps, setStamps, areas, filterArea, setFilterArea,
  filterStatus, setFilterStatus, updateStamp,
  addNgReason, ngReasons,
  focusSpotId, clearFocusSpot,
  onShowOnMap,
}) {
  const [selected, setSelected] = useState(null)
  const focusRef = useRef(null)

  // マップからのスポット選択時にスクロール
  useEffect(() => {
    if (focusSpotId && focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      clearFocusSpot()
    }
  }, [focusSpotId, clearFocusSpot])

  const filtered = stamps.filter(s => {
    if (filterArea !== 'all' && s.area !== filterArea) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  const grouped = {}
  filtered.forEach(s => {
    if (!grouped[s.spotId]) grouped[s.spotId] = { spotName: s.spotName, area: s.area, stamps: [] }
    grouped[s.spotId].stamps.push(s)
  })

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <label>エリア:</label>
          <select
            value={filterArea}
            onChange={e => setFilterArea(e.target.value)}
            className="filter-select"
          >
            <option value="all">全て</option>
            {areas.map(a => (
              <option key={a} value={a}>{AREA_LABELS[a] || a}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>ステータス:</label>
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`filter-btn ${filterStatus === o.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(o.value)}
            >{o.label}</button>
          ))}
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state"><p>該当するスタンプがありません</p></div>
      ) : (
        Object.entries(grouped).map(([spotId, group]) => (
          <div key={spotId}>
            <div style={{ padding: '12px 24px 0', fontSize: 14, color: '#fff', fontWeight: 600 }}>
              {group.spotName}
              <span style={{ fontSize: 11, color: '#ff6b35', marginLeft: 8 }}>
                {AREA_LABELS[group.area] || group.area}
              </span>
            </div>
            <div className="stamp-grid">
              {group.stamps.map(stamp => (
                <div key={stamp.id} ref={stamp.spotId === focusSpotId ? focusRef : null}>
                  <StampCard
                    stamp={stamp}
                    onClick={() => setSelected(stamp)}
                    updateStamp={updateStamp}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {selected && (
        <StampModal
          stamp={selected}
          onClose={() => setSelected(null)}
          updateStamp={(id, updates) => {
            updateStamp(id, updates)
            setSelected(prev => ({ ...prev, ...updates }))
          }}
          addNgReason={addNgReason}
          ngReasons={ngReasons}
          onShowOnMap={onShowOnMap}
          setStamps={setStamps}
        />
      )}
    </div>
  )
}

function StampCard({ stamp, onClick, updateStamp }) {
  const ngCount = (stamp.ngTags || []).length
  return (
    <div className="stamp-card" data-status={stamp.status} onClick={onClick}>
      <div className="stamp-image-wrapper">
        <img src={stamp.dataUrl || `${import.meta.env.BASE_URL}${stamp.path}`} alt={stamp.spotName} loading="lazy" />
        <span className="status-badge" data-status={stamp.status}>
          {stamp.status === 'approved' ? '承認' :
           stamp.status === 'rejected' ? '却下' :
           stamp.status === 'needs_edit' ? '要修正' : '未レビュー'}
        </span>
        {ngCount > 0 && (
          <span className="ng-count-badge">{ngCount} NG</span>
        )}
      </div>
      <div className="stamp-info">
        <span className="variant-label">候補 {stamp.variant + 1}</span>
      </div>
      <div className="stamp-actions" onClick={e => e.stopPropagation()}>
        <button className="action-btn approve" onClick={() => updateStamp(stamp.id, { status: 'approved' })}>承認</button>
        <button className="action-btn edit" onClick={() => updateStamp(stamp.id, { status: 'needs_edit' })}>要修正</button>
        <button className="action-btn reject" onClick={() => updateStamp(stamp.id, { status: 'rejected' })}>却下</button>
      </div>
    </div>
  )
}

function StampModal({ stamp, onClose, updateStamp, addNgReason, ngReasons, onShowOnMap, setStamps }) {
  const [note, setNote] = useState(stamp.designerNote || '')
  const [selectedTags, setSelectedTags] = useState(stamp.ngTags || [])
  const [customReason, setCustomReason] = useState('')

  // バリエーション生成
  const [showVariation, setShowVariation] = useState(false)
  const [varMood, setVarMood] = useState('')
  const [varColorCount, setVarColorCount] = useState('')
  const [varGenerating, setVarGenerating] = useState(false)
  const [varResults, setVarResults] = useState([])

  const handleGenerateVariation = async () => {
    setVarGenerating(true)
    setVarResults([])
    const basePrompt = localStorage.getItem(STORAGE_KEYS.PROMPT) || DEFAULT_PROMPT
    const optionBlock = buildDesignOptionsBlock({ mood: varMood, colorCount: varColorCount, elements: [] })
    const prompt = (basePrompt + optionBlock)
      .replace(/\{SPOT_NAME\}/g, stamp.spotName)
      .replace(/\{PALETTE\}/g, '') // パレット情報がスタンプにない場合はAI任せ
    try {
      const res = await fetch(`${API_URL}/api/generate-stamp-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count: 2 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'API error')
      const results = (data.results || []).filter(r => r.base64).map((r, i) => ({
        id: `var_${Date.now()}_${i}`,
        dataUrl: `data:${r.mimeType || 'image/png'};base64,${r.base64}`,
      }))
      setVarResults(results)
    } catch (err) {
      alert(`生成エラー: ${err.message}`)
    } finally {
      setVarGenerating(false)
    }
  }

  const addVariationToGallery = (varItem) => {
    const newStamp = {
      id: varItem.id,
      spotId: stamp.spotId,
      spotName: stamp.spotName,
      area: stamp.area,
      lat: stamp.lat || 0,
      lng: stamp.lng || 0,
      variant: Date.now(),
      path: null,
      dataUrl: varItem.dataUrl,
      status: 'draft',
      designerNote: '',
      ngTags: [],
    }
    setStamps(prev => [...prev, newStamp])
  }

  const toggleTag = (label) => {
    const next = selectedTags.includes(label)
      ? selectedTags.filter(t => t !== label)
      : [...selectedTags, label]
    setSelectedTags(next)
    updateStamp(stamp.id, { ngTags: next })
  }

  const handleReject = () => {
    // NG理由をログに記録
    const reasons = selectedTags.length > 0 ? selectedTags : (customReason ? [customReason] : ['理由未記入'])
    reasons.forEach(reason => {
      const preset = NG_PRESETS.find(p => p.label === reason)
      addNgReason({
        stampId: stamp.id,
        spotName: stamp.spotName,
        area: stamp.area,
        reason,
        category: preset?.category || 'other',
        promptHint: preset?.promptHint || '',
        customNote: note,
      })
    })
    updateStamp(stamp.id, { status: 'rejected', designerNote: note, ngTags: selectedTags })
  }

  const handleNeedsEdit = () => {
    const reasons = selectedTags.length > 0 ? selectedTags : (customReason ? [customReason] : [])
    reasons.forEach(reason => {
      const preset = NG_PRESETS.find(p => p.label === reason)
      addNgReason({
        stampId: stamp.id,
        spotName: stamp.spotName,
        area: stamp.area,
        reason,
        category: preset?.category || 'other',
        promptHint: preset?.promptHint || '',
        customNote: note,
      })
    })
    updateStamp(stamp.id, { status: 'needs_edit', designerNote: note, ngTags: selectedTags })
  }

  // このスタンプの過去NG履歴
  const stampHistory = ngReasons.filter(r => r.stampId === stamp.id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-image">
          <img src={stamp.dataUrl || `${import.meta.env.BASE_URL}${stamp.path}`} alt={stamp.spotName} />
        </div>
        <div className="modal-body">
          <h3>{stamp.spotName} — 候補 {stamp.variant + 1}</h3>
          <p style={{ fontSize: 13, color: '#888' }}>
            エリア: {AREA_LABELS[stamp.area] || stamp.area} / ステータス: {stamp.status}
          </p>

          {/* マップで確認ボタン */}
          {onShowOnMap && stamp.lat && stamp.lng && (
            <button
              onClick={() => { onShowOnMap(stamp.spotId); onClose() }}
              style={{
                marginTop: 8, padding: '6px 12px', background: 'none',
                border: '1px solid var(--accent-blue)', borderRadius: 6,
                color: 'var(--accent-blue)', fontSize: 12, cursor: 'pointer',
              }}
            >
              マップで位置を確認
            </button>
          )}

          {/* NG理由タグ選択 */}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              NG理由（複数選択可）:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {NG_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  className={`ng-tag ${selectedTags.includes(preset.label) ? 'selected' : ''}`}
                  onClick={() => toggleTag(preset.label)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* カスタム理由 */}
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              className="note-input"
              style={{ margin: 0, width: '100%' }}
              placeholder="その他のNG理由を追加..."
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && customReason.trim()) {
                  toggleTag(customReason.trim())
                  setCustomReason('')
                }
              }}
            />
          </div>

          {/* 詳細メモ */}
          <textarea
            className="note-input"
            style={{ margin: '10px 0 0', width: '100%' }}
            rows={2}
            placeholder="補足メモ（修正指示・気づきなど）"
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          {/* アクションボタン */}
          <div className="modal-actions">
            <button className="action-btn approve" onClick={() => {
              updateStamp(stamp.id, { status: 'approved', designerNote: note })
            }}>承認</button>
            <button className="action-btn edit" onClick={handleNeedsEdit}>
              要修正{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
            </button>
            <button className="action-btn reject" onClick={handleReject}>
              却下{selectedTags.length > 0 ? ` (${selectedTags.length})` : ''}
            </button>
          </div>

          {/* バリエーション生成 */}
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => setShowVariation(!showVariation)}
              style={{
                padding: '6px 12px', background: 'none',
                border: '1px solid var(--accent)', borderRadius: 6,
                color: 'var(--accent)', fontSize: 12, cursor: 'pointer',
              }}
            >
              {showVariation ? '閉じる' : 'バリエーション生成'}
            </button>

            {showVariation && (
              <div style={{ marginTop: 10, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>雰囲気:</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {MOOD_OPTIONS.map(m => (
                      <button key={m.value}
                        className={`filter-btn ${varMood === m.value ? 'active' : ''}`}
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={() => setVarMood(m.value)}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>色数:</label>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {COLOR_COUNT_OPTIONS.map(c => (
                      <button key={c.value}
                        className={`filter-btn ${varColorCount === c.value ? 'active' : ''}`}
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={() => setVarColorCount(c.value)}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleGenerateVariation}
                  disabled={varGenerating}
                  style={{
                    width: '100%', padding: '8px', background: 'var(--accent)',
                    border: 'none', borderRadius: 6, color: '#fff',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    opacity: varGenerating ? 0.5 : 1,
                  }}
                >
                  {varGenerating ? '生成中...' : '2候補を生成'}
                </button>

                {varResults.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {varResults.map(v => (
                      <div key={v.id} style={{ flex: 1, textAlign: 'center' }}>
                        <img src={v.dataUrl} alt="" style={{ width: '100%', borderRadius: 6 }} />
                        <button
                          onClick={() => addVariationToGallery(v)}
                          style={{
                            marginTop: 4, padding: '4px 8px', background: 'none',
                            border: '1px solid var(--accent-green)', borderRadius: 4,
                            color: 'var(--accent-green)', fontSize: 10, cursor: 'pointer',
                          }}
                        >
                          ギャラリーに追加
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 画像上書きアップロード */}
          <div style={{ marginTop: 12 }}>
            <label
              style={{
                display: 'inline-block', padding: '6px 12px',
                border: '1px dashed var(--border)', borderRadius: 6,
                color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              画像を差し替え...
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (file.size > 5 * 1024 * 1024) { alert('5MB以下の画像を選択してください'); return }
                  const reader = new FileReader()
                  reader.onload = () => {
                    updateStamp(stamp.id, { dataUrl: reader.result, path: null })
                  }
                  reader.readAsDataURL(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          {/* 過去のNG履歴 */}
          {stampHistory.length > 0 && (
            <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--bg)', borderRadius: 6, fontSize: 11 }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>過去のNG記録:</div>
              {stampHistory.map((h, i) => (
                <div key={i} style={{ color: 'var(--accent-red)', marginBottom: 2 }}>
                  {h.reason}{h.customNote ? ` — ${h.customNote}` : ''}
                </div>
              ))}
            </div>
          )}

          <button className="modal-close" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}
