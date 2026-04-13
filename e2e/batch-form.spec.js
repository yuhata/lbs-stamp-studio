import { test, expect } from '@playwright/test'
import { attachConsoleErrorCollector, clearStudioStorage, gotoTab, gotoStudio } from './_helpers.js'

test.describe('バッチ生成（BatchForm）', () => {
  test.beforeEach(async ({ page }) => {
    await clearStudioStorage(page)
  })

  test('エリアセレクトに25件の正式エリアが表示される', async ({ page }) => {
    const errors = attachConsoleErrorCollector(page)
    await gotoStudio(page)
    await gotoTab(page, 'バッチ生成')

    // 「エリア」ラベル直後の select
    const areaSelect = page.locator('label:has-text("エリア") + select').first()
    await expect(areaSelect).toBeVisible()
    const count = await areaSelect.locator('option').count()
    expect(count).toBe(25)

    // 池袋が option に含まれる
    const ikebukuroOption = areaSelect.locator('option', { hasText: '池袋' })
    await expect(ikebukuroOption).toHaveCount(1)

    expect(errors).toEqual([])
  })

  test('非デフォルトエリア（池袋）を選択して値が反映される', async ({ page }) => {
    await gotoStudio(page)
    await gotoTab(page, 'バッチ生成')

    const areaSelect = page.locator('label:has-text("エリア") + select').first()
    await areaSelect.selectOption('ikebukuro')
    await expect(areaSelect).toHaveValue('ikebukuro')

    // スポット名入力も反映される
    await page.getByPlaceholder('例: 雷門、渋谷スクランブル交差点').fill('サンシャイン60')
    await expect(page.getByPlaceholder('例: 雷門、渋谷スクランブル交差点')).toHaveValue('サンシャイン60')

    // 生成ボタンが enable されている
    await expect(page.getByRole('button', { name: /候補を生成/ })).toBeEnabled()
  })
})
