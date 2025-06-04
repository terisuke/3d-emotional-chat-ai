import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CompanyKnowledge } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface KnowledgeInputProps {
  currentKnowledge: CompanyKnowledge;
  onUpdateKnowledge: (knowledge: CompanyKnowledge) => void;
}

const KnowledgeInput: React.FC<KnowledgeInputProps> = ({ currentKnowledge, onUpdateKnowledge }) => {
  const { t } = useLanguage();
  const [markdownContent, setMarkdownContent] = useState(currentKnowledge.markdownContent);
  const [calendarInfo, setCalendarInfo] = useState(currentKnowledge.calendarInfo);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setMarkdownContent(currentKnowledge.markdownContent);
    setCalendarInfo(currentKnowledge.calendarInfo);
  }, [currentKnowledge]);

  const handleUpdate = () => {
    onUpdateKnowledge({ markdownContent, calendarInfo });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <h2 className="text-2xl font-semibold text-gray-100 mb-4 border-b border-gray-700 pb-2">{t('companyKnowledgeBase')}</h2>
      
      <div>
        <label htmlFor="markdownContent" className="block text-sm font-medium text-gray-300 mb-1">
          {t('companyInfoMarkdown')}
        </label>
        <textarea
          id="markdownContent"
          rows={10}
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none custom-scrollbar"
          value={markdownContent}
          onChange={(e) => setMarkdownContent(e.target.value)}
          placeholder={t('companyInfoPlaceholder')}
          aria-label={t('companyInfoMarkdown')}
        />
      </div>

      <div>
        <label htmlFor="calendarInfo" className="block text-sm font-medium text-gray-300 mb-1">
          {t('calendarInfo')}
        </label>
        <textarea
          id="calendarInfo"
          rows={5}
          className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none custom-scrollbar"
          value={calendarInfo}
          onChange={(e) => setCalendarInfo(e.target.value)}
          placeholder={t('calendarInfoPlaceholder')}
          aria-label={t('calendarInfo')}
        />
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4">
        <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
        >
            {showPreview ? t('hidePreview') : t('showPreview')}
        </button>
        <button
          onClick={handleUpdate}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
        >
          {t('updateKnowledge')}
        </button>
      </div>

      {showPreview && (
        <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-gray-900 max-h-64 overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">{t('markdownPreview')}</h3>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
          <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2">{t('calendarInfoPreview')}</h3>
          <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap">
            {calendarInfo}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeInput;