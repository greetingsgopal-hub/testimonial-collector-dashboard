export const generateHooks = async (transcript = '', productName = '') => {
  // Replace with real LLM call later
  return [
    `The only ${productName || 'product'} you will ever need`,
    `I was skeptical but this changed everything`,
    `Real customer, real results - ${(transcript || '').slice(0, 30) || 'amazing fit'}...`
  ];
};

export const generateCaptions = async (videoUrl) => {
  // Replace with Whisper + auto-caption later
  return { srt: 'WEBVTT...', duration: '0:19' };
};
