import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, User, ShieldCheck, Search, Building2, Plus } from 'lucide-react';
import { EmergencyContact, AppView } from '../types';
import { Button } from './Button';
import { EscalationSettings } from './EscalationSettings';

interface ContactsManagerProps {
    onNavigate?: (view: AppView) => void;
}

const LOCAL_PROVIDERS = [
  { id: 'p1', name: 'Addiction Helpline (AHS)', phone: '1-866-332-2322', type: 'Helpline' },
  { id: 'p2', name: 'Distress Centre Calgary', phone: '403-266-4357', type: 'Crisis' },
  { id: 'p3', name: 'Safeworks (SCS)', phone: '403-955-6200', type: 'Harm Reduction' },
];

export const ContactsManager: React.FC<ContactsManagerProps> = ({ onNavigate }) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load contacts from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('haven_contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse contacts', e);
      }
    }
  }, []);

  // Save contacts to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('haven_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (name: string, phone: string) => {
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relation: 'Trusted Contact'
    };

    setContacts([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  const filteredProviders = LOCAL_PROVIDERS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.phone.includes(searchQuery) ||
    p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showSettings) {
      return <EscalationSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* Header */}
      <div className="p-6 pt-8 flex items-center justify-between border-b border-haven-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-light text-haven-800">Trusted Contacts</h1>
          <p className="text-sm text-haven-500">Notified only if you need help</p>
        </div>
        <button 
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center text-haven-600 p-2 rounded-lg hover:bg-haven-50"
        >
            <ShieldCheck size={24} />
            <span className="text-[10px] font-bold uppercase tracking-wide mt-1">Plan</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 pt-6">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-haven-400" size={18} />
          <input 
            type="text" 
            placeholder="Search contacts or providers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-haven-100 focus:border-haven-300 rounded-xl pl-10 pr-4 py-3 outline-none transition-all text-haven-800 placeholder-haven-400 text-sm shadow-sm"
          />
        </div>

        {/* Local Providers */}
        {(filteredProviders.length > 0) && (
          <div className="mb-8">
            <h3 className="text-xs text-haven-400 uppercase tracking-wider font-semibold mb-3 ml-1">Verified Local Providers</h3>
            <div className="space-y-3">
              {filteredProviders.map(provider => {
                const isAdded = contacts.some(c => c.name === provider.name);
                return (
                  <div key={provider.id} className="bg-white p-4 rounded-2xl shadow-sm border border-haven-100 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-haven-50 rounded-full flex items-center justify-center text-haven-500">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-haven-800">{provider.name}</h3>
                        <p className="text-sm text-haven-400">{provider.phone} • {provider.type}</p>
                      </div>
                    </div>
                    {!isAdded ? (
                      <button 
                        onClick={() => addContact(provider.name, provider.phone)}
                        className="p-2 text-haven-400 hover:text-haven-600 hover:bg-haven-50 rounded-full transition-colors"
                        title="Add to contacts"
                      >
                        <Plus size={18} />
                      </button>
                    ) : (
                      <span className="text-xs text-haven-400 font-medium px-2">Added</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact List */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs text-haven-400 uppercase tracking-wider font-semibold mb-3 ml-1">My Contacts</h3>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-haven-400 border-2 border-dashed border-haven-100 rounded-2xl bg-white/50">
              <User size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No contacts found.</p>
              {searchQuery ? (
                 <p className="text-xs mt-1 opacity-60">Try a different search.</p>
              ) : (
                 <p className="text-xs mt-1 opacity-60">Add someone you trust.</p>
              )}
            </div>
          ) : (
            filteredContacts.map(contact => (
              <div key={contact.id} className="bg-white p-4 rounded-2xl shadow-sm border border-haven-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-haven-100 rounded-full flex items-center justify-center text-haven-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-haven-800">{contact.name}</h3>
                    <p className="text-sm text-haven-400">{contact.phone}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeContact(contact.id)}
                  className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Contact Form */}
        {!searchQuery && (
          <div className="bg-white p-6 rounded-[32px] shadow-lg shadow-haven-100 border border-haven-50">
            <h3 className="text-lg font-medium text-haven-800 mb-4">Add New Contact</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-haven-400 uppercase tracking-wider font-semibold ml-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Alex (Mentor)"
                  className="w-full mt-1 bg-haven-50 border-transparent focus:bg-white focus:border-haven-300 rounded-xl px-4 py-3 outline-none border transition-all text-haven-800 placeholder-haven-300"
                />
              </div>
              <div>
                <label className="text-xs text-haven-400 uppercase tracking-wider font-semibold ml-1">Phone Number</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g., 555-0123"
                  className="w-full mt-1 bg-haven-50 border-transparent focus:bg-white focus:border-haven-300 rounded-xl px-4 py-3 outline-none border transition-all text-haven-800 placeholder-haven-300"
                />
              </div>
              <Button 
                onClick={() => addContact(newName, newPhone)}
                disabled={!newName || !newPhone}
                fullWidth
                className="mt-4"
              >
                <UserPlus size={18} />
                Add Contact
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};