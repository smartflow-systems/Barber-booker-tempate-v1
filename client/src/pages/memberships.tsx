import { useState } from 'react';
import { Check, Crown, Zap, Star, Gift } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function Memberships() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const tiers = [
    {
      name: "Bronze",
      icon: <Star className="w-8 h-8" />,
      price: { monthly: 49, yearly: 470 },
      color: "#CD7F32",
      gradient: "from-[#CD7F32] to-[#B87333]",
      popular: false,
      features: [
        "2 haircuts per month",
        "10% off all services",
        "Priority booking",
        "Birthday month special",
        "Member-only events"
      ]
    },
    {
      name: "Silver",
      icon: <Zap className="w-8 h-8" />,
      price: { monthly: 89, yearly: 850 },
      color: "#C0C0C0",
      gradient: "from-[#C0C0C0] to-[#A8A8A8]",
      popular: false,
      features: [
        "4 haircuts per month",
        "15% off all services",
        "Skip the line access",
        "Free beard trim monthly",
        "Complimentary beverage",
        "Product samples",
        "Referral rewards"
      ]
    },
    {
      name: "Gold",
      icon: <Crown className="w-8 h-8" />,
      price: { monthly: 149, yearly: 1420 },
      color: "#d4af37",
      gradient: "from-sf-gold to-sf-gold-light",
      popular: true,
      features: [
        "Unlimited haircuts",
        "20% off all services",
        "VIP lounge access",
        "Free styling products",
        "Personal barber assigned",
        "Concierge booking",
        "Free hot towel shave monthly",
        "Exclusive merchandise"
      ]
    },
    {
      name: "Platinum",
      icon: <Gift className="w-8 h-8" />,
      price: { monthly: 249, yearly: 2390 },
      color: "#E5E4E2",
      gradient: "from-[#E5E4E2] to-[#FFFFFF]",
      popular: false,
      features: [
        "Everything in Gold",
        "25% off all services",
        "Home service available",
        "Premium product package",
        "Complimentary guest passes",
        "Style consultation quarterly",
        "VIP events & experiences",
        "Personal grooming kit",
        "24/7 priority support"
      ]
    }
  ];

  const calculateSavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { savings, percentage };
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
              VIP Membership Program
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Choose Your
            <br />
            <span className="text-glow">Luxury Tier</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Unlock exclusive benefits, save money, and experience
            white-glove grooming service
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <span className={`text-lg ${billingCycle === 'monthly' ? 'text-gold font-semibold' : 'text-sf-text-muted'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-sf-brown-light rounded-full border border-gold transition-colors"
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-gold rounded-full transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-8' : ''
                }`}
              />
            </button>
            <span className={`text-lg ${billingCycle === 'yearly' ? 'text-gold font-semibold' : 'text-sf-text-muted'}`}>
              Yearly
              <span className="ml-2 text-sm badge-gold">Save up to 20%</span>
            </span>
          </div>
        </div>

        {/* Membership Cards */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => {
              const { savings, percentage } = calculateSavings(tier.price.monthly, tier.price.yearly);
              const price = billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly;

              return (
                <div
                  key={index}
                  className={`glass-card p-8 relative ${
                    tier.popular ? 'ring-2 ring-gold glow-gold' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="badge-gold px-6 py-2">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tier.gradient} flex items-center justify-center mb-6`}>
                    <div className="text-sf-black">
                      {tier.icon}
                    </div>
                  </div>

                  {/* Tier Name */}
                  <h3 className="text-2xl font-bold mb-2" style={{ color: tier.color }}>
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-sf-text-primary">
                        ${price}
                      </span>
                      <span className="text-sf-text-muted ml-2">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-gold mt-1">
                        Save ${savings} ({percentage}%)
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                        <span className="text-sf-text-secondary text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                      tier.popular
                        ? 'btn-gold'
                        : 'btn-outline-gold'
                    }`}
                  >
                    Choose {tier.name}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="glass-panel p-12">
            <h2 className="heading-gold text-3xl text-center mb-8">
              Membership Benefits
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gold mb-2">
                  Unlimited
                </div>
                <div className="text-sf-text-muted">
                  Cuts on Gold & Platinum
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gold mb-2">
                  Up to 25%
                </div>
                <div className="text-sf-text-muted">
                  Off All Services
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gold mb-2">
                  VIP
                </div>
                <div className="text-sf-text-muted">
                  Priority Access
                </div>
              </div>
            </div>
            <div className="text-center mt-8">
              <p className="text-sf-text-secondary mb-4">
                All memberships include a 30-day money-back guarantee.
                Cancel anytime, no questions asked.
              </p>
              <button className="btn-ghost">
                View Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
