'use client';

import { useEffect, useState } from 'react';

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

interface TrackingData {
  jornayaLeadId: string;
  trustedFormCertUrl: string;
  isLoading: boolean;
  error?: string;
}

/**
 * Custom hook for Jornaya LeadID and TrustedForm tracking
 * Handles script loading and ID capture for all lead forms
 */
export function useLeadTracking(): TrackingData {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    jornayaLeadId: '',
    trustedFormCertUrl: '',
    isLoading: true,
    error: undefined,
  });

  useEffect(() => {
    // Don't load tracking scripts on auth pages or dashboard
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('/login') || 
          currentPath.includes('/register') ||
          currentPath.includes('/dashboard')) {
        console.log('🚫 Skipping tracking scripts on non-lead page:', currentPath);
        setTrackingData(prev => ({ ...prev, isLoading: false }));
        return;
      }
    }

    const loadTrackingScripts = () => {
      console.log('🔄 Loading tracking scripts for lead form...');
      
      // Jornaya LeadID - Self-executing function pattern
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
            s.src = '//create.lidstatic.com/campaign/${process.env.NEXT_PUBLIC_JORNAYA_CAMPAIGN_ID || '6975963e-58a0-d14c-9f16-96e9130e7e39'}.js?snippet_version=2';
            var LeadiDscript = document.getElementById('LeadiDscript');
            LeadiDscript.parentNode.insertBefore(s, LeadiDscript);
          })();
        `;
        document.head.appendChild(jornayaScript);
        console.log('✅ Jornaya LeadID script injected');
      } else {
        console.log('📡 Jornaya LeadID script already loaded');
      }

      // TrustedForm - Self-executing function pattern
      if (!document.querySelector('script[src*="trustedform.js"]')) {
        console.log('📡 Loading TrustedForm script...');
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
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(tf, s);
          })();
        `;
        document.head.appendChild(trustedFormScript);
        console.log('✅ TrustedForm script injected');
      } else {
        console.log('📡 TrustedForm script already loaded');
      }

      // Set loading to false after scripts are injected
      setTimeout(() => {
        setTrackingData(prev => ({ ...prev, isLoading: false }));
      }, 1000);
    };

    // Load scripts after a short delay to ensure DOM is ready
    setTimeout(loadTrackingScripts, 100);
  }, []);

  /**
   * Capture tracking IDs from the loaded scripts
   * Call this function when submitting the form
   */
  const captureTrackingIds = (): { jornayaLeadId: string; trustedFormCertUrl: string } => {
    let jornayaLeadId = '';
    let trustedFormCertUrl = '';

    // Try to get Jornaya LeadID from window.LeadID API
    if (window.LeadID && typeof window.LeadID.getLeadId === 'function') {
      try {
        jornayaLeadId = window.LeadID.getLeadId();
        console.log('✅ Captured Jornaya LeadID:', jornayaLeadId);
      } catch (error) {
        console.warn('⚠️ Error getting Jornaya LeadID:', error);
      }
    } else {
      console.warn('⚠️ Jornaya LeadID not available');
    }

    // Try to get TrustedForm Cert URL from the dynamically generated hidden input
    const trustedFormField = document.getElementById(process.env.NEXT_PUBLIC_TRUSTEDFORM_FIELD || 'xxTrustedFormCertUrl') as HTMLInputElement;
    if (trustedFormField && trustedFormField.value) {
      trustedFormCertUrl = trustedFormField.value;
      console.log('✅ Captured TrustedForm Cert URL from hidden field:', trustedFormCertUrl);
    } else {
      console.warn('⚠️ TrustedForm hidden field not found or empty');
      console.log('🔍 Available hidden fields:', Array.from(document.querySelectorAll('input[type="hidden"]')).map(el => ({
        id: el.id,
        name: el.getAttribute('name'),
        value: el.getAttribute('value')
      })));
    }

    console.log('📊 Final tracking IDs:', {
      jornayaLeadId: jornayaLeadId || 'NOT CAPTURED',
      trustedFormCertUrl: trustedFormCertUrl || 'NOT CAPTURED'
    });

    return { jornayaLeadId, trustedFormCertUrl };
  };

  return {
    ...trackingData,
    captureTrackingIds,
  };
}

/**
 * Component to add TCPA disclosure and noscript tags to forms
 * Should be placed at the beginning of any form that captures leads
 */
export function LeadTrackingElements() {
  return (
    <>
      {/* TCPA Disclosure - Hidden from view but required for Jornaya */}
      <label className="hidden">
        <input type="hidden" id="leadid_tcpa_disclosure"/>
        By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.
      </label>

      {/* Jornaya noscript tag */}
      <noscript>
        <img src='//create.leadid.com/noscript.gif?lac=68df3882-79ce-6912-8123-bb37102f3e72&lck=6975963e-58a0-d14c-9f16-96e9130e7e39&snippet_version=2' />
      </noscript>
    </>
  );
}

/**
 * Component to add TCPA disclaimer footer to forms
 * Should be placed at the end of any form that captures leads
 */
export function LeadTrackingFooter() {
  return (
    <div className="px-4 py-2 text-center text-xs text-gray-500 border-t border-gray-100">
      <p className="mb-1">By signing up, signing in, or by using this service, you agree to LegalHub's Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.</p>
    </div>
  );
}
