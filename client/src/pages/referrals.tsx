import { useState } from 'react';
import { Users, Gift, Share2, Copy, Mail, MessageCircle, Check, TrendingUp, DollarSign } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function Referrals() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'JOHN2024';
  const referralLink = `https://barber.shop/book?ref=${referralCode}`;

  const stats = {
    totalReferrals: 12,
    pendingReferrals: 3,
    completedReferrals: 9,
    totalEarned: 270,
    availableCredit: 180,
    usedCredit: 90,
  };

  const tiers = [
    {
      referrals: 5,
      reward: '$25 credit',
      bonus: 'Free styling product',
      reached: true,
    },
    {
      referrals: 10,
      reward: '$75 credit',
      bonus: 'Free premium service',
      reached: true,
    },
    {
      referrals: 25,
      reward: '$200 credit',
      bonus: '3 months free membership',
      reached: false,
    },
    {
      referrals: 50,
      reward: '$500 credit',
      bonus: 'Lifetime VIP status',
      reached: false,
    },
  ];

  const referrals = [
    {
      id: 1,
      name: 'Mike Johnson',
      status: 'completed',
      date: '2024-01-15',
      reward: 30,
      visits: 3,
    },
    {
      id: 2,
      name: 'Sarah Williams',
      status: 'completed',
      date: '2024-01-10',
      reward: 30,
      visits: 5,
    },
    {
      id: 3,
      name: 'Tom Anderson',
      status: 'pending',
      date: '2024-01-20',
      reward: 30,
      visits: 0,
    },
    {
      id: 4,
      name: 'Lisa Chen',
      status: 'completed',
      date: '2024-01-05',
      reward: 30,
      visits: 2,
    },
    {
      id: 5,
      name: 'David Brown',
      status: 'pending',
      date: '2024-01-22',
      reward: 30,
      visits: 0,
    },
  ];

  const rewards = [
    { icon: '💰', title: '$30 Cash Credit', desc: 'For every successful referral' },
    { icon: '🎁', title: 'Bonus Rewards', desc: 'Unlock tiers for extra bonuses' },
    { icon: '⭐', title: 'Priority Access', desc: 'Skip the line with referrals' },
    { icon: '👑', title: 'VIP Status', desc: 'Reach 50 referrals for lifetime VIP' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (method: string) => {
    const message = `Check out this amazing barbershop! Use my code ${referralCode} for $10 off your first visit: ${referralLink}`;

    switch (method) {
      case 'email':
        window.location.href = `mailto:?subject=Get $10 off at our barbershop&body=${encodeURIComponent(message)}`;
        break;
      case 'sms':
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`);
        break;
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
              <Users className="w-4 h-4 inline mr-2" />
              Referral Program
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Share & Earn
            <br />
            <span className="text-glow">Unlimited Rewards</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Refer friends, earn cash credits, and unlock exclusive VIP benefits
          </p>
        </div>

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="glass-panel p-6">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-gold mb-1">
                  {stats.totalReferrals}
                </div>
                <div className="text-sm text-sf-text-muted">Total Referrals</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gold mb-1">
                  {stats.completedReferrals}
                </div>
                <div className="text-sm text-sf-text-muted">Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-400 mb-1">
                  {stats.pendingReferrals}
                </div>
                <div className="text-sm text-sf-text-muted">Pending</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gold mb-1">
                  ${stats.totalEarned}
                </div>
                <div className="text-sm text-sf-text-muted">Total Earned</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-400 mb-1">
                  ${stats.availableCredit}
                </div>
                <div className="text-sm text-sf-text-muted">Available</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-sf-text-muted mb-1">
                  ${stats.usedCredit}
                </div>
                <div className="text-sm text-sf-text-muted">Used</div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link Section */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-3xl mb-6 text-center">
              Your Referral Link
            </h2>

            {/* Referral Code */}
            <div className="glass-card p-6 mb-6">
              <div className="text-center mb-4">
                <div className="text-sm text-sf-text-muted mb-2">Your Code</div>
                <div className="text-4xl font-bold text-gold tracking-wider">
                  {referralCode}
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="input-luxury flex-1"
                />
                <button
                  onClick={handleCopy}
                  className={`btn-gold px-6 transition-all ${
                    copied ? 'bg-green-600' : ''
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 inline mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 inline mr-2" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <h3 className="text-sf-text-secondary mb-4 text-center font-medium">
                Share via:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={() => shareVia('email')}
                  className="glass-card p-4 hover:bg-sf-brown-light transition-colors"
                >
                  <Mail className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-sm text-sf-text-secondary">Email</div>
                </button>
                <button
                  onClick={() => shareVia('sms')}
                  className="glass-card p-4 hover:bg-sf-brown-light transition-colors"
                >
                  <MessageCircle className="w-6 h-6 text-gold mx-auto mb-2" />
                  <div className="text-sm text-sf-text-secondary">SMS</div>
                </button>
                <button
                  onClick={() => shareVia('whatsapp')}
                  className="glass-card p-4 hover:bg-sf-brown-light transition-colors"
                >
                  <span className="text-3xl block mb-2">💬</span>
                  <div className="text-sm text-sf-text-secondary">WhatsApp</div>
                </button>
                <button
                  onClick={() => shareVia('facebook')}
                  className="glass-card p-4 hover:bg-sf-brown-light transition-colors"
                >
                  <span className="text-3xl block mb-2">📘</span>
                  <div className="text-sm text-sf-text-secondary">Facebook</div>
                </button>
                <button
                  onClick={() => shareVia('twitter')}
                  className="glass-card p-4 hover:bg-sf-brown-light transition-colors"
                >
                  <span className="text-3xl block mb-2">🐦</span>
                  <div className="text-sm text-sf-text-secondary">Twitter</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="heading-gold text-3xl mb-8 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sf-gold to-sf-gold-light flex items-center justify-center text-3xl mx-auto mb-4">
                1️⃣
              </div>
              <h3 className="font-bold text-sf-text-primary text-xl mb-3">
                Share Your Link
              </h3>
              <p className="text-sf-text-secondary">
                Send your unique referral link to friends via email, SMS, or social media
              </p>
            </div>
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sf-gold to-sf-gold-light flex items-center justify-center text-3xl mx-auto mb-4">
                2️⃣
              </div>
              <h3 className="font-bold text-sf-text-primary text-xl mb-3">
                Friend Books & Saves
              </h3>
              <p className="text-sf-text-secondary">
                Your friend gets $10 off their first visit when they use your code
              </p>
            </div>
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sf-gold to-sf-gold-light flex items-center justify-center text-3xl mx-auto mb-4">
                3️⃣
              </div>
              <h3 className="font-bold text-sf-text-primary text-xl mb-3">
                You Earn Rewards
              </h3>
              <p className="text-sf-text-secondary">
                Get $30 credit after their first visit, plus bonuses as you refer more
              </p>
            </div>
          </div>
        </div>

        {/* Reward Tiers */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="heading-gold text-3xl mb-8 text-center">
            Unlock Bonus Tiers
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`glass-card p-6 text-center relative ${
                  tier.reached ? 'ring-2 ring-gold glow-gold' : 'opacity-75'
                }`}
              >
                {tier.reached && (
                  <div className="absolute -top-3 -right-3">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                      <Check className="w-6 h-6 text-sf-black" />
                    </div>
                  </div>
                )}
                <div className="text-5xl mb-3">
                  {tier.reached ? '🏆' : '🔒'}
                </div>
                <div className="text-2xl font-bold text-gold mb-2">
                  {tier.referrals}
                </div>
                <div className="text-sm text-sf-text-muted mb-4">Referrals</div>
                <div className="glass-card p-3 mb-2">
                  <div className="font-semibold text-sf-text-primary mb-1">
                    {tier.reward}
                  </div>
                  <div className="text-xs text-sf-text-muted">{tier.bonus}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <div className="inline-block glass-card px-6 py-3">
              <span className="text-sf-text-secondary">Progress to next tier: </span>
              <span className="text-gold font-bold">
                {stats.completedReferrals}/25 referrals
              </span>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <h2 className="heading-gold text-3xl mb-8 text-center">
            Referral Rewards
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {rewards.map((reward, idx) => (
              <div key={idx} className="glass-card p-6 text-center">
                <div className="text-5xl mb-4">{reward.icon}</div>
                <h3 className="font-bold text-sf-text-primary mb-2">
                  {reward.title}
                </h3>
                <p className="text-sm text-sf-text-secondary">{reward.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="glass-panel p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-gold text-2xl">Your Referrals</h2>
              <div className="text-sf-text-muted text-sm">
                {stats.completedReferrals} of {stats.totalReferrals} completed
              </div>
            </div>

            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        referral.status === 'completed'
                          ? 'bg-gradient-to-br from-sf-gold to-sf-gold-light'
                          : 'bg-sf-brown'
                      }`}
                    >
                      {referral.status === 'completed' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <div className="font-semibold text-sf-text-primary">
                        {referral.name}
                      </div>
                      <div className="text-sm text-sf-text-muted">
                        {referral.status === 'completed'
                          ? `${referral.visits} visits • Joined ${referral.date}`
                          : `Signed up ${referral.date}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {referral.status === 'completed' ? (
                      <>
                        <div className="text-gold font-bold text-lg">
                          +${referral.reward}
                        </div>
                        <div className="text-xs text-green-400">Earned</div>
                      </>
                    ) : (
                      <>
                        <div className="text-orange-400 font-semibold">
                          Pending
                        </div>
                        <div className="text-xs text-sf-text-muted">
                          Awaiting first visit
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="glass-panel p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gold mx-auto mb-6" />
            <h2 className="heading-gold text-3xl mb-4">
              Start Earning Today
            </h2>
            <p className="text-sf-text-secondary mb-6 max-w-2xl mx-auto">
              The more you share, the more you earn. There's no limit to how many
              friends you can refer or how much you can earn!
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCopy}
                className="btn-gold px-8 py-3"
              >
                <Share2 className="w-5 h-5 inline mr-2" />
                Share Your Link
              </button>
              <button className="btn-outline-gold px-8 py-3">
                <DollarSign className="w-5 h-5 inline mr-2" />
                Redeem Credit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
