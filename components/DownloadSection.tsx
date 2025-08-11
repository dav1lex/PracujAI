'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileDown, CheckCircle, AlertCircle, Info, Clock, HardDrive, Monitor, Cpu } from 'lucide-react';

interface VersionInfo {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  fileSize: number;
  downloadCount: number;
  minSystemRequirements: {
    os: string;
    python: string;
    ram: string;
    storage: string;
  };
  changelog: string[];
  installationInstructions: {
    title: string;
    steps: Array<{
      step: number;
      title: string;
      description: string;
    }>;
    systemRequirements: {
      title: string;
      minimum: string[];
      recommended: string[];
    };
    troubleshooting: {
      title: string;
      issues: Array<{
        problem: string;
        solution: string;
      }>;
    };
  };
}

interface DownloadHistory {
  id: string;
  version: string;
  downloaded_at: string;
  download_completed: boolean;
  file_size: number;
}

const DownloadSection: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);

  useEffect(() => {
    fetchVersionInfo();
    fetchDownloadHistory();
  }, []);

  const fetchVersionInfo = async () => {
    try {
      const response = await fetch('/api/downloads/latest');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Błąd podczas pobierania informacji o wersji');
      }

      setVersionInfo(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadHistory = async () => {
    try {
      const response = await fetch('/api/downloads/history?limit=5');
      const result = await response.json();

      if (response.ok) {
        setDownloadHistory(result.data.downloads);
      }
    } catch (err) {
      console.error('Error fetching download history:', err);
    }
  };

  const handleDownload = async () => {
    if (!versionInfo) return;

    setDownloading(true);
    setError(null);

    try {
      const response = await fetch(versionInfo.downloadUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Błąd podczas pobierania pliku');
      }

      // In a real implementation, this would trigger the actual file download
      // For now, we'll show a success message and refresh the download history
      alert(`Pobieranie rozpoczęte: ${result.downloadInfo.fileName}`);
      
      // Refresh download history
      await fetchDownloadHistory();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd podczas pobierania');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center text-red-600 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Błąd</span>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchVersionInfo();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (!versionInfo) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Brak dostępnych wersji do pobrania.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Download Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Pobierz PracujMatcher
            </h2>
            <p className="text-gray-600">
              Najnowsza wersja: {versionInfo.version} • {formatDate(versionInfo.releaseDate)}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{formatFileSize(versionInfo.fileSize)}</p>
            <p>{versionInfo.downloadCount} pobrań</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="mb-6">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Pobieranie...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Pobierz aplikację</span>
              </>
            )}
          </button>
        </div>

        {/* System Requirements */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Wymagania systemowe
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Cpu className="w-3 h-3 mr-2" />
                {versionInfo.minSystemRequirements.os}
              </div>
              <div className="flex items-center">
                <FileDown className="w-3 h-3 mr-2" />
                {versionInfo.minSystemRequirements.python}
              </div>
              <div className="flex items-center">
                <HardDrive className="w-3 h-3 mr-2" />
                {versionInfo.minSystemRequirements.ram}
              </div>
              <div className="flex items-center">
                <HardDrive className="w-3 h-3 mr-2" />
                {versionInfo.minSystemRequirements.storage}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Co nowego</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {versionInfo.changelog.slice(0, 4).map((change, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <Info className="w-4 h-4 mr-1" />
            Instrukcje instalacji
          </button>
          <button
            onClick={() => setShowRequirements(!showRequirements)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <Monitor className="w-4 h-4 mr-1" />
            Szczegółowe wymagania
          </button>
          <button
            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            Rozwiązywanie problemów
          </button>
        </div>
      </div>

      {/* Installation Instructions */}
      {showInstructions && versionInfo.installationInstructions && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {versionInfo.installationInstructions.title}
          </h3>
          <div className="space-y-4">
            {versionInfo.installationInstructions.steps.map((step) => (
              <div key={step.step} className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {step.step}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed System Requirements */}
      {showRequirements && versionInfo.installationInstructions && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {versionInfo.installationInstructions.systemRequirements.title}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Minimalne</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {versionInfo.installationInstructions.systemRequirements.minimum.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Zalecane</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {versionInfo.installationInstructions.systemRequirements.recommended.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="w-3 h-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      {showTroubleshooting && versionInfo.installationInstructions && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {versionInfo.installationInstructions.troubleshooting.title}
          </h3>
          <div className="space-y-4">
            {versionInfo.installationInstructions.troubleshooting.issues.map((issue, index) => (
              <div key={index} className="border-l-4 border-yellow-400 pl-4">
                <h4 className="font-medium text-gray-900 mb-1">{issue.problem}</h4>
                <p className="text-gray-600 text-sm">{issue.solution}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download History */}
      {downloadHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Historia pobrań
          </h3>
          <div className="space-y-3">
            {downloadHistory.map((download) => (
              <div key={download.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  {download.download_completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Wersja {download.version}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(download.downloaded_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {formatFileSize(download.file_size)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {download.download_completed ? 'Ukończone' : 'W trakcie'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadSection;