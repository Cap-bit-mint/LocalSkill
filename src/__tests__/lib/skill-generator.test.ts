import { describe, it, expect, beforeAll } from 'vitest'
import { generateSkillName, generateSKILLMD, generateSkillJson, generateInfoJson, generateDirectoryEntry } from '@/lib/skill-generator'
import type { Merchant } from '@/types/database'

const mockMerchant: Merchant = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  auth_user_id: 'user-123',
  name: '北京烤鸭店',
  source_url: 'https://www.meituan.com/shop/123456',
  source_type: 'meituan',
  category: 'restaurant',
  location_city: '北京市',
  location_district: '朝阳区',
  location_address: '朝阳区建国路88号',
  phone: '010-12345678',
  rating: 4.5,
  avg_price: 150,
  business_hours: {
    monday: '10:00-22:00',
    tuesday: '10:00-22:00',
    wednesday: '10:00-22:00',
    thursday: '10:00-22:00',
    friday: '10:00-23:00',
    saturday: '10:00-23:00',
    sunday: '10:00-22:00',
  },
  raw_data: {},
  verified_data: {},
  status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  verified_at: '2024-01-01T00:00:00Z',
}

describe('Skill Generator', () => {
  describe('generateSkillName', () => {
    it('should generate skill name from merchant', () => {
      const skillName = generateSkillName(mockMerchant)
      expect(skillName).toContain('北京')
      expect(skillName).toContain('烤鸭店')
    })

    it('should handle merchant without city', () => {
      const merchantNoCity = { ...mockMerchant, location_city: null }
      const skillName = generateSkillName(merchantNoCity)
      expect(skillName).toContain('烤鸭店')
    })

    it('should remove special characters from name', () => {
      const merchantWithSpecialChars = { ...mockMerchant, name: '北京-烤鸭店（总店）!' }
      const skillName = generateSkillName(merchantWithSpecialChars)
      expect(skillName).not.toContain('-')
      expect(skillName).not.toContain('（')
      expect(skillName).not.toContain('）')
      expect(skillName).not.toContain('!')
    })
  })

  describe('generateSKILLMD', () => {
    it('should generate SKILL.md with merchant info', () => {
      const content = generateSKILLMD(mockMerchant)

      expect(content).toContain('# 北京烤鸭店')
      expect(content).toContain('地址')
      expect(content).toContain('朝阳区建国路88号')
      expect(content).toContain('010-12345678')
      expect(content).toContain('4.5分')
      expect(content).toContain('¥150')
    })

    it('should include business hours', () => {
      const content = generateSKILLMD(mockMerchant)
      expect(content).toContain('monday')
      expect(content).toContain('10:00-22:00')
    })

    it('should handle merchant without business hours', () => {
      const merchantNoHours = { ...mockMerchant, business_hours: null }
      const content = generateSKILLMD(merchantNoHours)
      expect(content).toContain('营业时间请电话咨询')
    })
  })

  describe('generateSkillJson', () => {
    it('should generate valid skill.json', () => {
      const jsonStr = generateSkillJson(mockMerchant)
      const json = JSON.parse(jsonStr)

      expect(json.name).toBeTruthy()
      expect(json.description).toBeTruthy()
      expect(json.category).toBe('restaurant')
      expect(json.triggers).toBeInstanceOf(Array)
      expect(json.capabilities).toBeInstanceOf(Object)
      expect(json.capabilities.read).toBeInstanceOf(Array)
      expect(json.capabilities.write).toBeInstanceOf(Array)
      expect(json.safety).toBeInstanceOf(Object)
      expect(json.safety.readonly).toBe(true)
      expect(json.safety.humanVerificationRequired).toBe(true)
      expect(json.tools).toBeInstanceOf(Array)
    })

    it('should have correct category template', () => {
      const restaurantMerchant = { ...mockMerchant, category: 'restaurant' }
      const jsonStr = generateSkillJson(restaurantMerchant)
      const json = JSON.parse(jsonStr)

      expect(json.capabilities.read).toContain('query_address')
    })

    it('should include fabrication forbidden list', () => {
      const jsonStr = generateSkillJson(mockMerchant)
      const json = JSON.parse(jsonStr)

      expect(json.safety.fabricationForbidden).toContain('price')
      expect(json.safety.fabricationForbidden).toContain('business_hours_special')
      expect(json.safety.warnings).toBeInstanceOf(Array)
    })

    it('should have readonly capabilities', () => {
      const jsonStr = generateSkillJson(mockMerchant)
      const json = JSON.parse(jsonStr)

      expect(json.capabilities.write).toHaveLength(0)
      expect(json.tools.every((t: { readOnly: boolean }) => t.readOnly)).toBe(true)
    })
  })

  describe('generateInfoJson', () => {
    it('should generate valid data/info.json', () => {
      const jsonStr = generateInfoJson(mockMerchant)
      const json = JSON.parse(jsonStr)

      expect(json.name).toBe('北京烤鸭店')
      expect(json.source).toBe('meituan')
      expect(json.category).toBe('restaurant')
      expect(json.address).toBe('朝阳区建国路88号')
      expect(json.phone).toBe('010-12345678')
      expect(json.city).toBe('北京市')
      expect(json.rating).toBe(4.5)
      expect(json.avgPrice).toBe(150)
    })
  })

  describe('generateDirectoryEntry', () => {
    it('should generate directory entry', () => {
      const entry = generateDirectoryEntry(mockMerchant)

      expect(entry.name).toBe('北京烤鸭店')
      expect(entry.path).toContain('skills/')
      expect(entry.description).toBeTruthy()
      expect(entry.category).toBe('restaurant')
      expect(entry.city).toBe('北京市')
      expect(entry.district).toBe('朝阳区')
      expect(entry.rating).toBe(4.5)
      expect(entry.publishedAt).toBeTruthy()
    })
  })
})
