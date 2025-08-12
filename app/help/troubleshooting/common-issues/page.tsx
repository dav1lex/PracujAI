"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Monitor,
  Wifi,
  CreditCard,
  Settings,
  RefreshCw,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface TroubleshootingItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  solutions: {
    title: string;
    steps: string[];
    additionalInfo?: string;
  }[];
}

const troubleshootingItems: TroubleshootingItem[] = [
  {
    id: 'app-not-starting',
    title: POLISH_CONTENT.help.appNotStarting,
    description: 'Aplikacja nie uruchamia się lub wyświetla błąd podczas startu',
    icon: <Monitor className="h-6 w-6" />,
    category: 'Aplikacja',
    solutions: [
      {
        title: 'Sprawdź wymagania systemowe',
        steps: [
          'Upewnij się, że masz Windows 10 lub nowszy',
          'Sprawdź, czy masz co najmniej 4 GB RAM',
          'Upewnij się, że masz 500 MB wolnego miejsca na dysku',
          'Sprawdź połączenie internetowe'
        ]
      },
      {
        title: 'Zainstaluj .NET Framework',
        steps: [
          'Pobierz .NET Framework 4.8 ze strony Microsoft',
          'Uruchom instalator jako administrator',
          'Zrestartuj komputer po instalacji',
          'Spróbuj ponownie uruchomić aplikację'
        ],
        additionalInfo: 'Większość problemów z uruchamianiem aplikacji wynika z braku odpowiedniej wersji .NET Framework.'
      },
      {
        title: 'Uruchom jako administrator',
        steps: [
          'Kliknij prawym przyciskiem na ikonę aplikacji',
          'Wybierz "Uruchom jako administrator"',
          'Potwierdź w oknie UAC',
          'Sprawdź, czy aplikacja uruchamia się poprawnie'
        ]
      }
    ]
  },
  {
    id: 'login-problems',
    title: POLISH_CONTENT.help.loginProblems,
    description: 'Nie możesz zalogować się do aplikacji lub strony internetowej',
    icon: <Shield className="h-6 w-6" />,
    category: 'Logowanie',
    solutions: [
      {
        title: 'Sprawdź dane logowania',
        steps: [
          'Upewnij się, że wprowadzasz prawidłowy adres e-mail',
          'Sprawdź, czy hasło jest wpisane poprawnie',
          'Zwróć uwagę na wielkość liter',
          'Sprawdź, czy nie masz włączonego Caps Lock'
        ]
      },
      {
        title: 'Resetuj hasło',
        steps: [
          'Kliknij "Zapomniałeś hasła?" na stronie logowania',
          'Wprowadź swój adres e-mail',
          'Sprawdź skrzynkę e-mail (również folder spam)',
          'Kliknij link w e-mailu i ustaw nowe hasło'
        ]
      },
      {
        title: 'Sprawdź połączenie internetowe',
        steps: [
          'Upewnij się, że masz stabilne połączenie internetowe',
          'Spróbuj odświeżyć stronę',
          'Wyczyść cache przeglądarki',
          'Spróbuj użyć innej przeglądarki'
        ]
      }
    ]
  },
  {
    id: 'no-matches',
    title: POLISH_CONTENT.help.noMatches,
    description: 'Aplikacja nie znajduje żadnych dopasowanych ofert pracy',
    icon: <Settings className="h-6 w-6" />,
    category: 'Wyszukiwanie',
    solutions: [
      {
        title: 'Sprawdź kryteria wyszukiwania',
        steps: [
          'Otwórz ustawienia w aplikacji',
          'Sprawdź, czy lokalizacja nie jest zbyt ograniczona',
          'Obniż minimalne wynagrodzenie',
          'Rozszerz zakres doświadczenia',
          'Dodaj więcej słów kluczowych'
        ],
        additionalInfo: 'Zbyt restrykcyjne kryteria mogą powodować brak wyników. Spróbuj je rozluźnić.'
      },
      {
        title: 'Uruchom ręczne skanowanie',
        steps: [
          'Kliknij przycisk "Skanuj teraz" w aplikacji',
          'Poczekaj na zakończenie procesu',
          'Sprawdź wyniki w sekcji "Dopasowania"',
          'Jeśli nadal brak wyników, zmień kryteria'
        ]
      },
      {
        title: 'Sprawdź saldo kredytów',
        steps: [
          'Otwórz panel użytkownika',
          'Sprawdź swoje saldo kredytów',
          'Jeśli masz 0 kredytów, kup nowy pakiet',
          'Spróbuj ponownie po doładowaniu konta'
        ]
      }
    ]
  },
  {
    id: 'slow-performance',
    title: POLISH_CONTENT.help.slowPerformance,
    description: 'Aplikacja działa wolno lub zawiesza się',
    icon: <RefreshCw className="h-6 w-6" />,
    category: 'Wydajność',
    solutions: [
      {
        title: 'Zamknij inne aplikacje',
        steps: [
          'Otwórz Menedżer zadań (Ctrl+Shift+Esc)',
          'Zamknij niepotrzebne aplikacje',
          'Sprawdź użycie RAM i CPU',
          'Zrestartuj aplikację PracujMatcher'
        ]
      },
      {
        title: 'Sprawdź miejsce na dysku',
        steps: [
          'Otwórz Eksplorator plików',
          'Sprawdź wolne miejsce na dysku C:',
          'Usuń niepotrzebne pliki',
          'Uruchom Oczyszczanie dysku'
        ]
      },
      {
        title: 'Zrestartuj komputer',
        steps: [
          'Zapisz wszystkie otwarte dokumenty',
          'Zamknij wszystkie aplikacje',
          'Zrestartuj komputer',
          'Uruchom ponownie PracujMatcher'
        ]
      }
    ]
  },
  {
    id: 'connection-errors',
    title: POLISH_CONTENT.help.connectionErrors,
    description: 'Błędy połączenia z serwerem lub internetem',
    icon: <Wifi className="h-6 w-6" />,
    category: 'Połączenie',
    solutions: [
      {
        title: 'Sprawdź połączenie internetowe',
        steps: [
          'Otwórz przeglądarkę i sprawdź, czy strony się ładują',
          'Spróbuj odwiedzić inne strony internetowe',
          'Zrestartuj router/modem',
          'Skontaktuj się z dostawcą internetu jeśli problem nadal występuje'
        ]
      },
      {
        title: 'Sprawdź ustawienia firewall',
        steps: [
          'Otwórz ustawienia Windows Defender Firewall',
          'Dodaj PracujMatcher do wyjątków',
          'Sprawdź ustawienia antywirusa',
          'Tymczasowo wyłącz firewall i sprawdź, czy aplikacja działa'
        ]
      },
      {
        title: 'Skontaktuj się z IT (sieć firmowa)',
        steps: [
          'Jeśli używasz sieci firmowej, skontaktuj się z administratorem IT',
          'Poproś o odblokowanie domeny pracujmatcher.pl',
          'Sprawdź, czy proxy nie blokuje połączenia',
          'Spróbuj użyć aplikacji z sieci domowej'
        ]
      }
    ]
  },
  {
    id: 'credit-issues',
    title: POLISH_CONTENT.help.creditNotDeducted,
    description: 'Problemy z kredytami - nie są pobierane lub nie są dodawane',
    icon: <CreditCard className="h-6 w-6" />,
    category: 'Kredyty',
    solutions: [
      {
        title: 'Odśwież saldo',
        steps: [
          'Kliknij przycisk "Odśwież" w panelu kredytów',
          'Wyloguj się i zaloguj ponownie',
          'Sprawdź historię transakcji',
          'Poczekaj kilka minut - synchronizacja może potrwać'
        ]
      },
      {
        title: 'Sprawdź historię płatności',
        steps: [
          'Przejdź do sekcji "Historia płatności"',
          'Sprawdź status ostatniej transakcji',
          'Jeśli płatność jest "Oczekująca", poczekaj na potwierdzenie',
          'Skontaktuj się z pomocą techniczną jeśli płatność się nie powiodła'
        ]
      },
      {
        title: 'Sprawdź e-mail z potwierdzeniem',
        steps: [
          'Sprawdź skrzynkę e-mail',
          'Znajdź potwierdzenie zakupu od Stripe',
          'Jeśli nie ma potwierdzenia, płatność mogła się nie powieść',
          'Spróbuj ponownie dokonać zakupu'
        ]
      }
    ]
  }
];

export default function CommonIssuesPage() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);

  const categories = Array.from(new Set(troubleshootingItems.map(item => item.category)));

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
              <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.commonIssues}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Rozwiązania najczęstszych problemów z aplikacją PracujMatcher
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Kategorie problemów
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  const firstItemInCategory = troubleshootingItems.find(item => item.category === category);
                  if (firstItemInCategory) {
                    document.getElementById(firstItemInCategory.id)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="p-3 text-left bg-slate-50 dark:bg-neutral-darker rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-dark transition-colors"
              >
                <span className="font-medium text-slate-900 dark:text-white">
                  {category}
                </span>
                <span className="block text-sm text-slate-600 dark:text-slate-300">
                  {troubleshootingItems.filter(item => item.category === category).length} problemów
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Troubleshooting Items */}
        <div className="space-y-6">
          {troubleshootingItems.map((item, index) => (
            <motion.div
              key={item.id}
              id={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                className="w-full p-6 text-left hover:bg-slate-50 dark:hover:bg-neutral-darker transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/10 dark:bg-red-400/10 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-1 bg-slate-100 dark:bg-neutral-darker text-xs font-medium text-slate-600 dark:text-slate-300 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedItem === item.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  </motion.div>
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: expandedItem === item.id ? 'auto' : 0,
                  opacity: expandedItem === item.id ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="pt-6 space-y-4">
                    {item.solutions.map((solution, solutionIndex) => (
                      <div key={solutionIndex} className="border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                        <button
                          onClick={() => {
                            const solutionId = `${item.id}-solution-${solutionIndex}`;
                            setExpandedSolution(expandedSolution === solutionId ? null : solutionId);
                          }}
                          className="w-full p-4 text-left bg-slate-50 dark:bg-neutral-darker hover:bg-slate-100 dark:hover:bg-neutral-dark transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {solution.title}
                              </span>
                            </div>
                            <motion.div
                              animate={{ 
                                rotate: expandedSolution === `${item.id}-solution-${solutionIndex}` ? 90 : 0 
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight className="h-4 w-4 text-slate-400" />
                            </motion.div>
                          </div>
                        </button>

                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedSolution === `${item.id}-solution-${solutionIndex}` ? 'auto' : 0,
                            opacity: expandedSolution === `${item.id}-solution-${solutionIndex}` ? 1 : 0
                          }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-white dark:bg-neutral-dark">
                            <ol className="space-y-2">
                              {solution.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center text-xs font-medium text-primary dark:text-primary-light">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="text-slate-700 dark:text-slate-300">
                                    {step}
                                  </span>
                                </li>
                              ))}
                            </ol>
                            {solution.additionalInfo && (
                              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong>Dodatkowa informacja:</strong> {solution.additionalInfo}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Nadal potrzebujesz pomocy?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Jeśli nie znalazłeś rozwiązania swojego problemu, skontaktuj się z naszym zespołem wsparcia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help/contact"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              Skontaktuj się z pomocą
            </Link>
            <Link
              href="/help"
              className="px-6 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-medium transition-colors"
            >
              Przeglądaj dokumentację
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}