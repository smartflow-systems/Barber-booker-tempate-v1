import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Scissors, Star, Gift, Users, TrendingUp, Award } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function LuxuryHome() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "AI Style Consultant",
      description: "Get personalized recommendations based on your face shape and lifestyle",
      gradient: "from-gold to-gold-light"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Gift Cards",
      description: "Send the perfect gift with personalized digital gift cards",
      gradient: "from-gold-light to-gold"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "VIP Memberships",
      description: "Unlock exclusive benefits with our tiered membership program",
      gradient: "from-gold to-gold-dark"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Rewards",
      description: "Earn points, unlock achievements, and get rewarded for loyalty",
      gradient: "from-gold-dark to-gold"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Master Barbers",
      description: "Book with award-winning barbers at multiple locations",
      gradient: "from-gold to-gold-glow"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Premium Experience",
      description: "Virtual queue, online shop, and white-glove service",
      gradient: "from-gold-glow to-gold-light"
    }
  ];

  const stats = [
    { value: "10K+", label: "Happy Clients" },
    { value: "25+", label: "Master Barbers" },
    { value: "4.9", label: "Average Rating" },
    { value: "5", label: "Locations" }
  ];

  return (
    <div className="min-h-screen bg-sf-black overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas
        id="sfs-circuit"
        className="fixed top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6" style={{ zIndex: 1 }}>
        <div
          className="text-center max-w-5xl"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          {/* Badge */}
          <div className="inline-block mb-8 animate-float">
            <span className="badge-gold text-lg px-6 py-2">
              Premium Grooming Experience
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="heading-luxury text-6xl md:text-8xl mb-6 animate-fadeIn">
            Elevate Your
            <br />
            <span className="text-glow">Grooming Game</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-sf-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience luxury barbering powered by AI, enhanced by technology,
            perfected by master craftsmen
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/book">
              <button className="btn-gold text-lg px-8 py-4 w-full sm:w-auto">
                Book Appointment
              </button>
            </Link>
            <Link href="/memberships">
              <button className="btn-outline-gold text-lg px-8 py-4 w-full sm:w-auto">
                View Memberships
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass-card p-6 text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl font-bold text-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-sf-text-muted text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gold rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gold rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="heading-gold text-4xl md:text-5xl mb-4">
              Powerhouse Features
            </h2>
            <p className="text-sf-text-secondary text-lg max-w-2xl mx-auto">
              Everything you need for the ultimate grooming experience
            </p>
            <div className="divider-gold mt-8" />
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card p-8 group cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-sf-black">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gold mb-3">
                  {feature.title}
                </h3>
                <p className="text-sf-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-6" style={{ zIndex: 1 }}>
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-12 text-center">
            <h2 className="heading-luxury text-4xl md:text-5xl mb-6">
              Ready to Experience Luxury?
            </h2>
            <p className="text-sf-text-secondary text-lg mb-8">
              Join thousands of satisfied clients who trust us with their grooming needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book">
                <button className="btn-gold text-lg px-10 py-4">
                  Book Now
                </button>
              </Link>
              <Link href="/gift-cards">
                <button className="btn-outline-gold text-lg px-10 py-4">
                  Buy Gift Card
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
