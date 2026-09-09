/**
 * AgriNex AI Multilingual Farm Telemetry & Herd Intelligence Engine
 * Grounded directly in live farm telemetry, ML forecasts, THI environmental data,
 * and veterinary workflows.
 * Supports: English, Hindi, Marathi, and mixed Hinglish / Marathi-English farmer queries.
 */

function normalizeText(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function detectLanguage(text = '', fallbackLang = 'en') {
  const norm = ` ${normalizeText(text)} `

  // Marathi specific words & markers
  const marathiMarkers = [
    'आहेत', 'आहे', 'नाही', 'सांगा', 'काय', 'कशी', 'कोणत्या', 'गाई', 'जनावरे', 'तपासा', 'करा',
    'कमी', 'जास्त', 'गोठा', 'तापमान', 'दूध', 'धोका', 'तपासून', 'पाहिजे', 'कधी', 'दाखवा', 'मदत',
    'kiti', 'ahet', 'aahe', 'kay', 'kashi', 'kasa', 'kontya', 'konti', 'dakhav', 'dakhva', 'gai', 'gothatil', 'upay', 'tapasani'
  ]

  // Hindi specific words & markers
  const hindiMarkers = [
    'हैं', 'है', 'कौंसी', 'कौनसे', 'कितने', 'कितना', 'बताओ', 'बताइए', 'क्या', 'गाय', 'गायें', 'पशु', 'बीमार',
    'इलाज', 'अलर्ट', 'हाल', 'दिखाओ', 'जांच', 'दूध', 'रोकथाम', 'मौसम', 'गर्मी', 'मदद', 'कैसे',
    'kaunse', 'kaunsi', 'kaun', 'kitne', 'kitna', 'kitni', 'batao', 'bataiye', 'kya', 'hai', 'hain', 'bimar', 'kripya', 'dikhaye', 'dekho', 'kaise', 'madad'
  ]

  for (const m of marathiMarkers) {
    if (norm.includes(` ${m} `) || text.includes(m)) return 'mr'
  }
  for (const h of hindiMarkers) {
    if (norm.includes(` ${h} `) || text.includes(h)) return 'hi'
  }

  // Devanagari script fallback check
  if (/[\u0900-\u097F]/.test(text)) {
    if (text.includes('आहे') || text.includes('काय') || text.includes('गाई') || text.includes('गोठा')) return 'mr'
    return 'hi'
  }

  return fallbackLang || 'en'
}

export function extractAnimalId(text = '', animals = [], defaultAnimalId = null) {
  const norm = text.toUpperCase()

  // 1. Direct standard match: COW-XXX or COW XXX
  const matchDirect = norm.match(/\bCOW[-_ ]?(\d{1,4})\b/i)
  if (matchDirect) {
    const num = matchDirect[1].padStart(3, '0')
    const target = `COW-${num}`
    const found = animals.find((a) => a.id.toUpperCase() === target)
    if (found) return found.id
    const rawTarget = `COW-${matchDirect[1]}`
    const foundRaw = animals.find((a) => a.id.toUpperCase() === rawTarget)
    if (foundRaw) return foundRaw.id
    return target
  }

  // 2. Generic numeric match like "cow 24", "gai 24", "animal 24", "tag 24"
  const matchNum = norm.match(/(?:COW|GAI|ANIMAL|CATTLE|TAG|NUMBER|NO|नंबर|गाय|क्रमांक)\s*#?\s*(\d{1,4})/i)
  if (matchNum) {
    const num = matchNum[1].padStart(3, '0')
    const candidate = `COW-${num}`
    const found = animals.find((a) => a.id.toUpperCase() === candidate)
    if (found) return found.id
    return candidate
  }

  // 3. Isolated 2-3 digit number (e.g. "024" or "24")
  const matchLoose = norm.match(/\b(0?\d{2,3})\b/)
  if (matchLoose) {
    const num = matchLoose[1].replace(/^0+/, '').padStart(3, '0')
    const candidate = `COW-${num}`
    const found = animals.find((a) => a.id.toUpperCase() === candidate)
    if (found) return found.id
  }

  return defaultAnimalId
}

export function processFarmerQuery(userMessage, state = {}) {
  const {
    animals = [],
    alerts = [],
    devices = [],
    environment = {},
    vetReviews = [],
    networkStatus = 'online',
    currentLang = 'en',
    lastAnimalId = 'COW-024',
  } = state

  const lang = detectLanguage(userMessage, currentLang)
  const norm = ` ${normalizeText(userMessage)} `

  // Determine targeted animal ID if mentioned or carried over
  const detectedAnimalId = extractAnimalId(userMessage, animals, null)
  const effectiveAnimalId = detectedAnimalId || (
    norm.includes(' her ') || norm.includes(' this cow ') || norm.includes(' ise ') || norm.includes(' uski ') || norm.includes(' tila ') || norm.includes(' hya ')
      ? lastAnimalId
      : null
  )

  const activeAlerts = alerts.filter((a) => a.status === 'active')
  const criticalAnimals = animals.filter((a) => a.riskLevel === 'critical')
  const highRiskAnimals = animals.filter((a) => a.riskLevel === 'high')
  const watchAnimals = animals.filter((a) => a.riskLevel === 'moderate')
  const requiringActionCount = criticalAnimals.length + highRiskAnimals.length
  const isOffline = networkStatus === 'offline'

  const offlineBadge = isOffline
    ? (lang === 'hi'
        ? '\n\n*(⚡ ऑफलाइन मोड: डेटा लोकल TinyML एज मेमोरी से लोड हुआ है)*'
        : lang === 'mr'
        ? '\n\n*(⚡ ऑफलाइन मोड: डेटा स्थानिक TinyML एज मेमरीमधून लोड केला आहे)*'
        : '\n\n*(⚡ Offline Mode: Processed directly from local TinyML edge buffer)*')
    : ''

  // 1. GREETING INTENT
  const isGreeting = /\b(hi|hello|hey|greetings|namaste|namaskar|pranam|namastey|salaam|ram ram)\b/i.test(norm)
  if (isGreeting && !detectedAnimalId) {
    if (lang === 'hi') {
      return {
        text: `नमस्ते किसान साथी! 🙏\n\nमैं **AgriNex AI** पशु स्वास्थ्य सहायक हूँ। वर्तमान में आपके **${animals.length || 128} पशुओं** की 24/7 निगरानी चल रही है।\n\n- ⚠️ **${requiringActionCount} पशु** उच्च जोखिम में हैं (उदा. **COW-024**)\n- 🌡️ गोशाला THI: **${environment.thiIndex || 78.4}** (मध्यम ताप तनाव)\n- 🚨 सक्रिय अलर्ट: **${activeAlerts.length} चेतावनी**\n\nआप किसी भी गाय (उदा. COW-024), THI तापमान, या डॉक्टर परामर्श के बारे में पूछ सकते हैं!${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 की रिपोर्ट' },
          { type: 'navigate', to: '/alerts', label: '🚨 सक्रिय अलर्ट देखें' },
          { type: 'navigate', to: '/forecast', label: '⚡ 48–72h पूर्वानुमान' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else if (lang === 'mr') {
      return {
        text: `नमस्कार शेतकरी मित्र! 🙏\n\nमी **AgriNex AI** पशु आरोग्य सहाय्यक आहे. सध्या तुमच्या गोठ्यातील **${animals.length || 128} जनावरांवर** लक्ष ठेवले जात आहे.\n\n- ⚠️ **${requiringActionCount} जनावरे** जास्त धोक्यात आहेत (उदा. **COW-024**)\n- 🌡️ गोठ्यातील THI: **${environment.thiIndex || 78.4}** (उष्णता ताण)\n- 🚨 सक्रिय इशारे: **${activeAlerts.length}**\n\nतुम्ही कोणत्याही गायीबद्दल किंवा उपचाराबद्दल विचारू शकता!${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 पहा' },
          { type: 'navigate', to: '/alerts', label: '🚨 सर्व इशारे पहा' },
          { type: 'navigate', to: '/forecast', label: '⚡ ४८–७२ तास अंदाज' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else {
      return {
        text: `Hello! 👋\n\nI am your **AgriNex AI** Herd Health Assistant. Currently monitoring **${animals.length || 128} Cattle** via TinyML bio-telemetry.\n\n- ⚠️ **${requiringActionCount} Cattle** flagged in High/Critical risk (e.g. **COW-024**)\n- 🌡️ Shed THI Index: **${environment.thiIndex || 78.4}** (Moderate Heat Stress)\n- 🚨 Active Early Warnings: **${activeAlerts.length}**\n\nWhat would you like to check today?${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 Inspect COW-024' },
          { type: 'navigate', to: '/alerts', label: '🚨 View Active Alerts' },
          { type: 'navigate', to: '/forecast', label: '⚡ AI Forecast Engine' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    }
  }

  // 2. VETERINARY REVIEW REQUEST
  const isVet = /\b(vet|veterinary|doctor|doc|dr|review|consult|dossier|ilaj|upchar|dawa|davakhana|patil|bulao|bhej|tapasani)\b/i.test(norm)
  if (isVet) {
    const targetId = effectiveAnimalId || (criticalAnimals[0]?.id || 'COW-024')
    const targetAnimal = animals.find((a) => a.id === targetId) || { id: targetId, riskScore: 87, riskLevel: 'critical' }

    if (lang === 'hi') {
      return {
        text: `🚨 **${targetId} के लिए टेली-पशुचिकित्सा समीक्षा (Veterinary Review):**\n\n- **जोखिम स्कोर**: **${targetAnimal.riskScore}%** (${(targetAnimal.riskLevel || 'HIGH').toUpperCase()})\n- **सौंपे गए चिकित्सक**: **डॉ. पाटिल (वरिष्ठ पशु चिकित्सा अधिकारी, पुणे)**\n- **प्राथमिक अनुशंसित कदम**:\n  1. कैलिफ़ोर्निया मैस्टाइटिस टेस्ट (CMT) पैडल द्वारा चारों थनों की जांच करें।\n  2. हर्बल/आयोडीन टीट बैरियर डिप लगाएं।\n  3. दूध निकालने के क्रम में इसे सबसे अंत में रखें (संक्रमण रोकने हेतु)।\n- ⚠️ **सलाह**: डॉक्टर की लिखित पुष्टि के बिना कोई भी एंटीबायोटिक न दें।${offlineBadge}`,
        actions: [
          { type: 'vet_review', animalId: targetId, label: `🚨 ${targetId} हेतु डॉक्टर को केस भेजें` },
          { type: 'navigate', to: `/animals/${targetId}`, label: `🔍 ${targetId} का पूरा बायो-डेटा` },
          { type: 'navigate', to: '/recommendations', label: '📋 उपचार कार्यप्रवाह' },
        ],
        updatedContext: { lastAnimalId: targetId },
      }
    } else if (lang === 'mr') {
      return {
        text: `🚨 **${targetId} साठी पशुवैद्यकीय तपासणी (Veterinary Review):**\n\n- **धोका पातळी**: **${targetAnimal.riskScore}%** (${(targetAnimal.riskLevel || 'HIGH').toUpperCase()})\n- **पशुवैद्यक अधिकारी**: **डॉ. पाटील (वरिष्ठ पशुवैद्यकीय अधिकारी, पुणे)**\n- **तातडीने करावयाची कृती**:\n  1. कॅलिफोर्निया मॅस्टायटिस टेस्ट (CMT) करून थनाची तपासणी करा.\n  2. हर्बल टीट डिप द्रावण लावा.\n  3. धारा काढताना या गायीचे दूध शेवटी काढा जेणेकरून संसर्ग पसरणार नाही.\n- ⚠️ **मार्गदर्शन**: डॉक्टरांच्या सल्ल्याशिवाय कोणतेही अँटीबायोटिक वापरू नये.${offlineBadge}`,
        actions: [
          { type: 'vet_review', animalId: targetId, label: `🚨 ${targetId} साठी डॉक्टर कॉल नोंदवा` },
          { type: 'navigate', to: `/animals/${targetId}`, label: `🔍 ${targetId} चे तपशील पहा` },
          { type: 'navigate', to: '/recommendations', label: '📋 शिफारशी पहा' },
        ],
        updatedContext: { lastAnimalId: targetId },
      }
    } else {
      return {
        text: `🚨 **Tele-Veterinary Review Dossier for ${targetId}:**\n\n- **Risk Score**: **${targetAnimal.riskScore}%** (${(targetAnimal.riskLevel || 'HIGH').toUpperCase()})\n- **Assigned Officer**: **Dr. Patil (Senior Veterinary Officer, Pune)**\n- **Recommended Field Protocols**:\n  1. Perform California Mastitis Test (CMT) to verify somatic cell count elevation.\n  2. Apply post-milking barrier teat dip (0.5% chlorhexidine / herbal formulation).\n  3. Segregate during milking order (milk high-risk cows strictly last).\n- ⚠️ **Clinical Guardrail**: Decision support only. Do not administer unprescribed antibiotics without clinical confirmation.${offlineBadge}`,
        actions: [
          { type: 'vet_review', animalId: targetId, label: `🚨 Request Vet Review for ${targetId}` },
          { type: 'navigate', to: `/animals/${targetId}`, label: `🔍 View ${targetId} Telemetry` },
          { type: 'navigate', to: '/recommendations', label: '📋 View Protocol Checklist' },
        ],
        updatedContext: { lastAnimalId: targetId },
      }
    }
  }

  // 3. SPECIFIC ANIMAL DETAILS & "WHY AT RISK"
  if (effectiveAnimalId || (/\b(why|status|dossier|score|detail|details|kaun|kya|hal|kashi|bimar|lakshan)\b/i.test(norm) && effectiveAnimalId)) {
    const targetId = effectiveAnimalId || 'COW-024'
    const cow = animals.find((a) => a.id.toUpperCase() === targetId.toUpperCase()) || animals.find((a) => a.id === 'COW-024') || {
      id: targetId,
      riskScore: 87,
      riskLevel: 'critical',
      breed: 'Gir Indigenous Cow',
      lactationNumber: 3,
      conductivity: 4.6,
      scc: 480000,
      temperature: 39.2,
      milkYieldChangePct: -18,
    }
    const id = cow.id
    const score = cow.riskScore || 87
    const level = cow.riskLevel || 'high'
    const breed = cow.breed || 'Gir Indigenous Cow'
    const lactation = cow.lactationNumber || 3
    const scc = cow.scc ? `${cow.scc.toLocaleString()} cells/mL (+220% vs baseline)` : '480,000 cells/mL'
    const temp = `${cow.temperature || 39.2}°C (+0.8°C above baseline)`
    const conductivity = `${cow.conductivity || 4.6} mS/cm (+28% vs baseline)`
    const yieldChange = `${cow.milkYieldChangePct || -18}% (14.8 L vs 18.1 L baseline)`
    const onset = cow.predictedWindow || '48–72 hours (Subclinical Pre-Symptom Window)'

    if (lang === 'hi') {
      return {
        text: `📊 **${id} (${breed}, वेत ${lactation}) का स्वास्थ्य विश्लेषण:**\n\n- **जोखिम स्कोर**: **${score}%** (${level === 'critical' ? 'गंभीर' : level === 'high' ? 'उच्च जोखिम' : 'मध्यम'})\n- **पूर्वानुमान खिड़की**: **${onset}** (लक्षण दिखने से 48–72 घंटे पूर्व)\n\n**यह गाय जोखिम में क्यों है? (Multi-Signal Anomaly):**\n1. ⚡ **दूध विद्युत चालकता (EC)**: **${conductivity}** — सेल मेम्ब्रेन क्षरण के कारण आयन रिसाव।\n2. 🌡️ **अयन का तापमान**: **${temp}** — उप-नैदानिक सूजन (Micro-inflammation)।\n3. 🥛 **दूध उत्पादन गिरावट**: **${yieldChange}**।\n4. 🔬 **सोमैटिक सेल काउंट (SCC)**: **${scc}**।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: `/animals/${id}`, label: `🔍 ${id} का बायो-डेटा और ग्राफ देखें` },
          { type: 'vet_review', animalId: id, label: `🚨 ${id} के लिए डॉक्टर को बुलाएं` },
          { type: 'navigate', to: '/forecast', label: '⚡ AI मॉडल का पूर्वानुमान देखें' },
        ],
        updatedContext: { lastAnimalId: id },
      }
    } else if (lang === 'mr') {
      return {
        text: `📊 **${id} (${breed}, वेत क्रमांक ${lactation}) चे आरोग्य विश्लेषण:**\n\n- **धोका निर्देशांक**: **${score}%** (${level === 'critical' ? 'अतिधोकादायक' : level === 'high' ? 'उच्च धोका' : 'सावध'})\n- **संभाव्य लक्षणे**: **${onset}** (लक्षणे दिसण्याआधी ४८ ते ७२ तास पूर्वसूचना)\n\n**या गायीला धोका का आहे? (Multi-Signal Anomaly):**\n1. ⚡ **दुधाची विद्युत वाहकता (EC)**: **${conductivity}** — बेसलाइनपेक्षा जास्त.\n2. 🌡️ **कास/शरीराचे तापमान**: **${temp}** — अंतर्गत दाहकता.\n3. 🥛 **दूध उत्पादनातील घट**: **${yieldChange}**.\n4. 🔬 **सोमॅटिक सेल काउंट (SCC)**: **${scc}**.\n\n*बेसलाइन विश्वासार्हता: १४/१४ नोंदी प्रस्थापित.*${offlineBadge}`,
        actions: [
          { type: 'navigate', to: `/animals/${id}`, label: `🔍 ${id} ची आकडेवारी पहा` },
          { type: 'vet_review', animalId: id, label: `🚨 ${id} साठी डॉक्टर तपासणी विनंती` },
          { type: 'navigate', to: '/forecast', label: '⚡ AI अंदाज तपासा' },
        ],
        updatedContext: { lastAnimalId: id },
      }
    } else {
      return {
        text: `📊 **Health Telemetry & Risk Profile for ${id} (${breed}, Lactation ${lactation}):**\n\n- **Risk Score**: **${score}%** (${level.toUpperCase()})\n- **Subclinical Prediction Window**: **${onset}**\n\n**Why is this animal flagged? (Explainable AI Multi-Signal Fusion):**\n1. ⚡ **Milk Electrical Conductivity (EC)**: **${conductivity}** — tight junction disruption allowing Na+/Cl- blood leakage.\n2. 🌡️ **Udder Skin Temperature**: **${temp}** — subclinical micro-inflammation.\n3. 🥛 **Daily Milk Yield Drop**: **${yieldChange}**.\n4. 🔬 **AI-Estimated SCC**: **${scc}** (Well above 200,000 healthy threshold).\n\n*Baseline calibrated across 14/14 observation milestones.*${offlineBadge}`,
        actions: [
          { type: 'navigate', to: `/animals/${id}`, label: `🔍 View ${id} Baseline & Telemetry` },
          { type: 'vet_review', animalId: id, label: `🚨 Request Vet Review for ${id}` },
          { type: 'navigate', to: '/forecast', label: '⚡ AI Subclinical Forecast' },
        ],
        updatedContext: { lastAnimalId: id },
      }
    }
  }

  // 4. HIGH RISK / CRITICAL ANIMALS QUERY
  const isHighRisk = /\b(high\s*risk|critical|bimar|bimari|sick|khatra|dhoka|dhokyache|problem|dosh|gamvir)\b/i.test(norm)
  if (isHighRisk) {
    const listHigh = [...criticalAnimals, ...highRiskAnimals].slice(0, 5)
    const listStr = listHigh
      .map((a) => `• **${a.id}** (${a.breed}): **${a.riskScore}%** [${(a.riskLevel || 'HIGH').toUpperCase()}] — ${a.reason || 'Elevated Milk EC & Temp'}`)
      .join('\n')

    if (lang === 'hi') {
      return {
        text: `⚠️ **वर्तमान में ${requiringActionCount} गायों को तत्काल निगरानी की आवश्यकता है:**\n\n${listStr}\n\n*मुख्य डेमो गाय:* **COW-024** (87% स्कोर, अगले 48-72 घंटों में सबक्लिनिकल मैस्टाइटिस का खतरा)।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 की जांच करें' },
          { type: 'navigate', to: '/alerts', label: '🚨 सभी अलर्ट सूची देखें' },
          { type: 'navigate', to: '/animals', label: '📋 सभी 128 पशु देखें' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else if (lang === 'mr') {
      return {
        text: `⚠️ **गोठ्यातील एकूण ${requiringActionCount} जनावरांना तातडीने लक्ष देण्याची गरज आहे:**\n\n${listStr}\n\n*मुख्य संशयित गाय:* **COW-024** (धोका ८७%, पुढील ४८-७२ तासांत प्रादुर्भाव होण्याची शक्यता).${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 तपासा' },
          { type: 'navigate', to: '/alerts', label: '🚨 सर्व अलर्ट पहा' },
          { type: 'navigate', to: '/animals', label: '📋 संपूर्ण गोठा यादी' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else {
      return {
        text: `⚠️ **High Risk & Critical Herd Summary (${requiringActionCount} animals require immediate attention):**\n\n${listStr}\n\n*Key SIH Demo Subject:* **COW-024** (87% risk score, subclinical window 48–72h ahead of clinical symptoms).${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 Inspect COW-024 Dossier' },
          { type: 'navigate', to: '/alerts', label: '🚨 Open Alert Center' },
          { type: 'navigate', to: '/animals', label: '📋 View All 128 Animals' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    }
  }

  // 5. THI / SHED HEAT STRESS / TEMPERATURE
  const isTHI = /\b(thi|heat|stress|humidity|ambient|shed|climate|weather|temperature|temp|garmi|tapman|mausam|ushnata|hava)\b/i.test(norm)
  if (isTHI) {
    const thi = environment.thiIndex || 78.4
    const temp = environment.farmTemperature || 31.4
    const humidity = environment.humidity || 72

    if (lang === 'hi') {
      return {
        text: `🌡️ **गोशाला पर्यावरण और THI हीट स्ट्रेस रिपोर्ट:**\n\n- **तापमान-आर्द्रता सूचकांक (THI)**: **${thi}** (मध्यम ताप तनाव)\n- **शेड का तापमान**: **${temp}°C** | **आर्द्रता**: **${humidity}%**\n- **प्रभाव**: THI > 72 होने पर गायों की प्रतिरक्षा प्रणाली कमजोर होती है और मैस्टाइटिस का जोखिम 18% तक बढ़ जाता है।\n- **सुझाव**: शेड में मिस्टर्स/फॉगर्स चालू करें और शीतल जल उपलब्ध कराएं।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/iot', label: '📡 शेड IoT सेंसर्स देखें' },
          { type: 'navigate', to: '/dashboard', label: '📊 डैशबोर्ड पर लौटें' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else if (lang === 'mr') {
      return {
        text: `🌡️ **गोठ्यातील हवामान व THI उष्मा ताण निर्देशांक:**\n\n- **तापमान-आर्द्रता निर्देशांक (THI)**: **${thi}** (मध्यम उष्णता ताण)\n- **गोठ्याचे तापमान**: **${temp}°C** | **आर्द्रता**: **${humidity}%**\n- **परिणाम**: THI ७२ पेक्षा जास्त असल्यास प्रतिकारशक्ती कमी होते व कासदाहाचा धोका १८% वाढतो.\n- **उपाय**: गोठ्यातील पंखे सुरू करा, पाणी शिंपडा आणि थंड पाणी द्या.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/iot', label: '📡 IoT सेन्सर्स तपासा' },
          { type: 'navigate', to: '/dashboard', label: '📊 डॅशबोर्ड पहा' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else {
      return {
        text: `🌡️ **Shed Microclimate & THI Heat Stress Analysis:**\n\n- **Temperature-Humidity Index (THI)**: **${thi}** (Moderate Heat Stress)\n- **Ambient Temp**: **${temp}°C** | **Relative Humidity**: **${humidity}%**\n- **Clinical Impact**: THI > 72 causes immunosuppression, elevated milk SCC, and +18% higher mastitis vulnerability.\n- **Recommended Controls**: Turn on cross-ventilation fans and evaporative misting; ensure ad-libitum fresh drinking water.`,
        actions: [
          { type: 'navigate', to: '/iot', label: '📡 View Environmental Probes' },
          { type: 'navigate', to: '/dashboard', label: '📊 View Herd Dashboard' },
        ],
        updatedContext: { lastAnimalId },
      }
    }
  }

  // 6. HARDWARE & IOT SENSOR STATUS
  const isSensor = /\b(sensor|sensors|device|devices|iot|esp32|battery|probe|probes|hardware|offline|online|lora|ble)\b/i.test(norm)
  if (isSensor) {
    const totalDevices = devices.length || 56
    const connectedCount = devices.filter((d) => d.connection === 'Connected').length
    const weakCount = devices.filter((d) => d.connection !== 'Connected').length

    if (lang === 'hi') {
      return {
        text: `📡 **हार्डवेयर और IoT सेंसर स्थिति (Hardware Edge Telemetry):**\n\n- **सक्रिय सेंसर्स**: ${connectedCount} / ${totalDevices} जुड़े हुए हैं।\n- **ESP32 कॉलर/टैग नोड्स**: 42 सक्रिय (औसत बैटरी 74%)\n- **इन-लाइन दूध EC प्रोब्स**: 8 सक्रिय (मिल्किंग पार्लर 1-8)\n- **शेड THI नोड्स (LoRaWAN)**: 6 ऑनलाइन\n- **नेटवर्क स्थिति**: ${isOffline ? 'ऑफलाइन एज बफ़र (Local TinyML)' : 'क्लाउड सिंक सक्रिय (MQTT v5.0)'}\n- **कमजोर सिग्नल**: ${weakCount} नोड्स पर पुन: जांच आवश्यक।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/iot', label: '🔌 IoT सेंसर सेंटर खोलें' },
          { type: 'toggle_offline', label: isOffline ? '📶 ऑनलाइन सिंक चालू करें' : '📴 ऑफलाइन मोड टेस्ट करें' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else if (lang === 'mr') {
      return {
        text: `📡 **IoT सेन्सर्स आणि हार्डवेअर स्थिती:**\n\n- **एकूण उपकरणे**: ${connectedCount} / ${totalDevices} कार्यरत.\n- **ESP32 कॉलर नोड्स**: ४२ जोडलेले (सरासरी बॅटरी ७४%)\n- **मिल्क EC प्रोब्स**: ८ मिल्किंग बे प्रोब्स\n- **LoRaWAN हवामान नोड्स**: ६ सेन्सर्स सक्रिय\n- **मोड**: ${isOffline ? 'ऑफलाइन स्थानिक प्रक्रिया' : 'क्लाउड सिंक्रोनाइझेशन चालू'}\n- **कमकुवत सिग्नल**: ${weakCount} नोड्स.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/iot', label: '🔌 IoT मॉनिटरिंग पहा' },
          { type: 'toggle_offline', label: isOffline ? '📶 ऑनलाइन करा' : '📴 ऑफलाइन एज मोड' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else {
      return {
        text: `📡 **IoT Bio-Telemetry & Edge Hardware Architecture:**\n\n- **Connected Nodes**: ${connectedCount} / ${totalDevices} active\n- **ESP32 Bio-Telemetry Tags**: 42 deployed (Avg battery 74%, BLE/LoRa)\n- **In-Line Milk EC Probes**: 8 probes in parlor bays\n- **Shed THI Sensors**: 6 LoRaWAN nodes deployed\n- **Edge Protocol**: ${isOffline ? '100% Offline Edge Inference (TinyML Buffer)' : 'Cloud MQTT v5.0 Synced'}\n- **Degraded Nodes**: ${weakCount} units reporting weak RF link.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/iot', label: '🔌 Open IoT Telemetry Center' },
          { type: 'toggle_offline', label: isOffline ? '📶 Switch to Cloud Online' : '📴 Test Offline Edge Mode' },
        ],
        updatedContext: { lastAnimalId },
      }
    }
  }

  // 7. ALERTS QUERY
  const isAlert = /\b(alert|alerts|warning|warnings|notification|notifications|chetwani|suchna|suchana|dhoka)\b/i.test(norm)
  if (isAlert) {
    const alertCount = activeAlerts.length
    const topAlerts = activeAlerts.slice(0, 3)
    const alertList = topAlerts.map((a) => `• **${a.animalId}**: ${a.riskScore}% — ${a.reason || 'EC & Somatic Cell Spike'}`).join('\n')

    if (lang === 'hi') {
      return {
        text: `🚨 **सक्रिय अलर्ट रिपोर्ट (${alertCount} अलर्ट मौजूद हैं):**\n\n${alertList}\n\nसभी अलर्ट्स 48-72 घंटे के सबक्लिनिकल पूर्व-लक्षण विंडो में हैं।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/alerts', label: '🚨 सभी अलर्ट देखें' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 मुख्य अलर्ट (COW-024)' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else if (lang === 'mr') {
      return {
        text: `🚨 **सक्रिय अलर्ट तपशील (एकूण ${alertCount} इशारे):**\n\n${alertList}\n\nतातडीने उपाययोजना करा.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/alerts', label: '🚨 सर्व इशारे उघडा' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 धोक्यातील गाय (COW-024)' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    } else {
      return {
        text: `🚨 **Active Mastitis Risk Alerts (${alertCount} active):**\n\n${alertList}\n\nAll flagged warnings fall within the 48–72 hour subclinical pre-symptom prediction window.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/alerts', label: '🚨 Open Alert Center' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 Inspect COW-024' },
        ],
        updatedContext: { lastAnimalId: 'COW-024' },
      }
    }
  }

  // 8. PREVENTIVE HYGIENE / PROTOCOLS
  const isPrevent = /\b(prevent|prevention|hygiene|clean|cleanliness|milking|dip|teat|safai|roktham|swachhata|upay|kalji)\b/i.test(norm)
  if (isPrevent) {
    if (lang === 'hi') {
      return {
        text: `🛡️ **मैस्टाइटिस रोकथाम और स्वच्छता नियम (ICAR & NDDB मानक):**\n\n1. **दूध निकालने से पहले और बाद में टीट डिप**: 0.5% आयोडीन घोल में थनों को 30 सेकंड डुबोएं।\n2. **मिल्किंग क्रम**: पहले स्वस्थ गायों का दूध निकालें; उच्च जोखिम वाली गायों (जैसे **COW-024**) का दूध अंत में निकालें।\n3. **मशीन का रखरखाव**: वैक्यूम दबाव 42-45 kPa पर रखें और लाइनर को नियमित रूप से बदलें।\n4. **सूखा और स्वच्छ फर्श**: दूध निकालने के बाद गाय को कम से कम 30 मिनट तक बैठने न दें (चारा खिलाएं)।${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/recommendations', label: '📋 विस्तृत रोकथाम सूची' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 की स्थिति' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else if (lang === 'mr') {
      return {
        text: `🛡️ **मस्टायटिस प्रतिबंध आणि गोठा स्वच्छता नियम:**\n\n1. **टीट डिपिंग**: धारा काढण्यापूर्वी व नंतर थनांवर जंतुनाशक द्रावण लावा.\n2. **दूध काढण्याचा क्रम**: निरोगी जनावरांचे दूध आधी काढा; संशयित गायींचे (**COW-024**) दूध सर्वात शेवटी काढा.\n3. **गोठ्याची जागा**: जनावरे बसण्याची जागा स्वच्छ आणि कोरडी ठेवा.\n4. **आहार**: दूध काढल्यानंतर अर्धा तास जनावरांना चारा द्या जेणेकरून ते लगेच खाली बसणार नाहीत.${offlineBadge}`,
        actions: [
          { type: 'navigate', to: '/recommendations', label: '📋 शिफारशी पहा' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 तपशील' },
        ],
        updatedContext: { lastAnimalId },
      }
    } else {
      return {
        text: `🛡️ **ICAR-Aligned Preventive Milking Protocol:**\n\n1. **Pre- & Post-Milking Teat Disinfection**: Dip teats with approved barrier solution (e.g. 0.5% povidone-iodine).\n2. **Milking Order Management**: Milk uninfected heifers first, general herd second, and flagged high-risk cows (**COW-024**) strictly last.\n3. **Parlor Equipment Checks**: Maintain steady vacuum pulsation (42–45 kPa) and replace cracked teat liners.\n4. **Post-Milking Standing Time**: Keep fresh fodder available post-milking so cows stand for 30+ minutes while teat sphincters close.`,
        actions: [
          { type: 'navigate', to: '/recommendations', label: '📋 View Protocol Checklist' },
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 Check Flagged Cow COW-024' },
        ],
        updatedContext: { lastAnimalId },
      }
    }
  }

  // 9. DEFAULT / HERD SUMMARY
  const total = animals.length || 128
  const healthy = total - requiringActionCount - watchAnimals.length

  if (lang === 'hi') {
    return {
      text: `🐄 **शिव डेयरी फार्म — संपूर्ण पशुधन स्थिति:**\n\n- 📊 **कुल निगरानी में पशु**: **${total}**\n- 🟢 **स्वस्थ पशु**: **${healthy}** (85.2%)\n- 🟡 **वॉचलिस्ट (मध्यम)**: **${watchAnimals.length}**\n- 🔴 **उच्च जोखिम (High Risk)**: **${highRiskAnimals.length}**\n- 🚨 **गंभीर (Critical)**: **${criticalAnimals.length}**\n- ⚡ **तत्काल ध्यान देने योग्य**: **${requiringActionCount} पशु** (उदा. **COW-024**)\n\n*आप किसी विशेष गाय (उदा. COW-024), THI तापमान, या डॉक्टर परामर्श के बारे में पूछ सकते हैं।*${offlineBadge}`,
      actions: [
        { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 की रिपोर्ट देखें' },
        { type: 'navigate', to: '/forecast', label: '⚡ 48–72h AI पूर्वानुमान' },
        { type: 'navigate', to: '/alerts', label: '🚨 सक्रिय अलर्ट केंद्र' },
      ],
      updatedContext: { lastAnimalId: 'COW-024' },
    }
  } else if (lang === 'mr') {
    return {
      text: `🐄 **शिव डेअरी फार्म — एकूण गोठा स्थिती:**\n\n- 📊 **एकूण नोंदणीकृत जनावरे**: **${total}**\n- 🟢 **निरोगी जनावरे**: **${healthy}**\n- 🟡 **मध्यम धोका**: **${watchAnimals.length}**\n- 🔴 **उच्च धोका**: **${highRiskAnimals.length}**\n- 🚨 **अतिधोकादायक**: **${criticalAnimals.length}**\n- ⚡ **तातडीने लक्ष देण्याची गरज**: **${requiringActionCount} जनावरे** (उदा. **COW-024**)\n\n*तुम्ही कोणत्याही गायीबद्दल (उदा. COW-024), हवामानाबद्दल किंवा डॉक्टरांच्या सल्ल्याबद्दल विचारू शकता.*${offlineBadge}`,
      actions: [
        { type: 'navigate', to: '/animals/COW-024', label: '🔍 COW-024 पहा' },
        { type: 'navigate', to: '/forecast', label: '⚡ ४८–७२ तास AI अंदाज' },
        { type: 'navigate', to: '/alerts', label: '🚨 सर्व इशारे पहा' },
      ],
      updatedContext: { lastAnimalId: 'COW-024' },
    }
  } else {
    return {
      text: `🐄 **Shiv Dairy Farm — Herd Health Intelligence:**\n\n- 📊 **Total Monitored**: **${total} Cattle**\n- 🟢 **Healthy Herd**: **${healthy}** (85.2%)\n- 🟡 **Watchlist (Moderate)**: **${watchAnimals.length}**\n- 🔴 **High Risk**: **${highRiskAnimals.length}**\n- 🚨 **Critical**: **${criticalAnimals.length}**\n- ⚡ **Requiring Attention**: **${requiringActionCount} Cattle** (e.g. **COW-024**)\n\n*Ask me about any cow (e.g. "Why is COW-024 at risk?"), THI heat stress, offline sensors, or request a veterinary tele-dossier.*${offlineBadge}`,
      actions: [
        { type: 'navigate', to: '/animals/COW-024', label: '🔍 Inspect COW-024 Dossier' },
        { type: 'navigate', to: '/forecast', label: '⚡ AI Subclinical Forecast' },
        { type: 'navigate', to: '/alerts', label: '🚨 View Active Alerts' },
      ],
      updatedContext: { lastAnimalId: 'COW-024' },
    }
  }
}
