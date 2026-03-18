import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'si', label: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', label: 'தமிழ்', flag: '🇱🇰' },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-(--bg-card) hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 transition-all border border-(--border-main) text-(--text-main) cursor-pointer shadow-sm"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-bold uppercase tracking-widest">{i18n.language?.split('-')[0] || 'EN'}</span>
      </button>
      
      <div 
        className={`absolute right-0 mt-2 w-36 py-2 bg-(--bg-card) dark:bg-slate-900/95 backdrop-blur-xl border border-(--border-main) rounded-xl shadow-2xl transition-all duration-300 transform origin-top z-50 ${
          isOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'
        }`}
      >
        {languages.map((lang) => {
          const isActive = i18n.language?.startsWith(lang.code);
          return (
            <button
              key={lang.code}
              onClick={(e) => { e.stopPropagation(); changeLanguage(lang.code); }}
              className={`w-full px-4 py-2.5 text-left text-sm focus:outline-none transition-colors flex items-center justify-between cursor-pointer ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/20' 
                  : 'text-(--text-muted) hover:bg-slate-100 dark:hover:bg-white/5 hover:text-(--text-main)'
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-lg leading-none">{lang.flag}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
