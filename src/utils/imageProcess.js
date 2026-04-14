// 生成スタンプ画像の後処理ユーティリティ

/**
 * 画像を円形にトリミング（円外を透過）
 * @param {string} dataUrl - 入力画像のdata URL
 * @returns {Promise<string>} PNG形式のdata URL
 */
export function cropToCircle(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const size = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')

      // 正方形にクロップしてから円形マスクを適用
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)

      ctx.globalCompositeOperation = 'destination-in'
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.fill()

      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}
