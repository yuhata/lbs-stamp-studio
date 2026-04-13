import { test, expect } from '@playwright/test'
import { attachConsoleErrorCollector, clearStudioStorage, gotoTab, gotoStudio } from './_helpers.js'

// 各タブが error boundary を出さずに描画されるか
// console.error も全タブで補足

const TABS = ['バッチ生成', 'ギャラリー', 'マップ', 'エリアルール', 'NG学習ログ', 'UGC承認']

test.describe('全タブ読み込みスモーク', () => {
  test.beforeEach(async ({ page }) => {
    await clearStudioStorage(page)
  })

  test('アプリルートが描画され、h1 が表示される', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page)
    await gotoStudio(page)
    await expect(page.getByRole('heading', { name: 'LBS Stamp Studio' })).toBeVisible()
    await page.screenshot({ path: 'e2e/__screenshots__/00-root.png', fullPage: true })
    expect(errors, `console.error: ${errors.join('\n')}`).toEqual([])
  })

  for (const label of TABS) {
    test(`タブ「${label}」が描画される（console.error なし）`, async ({ page }) => {
      const errors = attachConsoleErrorCollector(page)
      await gotoStudio(page)
      await expect(page.getByRole('heading', { name: 'LBS Stamp Studio' })).toBeVisible()
      await gotoTab(page, label)
      // 何らかの中身がレンダリングされるまで少し待つ
      await page.waitForTimeout(600)

      // error boundary / 赤エラー文字の typical pattern を検出
      await expect(page.locator('text=/Something went wrong|App Error|TypeError|Cannot read/i')).toHaveCount(0)

      // 各タブのスクショ
      const safe = label.replace(/[^\w]/g, '_')
      await page.screenshot({ path: `e2e/__screenshots__/tab-${safe}.png`, fullPage: true })

      expect(errors, `console.error on tab ${label}:\n${errors.join('\n')}`).toEqual([])
    })
  }
})
