import React, { useState } from 'react';
import { Search, MapPin, Phone, ExternalLink, Filter } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  category: 'Emergency' | 'Harm Reduction' | 'Mental Health' | 'Recovery' | 'Safe Injection';
  description: string;
  phone?: string;
  address?: string;
  city: string;
  postalCode?: string; // First 3 digits for loose matching
  website?: string;
}

// Mock Data for Alberta
const ALBERTA_RESOURCES: Resource[] = [
  {
    id: '1',
    name: 'Addiction Helpline (AHS)',
    category: 'Emergency',
    description: '24/7 confidential service that provides support, information and referrals to Albertans experiencing addiction concerns.',
    phone: '1-866-332-2322',
    city: 'Alberta Wide',
    website: 'https://www.albertahealthservices.ca'
  },
  {
    id: '3',
    name: 'Safeworks (Sheldon M. Chumir)',
    category: 'Safe Injection',
    description: '24/7 Supervised Consumption Services (SCS) providing a safe, clean environment for drug use under medical supervision.',
    address: '1213 4 St SW',
    city: 'Calgary',
    postalCode: 'T2R',
    phone: '403-955-6200'
  },
  {
    id: '10',
    name: 'George Spady Society',
    category: 'Safe Injection',
    description: 'Supervised Consumption Services offering a safe space and health services for individuals using substances.',
    address: '10015 105A Ave NW',
    city: 'Edmonton',
    postalCode: 'T5H',
    phone: '780-424-8335'
  },
  {
    id: '11',
    name: 'Red Deer Overdose Prevention Site',
    category: 'Safe Injection',
    description: 'Overdose prevention services providing supervised consumption, harm reduction supplies, and referrals.',
    address: '5246 53 Ave',
    city: 'Red Deer',
    postalCode: 'T4N',
    phone: '403-342-8600'
  },
  {
    id: '12',
    name: 'Boyle Street Community Services',
    category: 'Safe Injection',
    description: 'Community-based supervised consumption and harm reduction services.',
    address: '10116 105 Ave NW',
    city: 'Edmonton',
    postalCode: 'T5H',
    phone: '780-424-4106'
  },
  {
    id: '5',
    name: 'Streetworks',
    category: 'Harm Reduction',
    description: 'Needle exchange program, naloxone kits, and safer use education for Edmonton and area.',
    address: '10116 105 Ave NW',
    city: 'Edmonton',
    postalCode: 'T5H',
    phone: '780-424-4106'
  },
  {
    id: '2',
    name: 'Virtual Opioid Dependency Program',
    category: 'Recovery',
    description: 'Same-day access to addiction medicine physicians and treatment medication anywhere in Alberta.',
    phone: '1-844-383-7688',
    city: 'Alberta Wide',
    website: 'https://vodp.ca'
  },
  {
    id: '4',
    name: 'The Alex Community Health Centre',
    category: 'Mental Health',
    description: 'Holistic care including physical and mental health supports for vulnerable Calgarians.',
    address: '2840 2 Ave SE',
    city: 'Calgary',
    postalCode: 'T2A',
    phone: '403-266-2628'
  },
  {
    id: '6',
    name: 'Distress Centre Calgary',
    category: 'Mental Health',
    description: '24-hour crisis support and professional counselling.',
    phone: '403-266-4357',
    city: 'Calgary',
    postalCode: 'T2P'
  },
  {
    id: '7',
    name: 'Access 24/7',
    category: 'Emergency',
    description: 'Single point of access for adult addiction and mental health services in Edmonton.',
    address: '10959 102 St NW',
    city: 'Edmonton',
    postalCode: 'T5H',
    phone: '780-424-2424'
  },
  {
    id: '8',
    name: 'ARCHES Lethbridge',
    category: 'Harm Reduction',
    description: 'Harm reduction, outreach, and housing support.',
    address: '1016 1 Ave S',
    city: 'Lethbridge',
    postalCode: 'T1J',
    phone: '403-328-8186'
  },
  {
    id: '9',
    name: 'Red Deer Regional Hospital - Addiction',
    category: 'Recovery',
    description: 'Detox and stabilization services.',
    address: '3942 50A Ave',
    city: 'Red Deer',
    postalCode: 'T4N',
    phone: '403-342-8600'
  }
];

const CATEGORIES = ['All', 'Emergency', 'Safe Injection', 'Harm Reduction', 'Mental Health', 'Recovery'];

export const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredResources = ALBERTA_RESOURCES.filter(resource => {
    const matchesSearch = 
      resource.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.postalCode && resource.postalCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Emergency': return 'bg-rose-50 text-rose-500';
      case 'Safe Injection': return 'bg-orange-50 text-orange-600';
      case 'Harm Reduction': return 'bg-blue-50 text-blue-500';
      case 'Recovery': return 'bg-teal-50 text-teal-600';
      default: return 'bg-haven-50 text-haven-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-warm-50">
      {/* Header */}
      <div className="p-6 pt-8 bg-white border-b border-haven-100 sticky top-0 z-10">
        <h1 className="text-2xl font-light text-haven-800">Resources</h1>
        <p className="text-sm text-haven-500">Support services in Alberta</p>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-haven-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by City or Postal Code (e.g. T2R)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-haven-50 border-transparent focus:bg-white focus:border-haven-300 rounded-xl pl-10 pr-4 py-3 outline-none border transition-all text-haven-800 placeholder-haven-400 text-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-haven-600 text-white' 
                  : 'bg-haven-50 text-haven-600 border border-haven-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Filter className="mx-auto mb-2" size={32} />
            <p>No resources found.</p>
          </div>
        ) : (
          filteredResources.map(resource => (
            <div key={resource.id} className="bg-white p-5 rounded-2xl shadow-sm border border-haven-100 hover:border-haven-200 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block ${getCategoryColor(resource.category)}`}>
                    {resource.category}
                  </span>
                  <h3 className="font-medium text-haven-900 text-lg">{resource.name}</h3>
                </div>
              </div>
              
              <p className="text-sm text-haven-600 mb-4 leading-relaxed">{resource.description}</p>
              
              <div className="space-y-2 mb-4">
                {resource.address && (
                  <div className="flex items-center gap-2 text-sm text-haven-500">
                    <MapPin size={16} className="text-haven-400 shrink-0" />
                    <span>{resource.address}, {resource.city} {resource.postalCode}</span>
                  </div>
                )}
                {!resource.address && (
                  <div className="flex items-center gap-2 text-sm text-haven-500">
                    <MapPin size={16} className="text-haven-400 shrink-0" />
                    <span>{resource.city}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                 {resource.phone && (
                   <a 
                     href={`tel:${resource.phone}`}
                     className="flex-1 bg-haven-50 text-haven-700 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-haven-100 transition-colors"
                   >
                     <Phone size={16} />
                     Call
                   </a>
                 )}
                 {resource.address && (
                   <a 
                     href={`https://maps.google.com/?q=${encodeURIComponent(resource.address + ' ' + resource.city)}`}
                     target="_blank"
                     rel="noreferrer"
                     className="flex-1 bg-haven-50 text-haven-700 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:bg-haven-100 transition-colors"
                   >
                     <ExternalLink size={16} />
                     Directions
                   </a>
                 )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};