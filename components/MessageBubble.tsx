
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, MessageSender } from '../types';
import { SpeakerIcon, LoadingSpinner } from './icons';

interface MessageBubbleProps {
    message: Message;
    onPlayTTS: (text: string) => Promise<void>;
}

const BotMessageContent: React.FC<{ text: string; onPlayTTS: (text: string) => Promise<void>; }> = ({ text, onPlayTTS }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    if (!text || text === '...') {
        return (
            <div className="flex items-center space-x-2 text-slate-500">
                <LoadingSpinner className="w-5 h-5" />
                <span>กำลังคิด...</span>
            </div>
        );
    }
    
    const parts = text.split('---');
    const chineseText = parts[0]?.trim() || '';
    const thaiTranslation = parts[1]?.trim() || '';
    const suggestionsRaw = parts[2]?.trim().replace('แนะนำประโยคถัดไป:', '').trim() || '';
    
    const suggestions = suggestionsRaw.split('\n').map(s => s.trim().replace(/^\d+\.\s*/, '')).filter(Boolean);

    const handlePlay = async () => {
      if (isSpeaking || !chineseText) return;
      setIsSpeaking(true);
      try {
        await onPlayTTS(chineseText.replace(/\(.*?\)/g, '')); // Remove pinyin for cleaner TTS
      } catch (error) {
        console.error("TTS playback failed", error);
      } finally {
        setIsSpeaking(false);
      }
    };

    if (parts.length < 2) {
        // Fallback for consultation mode or malformed responses
        return (
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:text-slate-900 prose-em:text-slate-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-start justify-between">
                <p className="chinese-text font-medium text-slate-800 text-lg leading-relaxed font-['Sarabun']" dangerouslySetInnerHTML={{ __html: chineseText.replace(/\((.*?)\)/g, ' <span class="font-mono text-slate-500 text-sm">($1)</span>') }}></p>
                <button
                    onClick={handlePlay}
                    disabled={isSpeaking}
                    className="ml-4 p-2 text-slate-500 hover:text-blue-600 transition-colors duration-200 rounded-full hover:bg-slate-200 disabled:opacity-50"
                    aria-label="Play audio"
                >
                    {isSpeaking ? <LoadingSpinner /> : <SpeakerIcon />}
                </button>
            </div>
            <div className="h-px bg-slate-200 my-3"></div>
            <div className="thai-text bg-slate-100 p-3 border-l-4 border-blue-400 rounded-r-lg prose prose-slate max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1 prose-strong:text-slate-900 prose-em:text-slate-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{thaiTranslation}</ReactMarkdown>
            </div>
            {suggestions.length > 0 && (
                <div className="suggested-phrases mt-4 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                    <h4 className="text-sm font-bold text-amber-800 mb-2">แนะนำประโยคถัดไป:</h4>
                    <ul className="list-none space-y-2">
                        {suggestions.map((s, i) => (
                            <li key={i} className="text-slate-800 text-sm">{s}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onPlayTTS }) => {
    const isUser = message.sender === MessageSender.USER;

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md transition-all duration-300 ${isUser ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-lg' : 'bg-white text-slate-800 rounded-bl-lg'}`}>
                {isUser ? (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                    <BotMessageContent text={message.text} onPlayTTS={onPlayTTS} />
                )}
            </div>
        </div>
    );
};
