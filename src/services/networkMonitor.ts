/**
 * Network Monitor Service
 *
 * Intercepts and logs all outbound network requests for transparency.
 * Provides audit trail for privacy verification.
 */

export interface NetworkRequest {
  id: string;
  timestamp: number;
  url: string;
  method: string;
  domain: string;
  purpose: string;
  dataType: 'api-call' | 'cdn' | 'unknown';
  hasMedia: boolean;
  hasApiKey: boolean;
}

/**
 * NetworkMonitorService class
 *
 * Provides functionality to intercept, log, and analyze network requests made by the application.
 * Used for privacy auditing and monitoring.
 */
class NetworkMonitorService {
  private requests: NetworkRequest[] = [];
  private readonly MAX_STORED = 100;
  private originalFetch: typeof fetch;
  private listeners: ((request: NetworkRequest) => void)[] = [];

  // Approved domains for the app
  private readonly APPROVED_DOMAINS = [
    'generativelanguage.googleapis.com', // Gemini API
    'openrouter.ai', // OpenRouter API
    'api.openai.com', // OpenAI API
  ];

  constructor() {
    // Bind fetch to window to preserve context
    this.originalFetch = window.fetch.bind(window);
    this.interceptFetch();
  }

  /**
   * Intercept fetch calls to monitor network traffic
   */
  private interceptFetch() {
    const originalFetch = this.originalFetch;
    const self = this;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const method = init?.method || 'GET';

      const request = self.logRequest(url, method, init);

      // Call original fetch (already bound in constructor)
      const response = await originalFetch(input, init);

      // Notify listeners
      self.notifyListeners(request);

      return response;
    };
  }

  /**
   * Log a network request
   */
  private logRequest(url: string, method: string, init?: RequestInit): NetworkRequest {
    const urlObj = new URL(url, window.location.origin);
    const domain = urlObj.hostname;

    const request: NetworkRequest = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      url,
      method,
      domain,
      purpose: this.identifyPurpose(url),
      dataType: this.identifyDataType(domain),
      hasMedia: this.hasMediaData(init),
      hasApiKey: this.hasApiKey(url, init),
    };

    this.requests.unshift(request);

    // Keep only last MAX_STORED requests
    if (this.requests.length > this.MAX_STORED) {
      this.requests = this.requests.slice(0, this.MAX_STORED);
    }

    return request;
  }

  /**
   * Identify the purpose of a request
   */
  private identifyPurpose(url: string): string {
    if (url.includes('generativelanguage.googleapis.com')) {
      if (url.includes('/models')) return 'List AI Models';
      if (url.includes('generateContent')) return 'Generate Content';
      return 'Gemini API Call';
    }
    return 'Unknown';
  }

  /**
   * Identify data type
   */
  private identifyDataType(domain: string): 'api-call' | 'cdn' | 'unknown' {
    if (this.APPROVED_DOMAINS.includes(domain)) return 'api-call';
    if (domain.includes('cdn') || domain.includes('cloudflare') || domain.includes('jsdelivr')) return 'cdn';
    return 'unknown';
  }

  /**
   * Check if request contains media data
   */
  private hasMediaData(init?: RequestInit): boolean {
    if (!init?.body) return false;
    const bodyStr = typeof init.body === 'string' ? init.body : '';
    return bodyStr.includes('inlineData') || bodyStr.includes('base64');
  }

  /**
   * Check if request contains API key
   */
  private hasApiKey(url: string, init?: RequestInit): boolean {
    if (url.includes('key=')) return true;
    const authHeader = init?.headers && typeof init.headers === 'object'
      ? (init.headers as Record<string, string>)['Authorization']
      : undefined;
    return !!authHeader;
  }

  /**
   * Get all logged requests
   *
   * @returns Array of logged NetworkRequest objects.
   */
  getRequests(): NetworkRequest[] {
    return [...this.requests];
  }

  /**
   * Get requests by domain
   *
   * @param domain - The domain to filter by.
   * @returns Array of NetworkRequest objects for the specified domain.
   */
  getRequestsByDomain(domain: string): NetworkRequest[] {
    return this.requests.filter(r => r.domain === domain);
  }

  /**
   * Get summary statistics
   *
   * @returns Object containing summary statistics of network requests.
   */
  getSummary() {
    const byDomain = this.requests.reduce((acc, req) => {
      acc[req.domain] = (acc[req.domain] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPurpose = this.requests.reduce((acc, req) => {
      acc[req.purpose] = (acc[req.purpose] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mediaRequests = this.requests.filter(r => r.hasMedia).length;
    const apiKeyRequests = this.requests.filter(r => r.hasApiKey).length;

    return {
      total: this.requests.length,
      byDomain,
      byPurpose,
      mediaRequests,
      apiKeyRequests,
      approvedDomains: this.APPROVED_DOMAINS,
      unexpectedDomains: Object.keys(byDomain).filter(d => !this.APPROVED_DOMAINS.includes(d)),
    };
  }

  /**
   * Subscribe to network events
   *
   * @param callback - Function to be called when a new request is logged.
   * @returns Function to unsubscribe.
   */
  subscribe(callback: (request: NetworkRequest) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(request: NetworkRequest) {
    this.listeners.forEach(listener => {
      try {
        listener(request);
      } catch (error) {
        console.error('Network monitor listener error:', error);
      }
    });
  }

  /**
   * Clear all logged requests
   */
  clear() {
    this.requests = [];
  }

  /**
   * Check if app is making unexpected network calls
   *
   * @returns True if there are requests to non-approved domains.
   */
  hasUnexpectedRequests(): boolean {
    return this.requests.some(r => !this.APPROVED_DOMAINS.includes(r.domain));
  }

  /**
   * Export audit log
   *
   * @returns JSON string containing the audit log.
   */
  exportAuditLog(): string {
    const summary = this.getSummary();
    const data = {
      exportedAt: new Date().toISOString(),
      summary,
      requests: this.requests.map(r => ({
        ...r,
        timestamp: new Date(r.timestamp).toISOString(),
      })),
    };
    return JSON.stringify(data, null, 2);
  }
}

// Singleton instance
export const networkMonitor = new NetworkMonitorService();
