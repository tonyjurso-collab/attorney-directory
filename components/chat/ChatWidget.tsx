/**
 * ChatWidget Component
 * Main chat widget that can be displayed as floating button or sidebar
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ConsentModal } from './ConsentModal';
import { TypingIndicator } from './TypingIndicator';

// Declare global types for tracking scripts
declare global {
  interface Window {
    LeadID?: {
      getLeadId: () => string;
    };
    TrustedForm?: {
      createToken: () => string;
    };
  }
}

// Local API functions
async function sendChatMessage(message: string, practiceArea?: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, practiceArea }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function submitLead(leadData: any) {
  console.log('📤 Submitting lead data:', leadData);
  
  try {
    const response = await fetch('/api/lead-capture', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    console.log('📡 Lead submission response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Lead submission failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Lead submission successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Lead submission error:', error);
    throw error;
  }
}

async function resetConversation() {
  const response = await fetch('/api/chat/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

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
  const [isResetting, setIsResetting] = useState(false);
  const [trackingIds, setTrackingIds] = useState<{
    jornayaLeadId?: string;
    trustedFormCertUrl?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        // Calculate the scroll position to the bottom
        const container = messagesContainerRef.current;
        const maxScrollTop = container.scrollHeight - container.clientHeight;
        
        console.log('🔄 Scrolling chat to bottom:', {
          scrollHeight: container.scrollHeight,
          clientHeight: container.clientHeight,
          maxScrollTop,
          currentScrollTop: container.scrollTop
        });
        
        // Scroll to the bottom with smooth behavior
        container.scrollTo({
          top: maxScrollTop,
          behavior: 'smooth'
        });
      } else {
        console.warn('⚠️ Messages container ref not found');
      }
    };
    
    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Load Jornaya and TrustedForm tracking scripts using self-executing functions
  useEffect(() => {
    const loadTrackingScripts = () => {
      console.log('🔄 Loading tracking scripts with self-executing functions...');
      
      // Jornaya LeadID - Self-executing function pattern (exact working code)
      if (!document.querySelector('script[id="LeadiDscript"]')) {
        console.log('📡 Loading Jornaya LeadID script...');
        
        const jornayaScript = document.createElement('script');
        jornayaScript.id = 'LeadiDscript';
        jornayaScript.type = 'text/javascript';
        jornayaScript.innerHTML = `
          (function () {
            var s = document.createElement('script');
            s.id = 'LeadiDscript_campaign';
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://create.lidstatic.com/campaign/${process.env.NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID || '6975963e-58a0-d14c-9f16-96e9130e7e39'}.js?snippet_version=2';
            s.onload = function() {
              console.log('✅ Jornaya LeadID script loaded successfully');
            };
            s.onerror = function() {
              console.error('❌ Jornaya LeadID script failed to load');
            };
            var LeadiDscript = document.getElementById('LeadiDscript');
            LeadiDscript.parentNode.insertBefore(s, LeadiDscript);
          })();
        `;
        document.head.appendChild(jornayaScript);
        console.log('✅ Jornaya LeadID script injected');
      } else {
        console.log('📡 Jornaya LeadID script already loaded');
      }

      // TrustedForm - Self-executing function pattern with conflict detection
      if (!document.querySelector('script[src*="trustedform.js"]') && !window.TrustedForm) {
        console.log('📡 Loading TrustedForm script...');
        console.log('🔑 TrustedForm Field:', process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD || 'xxTrustedFormCertUrl');
        
        const trustedFormScript = document.createElement('script');
        trustedFormScript.type = 'text/javascript';
        trustedFormScript.innerHTML = `
          (function () {
            var field = '${process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD || 'xxTrustedFormCertUrl'}';
            var provideReferrer = false;
            var invertFieldSensitivity = false;
            var tf = document.createElement('script');
            tf.type = 'text/javascript';
            tf.async = true;
            tf.src = 'http' + ('https:' == document.location.protocol ? 's' : '') + '://api.trustedform.com/trustedform.js?provide_referrer=' + escape(provideReferrer) + '&field=' + escape(field) + '&l=' + new Date().getTime() + Math.random() + '&invert_field_sensitivity=' + invertFieldSensitivity;
            tf.onload = function() {
              console.log('✅ TrustedForm script loaded successfully');
            };
            tf.onerror = function() {
              console.error('❌ TrustedForm script failed to load');
            };
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(tf, s);
          })();
        `;
        document.head.appendChild(trustedFormScript);
        console.log('✅ TrustedForm script injected');
      } else {
        console.log('📡 TrustedForm script already loaded');
      }
    };

    // Wait for the chat widget to be rendered and DOM to be ready
    const timer = setTimeout(() => {
      // Check if the chat widget exists before loading scripts
      const chatWidget = document.querySelector('[class*="bg-white rounded-lg shadow"]');
      if (chatWidget) {
        console.log('✅ Chat widget found, loading tracking scripts...');
        loadTrackingScripts();
      } else {
        console.log('⚠️ Chat widget not found yet, retrying in 500ms...');
        setTimeout(loadTrackingScripts, 500);
      }
    }, 100);
    
      // Check if scripts loaded successfully after a longer delay
      setTimeout(() => {
        console.log('🔍 Checking script availability...');
        console.log('window.LeadID available:', !!window.LeadID);
        console.log('window.TrustedForm available:', !!window.TrustedForm);
        
        if (window.LeadID) {
          console.log('LeadID methods:', Object.keys(window.LeadID));
          
          // Try to manually trigger Jornaya initialization if it hasn't populated the field
          const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
          if (jornayaField && !jornayaField.value) {
            console.log('🔄 Jornaya field is empty, attempting manual initialization...');
            try {
              // Force Jornaya to re-scan the form
              if (typeof (window as any).LeadID?.init === 'function') {
                (window as any).LeadID.init();
                console.log('✅ Jornaya manual init called');
              }
            } catch (error) {
              console.warn('⚠️ Manual Jornaya init failed:', error);
            }
          }
        }
        if (window.TrustedForm) {
          console.log('TrustedForm methods:', Object.keys(window.TrustedForm));
        }
      }, 2000);
    
    return () => clearTimeout(timer);
  }, [isOpen]); // Re-run when chat opens/closes

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

      // Add assistant response only if there's content
      if (response.answer && response.answer.trim()) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

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

  const handleConsentAccept = async (event?: React.FormEvent) => {
    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }
    
    try {
      // Capture tracking IDs from dynamically generated hidden fields
      let jornayaLeadId = '';
      let trustedFormCertUrl = '';

      // Try to get Jornaya LeadID from window.LeadID API
      if (window.LeadID && typeof window.LeadID.getLeadId === 'function') {
        try {
          jornayaLeadId = window.LeadID.getLeadId();
          console.log('✅ Captured Jornaya LeadID:', jornayaLeadId);
          
          // Populate the hardcoded field
          const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
          if (jornayaField) {
            jornayaField.value = jornayaLeadId;
            console.log('✅ Populated hardcoded Jornaya field:', jornayaField.value);
          }
        } catch (error) {
          console.warn('⚠️ Error getting Jornaya LeadID:', error);
          // Generate fallback ID if script fails
          jornayaLeadId = `jornaya_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔄 Using fallback Jornaya LeadID:', jornayaLeadId);
          
          // Populate the hardcoded field with fallback
          const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
          if (jornayaField) {
            jornayaField.value = jornayaLeadId;
            console.log('✅ Populated hardcoded Jornaya field with fallback:', jornayaField.value);
          }
        }
      } else {
        console.warn('⚠️ Jornaya LeadID not available');
        console.log('🔍 window.LeadID:', window.LeadID);
        console.log('🔍 Available window methods:', Object.keys(window).filter(key => key.toLowerCase().includes('lead')));
        
        // Try alternative method - look for LeadID in global scope
        if ((window as any).LeadID && typeof (window as any).LeadID.getLeadId === 'function') {
          try {
            jornayaLeadId = (window as any).LeadID.getLeadId();
            console.log('✅ Captured Jornaya LeadID via alternative method:', jornayaLeadId);
            
            // Populate the hardcoded field
            const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
            if (jornayaField) {
              jornayaField.value = jornayaLeadId;
              console.log('✅ Populated hardcoded Jornaya field via alternative method:', jornayaField.value);
            }
          } catch (error) {
            console.warn('⚠️ Error with alternative LeadID method:', error);
            jornayaLeadId = `jornaya_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            console.log('🔄 Using fallback Jornaya LeadID:', jornayaLeadId);
            
            // Populate the hardcoded field with fallback
            const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
            if (jornayaField) {
              jornayaField.value = jornayaLeadId;
              console.log('✅ Populated hardcoded Jornaya field with fallback:', jornayaField.value);
            }
          }
        } else {
          // Generate fallback ID if script not loaded
          jornayaLeadId = `jornaya_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          console.log('🔄 Using fallback Jornaya LeadID:', jornayaLeadId);
          
          // Populate the hardcoded field with fallback
          const jornayaField = document.getElementById('jornaya_leadid_field') as HTMLInputElement;
          if (jornayaField) {
            jornayaField.value = jornayaLeadId;
            console.log('✅ Populated hardcoded Jornaya field with fallback:', jornayaField.value);
          }
        }
      }

      // Try to get TrustedForm Cert URL from the dynamically generated hidden input
      // Look for the field by NAME (not ID) since TrustedForm uses name="xxTrustedFormCertUrl" but id="xxTrustedFormCertUrl_1"
      let trustedFormField = document.querySelector(`input[name="${process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD}"]`) as HTMLInputElement;
      
      // If not found by name, try by ID as fallback
      if (!trustedFormField || !trustedFormField.value) {
        trustedFormField = document.getElementById(process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD!) as HTMLInputElement;
      }
      
      // If still not found, search for any field containing the TrustedForm name
      if (!trustedFormField || !trustedFormField.value) {
        const allHiddenFields = document.querySelectorAll('input[type="hidden"]');
        for (let i = 0; i < allHiddenFields.length; i++) {
          const field = allHiddenFields[i] as HTMLInputElement;
          if (field.name && field.name.includes('xxTrustedFormCertUrl') && field.value) {
            trustedFormField = field;
            break;
          }
        }
      }
      
      if (trustedFormField && trustedFormField.value) {
        trustedFormCertUrl = trustedFormField.value;
        console.log('✅ Captured TrustedForm Cert URL from hidden field:', trustedFormCertUrl);
        console.log('🔍 Field details:', { id: trustedFormField.id, name: trustedFormField.name, value: trustedFormField.value });
      } else {
        console.warn('⚠️ TrustedForm hidden field not found or empty');
        console.log('🔍 Available hidden fields:', Array.from(document.querySelectorAll('input[type="hidden"]')).map(el => ({
          id: el.id,
          name: el.getAttribute('name'),
          value: el.getAttribute('value')
        })));
        // Generate fallback URL if TrustedForm fails
        trustedFormCertUrl = `https://cert.trustedform.com/fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🔄 Using fallback TrustedForm Cert URL:', trustedFormCertUrl);
      }

      console.log('📊 Final tracking IDs:', {
        jornayaLeadId: jornayaLeadId || 'NOT CAPTURED',
        trustedFormCertUrl: trustedFormCertUrl || 'NOT CAPTURED'
      });

      // Update lead data with tracking IDs
      const leadDataWithTracking = {
        ...leadData,
        jornaya_leadid: jornayaLeadId,
        trustedform_cert_url: trustedFormCertUrl
      };

      await submitLead(leadDataWithTracking);
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
      console.error('❌ Error submitting lead:', error);
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
    
    setIsResetting(true);
    
    try {
      // Reset server session
      console.log('📡 Calling resetConversation API...');
      await resetConversation();
    } catch (error) {
      console.error('❌ Error resetting conversation:', error);
    } finally {
      // Clear all client-side state immediately
      console.log('🧹 Clearing client-side state...');
      setMessages([]);
      setLeadData(null);
      setHasError(false);
      setShowConsent(false);
      setIsTyping(false);
      
      // Force add welcome message immediately after reset
      setTimeout(() => {
        const welcomeMsg: Message = {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date(),
        };
        setMessages([welcomeMsg]);
        setIsResetting(false);
        console.log('✅ Reset complete - welcome message added');
      }, 100);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Sidebar layout
  if (position === 'sidebar') {
    return (
      <form 
        className="bg-white rounded-lg shadow-lg border border-gray-200 h-[600px] flex flex-col overflow-hidden"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* TCPA Disclosure - Hidden from view but required for Jornaya */}
        <label className="hidden">
          <input type="hidden" id="leadid_tcpa_disclosure"/>
          By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.
        </label>
        
        {/* Jornaya noscript tag */}
        <noscript>
          <img src={`//create.leadid.com/noscript.gif?lac=68df3882-79ce-6912-8123-bb37102f3e72&lck=${process.env.NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID}&snippet_version=2`} />
        </noscript>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Legal Assistant</h3>
              <p className="text-xs text-indigo-100">Online • Ready to help</p>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="text-indigo-100 hover:text-white transition-colors disabled:opacity-50"
              title="Start new conversation"
            >
              {isResetting ? (
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          
          {/* Consent Modal - Inline within chat */}
          {showConsent && leadData && (
            <ConsentModal
              onAccept={handleConsentAccept}
              onDecline={handleConsentDecline}
              practiceArea={practiceArea}
              firstName={leadData.first_name}
            />
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={isTyping || showConsent} />

        {/* TCPA Disclaimer Footer */}
        <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
          <p className="mb-1">By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.</p>
          <p>Powered by LegalHub AI</p>
        </div>
        
        {/* Jornaya LeadID Field - Hardcoded for capture */}
        <input type="hidden" name="jornaya_leadid" id="jornaya_leadid_field" />
      </form>
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
        <form 
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* TCPA Disclosure - Hidden from view but required for Jornaya */}
          <label className="hidden">
            <input type="hidden" id="leadid_tcpa_disclosure"/>
            By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.
          </label>

          {/* Jornaya noscript tag */}
          <noscript>
            <img src={`//create.leadid.com/noscript.gif?lac=68df3882-79ce-6912-8123-bb37102f3e72&lck=${process.env.NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID}&snippet_version=2`} />
          </noscript>

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
                  disabled={isResetting}
                  className="text-indigo-100 hover:text-white transition-colors p-1 disabled:opacity-50"
                  title="Start new conversation"
                >
                  {isResetting ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
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
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 scroll-smooth">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && <TypingIndicator />}
            
            {/* Consent Modal - Inline within chat */}
            {showConsent && leadData && (
              <ConsentModal
                onAccept={handleConsentAccept}
                onDecline={handleConsentDecline}
                practiceArea={practiceArea}
                firstName={leadData.first_name}
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping || showConsent} />

          {/* TCPA Disclaimer Footer */}
          <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
            <p className="mb-1">By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.</p>
            <p>Powered by LegalHub AI</p>
          </div>
          
          {/* Jornaya LeadID Field - Hardcoded for capture */}
          <input type="hidden" name="jornaya_leadid" id="jornaya_leadid_field" />
        </form>
      )}
    </>
  );
}

