import { useState, useEffect } from 'react'
import StampGallery from './components/StampGallery'
import BatchForm from './components/BatchForm'
import AreaRules from './components/AreaRules'
import './App.css'

const TABS = [
  { id: 'gallery', label: 'ギャラリー' },
  { id: 'batch', label: 'バッチ生成' },
  { id: 'rules', label: 'エリアルール' },
]

function App() {
  const [stamps, setStamps] = useState([])
  const [activeTab, setActiveTab] = useState('gallery')
  const [filterArea, setFilterArea] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetch('/stamps/manifest.json')
      .then(r => r.json())
      .then(setStamps)
      .catch(() => setStamps([]))
  }, [])

  const updateStamp = (id, updates) => {
    setStamps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  const areas = [...new Set(stamps.map(s => s.area))]
  const stats = {
    total: stamps.length,
    approved: stamps.filter(s => s.status === 'approved').length,
    rejected: stamps.filter(s => s.status === 'rejected').length,
    needsEdit: stamps.filter(s => s.status === 'needs_edit').length,
    draft: stamps.filter(s => s.status === 'draft').length,
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>LBS Stamp Studio</h1>
          <span className="subtitle">スタンプデザイン品質管理ツール</span>
        </div>
        <div className="header-stats">
          <span className="stat" data-type="total">{stats.total} 件</span>
          <span className="stat" data-type="approved">{stats.approved} 承認</span>
          <span className="stat" data-type="rejected">{stats.rejected} 却下</span>
          <span className="stat" data-type="needs_edit">{stats.needsEdit} 要修正</span>
          <span className="stat" data-type="draft">{stats.draft} 未レビュー</span>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'gallery' && (
        <StampGallery
          stamps={stamps}
          areas={areas}
          filterArea={filterArea}
          setFilterArea={setFilterArea}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          updateStamp={updateStamp}
        />
      )}
      {activeTab === 'batch' && (
        <BatchForm stamps={stamps} setStamps={setStamps} />
      )}
      {activeTab === 'rules' && (
        <AreaRules stamps={stamps} areas={areas} />
      )}
    </div>
  )
}

export default App
