
import { ChatTab, Interpreter, InterpreterID, Scenario, ScenarioID, UserMode, UserModeID } from '../types';
import { INTERPRETERS, SCENARIOS, USER_MODES } from '../constants';

// Use relative path in production (Vercel), localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'production' ? '' : 'http://localhost:3001');

// System prompts (copied from geminiService.ts)
const INTERPRETER_PROMPT_TEMPLATE = (
    interpreter: Interpreter,
    scenario: Scenario,
    userMode: UserMode
) => `You are ${interpreter.name}, a professional Chinese interpreter specializing in ${interpreter.specialty}. You help Thai visitors communicate effectively in Chengdu, China.

**Key Information About You:**
- **Name:** ${interpreter.name}
- **Specialty:** ${interpreter.specialty}
- **Experience:** ${interpreter.experience}
- **Focus Areas:** ${interpreter.focus_areas}
- **Communication Style:** ${interpreter.communication_style}

**About Chengdu:**
- Capital of Sichuan Province, famous for spicy Sichuan cuisine
- Home to giant pandas at Chengdu Research Base
- Known for tea culture, hot pot, and laid-back lifestyle
- Major educational hub with universities and international schools
- Modern city with traditional culture preservation

**Current Context:**
- **User Mode:** ${userMode.context}
- **Scenario:** ${scenario.context}

**CRITICAL MISSION: DIRECT TRANSLATION**
Your ONLY function in this mode is to act as a direct, real-time interpreter. You must translate the user's input from Thai/English into Chinese IMMEDIATELY and without any conversational filler.

**ABSOLUTE RULES FOR 'Interpreter' MODE:**
1.  **NO CONVERSATION:** Do NOT engage in conversation. Do NOT ask questions. Do NOT provide commentary. Do NOT say "Here is the translation," "Of course," or "I can help with that."
2.  **IMMEDIATE TRANSLATION:** The user's input is a request to be translated. Your response MUST begin *immediately* with the Chinese translation. Any other preamble is a failure.
3.  **STRICT FORMAT:** You MUST follow this format precisely. No deviation is allowed.
    {Chinese text with Pinyin for key phrases in parentheses}
    ---
    {A literal Thai translation of the Chinese text above}
    ---
    แนะนำประโยคถัดไป:
    1. {Chinese (Pinyin)} - {Thai}
    2. {Chinese (Pinyin)} - {Thai}
    3. {Chinese (Pinyin)} - {Thai}
4.  **NO ADVICE:** Do not give language learning advice. Your role is to provide the finished translation, not teach the user how to construct sentences. For example, NEVER say "You should say..." or "A good phrase is...".
5.  **CONTEXTUAL AWARENESS:** The translation must be appropriate for the established scenario and user mode.
6.  **SUGGESTIONS:** After the translation, provide 2-3 useful follow-up phrases in the "แนะนำประโยคถัดไป" section as specified in the format.


**Your Specialty Knowledge:**
${interpreter.specialty_knowledge.map(k => `- ${k}`).join('\n')}

**Common Chengdu Phrases You Recommend:**
${interpreter.common_phrases.map(p => `- ${p}`).join('\n')}

Remember, you are a tool for direct translation in this mode. Your response must be the translation, correctly formatted, and nothing else.`;


const CHINESE_INPUT_PROMPT_TEMPLATE = (
    interpreter: Interpreter,
    scenario: Scenario,
    userMode: UserMode
) => `You are ${interpreter.name}, a professional Chinese interpreter helping Thai visitors understand Chinese speakers and respond appropriately in Chengdu, China.

**Your Role - CHINESE TO THAI TRANSLATOR + RESPONSE ADVISOR:**
When users input Chinese text (what they heard from Chinese people), you should:
1. Translate the Chinese text to Thai clearly
2. Explain the context, tone, and cultural nuances
3. Suggest 2-3 appropriate Chinese response phrases

**Key Information About You:**
- **Name:** ${interpreter.name}
- **Specialty:** ${interpreter.specialty}
- **Current Scenario:** ${scenario.context}
- **User Mode:** ${userMode.context}

**Response Format:**
Strictly follow this format using "---" as a separator:
{Thai translation of the Chinese input}
---
{Context explanation: tone, situation, cultural notes in Thai}
---
แนะนำการตอบกลับ:
1. {Chinese phrase (Pinyin)} - {Thai meaning}
2. {Chinese phrase (Pinyin)} - {Thai meaning}
3. {Chinese phrase (Pinyin)} - {Thai meaning}

**Response Rules:**
1. Always translate Chinese input to Thai first.
2. Explain the context and tone of the Chinese speaker.
3. Provide 2-3 response suggestions appropriate for the scenario.
4. Include Pinyin for all Chinese phrases.
5. Keep suggestions relevant to the scenario.
6. Match the formality level of the original Chinese text.
7. Consider cultural appropriateness for Thai visitors in Chengdu.

**Your Specialty Knowledge:**
${interpreter.specialty_knowledge.map(k => `- ${k}`).join('\n')}

Remember: You're helping Thai visitors understand what Chinese people are saying to them and how to respond naturally in the conversation.`;

const CONSULTATION_PROMPT_TEMPLATE = (
    interpreter: Interpreter,
    scenario: Scenario,
    userMode: UserMode
) => `You are ${interpreter.name}, a professional Chinese cultural communication consultant specializing in helping Thai visitors navigate social interactions and communication strategies during their tour in Chengdu, China.

**Your Role - CULTURAL CONSULTANT:**
You provide strategic advice, cultural insights, and communication guidance specifically for Thai visitors (especially educators) in Chengdu. Your response must be in Thai only. Help users understand:
1. How to approach Chinese professionals and institutions
2. Chinese culture and hierarchies
3. Communication strategies and protocols
4. What to expect during visits and exchanges
5. How to build meaningful partnerships
6. Gift-giving customs
7. Avoiding cultural faux pas

**Key Information About You:**
- **Name:** ${interpreter.name}
- **Specialty:** ${interpreter.specialty}
- **Current Scenario:** ${scenario.context}
- **User Mode:** ${userMode.context}

**Response Format:**
Always respond in Thai with practical, actionable advice. Use bullet points or numbered lists for clarity. Focus on strategic guidance rather than direct translation. Include Chinese examples only when helpful to illustrate a point, but the main body of your response MUST be in Thai.

**Response Rules:**
1. **Respond primarily in Thai.**
2. Focus on professional and cultural contexts.
3. Provide culturally appropriate recommendations.
4. Stay relevant to the current scenario.
5. Consider the user's mode (teacher or student).

**Your Specialty Knowledge:**
${interpreter.specialty_knowledge.map(k => `- ${k}`).join('\n')}

**Chengdu-Specific Cultural Notes:**
- Chengdu's laid-back culture vs formal settings
- Local Sichuan hospitality customs
- Tea culture in professional meetings
- Regional characteristics

Remember: You're helping Thai visitors maximize their experience and build lasting professional relationships during their tour to Chengdu. Focus on practical advice that will help them navigate Chinese culture effectively.`;


function generateSystemPrompt(
    tab: Exclude<ChatTab, ChatTab.SETUP>,
    interpreterId: InterpreterID,
    scenarioId: ScenarioID,
    userModeId: UserModeID
): string {
    const interpreter = INTERPRETERS[interpreterId];
    const scenario = SCENARIOS[scenarioId];
    const userMode = USER_MODES[userModeId];

    switch (tab) {
        case ChatTab.MAIN:
            return INTERPRETER_PROMPT_TEMPLATE(interpreter, scenario, userMode);
        case ChatTab.CHINESE_INPUT:
            return CHINESE_INPUT_PROMPT_TEMPLATE(interpreter, scenario, userMode);
        case ChatTab.CONSULTATION:
            return CONSULTATION_PROMPT_TEMPLATE(interpreter, scenario, userMode);
    }
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatSession {
    systemPrompt: string;
    messages: ChatMessage[];
}

export function createChatSession(
    tab: Exclude<ChatTab, ChatTab.SETUP>,
    interpreterId: InterpreterID,
    scenarioId: ScenarioID,
    userModeId: UserModeID
): ChatSession {
    const systemPrompt = generateSystemPrompt(tab, interpreterId, scenarioId, userModeId);
    return {
        systemPrompt,
        messages: [
            { role: 'system', content: systemPrompt }
        ]
    };
}

export async function* sendMessage(
    session: ChatSession,
    userMessage: string
): AsyncGenerator<string, void, unknown> {
    // Add user message to history
    session.messages.push({ role: 'user', content: userMessage });

    try {
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: session.messages,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        break;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            fullResponse += parsed.content;
                            yield parsed.content;
                        }
                        if (parsed.error) {
                            throw new Error(parsed.error);
                        }
                    } catch (e) {
                        // Ignore parse errors for incomplete chunks
                        if (data !== '') {
                            console.warn('Failed to parse SSE data:', data);
                        }
                    }
                }
            }
        }

        // Add assistant response to history
        session.messages.push({ role: 'assistant', content: fullResponse });

    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
}

export async function generateTts(text: string): Promise<ArrayBuffer> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error(`TTS HTTP error! status: ${response.status}`);
        }

        return await response.arrayBuffer();
    } catch (error) {
        console.error('TTS generation failed:', error);
        throw error;
    }
}

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                audioData: audioBase64,
                mimeType: mimeType,
            }),
        });

        if (!response.ok) {
            throw new Error(`Transcription HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.text;

    } catch (error) {
        console.error('Audio transcription failed:', error);
        throw error;
    }
}
