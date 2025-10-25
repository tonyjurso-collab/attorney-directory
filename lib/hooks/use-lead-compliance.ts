'use client';

import { useEffect, useState } from 'react';

interface LeadComplianceData {
  jornayaLeadId: string;
  trustedFormCertUrl: string;
  isLoading: boolean;
}

export function useLeadCompliance(): LeadComplianceData {
  const [jornayaLeadId, setJornayaLeadId] = useState<string>('');
  const [trustedFormCertUrl, setTrustedFormCertUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Capture Jornaya LeadID
    const captureJornayaLeadId = () => {
      try {
        // Jornaya stores the lead ID in window.ashLeadId
        if (typeof window !== 'undefined' && (window as any).ashLeadId) {
          setJornayaLeadId((window as any).ashLeadId);
        }
      } catch (error) {
        console.error('Error capturing Jornaya LeadID:', error);
      }
    };

    // Capture TrustedForm certificate URL
    const captureTrustedFormCert = () => {
      try {
        // TrustedForm certificate URL is available on the form after user interaction
        // We'll capture it on form submit rather than here
        // But we can check if the script loaded
        if (typeof window !== 'undefined' && (window as any).TrustedForm) {
          // TrustedForm is loaded, certificate will be captured on form submit
          setTrustedFormCertUrl('pending');
        }
      } catch (error) {
        console.error('Error capturing TrustedForm:', error);
      }
    };

    // Initial capture
    captureJornayaLeadId();
    captureTrustedFormCert();

    // Set up interval to check for Jornaya LeadID (it loads asynchronously)
    const intervalId = setInterval(() => {
      if (!jornayaLeadId) {
        captureJornayaLeadId();
      }
      
      if (!trustedFormCertUrl) {
        captureTrustedFormCert();
      }

      // Stop checking after 3 seconds
      if (jornayaLeadId || trustedFormCertUrl) {
        setIsLoading(false);
        clearInterval(intervalId);
      }
    }, 100);

    // Cleanup interval after 3 seconds
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      clearInterval(intervalId);
    }, 3000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [jornayaLeadId, trustedFormCertUrl]);

  return {
    jornayaLeadId,
    trustedFormCertUrl,
    isLoading,
  };
}
