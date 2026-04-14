// 生成スタンプ画像の後処理ユーティリティ

const CROP_TIMEOUT_MS = 8000

/**
 * 画像を円形にトリミング（円外を透過）
 * 必ずタイムアウト内に決着する。失敗時は reject されるので呼び出し側で原画像にフォールバックする想定。
 * @param {string} dataUrl - 入力画像のdata URL
 * @returns {Promise<string>} PNG形式のdata URL
 */
export function cropToCircle(dataUrl) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (fn, val) => { if (settled) return; settled = true; fn(val) }

    const timer = setTimeout(() => {
      finish(reject, new Error(`cropToCircle timeout after ${CROP_TIMEOUT_MS}ms`))
    }, CROP_TIMEOUT_MS)

    const img = new Image()
    img.onload = () => {
      try {
        const size = Math.min(img.width, img.height)
        if (!size || !isFinite(size)) {
          throw new Error('invalid image size')
        }
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)

        ctx.globalCompositeOperation = 'destination-in'
        ctx.beginPath()
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()

        clearTimeout(timer)
        finish(resolve, canvas.toDataURL('image/png'))
      } catch (err) {
        clearTimeout(timer)
        finish(reject, err)
      }
    }
    img.onerror = (e) => {
      clearTimeout(timer)
      finish(reject, e instanceof Error ? e : new Error('image load failed'))
    }
    img.src = dataUrl
  })
}
