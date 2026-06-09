'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface MerchantFormData {
  // Step 1: Submission
  sourceUrl?: string
  sourceType?: 'meituan' | 'dianping' | 'amap' | 'other'
  imageFile?: File | null

  // Step 2: Verified data
  name?: string
  phone?: string
  address?: string
  city?: string
  district?: string
  avgPrice?: number
  businessHours?: Record<string, string>
  menu?: Array<{ name: string; price: string; description?: string }>
  description?: string
  highlights?: string[]
  category?: string

  // Step 3: Generated content
  generatedSkill?: {
    name: string
    description: string
    systemPrompt: string
  }

  // Meta
  merchantId?: string
  skillId?: string
}

interface WizardContextType {
  formData: MerchantFormData
  updateFormData: (data: Partial<MerchantFormData>) => void
  resetFormData: () => void
  currentStep: number
  setCurrentStep: (step: number) => void
}

const initialFormData: MerchantFormData = {}

const WizardContext = createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<MerchantFormData>(initialFormData)
  const [currentStep, setCurrentStep] = useState(0)

  const updateFormData = (data: Partial<MerchantFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const resetFormData = () => {
    setFormData(initialFormData)
    setCurrentStep(0)
  }

  return (
    <WizardContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        currentStep,
        setCurrentStep,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider')
  }
  return context
}
