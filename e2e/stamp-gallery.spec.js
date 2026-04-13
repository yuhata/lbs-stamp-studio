import { test, expect } from '@playwright/test'
import { attachConsoleErrorCollector, clearStudioStorage, gotoTab, gotoStudio } from './_helpers.js'

test.describe('StampGallery エリアフィルタ', () => {
  test.beforeEach(async ({ page }) => {
    await clearStudioStorage(page)
  })

  test('エリア絞り込みセレクトに「全て」+25エリア = 26 options', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page)
    await gotoStudio(page)
    await gotoTab(page, 'ギャラリー')

    const select = page.locator('select.filter-select').first()
    await expect(select).toBeVisible()
    const count = await select.locator('option').count()
    // 25 canonical + "全て" = 26 。manifest が他エリアを含むと >26 になる可能性があるので下限でチェック
    expect(count).toBeGreaterThanOrEqual(26)

    // canonical のうちいくつかを検証
    for (const name of ['渋谷', '池袋', '六本木・麻布', 'お台場・豊洲', '品川']) {
      await expect(select.locator('option', { hasText: name })).toHaveCount(1)
    }
    expect(errors).toEqual([])
  })
})
