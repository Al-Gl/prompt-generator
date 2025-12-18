# Project: LLM Visibility Prompt Finder

## Tech Stack
- Frontend: HTML/Tailwind CSS/JS
- Backend: None (Direct Browser-to-Gemini API)
- API: Google Gemini API (v1beta with Search Grounding)

## Implementation Rules
1. **Single File Architecture**: Keep the entire app in `index.html` unless it exceeds 500 lines.
2. **API Safety**: Never hardcode the API key. Provide a settings modal for the user to input their Google AI Studio Key (save to localStorage).
3. **Prompt Engineering for Gemini**: 
   - Instruct Gemini to act as an "AI Search Analyst."
   - Explicitly use the `Google Search` tool in the API call to fetch "People Also Asked" data.
   - Format response as strictly JSON for easy parsing.
4. **Frequency Logic**: If volume data isn't available, have Gemini estimate "Visibility Weight" based on search result frequency and PAA rank.

## Development Commands
- Open in browser: `open index.html`
- Test API call: `node test-gemini.js` (if needed for debugging)