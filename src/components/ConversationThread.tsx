/**
 * ConversationThread Component
 *
 * Displays chat-style conversation history for REVISION_REQUEST flow.
 * Used by Veo 3.1 scene-type detection when LLM asks clarifying questions.
 *
 * Phase 11.3: Veo 3.1 Scene-Type Detection
 */

import React, { useState } from 'react';
import { ConversationTurn, RevisionRequest } from '../contexts/GenerationContext';

interface ConversationThreadProps {
  revisionRequest: RevisionRequest;
  conversationHistory: ConversationTurn[];
  onSubmitAnswers: (answers: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ConversationThread: React.FC<ConversationThreadProps> = ({
  revisionRequest,
  conversationHistory,
  onSubmitAnswers,
  onCancel,
  isLoading,
}) => {
  const [userAnswers, setUserAnswers] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAnswers.trim()) {
      onSubmitAnswers(userAnswers.trim());
      setUserAnswers('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800/50 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-white">Scene Type Clarification</h3>
        <button
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationHistory.map((turn, index) => (
          <div
            key={index}
            className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                turn.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              {/* Role label */}
              <div className="text-xs opacity-70 mb-1">
                {turn.role === 'user' ? 'You' : 'AI'}
              </div>

              {/* Content */}
              <div className="text-sm whitespace-pre-wrap">{turn.content}</div>

              {/* Timestamp */}
              <div className="text-xs opacity-50 mt-1">
                {new Date(turn.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Questions Display */}
        {revisionRequest.questions.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
            <p className="text-xs text-blue-300 mb-2 font-semibold">
              Please answer one or more of these questions:
            </p>
            <ol className="space-y-2">
              {revisionRequest.questions.map((question, index) => (
                <li key={index} className="text-sm text-gray-200">
                  <span className="text-blue-400 font-semibold">{index + 1}.</span> {question}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <textarea
            value={userAnswers}
            onChange={(e) => setUserAnswers(e.target.value)}
            placeholder="Type your answers here..."
            rows={3}
            className="flex-1 bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            disabled={isLoading}
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !userAnswers.trim()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded-md transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};
