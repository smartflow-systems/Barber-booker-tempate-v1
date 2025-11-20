import { useState } from 'react';
import { Gift, Check, CreditCard, Mail, Sparkles } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function GiftCards() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [step, setStep] = useState<'select' | 'customize' | 'checkout'>('select');
  const [formData, setFormData] = useState({
    senderName: '',
    senderEmail: '',
    recipientName: '',
    recipientEmail: '',
    message: '',
    deliveryDate: '',
  });

  const presetAmounts = [50, 100, 150, 200, 300, 500];

  const designs = [
    {
      id: 'classic',
      name: 'Classic Gold',
      gradient: 'from-sf-gold via-sf-gold-light to-sf-gold',
      preview: '🪙',
    },
    {
      id: 'luxury',
      name: 'Luxury Black',
      gradient: 'from-sf-black via-sf-brown to-sf-brown-light',
      preview: '💎',
    },
    {
      id: 'elegant',
      name: 'Elegant Shine',
      gradient: 'from-sf-gold-dark via-sf-gold to-sf-gold-glow',
      preview: '✨',
    },
  ];

  const [selectedDesign, setSelectedDesign] = useState(designs[0].id);

  const amount = selectedAmount || (customAmount ? parseInt(customAmount) : 0);

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const proceedToCustomize = () => {
    if (amount >= 25) {
      setStep('customize');
    }
  };

  const proceedToCheckout = () => {
    if (formData.recipientName && formData.recipientEmail) {
      setStep('checkout');
    }
  };

  return (
    <div className="min-h-screen bg-sf-black">
      {/* Animated Background */}
      <canvas
        id="sfs-circuit"
        className="fixed top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center py-20 px-6">
          <div className="inline-block mb-6">
            <span className="badge-gold text-base px-6 py-2">
              <Gift className="w-4 h-4 inline mr-2" />
              Premium Gift Cards
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Give The Gift Of
            <br />
            <span className="text-glow">Luxury Grooming</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Delight someone special with a premium grooming experience they'll never forget
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto px-6 mb-12">
          <div className="flex items-center justify-between">
            {[
              { id: 'select', label: 'Select Amount' },
              { id: 'customize', label: 'Customize' },
              { id: 'checkout', label: 'Checkout' },
            ].map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      step === s.id
                        ? 'border-gold bg-gold text-sf-black'
                        : s.id === 'select' || (s.id === 'customize' && (step === 'customize' || step === 'checkout'))
                        ? 'border-gold bg-sf-brown text-gold'
                        : 'border-sf-brown-lighter bg-sf-brown text-sf-text-muted'
                    }`}
                  >
                    {s.id === 'select' || (s.id === 'customize' && step === 'checkout') ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      step === s.id ? 'text-gold font-semibold' : 'text-sf-text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className="flex-1 h-0.5 bg-sf-brown-light mx-4 -mt-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {step === 'select' && (
            <div className="glass-panel p-8 md:p-12">
              <h2 className="heading-gold text-3xl mb-8 text-center">
                Choose Gift Amount
              </h2>

              {/* Preset Amounts */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleAmountSelect(preset)}
                    className={`glass-card p-6 text-center transition-all cursor-pointer ${
                      selectedAmount === preset
                        ? 'ring-2 ring-gold glow-gold scale-105'
                        : 'hover:scale-105'
                    }`}
                  >
                    <div className="text-3xl font-bold text-sf-text-primary mb-1">
                      ${preset}
                    </div>
                    <div className="text-sm text-sf-text-muted">
                      {preset === 50 && 'Starter'}
                      {preset === 100 && 'Popular'}
                      {preset === 150 && 'Deluxe'}
                      {preset === 200 && 'Premium'}
                      {preset === 300 && 'Elite'}
                      {preset === 500 && 'Ultimate'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-8">
                <label className="block text-sf-text-secondary mb-3 font-medium">
                  Or Enter Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold text-xl font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => handleCustomAmount(e.target.value)}
                    placeholder="Enter amount (min $25)"
                    className="input-luxury w-full pl-10"
                    min="25"
                  />
                </div>
                <p className="text-sm text-sf-text-muted mt-2">
                  Minimum amount: $25
                </p>
              </div>

              {/* Selected Amount Display */}
              {amount >= 25 && (
                <div className="glass-card p-6 mb-8 border-gold">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-sf-text-muted mb-1">
                        Gift Card Value
                      </div>
                      <div className="text-4xl font-bold text-gold">
                        ${amount}
                      </div>
                    </div>
                    <Sparkles className="w-12 h-12 text-gold" />
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={proceedToCustomize}
                disabled={amount < 25}
                className="btn-gold w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Customize
              </button>
            </div>
          )}

          {step === 'customize' && (
            <div className="glass-panel p-8 md:p-12">
              <h2 className="heading-gold text-3xl mb-8 text-center">
                Personalize Your Gift
              </h2>

              {/* Card Design Selection */}
              <div className="mb-8">
                <label className="block text-sf-text-secondary mb-4 font-medium">
                  Choose Card Design
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {designs.map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design.id)}
                      className={`glass-card p-6 text-center transition-all cursor-pointer ${
                        selectedDesign === design.id
                          ? 'ring-2 ring-gold glow-gold'
                          : ''
                      }`}
                    >
                      <div
                        className={`h-32 rounded-lg bg-gradient-to-br ${design.gradient} flex items-center justify-center mb-3`}
                      >
                        <span className="text-5xl">{design.preview}</span>
                      </div>
                      <div className="text-sf-text-primary font-semibold">
                        {design.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gift Details Form */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sf-text-secondary mb-2 font-medium">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) =>
                      setFormData({ ...formData, senderName: e.target.value })
                    }
                    placeholder="John Doe"
                    className="input-luxury w-full"
                  />
                </div>
                <div>
                  <label className="block text-sf-text-secondary mb-2 font-medium">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, senderEmail: e.target.value })
                    }
                    placeholder="john@example.com"
                    className="input-luxury w-full"
                  />
                </div>
                <div>
                  <label className="block text-sf-text-secondary mb-2 font-medium">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientName: e.target.value })
                    }
                    placeholder="Jane Smith"
                    className="input-luxury w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sf-text-secondary mb-2 font-medium">
                    Recipient Email *
                  </label>
                  <input
                    type="email"
                    value={formData.recipientEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientEmail: e.target.value })
                    }
                    placeholder="jane@example.com"
                    className="input-luxury w-full"
                    required
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sf-text-secondary mb-2 font-medium">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Add a heartfelt message..."
                  className="input-luxury w-full h-32 resize-none"
                  maxLength={300}
                />
                <div className="text-sm text-sf-text-muted mt-2 text-right">
                  {formData.message.length}/300
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sf-text-secondary mb-2 font-medium">
                  Delivery Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryDate: e.target.value })
                  }
                  className="input-luxury w-full"
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-sm text-sf-text-muted mt-2">
                  Leave blank to send immediately
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setStep('select')}
                  className="btn-outline-gold flex-1 py-3"
                >
                  Back
                </button>
                <button
                  onClick={proceedToCheckout}
                  disabled={!formData.recipientName || !formData.recipientEmail}
                  className="btn-gold flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Checkout
                </button>
              </div>
            </div>
          )}

          {step === 'checkout' && (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="md:col-span-2">
                <div className="glass-panel p-8">
                  <h2 className="heading-gold text-2xl mb-6">
                    Payment Details
                  </h2>

                  {/* Payment Form */}
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-sf-text-secondary mb-2 font-medium">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-5 h-5" />
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="input-luxury w-full pl-12"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sf-text-secondary mb-2 font-medium">
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="input-luxury w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sf-text-secondary mb-2 font-medium">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="input-luxury w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sf-text-secondary mb-2 font-medium">
                        Billing ZIP Code
                      </label>
                      <input
                        type="text"
                        placeholder="12345"
                        className="input-luxury w-full"
                      />
                    </div>
                  </div>

                  <button className="btn-gold w-full py-4 text-lg">
                    Complete Purchase - ${amount}
                  </button>

                  <p className="text-center text-sm text-sf-text-muted mt-4">
                    Secure payment powered by Stripe
                  </p>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div>
                <div className="glass-card p-6 sticky top-6">
                  <h3 className="text-xl font-bold text-sf-text-primary mb-4">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-sf-text-muted">Gift Amount</span>
                      <span className="text-sf-text-primary font-semibold">
                        ${amount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sf-text-muted">Processing Fee</span>
                      <span className="text-sf-text-primary font-semibold">
                        $0
                      </span>
                    </div>
                    <div className="border-t border-sf-brown-light pt-4">
                      <div className="flex justify-between">
                        <span className="text-sf-text-primary font-bold">
                          Total
                        </span>
                        <span className="text-gold font-bold text-xl">
                          ${amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-sf-brown-light pt-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-sf-text-secondary">
                        Instant email delivery
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-sf-text-secondary">
                        No expiration date
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-sf-text-secondary">
                        Use at any location
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-sf-text-secondary">
                        Refundable within 30 days
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('customize')}
                    className="btn-ghost w-full mt-6"
                  >
                    Edit Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        {step === 'select' && (
          <div className="max-w-4xl mx-auto px-6 pb-20">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-card p-6 text-center">
                <Mail className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-sf-text-primary mb-2">
                  Instant Delivery
                </h3>
                <p className="text-sm text-sf-text-muted">
                  Gift cards delivered via email within seconds
                </p>
              </div>
              <div className="glass-card p-6 text-center">
                <Sparkles className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-sf-text-primary mb-2">
                  Custom Designs
                </h3>
                <p className="text-sm text-sf-text-muted">
                  Beautiful designs with personal messages
                </p>
              </div>
              <div className="glass-card p-6 text-center">
                <Check className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-sf-text-primary mb-2">
                  No Expiration
                </h3>
                <p className="text-sm text-sf-text-muted">
                  Gift cards never expire, use anytime
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
