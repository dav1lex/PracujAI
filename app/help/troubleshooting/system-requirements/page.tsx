"use client";

import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import {
  ArrowLeft,
  Monitor,
  HardDrive,
  Cpu,
  Wifi,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const systemRequirements = [
  {
    category: 'System operacyjny',
    icon: <Monitor className="h-6 w-6" />,
    requirements: [
      {
        label: 'Minimalne',
        value: 'Windows 10 (64-bit)',
        status: 'required'
      },
      {
        label: 'Zalecane',
        value: 'Windows 11 (64-bit)',
        status: 'recommended'
      },
      {
        label: 'Nieobsługiwane',
        value: 'Windows 7, 8, 8.1, macOS, Linux',
        status: 'unsupported'
      }
    ]
  },
  {
    category: 'Pamięć RAM',
    icon: <Cpu className="h-6 w-6" />,
    requirements: [
      {
        label: 'Minimalne',
        value: '4 GB RAM',
        status: 'required'
      },
      {
        label: 'Zalecane',
        value: '8 GB RAM lub więcej',
        status: 'recommended'
      }
    ]
  },
  {
    category: 'Miejsce na dysku',
    icon: <HardDrive className="h-6 w-6" />,
    requirements: [
      {
        label: 'Instalacja',
        value: '500 MB wolnego miejsca',
        status: 'required'
      },
      {
        label: 'Dane aplikacji',
        value: '100 MB dodatkowego miejsca',
        status: 'required'
      },
      {
        label: 'Zalecane',
        value: '1 GB wolnego miejsca',
        status: 'recommended'
      }
    ]
  },
  {
    category: 'Połączenie internetowe',
    icon: <Wifi className="h-6 w-6" />,
    requirements: [
      {
        label: 'Wymagane',
        value: 'Stałe połączenie internetowe',
        status: 'required'
      },
      {
        label: 'Minimalna prędkość',
        value: '1 Mbps download',
        status: 'required'
      },
      {
        label: 'Zalecane',
        value: '5 Mbps lub szybsze',
        status: 'recommended'
      }
    ]
  },
  {
    category: 'Oprogramowanie',
    icon: <Shield className="h-6 w-6" />,
    requirements: [
      {
        label: 'Wymagane',
        value: '.NET Framework 4.8 lub nowszy',
        status: 'required'
      },
      {
        label: 'Przeglądarka',
        value: 'Chrome, Firefox, Edge (do logowania)',
        status: 'required'
      },
      {
        label: 'Antywirus',
        value: 'Kompatybilny z Windows Defender',
        status: 'recommended'
      }
    ]
  }
];

const compatibilityInfo = [
  {
    title: 'Testowane konfiguracje',
    items: [
      'Windows 10 Pro 64-bit + 8GB RAM + SSD',
      'Windows 11 Home 64-bit + 16GB RAM + HDD',
      'Windows 10 Enterprise 64-bit + 4GB RAM + SSD'
    ],
    status: 'success'
  },
  {
    title: 'Znane problemy',
    items: [
      'Wolniejsze działanie na dyskach HDD',
      'Problemy z niektórymi antywirusami firm trzecich',
      'Ograniczona funkcjonalność w sieciach firmowych z proxy'
    ],
    status: 'warning'
  },
  {
    title: 'Nieobsługiwane systemy',
    items: [
      'Windows 7 i starsze wersje',
      'Windows 8 i 8.1 (brak wsparcia .NET 4.8)',
      'Systemy 32-bitowe',
      'macOS i Linux'
    ],
    status: 'error'
  }
];

const performanceTips = [
  {
    title: 'Optymalizacja wydajności',
    tips: [
      'Zamknij niepotrzebne aplikacje podczas korzystania z PracujMatcher',
      'Upewnij się, że masz co najmniej 20% wolnego miejsca na dysku systemowym',
      'Regularnie restartuj komputer, aby wyczyścić pamięć',
      'Używaj SSD zamiast HDD dla lepszej wydajności'
    ]
  },
  {
    title: 'Ustawienia sieci',
    tips: [
      'Dodaj pracujmatcher.pl do wyjątków firewall',
      'Jeśli używasz VPN, sprawdź czy nie blokuje połączeń',
      'W sieciach firmowych skontaktuj się z administratorem IT',
      'Sprawdź ustawienia proxy w przeglądarce'
    ]
  }
];

export default function SystemRequirementsPage() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'required':
        return <CheckCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'recommended':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'unsupported':
        return <XCircle className="h-5 w-5 text-slate-400" />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'required':
        return 'text-red-700 dark:text-red-300';
      case 'recommended':
        return 'text-green-700 dark:text-green-300';
      case 'unsupported':
        return 'text-slate-500 dark:text-slate-400';
      default:
        return 'text-blue-700 dark:text-blue-300';
    }
  };

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
                <Monitor className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.systemRequirements}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  Sprawdź, czy Twój komputer spełnia wymagania do uruchomienia PracujMatcher
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Wymagania systemowe
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {systemRequirements.map((category, index) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary-light/10 rounded-lg flex items-center justify-center text-primary dark:text-primary-light">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {category.category}
                  </h3>
                </div>
                <div className="space-y-3">
                  {category.requirements.map((req, reqIndex) => (
                    <div key={reqIndex} className="flex items-start gap-3">
                      {getStatusIcon(req.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {req.label}:
                          </span>
                          <span className={`text-sm ${getStatusColor(req.status)}`}>
                            {req.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Compatibility Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Informacje o kompatybilności
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {compatibilityInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`rounded-2xl shadow-xl border p-6 ${
                  info.status === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : info.status === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {info.status === 'success' && (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  )}
                  {info.status === 'warning' && (
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  )}
                  {info.status === 'error' && (
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                  <h3 className={`font-semibold ${
                    info.status === 'success'
                      ? 'text-green-900 dark:text-green-100'
                      : info.status === 'warning'
                      ? 'text-yellow-900 dark:text-yellow-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    {info.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {info.items.map((item, itemIndex) => (
                    <li key={itemIndex} className={`text-sm flex items-start gap-2 ${
                      info.status === 'success'
                        ? 'text-green-800 dark:text-green-200'
                        : info.status === 'warning'
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      <span className="w-1.5 h-1.5 bg-current rounded-full flex-shrink-0 mt-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Wskazówki dotyczące wydajności
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {performanceTips.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary dark:text-primary-light flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 text-sm">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Check Tool */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Sprawdź swój system
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Jeśli nie jesteś pewien, czy Twój komputer spełnia wymagania, możesz sprawdzić podstawowe informacje o systemie
          </p>
          <div className="bg-white dark:bg-neutral-dark rounded-lg p-4 mb-6 text-left max-w-2xl mx-auto">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
              Jak sprawdzić informacje o systemie:
            </h3>
            <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary dark:text-primary-light">1.</span>
                Naciśnij klawisze Windows + R
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary dark:text-primary-light">2.</span>
                Wpisz &quot;msinfo32&quot; i naciśnij Enter
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-primary dark:text-primary-light">3.</span>
                Sprawdź &quot;Nazwa systemu operacyjnego&quot; i &quot;Całkowita pamięć fizyczna&quot;
              </li>
            </ol>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/help/contact"
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
            >
              Potrzebujesz pomocy?
            </Link>
            <Link
              href="/help/troubleshooting/common-issues"
              className="px-6 py-3 bg-white dark:bg-neutral-dark hover:bg-slate-50 dark:hover:bg-neutral-darker text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-lg font-medium transition-colors"
            >
              Rozwiązywanie problemów
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}