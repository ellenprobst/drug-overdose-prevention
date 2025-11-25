import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Lock, Check, MessageSquare, Phone, Ambulance, MapPin, MapPinOff, Grid3X3, ClipboardList, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from './Button';
import { EmergencyContact } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

const DEMO_LOCATION = "8 Ave SW, Calgary, AB T2P 1E5";
const DEMO_W3W = "///puzzle.glorious.flick";

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Safety Plan State
  const [customMessage, setCustomMessage] = useState("Overdose suspected.");
  const [contactInstruction, setContactInstruction] = useState("Call me first");
  const [includeLocation, setIncludeLocation] = useState(false);
  
  // Contacts State
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load contacts
  useEffect(() => {
    const saved = localStorage.getItem('haven_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load contacts", e);
      }
    }
  }, []);

  // Sync Location Privacy with Instruction
  useEffect(() => {
    if (contactInstruction === "Send help immediately") {
        setIncludeLocation(true);
    } else {
        setIncludeLocation(false);
    }
  }, [contactInstruction]);

  const slides = [
    {
      id: 1,
      icon: ShieldCheck,
      title: "You're always in control",
      message: "This app works on your terms. You choose what to share, when, and who with. Nothing happens without your consent.",
      points: [
        "You decide who gets notified",
        "You can turn features on or off anytime",
        "You can change your mind whenever you want"
      ]
    },
    {
      id: 2,
      icon: Lock,
      title: "Built for Privacy",
      message: "Your privacy is the foundation. We collect only what’s necessary to support you.",
      points: [
        "Minimal data collection",
        "Your data stays on your device",
        "Clear signals when location is being used"
      ]
    },
    {
      id: 3,
      icon: ClipboardList,
      title: "Create Your Safety Plan",
      message: "We recommend setting up your emergency preferences now so you're ready if you ever need help.",
      points: [
        "Customize your emergency message",
        "Choose how contacts are notified",
        "Set location privacy preferences"
      ]
    }
  ];

  const handleNext = () => {
    setCurrentSlide(prev => prev + 1);
  };

  const handleSavePlan = () => {
    // Save preferences
    localStorage.setItem('haven_custom_message', customMessage);
    localStorage.setItem('haven_contact_instruction', contactInstruction);
    setCurrentSlide(4); // Go to Timer step
  };
  
  const handleSelectTimer = (minutes: number) => {
      // Optionally save default duration
      localStorage.setItem('haven_default_duration', minutes.toString());
      onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    
    const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: newName.trim(),
        phone: newPhone.trim(),
        relation: 'Trusted Contact'
    };
    
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    localStorage.setItem('haven_contacts', JSON.stringify(updatedContacts));
    
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id: string) => {
      const updated = contacts.filter(c => c.id !== id);
      setContacts(updated);
      localStorage.setItem('haven_contacts', JSON.stringify(updated));
  };

  // Render Setup Step (Step 4 / Index 3)
  if (currentSlide === 3) {
    return (
      <div className="h-full w-full bg-warm-50 flex flex-col p-6 animate-fade-in relative overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pt-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-haven-300 bg-haven-50 px-2 py-1 rounded">Step 1 of 2</div>
            <button 
                onClick={handleSkip}
                className="text-haven-400 text-sm font-medium hover:text-haven-600 transition-colors"
            >
                Skip
            </button>
        </div>

        <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-light text-haven-800 tracking-wide">Safety Plan</h2>
            <p className="text-haven-500 font-light text-sm">
                Preset your emergency details. You can change this anytime.
            </p>
        </div>

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
                    className="w-full bg-haven-50 border-0 rounded-xl p-3 text-sm text-haven-800 placeholder-haven-400 focus:ring-2 focus:ring-haven-200 focus:outline-none resize-none"
                    rows={2}
                    placeholder="Enter the message sent to your contacts..."
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
            </div>

             <div className="h-px bg-haven-50 w-full"></div>

             {/* Add Contact Section */}
             <div>
                <label className="text-xs uppercase tracking-wider font-bold text-haven-600 mb-3 block">Who to notify</label>
                
                {/* Existing Contacts List */}
                {contacts.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {contacts.map(contact => (
                            <div key={contact.id} className="bg-haven-50 border border-haven-100 rounded-full pl-3 pr-1 py-1.5 flex items-center gap-2">
                                <span className="text-xs font-medium text-haven-700">{contact.name}</span>
                                <button 
                                    onClick={() => removeContact(contact.id)}
                                    className="p-1 hover:bg-white rounded-full text-haven-400 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add New Contact Form */}
                <div className="bg-haven-50/50 rounded-xl p-3 border border-haven-100">
                    <div className="text-[10px] font-bold uppercase text-haven-400 mb-2">Add New Contact</div>
                    <div className="grid grid-cols-5 gap-2">
                        <input 
                            type="text" 
                            placeholder="Name" 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-2 bg-white border border-haven-100 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-haven-300"
                        />
                        <input 
                            type="tel" 
                            placeholder="Phone" 
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            className="col-span-2 bg-white border border-haven-100 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-haven-300"
                        />
                        <button 
                            onClick={addContact}
                            disabled={!newName || !newPhone}
                            className="col-span-1 bg-haven-500 text-white rounded-lg flex items-center justify-center disabled:opacity-50"
                        >
                            <UserPlus size={16} />
                        </button>
                    </div>
                </div>
             </div>
        </div>

        <div className="mt-auto pb-4">
            <Button 
                fullWidth 
                onClick={handleSavePlan} 
                className="h-14 text-lg"
            >
                Next: Set Timer
                <ArrowRight size={20} />
            </Button>
        </div>
      </div>
    );
  }

  // Render Step 5 (Timer Selection)
  if (currentSlide === 4) {
      return (
        <div className="h-full w-full bg-warm-50 flex flex-col p-6 animate-fade-in relative overflow-y-auto">
            <div className="flex items-center justify-between mb-6 mt-2">
                <Button variant="ghost" onClick={() => setCurrentSlide(3)} className="p-2 -ml-2 text-haven-600">
                    <ArrowLeft size={24} />
                </Button>
                <div className="text-[10px] font-bold uppercase tracking-widest text-haven-300 bg-haven-50 px-2 py-1 rounded">Step 2 of 2</div>
                <div className="w-10"></div>
            </div>

            <div className="text-center space-y-2 mt-4 mb-12">
                <h2 className="text-3xl font-light text-haven-800 tracking-wide">Set Default Timer</h2>
                <p className="text-haven-500 font-light text-sm">
                    Choose a starting duration. You can adjust this for every session.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Dev Option: 5 Seconds */}
                <button
                    onClick={() => handleSelectTimer(5 / 60)}
                    className="flex flex-col items-center justify-center py-6 rounded-2xl bg-white text-haven-600 hover:bg-haven-50 transition-all border border-transparent hover:border-haven-100 shadow-sm"
                >
                    <span className="text-4xl font-light mb-1">5</span>
                    <span className="text-sm uppercase tracking-widest opacity-60">sec</span>
                </button>

                {/* Standard Options */}
                {[10, 20, 30].map((min) => (
                    <button
                    key={min}
                    onClick={() => handleSelectTimer(min)}
                    className="flex flex-col items-center justify-center py-6 rounded-2xl bg-white text-haven-600 hover:bg-haven-50 transition-all border border-transparent hover:border-haven-100 shadow-sm"
                    >
                    <span className="text-4xl font-light mb-1">{min}</span>
                    <span className="text-sm uppercase tracking-widest opacity-60">min</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto pb-4">
                 <button 
                    onClick={() => handleSelectTimer(20)}
                    className="w-full py-4 text-haven-400 font-medium hover:text-haven-600 transition-colors"
                >
                    Skip & Use Default (20 min)
                </button>
            </div>
        </div>
      );
  }

  // Render Slides 0, 1, 2
  const CurrentIcon = slides[currentSlide].icon;
  const isIntroToPlan = currentSlide === 2;

  return (
    <div className="h-full w-full bg-warm-50 flex flex-col items-center justify-center p-8 animate-fade-in relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-haven-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-haven-100/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

      <div className="z-10 w-full max-w-md flex flex-col h-full justify-between py-8">
        
        {/* Progress Indicators */}
        <div className="flex gap-2 justify-center pt-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <div 
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-haven-500' : 'w-2 bg-haven-200'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center text-center justify-center space-y-8">
          <div className="w-24 h-24 bg-white rounded-full shadow-lg shadow-haven-100 flex items-center justify-center text-haven-500 mb-4 transition-all duration-500 ease-out transform">
             <CurrentIcon size={48} strokeWidth={1.5} />
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-light text-haven-800 tracking-wide transition-all duration-300">
              {slides[currentSlide].title}
            </h1>
            <p className="text-haven-600 leading-relaxed text-lg font-light max-w-xs mx-auto">
              {slides[currentSlide].message}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 w-full shadow-sm border border-white/50 text-left space-y-3">
            {slides[currentSlide].points.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 text-haven-700 animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="mt-0.5 min-w-[18px] text-haven-400">
                  <Check size={18} />
                </div>
                <span className="text-sm font-medium">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-8 space-y-3">
          <Button 
            onClick={handleNext}
            fullWidth
            className="h-14 text-lg shadow-xl shadow-haven-200/50"
          >
            {isIntroToPlan ? 'Create Safety Plan' : 'Next'}
            <ArrowRight size={20} className="opacity-80" />
          </Button>

          {isIntroToPlan && (
            <button 
              onClick={handleSkip}
              className="w-full py-3 text-haven-400 font-medium hover:text-haven-600 transition-colors text-sm"
            >
              Skip for now
            </button>
          )}
        </div>

      </div>
    </div>
  );
};