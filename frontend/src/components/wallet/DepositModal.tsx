import React, { useState } from 'react'
import { CheckCircle, Copy } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useDeposit } from '../../hooks/useWallet'
import { useUIStore } from '../../stores/uiStore'
import { hapticFeedback, hapticNotification } from '../../lib/telegram'
import type { DepositMethod } from '../../types'

const PAYMENT_METHODS: { id: DepositMethod; label: string; logo: string; color: string }[] = [
  { id: 'aba', label: 'ABA Bank', logo: '🏦', color: 'from-blue-600 to-blue-800' },
  { id: 'acleda', label: 'ACLEDA Bank', logo: '🏧', color: 'from-green-600 to-green-800' },
  { id: 'wing', label: 'Wing Money', logo: '🦋', color: 'from-orange-600 to-orange-800' },
  { id: 'pipay', label: 'Pi Pay', logo: '💜', color: 'from-purple-600 to-purple-800' },
  { id: 'manual', label: 'ផ្ទេរប្រាក់', logo: '💵', color: 'from-[#d4af37]/60 to-[#d4af37]/80' },
]

const PRESET_AMOUNTS = [1, 2, 5, 10, 20, 50]

const PAYMENT_DETAILS: Record<DepositMethod, { account: string; name: string }> = {
  aba: { account: '000 123 456', name: 'អាធិរាជ រឿង' },
  acleda: { account: '123 456 7890', name: 'អាធិរាជ រឿង' },
  wing: { account: '0xx xxx xxx', name: 'អាធិរាជ រឿង' },
  pipay: { account: '0xx xxx xxx', name: 'អាធិរាជ រឿង' },
  manual: { account: 'ទំនាក់ទំនង Admin', name: 'Telegram: @admin' },
}

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'method' | 'amount' | 'confirm' | 'success'>('method')
  const [selectedMethod, setSelectedMethod] = useState<DepositMethod | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const [customAmount, setCustomAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const addToast = useUIStore((s) => s.addToast)
  const deposit = useDeposit()

  const reset = () => {
    setStep('method')
    setSelectedMethod(null)
    setAmount(0)
    setCustomAmount('')
    setCopied(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleMethodSelect = (method: DepositMethod) => {
    hapticFeedback('light')
    setSelectedMethod(method)
    setStep('amount')
  }

  const handleAmountSelect = (a: number) => {
    hapticFeedback('light')
    setAmount(a)
    setCustomAmount(a.toString())
  }

  const handleAmountContinue = () => {
    const a = parseFloat(customAmount) || amount
    if (a < 1) {
      addToast('error', 'ចំនួនប្រាក់ត្រូវតែយ៉ាងហោចណាស់ $1')
      return
    }
    setAmount(a)
    setStep('confirm')
  }

  const handleSubmit = async () => {
    if (!selectedMethod || amount <= 0) return
    hapticFeedback('medium')
    try {
      await deposit.mutateAsync({ method: selectedMethod, amount })
      hapticNotification('success')
      setStep('success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ការដាក់ប្រាក់មានបញ្ហា'
      addToast('error', msg)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const details = selectedMethod ? PAYMENT_DETAILS[selectedMethod] : null
  const methodInfo = PAYMENT_METHODS.find((m) => m.id === selectedMethod)

  const titles: Record<string, string> = {
    method: 'ជ្រើសរើសវិធីទូទាត់',
    amount: 'ចំនួនប្រាក់',
    confirm: 'ព័ត៌មានការបង់ប្រាក់',
    success: '',
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[step]} showClose>
      {/* Step: Method Selection */}
      {step === 'method' && (
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`bg-gradient-to-br ${method.color} p-4 rounded-2xl text-left transition-all duration-200 active:scale-95 hover:brightness-110`}
            >
              <div className="text-3xl mb-2">{method.logo}</div>
              <p className="text-white font-semibold text-sm font-khmer">{method.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step: Amount */}
      {step === 'amount' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{methodInfo?.logo}</span>
            <span className="text-white font-semibold font-khmer">{methodInfo?.label}</span>
          </div>

          {/* Preset amounts */}
          <div>
            <p className="text-white/50 text-xs font-khmer mb-2">ជ្រើសរើសចំនួន</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => handleAmountSelect(a)}
                  className={`py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                    amount === a
                      ? 'bg-[#d4af37] text-[#0a0a0f]'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  ${a}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <p className="text-white/50 text-xs font-khmer mb-2">ចំនួនផ្ទាល់ខ្លួន</p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold">$</span>
              <input
                type="number"
                min="1"
                step="0.5"
                placeholder="0.00"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setAmount(parseFloat(e.target.value) || 0)
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setStep('method')} className="flex-1">
              ត្រឡប់
            </Button>
            <Button variant="gold" onClick={handleAmountContinue} className="flex-1">
              បន្តទៅមុខ
            </Button>
          </div>
        </div>
      )}

      {/* Step: Confirm / Payment details */}
      {step === 'confirm' && details && (
        <div className="space-y-4">
          {/* Amount summary */}
          <div className="bg-[#d4af37]/10 border border-[#d4af37]/20 rounded-2xl p-4 text-center">
            <p className="text-white/50 text-xs font-khmer mb-1">ចំនួនដាក់ប្រាក់</p>
            <p className="text-[#d4af37] text-3xl font-bold">${amount.toFixed(2)}</p>
            <p className="text-white/40 text-xs mt-1 font-khmer">{methodInfo?.label}</p>
          </div>

          {/* Payment info */}
          <div className="bg-white/5 rounded-2xl p-4 space-y-3">
            <p className="text-white/50 text-xs font-khmer">ព័ត៌មានបង់ប្រាក់</p>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs font-khmer">ឈ្មោះគណនី</p>
                <p className="text-white text-sm font-semibold">{details.name}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs font-khmer">លេខគណនី</p>
                <p className="text-white text-sm font-semibold font-mono">{details.account}</p>
              </div>
              <button
                onClick={() => handleCopy(details.account)}
                className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs font-khmer">ចំនួន</p>
                <p className="text-[#d4af37] text-sm font-bold">${amount.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleCopy(amount.toFixed(2))}
                className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <p className="text-white/30 text-xs text-center font-khmer leading-5">
            បន្ទាប់ពីបង់ប្រាក់ហើយ សូមចុចប៊ូតុងខាងក្រោម
            <br />
            ការបញ្ជាក់ត្រូវចំណាយពេល ១-២៤ ម៉ោង
          </p>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep('amount')} className="flex-1">
              ត្រឡប់
            </Button>
            <Button
              variant="gold"
              onClick={handleSubmit}
              loading={deposit.isPending}
              className="flex-1"
            >
              បានបង់ប្រាក់រួចហើយ
            </Button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold font-khmer">ស្នើសុំបានស្ថាបនា!</h3>
            <p className="text-white/50 text-sm font-khmer mt-2 leading-5">
              ការស្នើសុំដាក់ប្រាក់របស់អ្នកត្រូវបានទទួលរួចហើយ
              <br />
              Admin នឹងបញ្ជាក់ក្នុងរយ:ពេល ១-២៤ ម៉ោង
            </p>
          </div>
          <Button variant="gold" fullWidth onClick={handleClose}>
            យល់ព្រម
          </Button>
        </div>
      )}
    </Modal>
  )
}

export default DepositModal
