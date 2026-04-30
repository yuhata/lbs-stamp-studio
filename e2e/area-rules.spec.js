import { test, expect } from '@playwright/test'
import { attachConsoleErrorCollector, clearStudioStorage, seedLegacyAreas, gotoTab, gotoStudio } from './_helpers.js'

// AreaRules の「編集→完了でラベルが消える」回帰テスト

async function openAreaRules(page) {
  await gotoStudio(page)
  await gotoTab(page, 'エリアルール')
}

async function getAreaSection(page, labelText) {
  // h2 に該当ラベルを含む .area-section
  return page.locator('.area-section', { has: page.locator('h2', { hasText: labelText }) }).first()
}

test.describe('AreaRules パレット編集後の regression', () => {
  test.beforeEach(async ({ page }) => {
    await clearStudioStorage(page)
  })

  for (const [label, newColor] of [
    ['渋谷エリア', '#123456'],
    ['池袋エリア', '#abcdef'],
    ['六本木・麻布エリア', '#ff00aa'],
  ]) {
    test(`${label}: 編集→完了でラベルが消えない`, async ({ page }) => {
      const errors = attachConsoleErrorCollector(page)
      await openAreaRules(page)

      const section = await getAreaSection(page, label)
      await expect(section).toBeVisible()
      await expect(section.locator('h2', { hasText: label })).toBeVisible()

      // 編集ボタン
      await section.getByRole('button', { name: '編集' }).click()

      // パレット入力を差し替え
      const paletteInput = section.locator('input.criteria-input').first()
      await paletteInput.fill(newColor)

      // 完了ボタン
      await section.getByRole('button', { name: '完了' }).click()

      // h2 は依然として表示されている
      const h2 = section.locator('h2', { hasText: label })
      await expect(h2).toBeVisible()

      // パレットに新しい色が反映されている
      await expect(section.locator('.area-palette')).toContainText(newColor)

      expect(errors, errors.join('\n')).toEqual([])
    })
  }
})

test.describe('localStorage マイグレーション（旧14エリア→25エリア）', () => {
  test('旧形式がseedされていても25エリア全てが描画される', async ({ page }) => {
    await clearStudioStorage(page)
    await seedLegacyAreas(page)
    await openAreaRules(page)

    const h2s = page.locator('.area-section h2')
    // 「品質基準チェックリスト」の h2 も1つあるので 25 + 1
    const count = await h2s.count()
    expect(count).toBeGreaterThanOrEqual(26)

    // 正式マスターにしか存在しないエリアが表示されている
    await expect(page.locator('h2', { hasText: 'お台場・豊洲エリア' })).toBeVisible()
    await expect(page.locator('h2', { hasText: '品川エリア' })).toBeVisible()
  })
})

test.describe('パレット入力欄 末尾カンマ バグ修正検証', () => {
  test.beforeEach(async ({ page }) => {
    await clearStudioStorage(page)
  })

  test('末尾カンマを入力してもブロックされない（入力値が保持される）', async ({ page }) => {
    await openAreaRules(page)

    const section = await getAreaSection(page, '渋谷エリア')
    await section.getByRole('button', { name: '編集' }).click()

    const paletteInput = section.locator('input.criteria-input').first()

    // 末尾にカンマを入力
    await paletteInput.fill('#ff0000, #00ff00,')

    // onBlur 前は末尾カンマが保持されていること
    await expect(paletteInput).toHaveValue('#ff0000, #00ff00,')

    // フォーカスアウト（onBlur）→ 正規化されてカンマが除去されること
    await paletteInput.blur()
    await expect(paletteInput).toHaveValue('#ff0000, #00ff00')
  })

  test('末尾カンマでフォーカスアウトしても正しい色がパレットに保存される', async ({ page }) => {
    await openAreaRules(page)

    const section = await getAreaSection(page, '渋谷エリア')
    await section.getByRole('button', { name: '編集' }).click()

    const paletteInput = section.locator('input.criteria-input').first()
    await paletteInput.fill('#aa0000, #0000bb,')
    await paletteInput.blur()

    // 完了ボタンで保存
    await section.getByRole('button', { name: '完了' }).click()

    // パレット表示に正しい色が反映されていること（空文字要素が入っていないこと）
    const palette = section.locator('.area-palette')
    await expect(palette).toContainText('#aa0000')
    await expect(palette).toContainText('#0000bb')
    // 空スウォッチが混入していないことを確認（color-swatch の数が2枚）
    const swatches = section.locator('.color-swatch')
    await expect(swatches).toHaveCount(2)
  })

  test('Enter キーで確定してもパレット配列に末尾の空文字が入らない', async ({ page }) => {
    await openAreaRules(page)

    const section = await getAreaSection(page, '渋谷エリア')
    await section.getByRole('button', { name: '編集' }).click()

    const paletteInput = section.locator('input.criteria-input').first()
    await paletteInput.fill('#cc0000,')
    await paletteInput.press('Enter')

    // Enter後に正規化されていること
    await expect(paletteInput).toHaveValue('#cc0000')

    // 完了して確認
    await section.getByRole('button', { name: '完了' }).click()
    const swatches = section.locator('.color-swatch')
    await expect(swatches).toHaveCount(1)
  })
})

test.describe('クロスタブ状態保持', () => {
  test('エリア編集 → 他タブへ → 戻ると編集内容が保持される', async ({ page }) => {
    await clearStudioStorage(page)
    await openAreaRules(page)

    const section = await getAreaSection(page, '渋谷エリア')
    await section.getByRole('button', { name: '編集' }).click()

    const descInput = section.locator('input.criteria-input').nth(2)
    await descInput.fill('E2E テスト説明')
    await section.getByRole('button', { name: '完了' }).click()

    // 他タブへ
    await gotoTab(page, 'バッチ生成')
    await expect(page.locator('label:has-text("エリア")').first()).toBeVisible()

    // 戻る
    await gotoTab(page, 'エリアルール')
    const section2 = await getAreaSection(page, '渋谷エリア')
    await expect(section2).toContainText('E2E テスト説明')
  })
})
