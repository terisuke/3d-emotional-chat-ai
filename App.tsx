import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ChatInput from './components/ChatInput';
import ChatMessage from './components/ChatMessage';
import CharacterDisplay from './components/CharacterDisplay';
import { Message, Emotion, CompanyKnowledge } from './types';
import { askGemini } from './services/geminiService';
import { loadCompanyKnowledge } from './services/knowledgeLoader';
import { useLanguage } from './contexts/LanguageContext';
import { Locale } from './translations';

const App: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [companyKnowledge, setCompanyKnowledge] = useState<CompanyKnowledge>({ markdownContent: '', calendarInfo: '' });

  useEffect(() => {
    document.title = t('title');
  }, [t, locale]);

  useEffect(() => {
    setMessages([{ id: uuidv4(), text: t('welcomeMessage'), sender: 'ai', emotion: Emotion.NEUTRAL }]);
  }, [t]); // Re-run if t (language) changes, to translate initial message

  // Load company knowledge on component mount
  useEffect(() => {
    const loadKnowledge = async () => {
      const knowledge = await loadCompanyKnowledge();
      setCompanyKnowledge(knowledge);
    };
    loadKnowledge();
  }, []);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim()) return;

    const newUserMessage: Message = { id: uuidv4(), text: inputText, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setIsLoading(true);
    setCurrentEmotion(Emotion.THINKING);

    try {
      const { text: aiResponseText, emotion: aiEmotion, sources } = await askGemini(inputText, companyKnowledge, locale);
      const newAiMessage: Message = { id: uuidv4(), text: aiResponseText, sender: 'ai', emotion: aiEmotion, sources };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);
      setCurrentEmotion(aiEmotion);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessageText = error instanceof Error ? `${t('aiDefaultError')}: ${error.message}` : t('aiError');
      const errorMessage: Message = { id: uuidv4(), text: errorMessageText, sender: 'ai', emotion: Emotion.SAD };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setCurrentEmotion(Emotion.SAD);
    } finally {
      setIsLoading(false);
    }
  }, [companyKnowledge, locale, t]);


  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-900 text-gray-100">
      {/* Header for Language Switcher */}
      <header id="app-header" className="bg-gray-800 shadow-md p-2 flex justify-end items-center space-x-2">
        <button
          onClick={() => setLocale('en')}
          className={`px-3 py-1 text-sm rounded ${locale === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
        >
          English
        </button>
        <button
          onClick={() => setLocale('ja')}
          className={`px-3 py-1 text-sm rounded ${locale === 'ja' ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
        >
          日本語
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row flex-grow overflow-hidden p-4 gap-6">
        {/* Left Panel: Chat Area - Expanded for better readability */}
        <div className="flex-1 lg:w-3/5 xl:w-2/3 flex flex-col bg-gray-800 rounded-lg shadow-xl overflow-hidden min-h-0">
          <div className="flex-grow p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && <ChatMessage key="loading" message={{id: 'loading', text: t('thinking'), sender: 'ai', emotion: Emotion.THINKING}} />}
          </div>
          <div className="p-6 border-t border-gray-700">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
        
        {/* Right Panel: 3D Character Display with Background */}
        <div 
          className="flex-none h-80 lg:h-auto lg:w-2/5 xl:w-1/3 rounded-lg shadow-xl relative overflow-hidden"
          style={{
            backgroundImage: 'url(/hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Semi-transparent overlay for better 3D model visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 h-full">
            <CharacterDisplay currentEmotion={currentEmotion} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;