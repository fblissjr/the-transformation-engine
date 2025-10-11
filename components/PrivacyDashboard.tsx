import React, { useState, useEffect } from 'react';
import { networkMonitor, NetworkRequest } from '../services/networkMonitor';
import { useApiKey } from '../context/ApiKeyContext';

interface PrivacyDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDashboard: React.FC<PrivacyDashboardProps> = ({ isOpen, onClose }) => {
  const { getApiKeyExpiration, apiKey } = useApiKey();
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [apiKeyExpiry, setApiKeyExpiry] = useState<number | null>(null);
  const [storageSize, setStorageSize] = useState<{ prompts: number; media: number }>({ prompts: 0, media: 0 });

  useEffect(() => {
    if (isOpen) {
      // Load current state
      setRequests(networkMonitor.getRequests());
      loadApiKeyExpiry();
      estimateStorageSize();

      // Subscribe to new requests
      const unsubscribe = networkMonitor.subscribe((request) => {
        setRequests(prev => [request, ...prev].slice(0, 50));
      });

      return unsubscribe;
    }
  }, [isOpen]);

  const loadApiKeyExpiry = async () => {
    const expiry = await getApiKeyExpiration();
    setApiKeyExpiry(expiry);
  };

  const estimateStorageSize = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      setStorageSize({
        prompts: Math.round((estimate.usage || 0) * 0.7 / 1024), // Rough estimate
        media: Math.round((estimate.usage || 0) * 0.3 / 1024),
      });
    }
  };

  const exportAuditLog = () => {
    const log = networkMonitor.exportAuditLog();
    const blob = new Blob([log], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `privacy-audit-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = networkMonitor.getSummary();
  const hasUnexpected = networkMonitor.hasUnexpectedRequests();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">Privacy & Transparency</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Privacy Guarantees */}
          <section className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Privacy Guarantees</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>100% Client-Side:</strong> All processing happens in your browser. No data passes through this host's servers.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Local Storage Only:</strong> All prompts, images, and data stored in your browser's IndexedDB. Never uploaded.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Direct API Calls:</strong> Your browser communicates directly with Google Gemini API. Host cannot see your requests.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Encrypted API Key:</strong> Your API key is encrypted in browser storage (AES-GCM). {apiKey && apiKeyExpiry && `Expires: ${new Date(apiKeyExpiry).toLocaleString()}`}
                </div>
              </div>
            </div>
          </section>

          {/* Network Activity */}
          <section className="bg-slate-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-white">Network Activity</h3>
              <button
                onClick={exportAuditLog}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Export Audit Log
              </button>
            </div>

            {hasUnexpected && (
              <div className="mb-3 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
                Warning: Unexpected network requests detected. Domains: {summary.unexpectedDomains.join(', ')}
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-700 p-3 rounded">
                  <div className="text-slate-400">Total Requests</div>
                  <div className="text-2xl font-bold text-white">{summary.total}</div>
                </div>
                <div className="bg-slate-700 p-3 rounded">
                  <div className="text-slate-400">Approved Domains</div>
                  <div className="text-2xl font-bold text-green-500">{Object.keys(summary.byDomain).filter(d => summary.approvedDomains.includes(d)).length}</div>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-semibold text-white mb-2">Requests by Domain:</div>
                <div className="space-y-1">
                  {Object.entries(summary.byDomain).map(([domain, count]) => (
                    <div key={domain} className="flex justify-between items-center bg-slate-700 p-2 rounded">
                      <span className={summary.approvedDomains.includes(domain) ? 'text-green-400' : 'text-red-400'}>
                        {domain}
                      </span>
                      <span className="text-slate-300">{count} requests</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                <div className="font-semibold text-white text-sm mb-2">Recent Requests:</div>
                {requests.slice(0, 10).map((req) => (
                  <div key={req.id} className="text-xs bg-slate-700 p-2 rounded">
                    <div className="flex justify-between text-slate-400">
                      <span>{new Date(req.timestamp).toLocaleTimeString()}</span>
                      <span>{req.method}</span>
                    </div>
                    <div className="text-slate-300 truncate">{req.purpose}</div>
                    {req.hasMedia && <span className="text-yellow-400 text-xs">Contains media</span>}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Local Storage */}
          <section className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Local Storage Usage</h3>
            <div className="text-sm text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span>Prompts & History:</span>
                <span className="font-mono">{storageSize.prompts} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Media (Images/Videos):</span>
                <span className="font-mono">{storageSize.media} KB</span>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                All data stored locally in your browser's IndexedDB. Clear via Settings → Data & Cache.
              </div>
            </div>
          </section>

          {/* Verification Instructions */}
          <section className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">How to Verify</h3>
            <div className="text-sm text-slate-300 space-y-2">
              <div>
                <strong className="text-white">1. Open DevTools (F12)</strong>
                <div className="text-xs text-slate-400 ml-4">Check "Network" tab - all requests go directly to generativelanguage.googleapis.com</div>
              </div>
              <div>
                <strong className="text-white">2. Check Storage</strong>
                <div className="text-xs text-slate-400 ml-4">Application → IndexedDB → See all your local data</div>
              </div>
              <div>
                <strong className="text-white">3. Inspect Source</strong>
                <div className="text-xs text-slate-400 ml-4">This app is open source. All code is auditable.</div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 flex justify-between items-center">
          <span className="text-sm text-slate-400">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
