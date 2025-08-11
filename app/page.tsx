"use client";

import { useAuth } from '@/contexts/AuthContext';
import { PricingSection } from '@/components/PricingSection';
import { TypewriterEffect } from '@/components/TypewriterEffect';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  Search,
  Brain,
  Bell,
  Filter,
  History,
  Download,
  Users,
  Star,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link as ScrollLink } from 'react-scroll';

// Polish job matching workflow steps
const jobMatchingSteps = [
  {
    title: "Krok 1: Konfiguracja",
    description: "Ustaw swoje preferencje zawodowe i kryteria wyszukiwania",
    icon: <Filter className="h-6 w-6" />,
    preview: <TypewriterEffect text="Konfigurowanie preferencji..." />
  },
  {
    title: "Krok 2: Skanowanie",
    description: "AI przeszukuje Pracuj.pl w poszukiwaniu nowych ofert",
    icon: <Search className="h-6 w-6" />,
    preview: <TypewriterEffect text="Skanowanie ofert pracy..." />
  },
  {
    title: "Krok 3: Dopasowanie",
    description: "Algorytm analizuje i ocenia zgodność ofert z Twoim profilem",
    icon: <Brain className="h-6 w-6" />,
    preview: <TypewriterEffect text="Analizowanie dopasowań..." />
  },
  {
    title: "Krok 4: Powiadomienie",
    description: "Otrzymujesz powiadomienia o najlepszych dopasowaniach",
    icon: <Bell className="h-6 w-6" />,
    preview: <TypewriterEffect text="Wysyłanie powiadomień..." />
  }
];

// Main sections for Polish landing page
const landingSections = [
  {
    id: "home",
    title: "Strona główna",
    description: "Znajdź idealną pracę z pomocą AI",
    bgColor: "bg-white dark:bg-[#0B1120]"
  },
  {
    id: "features",
    title: "Funkcje",
    description: "Dlaczego PracujMatcher jest najlepszy",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]"
  },
  {
    id: "testimonials",
    title: "Opinie",
    description: "Co mówią nasi użytkownicy",
    bgColor: "bg-white dark:bg-[#0B1120]"
  },
  {
    id: "faq",
    title: "FAQ",
    description: "Często zadawane pytania",
    bgColor: "bg-slate-50 dark:bg-[#0B1120]"
  },
  {
    id: "pricing",
    title: "Cennik",
    description: "Przejrzyste ceny dla każdego",
    bgColor: "bg-white dark:bg-[#0B1120]"
  }
];

// Polish feature cards for job matching
const polishFeatureCards = [
  {
    title: POLISH_CONTENT.landing.feature1Title,
    description: POLISH_CONTENT.landing.feature1Description,
    icon: <Brain className="h-6 w-6 text-primary" />,
    bgGradient: "from-blue-500/10 to-purple-500/10"
  },
  {
    title: POLISH_CONTENT.landing.feature2Title,
    description: POLISH_CONTENT.landing.feature2Description,
    icon: <Search className="h-6 w-6 text-primary" />,
    bgGradient: "from-green-500/10 to-emerald-500/10"
  },
  {
    title: POLISH_CONTENT.landing.feature3Title,
    description: POLISH_CONTENT.landing.feature3Description,
    icon: <Bell className="h-6 w-6 text-primary" />,
    bgGradient: "from-orange-500/10 to-red-500/10"
  },
  {
    title: POLISH_CONTENT.landing.feature4Title,
    description: POLISH_CONTENT.landing.feature4Description,
    icon: <Filter className="h-6 w-6 text-primary" />,
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    title: POLISH_CONTENT.landing.feature5Title,
    description: POLISH_CONTENT.landing.feature5Description,
    icon: <History className="h-6 w-6 text-primary" />,
    bgGradient: "from-indigo-500/10 to-blue-500/10"
  },
  {
    title: POLISH_CONTENT.landing.feature6Title,
    description: POLISH_CONTENT.landing.feature6Description,
    icon: <Download className="h-6 w-6 text-primary" />,
    bgGradient: "from-teal-500/10 to-green-500/10"
  }
];

// Polish testimonials
const polishTestimonials = [
  {
    content: POLISH_CONTENT.landing.testimonial1,
    author: POLISH_CONTENT.landing.testimonial1Author,
    rating: 5
  },
  {
    content: POLISH_CONTENT.landing.testimonial2,
    author: POLISH_CONTENT.landing.testimonial2Author,
    rating: 5
  },
  {
    content: POLISH_CONTENT.landing.testimonial3,
    author: POLISH_CONTENT.landing.testimonial3Author,
    rating: 5
  }
];

// Polish FAQ data
const polishFAQ = [
  {
    question: POLISH_CONTENT.landing.faq1Question,
    answer: POLISH_CONTENT.landing.faq1Answer
  },
  {
    question: POLISH_CONTENT.landing.faq2Question,
    answer: POLISH_CONTENT.landing.faq2Answer
  },
  {
    question: POLISH_CONTENT.landing.faq3Question,
    answer: POLISH_CONTENT.landing.faq3Answer
  },
  {
    question: POLISH_CONTENT.landing.faq4Question,
    answer: POLISH_CONTENT.landing.faq4Answer
  },
  {
    question: POLISH_CONTENT.landing.faq5Question,
    answer: POLISH_CONTENT.landing.faq5Answer
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState("home");

  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] relative">
      {/* Polish Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-darker/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary dark:text-primary-light">
                PracujMatcher
              </h1>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {landingSections.map((section) => (
                <ScrollLink
                  key={section.id}
                  to={section.id}
                  spy={true}
                  smooth={true}
                  offset={-100}
                  duration={500}
                  onSetActive={() => setActiveSection(section.id)}
                  className={`cursor-pointer transition-colors duration-300 ${activeSection === section.id
                      ? 'text-primary dark:text-primary-light font-medium'
                      : 'text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary-light'
                    }`}
                >
                  {section.title}
                </ScrollLink>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  {POLISH_CONTENT.nav.dashboard}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors"
                  >
                    {POLISH_CONTENT.nav.login}
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                  >
                    {POLISH_CONTENT.nav.register}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Polish Hero Section */}
      <div id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative pt-20 pb-16 sm:pb-24">
            {/* Hero Content */}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white"
              >
                <span className="block">{POLISH_CONTENT.landing.heroTitle}</span>
                <span className="block text-primary dark:text-primary-light mt-2">
                  PracujMatcher
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 max-w-3xl mx-auto text-lg text-slate-600 dark:text-slate-300"
              >
                {POLISH_CONTENT.landing.heroSubtitle}
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 max-w-4xl mx-auto text-base text-slate-500 dark:text-slate-400"
              >
                {POLISH_CONTENT.landing.heroDescription}
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                {user ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {POLISH_CONTENT.landing.downloadApp}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/login')}
                      className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                      {POLISH_CONTENT.landing.getStarted}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const featuresSection = document.getElementById('features');
                        featuresSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-4 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    >
                      {POLISH_CONTENT.landing.learnMore}
                    </motion.button>
                  </>
                )}
              </motion.div>
            </div>

            {/* Job Matching Workflow Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* AI Code Preview */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-green-500/20 rounded-xl blur-xl"></div>
                <pre className="relative rounded-xl bg-slate-900 p-8 shadow-2xl border border-slate-700">
                  <code className="text-sm sm:text-base text-slate-100">
                    <TypewriterEffect text={`// 🤖 PracujMatcher AI Engine
import { findJobMatches } from '@/ai/matcher';

const searchJobs = async (preferences) => {
  const jobs = await scrapePracujPl();
  const matches = await findJobMatches(jobs, {
    skills: preferences.skills,
    location: preferences.location,
    salary: preferences.minSalary,
    experience: preferences.experience
  });
  
  return matches.filter(job => 
    job.matchScore > 0.8
  ).sort((a, b) => b.matchScore - a.matchScore);
};`} />
                  </code>
                </pre>
              </div>

              {/* Workflow Steps */}
              <div className="space-y-6">
                {jobMatchingSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="relative p-6 bg-white/80 dark:bg-neutral-dark/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-light">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Download Section for Authenticated Users */}
      {user && (
        <motion.section
          className="py-16 bg-gradient-to-r from-primary/5 to-green-500/5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {POLISH_CONTENT.dashboard.downloadApp}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {POLISH_CONTENT.dashboard.downloadDescription}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard')}
                    className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {POLISH_CONTENT.dashboard.downloadButton}
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {POLISH_CONTENT.dashboard.installationGuide}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary dark:text-primary-light">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{POLISH_CONTENT.help.step1}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{POLISH_CONTENT.help.step1Description}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary dark:text-primary-light">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{POLISH_CONTENT.help.step2}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{POLISH_CONTENT.help.step2Description}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary dark:text-primary-light">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{POLISH_CONTENT.help.step3}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{POLISH_CONTENT.help.step3Description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 bg-slate-50 dark:bg-[#0B1120]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        onViewportEnter={() => setActiveSection("features")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white"
            >
              {POLISH_CONTENT.landing.featuresTitle}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto"
            >
              {POLISH_CONTENT.landing.featuresSubtitle}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {polishFeatureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className={`relative p-6 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 group cursor-pointer`}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 bg-white/80 dark:bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{
                      scale: 1.2,
                      rotate: 360,
                      transition: { duration: 0.6 }
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Animated progress indicator for AI features */}
                {(index === 0 || index === 1 || index === 2) && (
                  <motion.div
                    className="absolute bottom-2 left-6 right-6 h-1 bg-white/20 dark:bg-slate-700/20 rounded-full overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-primary dark:bg-primary-light rounded-full"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      transition={{
                        delay: index * 0.1 + 0.7,
                        duration: 2,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Animated App Workflow Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-20 bg-white dark:bg-neutral-dark rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700"
          >
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Jak działa PracujMatcher?
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Zobacz, jak nasza aplikacja automatycznie znajduje dla Ciebie najlepsze oferty pracy
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {jobMatchingSteps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative text-center"
                >
                  <motion.div
                    className="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary dark:text-primary-light"
                    whileHover={{
                      scale: 1.1,
                      backgroundColor: "rgba(59, 130, 246, 0.2)"
                    }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(59, 130, 246, 0.4)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                        "0 0 0 0 rgba(59, 130, 246, 0)"
                      ]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    {step.icon}
                  </motion.div>

                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {step.description}
                  </p>

                  {/* Connecting arrow */}
                  {index < jobMatchingSteps.length - 1 && (
                    <motion.div
                      className="hidden md:block absolute top-8 -right-3 w-6 h-6"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                    >
                      <ArrowRight className="h-6 w-6 text-primary/60 dark:text-primary-light/60" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Animated success metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
            >
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <motion.div
                  className="text-2xl font-bold text-green-600 dark:text-green-400"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring" }}
                >
                  95%
                </motion.div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Trafność dopasowań
                </p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <motion.div
                  className="text-2xl font-bold text-blue-600 dark:text-blue-400"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring" }}
                >
                  24/7
                </motion.div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Automatyczne skanowanie
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <motion.div
                  className="text-2xl font-bold text-purple-600 dark:text-purple-400"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring" }}
                >
                  &lt;5min
                </motion.div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Czas konfiguracji
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
      {/* Testimonials Section */}
      <motion.section
        id="testimonials"
        className="py-20 bg-white dark:bg-[#0B1120]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        onViewportEnter={() => setActiveSection("testimonials")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white"
            >
              {POLISH_CONTENT.landing.testimonialsTitle}
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {polishTestimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative p-6 bg-slate-50 dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 dark:text-slate-300 mb-4 italic">
                  {testimonial.content}
                </blockquote>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-primary dark:text-primary-light" />
                  </div>
                  <cite className="font-medium text-slate-900 dark:text-white not-italic">
                    {testimonial.author}
                  </cite>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section
        id="faq"
        className="py-20 bg-slate-50 dark:bg-[#0B1120]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        onViewportEnter={() => setActiveSection("faq")}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white"
            >
              {POLISH_CONTENT.landing.faqTitle}
            </motion.h2>
          </div>

          <div className="space-y-4">
            {polishFAQ.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-darker transition-colors"
                >
                  <span className="font-medium text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="h-5 w-5 text-slate-500 dark:text-slate-400 transform rotate-90" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFAQ === index ? "auto" : 0,
                    opacity: expandedFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-slate-600 dark:text-slate-300">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        id="pricing"
        className="py-20 bg-white dark:bg-[#0B1120]"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        onViewportEnter={() => setActiveSection("pricing")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white"
            >
              {POLISH_CONTENT.nav.pricing}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-slate-600 dark:text-slate-300"
            >
              Przejrzyste ceny dla każdego
            </motion.p>
          </div>
          <PricingSection />
        </div>
      </motion.section>

      {/* Polish CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="relative py-20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-green-500/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white dark:bg-neutral-dark rounded-xl shadow-xl p-12 border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <motion.h2
                initial={{ y: 20 }}
                whileInView={{ y: 0 }}
                className="text-3xl font-bold text-slate-900 dark:text-white"
              >
                Gotowy na start?
              </motion.h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Zacznij korzystać z PracujMatcher już dziś i znajdź wymarzoną pracę
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push('/dashboard')}
                    className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {POLISH_CONTENT.landing.downloadApp}
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => router.push('/login')}
                      className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-medium flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                      {POLISH_CONTENT.landing.getStarted}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const pricingSection = document.getElementById('pricing');
                        pricingSection?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-primary dark:text-primary-light border-2 border-primary dark:border-primary-light rounded-lg shadow-lg hover:shadow-xl transition-all font-medium"
                    >
                      Zobacz cennik
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}