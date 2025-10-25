/**
 * ChatWidget Component
 * Main chat widget that can be displayed as floating button or sidebar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { sendChatMessage, submitLead, resetConversation } from '@/lib/legalhub/chat-api';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConsentModal } from './ConsentModal';
import { TypingIndicator } from './TypingIndicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  practiceArea?: string;
  position?: 'floating' | 'sidebar';
  initialMessage?: string;
  welcomeMessage?: string;
}

export function ChatWidget({
  practiceArea,
  position = 'floating',
  initialMessage,
  welcomeMessage = "Hi! I'm here to help you find the right attorney. What legal issue are you facing?",
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(position === 'sidebar');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [leadData, setLeadData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show welcome message on mount
  useEffect(() => {
    if (messages.length === 0 && (isOpen || position === 'sidebar')) {
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, position, welcomeMessage, messages.length]);

  // Send initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 1 && messages[0].id === 'welcome') {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setHasError(false);

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await sendChatMessage(text, practiceArea);

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Check if we need to show consent modal
      if (response.submit_lead && response.lead_data) {
        setLeadData(response.lead_data);
        setShowConsent(true);
      }
    } catch (error) {
      setHasError(true);
      // Show error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm having trouble connecting right now. Please try again in a moment, or feel free to call us directly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleConsentAccept = async () => {
    try {
      await submitLead(leadData);
      setShowConsent(false);

      // Show success message
      const successMessage: Message = {
        id: `success-${Date.now()}`,
        role: 'assistant',
        content:
          'Thank you! Your information has been submitted. A qualified attorney will contact you soon.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, successMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content:
          'There was an error submitting your information. Please try again or call us directly.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleConsentDecline = () => {
    setShowConsent(false);
    const declineMessage: Message = {
      id: `decline-${Date.now()}`,
      role: 'assistant',
      content:
        "No problem. Is there anything else I can help you with?",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, declineMessage]);
  };

  const handleReset = async () => {
    console.log('🔄 ChatWidget: Starting reset...');
    console.log('📊 Current state:', {
      messagesCount: messages.length,
      showConsent,
      isTyping,
      hasError,
    });
    
    try {
      // Reset PHP session on server (session_destroy(); session_start();)
      console.log('📡 Calling resetConversation API...');
      await resetConversation();
    } catch (error) {
      console.error('❌ Error resetting conversation:', error);
    } finally {
      // Clear all client-side state
      console.log('🧹 Clearing client-side state...');
      setMessages([]);
      setLeadData(null);
      setHasError(false);
      setShowConsent(false); // CRITICAL: Close consent modal
      setIsTyping(false); // CRITICAL: Clear typing state
      console.log('✅ Reset complete - new welcome message will appear');
    }
    // Welcome message will be added by useEffect
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Sidebar layout
  if (position === 'sidebar') {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Legal Assistant</h3>
              <p className="text-xs text-indigo-100">Online • Ready to help</p>
            </div>
            <button
              onClick={handleReset}
              className="text-indigo-100 hover:text-white transition-colors"
              title="Start new conversation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          
          {/* Consent Modal - Inline within chat */}
          {showConsent && (
            <ConsentModal
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
              practiceArea={practiceArea}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isTyping || showConsent} />
      </div>
    );
  }

  // Floating layout
  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-700 transition-all z-50 flex items-center justify-center group hover:scale-110"
          aria-label="Open chat"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {/* Notification badge (optional) */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 rounded-t-lg text-white">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg">Legal Assistant</h3>
                <p className="text-xs text-indigo-100">Online • Ready to help</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="text-indigo-100 hover:text-white transition-colors p-1"
                  title="Start new conversation"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleToggle}
                  className="text-indigo-100 hover:text-white transition-colors p-1"
                  aria-label="Close chat"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            
            {/* Consent Modal - Inline within chat */}
            {showConsent && (
              <ConsentModal
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
                practiceArea={practiceArea}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping || showConsent} />

          {/* Powered by */}
          <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
            Powered by LegalHub AI
          </div>
        </div>
      )}
    </>
  );
}

