import { useState } from 'react';
import { Search, Filter, Heart, Share2, Award, TrendingUp, Camera } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

export default function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Styles', count: 247 },
    { id: 'fades', label: 'Fades', count: 89 },
    { id: 'classic', label: 'Classic Cuts', count: 56 },
    { id: 'beards', label: 'Beard Styles', count: 43 },
    { id: 'color', label: 'Color & Highlights', count: 32 },
    { id: 'textured', label: 'Textured', count: 27 },
  ];

  const featured = [
    {
      id: 1,
      title: 'Modern Taper Fade',
      barber: 'Marcus Johnson',
      category: 'fades',
      likes: 342,
      featured: true,
      tags: ['fade', 'modern', 'clean'],
      description: 'Clean taper fade with textured top. Perfect blend from skin to medium length.',
      image: '🔥',
      gradient: 'from-sf-gold via-sf-gold-light to-sf-gold-glow',
    },
    {
      id: 2,
      title: 'Classic Pompadour',
      barber: 'David Chen',
      category: 'classic',
      likes: 289,
      featured: true,
      tags: ['classic', 'volume', 'elegant'],
      description: 'Traditional pompadour with modern twist. High volume and shine.',
      image: '👑',
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
    },
    {
      id: 3,
      title: 'Textured Crop',
      barber: 'Alex Rodriguez',
      category: 'textured',
      likes: 267,
      featured: false,
      tags: ['textured', 'casual', 'trendy'],
      description: 'Low maintenance textured crop. Great for wavy hair types.',
      image: '✂️',
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
    },
    {
      id: 4,
      title: 'Executive Beard Trim',
      barber: 'Marcus Johnson',
      category: 'beards',
      likes: 223,
      featured: false,
      tags: ['beard', 'professional', 'groomed'],
      description: 'Sharp beard lines with perfect symmetry. Professional look.',
      image: '🧔',
      gradient: 'from-orange-600 via-orange-500 to-yellow-500',
    },
    {
      id: 5,
      title: 'Platinum Blonde',
      barber: 'Sarah Williams',
      category: 'color',
      likes: 198,
      featured: true,
      tags: ['color', 'bold', 'platinum'],
      description: 'Full platinum transformation with toner. High-end color work.',
      image: '🎨',
      gradient: 'from-gray-400 via-gray-300 to-white',
    },
    {
      id: 6,
      title: 'High Skin Fade',
      barber: 'David Chen',
      category: 'fades',
      likes: 187,
      featured: false,
      tags: ['fade', 'sharp', 'high'],
      description: 'Crisp high skin fade with surgical line work. Clean edges.',
      image: '⚡',
      gradient: 'from-red-600 via-red-500 to-orange-500',
    },
    {
      id: 7,
      title: 'Curly Top Fade',
      barber: 'Alex Rodriguez',
      category: 'textured',
      likes: 176,
      featured: false,
      tags: ['curly', 'fade', 'natural'],
      description: 'Natural curl definition with mid fade. Moisture retention focus.',
      image: '🌊',
      gradient: 'from-green-600 via-green-500 to-teal-500',
    },
    {
      id: 8,
      title: 'Slick Back Classic',
      barber: 'Marcus Johnson',
      category: 'classic',
      likes: 165,
      featured: false,
      tags: ['classic', 'slick', 'formal'],
      description: 'Timeless slick back style. Perfect for formal occasions.',
      image: '💎',
      gradient: 'from-indigo-600 via-indigo-500 to-purple-500',
    },
    {
      id: 9,
      title: 'Styled Beard',
      barber: 'Sarah Williams',
      category: 'beards',
      likes: 154,
      featured: false,
      tags: ['beard', 'styled', 'shaped'],
      description: 'Sculpted beard with hot towel treatment and premium oils.',
      image: '🔶',
      gradient: 'from-amber-600 via-amber-500 to-yellow-500',
    },
  ];

  const barbers = [
    { name: 'Marcus Johnson', avatar: '👨🏿', works: 89, rating: 4.9 },
    { name: 'David Chen', avatar: '👨🏻', works: 67, rating: 4.8 },
    { name: 'Alex Rodriguez', avatar: '👨🏽', works: 54, rating: 4.9 },
    { name: 'Sarah Williams', avatar: '👩🏼', works: 37, rating: 5.0 },
  ];

  const filteredGallery = featured.filter((item) => {
    if (selectedFilter !== 'all' && item.category !== selectedFilter) return false;
    if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

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
              <Camera className="w-4 h-4 inline mr-2" />
              Customer Gallery
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Our Best
            <br />
            <span className="text-glow">Work Showcase</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Browse hundreds of stunning transformations from our master barbers
          </p>
        </div>

        {/* Stats Bar */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <div className="glass-panel p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-gold mb-1">247+</div>
                <div className="text-sm text-sf-text-muted">Total Styles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-1">5.2K</div>
                <div className="text-sm text-sf-text-muted">Total Likes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-1">4.9</div>
                <div className="text-sm text-sf-text-muted">Avg Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gold mb-1">1.2K</div>
                <div className="text-sm text-sf-text-muted">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <div className="glass-card p-6">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search styles..."
                  className="input-luxury w-full pl-12"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gold flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedFilter === cat.id
                      ? 'bg-gold text-sf-black font-semibold'
                      : 'bg-sf-brown text-sf-text-secondary hover:bg-sf-brown-light'
                  }`}
                >
                  {cat.label}
                  <span className="ml-2 opacity-70">({cat.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="glass-card overflow-hidden cursor-pointer group hover:scale-105 transition-transform"
              >
                {/* Image */}
                <div
                  className={`h-64 bg-gradient-to-br ${item.gradient} flex items-center justify-center text-8xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-sf-black/20 group-hover:bg-sf-black/0 transition-colors" />
                  {item.image}
                  {item.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="badge-gold px-3 py-1 text-xs">
                        <Award className="w-3 h-3 inline mr-1" />
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-sf-text-primary mb-1 text-lg">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-sf-text-muted mb-3">
                    <span>By {item.barber}</span>
                  </div>
                  <p className="text-sm text-sf-text-secondary mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded bg-sf-brown text-sf-text-muted"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-sf-brown-light">
                    <button className="flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm font-semibold">{item.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sf-text-muted hover:text-gold transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Barbers */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="glass-panel p-8">
            <h2 className="heading-gold text-3xl mb-8 text-center">
              Meet Our Master Barbers
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {barbers.map((barber) => (
                <div key={barber.name} className="glass-card p-6 text-center">
                  <div className="text-6xl mb-4">{barber.avatar}</div>
                  <h3 className="font-bold text-sf-text-primary mb-2">
                    {barber.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Award className="w-4 h-4 text-gold" />
                    <span className="text-gold font-semibold">{barber.rating}</span>
                  </div>
                  <div className="text-sm text-sf-text-muted mb-4">
                    {barber.works} styles showcased
                  </div>
                  <button className="btn-outline-gold w-full text-sm py-2">
                    View Portfolio
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload CTA */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          <div className="glass-panel p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gold mx-auto mb-6" />
            <h2 className="heading-gold text-3xl mb-4">
              Love Your New Look?
            </h2>
            <p className="text-sf-text-secondary mb-6 max-w-2xl mx-auto">
              Share your transformation with us! Get featured in our gallery and inspire
              others. Plus, earn rewards for every submission.
            </p>
            <button className="btn-gold px-8 py-3">
              <Camera className="w-5 h-5 inline mr-2" />
              Submit Your Style
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-sf-black/95 z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="glass-panel max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              {/* Large Image */}
              <div
                className={`h-96 bg-gradient-to-br ${selectedImage.gradient} flex items-center justify-center text-9xl rounded-lg mb-6`}
              >
                {selectedImage.image}
              </div>

              {/* Details */}
              <div className="mb-6">
                <h2 className="heading-gold text-4xl mb-2">
                  {selectedImage.title}
                </h2>
                <div className="text-sf-text-muted mb-4">
                  Created by {selectedImage.barber}
                </div>
                <p className="text-sf-text-secondary text-lg mb-4">
                  {selectedImage.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedImage.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-sm px-3 py-1 rounded bg-sf-brown text-sf-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button className="btn-gold flex-1">
                    Book This Style
                  </button>
                  <button className="btn-outline-gold flex-1">
                    <Heart className="w-5 h-5 inline mr-2" />
                    Like ({selectedImage.likes})
                  </button>
                  <button className="btn-outline-gold flex-1">
                    <Share2 className="w-5 h-5 inline mr-2" />
                    Share
                  </button>
                </div>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="btn-ghost w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
