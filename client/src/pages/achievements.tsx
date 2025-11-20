import { useState } from 'react';
import { Trophy, Award, Star, Zap, Crown, Target, TrendingUp, Gift, Lock } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const userStats = {
    level: 12,
    totalPoints: 2850,
    nextLevelPoints: 3000,
    achievementsUnlocked: 24,
    totalAchievements: 48,
    rank: 'Gold Member',
    streak: 8,
  };

  const categories = [
    { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
    { id: 'visits', label: 'Visits', icon: <Target className="w-4 h-4" /> },
    { id: 'social', label: 'Social', icon: <Star className="w-4 h-4" /> },
    { id: 'loyalty', label: 'Loyalty', icon: <Award className="w-4 h-4" /> },
    { id: 'special', label: 'Special', icon: <Crown className="w-4 h-4" /> },
  ];

  const achievements = [
    {
      id: 1,
      title: 'First Cut',
      description: 'Book your first appointment',
      category: 'visits',
      points: 50,
      unlocked: true,
      progress: 100,
      icon: '✂️',
      tier: 'bronze',
      reward: '$5 off next visit',
    },
    {
      id: 2,
      title: 'Frequent Flyer',
      description: 'Complete 10 appointments',
      category: 'visits',
      points: 200,
      unlocked: true,
      progress: 100,
      icon: '🎯',
      tier: 'silver',
      reward: 'Free styling product',
    },
    {
      id: 3,
      title: 'VIP Status',
      description: 'Complete 50 appointments',
      category: 'visits',
      points: 500,
      unlocked: true,
      progress: 100,
      icon: '👑',
      tier: 'gold',
      reward: 'VIP lounge access',
    },
    {
      id: 4,
      title: 'Century Club',
      description: 'Complete 100 appointments',
      category: 'visits',
      points: 1000,
      unlocked: false,
      progress: 68,
      icon: '💯',
      tier: 'platinum',
      reward: 'Lifetime 10% discount',
    },
    {
      id: 5,
      title: 'Social Butterfly',
      description: 'Share 5 styles on social media',
      category: 'social',
      points: 150,
      unlocked: true,
      progress: 100,
      icon: '🦋',
      tier: 'bronze',
      reward: '$10 credit',
    },
    {
      id: 6,
      title: 'Influencer',
      description: 'Get 100 likes on shared styles',
      category: 'social',
      points: 300,
      unlocked: false,
      progress: 45,
      icon: '📱',
      tier: 'silver',
      reward: 'Free premium service',
    },
    {
      id: 7,
      title: 'Brand Ambassador',
      description: 'Refer 10 new customers',
      category: 'social',
      points: 800,
      unlocked: false,
      progress: 30,
      icon: '🎖️',
      tier: 'gold',
      reward: 'One month free membership',
    },
    {
      id: 8,
      title: 'Loyalty Legend',
      description: 'Maintain 12-month streak',
      category: 'loyalty',
      points: 1200,
      unlocked: false,
      progress: 66,
      icon: '🔥',
      tier: 'platinum',
      reward: 'Custom grooming kit',
    },
    {
      id: 9,
      title: 'Early Bird',
      description: 'Book 5 appointments before 9 AM',
      category: 'special',
      points: 100,
      unlocked: true,
      progress: 100,
      icon: '🌅',
      tier: 'bronze',
      reward: 'Priority booking',
    },
    {
      id: 10,
      title: 'Product Enthusiast',
      description: 'Purchase 20 grooming products',
      category: 'special',
      points: 400,
      unlocked: true,
      progress: 100,
      icon: '🛍️',
      tier: 'silver',
      reward: '20% off products',
    },
    {
      id: 11,
      title: 'Style Explorer',
      description: 'Try 10 different hairstyles',
      category: 'special',
      points: 350,
      unlocked: false,
      progress: 70,
      icon: '🎨',
      tier: 'silver',
      reward: 'Free style consultation',
    },
    {
      id: 12,
      title: 'Birthday Special',
      description: 'Book during your birthday month',
      category: 'special',
      points: 250,
      unlocked: true,
      progress: 100,
      icon: '🎂',
      tier: 'bronze',
      reward: 'Free hot towel shave',
    },
  ];

  const milestones = [
    { level: 5, title: 'Bronze Tier', reward: '5% discount unlocked', reached: true },
    { level: 10, title: 'Silver Tier', reward: '10% discount unlocked', reached: true },
    { level: 15, title: 'Gold Tier', reward: '15% discount unlocked', reached: false },
    { level: 20, title: 'Platinum Tier', reward: '20% discount unlocked', reached: false },
  ];

  const recentActivity = [
    { action: 'Unlocked "Style Explorer"', points: 350, date: '2 days ago' },
    { action: 'Completed 10th appointment', points: 200, date: '1 week ago' },
    { action: 'Shared style on Instagram', points: 50, date: '2 weeks ago' },
    { action: 'Reached Level 12', points: 500, date: '3 weeks ago' },
  ];

  const filteredAchievements = achievements.filter(
    (a) => selectedCategory === 'all' || a.category === selectedCategory
  );

  const progressToNextLevel =
    ((userStats.totalPoints % 250) / 250) * 100;

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
              <Trophy className="w-4 h-4 inline mr-2" />
              Achievements & Rewards
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Your Journey To
            <br />
            <span className="text-glow">Grooming Greatness</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Unlock achievements, earn points, and claim exclusive rewards
          </p>
        </div>

        {/* User Progress Card */}
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="glass-panel p-8">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-5xl mb-2">🏆</div>
                <div className="text-3xl font-bold text-gold mb-1">
                  {userStats.level}
                </div>
                <div className="text-sm text-sf-text-muted">Current Level</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-gold mb-1">
                  {userStats.totalPoints}
                </div>
                <div className="text-sm text-sf-text-muted">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">🎖️</div>
                <div className="text-3xl font-bold text-gold mb-1">
                  {userStats.achievementsUnlocked}/{userStats.totalAchievements}
                </div>
                <div className="text-sm text-sf-text-muted">Achievements</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">🔥</div>
                <div className="text-3xl font-bold text-gold mb-1">
                  {userStats.streak}
                </div>
                <div className="text-sm text-sf-text-muted">Day Streak</div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sf-text-secondary font-medium">
                  Level {userStats.level} - {userStats.rank}
                </span>
                <span className="text-sf-text-muted text-sm">
                  {userStats.totalPoints} / {userStats.nextLevelPoints} XP
                </span>
              </div>
              <div className="h-4 bg-sf-brown rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sf-gold via-sf-gold-light to-sf-gold-glow transition-all duration-500"
                  style={{ width: `${progressToNextLevel}%` }}
                />
              </div>
            </div>
            <p className="text-center text-sm text-sf-text-muted">
              {userStats.nextLevelPoints - userStats.totalPoints} points to next level
            </p>
          </div>
        </div>

        {/* Milestones */}
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <h2 className="heading-gold text-2xl mb-6">Milestones</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.level}
                className={`glass-card p-6 text-center ${
                  milestone.reached ? 'ring-2 ring-gold' : 'opacity-60'
                }`}
              >
                <div className="text-4xl mb-3">
                  {milestone.reached ? '✅' : '🔒'}
                </div>
                <div className="font-bold text-sf-text-primary mb-1">
                  Level {milestone.level}
                </div>
                <div className="text-sm text-sf-text-secondary mb-2">
                  {milestone.title}
                </div>
                <div className="text-xs text-gold">{milestone.reward}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="max-w-5xl mx-auto px-6 mb-8">
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gold text-sf-black font-semibold'
                      : 'bg-sf-brown text-sf-text-secondary hover:bg-sf-brown-light'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`glass-card p-6 relative ${
                  achievement.unlocked
                    ? 'ring-2 ring-gold glow-gold'
                    : 'opacity-75'
                }`}
              >
                {/* Locked Overlay */}
                {!achievement.unlocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-sf-text-muted" />
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-4 ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-sf-gold to-sf-gold-light'
                      : 'bg-sf-brown'
                  }`}
                >
                  {achievement.icon}
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-sf-text-primary mb-1 text-lg">
                  {achievement.title}
                </h3>
                <p className="text-sm text-sf-text-secondary mb-4">
                  {achievement.description}
                </p>

                {/* Progress Bar (if not unlocked) */}
                {!achievement.unlocked && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-sf-text-muted">Progress</span>
                      <span className="text-xs text-gold font-semibold">
                        {achievement.progress}%
                      </span>
                    </div>
                    <div className="h-2 bg-sf-brown rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold transition-all"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Reward */}
                <div className="glass-card p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="text-sm text-sf-text-secondary">
                      {achievement.reward}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-sf-brown-light">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      achievement.tier === 'bronze'
                        ? 'bg-orange-900/30 text-orange-400'
                        : achievement.tier === 'silver'
                        ? 'bg-gray-700/30 text-gray-300'
                        : achievement.tier === 'gold'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-purple-900/30 text-purple-300'
                    }`}
                  >
                    {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
                  </span>
                  <span className="text-gold font-bold">
                    +{achievement.points} XP
                  </span>
                </div>

                {achievement.unlocked && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                      <Star className="w-6 h-6 text-sf-black" fill="currentColor" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-2xl mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sf-gold to-sf-gold-light flex items-center justify-center">
                      <Zap className="w-6 h-6 text-sf-black" />
                    </div>
                    <div>
                      <div className="font-semibold text-sf-text-primary">
                        {activity.action}
                      </div>
                      <div className="text-sm text-sf-text-muted">
                        {activity.date}
                      </div>
                    </div>
                  </div>
                  <div className="text-gold font-bold">
                    +{activity.points} XP
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard CTA */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="glass-panel p-12 text-center">
            <Crown className="w-16 h-16 text-gold mx-auto mb-6" />
            <h2 className="heading-gold text-3xl mb-4">
              Compete With Others
            </h2>
            <p className="text-sf-text-secondary mb-6 max-w-2xl mx-auto">
              See how you rank against other members. Top performers get exclusive
              monthly rewards!
            </p>
            <button className="btn-gold px-8 py-3">
              <Trophy className="w-5 h-5 inline mr-2" />
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
