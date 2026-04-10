import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PROMPT,
  LEARNED_RULES_HEADER,
  MAX_LEARNED_RULES,
  NG_TO_PROMPT_RULES,
  MOOD_OPTIONS,
  COLOR_COUNT_OPTIONS,
  ELEMENT_OPTIONS,
  extractBasePrompt,
  buildPromptWithRules,
  buildDesignOptionsBlock,
} from '../config/promptDefaults'

describe('DEFAULT_PROMPT', () => {
  it('STAMP FORMAT セクションが含まれている', () => {
    expect(DEFAULT_PROMPT).toContain('STAMP FORMAT')
  })

  it('BACKGROUND セクションが含まれている', () => {
    expect(DEFAULT_PROMPT).toContain('BACKGROUND')
  })

  it('円形スタンプの枠サイズ指定（88-92%）が含まれている', () => {
    expect(DEFAULT_PROMPT).toContain('88–92%')
  })

  it('{SPOT_NAME} プレースホルダーが含まれている', () => {
    expect(DEFAULT_PROMPT).toContain('{SPOT_NAME}')
  })

  it('{PALETTE} プレースホルダーが含まれている', () => {
    expect(DEFAULT_PROMPT).toContain('{PALETTE}')
  })
})

describe('extractBasePrompt', () => {
  it('学習ルールがないプロンプトはそのまま返す', () => {
    const prompt = 'Simple prompt text'
    expect(extractBasePrompt(prompt)).toBe('Simple prompt text')
  })

  it('学習ルールセクションを除去してベースプロンプトを返す', () => {
    const base = 'Base prompt'
    const withRules = `${base}\n\n=== ${LEARNED_RULES_HEADER.replace('=== ', '').replace(' ===', '')} ===\n- Rule 1\n- Rule 2`
    expect(extractBasePrompt(withRules)).toBe('Base prompt')
  })

  it('前後の空白をトリムする', () => {
    expect(extractBasePrompt('  prompt with spaces  ')).toBe('prompt with spaces')
  })
})

describe('buildPromptWithRules', () => {
  const base = 'Base prompt'

  it('ルールが空なら元のプロンプトを返す', () => {
    expect(buildPromptWithRules(base, [])).toBe(base)
    expect(buildPromptWithRules(base, null)).toBe(base)
  })

  it('ルールが付与された場合、LEARNED RULESセクションが追加される', () => {
    const result = buildPromptWithRules(base, ['Rule A'])
    expect(result).toContain('LEARNED RULES')
    expect(result).toContain('- Rule A')
  })

  it('STAMP FORMATとBACKGROUNDの優先指示が含まれる', () => {
    const result = buildPromptWithRules(base, ['Rule A'])
    expect(result).toContain('STAMP FORMAT')
    expect(result).toContain('BACKGROUND')
    expect(result).toContain('priority')
  })

  it(`ルール数がMAX_LEARNED_RULES(${MAX_LEARNED_RULES})を超えた場合、上位のみ適用`, () => {
    const manyRules = Array.from({ length: 10 }, (_, i) => `Rule ${i}`)
    const result = buildPromptWithRules(base, manyRules)
    // MAX_LEARNED_RULES分だけ含まれる
    for (let i = 0; i < MAX_LEARNED_RULES; i++) {
      expect(result).toContain(`Rule ${i}`)
    }
    // 超えた分は含まれない
    expect(result).not.toContain(`Rule ${MAX_LEARNED_RULES}`)
  })

  it('ベースプロンプトが先頭に維持される', () => {
    const result = buildPromptWithRules(base, ['Rule A'])
    expect(result.startsWith(base)).toBe(true)
  })
})

describe('buildDesignOptionsBlock', () => {
  it('全て未選択なら空文字を返す', () => {
    expect(buildDesignOptionsBlock({ mood: '', colorCount: '', elements: [] })).toBe('')
  })

  it('雰囲気のみ選択でDESIGN OPTIONSセクションが生成される', () => {
    const result = buildDesignOptionsBlock({ mood: 'simple', colorCount: '', elements: [] })
    expect(result).toContain('DESIGN OPTIONS')
    expect(result).toContain('Minimalist')
  })

  it('色数のみ選択で対応するプロンプトが含まれる', () => {
    const result = buildDesignOptionsBlock({ mood: '', colorCount: 'mono', elements: [] })
    expect(result).toContain('1 ink color')
  })

  it('構成要素が含まれる', () => {
    const result = buildDesignOptionsBlock({ mood: '', colorCount: '', elements: ['building', 'animal'] })
    expect(result).toContain('建物')
    expect(result).toContain('動物')
  })

  it('全オプション指定で全て含まれる', () => {
    const result = buildDesignOptionsBlock({ mood: 'traditional', colorCount: '2color', elements: ['landscape'] })
    expect(result).toContain('woodblock')
    expect(result).toContain('2 ink colors')
    expect(result).toContain('風景')
  })
})

describe('NG_TO_PROMPT_RULES', () => {
  it('全NGカテゴリにルールが定義されている', () => {
    const expectedKeys = [
      'テキスト混入', '構図が偏っている', '色が規格外', '透過品質が悪い',
      'インクテクスチャ不足', 'デジタル感が強い', 'ランドマーク不明瞭',
      '詰め込みすぎ', '写実的すぎる',
    ]
    expectedKeys.forEach(key => {
      expect(NG_TO_PROMPT_RULES).toHaveProperty(key)
      expect(NG_TO_PROMPT_RULES[key].length).toBeGreaterThan(0)
    })
  })

  it('ランドマーク不明瞭のルールにgenericな形状への警告が含まれる', () => {
    expect(NG_TO_PROMPT_RULES['ランドマーク不明瞭']).toContain('generic')
  })
})

describe('オプション定数の整合性', () => {
  it('MOOD_OPTIONSの先頭は「指定なし」（value空文字）', () => {
    expect(MOOD_OPTIONS[0].value).toBe('')
    expect(MOOD_OPTIONS[0].label).toBe('指定なし')
  })

  it('COLOR_COUNT_OPTIONSの先頭は「指定なし」', () => {
    expect(COLOR_COUNT_OPTIONS[0].value).toBe('')
  })

  it('ELEMENT_OPTIONSに重複valueがない', () => {
    const values = ELEMENT_OPTIONS.map(e => e.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('全MOOD_OPTIONSのvalue以外にはpromptフィールドがある', () => {
    MOOD_OPTIONS.filter(m => m.value !== '').forEach(m => {
      expect(m.prompt).toBeTruthy()
    })
  })
})
