import { describe, it, expect } from 'vitest'
import {
  CANONICAL_AREAS,
  AREA_LABELS,
  AREA_COLORS,
  DEFAULT_AREA_CONFIG,
} from '../config/areas'

describe('canonical areas config', () => {
  it('Stampikoは正式に25エリアある', () => {
    expect(CANONICAL_AREAS).toHaveLength(25)
  })

  it('エリアid はすべて一意', () => {
    const ids = CANONICAL_AREAS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('各エリアは必須フィールドを持つ', () => {
    for (const a of CANONICAL_AREAS) {
      expect(a.id).toBeTruthy()
      expect(a.name).toBeTruthy()
      expect(a.name_en).toBeTruthy()
      expect(['A', 'B', 'C', 'D']).toContain(a.zone)
      expect(a.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('AREA_LABELS / AREA_COLORS は 25 エントリ', () => {
    expect(Object.keys(AREA_LABELS)).toHaveLength(25)
    expect(Object.keys(AREA_COLORS)).toHaveLength(25)
  })

  it('既知のエリアキーが含まれる（浅草/渋谷/新宿/池袋/銀座）', () => {
    const ids = new Set(CANONICAL_AREAS.map(a => a.id))
    for (const k of ['asakusa', 'shibuya', 'shinjuku', 'ikebukuro', 'ginza']) {
      expect(ids.has(k)).toBe(true)
    }
  })

  it('DEFAULT_AREA_CONFIG は全エリアに対し label と palette を持つ', () => {
    for (const a of CANONICAL_AREAS) {
      const cfg = DEFAULT_AREA_CONFIG[a.id]
      expect(cfg).toBeDefined()
      expect(cfg.label).toBeTruthy()
      expect(Array.isArray(cfg.palette)).toBe(true)
      expect(cfg.palette.length).toBeGreaterThan(0)
    }
  })
})
