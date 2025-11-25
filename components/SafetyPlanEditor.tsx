import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Phone, Ambulance, MapPin, MapPinOff, Grid3X3, Trash2, UserPlus, Check, Save } from 'lucide-react';
import { Button } from './Button';
import { EmergencyContact } from '../types';

interface SafetyPlanEditorProps {
  onExit: () => void;
}

const DEMO_LOCATION = "8 Ave SW, Calgary, AB T2P 1E5";
const DEMO_W3W = "///puzzle.glorious.flick";

export const SafetyPlanEditor: React.FC<SafetyPlanEditorProps> = ({ onExit }) => {
  // Safety Plan State
  const [customMessage, setCustomMessage] = useState("Overdose suspected.");
  const [contactInstruction, setContactInstruction] = useState("Call me first");
  const [includeLocation, setIncludeLocation] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [defaultDuration, setDefaultDuration] = useState<number>(20);

  // Add Contact State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Load Data
  useEffect(() => {
    const savedMessage = localStorage.getItem('haven_custom_message');
    const savedInstruction = localStorage.getItem('haven_contact_instruction');
    const savedContacts = localStorage.getItem('haven_contacts');
    const savedDuration = localStorage.getItem('haven_default_duration');

    if (savedMessage) setCustomMessage(savedMessage);
    if (savedInstruction) {
        setContactInstruction(savedInstruction);
        setIncludeLocation(savedInstruction === "Send help immediately");
    }
    if (savedContacts) {
        try { setContacts(JSON.parse(savedContacts)); } catch(e) {}
    }
    if (savedDuration) setDefaultDuration(parseFloat(savedDuration));
  }, []);

  // Sync Location
  useEffect(() => {
    if (contactInstruction === "Send help immediately") {
        setIncludeLocation(true);
    } else {
        setIncludeLocation(false);
    }
  }, [contactInstruction]);

  const handleSave = () => {
    localStorage.setItem('haven_custom_message', customMessage);
    localStorage.setItem('haven_contact_instruction', contactInstruction);
    localStorage.setItem('haven_contacts', JSON.stringify(contacts));
    localStorage.setItem('haven_default_duration', defaultDuration.toString());
    onExit();
  };

  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: newName.trim(),
        phone: newPhone.trim(),
        relation: 'Trusted Contact'
    };
    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id: string) => {
      setContacts(contacts.filter(c => c.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-warm-50 animate-fade-in">
      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between border-b border-haven-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
            <button onClick={onExit} className="p-2 -ml-2 text-haven-600 hover:bg-haven-50 rounded-full">
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-light text-haven-800">Safety Plan</h1>
        </div>
        <button onClick={handleSave} className="text-haven-600 flex flex-col items-center">
            <Save size={20} />
            <span className="text-[10px] font-bold uppercase mt-1">Save</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-8">
        
        {/* Section 1: Emergency Details */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 space-y-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-haven-400 mb-2">Emergency Response</h3>
            
            {/* Message */}
            <div>
                <div className="flex items-center gap-2 mb-3 text-haven-600">
                    <MessageSquare size={16} />
                    <label className="text-xs uppercase tracking-wider font-bold">Message</label>
                </div>
                <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full bg-haven-50 border-0 rounded-xl p-3 text-sm text-haven-800 placeholder-haven-400 focus:ring-2 focus:ring-haven-200 focus:outline-none resize-none"
                    rows={2}
                />
            </div>

            <div className="h-px bg-haven-50 w-full"></div>

            {/* Instruction */}
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

                {/* Location Status */}
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
                        {includeLocation ? 'Shared' : 'Hidden'}
                    </div>
                </div>
            </div>
        </section>

        {/* Section 2: Contacts */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 space-y-4">
             <h3 className="text-xs uppercase tracking-wider font-bold text-haven-400 mb-2">Who to Notify</h3>
             
             {contacts.length > 0 ? (
                <div className="space-y-2">
                    {contacts.map(contact => (
                        <div key={contact.id} className="bg-haven-50 border border-haven-100 rounded-xl p-3 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-haven-800">{contact.name}</span>
                                <span className="text-xs text-haven-400">{contact.phone}</span>
                            </div>
                            <button 
                                onClick={() => removeContact(contact.id)}
                                className="p-2 bg-white rounded-full text-haven-300 hover:text-rose-500 shadow-sm transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
             ) : (
                 <div className="text-center py-4 text-haven-400 text-sm italic bg-haven-50 rounded-xl border border-dashed border-haven-200">
                     No contacts added.
                 </div>
             )}

             {/* Add Contact */}
             <div className="pt-4 border-t border-haven-50">
                <div className="text-[10px] font-bold uppercase text-haven-400 mb-2">Add New Contact</div>
                <div className="grid grid-cols-5 gap-2">
                    <input 
                        type="text" 
                        placeholder="Name" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="col-span-2 bg-haven-50 border border-haven-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-haven-300 focus:bg-white transition-all"
                    />
                    <input 
                        type="tel" 
                        placeholder="Phone" 
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="col-span-2 bg-haven-50 border border-haven-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-haven-300 focus:bg-white transition-all"
                    />
                    <button 
                        onClick={addContact}
                        disabled={!newName || !newPhone}
                        className="col-span-1 bg-haven-500 text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-haven-600 transition-colors"
                    >
                        <UserPlus size={16} />
                    </button>
                </div>
             </div>
        </section>

        {/* Section 3: Default Timer */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-bold text-haven-400 mb-2">Default Timer Duration</h3>
            <div className="grid grid-cols-4 gap-2">
                 {[5/60, 10, 20, 30].map((val) => {
                     const isSelected = defaultDuration === val;
                     const displayVal = val < 1 ? Math.round(val * 60) : val;
                     const unit = val < 1 ? 'sec' : 'min';
                     
                     return (
                        <button
                            key={val}
                            onClick={() => setDefaultDuration(val)}
                            className={`py-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                                isSelected 
                                    ? 'bg-haven-500 border-haven-500 text-white shadow-md' 
                                    : 'bg-white border-haven-100 text-haven-400 hover:bg-haven-50'
                            }`}
                        >
                            <span className="text-lg font-bold">{displayVal}</span>
                            <span className="text-[10px] uppercase opacity-80">{unit}</span>
                        </button>
                     );
                 })}
            </div>
        </section>

        <Button fullWidth onClick={handleSave} className="h-14 font-medium text-lg mt-4 shadow-lg shadow-haven-200">
            Save Changes
        </Button>

      </div>
    </div>
  );
};