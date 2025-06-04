export const translations = {
  en: {
    title: "3D Emotional Chat AI",
    welcomeMessage: "Hey there! I'm Cloudia Sorano, Cor.inc's AI Ambassador! 🚀 I've got all the company info, upcoming events, and can dive into our social media for the latest tech buzz. What can I help you with today?",
    knowledgeUpdated: "Company knowledge updated. I'll use this information for my next answers.",
    thinking: "Thinking...",
    sendMessage: "Send",
    typeYourMessage: "Type your message...",
    companyKnowledgeBase: "Company Knowledge Base",
    companyInfoMarkdown: "Company Information (Markdown)",
    companyInfoPlaceholder: "Paste company information, policies, FAQs, etc. in Markdown format.",
    calendarInfo: "Calendar Details / Key Events",
    calendarInfoPlaceholder: "Describe key company events, meetings, or calendar summaries. E.g., 'Weekly team meeting: Mondays at 10 AM. Project deadline: Next Friday.'",
    showPreview: "Show Preview",
    hidePreview: "Hide Preview",
    updateKnowledge: "Update Knowledge",
    markdownPreview: "Markdown Preview:",
    calendarInfoPreview: "Calendar Info Preview:",
    aiError: "Sorry, I encountered an error. Please try again.",
    aiDefaultError: "Error communicating with AI",
    sources: "Sources",
  },
  ja: {
    title: "3D感情チャットAI",
    welcomeMessage: "おっす！クラウディア・ソラノっちゃん、Cor.incのAIアンバサダーやけん！🚀 会社の情報も、今度のイベントも、SNSの最新情報も全部知っとうよ〜。なんか聞きたいことあると？",
    knowledgeUpdated: "会社の知識が更新されました。次回の回答からこの情報を使用します。",
    thinking: "ちょっと待っとって...",
    sendMessage: "送信",
    typeYourMessage: "なんか聞きたいこと書いて〜",
    companyKnowledgeBase: "企業ナレッジベース",
    companyInfoMarkdown: "会社情報（マークダウン）",
    companyInfoPlaceholder: "会社情報、ポリシー、FAQなどをマークダウン形式で貼り付けてください。",
    calendarInfo: "カレンダー詳細 / 主要イベント",
    calendarInfoPlaceholder: "主要な会社のイベント、会議、またはカレンダーの概要を記述してください。例：「週次チーム会議：月曜午前10時。プロジェクト期限：来週の金曜日」",
    showPreview: "プレビューを表示",
    hidePreview: "プレビューを非表示",
    updateKnowledge: "知識を更新",
    markdownPreview: "マークダウンプレビュー：",
    calendarInfoPreview: "カレンダー情報プレビュー：",
    aiError: "申し訳ありません、エラーが発生しました。もう一度お試しください。",
    aiDefaultError: "AIとの通信エラー",
    sources: "情報源",
  },
};

export type Locale = keyof typeof translations;

// Ensure all keys are present in all languages, defaulting to 'en' if a key is missing.
// This is a simple check; for larger apps, a more robust i18n library might be used.
Object.keys(translations.en).forEach(key => {
  if (!translations.ja[key as keyof typeof translations.en]) {
    console.warn(`Missing Japanese translation for key: ${key}`);
  }
});
