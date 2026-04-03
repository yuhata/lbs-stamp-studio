import { useState } from 'react'

const CATEGORY_LABELS = {
  content: 'コンテンツ',
  composition: '構図',
  texture: 'テクスチャ',
  color: 'カラー',
  recognition: '認識性',
  background: '背景',
  style: 'スタイル',
  other: 'その他',
}

const CATEGORY_COLORS = {
  content: '#ef5350',
  composition: '#ff6b35',
  texture: '#ffca28',
  color: '#ab47bc',
  recognition: '#42a5f5',
  background: '#78909c',
  style: '#66bb6a',
  other: '#888899',
}

export default function NGLog({ ngReasons, setNgReasons, stamps }) {
  const [filterCategory, setFilterCategory] = useState('all')

  // カテゴリ別集計
  const categoryCounts = {}
  ngReasons.forEach(r => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })

  // 理由別集計（頻度順）
  const reasonCounts = {}
  ngReasons.forEach(r => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1
  })
  const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])

  // フィルタ適用
  const filtered = filterCategory === 'all'
    ? ngReasons
    : ngReasons.filter(r => r.category === filterCategory)

  // プロンプト改善提案の生成
  const promptSuggestions = sortedReasons
    .filter(([, count]) => count >= 2)
    .map(([reason]) => {
      const sample = ngReasons.find(r => r.reason === reason)
      return { reason, count: reasonCounts[reason], promptHint: sample?.promptHint || '' }
    })

  const handleClearLog = () => {
    if (confirm('NG学習ログを全てクリアしますか？')) {
      setNgReasons([])
      localStorage.removeItem('lbs-stamp-studio-ng-log')
    }
  }

  const handleExport = () => {
    const data = JSON.stringify(ngReasons, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ng-log-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="ng-log">
      {/* サマリーカード */}
      <div className="ng-summary">
        <div className="ng-summary-card" data-highlight>
          <div className="ng-summary-number">{ngReasons.length}</div>
          <div className="ng-summary-label">NG記録 合計</div>
        </div>
        {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
          <div
            key={cat}
            className={`ng-summary-card ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
            style={{ cursor: 'pointer', borderColor: CATEGORY_COLORS[cat] }}
          >
            <div className="ng-summary-number" style={{ color: CATEGORY_COLORS[cat] }}>{count}</div>
            <div className="ng-summary-label">{CATEGORY_LABELS[cat] || cat}</div>
          </div>
        ))}
      </div>

      {/* プロンプト改善提案 */}
      {promptSuggestions.length > 0 && (
        <div className="ng-prompt-suggestions">
          <h3>プロンプト改善提案</h3>
          <p className="ng-prompt-desc">2回以上発生しているNG理由に基づく改善ヒント:</p>
          {promptSuggestions.map(({ reason, count, promptHint }) => (
            <div key={reason} className="ng-suggestion-row">
              <div className="ng-suggestion-reason">
                <span className="ng-suggestion-count">{count}回</span>
                {reason}
              </div>
              {promptHint && (
                <div className="ng-suggestion-hint">→ {promptHint}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* NG理由ランキング */}
      {sortedReasons.length > 0 && (
        <div className="ng-ranking">
          <h3>NG理由ランキング</h3>
          {sortedReasons.map(([reason, count]) => {
            const maxCount = sortedReasons[0][1]
            const sample = ngReasons.find(r => r.reason === reason)
            return (
              <div key={reason} className="ng-rank-row">
                <div className="ng-rank-bar-wrapper">
                  <div
                    className="ng-rank-bar"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      background: CATEGORY_COLORS[sample?.category] || '#888',
                    }}
                  />
                </div>
                <span className="ng-rank-label">{reason}</span>
                <span className="ng-rank-count">{count}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ログ一覧 */}
      <div className="ng-log-list">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3>NG記録一覧 {filterCategory !== 'all' && `(${CATEGORY_LABELS[filterCategory]})`}</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="filter-btn" onClick={handleExport}>エクスポート</button>
            <button className="filter-btn" style={{ color: 'var(--accent-red)' }} onClick={handleClearLog}>クリア</button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>NG記録がありません</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>ギャラリーでスタンプを却下/要修正すると、NG理由がここに蓄積されます</p>
          </div>
        ) : (
          filtered.slice().reverse().map((r, i) => (
            <div key={r.id || i} className="ng-log-entry">
              <div className="ng-log-entry-header">
                <span
                  className="ng-category-tag"
                  style={{ background: CATEGORY_COLORS[r.category] }}
                >
                  {CATEGORY_LABELS[r.category] || r.category}
                </span>
                <span className="ng-log-reason">{r.reason}</span>
                <span className="ng-log-spot">{r.spotName} ({r.area})</span>
                <span className="ng-log-date">
                  {new Date(r.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              {r.customNote && (
                <div className="ng-log-note">{r.customNote}</div>
              )}
              {r.promptHint && (
                <div className="ng-log-hint">改善ヒント: {r.promptHint}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
