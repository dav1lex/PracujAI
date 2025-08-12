"use client";

import { motion } from 'framer-motion';
import { POLISH_CONTENT } from '@/utils/polish-content';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Download,
  Monitor,
  CheckCircle,
  AlertCircle,
  Shield,
  FileText,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const downloadSteps = [
  {
    title: 'Zaloguj się do swojego konta',
    description: 'Musisz być zalogowany, aby pobrać aplikację',
    icon: <Shield className="h-6 w-6" />,
    steps: [
      'Przejdź na stronę główną PracujMatcher',
      'Kliknij "Zaloguj się" w prawym górnym rogu',
      'Wprowadź swoje dane logowania',
      'Po zalogowaniu zostaniesz przekierowany na panel główny'
    ]
  },
  {
    title: 'Przejdź do sekcji pobierania',
    description: 'Znajdź sekcję pobierania aplikacji na panelu',
    icon: <Download className="h-6 w-6" />,
    steps: [
      'Na panelu głównym znajdź sekcję "Pobierz aplikację"',
      'Sprawdź informacje o najnowszej wersji',
      'Upewnij się, że Twój system spełnia wymagania',
      'Kliknij przycisk "Pobierz najnowszą wersję"'
    ]
  },
  {
    title: 'Pobierz plik instalacyjny',
    description: 'Pobierz aplikację na swój komputer',
    icon: <FileText className="h-6 w-6" />,
    steps: [
      'Plik zostanie pobrany do folderu Pobrane',
      'Poczekaj na zakończenie pobierania',
      'Sprawdź, czy plik ma rozszerzenie .exe',
      'Rozmiar pliku powinien wynosić około 50-100 MB'
    ]
  },
  {
    title: 'Uruchom instalację',
    description: 'Zainstaluj aplikację na swoim komputerze',
    icon: <Monitor className="h-6 w-6" />,
    steps: [
      'Kliknij dwukrotnie na pobrany plik .exe',
      'Jeśli pojawi się ostrzeżenie Windows, kliknij "Więcej informacji" → "Uruchom mimo to"',
      'Postępuj zgodnie z instrukcjami kreatora instalacji',
      'Wybierz folder instalacji (domyślny jest zalecany)',
      'Poczekaj na zakończenie instalacji'
    ]
  }
];

const systemInfo = {
  requirements: [
    'Windows 10 lub nowszy (64-bit)',
    'Minimum 4 GB RAM',
    '500 MB wolnego miejsca na dysku',
    'Połączenie internetowe',
    '.NET Framework 4.8 (zostanie zainstalowany automatycznie)'
  ],
  fileInfo: {
    size: '~75 MB',
    version: '1.0.0',
    format: 'Plik wykonywalny Windows (.exe)',
    checksum: 'SHA256: abc123...'
  }
};

const troubleshootingTips = [
  {
    issue: 'Przeglądarka blokuje pobieranie',
    solution: 'Kliknij prawym przyciskiem na link pobierania i wybierz "Zapisz link jako..." lub dodaj stronę do zaufanych w ustawieniach przeglądarki.'
  },
  {
    issue: 'Windows Defender blokuje instalację',
    solution: 'To normalne dla nowych aplikacji. Kliknij "Więcej informacji" a następnie "Uruchom mimo to". Aplikacja jest bezpieczna i podpisana cyfrowo.'
  },
  {
    issue: 'Błąd podczas instalacji',
    solution: 'Uruchom instalator jako administrator (kliknij prawym przyciskiem → "Uruchom jako administrator") i upewnij się, że masz wystarczająco miejsca na dysku.'
  },
  {
    issue: 'Aplikacja nie uruchamia się po instalacji',
    solution: 'Sprawdź czy masz zainstalowany .NET Framework 4.8. Jeśli nie, pobierz go ze strony Microsoft i zainstaluj.'
  }
];

export default function DownloadingAppPage() {
  const { user } = useAuth();

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
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {POLISH_CONTENT.help.downloadingApp}
                </h1>
                <p className="text-slate-600 dark:text-slate-300">
                  {POLISH_CONTENT.help.downloadingAppDescription}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Download Section for Logged In Users */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl p-8 mb-12 border border-green-200 dark:border-green-800"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Szybkie pobieranie
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Jesteś zalogowany - możesz od razu pobrać najnowszą wersję aplikacji
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
              >
                <Download className="h-5 w-5" />
                Przejdź do pobierania
              </Link>
            </div>
          </motion.div>
        )}

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Wymagania systemowe
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Minimalne wymagania
              </h3>
              <ul className="space-y-3">
                {systemInfo.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Informacje o pliku
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Rozmiar:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{systemInfo.fileInfo.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Wersja:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{systemInfo.fileInfo.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Format:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{systemInfo.fileInfo.format}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Download Steps */}
        <div className="space-y-8 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Instrukcja pobierania krok po kroku
          </h2>
          {downloadSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8"
            >
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
            </motion.div>
          ))}
        </div>

        {/* Troubleshooting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-neutral-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Rozwiązywanie problemów
          </h2>
          <div className="space-y-6">
            {troubleshootingTips.map((tip, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {tip.issue}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  {tip.solution}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-8 mb-12"
        >
          <div className="flex items-start gap-4">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                Bezpieczeństwo i prywatność
              </h2>
              <div className="space-y-3 text-blue-800 dark:text-blue-200">
                <p>• Aplikacja jest podpisana cyfrowo i bezpieczna</p>
                <p>• Nie zawiera wirusów ani złośliwego oprogramowania</p>
                <p>• Wszystkie dane są szyfrowane podczas transmisji</p>
                <p>• Aplikacja nie zbiera danych osobowych bez zgody</p>
                <p>• Regularne aktualizacje bezpieczeństwa</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Co dalej?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Po pobraniu i zainstalowaniu aplikacji, przejdź do następnych kroków:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/help/getting-started/first-login"
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-dark rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  Pierwsze logowanie
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Jak zalogować się do aplikacji
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary dark:group-hover:text-primary-light transition-colors" />
            </Link>
            <Link
              href="/help/user-guide/setting-preferences"
              className="flex items-center justify-between p-4 bg-white dark:bg-neutral-dark rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
                  Konfiguracja preferencji
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Ustaw kryteria wyszukiwania
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