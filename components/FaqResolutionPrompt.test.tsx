import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import FaqResolutionPrompt from './FaqResolutionPrompt';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderPrompt(): string {
  vi.stubGlobal('window', { location: { search: '' } });
  vi.stubGlobal('navigator', { language: 'ja-JP' });
  vi.stubGlobal('localStorage', {
    getItem: () => null,
    setItem: () => undefined,
  });

  return renderToStaticMarkup(
    <LanguageProvider>
      <FaqResolutionPrompt onResolved={() => undefined} onUnresolved={() => undefined} />
    </LanguageProvider>,
  );
}

describe('FaqResolutionPrompt', () => {
  it('renders the FAQ resolution confirmation with accessible actions', () => {
    const markup = renderPrompt();

    expect(markup).toContain('ご質問は解決しましたか？');
    expect(markup).toContain('はい、解決しました');
    expect(markup).toContain('いいえ、相談を続ける');
    expect(markup).toContain('role="group"');
    expect((markup.match(/min-h-11/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
