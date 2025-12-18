Project Document: LLM Visibility & Prompt Discovery Tool
1. Project Overview
Vision: A lightweight, browser-based tool that transforms a "Seed Word" into a prioritized list of realistic user prompts that trigger AI responses (Gemini, ChatGPT, Claude).

Key Innovation: Unlike traditional keyword tools, this uses Gemini’s Google Search Grounding to cross-reference "People Also Asked" data with LLM behavior to ensure the prompts are real-world.

Target User: SEO Professionals and Content Strategists (specifically the user's SEO project).

2. Technical Stack
Frontend: Single-file HTML5 with Tailwind CSS (via CDN) for styling.

Logic: Vanilla JavaScript (ES6+).

Engine: Gemini 1.5 Flash/Pro API (Free Tier).

Features: API Grounding (Google Search integration), JSON output parsing, and a "Frequency Score" estimator.

3. Core Logic & Implementation Plan
Phase 1: The "Engine" (Gemini Integration)
The tool will call the Gemini API using the Google Search tool capability.

Input: User enters "Seed Word" (e.g., "Sustainable Fashion").

Process: Gemini performs a two-step internal thought process:

Research: Use Google Search to find current "People Also Asked" (PAA) and "Related Queries."

Synthesize: Convert those search queries into "LLM-style prompts" (e.g., "Compare the top 5 sustainable fashion brands for 2025").

Frequency Estimation: Since no direct "Prompt Volume" API exists, Gemini will assign a Relative Popularity Score (1-100) based on search result density and PAA prominence.

Phase 2: User Interface (UI)
Search Bar: Centered, sleek input field.

Results Table: Sortable columns for Prompt, Intent Category (Informational, Transactional, Comparative), and Estimated Frequency.

Copy Button: One-click copy for prompt lists to use in testing.