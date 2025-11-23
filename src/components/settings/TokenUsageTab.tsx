import React, { useState, useEffect } from 'react';
import { tokenTrackingService } from '../../services/tokenTrackingService';
import { useProviders } from '../../contexts/ProviderContext';
import { TASK_METADATA } from '../../../types/providers';

/**
 * TokenUsageTab component
 *
 * Settings tab for viewing and managing token usage statistics.
 * Displays session totals, provider breakdown, and task breakdown.
 * Allows exporting usage data to JSON or CSV and resetting the session tracking.
 *
 * @returns The rendered TokenUsageTab component.
 */
export const TokenUsageTab: React.FC = () => {
  const { providers } = useProviders();
  const [sessionTotals, setSessionTotals] = useState({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    totalCost: 0,
    count: 0,
  });
  const [providerBreakdown, setProviderBreakdown] = useState<any[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'provider' | 'task'>('provider');

  useEffect(() => {
    loadUsageData();
    // Refresh every 5 seconds while tab is open
    const interval = setInterval(loadUsageData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadUsageData = async () => {
    const totals = await tokenTrackingService.getSessionTotals();
    setSessionTotals(totals);

    const byProvider = await tokenTrackingService.getProviderBreakdown();
    setProviderBreakdown(byProvider);

    const byTask = await tokenTrackingService.getTaskBreakdown();
    setTaskBreakdown(byTask);
  };

  const handleExportJSON = async () => {
    const blob = await tokenTrackingService.exportUsageLogsJSON();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-usage-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = async () => {
    const blob = await tokenTrackingService.exportUsageLogsCSV();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-usage-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetSession = () => {
    if (confirm('Reset session token tracking? This will not delete historical data.')) {
      tokenTrackingService.resetSession();
      loadUsageData();
    }
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.name || providerId;
  };

  const getTaskName = (taskId: string) => {
    const metadata = TASK_METADATA[taskId as keyof typeof TASK_METADATA];
    return metadata?.name || taskId;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (part: number, total: number) => {
    if (total === 0) return '0%';
    return `${((part / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Token Usage</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 min-h-11 bg-gray-700 hover:bg-gray-600 text-sm rounded transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 min-h-11 bg-gray-700 hover:bg-gray-600 text-sm rounded transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleResetSession}
            className="px-4 py-2.5 min-h-11 bg-red-900/50 hover:bg-red-900 text-sm rounded transition-colors"
          >
            Reset Session
          </button>
        </div>
      </div>

      {/* Session Summary */}
      <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
        <h4 className="font-medium mb-3">Session Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-400">Input Tokens</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatNumber(sessionTotals.inputTokens)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Output Tokens</div>
            <div className="text-2xl font-bold text-green-400">
              {formatNumber(sessionTotals.outputTokens)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Total Tokens</div>
            <div className="text-2xl font-bold">
              {formatNumber(sessionTotals.totalTokens)}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-sm">
          <span className="text-gray-400">
            {sessionTotals.count} generations
          </span>
          {sessionTotals.totalCost > 0 && (
            <span className="text-green-400 font-medium">
              Total cost: ${sessionTotals.totalCost.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('provider')}
          className={`px-4 py-2 rounded transition-colors ${
            viewMode === 'provider'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          By Provider
        </button>
        <button
          onClick={() => setViewMode('task')}
          className={`px-4 py-2 rounded transition-colors ${
            viewMode === 'task'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          By Task
        </button>
      </div>

      {/* Breakdown */}
      <div className="border border-gray-600 rounded-lg bg-gray-800">
        <div className="p-4">
          <h4 className="font-medium mb-3">
            {viewMode === 'provider' ? 'Provider Breakdown' : 'Task Breakdown'}
          </h4>

          {viewMode === 'provider' ? (
            <div className="space-y-3">
              {providerBreakdown.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No usage data yet
                </div>
              ) : (
                providerBreakdown.map((item) => (
                  <div
                    key={item.providerId}
                    className="border border-gray-700 rounded p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {getProviderName(item.providerId)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.count} generations
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatNumber(item.totalTokens)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatPercentage(
                            item.totalTokens,
                            sessionTotals.totalTokens
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">
                        Input: {formatNumber(item.inputTokens)}
                      </div>
                      <div className="text-gray-400">
                        Output: {formatNumber(item.outputTokens)}
                      </div>
                    </div>
                    {item.cost > 0 && (
                      <div className="mt-2 text-xs text-green-400">
                        Cost: ${item.cost.toFixed(4)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {taskBreakdown.length === 0 ? (
                <div className="text-center text-gray-400 py-4">
                  No usage data yet
                </div>
              ) : (
                taskBreakdown.map((item) => (
                  <div
                    key={item.taskId}
                    className="border border-gray-700 rounded p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium">
                          {getTaskName(item.taskId)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {item.count} executions
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm">
                          {formatNumber(item.totalTokens)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatPercentage(
                            item.totalTokens,
                            sessionTotals.totalTokens
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-400">
                        Input: {formatNumber(item.inputTokens)}
                      </div>
                      <div className="text-gray-400">
                        Output: {formatNumber(item.outputTokens)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
