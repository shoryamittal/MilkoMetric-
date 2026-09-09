export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
]

export const TRANSLATIONS = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    animals: 'Animals & Risk',
    aiForecast: 'AI Forecast',
    alerts: 'Alerts Center',
    iotMonitoring: 'IoT & Sensors',
    farmMap: 'Farm Map',
    analytics: 'Farm Analytics',
    recommendations: 'Veterinary Actions',
    settings: 'Settings',
    main: 'Main Overview',
    monitoring: 'Telemetry Monitoring',
    insights: 'Clinical Insights',
    system: 'System & Edge',

    // Greetings
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    consoleSubtitle: 'Autonomous herd health diagnostics and pre-symptomatic mastitis detection console (SIH26109).',

    // Metrics & KPI labels
    totalAnimals: 'Total Monitored',
    healthy: 'Healthy Cattle',
    watchRisk: 'Watchlist Cattle',
    highRisk: 'High Risk Cattle',
    criticalRisk: 'Critical Attention',
    immediateAction: 'Requiring Action',
    herdHealthScore: 'Herd Health Score',

    // Telemetry & Hardware
    milkEC: 'Milk Electrical Conductivity',
    estimatedSCC: 'AI-Estimated SCC',
    milkYield: 'Daily Milk Yield',
    udderTemp: 'Udder Temperature',
    shedTHI: 'Shed Heat Stress (THI)',
    activity: 'Activity Level',
    rumination: 'Rumination Rate',

    // Risk Tiers
    tierLow: 'LOW',
    tierWatch: 'WATCH',
    tierHigh: 'HIGH',
    tierCritical: 'CRITICAL',

    // Veterinary Workflow
    vetWorkflowTitle: 'Veterinary Review Workflow',
    requestVetReview: 'Request Veterinary Review',
    statusOpen: 'OPEN',
    statusUnderReview: 'UNDER REVIEW',
    statusVetContacted: 'VET CONTACTED',
    statusActionTaken: 'ACTION TAKEN',
    statusResolved: 'RESOLVED',
    vetDisclaimer: 'Decision Support System: AgriNex AI flags elevated risk from multi-modal sensor fusion. This is an early warning, not a confirmed veterinary diagnosis.',

    // Baselines
    baselineTitle: 'Personalized Animal Baseline',
    baselineRobust: '14/14 historical observations established (Robust Baseline)',
    baselineDeveloping: 'Baseline developing — 8/14 observations logged',
    deviation: 'Deviation vs Baseline',

    // Network & Sync
    onlineMode: 'Online (Cloud Connected)',
    offlineMode: '100% Offline Edge Mode',
    syncingMode: 'Syncing local records via MQTT v5.0...',
    pendingSync: 'records queued locally',
    lastSync: 'Last synced',

    // Chatbot
    chatbotTitle: 'AgriNex AI Assistant',
    chatbotSubtitle: 'Multi-Modal Dairy Health Assistant',
    chatbotPlaceholder: 'Ask about herd health, COW-024, THI, or request vet review...',
    chatbotSend: 'Send',
    chatbotClear: 'Clear Chat',
    chatbotOfflineNotice: 'Offline Mode: Answering using local edge cache.',
    suggested1: 'Why is COW-024 high risk?',
    suggested2: 'How is my herd doing?',
    suggested3: 'What is the current shed THI?',
    suggested4: 'Which sensors are active?',
  },
  hi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    animals: 'पशु और जोखिम',
    aiForecast: 'एआई पूर्वानुमान',
    alerts: 'अलर्ट केंद्र',
    iotMonitoring: 'आईओटी और सेंसर',
    farmMap: 'फ़ार्म मानचित्र',
    analytics: 'फ़ार्म विश्लेषण',
    recommendations: 'पशुचिकित्सा कार्य',
    settings: 'सेटिंग्स',
    main: 'मुख्य विहंगावलोकन',
    monitoring: 'टेलीमेट्री निगरानी',
    insights: 'नैदानिक अंतर्दृष्टि',
    system: 'सिस्टम और एज',

    // Greetings
    goodMorning: 'शुभ प्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    consoleSubtitle: 'स्वचालित झुंड स्वास्थ्य निदान और पूर्व-लक्षण मैस्टाइटिस पूर्वानुमान कंसोल (SIH26109)।',

    // Metrics & KPI labels
    totalAnimals: 'कुल निगरानी में पशु',
    healthy: 'स्वस्थ मवेशी',
    watchRisk: 'निगरानी सूची',
    highRisk: 'उच्च जोखिम मवेशी',
    criticalRisk: 'गंभीर ध्यान आवश्यक',
    immediateAction: 'त्वरित कार्रवाई आवश्यक',
    herdHealthScore: 'झुंड स्वास्थ्य स्कोर',

    // Telemetry & Hardware
    milkEC: 'दूध विद्युत चालकता (EC)',
    estimatedSCC: 'एआई-अनुमानित एससीसी',
    milkYield: 'दैनिक दूध उत्पादन',
    udderTemp: 'अयन तापमान',
    shedTHI: 'शेड ताप तनाव (THI)',
    activity: 'गतिविधि स्तर',
    rumination: 'जुगाली दर',

    // Risk Tiers
    tierLow: 'कम (LOW)',
    tierWatch: 'निगरानी (WATCH)',
    tierHigh: 'उच्च (HIGH)',
    tierCritical: 'गंभीर (CRITICAL)',

    // Veterinary Workflow
    vetWorkflowTitle: 'पशुचिकित्सा समीक्षा वर्कफ़्लो',
    requestVetReview: 'पशु चिकित्सक समीक्षा का अनुरोध करें',
    statusOpen: 'खुला (OPEN)',
    statusUnderReview: 'समीक्षाधीन',
    statusVetContacted: 'डॉक्टर से संपर्क किया',
    statusActionTaken: 'कार्रवाई की गई',
    statusResolved: 'हल किया गया',
    vetDisclaimer: 'निर्णय समर्थन प्रणाली: एग्रीनेक्स एआई प्रारंभिक चेतावनी देता है, यह पुष्टीकृत निदान नहीं है।',

    // Baselines
    baselineTitle: 'व्यक्तिगत पशु बेसलाइन',
    baselineRobust: '14/14 ऐतिहासिक प्रेक्षण स्थापित (मजबूत बेसलाइन)',
    baselineDeveloping: 'बेसलाइन विकसित हो रही है — 8/14 प्रेक्षण दर्ज',
    deviation: 'बेसलाइन से विचलन',

    // Network & Sync
    onlineMode: 'ऑनलाइन (क्लाउड कनेक्टेड)',
    offlineMode: '100% ऑफ़लाइन एज मोड',
    syncingMode: 'स्थानीय डेटा सिंक हो रहा है...',
    pendingSync: 'रिकॉर्ड स्थानीय कतार में',
    lastSync: 'अंतिम सिंक',

    // Chatbot
    chatbotTitle: 'एग्रीनेक्स एआई सहायक',
    chatbotSubtitle: 'डेयरी स्वास्थ्य सहायक',
    chatbotPlaceholder: 'झुंड, COW-024, THI या डॉक्टर समीक्षा के बारे में पूछें...',
    chatbotSend: 'भेजें',
    chatbotClear: 'चैट साफ़ करें',
    chatbotOfflineNotice: 'ऑफ़लाइन मोड: स्थानीय एज डेटा से उत्तर दिया जा रहा है।',
    suggested1: 'COW-024 उच्च जोखिम में क्यों है?',
    suggested2: 'मेरे झुंड की स्थिति कैसी है?',
    suggested3: 'वर्तमान शेड THI क्या है?',
    suggested4: 'कौन से सेंसर सक्रिय हैं?',
  },
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    animals: 'जनावरे व धोका',
    aiForecast: 'एआय अंदाज',
    alerts: 'इशारे केंद्र',
    iotMonitoring: 'आयओटी आणि सेन्सर्स',
    farmMap: 'फार्म नकाशा',
    analytics: 'फार्म विश्लेषण',
    recommendations: 'पशुवैद्यकीय कृती',
    settings: 'सेटिंग्ज',
    main: 'मुख्य विहंगावलोकन',
    monitoring: 'टेलीमेट्री देखरेख',
    insights: 'नैदानिक अंतर्दृष्टी',
    system: 'प्रणाली आणि एज',

    // Greetings
    goodMorning: 'शुभ सकाळ',
    goodAfternoon: 'शुभ दुपार',
    goodEvening: 'शुभ संध्याकाळ',
    consoleSubtitle: 'स्वयंचलित कळप आरोग्य निदान आणि पूर्व-लक्षण स्तनदाह अंदाज प्रणाली (SIH26109).',

    // Metrics & KPI labels
    totalAnimals: 'एकूण देखरेखीतील जनावरे',
    healthy: 'निरोगी जनावरे',
    watchRisk: 'देखरेख सूची',
    highRisk: 'उच्च धोका जनावरे',
    criticalRisk: 'तातडीचे लक्ष आवश्यक',
    immediateAction: 'कार्रवाई आवश्यक',
    herdHealthScore: 'कळप आरोग्य गुण',

    // Telemetry & Hardware
    milkEC: 'दूध विद्युत वाहकता (EC)',
    estimatedSCC: 'एआय-अंदाजित एससीसी',
    milkYield: 'दैनिक दूध उत्पादन',
    udderTemp: 'कास तापमान',
    shedTHI: 'शेड उष्णता ताण (THI)',
    activity: 'हालचाल पातळी',
    rumination: 'रवंथ दर',

    // Risk Tiers
    tierLow: 'कमी (LOW)',
    tierWatch: 'देखरेख (WATCH)',
    tierHigh: 'उच्च (HIGH)',
    tierCritical: 'गंभीर (CRITICAL)',

    // Veterinary Workflow
    vetWorkflowTitle: 'पशुवैद्यकीय पुनरावलोकन कार्यप्रवाह',
    requestVetReview: 'पशुवैद्यकीय तपासणीची विनंती करा',
    statusOpen: 'उघडे (OPEN)',
    statusUnderReview: 'तपासणी सुरू',
    statusVetContacted: 'डॉक्टरांशी संपर्क साधला',
    statusActionTaken: 'कृती केली गेली',
    statusResolved: 'निवारण झाले',
    vetDisclaimer: 'निर्णय सहाय्यक प्रणाली: ऍग्रीनेक्स एआय पूर्व-इशारा देते, हे अंतिम निदान नाही.',

    // Baselines
    baselineTitle: 'वैयक्तिक जनावराची बेसलाइन',
    baselineRobust: '14/14 ऐतिहासिक नोंदी पूर्ण (सक्षम बेसलाइन)',
    baselineDeveloping: 'बेसलाइन तयार होत आहे — 8/14 नोंदी',
    deviation: 'बेसलाइनपासून तफावत',

    // Network & Sync
    onlineMode: 'ऑनलाइन (क्लाउड जोडणी)',
    offlineMode: '100% ऑफलाइन एज मोड',
    syncingMode: 'डेटा सिंक होत आहे...',
    pendingSync: 'नोंदी स्थानिक रांगेत',
    lastSync: 'शेवटचा सिंक',

    // Chatbot
    chatbotTitle: 'ऍग्रीनेक्स एआय सहाय्यक',
    chatbotSubtitle: 'डेयरी आरोग्य सल्लागार',
    chatbotPlaceholder: 'कळप, COW-024, THI किंवा डॉक्टरांबद्दल विचारा...',
    chatbotSend: 'पाठवा',
    chatbotClear: 'चॅट साफ करा',
    chatbotOfflineNotice: 'ऑफलाइन मोड: स्थानिक एज डेटाद्वारे उत्तर दिले जात आहे.',
    suggested1: 'COW-024 उच्च धोक्यात का आहे?',
    suggested2: 'माझ्या कळपाची स्थिती कशी आहे?',
    suggested3: 'सध्याचे शेड THI काय आहे?',
    suggested4: 'कोणते सेन्सर्स सक्रिय आहेत?',
  },
}

export function t(lang, key) {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key
}
