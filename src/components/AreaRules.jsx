const AREA_CONFIG = {
  asakusa: {
    label: '浅草エリア',
    palette: ['#C0392B', '#8B4513', '#B71C1C'],
    style: '円形・昭和レトロ',
    description: '伝統的な赤系パレット。下町の温かみを表現。',
  },
  shibuya: {
    label: '渋谷エリア',
    palette: ['#6A1B9A', '#1A237E', '#E65100'],
    style: '円形・モダン',
    description: '紫〜青系のアーバンパレット。若者文化の活気を反映。',
  },
  shinjuku: {
    label: '新宿エリア',
    palette: ['#BF360C', '#F57F17', '#212121'],
    style: '円形・ダイナミック',
    description: '橙〜黒のコントラスト。エネルギッシュな街を表現。',
  },
}

export default function AreaRules({ stamps, areas }) {
  return (
    <div className="area-rules">
      {areas.map(area => {
        const config = AREA_CONFIG[area] || { label: area, palette: [], style: '-', description: '' }
        const areaStamps = stamps.filter(s => s.area === area)
        const approved = areaStamps.filter(s => s.status === 'approved')

        return (
          <div key={area} className="area-section">
            <h2>{config.label}</h2>
            <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>{config.description}</p>

            <div className="area-palette">
              <span className="label">パレット:</span>
              {config.palette.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div className="color-swatch" style={{
                    background: c, width: 24, height: 24, borderRadius: 4
                  }} />
                  <span style={{ fontSize: 11, color: '#888' }}>{c}</span>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, color: '#bbb', marginBottom: 12 }}>
              スタイル: <strong>{config.style}</strong>
              {' / '}
              候補: {areaStamps.length}件
              {' / '}
              承認済み: <span style={{ color: '#4caf50' }}>{approved.length}件</span>
            </div>

            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
              {approved.length > 0 ? '承認済みスタンプ:' : '全候補:'}
            </div>
            <div className="area-stamps-preview">
              {(approved.length > 0 ? approved : areaStamps).map(s => (
                <div
                  key={s.id}
                  className={`mini-stamp ${s.status === 'approved' ? 'approved' : ''}`}
                  title={`${s.spotName} — 候補${s.variant + 1} (${s.status})`}
                >
                  <img src={`/${s.path}`} alt={s.spotName} />
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <div className="area-section">
        <h2 style={{ color: '#888' }}>品質基準チェックリスト</h2>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a40' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#888' }}>基準</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#4caf50' }}>OK</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#ef5350' }}>NG</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['ランドマーク認識性', '一目でわかる', '抽象的すぎる'],
              ['インクテクスチャ', '適度なかすれ・にじみ', 'デジタル感が強い'],
              ['パレット統一', 'エリアルールに準拠', '指定外の色が目立つ'],
              ['構図バランス', '余白あり・見やすい', '詰め込み/偏り'],
              ['テキスト混入', '文字なし', '文字あり'],
              ['透過品質', 'きれいに透過', 'ジャギー/白残り'],
              ['コレクション映え', '並べて美しい', '1個だけ浮く'],
            ].map(([criteria, ok, ng], i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1a1a2e' }}>
                <td style={{ padding: '8px 0', color: '#ddd' }}>{criteria}</td>
                <td style={{ padding: '8px 0', color: '#666' }}>{ok}</td>
                <td style={{ padding: '8px 0', color: '#666' }}>{ng}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
