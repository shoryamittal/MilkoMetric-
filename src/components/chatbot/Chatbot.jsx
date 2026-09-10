import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Bot,
  ArrowRight,
  WifiOff,
  RotateCcw,
  Volume2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { processFarmerQuery } from '../../utils/chatbotEngine.js'

const QUICK_PROMPTS = {
  en: [
    { label: '⚠️ High Risk Cows', query: 'Which animals are at high risk?' },
    { label: '🔍 Why is COW-024 at risk?', query: 'Why is COW-024 at risk?' },
    { label: '🌡️ Shed Heat Stress (THI)', query: 'What is current THI and heat stress?' },
    { label: '📡 Offline Sensors', query: 'Show me sensor health and offline devices' },
    { label: '🚨 Active Alerts', query: 'List active alerts' },
    { label: '🩺 Request Vet Review', query: 'Request veterinary review for COW-024' },
  ],
  hi: [
    { label: '⚠️ उच्च जोखिम गायें', query: 'कौनसी गायें उच्च जोखिम में हैं?' },
    { label: '🔍 COW-024 का हाल', query: 'COW-024 क्यों बीमार हो सकती है?' },
    { label: '🌡️ THI हीट स्ट्रेस', query: 'गोशाला का तापमान और THI कितना है?' },
    { label: '📡 सेंसर स्थिति', query: 'IoT सेंसर्स और बैटरी की स्थिति बताओ' },
    { label: '🚨 सक्रिय अलर्ट', query: 'सक्रिय अलर्ट दिखाओ' },
    { label: '🩺 डॉक्टर परामर्श', query: 'COW-024 के लिए डॉक्टर को बुलाओ' },
  ],
  mr: [
    { label: '⚠️ धोक्यातील गायी', query: 'कोणत्या गायी उच्च धोक्यात आहेत?' },
    { label: '🔍 COW-024 चे विश्लेषण', query: 'COW-024 ला धोका का आहे?' },
    { label: '🌡️ गोठ्यातील तापमान (THI)', query: 'गोठ्यातील THI आणि हवामान काय आहे?' },
    { label: '📡 सेन्सर्स स्थिती', query: 'IoT सेन्सर्स आणि बॅटरी तपासा' },
    { label: '🚨 सक्रिय इशारे', query: 'सक्रिय इशारे दाखवा' },
    { label: '🩺 पशुवैद्यकीय तपासणी', query: 'COW-024 साठी पशुवैद्यक तपासणी विनंती' },
  ],
}

const PLACEHOLDERS = {
  en: 'Ask about herd health, COW-024, THI, alerts...',
  hi: 'पशु स्वास्थ्य, COW-024, THI, या अलर्ट पूछें...',
  mr: 'जनावरांचे आरोग्य, COW-024, THI किंवा अलर्ट विचारा...',
}

export default function Chatbot() {
  const navigate = useNavigate()
  const {
    animals,
    alerts,
    devices = [],
    getSensorHealth,
    getEnvironmentalStatus,
    vetReviews,
    requestVeterinaryReview,
    networkStatus,
    toggleNetworkStatus,
    language,
    auth,
    userInitials,
  } = useApp()

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [lastAnimalId, setLastAnimalId] = useState('COW-024')
  const messagesEndRef = useRef(null)

  const userName = auth.name || (language === 'hi' ? 'किसान साथी' : language === 'mr' ? 'शेतकरी मित्र' : 'Farmer')

  const getGreeting = (lang, name) => {
    if (lang === 'hi') {
      return `नमस्ते **${name}**! 🙏\n\nमैं **AgriNex AI** पशु स्वास्थ्य सहायक हूँ। मैं आपके 128 पशुओं के लाइव डेटा, दूध की विद्युत चालकता (EC), और 48-72 घंटे के प्रारंभिक मैस्टाइटिस पूर्वानुमान में मदद कर सकता हूँ।\n\nआप मुझसे किसी भी गाय, अलर्ट, या तापमान के बारे में पूछ सकते हैं!`
    } else if (lang === 'mr') {
      return `नमस्कार **${name}**! 🙏\n\nमी **AgriNex AI** सहाय्यक आहे. मी तुमच्या गोठ्यातील १२८ जनावरांच्या आरोग्याचे विश्लेषण, दुधाची विद्युत वाहकता आणि ४८-७२ तास आधी मस्टायटिसची पूर्वसूचना देण्यात मदत करतो.\n\nतुम्ही मला थेट प्रश्न विचारू शकता!`
    } else {
      return `Hello **${name}**! 👋\n\nI am your **AgriNex AI** Herd Health Assistant, continuously monitoring 128 cattle with TinyML edge telemetry.\n\nAsk me about high-risk cows, subclinical forecast windows (48–72h), milk electrical conductivity (EC), shed THI, or request an instant tele-veterinary dossier.`
    }
  }

  const [messages, setMessages] = useState(() => [
    {
      id: 'msg-init',
      sender: 'bot',
      text: getGreeting(language, userName),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions: [
        { type: 'navigate', to: '/animals/COW-024', label: '🔍 View Pinned Demo (COW-024)' },
        { type: 'navigate', to: '/forecast', label: '⚡ AI Forecast Engine' },
        { type: 'navigate', to: '/alerts', label: '🚨 Active Alerts' },
      ],
    },
  ])

  // Update initial greeting when language changes if no conversation has started yet
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'msg-init') {
      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: getGreeting(language, userName),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'navigate', to: '/animals/COW-024', label: '🔍 View Pinned Demo (COW-024)' },
            { type: 'navigate', to: '/forecast', label: '⚡ AI Forecast Engine' },
            { type: 'navigate', to: '/alerts', label: '🚨 Active Alerts' },
          ],
        },
      ])
    }
  }, [language, userName])

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen, isTyping])

  const handleSend = (userText) => {
    const textToSend = typeof userText === 'string' ? userText : input
    const trimmed = textToSend.trim()
    if (!trimmed) return

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const liveDevices = getSensorHealth ? getSensorHealth() : devices
    const liveEnv = getEnvironmentalStatus ? getEnvironmentalStatus() : {}

    setTimeout(() => {
      const response = processFarmerQuery(trimmed, {
        animals,
        alerts,
        devices: liveDevices,
        environment: liveEnv,
        vetReviews,
        networkStatus,
        currentLang: language,
        lastAnimalId,
      })

      if (response.updatedContext?.lastAnimalId) {
        setLastAnimalId(response.updatedContext.lastAnimalId)
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        actions: response.actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }

      setMessages((prev) => [...prev, botMsg])
      setIsTyping(false)
    }, 400)
  }

  const handleActionClick = (action) => {
    if (action.type === 'navigate') {
      navigate(action.to)
      setIsOpen(false)
    } else if (action.type === 'vet_review') {
      const animalId = action.animalId || lastAnimalId
      requestVeterinaryReview(animalId, 'Farmer dispatched review via AgriNex AI Chat Assistant')
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'bot',
          text: `✅ **Veterinary Review Request Initiated for ${animalId}**\n\nCase telemetry compiled & queued for **Dr. Patil**. Status transitioned to **UNDER REVIEW**.`,
          actions: [
            { type: 'navigate', to: `/animals/${animalId}`, label: `View ${animalId} Dossier` },
            { type: 'navigate', to: '/recommendations', label: 'View Recommendations' },
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } else if (action.type === 'toggle_offline') {
      toggleNetworkStatus()
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'bot',
        text: getGreeting(language, userName),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { type: 'navigate', to: '/animals/COW-024', label: '🔍 View Pinned Demo (COW-024)' },
          { type: 'navigate', to: '/forecast', label: '⚡ AI Forecast Engine' },
        ],
      },
    ])
  }

  const speakText = (txt) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const clean = txt.replace(/[*#•_-]/g, ' ').replace(/\s+/g, ' ')
      const utterance = new SpeechSynthesisUtterance(clean)
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
      window.speechSynthesis.speak(utterance)
    }
  }

  const quickPromptsList = QUICK_PROMPTS[language] || QUICK_PROMPTS.en

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AgriNex AI Assistant"
        className="fixed bottom-[70px] right-3.5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-pasture-700 text-white shadow-pop transition-all hover:bg-pasture-800 focus:outline-none focus:ring-4 focus:ring-pasture-500/30 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16 sm:z-50 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              <Sparkles size={24} className="text-white drop-shadow sm:hidden" />
              <Sparkles size={26} className="text-white drop-shadow hidden sm:block" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-amber opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal-amber" />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Collapsible Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-x-2 bottom-[68px] sm:inset-auto sm:right-6 sm:bottom-24 z-50 flex h-[580px] max-h-[calc(100vh-84px)] w-auto sm:w-[420px] flex-col overflow-hidden rounded-2xl border border-line bg-canvas-raised shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-ink via-[#17251C] to-ink px-4 py-3 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pasture-700 text-white shadow-inner">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold leading-none text-white">AgriNex AI</h3>
                    <span className="rounded bg-pasture-500/30 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-pasture-300">
                      Assistant
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-white/70">
                    {networkStatus === 'offline' ? (
                      <span className="flex items-center gap-1 text-signal-amber font-medium">
                        <WifiOff size={11} /> TinyML Edge (Offline)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-300 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Live Telemetry Synced
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="Reset conversation"
                  className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4 text-[13px] leading-relaxed no-scrollbar bg-canvas/40">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-md bg-pasture-700 text-white shadow-sm mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`relative group rounded-xl px-3.5 py-2.5 shadow-sm whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-pasture-700 text-white rounded-br-none'
                          : 'bg-canvas-raised border border-line text-ink rounded-bl-none'
                      }`}
                    >
                      <div className="space-y-1">
                        {msg.text.split('\n').map((line, idx) => {
                          if (!line.trim()) return <div key={idx} className="h-1.5" />
                          const parts = line.split(/(\*\*.*?\*\*)/g)
                          return (
                            <p key={idx} className={line.startsWith('•') || line.startsWith('-') ? 'pl-2' : ''}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="font-semibold text-inherit">
                                      {part.slice(2, -2)}
                                    </strong>
                                  )
                                }
                                return part
                              })}
                            </p>
                          )
                        })}
                      </div>

                      {msg.sender === 'bot' && (
                        <button
                          onClick={() => speakText(msg.text)}
                          title="Listen in speech"
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-6 top-2 text-ink-faint hover:text-pasture-700"
                        >
                          <Volume2 size={13} />
                        </button>
                      )}
                    </div>

                    {/* Actionable buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleActionClick(act)}
                            className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all shadow-xs ${
                              act.type === 'vet_review'
                                ? 'border-signal-red/30 bg-signal-redSoft text-signal-red hover:bg-signal-red hover:text-white'
                                : 'border-pasture-600/30 bg-pasture-50 text-pasture-800 hover:bg-pasture-700 hover:text-white'
                            }`}
                          >
                            <span>{act.label}</span>
                            <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    )}

                    <p className={`text-[10px] text-ink-faint ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </p>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-md bg-canvas-sunken border border-line text-ink font-semibold text-xs mt-0.5">
                      {userInitials || 'U'}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-ink-faint">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-pasture-700/80 text-white">
                    <Bot size={15} />
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-line bg-canvas-raised px-3 py-1.5 shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-pasture-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-pasture-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-pasture-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="border-t border-line/60 bg-canvas-sunken/50 px-3 py-2">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {quickPromptsList.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt.query)}
                    className="whitespace-nowrap rounded-full border border-line bg-canvas-raised px-2.5 py-1 text-[11.5px] font-medium text-ink-soft transition-colors hover:border-pasture-500 hover:text-pasture-700 hover:bg-white active:scale-95"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2 border-t border-line bg-canvas-raised p-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={PLACEHOLDERS[language] || PLACEHOLDERS.en}
                className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-pasture-600 focus:outline-none focus:ring-1 focus:ring-pasture-600"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pasture-700 text-white transition-colors hover:bg-pasture-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
