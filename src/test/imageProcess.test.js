import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cropToCircle } from '../utils/imageProcess'

// jsdom には Image / Canvas のレンダリング実装がないため、最小限のスタブを差し込む
class MockImage {
  constructor() {
    this.width = 0
    this.height = 0
    this.onload = null
    this.onerror = null
  }
  set src(_v) {
    // 設定方法によって挙動を変えるテスト用フック
    queueMicrotask(() => {
      if (MockImage.__behavior === 'load') {
        this.width = 1024
        this.height = 1024
        this.onload && this.onload()
      } else if (MockImage.__behavior === 'error') {
        this.onerror && this.onerror(new Error('mock load error'))
      }
      // 'hang' の場合は何もしない → タイムアウト経路
    })
  }
}
MockImage.__behavior = 'load'

function installCanvasStub() {
  const origCreate = document.createElement.bind(document)
  document.createElement = (tag) => {
    if (tag === 'canvas') {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          drawImage: () => {},
          beginPath: () => {},
          arc: () => {},
          closePath: () => {},
          fill: () => {},
          set globalCompositeOperation(_v) {},
        }),
        toDataURL: () => 'data:image/png;base64,STUB',
      }
    }
    return origCreate(tag)
  }
  return () => { document.createElement = origCreate }
}

describe('cropToCircle', () => {
  let restoreCanvas

  beforeEach(() => {
    globalThis.Image = MockImage
    restoreCanvas = installCanvasStub()
  })

  afterEach(() => {
    restoreCanvas()
    delete globalThis.Image
    MockImage.__behavior = 'load'
    vi.useRealTimers()
  })

  it('正常な画像はトリミング後のdata URLを返す', async () => {
    MockImage.__behavior = 'load'
    const result = await cropToCircle('data:image/png;base64,XXXX')
    expect(result).toBe('data:image/png;base64,STUB')
  })

  it('画像読み込み失敗時はrejectする', async () => {
    MockImage.__behavior = 'error'
    await expect(cropToCircle('data:image/png;base64,XXXX')).rejects.toThrow()
  })

  it('画像読み込みがハングしてもタイムアウトでrejectする（無限待機しない）', async () => {
    MockImage.__behavior = 'hang'
    vi.useFakeTimers()
    const promise = cropToCircle('data:image/png;base64,XXXX')
    // 8秒進める
    vi.advanceTimersByTime(8100)
    await expect(promise).rejects.toThrow(/timeout/)
  })
})
