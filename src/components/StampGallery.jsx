import { useState } from 'react'

const AREA_LABELS = {
  asakusa: '浅草',
  shibuya: '渋谷',
  shinjuku: '新宿',
}

const STATUS_OPTIONS = [
  { value: 'all', label: '全て' },
  { value: 'draft', label: '未レビュー' },
  { value: 'approved', label: '承認済み' },
  { value: 'rejected', label: '却下' },
  { value: 'needs_edit', label: '要修正' },
]

export default function StampGallery({
  stamps, areas, filterArea, setFilterArea,
  filterStatus, setFilterStatus, updateStamp,
}) {
  const [selected, setSelected] = useState(null)

  const filtered = stamps.filter(s => {
    if (filterArea !== 'all' && s.area !== filterArea) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  // スポットごとにグルーピング
  const grouped = {}
  filtered.forEach(s => {
    if (!grouped[s.spotId]) grouped[s.spotId] = { spotName: s.spotName, area: s.area, stamps: [] }
    grouped[s.spotId].stamps.push(s)
  })

  return (
    <div>
      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <label>エリア:</label>
          <button
            className={`filter-btn ${filterArea === 'all' ? 'active' : ''}`}
            onClick={() => setFilterArea('all')}
          >全て</button>
          {areas.map(a => (
            <button
              key={a}
              className={`filter-btn ${filterArea === a ? 'active' : ''}`}
              onClick={() => setFilterArea(a)}
            >{AREA_LABELS[a] || a}</button>
          ))}
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

      {/* Grid */}
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
                <StampCard
                  key={stamp.id}
                  stamp={stamp}
                  onClick={() => setSelected(stamp)}
                  updateStamp={updateStamp}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Detail Modal */}
      {selected && (
        <StampModal
          stamp={selected}
          onClose={() => setSelected(null)}
          updateStamp={(id, updates) => {
            updateStamp(id, updates)
            setSelected(prev => ({ ...prev, ...updates }))
          }}
        />
      )}
    </div>
  )
}

function StampCard({ stamp, onClick, updateStamp }) {
  return (
    <div className="stamp-card" data-status={stamp.status} onClick={onClick}>
      <div className="stamp-image-wrapper">
        <img src={`/${stamp.path}`} alt={stamp.spotName} loading="lazy" />
        <span className="status-badge" data-status={stamp.status}>
          {stamp.status === 'approved' ? '承認' :
           stamp.status === 'rejected' ? '却下' :
           stamp.status === 'needs_edit' ? '要修正' : '未レビュー'}
        </span>
      </div>
      <div className="stamp-info">
        <span className="variant-label">候補 {stamp.variant + 1}</span>
      </div>
      <div className="stamp-actions" onClick={e => e.stopPropagation()}>
        <button
          className="action-btn approve"
          onClick={() => updateStamp(stamp.id, { status: 'approved' })}
        >承認</button>
        <button
          className="action-btn edit"
          onClick={() => updateStamp(stamp.id, { status: 'needs_edit' })}
        >要修正</button>
        <button
          className="action-btn reject"
          onClick={() => updateStamp(stamp.id, { status: 'rejected' })}
        >却下</button>
      </div>
    </div>
  )
}

function StampModal({ stamp, onClose, updateStamp }) {
  const [note, setNote] = useState(stamp.designerNote || '')

  const handleSaveNote = () => {
    updateStamp(stamp.id, { designerNote: note })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-image">
          <img src={`/${stamp.path}`} alt={stamp.spotName} />
        </div>
        <div className="modal-body">
          <h3>{stamp.spotName} — 候補 {stamp.variant + 1}</h3>
          <p style={{ fontSize: 13, color: '#888' }}>
            エリア: {AREA_LABELS[stamp.area] || stamp.area} / ステータス: {stamp.status}
          </p>

          <div className="modal-actions">
            <button
              className="action-btn approve"
              onClick={() => updateStamp(stamp.id, { status: 'approved' })}
            >承認</button>
            <button
              className="action-btn edit"
              onClick={() => updateStamp(stamp.id, { status: 'needs_edit' })}
            >要修正</button>
            <button
              className="action-btn reject"
              onClick={() => updateStamp(stamp.id, { status: 'rejected' })}
            >却下</button>
          </div>

          <textarea
            className="note-input"
            style={{ margin: '12px 0 0', width: '100%' }}
            rows={3}
            placeholder="デザイナーメモ（NG理由・修正指示など）"
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={handleSaveNote}
          />

          <button className="modal-close" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}
