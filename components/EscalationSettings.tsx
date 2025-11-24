import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, MapPin, Phone, MessageSquare, Check, AlertTriangle } from 'lucide-react';
import { AppView, EmergencyContact, EscalationAction, EscalationPlan } from '../types';
import { Button } from './Button';

interface EscalationSettingsProps {
  onBack: () => void;
}

const DEFAULT_PLAN: EscalationPlan = {
  action: EscalationAction.SMS,
  includeLocation: false,
  contactIds: []
};

export const EscalationSettings: React.FC<EscalationSettingsProps> = ({ onBack }) => {
  const [plan, setPlan] = useState<EscalationPlan>(DEFAULT_PLAN);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    // Load contacts
    const savedContacts = localStorage.getItem('haven_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    // Load existing plan
    const savedPlan = localStorage.getItem('haven_escalation_plan');
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
    }
  }, []);

  const savePlan = (newPlan: EscalationPlan) => {
    setPlan(newPlan);
    localStorage.setItem('haven_escalation_plan', JSON.stringify(newPlan));
  };

  const toggleContact = (id: string) => {
    const current = plan.contactIds;
    const updated = current.includes(id)
      ? current.filter(cid => cid !== id)
      : [...current, id];
    savePlan({ ...plan, contactIds: updated });
  };

  return (
    <div className="flex flex-col h-full bg-warm-50 animate-fade-in">
      {/* Header */}
      <div className="p-6 pt-8 flex items-center gap-3 border-b border-haven-100 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-haven-600 hover:bg-haven-50 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-light text-haven-800">Response Plan</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24">
        
        {/* Privacy Notice */}
        <div className="bg-haven-50 border border-haven-100 p-5 rounded-2xl mb-8 flex gap-3 items-start">
          <div className="text-haven-500 mt-0.5">
             <ShieldAlert size={20} />
          </div>
          <div className="text-sm text-haven-700 leading-relaxed">
            <span className="font-semibold block mb-1">Your privacy comes first.</span>
            Your location is <span className="font-semibold">NOT</span> tracked during sessions. It is only accessed if you explicitly choose to share it when triggering an emergency alert.
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Action Selection */}
          <section>
            <h3 className="text-haven-400 uppercase text-xs font-bold tracking-widest mb-4 ml-1">When alert is triggered</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => savePlan({ ...plan, action: EscalationAction.SMS })}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  plan.action === EscalationAction.SMS 
                    ? 'border-haven-500 bg-white text-haven-700 shadow-md' 
                    : 'border-transparent bg-white/50 text-haven-400'
                }`}
              >
                <MessageSquare size={24} />
                <span className="font-medium text-sm">Text Message</span>
              </button>
              <button
                 onClick={() => savePlan({ ...plan, action: EscalationAction.CALL })}
                 className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                  plan.action === EscalationAction.CALL 
                    ? 'border-haven-500 bg-white text-haven-700 shadow-md' 
                    : 'border-transparent bg-white/50 text-haven-400'
                }`}
              >
                <Phone size={24} />
                <span className="font-medium text-sm">Phone Call</span>
              </button>
            </div>
          </section>

          {/* Location Settings */}
          <section>
            <h3 className="text-haven-400 uppercase text-xs font-bold tracking-widest mb-4 ml-1">Data Sharing</h3>
            <div 
                onClick={() => savePlan({ ...plan, includeLocation: !plan.includeLocation })}
                className="bg-white p-4 rounded-2xl border border-haven-100 flex items-center justify-between cursor-pointer hover:border-haven-300 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${plan.includeLocation ? 'bg-haven-100 text-haven-600' : 'bg-gray-50 text-gray-300'}`}>
                        <MapPin size={20} />
                    </div>
                    <div>
                        <div className="font-medium text-haven-800">Include Location Link</div>
                        <div className="text-xs text-haven-500 max-w-[200px]">
                            {plan.includeLocation 
                                ? "A Google Maps link will be added to the message." 
                                : "No location data will be shared."}
                        </div>
                    </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    plan.includeLocation ? 'bg-haven-500 border-haven-500 text-white' : 'border-haven-200 bg-transparent'
                }`}>
                    {plan.includeLocation && <Check size={14} />}
                </div>
            </div>
          </section>

          {/* Contact Selection */}
          <section>
            <h3 className="text-haven-400 uppercase text-xs font-bold tracking-widest mb-4 ml-1">Notify These Contacts</h3>
            <div className="space-y-3">
                {contacts.length === 0 && (
                    <div className="text-center p-4 text-haven-400 text-sm italic">No contacts added yet.</div>
                )}
                {contacts.map(contact => {
                    const isSelected = plan.contactIds.includes(contact.id);
                    return (
                        <div 
                            key={contact.id}
                            onClick={() => toggleContact(contact.id)}
                            className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                                isSelected ? 'bg-white border-haven-500 shadow-sm' : 'bg-white/50 border-transparent opacity-70'
                            }`}
                        >
                            <div className="font-medium text-haven-800">{contact.name}</div>
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-haven-500 border-haven-500 text-white' : 'border-haven-200 bg-transparent'
                            }`}>
                                {isSelected && <Check size={14} />}
                            </div>
                        </div>
                    );
                })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};