import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SessionState, EscalationAction, EscalationPlan, EmergencyContact, AppView, SessionStatus, SessionRecord } from '../types';
import { Button } from './Button';
import { Loader2, AlertTriangle, MapPin, MapPinOff, CheckCircle, MessageSquare, Phone, Ambulance, ArrowLeft, ArrowRight, X, UserPlus, Grid3X3, RefreshCw } from 'lucide-react';

interface SafetySessionProps {
  onExit: () => void;
  onNavigate?: (view: AppView) => void;
}

const CHECK_IN_GRACE_PERIOD = 8; // Seconds to respond before emergency
const DEFAULT_MESSAGE = "Overdose suspected.";
const DEMO_LOCATION = "8 Ave SW, Calgary, AB T2P 1E5";
const DEMO_W3W = "///puzzle.glorious.flick";

export const SafetySession: React.FC<SafetySessionProps> = ({ onExit, onNavigate }) => {
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [graceTimeLeft, setGraceTimeLeft] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Setup Flow State
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  
  // Customization State
  const [customMessage, setCustomMessage] = useState(DEFAULT_MESSAGE);
  const [substance, setSubstance] = useState('');
  const [contactInstruction, setContactInstruction] = useState("Call me first");
  const [includeLocation, setIncludeLocation] = useState(false);
  
  // Emergency Logic State
  const [plan, setPlan] = useState<EscalationPlan | null>(null);
  const [allContacts, setAllContacts] = useState<EmergencyContact[]>([]);
  const [recipients, setRecipients] = useState<EmergencyContact[]>([]);
  const [hasAnyContacts, setHasAnyContacts] = useState(false);
  
  // History Tracking
  const startTimeRef = useRef<number | null>(null);

  // Audio context for generating beeps without external files
  const audioContextRef = useRef<any>(null);

  useEffect(() => {
      // Load plan, contacts, and custom message initially
      const savedPlan = localStorage.getItem('haven_escalation_plan');
      const savedContacts = localStorage.getItem('haven_contacts');
      const savedMessage = localStorage.getItem('haven_custom_message');
      const savedInstruction = localStorage.getItem('haven_contact_instruction');
      
      if (savedPlan) setPlan(JSON.parse(savedPlan));
      if (savedMessage) setCustomMessage(savedMessage);
      if (savedInstruction) setContactInstruction(savedInstruction);
      
      if (savedContacts) {
          try {
              const contactsList: EmergencyContact[] = JSON.parse(savedContacts);
              setAllContacts(contactsList);
              setHasAnyContacts(contactsList.length > 0);
              // Auto-select all contacts by default for the session
              // User can remove them individually if they want for this specific session
              setRecipients(contactsList);
          } catch(e) {
              console.error("Error parsing contacts", e);
              setHasAnyContacts(false);
              setAllContacts([]);
              setRecipients([]);
          }
      } else {
          setHasAnyContacts(false);
          setAllContacts([]);
          setRecipients([]);
      }
  }, []);

  // Save custom message preference
  useEffect(() => {
    localStorage.setItem('haven_custom_message', customMessage);
  }, [customMessage]);

  useEffect(() => {
    localStorage.setItem('haven_contact_instruction', contactInstruction);
  }, [contactInstruction]);

  // Sync Location Privacy with Instruction
  useEffect(() => {
    if (contactInstruction === "Send help immediately") {
        setIncludeLocation(true);
    } else {
        setIncludeLocation(false);
    }
  }, [contactInstruction]);

  const playSound = useCallback((type: 'gentle' | 'alert') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'gentle') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(550, ctx.currentTime + 1); // C#5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } else {
      // Alert sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  }, []);

  const saveSessionHistory = useCallback((status: SessionStatus) => {
    const now = Date.now();
    const start = startTimeRef.current || now;
    const durationSeconds = Math.floor((now - start) / 1000);

    const newRecord: SessionRecord = {
      id: now.toString(),
      timestamp: new Date(now).toISOString(),
      durationSeconds,
      substance: substance || undefined,
      status
    };

    const savedHistory = localStorage.getItem('haven_session_history');
    let historyList: SessionRecord[] = [];
    if (savedHistory) {
      try {
        historyList = JSON.parse(savedHistory);
      } catch (e) {}
    }
    
    // Add new record to start of list
    historyList.unshift(newRecord);
    localStorage.setItem('haven_session_history', JSON.stringify(historyList));
  }, [substance]);

  const removeRecipient = (id: string) => {
    setRecipients(prev => prev.filter(c => c.id !== id));
  };

  const startSession = (minutes: number) => {
    setDurationMinutes(minutes);
    setTimeLeft(Math.round(minutes * 60)); // Ensure integer seconds
    setSessionState(SessionState.RUNNING);
    startTimeRef.current = Date.now();
    playSound('gentle');
  };

  const confirmOkay = () => {
    setTimeLeft(Math.round(durationMinutes * 60)); // Reset to original duration
    setSessionState(SessionState.RUNNING);
    playSound('gentle');
  };

  const extendSession = () => {
    setTimeLeft((prev) => prev + 600); // Add 10 minutes
    playSound('gentle');
  };

  const handleEndSafely = () => {
      saveSessionHistory('SAFE');
      onExit();
  };

  const triggerEmergency = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);
    playSound('alert');
    saveSessionHistory('ALERT');
    
    // Strong vibration for emergency trigger
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([400, 100, 400, 100, 1000]); } catch(e) {}
    }

    // Combine message and instruction
    const substanceText = substance ? ` Substance: ${substance}` : '';
    const fullBody = `${customMessage}${substanceText} (${contactInstruction})`;
    const phones = recipients.map(c => c.phone).join(',');

    const executeAction = (finalBody: string) => {
        let link = '#';
        if (plan?.action === EscalationAction.CALL) {
             link = `tel:${recipients[0]?.phone}`;
        } else {
             link = `sms:${phones}?body=${encodeURIComponent(finalBody)}`;
        }
        
        window.location.href = link;
        
        // Transition to confirmation screen instead of exiting
        setTimeout(() => {
            setIsProcessing(false);
            setSessionState(SessionState.EMERGENCY);
        }, 1500);
    };

    // Use session-specific location preference
    if (includeLocation) {
        // Hardcoded location for demo/MVP as requested
        const locationAddress = DEMO_LOCATION;
        const w3wAddress = DEMO_W3W;
        
        const googleLink = `https://maps.google.com/?q=${encodeURIComponent(locationAddress)}`;
        // w3w links follow format https://w3w.co/word.word.word
        const w3wLink = `https://w3w.co/${w3wAddress.replace('///', '')}`;
        
        // Simulate acquiring location delay
        setTimeout(() => {
             // Append both regular address and w3w address + links
             executeAction(`${fullBody} Location: ${locationAddress} (${w3wAddress}) Maps: ${googleLink} | ${w3wLink}`);
        }, 1500);
    } else {
        executeAction(fullBody);
    }
  }, [plan, recipients, playSound, isProcessing, customMessage, contactInstruction, includeLocation, substance, saveSessionHistory]);

  // Timer Logic
  useEffect(() => {
    let interval: any;

    if (sessionState === SessionState.RUNNING && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (sessionState === SessionState.RUNNING && timeLeft <= 0) {
      setSessionState(SessionState.CHECK_IN);
      setGraceTimeLeft(CHECK_IN_GRACE_PERIOD);
      playSound('alert'); // Initial wake up
      
      // Stronger vibration pattern for timer end: 3 long pulses
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try { navigator.vibrate([500, 200, 500, 200, 500]); } catch(e) {}
      }
    }

    return () => clearInterval(interval);
  }, [sessionState, timeLeft, playSound]);

  // Check-In Grace Period Logic
  useEffect(() => {
    let interval: any;

    if (sessionState === SessionState.CHECK_IN) {
      interval = setInterval(() => {
        setGraceTimeLeft((prev) => {
          if (prev <= 1) {
            triggerEmergency();
            return 0;
          }
           // Vibrate/beep every second during check-in for urgency
           playSound('alert');
           if (typeof navigator !== 'undefined' && navigator.vibrate) {
             try { navigator.vibrate(200); } catch(e) {}
           }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionState, playSound, triggerEmergency]);


  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Render Selection Screen (Two Steps)
  if (sessionState === SessionState.IDLE) {
    if (setupStep === 1) {
        // Step 1: Configuration
        return (
            <div className="flex flex-col h-full p-6 animate-fade-in overflow-y-auto w-full max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6 mt-2">
                    <Button variant="ghost" onClick={onExit} className="p-2 -ml-2 text-haven-400">
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-haven-300 bg-haven-50 px-2 py-1 rounded">Step 1 of 2</div>
                    <div className="w-10"></div>
                </div>

                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-light text-haven-800 tracking-wide">Safety Plan</h2>
                    <p className="text-haven-500 font-light text-sm">
                        Setup your emergency response details.
                    </p>
                </div>

                {/* Message Customization */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 mb-8 space-y-5">
                
                {/* Message Input */}
                <div>
                    <div className="flex items-center gap-2 mb-3 text-haven-600">
                        <MessageSquare size={16} />
                        <label className="text-xs uppercase tracking-wider font-bold">Emergency Message</label>
                    </div>
                    
                    <textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        className="w-full bg-haven-50 border-0 rounded-xl p-3 text-sm text-haven-800 placeholder-haven-400 focus:ring-2 focus:ring-haven-200 focus:outline-none resize-none mb-3"
                        rows={2}
                        placeholder="Enter the message sent to your contacts..."
                    />

                    <input
                        type="text"
                        value={substance}
                        onChange={(e) => setSubstance(e.target.value)}
                        className="w-full bg-haven-50 border-0 rounded-xl p-3 text-sm text-haven-800 placeholder-haven-400 focus:ring-2 focus:ring-haven-200 focus:outline-none"
                        placeholder="Substance used (Optional)"
                    />
                </div>

                <div className="h-px bg-haven-50 w-full"></div>

                {/* Contact Instructions */}
                <div>
                    <label className="text-xs uppercase tracking-wider font-bold text-haven-600 mb-3 block">Instruction</label>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button 
                            onClick={() => setContactInstruction("Call me first")}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${contactInstruction === "Call me first" ? 'bg-haven-500 border-haven-500 text-white shadow-md' : 'bg-white border-haven-100 text-haven-400 hover:bg-haven-50'}`}
                        >
                            <Phone size={18} />
                            <span className="text-xs font-medium">Call Me First</span>
                        </button>
                        <button 
                            onClick={() => setContactInstruction("Send help immediately")}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${contactInstruction === "Send help immediately" ? 'bg-rose-500 border-rose-500 text-white shadow-md' : 'bg-white border-haven-100 text-haven-400 hover:bg-haven-50'}`}
                        >
                            <Ambulance size={18} />
                            <span className="text-xs font-medium">Send Help</span>
                        </button>
                    </div>
                    
                    {/* Location Privacy Status Bar */}
                    <div className={`rounded-xl px-4 py-3 flex items-start justify-between gap-2 transition-colors ${includeLocation ? 'bg-orange-50 border border-orange-100' : 'bg-haven-50 border border-haven-100'}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {includeLocation ? (
                                <MapPin size={16} className="text-orange-500 shrink-0 mt-0.5" />
                            ) : (
                                <MapPinOff size={16} className="text-haven-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className={`text-xs font-bold uppercase tracking-wider leading-relaxed ${includeLocation ? 'text-orange-600' : 'text-haven-600'}`}>
                                    {includeLocation ? DEMO_LOCATION : 'Location: Unknown'}
                                </div>
                                {includeLocation && (
                                    <div className="flex items-center gap-1 text-[10px] text-orange-400 font-medium">
                                        <Grid3X3 size={10} />
                                        <span>{DEMO_W3W}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`text-[10px] font-medium shrink-0 pt-0.5 ${includeLocation ? 'text-orange-400' : 'text-haven-400'}`}>
                            {includeLocation ? 'Shared with Alert' : 'Not Shared'}
                        </div>
                    </div>
                    
                    {/* Recipients Section */}
                     <div className="mt-5 pt-4 border-t border-haven-50">
                        <label className="text-xs uppercase tracking-wider font-bold text-haven-600 mb-3 block">Who to notify</label>
                        {recipients.length === 0 ? (
                            hasAnyContacts ? (
                                <div className="space-y-3">
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-medium">No contacts selected</span>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full text-xs h-10 border-haven-200 text-haven-600"
                                        onClick={() => setRecipients(allContacts)}
                                    >
                                        <RefreshCw size={14} className="mr-1" />
                                        Restore All Contacts
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-sm flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        <span className="text-xs font-medium">No contacts found</span>
                                    </div>
                                    <Button 
                                        variant="secondary" 
                                        className="w-full text-xs h-10 border-haven-200 text-haven-600"
                                        onClick={() => onNavigate && onNavigate(AppView.CONTACTS)}
                                    >
                                        <UserPlus size={14} className="mr-1" />
                                        Add Trusted Contact
                                    </Button>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {recipients.map(contact => (
                                    <div key={contact.id} className="bg-white border border-haven-200 rounded-full pl-3 pr-1 py-1.5 flex items-center gap-2 shadow-sm">
                                        <span className="text-xs font-medium text-haven-700 max-w-[120px] truncate">{contact.name}</span>
                                        <button 
                                            onClick={() => removeRecipient(contact.id)}
                                            className="p-0.5 hover:bg-haven-50 rounded-full text-haven-400 hover:text-rose-500 transition-colors"
                                            title="Remove contact from this session"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                </div>

                <div className="mt-auto pb-8">
                    <Button 
                        fullWidth 
                        onClick={() => setSetupStep(2)} 
                        className="h-14 text-lg"
                        disabled={recipients.length === 0}
                    >
                        Next: Set Timer
                        <ArrowRight size={20} />
                    </Button>
                </div>
            </div>
        );
    } else {
        // Step 2: Timer Selection
        return (
             <div className="flex flex-col h-full p-6 animate-fade-in overflow-y-auto w-full max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6 mt-2">
                    <Button variant="ghost" onClick={() => setSetupStep(1)} className="p-2 -ml-2 text-haven-600">
                        <ArrowLeft size={24} />
                    </Button>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-haven-300 bg-haven-50 px-2 py-1 rounded">Step 2 of 2</div>
                    <div className="w-10"></div>
                </div>

                <div className="text-center space-y-2 mt-4 mb-12">
                    <h2 className="text-3xl font-light text-haven-800 tracking-wide">Set Timer</h2>
                    <p className="text-haven-500 font-light text-sm">
                        We'll check on you when the time is up.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Dev Option: 5 Seconds */}
                <button
                    onClick={() => startSession(5 / 60)}
                    className="flex flex-col items-center justify-center py-6 rounded-2xl bg-white text-haven-600 hover:bg-haven-50 transition-all border border-transparent hover:border-haven-100 shadow-sm"
                >
                    <span className="text-4xl font-light mb-1">5</span>
                    <span className="text-sm uppercase tracking-widest opacity-60">sec</span>
                </button>

                {/* Standard Options */}
                {[10, 20, 30].map((min) => (
                    <button
                    key={min}
                    onClick={() => startSession(min)}
                    className="flex flex-col items-center justify-center py-6 rounded-2xl bg-white text-haven-600 hover:bg-haven-50 transition-all border border-transparent hover:border-haven-100 shadow-sm"
                    >
                    <span className="text-4xl font-light mb-1">{min}</span>
                    <span className="text-sm uppercase tracking-widest opacity-60">min</span>
                    </button>
                ))}
                </div>

                <div className="mt-auto flex justify-center pb-8">
                    <Button 
                    variant="ghost"
                    onClick={onExit} 
                    className="text-haven-400 hover:text-haven-600 font-medium tracking-wide"
                    >
                    Cancel Session
                    </Button>
                </div>
            </div>
        );
    }
  }

  // Render Confirmation Screen (After Emergency Triggered)
  if (sessionState === SessionState.EMERGENCY) {
      return (
        <div className="flex flex-col h-full items-center justify-center p-8 bg-white animate-fade-in relative">
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
                <div className="w-24 h-24 bg-haven-50 rounded-full flex items-center justify-center mb-8 text-haven-500 shadow-sm animate-pulse-slow">
                    <CheckCircle size={48} strokeWidth={2} />
                </div>
                
                <h2 className="text-3xl font-light text-haven-800 mb-4 tracking-wide">Alert Sent</h2>
                <p className="text-haven-500 text-center text-lg max-w-xs mb-8 leading-relaxed">
                    Your trusted contacts have been notified.
                </p>

                {/* Data Summary */}
                <div className="bg-haven-50 p-6 rounded-2xl w-full max-w-xs text-left mb-8 border border-haven-100/50">
                    <div className="text-xs text-haven-400 uppercase tracking-widest font-bold mb-3">Data Sent</div>
                    <div className="space-y-2">
                        <div className="text-haven-700 text-sm">
                            <span className="font-medium text-haven-800">To:</span> {recipients.length > 0 ? recipients.map(c => c.name).join(', ') : 'No specific contacts'}
                        </div>
                        <div className="text-haven-700 text-sm">
                            <span className="font-medium text-haven-800">Message:</span> "{customMessage}{substance ? ` Substance: ${substance}` : ''} ({contactInstruction})"
                        </div>
                        <div className="text-haven-700 text-sm flex flex-col gap-1 mt-1">
                            {includeLocation ? (
                                <>
                                    <div className="flex items-center gap-1">
                                        <MapPin size={12} className="text-orange-500" />
                                        <span className="font-medium text-haven-800">Location Link Included</span>
                                    </div>
                                    <div className="flex items-center gap-1 ml-4 text-[10px] text-haven-500">
                                        <Grid3X3 size={10} />
                                        <span className="font-mono">{DEMO_W3W}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <MapPinOff size={12} className="text-haven-400" />
                                    <span className="font-medium text-haven-400">Location Unknown (Safe)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Button 
                    variant="secondary" 
                    onClick={handleEndSafely} // Used to exit from emergency screen, effectively ending the session flow
                    className="w-full max-w-xs h-14 font-medium border-haven-200 text-haven-600 hover:bg-haven-50"
                >
                    Return to Home
                </Button>
            </div>
        </div>
      );
  }

  // Render Active Session (Running or Check In)
  const isCheckIn = sessionState === SessionState.CHECK_IN;

  return (
    <div className={`flex flex-col h-full transition-colors duration-1000 ${isCheckIn ? 'bg-orange-50' : 'bg-gradient-to-b from-haven-50 to-white'} relative`}>
      
      {/* Loading Overlay for Emergency Trigger */}
      {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center flex-col gap-4 animate-fade-in">
              <div className="p-4 bg-rose-50 rounded-full animate-pulse">
                <AlertTriangle className="text-rose-500 w-12 h-12" />
              </div>
              <div className="text-rose-600 font-medium text-lg">Activating Safety Plan...</div>
              {includeLocation && (
                  <div className="flex items-center gap-2 text-rose-400 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      Acquiring location & w3w
                  </div>
              )}
          </div>
      )}

      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-lg mx-auto">
        
        {/* Helper Note - Only show when not in check-in */}
        {!isCheckIn && (
           <div className="text-haven-500 font-medium text-lg animate-fade-in mb-8">
             We'll check in with you soon
           </div>
        )}

        {/* Alert Preview during Check-in */}
        {isCheckIn && (
            <div className="absolute top-8 w-full max-w-xs px-4 z-20 animate-fade-in">
                 <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-orange-100 border border-orange-200">
                    <div className="flex items-center gap-2 mb-2 text-orange-600">
                        <AlertTriangle size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Sending Alert In...</span>
                    </div>
                    <p className="text-sm text-gray-600 italic leading-snug mb-2">
                        "{customMessage}{substance ? ` Substance: ${substance}` : ''} ({contactInstruction})"
                    </p>
                    <div className="text-xs text-orange-400 font-medium flex items-center gap-1 justify-between">
                        <div>To: <span className="truncate">{recipients.length > 0 ? recipients.map(c => c.name).join(', ') : 'Contacts'}</span></div>
                        {includeLocation && <MapPin size={12} />}
                    </div>
                 </div>
            </div>
        )}

        {/* Pulsation Animation - Breathing Rhythm */}
        <div className="relative flex items-center justify-center w-80 h-80">
            {/* Outer Ring */}
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                isCheckIn ? 'bg-orange-200 animate-ping opacity-20' : 'bg-haven-300 animate-breathe opacity-20'
            }`}></div>
            
            {/* Inner Ring */}
            <div className={`absolute inset-4 rounded-full transition-all duration-1000 ${
                isCheckIn ? 'bg-orange-300 animate-pulse opacity-30' : 'bg-haven-200 animate-breathe opacity-30'
            }`}></div>
            
            {/* Center Content */}
            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full w-full">
                <div className={`text-6xl font-light tabular-nums tracking-tighter transition-colors duration-300 ${isCheckIn ? 'text-orange-600' : 'text-haven-700'}`}>
                    {isCheckIn ? formatTime(graceTimeLeft) : formatTime(timeLeft)}
                </div>
                <p className={`mt-4 text-sm font-medium uppercase tracking-widest ${isCheckIn ? 'text-orange-500 animate-bounce' : 'text-haven-400'}`}>
                    {isCheckIn ? 'Are you okay?' : 'Monitoring Active'}
                </p>
            </div>
        </div>
      </div>

      {/* Action Area - Clean Design without Card Background */}
      <div className="p-6 pb-12 w-full max-w-md mx-auto space-y-4">
        
        {/* Primary Actions Group */}
        <div className="grid grid-cols-3 gap-3">
             <Button 
                variant="secondary" 
                className="col-span-1 h-14 text-haven-600 border-haven-200 font-medium"
                onClick={extendSession}
                disabled={isProcessing}
            >
                +10 Min
            </Button>
            <Button 
                variant="primary" 
                className={`col-span-2 h-14 text-lg font-medium shadow-xl shadow-haven-200/50 transition-all ${isCheckIn ? 'bg-orange-500 hover:bg-orange-600' : 'bg-haven-500 hover:bg-haven-600'}`}
                onClick={confirmOkay}
                disabled={isProcessing}
            >
                I'm OK
            </Button>
        </div>

        {/* Safety Actions */}
        <div className="space-y-4 mt-6">
             <Button 
                variant="danger"
                className="w-full h-14 font-semibold tracking-wide"
                onClick={triggerEmergency}
                disabled={isProcessing}
            >
                {isProcessing ? 'Activating...' : 'Send Emergency Alert Now'}
             </Button>

             <Button 
                variant="ghost"
                onClick={handleEndSafely}
                className="w-full h-12 text-sm text-haven-400 hover:text-haven-600"
                disabled={isProcessing}
            >
                End Session Safely
             </Button>
        </div>
      </div>
    </div>
  );
};