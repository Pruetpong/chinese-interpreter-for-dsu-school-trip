
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { INTERPRETERS, SCENARIOS, USER_MODES, MAX_MESSAGES } from './constants';
import { createChatSession, sendMessage, generateTts, transcribeAudio, ChatSession } from './services/netlifyService';
import { MessageBubble } from './components/MessageBubble';
import { SendIcon, MicIcon, StopIcon, SaveIcon, LoadIcon, NewChatIcon, ClearIcon, LoadingSpinner } from './components/icons';
import type { Message, AppSettings, InterpreterID, ScenarioID, UserModeID, Conversation } from './types';
import { MessageSender, ChatTab } from './types';


const SetupPanel: React.FC<{ onStart: (settings: AppSettings) => void; onLoad: () => void; isCreated: boolean }> = ({ onStart, onLoad, isCreated }) => {
    const [settings, setSettings] = useState<AppSettings>({
        interpreterId: Object.keys(INTERPRETERS)[0] as InterpreterID,
        scenarioId: Object.keys(SCENARIOS)[0] as ScenarioID,
        userModeId: Object.keys(USER_MODES)[0] as UserModeID,
    });

    const selectedInterpreter = INTERPRETERS[settings.interpreterId];

    const handleStart = () => {
        onStart(settings);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
            <header className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 text-slate-800 bg-clip-text pb-2">🏮 Chinese Interpreter</h1>
                <p className="text-slate-600 text-lg">ล่ามภาษาจีนสำหรับการเดินทางเฉิงตู</p>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-3">🎭 เลือกสถานการณ์และโหมด</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-800 mb-2">สถานการณ์การเดินทาง</label>
                        <select
                            disabled={isCreated}
                            value={settings.scenarioId}
                            onChange={(e) => setSettings(s => ({ ...s, scenarioId: e.target.value as ScenarioID }))}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
                        >
                            {Object.entries(SCENARIOS).map(([id, s]) => <option key={id} value={id}>{s.name} - {s.description}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">โหมดผู้ใช้งาน</label>
                        <select
                            disabled={isCreated}
                            value={settings.userModeId}
                            onChange={(e) => setSettings(s => ({ ...s, userModeId: e.target.value as UserModeID }))}
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
                        >
                            {Object.entries(USER_MODES).map(([id, um]) => <option key={id} value={id}>{um.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 border-b pb-3">🗣️ เลือกล่ามภาษาจีน</h2>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">ล่าม</label>
                    <select
                        disabled={isCreated}
                        value={settings.interpreterId}
                        onChange={(e) => setSettings(s => ({ ...s, interpreterId: e.target.value as InterpreterID }))}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
                    >
                        {Object.keys(INTERPRETERS).map(id => <option key={id} value={id}>{id}</option>)}
                    </select>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800">{selectedInterpreter.name}</h3>
                    <p className="text-sm text-slate-600"><span className="font-semibold">ความเชี่ยวชาญ:</span> {selectedInterpreter.specialty}</p>
                    <p className="text-sm text-slate-600"><span className="font-semibold">สไตล์:</span> {selectedInterpreter.communication_style}</p>
                    <p className="text-sm text-slate-600"><span className="font-semibold">ประสบการณ์:</span> {selectedInterpreter.experience}</p>
                </div>
            </div>
            
             <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={handleStart} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition">
                    ✨ สร้างแชทบอทล่าม
                </button>
                <button onClick={onLoad} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition">
                    <LoadIcon /> โหลดการสนทนา
                </button>
            </div>
        </div>
    );
};

const ChatPanel: React.FC<{
    messages: Message[];
    onSendMessage: (text: string, tab: Exclude<ChatTab, ChatTab.SETUP>) => void;
    onClear: () => void;
    onPlayTTS: (text: string) => Promise<void>;
    messageCount: number;
    isLoading: boolean;
    tab: Exclude<ChatTab, ChatTab.SETUP>;
    placeholder: string;
    info: string;
}> = ({ messages, onSendMessage, onClear, onPlayTTS, messageCount, isLoading, tab, placeholder, info }) => {
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && !isLoading && messageCount < MAX_MESSAGES) {
            onSendMessage(input, tab);
            setInput('');
        }
    };

    const handleAudio = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = (reader.result as string).split(',')[1];
                        try {
                            const transcribedText = await transcribeAudio(base64Audio, audioBlob.type);
                            setInput(transcribedText);
                        } catch (error) {
                            console.error('Transcription failed', error);
                            alert('ขออภัย ไม่สามารถแปลงเสียงเป็นข้อความได้');
                        }
                    };
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Microphone access denied:", err);
            }
        }
    };
    
    const messagesRemaining = MAX_MESSAGES - messageCount;

    return (
        <div className="h-full flex flex-col bg-slate-100">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-500 p-8 bg-slate-50 rounded-xl">{info}</div>
                )}
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onPlayTTS={onPlayTTS} />
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200 shrink-0">
                 <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-xl p-1 focus-within:ring-2 focus-within:ring-blue-500 transition">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                        placeholder={messagesRemaining > 0 ? placeholder : 'ถึงขีดจำกัดข้อความแล้ว'}
                        rows={1}
                        className="flex-1 bg-transparent p-2 resize-none outline-none text-slate-800 placeholder-slate-500 disabled:opacity-50"
                        disabled={isLoading || messagesRemaining <= 0}
                    />
                    <button
                        onClick={handleAudio}
                        className={`p-2 rounded-lg transition-colors ${isRecording ? 'text-red-500 bg-red-100' : 'text-slate-600 hover:bg-slate-200'}`}
                        disabled={isLoading || messagesRemaining <= 0}
                    >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim() || messagesRemaining <= 0}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : <SendIcon />}
                    </button>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                    <p className={`text-xs ${messagesRemaining <= 3 ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                        {messagesRemaining <= 3 && '⚠️ '}จำนวนข้อความที่เหลือ: {messagesRemaining}/{MAX_MESSAGES}
                    </p>
                    <button onClick={onClear} className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition">
                        <ClearIcon className="w-4 h-4" /> ล้างการสนทนา
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [isCreated, setIsCreated] = useState(false);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [activeTab, setActiveTab] = useState<Exclude<ChatTab, ChatTab.SETUP>>(ChatTab.MAIN);
    const [messages, setMessages] = useState<Record<Exclude<ChatTab, ChatTab.SETUP>, Message[]>>({
        [ChatTab.MAIN]: [],
        [ChatTab.CHINESE_INPUT]: [],
        [ChatTab.CONSULTATION]: [],
    });
    const [messageCount, setMessageCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionsRef = useRef<Partial<Record<Exclude<ChatTab, ChatTab.SETUP>, ChatSession>>>({});
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const handleCreateSession = (newSettings: AppSettings) => {
        setSettings(newSettings);
        chatSessionsRef.current.main = createChatSession(ChatTab.MAIN, newSettings.interpreterId, newSettings.scenarioId, newSettings.userModeId);
        chatSessionsRef.current.chinese_input = createChatSession(ChatTab.CHINESE_INPUT, newSettings.interpreterId, newSettings.scenarioId, newSettings.userModeId);
        chatSessionsRef.current.consultation = createChatSession(ChatTab.CONSULTATION, newSettings.interpreterId, newSettings.scenarioId, newSettings.userModeId);
        setIsCreated(true);
        setActiveTab(ChatTab.MAIN);
    };

    const handleNewSession = () => {
        setIsCreated(false);
        setSettings(null);
        setMessages({ main: [], chinese_input: [], consultation: [] });
        setMessageCount(0);
        chatSessionsRef.current = {};
    };

    const handleSendMessage = useCallback(async (text: string, tab: Exclude<ChatTab, ChatTab.SETUP>) => {
        if (isLoading || messageCount >= MAX_MESSAGES) return;

        const userMessage: Message = { id: Date.now().toString(), sender: MessageSender.USER, text, timestamp: Date.now() };

        setMessages(prev => ({ ...prev, [tab]: [...prev[tab], userMessage] }));
        setIsLoading(true);
        setMessageCount(prev => prev + 1);

        const botMessageId = (Date.now() + 1).toString();
        const placeholderBotMessage: Message = { id: botMessageId, sender: MessageSender.BOT, text: '...', timestamp: Date.now() };
        setMessages(prev => ({ ...prev, [tab]: [...prev[tab], placeholderBotMessage] }));

        try {
            const session = chatSessionsRef.current[tab];
            if (!session) throw new Error("Chat session not initialized");

            // Netlify: non-streaming response
            const fullResponse = await sendMessage(session, text);

            setMessages(prev => ({
                ...prev,
                [tab]: prev[tab].map(m => m.id === botMessageId ? { ...m, text: fullResponse } : m)
            }));
        } catch (error) {
            console.error(error);
            const errorMessage: Message = { id: botMessageId, sender: MessageSender.BOT, text: "ขออภัยค่ะ เกิดข้อผิดพลาดในการสื่อสาร", timestamp: Date.now() };
            setMessages(prev => ({
                ...prev,
                [tab]: prev[tab].map(m => m.id === botMessageId ? errorMessage : m)
            }));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, messageCount]);
    
    const handleClear = (tab: Exclude<ChatTab, ChatTab.SETUP>) => {
        setMessages(prev => ({...prev, [tab]: []}));
    }
    
    const handlePlayTTS = useCallback(async (text: string) => {
        if (!text || !audioContextRef.current) return;
        try {
            const arrayBuffer = await generateTts(text);
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch (error) {
            console.error("Failed to play TTS", error);
        }
    }, []);

    const handleSave = () => {
        if (!settings) {
            alert("กรุณาสร้างแชทก่อนบันทึก");
            return;
        }
        const conversation: Conversation = {
            settings,
            messages,
            messageCount,
        };
        localStorage.setItem('chineseInterpreterSession', JSON.stringify(conversation));
        alert("บันทึกการสนทนาแล้ว!");
    };

    const handleLoad = () => {
        const savedData = localStorage.getItem('chineseInterpreterSession');
        if (savedData) {
             try {
                const conversation: Conversation = JSON.parse(savedData);
                if (conversation.settings && conversation.messages && typeof conversation.messageCount === 'number') {
                    setSettings(conversation.settings);
                    setMessages(conversation.messages);
                    setMessageCount(conversation.messageCount);
                    handleCreateSession(conversation.settings);
                    alert("โหลดการสนทนาสำเร็จ!");
                } else {
                     alert("ข้อมูลที่บันทึกไว้ไม่ถูกต้อง");
                }
            } catch (e) {
                alert("ไม่สามารถโหลดข้อมูลได้ อาจเกิดจากข้อมูลเสียหาย");
                localStorage.removeItem('chineseInterpreterSession');
            }
        } else {
            alert("ไม่พบข้อมูลการสนทนาที่บันทึกไว้");
        }
    };

    const tabs: { id: Exclude<ChatTab, ChatTab.SETUP>; label: string }[] = [
        { id: ChatTab.MAIN, label: 'ใช้งานล่าม' },
        { id: ChatTab.CHINESE_INPUT, label: 'เข้าใจคนจีน' },
        { id: ChatTab.CONSULTATION, label: 'ปรึกษาล่าม' },
    ];
    
    const chatPanelProps = {
        isLoading,
        messageCount,
        onPlayTTS: handlePlayTTS,
    };

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-start font-['Sarabun']">
             {(!isCreated || !settings) ? (
                 <div className="w-full h-full flex items-center justify-center p-4">
                    <SetupPanel onStart={handleCreateSession} onLoad={handleLoad} isCreated={isCreated} />
                </div>
             ) : (
                <div className="w-full h-screen md:h-[calc(100vh-4rem)] md:max-w-4xl md:my-8 flex flex-col bg-slate-50 md:rounded-2xl md:shadow-2xl overflow-hidden">
                    <header className="p-4 bg-white/80 backdrop-blur-sm border-b border-slate-200 z-10 shrink-0">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-center sm:text-left">
                                <h2 className="text-lg font-bold text-slate-800">
                                    ล่าม: {INTERPRETERS[settings.interpreterId].name}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    {USER_MODES[settings.userModeId].name} | {SCENARIOS[settings.scenarioId].name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap justify-center">
                                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition text-xs sm:text-sm">
                                    <SaveIcon className="w-4 h-4" />
                                    <span>บันทึก</span>
                                </button>
                                <button onClick={handleLoad} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition text-xs sm:text-sm">
                                    <LoadIcon className="w-4 h-4" />
                                    <span>โหลด</span>
                                </button>
                                <button onClick={handleNewSession} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition text-xs sm:text-sm">
                                    <NewChatIcon className="w-4 h-4" />
                                    <span>ตั้งค่าใหม่</span>
                                </button>
                            </div>
                        </div>
                    </header>
                    <div className="p-2 bg-slate-200 overflow-x-auto shrink-0">
                        <nav className="flex space-x-2 whitespace-nowrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex-grow min-h-0 relative">
                        {activeTab === ChatTab.MAIN && <ChatPanel {...chatPanelProps} messages={messages.main} onSendMessage={handleSendMessage} onClear={() => handleClear(ChatTab.MAIN)} tab={ChatTab.MAIN} placeholder="พิมพ์ข้อความภาษาไทยหรืออังกฤษ..." info="เริ่มต้นการสนทนาโดยพิมพ์คำถามหรือประโยคที่คุณต้องการให้แปลเป็นภาษาจีน" />}
                        {activeTab === ChatTab.CHINESE_INPUT && <ChatPanel {...chatPanelProps} messages={messages.chinese_input} onSendMessage={handleSendMessage} onClear={() => handleClear(ChatTab.CHINESE_INPUT)} tab={ChatTab.CHINESE_INPUT} placeholder="ป้อนข้อความภาษาจีนที่ได้ยิน..." info="ป้อนข้อความภาษาจีนที่คุณได้ยินเพื่อรับคำแปล บริบท และคำแนะนำในการตอบกลับ" />}
                        {activeTab === ChatTab.CONSULTATION && <ChatPanel {...chatPanelProps} messages={messages.consultation} onSendMessage={handleSendMessage} onClear={() => handleClear(ChatTab.CONSULTATION)} tab={ChatTab.CONSULTATION} placeholder="ถามคำถามเกี่ยวกับวัฒนธรรม..." info="ถามคำถามเกี่ยวกับวัฒนธรรม มารยาท หรือกลยุทธ์การสื่อสารในประเทศจีน" />}
                    </div>
                </div>
            )}
        </main>
    );
}
