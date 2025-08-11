export interface AppVersion {
  version: string;
  releaseDate: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  checksum: string;
  isLatest: boolean;
  minSystemRequirements: {
    os: string;
    python: string;
    ram: string;
    storage: string;
  };
  changelog: string[];
  downloadCount?: number;
}

export const APP_VERSIONS: Record<string, AppVersion> = {
  '1.0.0': {
    version: '1.0.0',
    releaseDate: '2024-01-15',
    fileName: 'PracujMatcher-1.0.0-setup.exe',
    filePath: '/downloads/PracujMatcher-1.0.0-setup.exe',
    fileSize: 25600000, // 25.6 MB
    checksum: 'sha256:abc123def456789abcdef123456789abcdef123456789abcdef123456789abcdef',
    isLatest: false,
    minSystemRequirements: {
      os: 'Windows 10 lub nowszy',
      python: 'Python 3.8+',
      ram: '4 GB RAM',
      storage: '100 MB wolnego miejsca'
    },
    changelog: [
      'Pierwsza wersja aplikacji PracujMatcher',
      'Automatyczne wyszukiwanie ofert pracy',
      'Inteligentne dopasowywanie AI',
      'Powiadomienia o nowych ofertach'
    ]
  },
  '1.1.0': {
    version: '1.1.0',
    releaseDate: '2024-02-01',
    fileName: 'PracujMatcher-1.1.0-setup.exe',
    filePath: '/downloads/PracujMatcher-1.1.0-setup.exe',
    fileSize: 27200000, // 27.2 MB
    checksum: 'sha256:def456789abcdef123456789abcdef123456789abcdef123456789abcdef123456',
    isLatest: true,
    minSystemRequirements: {
      os: 'Windows 10 lub nowszy',
      python: 'Python 3.8+',
      ram: '4 GB RAM',
      storage: '120 MB wolnego miejsca'
    },
    changelog: [
      'Ulepszone algorytmy dopasowywania AI',
      'Dodano filtrowanie według lokalizacji',
      'Poprawiono stabilność aplikacji',
      'Nowy interfejs użytkownika',
      'Wsparcie dla większej liczby portali pracy'
    ]
  }
};

export const getLatestVersion = (): AppVersion => {
  return Object.values(APP_VERSIONS).find(version => version.isLatest) || APP_VERSIONS['1.1.0'];
};

export const getVersionByNumber = (versionNumber: string): AppVersion | null => {
  return APP_VERSIONS[versionNumber] || null;
};

export const getAllVersions = (): AppVersion[] => {
  return Object.values(APP_VERSIONS).sort((a, b) => 
    new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  );
};

export const INSTALLATION_INSTRUCTIONS = {
  title: 'Instrukcje instalacji PracujMatcher',
  steps: [
    {
      step: 1,
      title: 'Pobierz aplikację',
      description: 'Kliknij przycisk "Pobierz" aby pobrać najnowszą wersję aplikacji na swój komputer.'
    },
    {
      step: 2,
      title: 'Uruchom instalator',
      description: 'Znajdź pobrany plik w folderze Pobrane i uruchom go jako administrator.'
    },
    {
      step: 3,
      title: 'Postępuj zgodnie z instrukcjami',
      description: 'Instalator przeprowadzi Cię przez proces instalacji. Zaakceptuj warunki licencji i wybierz folder instalacji.'
    },
    {
      step: 4,
      title: 'Uruchom aplikację',
      description: 'Po zakończeniu instalacji uruchom PracujMatcher z menu Start lub skrótu na pulpicie.'
    },
    {
      step: 5,
      title: 'Zaloguj się',
      description: 'Przy pierwszym uruchomieniu aplikacja otworzy przeglądarkę do logowania. Użyj swoich danych z tego portalu.'
    }
  ],
  systemRequirements: {
    title: 'Wymagania systemowe',
    minimum: [
      'System operacyjny: Windows 10 lub nowszy',
      'Procesor: Intel Core i3 lub AMD Ryzen 3',
      'Pamięć RAM: 4 GB',
      'Miejsce na dysku: 120 MB wolnego miejsca',
      'Połączenie internetowe: Wymagane do działania'
    ],
    recommended: [
      'System operacyjny: Windows 11',
      'Procesor: Intel Core i5 lub AMD Ryzen 5',
      'Pamięć RAM: 8 GB lub więcej',
      'Miejsce na dysku: 500 MB wolnego miejsca',
      'Połączenie internetowe: Szerokopasmowe'
    ]
  },
  troubleshooting: {
    title: 'Rozwiązywanie problemów',
    issues: [
      {
        problem: 'Aplikacja nie uruchamia się',
        solution: 'Upewnij się, że masz zainstalowany Python 3.8 lub nowszy. Uruchom aplikację jako administrator.'
      },
      {
        problem: 'Błąd podczas logowania',
        solution: 'Sprawdź połączenie internetowe i upewnij się, że używasz prawidłowych danych logowania.'
      },
      {
        problem: 'Aplikacja działa wolno',
        solution: 'Zamknij inne aplikacje zużywające dużo pamięci RAM. Sprawdź czy masz wystarczająco wolnego miejsca na dysku.'
      },
      {
        problem: 'Nie mogę pobrać aplikacji',
        solution: 'Sprawdź czy masz wystarczającą liczbę kredytów na koncie. Skontaktuj się z pomocą techniczną jeśli problem się powtarza.'
      }
    ]
  }
};