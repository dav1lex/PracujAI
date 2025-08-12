"use client";

import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const setupSteps = [
  {
    title: 'Rejestracja konta',
    description: 'Utwórz nowe konto w systemie PracujMatcher',
    icon: <User className="h-6 w-6" />,
    steps: [
      'Przejdź na stronę główną PracujMatcher',
      'Kliknij przycisk "Zarejestruj się"',
      'Wprowadź swój adres e-mail i hasło',
      'Potwierdź rejestrację przez e-mail',
      'Zaloguj się do swojego nowego konta'
    ]
  },
  {
    title: 'Weryfikacja e-mail',
    description: 'Potwierdź swój adres e-mail, aby aktywować konto',
    icon: <Mail className="h-6 w-6" />,
    steps: [
      'Sprawdź swoją skrzynkę e-mail',
      'Znajdź wiadomość od PracujMatcher',
      'Kliknij link weryfikacyjny w e-mailu',
      'Zostaniesz przekierowany na stronę potwierdzenia',
      'Twoje konto jest teraz aktywne'
    ]
  },
  {
    title: 'Pierwsze logowanie',
    description: 'Zaloguj się i poznaj interfejs aplikacji',
    icon: <Shield className="h-6 w-6" />,
    steps: [
      'Przejdź na stronę logowania',
      'Wprowadź swój e-mail i hasło',
      'Kliknij "Zaloguj się"',
      'Zostaniesz przekierowany na panel główny',
      'Sprawdź swoje saldo kredytów'
    ]
  },
  {
    title: 'Otrzymanie darmowych kredytów',
    description: 'Pierwsi 10 użytkowników otrzymuje 100 darmowych kredytów',
    icon: <CreditCard className="h-6 w-6" />,
    steps: [
      'Po rejestracji sprawdź swój panel',
      'Jeśli jesteś w pierwszej dziesiątce, otrzymasz 100 kredytów',
      'Kredyty zostaną automatycznie dodane do konta',
      'Zobaczysz odznakę "Wczesny użytkownik"',
      'Możesz od razu zacząć korzystać z aplikacji'
    ]
  }
];

const tips = [
  {
    type: 'success',
    title: 'Wskazówka',
    content: 'Użyj silnego hasła zawierającego co najmniej 8 znaków, w tym wielkie i małe litery, cyfry i znaki specjalne.'
  },
  {
    type: 'warning',
    title: 'Ważne',
    content: 'Sprawdź folder spam, jeśli nie otrzymałeś e-maila weryfikacyjnego w ciągu kilku minut.'
  },
  {
    type: 'info',
    title: 'Informacja',
    content: 'Darmowe kredyty są dostępne tylko dla pierwszych 10 użytkowników. Po tym okresie nowi użytkownicy zaczynają z saldem 0 kredytów.'
  }
];

export default function AccountSetupPage() {
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
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.accountSetup}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {POLISH_CONTENT.help.accountSetupDescription}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Witaj w PracujMatcher!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Ten przewodnik pomoże Ci skonfigurować konto i rozpocząć korzystanie z naszej aplikacji do automatycznego wyszukiwania ofert pracy. 
            Proces jest prosty i zajmuje zaledwie kilka minut.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Co otrzymasz po rejestracji:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Dostęp do aplikacji desktopowej</li>
                  <li>• 100 darmowych kredytów (pierwsi 10 użytkowników)</li>
                  <li>• Odznakę wczesnego użytkownika</li>
                  <li>• Pełny dostęp do wszystkich funkcji</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Setup Steps */}
        <div className="space-y-8">
          {setupSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-light">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {step.steps.map((stepItem, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-slate-100 dark:bg-neutral-darker rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          {stepIndex + 1}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300">
                        {stepItem}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips and Warnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 space-y-4"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Ważne informacje
          </h2>
          {tips.map((tip, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${
                tip.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : tip.type === 'warning'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {tip.type === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                )}
                {tip.type === 'warning' && (
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                )}
                {tip.type === 'info' && (
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold mb-1 ${
                    tip.type === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : tip.type === 'warning'
                      ? 'text-yellow-900 dark:text-yellow-100'
                      : 'text-blue-900 dark:text-blue-100'
                  }`}>
                    {tip.title}
                  </h3>
                  <p className={`text-sm ${
                    tip.type === 'success'
                      ? 'text-green-800 dark:text-green-200'
                      : tip.type === 'warning'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-blue-800 dark:text-blue-200'
                  }`}>
                    {tip.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Następne kroki
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Po skonfigurowaniu konta możesz przejść do następnych etapów:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/help/getting-started/downloading-app"
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-dark rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  Pobieranie aplikacji
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Dowiedz się, jak pobrać aplikację desktopową
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
            </Link>
            <Link
              href="/help/getting-started/first-login"
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-dark rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  Pierwsze logowanie
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Przewodnik po pierwszym logowaniu
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}