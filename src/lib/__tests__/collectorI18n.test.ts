import { describe, it, expect } from 'vitest';
import { COLLECTOR_TRANSLATIONS, CollectorLang } from '../collectorI18n';
import { cleanBrandOrProductName } from '../security';

describe('Collector Bilingual (English & Hinglish) i18n Suite', () => {
  const languages: CollectorLang[] = ['en', 'hi'];

  it('provides complete translation trees for both English and Hinglish', () => {
    languages.forEach((lang) => {
      const t = COLLECTOR_TRANSLATIONS[lang];
      expect(t).toBeDefined();
      expect(t.langLabel).toBeDefined();
      expect(t.header.brand).toBe('Panda Praise');
      expect(t.ribbon.safeLink).toBeTruthy();
      expect(t.guaranteeCard.title).toBeTruthy();
      expect(t.ratingStep.continueBtn).toBeTruthy();
      expect(t.ratingStep.seals.ssl).toBeTruthy();
      expect(t.ratingStep.seals.noLogin).toBeTruthy();
      expect(t.ratingStep.seals.noFinancial).toBeTruthy();
      expect(t.positiveForm.title).toBeTruthy();
      expect(t.positiveForm.modeText).toBeTruthy();
      expect(t.positiveForm.modeVideo).toBeTruthy();
      expect(t.positiveForm.submitBtn).toBeTruthy();
      expect(t.livePreview.badge).toBeTruthy();
      expect(t.successModal.viralBtn).toBeTruthy();
    });
  });

  it('cleans business names by stripping redundant owner testimonials suffixes', () => {
    expect(cleanBrandOrProductName("Gopal's Testimonials")).toBe('Gopal');
    expect(cleanBrandOrProductName("Gopal’s Testimonials")).toBe('Gopal');
    expect(cleanBrandOrProductName("Acme Testimonials")).toBe('Acme');
    expect(cleanBrandOrProductName("Rahul's Reviews")).toBe('Rahul');
    expect(cleanBrandOrProductName("Panda Praise")).toBe('Panda Praise');
    expect(cleanBrandOrProductName("Testimonials")).toBe('');
  });

  it('generates friendly brand-interpolated guarantee messages in English and Hinglish', () => {
    const brand = 'Panda Store';
    const enDesc = COLLECTOR_TRANSLATIONS.en.guaranteeCard.desc(brand);
    const hiDesc = COLLECTOR_TRANSLATIONS.hi.guaranteeCard.desc(brand);

    expect(enDesc).toContain('Panda Store');
    expect(enDesc).toContain('No sign-in or payment needed');

    expect(hiDesc).toContain('Panda Store');
    expect(hiDesc).toContain('Koi sign-in ya payment nahi chahiye');
  });

  it('has 5-star rating descriptions defined for all ratings 1 to 5 in both languages', () => {
    [1, 2, 3, 4, 5].forEach((star) => {
      expect(COLLECTOR_TRANSLATIONS.en.positiveForm.ratingDescriptions[star]).toBeTruthy();
      expect(COLLECTOR_TRANSLATIONS.hi.positiveForm.ratingDescriptions[star]).toBeTruthy();
    });
  });

  it('supports 1-click guided questions and quick prompt ideas in both English and Hinglish', () => {
    expect(COLLECTOR_TRANSLATIONS.en.positiveForm.guidedQuestions.length).toBeGreaterThanOrEqual(3);
    expect(COLLECTOR_TRANSLATIONS.hi.positiveForm.guidedQuestions.length).toBeGreaterThanOrEqual(3);
    expect(COLLECTOR_TRANSLATIONS.en.positiveForm.suggestedPrompts.length).toBeGreaterThanOrEqual(3);
    expect(COLLECTOR_TRANSLATIONS.hi.positiveForm.suggestedPrompts.length).toBeGreaterThanOrEqual(3);
  });

  it('formats rating step question as "Did you like [brand]?" without using/use karna', () => {
    expect(COLLECTOR_TRANSLATIONS.en.ratingStep.question('Gopal')).toBe('Did you like Gopal?');
    expect(COLLECTOR_TRANSLATIONS.hi.ratingStep.question('Gopal')).toBe('Kya aapko Gopal pasand aaya?');
  });
});

