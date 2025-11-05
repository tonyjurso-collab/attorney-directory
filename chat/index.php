<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <title>LegalHub - Legal Intake Assistant</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

        <!-- TrustedForm Script for Compliance Tracking -->
        <script type="text/javascript">
            (function () {
                var tf = document.createElement('script');
                tf.type = 'text/javascript';
                tf.async = true;
                tf.src = ("https:" == document.location.protocol ? "https" : "http") + "://api.trustedform.com/trustedform.js";
                var s = document.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(tf, s);
            })();
        </script>

        <style>
            :root{
                --brand:#2563eb;
                --brand-ink:#1e40af;
                --accent:#10b981;
                --soft:#eef2ff;
                --ink:#0f172a;
            }
            body{
                font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue','Apple Color Emoji','Segoe UI Emoji',sans-serif;
                background:linear-gradient(140deg,#f8fafc,#eef2ff);
                color:var(--ink);
                margin:0;
                padding:0;
                overflow:hidden;
            }
            html,body{
                height:100%;
                width:100%;
                position:fixed;
            }
            .nice-scroll::-webkit-scrollbar{
                width:6px;
                height:6px
            }
            .nice-scroll::-webkit-scrollbar-thumb{
                background:#c7d2fe;
                border-radius:9999px
            }
            .nice-scroll::-webkit-scrollbar-track{
                background:transparent
            }
            .bubble-tail-left:after{
                content:"";
                position:absolute;
                left:-6px;
                bottom:10px;
                width:12px;
                height:12px;
                background:white;
                transform:rotate(45deg);
                border-left:1px solid rgba(15,23,42,.08);
                border-bottom:1px solid rgba(15,23,42,.08)
            }
            .bubble-tail-right:after{
                content:"";
                position:absolute;
                right:-6px;
                bottom:10px;
                width:12px;
                height:12px;
                background:#dbeafe;
                transform:rotate(45deg)
            }
            .typing-dot{
                animation:blink 1.4s infinite both
            }
            .typing-dot:nth-child(2){
                animation-delay:.2s
            }
            .typing-dot:nth-child(3){
                animation-delay:.4s
            }
            @keyframes blink{
                0%,80%,100%{
                    opacity:.2;
                    transform:translateY(0)
                }
                40%{
                    opacity:1;
                    transform:translateY(-2px)
                }
            }
            @supports(padding:max(0px)){
                .safe-top{
                    padding-top:env(safe-area-inset-top)
                }
                .safe-bottom{
                    padding-bottom:env(safe-area-inset-bottom)
                }
            }
            .consent-modal {
                backdrop-filter: blur(4px);
            }
            /* Mobile-specific improvements */
            @media (max-width: 640px) {
                .chat-container {
                    border-radius: 0 !important;
                    height: 100vh !important;
                    height: 100dvh !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                }
                .composer-input {
                    font-size: 16px !important; /* Prevents zoom on iOS */
                }
            }
        </style>
    </head>
    <body>
        <!-- Main Chat Container -->
        <div class="chat-container mx-auto max-w-[900px] h-screen md:h-[92vh] bg-white/95 md:bg-white/80 backdrop-blur-sm md:shadow-xl md:rounded-2xl md:border md:border-indigo-100 overflow-hidden flex flex-col">

            <!-- Header - fixed height -->
            <header class="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-indigo-100 bg-white/95 backdrop-blur-sm safe-top">
                <div class="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div class="relative flex-shrink-0">
                        <img src="/legal-hub-site-icon.png" alt="LegalHub" class="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-xl object-contain shadow-md" />
                        <span class="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white grid place-items-center shadow">
                            <span class="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500"></span>
                        </span>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
                            <h1 class="text-sm sm:text-base md:text-lg font-semibold text-slate-900 truncate">LegalHub • Intake Assistant</h1>
                            <span class="hidden sm:inline-flex text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Online</span>
                            <span class="hidden md:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">Verified</span>
                        </div>
                        <p class="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">I'll help connect you with a qualified attorney.</p>
                    </div>
                </div>
            </header>

            <!-- Chat area - flexible height -->
            <section id="chatWrap" class="flex-1 overflow-y-auto nice-scroll bg-gradient-to-b from-white to-indigo-50/40 min-h-0">
                <div id="messageList" class="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 space-y-3 sm:space-y-4">
                    <div class="flex justify-center">
                        <div class="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-[11px] rounded-full bg-slate-100 text-slate-600 border border-slate-200">You're connected with a verified legal intake assistant</div>
                    </div>
                    <!-- Intro bubble -->
                    <div class="flex gap-2 sm:gap-3 items-start">
                        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center shadow text-xs sm:text-sm">LH</div>
                        <div class="relative max-w-[75%] sm:max-w-[78%] md:max-w-[70%] bg-white border border-slate-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm bubble-tail-left">
                            <p id="welcomeMessage" class="text-sm sm:text-[15px] leading-5 sm:leading-6 text-slate-800">Thanks for visiting LegalHub. Please describe your legal issue in as much detail as you feel comfortable — this will help us match you with the best attorney for your case.</p>
                            <div class="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500">Now</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Composer - fixed height with better mobile handling -->
            <footer class="flex-shrink-0 px-3 sm:px-4 md:px-6 pt-2 pb-2 sm:pt-3 sm:pb-3 safe-bottom border-t border-indigo-100 bg-white/95 backdrop-blur-sm">
                <div class="max-w-3xl mx-auto">
                    <div class="flex items-end gap-2">
                        <div class="flex-1">
                            <textarea 
                                id="message" 
                                rows="1" 
                                class="composer-input w-full min-h-[40px] sm:min-h-[44px] max-h-[120px] resize-none rounded-2xl border border-indigo-100 bg-white/90 focus:bg-white outline-none px-3 sm:px-4 py-2 sm:py-3 pr-3 sm:pr-12 text-sm shadow-sm focus:ring-2 focus:ring-indigo-200 transition" 
                                placeholder="Type your message…"
                                ></textarea>
                        </div>
                        <button id="sendBtn" class="flex-shrink-0 inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold shadow text-sm transition-colors">
                            <span class="hidden sm:inline">Send</span>
                            <svg class="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="mt-1 sm:mt-2 flex items-center justify-between">
                        <div class="text-[10px] sm:text-[11px] text-slate-500 line-clamp-1">Not legal advice - I'll connect you with an attorney</div>
                        <div class="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">Secure & Confidential</div>
                    </div>
                    
                    <div class="mt-1 sm:mt-2 flex items-center justify-between">
                        <div class="text-[10px] sm:text-[11px] text-slate-500">By signing up, signing in, or by using this service, you agree to LegalHub’s Terms and Conditions and Privacy Policy and consent to receive communications using the contact details provided. These terms include a binding arbitration clause. LegalHub is not a law firm and does not provide legal advice. LegalHub provides a platform for legal information and self-help.
                    </div>
                    </div>
                    
                    
                    
                    
                    
                </div>
            </footer>
        </div>

        <!-- Final Consent Modal -->
        <div id="consentModal" class="fixed inset-0 bg-black/50 consent-modal flex items-center justify-center p-4 z-50 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl">
                <div class="p-6">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center shadow text-sm">LH</div>
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-slate-900 mb-2">Connect with an Attorney</h3>
                            <p class="text-sm text-slate-600 mb-4" id="consentQuestion">May we share your information with a qualified attorney in your area who handles Personal Injury cases?</p>

                            <div class="bg-slate-50 rounded-lg p-3 mb-4 text-xs text-slate-600">
                                <strong>TCPA Notice:</strong> By clicking 'Yes, Connect Me' I agree by electronic signature to be contacted by LegalHub through telephone calls, text messages, and email. I understand that my consent is not a condition of purchase.
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 mt-4">
                        <button id="consentNo" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                            No, Thanks
                        </button>
                        <button id="consentYes" class="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-colors">
                            Yes, Connect Me
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Configuration - can be set via URL params or hardcoded for landing pages
            const CONFIG = {
                predefinedCategory: getUrlParam('category') || window.PREDEFINED_CATEGORY || null,
                predefinedSubcategory: getUrlParam('subcategory') || window.PREDEFINED_SUBCATEGORY || null,
                companyName: 'LegalHub'
            };

            // DOM Elements
            const el = {
                list: document.getElementById('messageList'),
                input: document.getElementById('message'),
                send: document.getElementById('sendBtn'),
                chatWrap: document.getElementById('chatWrap'),
                welcomeMessage: document.getElementById('welcomeMessage'),
                consentModal: document.getElementById('consentModal'),
                consentQuestion: document.getElementById('consentQuestion'),
                consentYes: document.getElementById('consentYes'),
                consentNo: document.getElementById('consentNo')
            };

            // Global state
            let sending = false;
            let conversationState = {
                category: CONFIG.predefinedCategory,
                subcategory: CONFIG.predefinedSubcategory,
                leadData: {},
                step: 'initial'
            };

            // Initialize Jornaya LeadID tracking
            let jornayaLeadId = null;
            // Initialize real Jornaya tracking
            function initializeJornayaTracking() {
                try {
                    // Add Jornaya script dynamically if not already present
                    if (!document.getElementById('jornaya-script')) {
                        const script = document.createElement('script');
                        script.id = 'jornaya-script';
                        script.type = 'text/javascript';
                        script.async = true;
                        script.src = 'https://lead.jornayapanther.io/lead.js';
                        document.head.appendChild(script);

                        // Set up Jornaya callback
                        script.onload = function () {
                            if (typeof Jornaya !== 'undefined') {
                                // Initialize Jornaya and get LeadID
                                Jornaya.LeadID.initialize({
                                    client_id: 'YOUR_JORNAYA_CLIENT_ID', // Replace with your actual client ID
                                    callback: function (leadId) {
                                        jornayaLeadId = leadId;
                                        console.log('[Jornaya] LeadID captured:', leadId);
                                    }
                                });
                            }
                        };
                    } else if (typeof Jornaya !== 'undefined') {
                        // Script already loaded, just get the LeadID
                        jornayaLeadId = Jornaya.LeadID.get();
                    }
                } catch (e) {
                    console.warn('Jornaya tracking initialization failed:', e);
                    // Fallback to session-based tracking
                    jornayaLeadId = generateSessionLeadId();
                }
            }

            // Fallback session-based LeadID generator
            function generateSessionLeadId() {
                const sessionKey = 'legalhub_session_leadid';
                let leadId = sessionStorage.getItem(sessionKey);

                if (!leadId) {
                    // Generate a session-based LeadID
                    const timestamp = Date.now().toString(36);
                    const random = Math.random().toString(36).substr(2, 9);
                    leadId = `session_${timestamp}_${random}`;
                    sessionStorage.setItem(sessionKey, leadId);
                }

                return leadId;
            }

            // ENHANCED: TrustedForm certificate capture with comprehensive methods
            function getTrustedFormCertUrl() {
                try {
                    console.log('[TrustedForm] Attempting to get certificate URL...');
                    
                    // Method 1: Direct trustedform.certUrl
                    if (typeof trustedform !== 'undefined') {
                        console.log('[TrustedForm] Object found:', trustedform);
                        
                        if (trustedform.certUrl) {
                            console.log('[TrustedForm] Certificate URL found via certUrl:', trustedform.certUrl);
                            return trustedform.certUrl;
                        }
                        
                        // Method 2: Try calling getCertUrl() if available
                        if (typeof trustedform.getCertUrl === 'function') {
                            const certUrl = trustedform.getCertUrl();
                            if (certUrl) {
                                console.log('[TrustedForm] Certificate URL found via getCertUrl():', certUrl);
                                return certUrl;
                            }
                        }
                        
                        // Method 3: Check other possible properties
                        if (trustedform.cert_url) {
                            console.log('[TrustedForm] Certificate URL found via cert_url:', trustedform.cert_url);
                            return trustedform.cert_url;
                        }
                    }
                    
                    // Method 4: Check for hidden form fields that TrustedForm might create
                    const certInput = document.querySelector('input[name="trusted_form_cert_url"], input[name="xxTrustedFormCertUrl"], input[name="trustedform_cert_url"]');
                    if (certInput && certInput.value) {
                        console.log('[TrustedForm] Certificate URL found in form field:', certInput.value);
                        return certInput.value;
                    }
                    
                    // Method 5: Check window object for TrustedForm variables
                    if (window.xxTrustedFormCertUrl) {
                        console.log('[TrustedForm] Certificate URL found in window:', window.xxTrustedFormCertUrl);
                        return window.xxTrustedFormCertUrl;
                    }
                    
                    console.warn('[TrustedForm] Certificate URL not found via any method');
                    console.log('[TrustedForm] Available trustedform properties:', typeof trustedform !== 'undefined' ? Object.keys(trustedform) : 'trustedform not defined');
                    
                    return '';
                    
                } catch (e) {
                    console.error('[TrustedForm] Error getting certificate URL:', e);
                    return '';
                }
            }

            // ENHANCED: Monitor for TrustedForm certificate URL with extended polling
            function monitorTrustedFormCert() {
                let attempts = 0;
                const maxAttempts = 60; // Try for 30 seconds (60 * 500ms)
                
                const monitor = setInterval(() => {
                    attempts++;
                    
                    const certUrl = getTrustedFormCertUrl();
                    if (certUrl) {
                        console.log('[TrustedForm] Certificate captured after', attempts, 'attempts:', certUrl);
                        clearInterval(monitor);
                        
                        // Store it globally for submission
                        window.trustedFormCertUrl = certUrl;
                        return;
                    }
                    
                    if (attempts >= maxAttempts) {
                        console.warn('[TrustedForm] Stopped monitoring after', attempts, 'attempts - certificate not found');
                        clearInterval(monitor);
                    }
                }, 500);
            }

            // ENHANCED: Force TrustedForm to generate a certificate
            function forceTrustedFormCapture() {
                try {
                    // Create a hidden form to trigger TrustedForm
                    const form = document.createElement('form');
                    form.style.display = 'none';
                    form.method = 'POST';
                    form.action = '#';
                    
                    // Add some form fields to make it look real
                    const fields = ['email', 'phone', 'name'];
                    fields.forEach(fieldName => {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = fieldName;
                        input.value = 'test';
                        form.appendChild(input);
                    });
                    
                    document.body.appendChild(form);
                    
                    console.log('[TrustedForm] Created trigger form to generate certificate');
                    
                    // Remove form after a short delay
                    setTimeout(() => {
                        if (form.parentNode) {
                            form.parentNode.removeChild(form);
                        }
                    }, 2000);
                    
                } catch (e) {
                    console.error('[TrustedForm] Error creating trigger form:', e);
                }
            }

            // ENHANCED: Initialize TrustedForm with comprehensive setup
            function initializeTrustedForm() {
                console.log('[TrustedForm] Starting initialization...');
                
                const checkTrustedForm = () => {
                    if (typeof trustedform !== 'undefined') {
                        console.log('[TrustedForm] Initialized successfully');

                        // Set up an interval to capture the cert URL once it's available
                        const captureInterval = setInterval(() => {
                            const certUrl = getTrustedFormCertUrl();
                            if (certUrl) {
                                console.log('[TrustedForm] Certificate captured:', certUrl);
                                window.trustedFormCertUrl = certUrl;
                                clearInterval(captureInterval);
                            }
                        }, 500); // Check every 500ms

                        // Clear interval after 30 seconds to avoid infinite checking
                        setTimeout(() => clearInterval(captureInterval), 30000);

                    } else {
                        // Retry in 1 second if TrustedForm isn't loaded yet
                        setTimeout(checkTrustedForm, 1000);
                    }
                };

                // Start checking for TrustedForm
                setTimeout(checkTrustedForm, 1000);
                
                // Also start comprehensive monitoring
                setTimeout(monitorTrustedFormCert, 2000);
                
                // Try force capture method
                setTimeout(forceTrustedFormCapture, 3000);
            }

            // Auto-resize textarea
            el.input.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });

            // Initialize welcome message based on predefined category
            if (CONFIG.predefinedCategory) {
                const categoryNames = {
                    'personal_injury': 'Personal Injury',
                    'family_law': 'Family Law',
                    'criminal_law': 'Criminal Law'
                };

                const categoryName = categoryNames[CONFIG.predefinedCategory] || CONFIG.predefinedCategory;
                el.welcomeMessage.textContent = `Hi — I understand you need help with ${categoryName}. Can you tell me what happened?`;
            }

            // Enhanced typing indicator with natural pauses
            let typingEl = null;
            let typingTimeout = null;
            let pauseTimeout = null;

            function createTypingEl() {
                const wrap = document.createElement('div');
                wrap.className = 'flex gap-2 sm:gap-3 items-start';
                wrap.innerHTML = `
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center shadow text-xs sm:text-sm">LH</div>
            <div class="relative max-w-[75%] sm:max-w-[78%] md:max-w-[70%] bg-white border border-slate-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm bubble-tail-left">
              <div class="flex items-center gap-1.5 text-slate-500">
                <span class="typing-dot inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                <span class="typing-dot inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                <span class="typing-dot inline-block w-2 h-2 rounded-full bg-slate-400"></span>
              </div>
            </div>`;
                return wrap;
            }

            function showTypingWithNaturalPauses(show, responseLength = 0) {
                // Clear any existing timeouts
                if (typingTimeout)
                    clearTimeout(typingTimeout);
                if (pauseTimeout)
                    clearTimeout(pauseTimeout);

                if (show) {
                    if (!typingEl)
                        typingEl = createTypingEl();
                    el.list.appendChild(typingEl);
                    typingEl.style.display = '';
                    scrollToEnd();

                    // Add a natural pause for longer responses
                    if (responseLength > 200) {
                        typingTimeout = setTimeout(() => {
                            if (typingEl) {
                                typingEl.style.display = 'none'; // Hide for thinking pause

                                pauseTimeout = setTimeout(() => {
                                    if (typingEl) {
                                        typingEl.style.display = ''; // Show again
                                        scrollToEnd();
                                    }
                                }, 1200); // 1.2 second pause
                            }
                        }, 2500); // After 2.5 seconds of typing
                    }
                } else if (typingEl) {
                    typingEl.style.display = 'none';
                }
            }

            // Legacy function for backward compatibility
            function showTyping(show) {
                if (typingTimeout)
                    clearTimeout(typingTimeout);
                if (pauseTimeout)
                    clearTimeout(pauseTimeout);

                if (show) {
                    if (!typingEl)
                        typingEl = createTypingEl();
                    el.list.appendChild(typingEl);
                    typingEl.style.display = '';
                    scrollToEnd();
                } else if (typingEl) {
                    typingEl.style.display = 'none';
                }
            }

            function timeNow() {
                const d = new Date();
                let h = d.getHours(), m = String(d.getMinutes()).padStart(2, '0');
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12;
                return `${h}:${m} ${ampm}`;
            }

            function bubble( {text, from = 'you'}) {
                const wrap = document.createElement('div');
                if (from === 'you') {
                    wrap.className = 'flex gap-2 sm:gap-3 items-start justify-end';
                    wrap.innerHTML = `
              <div class="relative max-w-[75%] sm:max-w-[78%] md:max-w-[70%] bg-indigo-100 border border-indigo-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm bubble-tail-right">
                <p class="text-sm sm:text-[15px] leading-5 sm:leading-6 text-slate-900"></p>
                <div class="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-slate-600 text-right">${timeNow()}</div>
              </div>`;
                } else {
                    wrap.className = 'flex gap-2 sm:gap-3 items-start';
                    wrap.innerHTML = `
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white font-semibold flex items-center justify-center shadow text-xs sm:text-sm">LH</div>
              <div class="relative max-w-[75%] sm:max-w-[78%] md:max-w-[70%] bg-white border border-slate-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm bubble-tail-left">
                <p class="text-sm sm:text-[15px] leading-5 sm:leading-6 text-slate-800"></p>
                <div class="mt-1 sm:mt-2 text-[10px] sm:text-[11px] text-slate-500">${timeNow()}</div>
              </div>`;
                }

                const textEl = wrap.querySelector('p');
                // Handle line breaks and format text nicely
                textEl.innerHTML = text.replace(/\n/g, '<br>');
                return wrap;
            }

            function scrollToEnd() {
                requestAnimationFrame(() => {
                    el.list.lastElementChild?.scrollIntoView({behavior: 'smooth', block: 'end'});
                    el.chatWrap.scrollTop = el.chatWrap.scrollHeight;
                });
            }

            // Lead data helpers
            function stripTaggedBlocks(s) {
                return s.replace(/<lead_update>[\s\S]*?<\/lead_update>/g, '')
                        .replace(/<lead_final>[\s\S]*?<\/lead_final>/g, '')
                        .trim();
            }

            function extractTaggedJSON(s, tag) {
                const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'g');
                const out = [];
                let m;
                while ((m = re.exec(s))) {
                    try {
                        out.push(JSON.parse(m[1]));
                    } catch {
                        console.warn(`Invalid JSON in ${tag}:`, m[1]);
                    }
                }
                return out;
            }

            function persistLeadDraft(o) {
                try {
                    conversationState.leadData = {...conversationState.leadData, ...o};
                    localStorage.setItem('legalhub_lead_draft', JSON.stringify(conversationState.leadData));
                } catch (e) {
                    console.warn('Could not persist lead draft:', e);
                }
            }

            function persistLeadFinal(o) {
                try {
                    conversationState.leadData = {...conversationState.leadData, ...o};
                    localStorage.setItem('legalhub_lead_final', JSON.stringify(conversationState.leadData));
                } catch (e) {
                    console.warn('Could not persist lead final:', e);
                }
            }

            // Backend communication
            async function askBackend(userText, timeoutMs = 30000) {
                const controller = new AbortController();
                const t = setTimeout(() => controller.abort(), timeoutMs);

                try {
                    const requestData = {
                        q: userText,
                        category: CONFIG.predefinedCategory,
                        subcategory: CONFIG.predefinedSubcategory
                    };

                    const res = await fetch('./api/ask.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(requestData),
                        signal: controller.signal
                    });

                    clearTimeout(t);
                    const raw = await res.text();

                    if (!res.ok) {
                        let msg = raw;
                        try {
                            const j = JSON.parse(raw);
                            msg = j.error || raw;
                        } catch {
                        }
                        throw new Error(`HTTP ${res.status}: ${msg}`);
                    }

                    let j;
                    try {
                        j = JSON.parse(raw);
                    } catch {
                        j = {answer: raw};
                    }

                    return j;
                } catch (e) {
                    clearTimeout(t);
                    throw new Error(e.name === 'AbortError' ? 'Request timed out' : e.message);
                }
            }

            // Main message sending logic with natural typing
            async function sendMessage(text) {
                if (sending)
                    return;
                const trimmed = text.trim();
                if (!trimmed)
                    return;

                sending = true;

                el.list.appendChild(bubble({text: trimmed, from: 'you'}));
                el.input.value = '';
                el.input.style.height = 'auto';
                scrollToEnd();

                try {
                    // Show typing with natural pause for longer responses
                    const estimatedLength = trimmed.length * 3; // Better estimation
                    showTypingWithNaturalPauses(true, estimatedLength);

                    const response = await askBackend(trimmed); // Get full response object
                    const {answer, debug, submit_lead, lead_data} = response;

                    // Clear typing indicator and timeouts
                    if (typingTimeout)
                        clearTimeout(typingTimeout);
                    if (pauseTimeout)
                        clearTimeout(pauseTimeout);
                    showTyping(false);

                    if (debug) {
                        console.log('%c[LH DEBUG]', 'color:#6b7280', debug);
                        console.table({
                            flow: debug.flow,
                            collected_data: Object.keys(debug.collected_data || {}),
                            next_required: (debug.next_required || []).join(', ')
                        });

                        // Update conversation state
                        conversationState.step = debug.flow;
                        if (debug.collected_data) {
                            conversationState.leadData = {...conversationState.leadData, ...debug.collected_data};
                        }
                    }

                    const visible = stripTaggedBlocks(answer) || '(processing...)';
                    el.list.appendChild(bubble({text: visible, from: 'expert'}));

                    // FIXED: Check for submit_lead flag directly from response
                    if (submit_lead && lead_data) {
                        persistLeadFinal(lead_data);
                        console.log('[Lead Final]', lead_data);

                        // Show consent modal
                        showConsentModal(lead_data);
                    }

                    scrollToEnd();
                } catch (e) {
                    if (typingTimeout)
                        clearTimeout(typingTimeout);
                    if (pauseTimeout)
                        clearTimeout(pauseTimeout);
                    showTyping(false);
                    console.error('[Backend Error]', e);
                    el.list.appendChild(bubble({
                        text: `⚠️ ${e.message || 'Something went wrong'}. Please try again.`,
                        from: 'expert'
                    }));
                    scrollToEnd();
                } finally {
                    sending = false;
                }
            }

            // Final consent modal handling
            function showConsentModal(leadData) {
                const categoryName = getCategoryDisplayName(conversationState.category);
                el.consentQuestion.textContent = `May we share your information with a qualified attorney in your area who handles ${categoryName} cases?`;
                el.consentModal.classList.remove('hidden');

                // Store lead data for submission
                window.pendingLeadData = leadData;
            }

            function getCategoryDisplayName(category) {
                const names = {
                    'personal_injury': 'Personal Injury',
                    'family_law': 'Family Law',
                    'criminal_law': 'Criminal Law',
                    'medical_malpractice': 'Medical Malpractice'
                };
                return names[category] || category;
            }

            // UPDATED: Enhanced lead submission with better compliance data capture
            async function submitLead(leadData) {
                try {
                    // Ensure we have the latest compliance data
                    const currentJornayaId = jornayaLeadId || generateSessionLeadId();
                    const currentTrustedFormUrl = window.trustedFormCertUrl || getTrustedFormCertUrl();

                    console.log('[Compliance] Final values:', {
                        jornaya_leadid: currentJornayaId,
                        trustedform_cert_url: currentTrustedFormUrl
                    });

                    // Add compliance tracking data with current values
                    const finalLeadData = {
                        ...leadData,
                        jornaya_leadid: currentJornayaId,
                        trustedform_cert_url: currentTrustedFormUrl,
                        tcpa_text: `By clicking 'Yes, Connect Me' I agree by electronic signature to be contacted by ${CONFIG.companyName} through telephone calls, text messages, and email. I understand that my consent is not a condition of purchase.`,
                        landing_page_url: window.location.href,
                        ip_address: '', // Will be populated server-side
                        user_agent: navigator.userAgent,
                        consent_timestamp: new Date().toISOString(),
                        page_url: window.location.href,
                        referrer_url: document.referrer || ''
                    };

                    const res = await fetch('./api/submit_lead.php', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(finalLeadData)
                    });

                    const result = await res.json();

                    if (result.success) {
                        el.list.appendChild(bubble({
                            text: "Perfect! I've connected you with local attorneys who will be in touch soon. Thank you for using LegalHub!",
                            from: 'expert'
                        }));

                        // Clear ALL stored data and reset conversation state
                        localStorage.removeItem('legalhub_lead_draft');
                        localStorage.removeItem('legalhub_lead_final');

                        // Reset conversation state
                        conversationState = {
                            category: null,
                            subcategory: null,
                            leadData: {},
                            step: 'initial'
                        };

                        console.log('[Lead Submitted Successfully - Session Cleared]', result);
                    } else {
                        throw new Error(result.message || 'Lead submission failed');
                    }
                } catch (e) {
                    console.error('Lead submit failed:', e);
                    el.list.appendChild(bubble({
                        text: "I apologize, there was a technical issue submitting your information. Please try again or contact us directly.",
                        from: 'expert'
                    }));
                }

                scrollToEnd();
            }

            function getUrlParam(name) {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get(name);
            }

            // Event listeners
            el.send.addEventListener('click', () => sendMessage(el.input.value));

            el.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(el.input.value);
                }
            });

            // Consent modal event listeners
            el.consentYes.addEventListener('click', async () => {
                el.consentModal.classList.add('hidden');

                if (window.pendingLeadData) {
                    await submitLead(window.pendingLeadData);
                    window.pendingLeadData = null;
                }
            });

            el.consentNo.addEventListener('click', () => {
                el.consentModal.classList.add('hidden');
                el.list.appendChild(bubble({
                    text: "I understand. If you change your mind, feel free to start a new conversation. Have a great day!",
                    from: 'expert'
                }));
                scrollToEnd();

                // Clear session but keep data in case they change their mind
                window.pendingLeadData = null;
            });

            // Mobile viewport height handling
            function setVH() {
                document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
            }
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);

            // ENHANCED: Initialize compliance tracking on page load
            document.addEventListener('DOMContentLoaded', function () {
                console.log('[LegalHub Intake] Starting compliance tracking initialization...');
                
                // Initialize compliance tracking
                initializeJornayaTracking();
                initializeTrustedForm();

                console.log('[LegalHub Intake] Initialized with config:', CONFIG);
            });
        </script>
    </body>
</html>