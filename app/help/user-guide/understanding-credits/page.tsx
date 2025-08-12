"use client";

import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  ArrowLeft,
  CreditCard,
  TrendingUp,
  Gift,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Star,
  Clock
} from 'lucide-react';
import Link from 'next/link';

const creditBasics = [
  {
    title: 'Czym są kredyty?',
    description: 'Kredyty to wirtualna waluta używana do płacenia za dopasowania ofert pracy',
    icon: <CreditCard className="h-6 w-6" />,
    details: [
      'Jeden kredyt = jedno dopasowanie oferty pracy',
      'Kredyty są pobierane tylko za udane dopasowania',
      'Nie mają daty ważności - możesz ich używać w dowolnym tempie',
      'Są przypisane do Twojego konta i nie można ich przenosić'
    ]
  },
  {
    title: 'Jak zdobyć kredyty?',
    description: 'Istnieje kilka sposobów na otrzymanie kredytów',
    icon: <Gift className="h-6 w-6" />,
    details: [
      'Darmowe kredyty dla pierwszych 10 użytkowników (100 kredytów)',
      'Zakup pakietów kredytowych (100, 200, 500 kredytów)',
      'Promocje i akcje specjalne (rzadko)',
      'Program poleceń (planowany w przyszłości)'
    ]
  },
  {
    title: 'Kiedy kredyty są pobierane?',
    description: 'Kredyty są pobierane tylko za rzeczywiste dopasowania',
    icon: <TrendingUp className="h-6 w-6" />,
    details: [
      'Tylko gdy aplikacja znajdzie nową ofertę pracy',
      'Tylko gdy oferta spełnia Twoje kryteria (ocena > 80%)',
      'Nie za skanowanie bez wyników',
      'Nie za duplikaty już znalezionych ofert'
    ]
  }
];

const creditPackages = [
  {
    credits: 100,
    price: 29.99,
    pricePerCredit: 0.30,
    popular: false,
    description: 'Idealny na początek',
    features: [
      '100 dopasowań ofert pracy',
      'Wszystkie funkcje aplikacji',
      'Wsparcie techniczne',
      'Brak daty ważności'
    ]
  },
  {
    credits: 200,
    price: 49.99,
    pricePerCredit: 0.25,
    popular: true,
    description: 'Najpopularniejszy wybór',
    features: [
      '200 dopasowań ofert pracy',
      'Wszystkie funkcje aplikacji',
      'Priorytetowe wsparcie',
      'Brak daty ważności',
      '17% oszczędności'
    ]
  },
  {
    credits: 500,
    price: 99.99,
    pricePerCredit: 0.20,
    popular: false,
    description: 'Najlepsza wartość',
    features: [
      '500 dopasowań ofert pracy',
      'Wszystkie funkcje aplikacji',
      'Priorytetowe wsparcie',
      'Brak daty ważności',
      '33% oszczędności'
    ]
  }
];

const usageTips = [
  {
    title: 'Optymalizuj kryteria wyszukiwania',
    description: 'Ustaw realistyczne kryteria, aby uniknąć marnowania kredytów na nieodpowiednie oferty',
    tips: [
      'Nie ustawiaj zbyt wysokich wymagań dotyczących wynagrodzenia',
      'Rozważ rozszerzenie zakresu lokalizacji',
      'Używaj ogólnych słów kluczowych zamiast bardzo specyficznych',
      'Regularnie przeglądaj i aktualizuj swoje preferencje'
    ]
  },
  {
    title: 'Monitoruj zużycie kredytów',
    description: 'Śledź, jak szybko zużywasz kredyty i dostosuj strategię',
    tips: [
      'Sprawdzaj historię transakcji w panelu użytkownika',
      'Zwróć uwagę na dni z wysokim zużyciem',
      'Analizuj jakość znalezionych ofert',
      'Dostosuj częstotliwość skanowania jeśli to możliwe'
    ]
  },
  {
    title: 'Planuj zakupy kredytów',
    description: 'Kupuj kredyty z wyprzedzeniem, aby nie przerwać wyszukiwania',
    tips: [
      'Nie czekaj aż kredyty się skończą',
      'Kup większy pakiet dla lepszej ceny za kredyt',
      'Skorzystaj z promocji gdy są dostępne',
      'Pamiętaj, że kredyty nie mają daty ważności'
    ]
  }
];

const faqItems = [
  {
    question: 'Co się stanie, gdy skończą mi się kredyty?',
    answer: 'Aplikacja przestanie wyszukiwać nowe oferty, ale nadal będziesz mógł przeglądać wcześniej znalezione dopasowania. Aby wznowić wyszukiwanie, musisz kupić więcej kredytów.'
  },
  {
    question: 'Czy mogę otrzymać zwrot za niewykorzystane kredyty?',
    answer: 'Nie, kredyty nie podlegają zwrotowi. Jednak nie mają daty ważności, więc możesz ich używać w dowolnym tempie bez ograniczeń czasowych.'
  },
  {
    question: 'Dlaczego czasami kredyty nie są pobierane?',
    answer: 'Kredyty są pobierane tylko za nowe, unikalne oferty które spełniają Twoje kryteria z oceną powyżej 80%. Jeśli aplikacja nie znajdzie nowych ofert lub znajdzie duplikaty, kredyty nie zostaną pobrane.'
  },
  {
    question: 'Czy mogę przenieść kredyty na inne konto?',
    answer: 'Nie, kredyty są przypisane do konkretnego konta i nie można ich przenosić między kontami użytkowników.'
  },
  {
    question: 'Jak często są pobierane kredyty?',
    answer: 'Kredyty są pobierane w czasie rzeczywistym, gdy aplikacja znajdzie nową ofertę spełniającą Twoje kryteria. Możesz to śledzić w historii transakcji.'
  }
];

export default function UnderstandingCreditsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-dark border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:underline mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót do pomocy
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.understandingCredits}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {POLISH_CONTENT.help.understandingCreditsDescription}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Credit Basics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Podstawy systemu kredytów
          </h2>
          <div className="space-y-6">
            {creditBasics.map((basic, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-light">
                    {basic.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {basic.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {basic.description}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {basic.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{detail}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Credit Packages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Dostępne pakiety kredytów
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {creditPackages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border-2 p-8 ${
                  pkg.popular 
                    ? 'border-primary dark:border-primary-light' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary dark:bg-primary-light text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Najpopularniejszy
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {pkg.credits} kredytów
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {pkg.description}
                  </p>
                  <div className="text-3xl font-bold text-primary dark:text-primary-light mb-1">
                    {pkg.price.toFixed(2)} zł
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {pkg.pricePerCredit.toFixed(2)} zł za kredyt
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/pricing"
                  className={`block w-full text-center px-6 py-3 rounded-lg font-medium transition-colors ${
                    pkg.popular
                      ? 'bg-primary hover:bg-primary-dark text-white'
                      : 'bg-slate-100 dark:bg-neutral-darker hover:bg-slate-200 dark:hover:bg-neutral-dark text-slate-900 dark:text-white'
                  }`}
                >
                  Wybierz pakiet
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Usage Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Wskazówki dotyczące używania kredytów
          </h2>
          <div className="space-y-6">
            {usageTips.map((tip, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
              >
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {tip.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                  {tip.description}
                </p>
                <ul className="space-y-3">
                  {tip.tips.map((tipItem, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary dark:bg-primary-light rounded-full flex-shrink-0 mt-2"></div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {tipItem}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Credit Monitoring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-start gap-4">
            <BarChart3 className="h-8 w-8 text-primary dark:text-primary-light flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Monitorowanie zużycia kredytów
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    W panelu użytkownika znajdziesz:
                  </h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary dark:text-primary-light" />
                      Aktualne saldo kredytów
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary dark:text-primary-light" />
                      Historię wszystkich transakcji
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary dark:text-primary-light" />
                      Statystyki zużycia
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary dark:text-primary-light" />
                      Prognozy zużycia
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                    Powiadomienia o niskim stanie:
                  </h3>
                  <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      Ostrzeżenie przy 10 kredytach
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Alert przy 5 kredytach
                    </li>
                    <li className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      Zatrzymanie przy 0 kredytach
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Często zadawane pytania o kredyty
          </h2>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="bg-white dark:bg-neutral-dark rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Gotowy na zakup kredytów?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Wybierz pakiet kredytów i rozpocznij automatyczne wyszukiwanie ofert pracy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              Zobacz pakiety kredytów
            </Link>
            <Link
              href="/help/billing/buying-credits"
              className="px-6 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-medium transition-colors"
            >
              Instrukcja zakupu
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}