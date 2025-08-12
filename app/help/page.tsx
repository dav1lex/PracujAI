"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  Search,
  Book,
  MessageCircle,
  Video,
  Download,
  Settings,
  CreditCard,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Mail,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

// Help categories with icons and descriptions
const helpCategories = [
  {
    id: 'getting-started',
    title: POLISH_CONTENT.help.gettingStarted,
    description: POLISH_CONTENT.help.accountSetupDescription,
    icon: <Book className="h-6 w-6" />,
    color: 'bg-blue-500',
    articles: [
      {
        title: POLISH_CONTENT.help.accountSetup,
        description: POLISH_CONTENT.help.accountSetupDescription,
        href: '/help/getting-started/account-setup'
      },
      {
        title: POLISH_CONTENT.help.downloadingApp,
        description: POLISH_CONTENT.help.downloadingAppDescription,
        href: '/help/getting-started/downloading-app'
      },
      {
        title: POLISH_CONTENT.help.firstLogin,
        description: POLISH_CONTENT.help.firstLoginDescription,
        href: '/help/getting-started/first-login'
      }
    ]
  },
  {
    id: 'user-guide',
    title: POLISH_CONTENT.help.userGuide,
    description: 'Szczegółowe instrukcje korzystania z aplikacji',
    icon: <Settings className="h-6 w-6" />,
    color: 'bg-green-500',
    articles: [
      {
        title: POLISH_CONTENT.help.settingPreferences,
        description: POLISH_CONTENT.help.settingPreferencesDescription,
        href: '/help/user-guide/setting-preferences'
      },
      {
        title: POLISH_CONTENT.help.understandingCredits,
        description: POLISH_CONTENT.help.understandingCreditsDescription,
        href: '/help/user-guide/understanding-credits'
      },
      {
        title: POLISH_CONTENT.help.managingAccount,
        description: POLISH_CONTENT.help.managingAccountDescription,
        href: '/help/user-guide/managing-account'
      }
    ]
  },
  {
    id: 'billing',
    title: POLISH_CONTENT.help.buyingCredits,
    description: 'Informacje o płatnościach i kredytach',
    icon: <CreditCard className="h-6 w-6" />,
    color: 'bg-purple-500',
    articles: [
      {
        title: POLISH_CONTENT.help.buyingCredits,
        description: POLISH_CONTENT.help.buyingCreditsDescription,
        href: '/help/billing/buying-credits'
      },
      {
        title: 'Historia płatności',
        description: 'Jak przeglądać historię zakupów i pobierać faktury',
        href: '/help/billing/payment-history'
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: POLISH_CONTENT.help.troubleshooting,
    description: 'Rozwiązania najczęstszych problemów',
    icon: <AlertCircle className="h-6 w-6" />,
    color: 'bg-red-500',
    articles: [
      {
        title: POLISH_CONTENT.help.commonIssues,
        description: 'Najczęstsze problemy i ich rozwiązania',
        href: '/help/troubleshooting/common-issues'
      },
      {
        title: POLISH_CONTENT.help.systemRequirements,
        description: 'Wymagania systemowe i kompatybilność',
        href: '/help/troubleshooting/system-requirements'
      }
    ]
  }
];

// Quick links for common actions
const quickLinks = [
  {
    title: 'Pobierz aplikację',
    description: 'Pobierz najnowszą wersję aplikacji desktopowej',
    href: '/dashboard',
    icon: <Download className="h-5 w-5" />,
    external: false
  },
  {
    title: 'Kup kredyty',
    description: 'Zakup pakiet kredytów do dopasowywania ofert',
    href: '/pricing',
    icon: <CreditCard className="h-5 w-5" />,
    external: false
  },
  {
    title: 'Skontaktuj się z nami',
    description: 'Wyślij wiadomość do zespołu wsparcia',
    href: '/help/contact',
    icon: <MessageCircle className="h-5 w-5" />,
    external: false
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Filter FAQ items based on search query
  const filteredFAQ = POLISH_CONTENT.help.faqItems.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              {POLISH_CONTENT.help.help}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Znajdź odpowiedzi na swoje pytania i naucz się korzystać z PracujMatcher
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={POLISH_CONTENT.help.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-darker border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Szybkie akcje
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="block p-6 bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 transition-transform">
                      {link.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {link.description}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Help Categories */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {POLISH_CONTENT.help.documentation}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {category.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {category.articles.map((article, articleIndex) => (
                      <Link
                        key={articleIndex}
                        href={article.href}
                        className="block p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-darker transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                              {article.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                              {article.description}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {POLISH_CONTENT.help.faqSection}
          </h2>
          
          {searchQuery && filteredFAQ.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-300">
                {POLISH_CONTENT.help.noResults}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {(searchQuery ? filteredFAQ : POLISH_CONTENT.help.faqItems).map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-neutral-darker transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 dark:text-white pr-4">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: expandedFAQ === index ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </motion.div>
                  </div>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedFAQ === index ? 'auto' : 0,
                    opacity: expandedFAQ === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-300 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Video Tutorials Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            {POLISH_CONTENT.help.videoTutorials}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8">
            {POLISH_CONTENT.help.videoTutorialsDescription}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: POLISH_CONTENT.help.tutorial1Title,
                description: POLISH_CONTENT.help.tutorial1Description,
                duration: '5:30'
              },
              {
                title: POLISH_CONTENT.help.tutorial2Title,
                description: POLISH_CONTENT.help.tutorial2Description,
                duration: '8:15'
              },
              {
                title: POLISH_CONTENT.help.tutorial3Title,
                description: POLISH_CONTENT.help.tutorial3Description,
                duration: '6:45'
              },
              {
                title: POLISH_CONTENT.help.tutorial4Title,
                description: POLISH_CONTENT.help.tutorial4Description,
                duration: '10:20'
              }
            ].map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden group cursor-pointer"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center relative">
                  <Video className="h-12 w-12 text-primary dark:text-primary-light" />
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {tutorial.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    {tutorial.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary dark:text-primary-light font-medium">
                      {POLISH_CONTENT.help.comingSoon}
                    </span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Potrzebujesz dodatkowej pomocy?
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Nasz zespół wsparcia jest gotowy, aby Ci pomóc
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-primary dark:text-primary-light" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Formularz kontaktowy
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Wyślij nam szczegółowe pytanie
              </p>
              <Link
                href="/help/contact"
                className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:underline"
              >
                Skontaktuj się <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                E-mail
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                support@pracujmatcher.pl
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                Odpowiedź w 24h
              </div>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                Status systemu
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                Sprawdź status usług
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Wszystko działa
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}