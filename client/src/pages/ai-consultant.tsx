import { useState } from 'react';
import { Camera, Wand2, Sparkles, Upload, CheckCircle, ArrowRight, Bot } from 'lucide-react';
import '@/styles/sfs-complete-theme.css';

interface ConsultationStep {
  id: string;
  title: string;
  completed: boolean;
}

export default function AIConsultant() {
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [formData, setFormData] = useState({
    faceShape: '',
    hairType: '',
    lifestyle: '',
    maintenance: '',
    inspiration: '',
    preferences: [] as string[],
  });

  const steps: ConsultationStep[] = [
    { id: 'upload', title: 'Upload Photo', completed: !!uploadedPhoto },
    { id: 'profile', title: 'Your Profile', completed: !!formData.faceShape },
    { id: 'preferences', title: 'Preferences', completed: formData.preferences.length > 0 },
    { id: 'analysis', title: 'AI Analysis', completed: !!results },
  ];

  const faceShapes = [
    { id: 'oval', label: 'Oval', emoji: '⬭' },
    { id: 'round', label: 'Round', emoji: '⭕' },
    { id: 'square', label: 'Square', emoji: '⬜' },
    { id: 'heart', label: 'Heart', emoji: '💛' },
    { id: 'diamond', label: 'Diamond', emoji: '💎' },
    { id: 'oblong', label: 'Oblong', emoji: '▬' },
  ];

  const hairTypes = [
    { id: 'straight', label: 'Straight', emoji: '➖' },
    { id: 'wavy', label: 'Wavy', emoji: '〰️' },
    { id: 'curly', label: 'Curly', emoji: '🌀' },
    { id: 'coily', label: 'Coily', emoji: '♾️' },
  ];

  const lifestyles = [
    { id: 'professional', label: 'Professional', desc: 'Corporate/Business' },
    { id: 'casual', label: 'Casual', desc: 'Relaxed & Comfortable' },
    { id: 'active', label: 'Active', desc: 'Sports & Fitness' },
    { id: 'creative', label: 'Creative', desc: 'Artistic & Unique' },
  ];

  const maintenanceLevels = [
    { id: 'low', label: 'Low', desc: '5-10 min daily' },
    { id: 'medium', label: 'Medium', desc: '10-20 min daily' },
    { id: 'high', label: 'High', desc: '20+ min daily' },
  ];

  const stylePreferences = [
    { id: 'classic', label: 'Classic Cuts', icon: '✂️' },
    { id: 'modern', label: 'Modern Styles', icon: '🔥' },
    { id: 'fade', label: 'Fades', icon: '📐' },
    { id: 'textured', label: 'Textured', icon: '🌊' },
    { id: 'short', label: 'Short Hair', icon: '⚡' },
    { id: 'medium', label: 'Medium Length', icon: '🎯' },
    { id: 'beard', label: 'Beard Styling', icon: '🧔' },
    { id: 'color', label: 'Color/Highlights', icon: '🎨' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePreference = (id: string) => {
    setFormData({
      ...formData,
      preferences: formData.preferences.includes(id)
        ? formData.preferences.filter((p) => p !== id)
        : [...formData.preferences, id],
    });
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    setCurrentStep(3);

    // Simulate AI analysis (in production, this would call OpenAI Vision API)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setResults({
      recommendations: [
        {
          name: 'Modern Textured Crop',
          confidence: 95,
          description: 'A versatile, low-maintenance style perfect for your face shape and lifestyle.',
          benefits: [
            'Suits your oval face shape perfectly',
            'Easy 5-minute daily styling',
            'Professional yet modern look',
            'Works great with your hair type',
          ],
          image: '💇',
        },
        {
          name: 'Classic Taper Fade',
          confidence: 88,
          description: 'Timeless fade with clean lines, ideal for professional environments.',
          benefits: [
            'Sharp, professional appearance',
            'Complements your face structure',
            'Minimal daily maintenance',
            'Versatile for any occasion',
          ],
          image: '✂️',
        },
        {
          name: 'Textured Quiff',
          confidence: 82,
          description: 'Stylish and modern with volume on top, perfect for making a statement.',
          benefits: [
            'Adds height and dimension',
            'Great for oval face shapes',
            'Medium maintenance routine',
            'Trendy and eye-catching',
          ],
          image: '🌟',
        },
      ],
      products: [
        { name: 'Premium Matte Clay', price: 24, usage: 'Daily styling' },
        { name: 'Sea Salt Spray', price: 18, usage: 'Texture & volume' },
        { name: 'Beard Oil', price: 22, usage: 'Grooming & softness' },
      ],
      faceShapeInsights: 'Your oval face shape is considered the most versatile, allowing you to pull off virtually any hairstyle. We recommend styles that maintain balance without adding too much height or width.',
      hairTypeInsights: 'Your hair type holds style well and responds great to texturizing products. Consider using light to medium hold products for natural movement.',
    });

    setAnalyzing(false);
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
              <Bot className="w-4 h-4 inline mr-2" />
              AI-Powered Style Analysis
            </span>
          </div>
          <h1 className="heading-luxury text-5xl md:text-7xl mb-6">
            Your Personal
            <br />
            <span className="text-glow">AI Style Consultant</span>
          </h1>
          <p className="text-xl text-sf-text-secondary max-w-2xl mx-auto">
            Get personalized hairstyle recommendations powered by advanced AI technology
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep === idx
                        ? 'border-gold bg-gold text-sf-black scale-110'
                        : currentStep > idx
                        ? 'border-gold bg-sf-brown text-gold'
                        : 'border-sf-brown-lighter bg-sf-brown text-sf-text-muted'
                    }`}
                  >
                    {currentStep > idx ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      currentStep === idx
                        ? 'text-gold font-semibold'
                        : currentStep > idx
                        ? 'text-gold'
                        : 'text-sf-text-muted'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 -mt-8 transition-colors ${
                      currentStep > idx ? 'bg-gold' : 'bg-sf-brown-light'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-6 pb-20">
          {/* Step 1: Upload Photo */}
          {currentStep === 0 && (
            <div className="glass-panel p-8 md:p-12">
              <h2 className="heading-gold text-3xl mb-4 text-center">
                Upload Your Photo
              </h2>
              <p className="text-center text-sf-text-muted mb-8">
                For best results, use a clear front-facing photo with good lighting
              </p>

              <div className="max-w-2xl mx-auto">
                {!uploadedPhoto ? (
                  <label className="block cursor-pointer">
                    <div className="glass-card p-12 text-center border-2 border-dashed border-gold hover:bg-sf-brown-light transition-colors">
                      <Upload className="w-16 h-16 text-gold mx-auto mb-4" />
                      <div className="text-xl text-sf-text-primary mb-2">
                        Click to upload or drag & drop
                      </div>
                      <div className="text-sm text-sf-text-muted">
                        PNG, JPG up to 10MB
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="glass-card p-4">
                      <img
                        src={uploadedPhoto}
                        alt="Uploaded photo"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex gap-4">
                      <label className="btn-outline-gold flex-1 py-3 text-center cursor-pointer">
                        <Camera className="w-5 h-5 inline mr-2" />
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="btn-gold flex-1 py-3"
                      >
                        Continue
                        <ArrowRight className="w-5 h-5 inline ml-2" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {currentStep === 1 && (
            <div className="glass-panel p-8 md:p-12">
              <h2 className="heading-gold text-3xl mb-8 text-center">
                Tell Us About Yourself
              </h2>

              <div className="space-y-8 max-w-3xl mx-auto">
                {/* Face Shape */}
                <div>
                  <label className="block text-sf-text-secondary mb-4 font-medium text-lg">
                    What's your face shape?
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {faceShapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() =>
                          setFormData({ ...formData, faceShape: shape.id })
                        }
                        className={`glass-card p-4 text-center transition-all ${
                          formData.faceShape === shape.id
                            ? 'ring-2 ring-gold glow-gold'
                            : ''
                        }`}
                      >
                        <div className="text-3xl mb-2">{shape.emoji}</div>
                        <div className="text-sm text-sf-text-secondary">
                          {shape.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Type */}
                <div>
                  <label className="block text-sf-text-secondary mb-4 font-medium text-lg">
                    What's your hair type?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {hairTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() =>
                          setFormData({ ...formData, hairType: type.id })
                        }
                        className={`glass-card p-4 text-center transition-all ${
                          formData.hairType === type.id
                            ? 'ring-2 ring-gold glow-gold'
                            : ''
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.emoji}</div>
                        <div className="text-sm text-sf-text-secondary">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lifestyle */}
                <div>
                  <label className="block text-sf-text-secondary mb-4 font-medium text-lg">
                    What's your lifestyle?
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {lifestyles.map((lifestyle) => (
                      <button
                        key={lifestyle.id}
                        onClick={() =>
                          setFormData({ ...formData, lifestyle: lifestyle.id })
                        }
                        className={`glass-card p-4 text-left transition-all ${
                          formData.lifestyle === lifestyle.id
                            ? 'ring-2 ring-gold glow-gold'
                            : ''
                        }`}
                      >
                        <div className="font-semibold text-sf-text-primary mb-1">
                          {lifestyle.label}
                        </div>
                        <div className="text-sm text-sf-text-muted">
                          {lifestyle.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Maintenance */}
                <div>
                  <label className="block text-sf-text-secondary mb-4 font-medium text-lg">
                    How much time for daily styling?
                  </label>
                  <div className="grid md:grid-cols-3 gap-3">
                    {maintenanceLevels.map((level) => (
                      <button
                        key={level.id}
                        onClick={() =>
                          setFormData({ ...formData, maintenance: level.id })
                        }
                        className={`glass-card p-4 text-center transition-all ${
                          formData.maintenance === level.id
                            ? 'ring-2 ring-gold glow-gold'
                            : ''
                        }`}
                      >
                        <div className="font-semibold text-sf-text-primary mb-1">
                          {level.label}
                        </div>
                        <div className="text-sm text-sf-text-muted">
                          {level.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="btn-outline-gold flex-1 py-3"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={
                      !formData.faceShape ||
                      !formData.hairType ||
                      !formData.lifestyle ||
                      !formData.maintenance
                    }
                    className="btn-gold flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 2 && (
            <div className="glass-panel p-8 md:p-12">
              <h2 className="heading-gold text-3xl mb-4 text-center">
                Style Preferences
              </h2>
              <p className="text-center text-sf-text-muted mb-8">
                Select all styles you're interested in (choose at least one)
              </p>

              <div className="max-w-3xl mx-auto space-y-8">
                <div className="grid md:grid-cols-4 gap-3">
                  {stylePreferences.map((pref) => (
                    <button
                      key={pref.id}
                      onClick={() => togglePreference(pref.id)}
                      className={`glass-card p-4 text-center transition-all ${
                        formData.preferences.includes(pref.id)
                          ? 'ring-2 ring-gold glow-gold'
                          : ''
                      }`}
                    >
                      <div className="text-3xl mb-2">{pref.icon}</div>
                      <div className="text-sm text-sf-text-secondary">
                        {pref.label}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Inspiration */}
                <div>
                  <label className="block text-sf-text-secondary mb-2 font-medium">
                    Any celebrity or style inspiration? (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.inspiration}
                    onChange={(e) =>
                      setFormData({ ...formData, inspiration: e.target.value })
                    }
                    placeholder="e.g., David Beckham, Brad Pitt, etc."
                    className="input-luxury w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-outline-gold flex-1 py-3"
                  >
                    Back
                  </button>
                  <button
                    onClick={runAIAnalysis}
                    disabled={formData.preferences.length === 0}
                    className="btn-gold flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 className="w-5 h-5 inline mr-2" />
                    Analyze with AI
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: AI Analysis & Results */}
          {currentStep === 3 && (
            <>
              {analyzing ? (
                <div className="glass-panel p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-gold border-t-transparent animate-spin" />
                      <Sparkles className="w-12 h-12 text-gold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <h2 className="heading-gold text-3xl mb-4">
                      AI Analysis in Progress
                    </h2>
                    <p className="text-sf-text-muted">
                      Our AI is analyzing your photo, face shape, and preferences to
                      generate personalized recommendations...
                    </p>
                  </div>
                </div>
              ) : results ? (
                <div className="space-y-8">
                  {/* Results Header */}
                  <div className="glass-panel p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold text-sf-black mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h2 className="heading-gold text-3xl mb-2">
                      Analysis Complete!
                    </h2>
                    <p className="text-sf-text-muted">
                      Here are your personalized style recommendations
                    </p>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-6">
                    <h3 className="heading-gold text-2xl">
                      Recommended Hairstyles
                    </h3>
                    {results.recommendations.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className={`glass-card p-6 ${
                          idx === 0 ? 'ring-2 ring-gold glow-gold' : ''
                        }`}
                      >
                        <div className="flex items-start gap-6">
                          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-sf-gold to-sf-gold-light flex items-center justify-center text-4xl flex-shrink-0">
                            {rec.image}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="text-xl font-bold text-sf-text-primary mb-1">
                                  {rec.name}
                                  {idx === 0 && (
                                    <span className="ml-3 badge-gold text-xs">
                                      Best Match
                                    </span>
                                  )}
                                </h4>
                                <p className="text-sf-text-muted text-sm">
                                  {rec.description}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-gold font-bold text-2xl">
                                  {rec.confidence}%
                                </div>
                                <div className="text-xs text-sf-text-muted">
                                  Match
                                </div>
                              </div>
                            </div>
                            <ul className="space-y-2 mt-4">
                              {rec.benefits.map((benefit: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-sf-text-secondary"
                                >
                                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                            <button className="btn-gold mt-4">
                              Book This Style
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Insights */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="glass-card p-6">
                      <h4 className="font-bold text-sf-text-primary mb-3 flex items-center gap-2">
                        <span className="text-2xl">👤</span>
                        Face Shape Insights
                      </h4>
                      <p className="text-sm text-sf-text-secondary">
                        {results.faceShapeInsights}
                      </p>
                    </div>
                    <div className="glass-card p-6">
                      <h4 className="font-bold text-sf-text-primary mb-3 flex items-center gap-2">
                        <span className="text-2xl">💈</span>
                        Hair Type Insights
                      </h4>
                      <p className="text-sm text-sf-text-secondary">
                        {results.hairTypeInsights}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Products */}
                  <div className="glass-panel p-8">
                    <h3 className="heading-gold text-2xl mb-6">
                      Recommended Products
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      {results.products.map((product: any, idx: number) => (
                        <div key={idx} className="glass-card p-4">
                          <div className="font-semibold text-sf-text-primary mb-1">
                            {product.name}
                          </div>
                          <div className="text-sm text-sf-text-muted mb-2">
                            {product.usage}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gold font-bold">
                              ${product.price}
                            </span>
                            <button className="btn-outline-gold text-sm px-3 py-1">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setCurrentStep(0);
                        setResults(null);
                        setUploadedPhoto(null);
                        setFormData({
                          faceShape: '',
                          hairType: '',
                          lifestyle: '',
                          maintenance: '',
                          inspiration: '',
                          preferences: [],
                        });
                      }}
                      className="btn-outline-gold flex-1 py-3"
                    >
                      Start New Consultation
                    </button>
                    <button className="btn-gold flex-1 py-3">
                      Book Appointment
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
