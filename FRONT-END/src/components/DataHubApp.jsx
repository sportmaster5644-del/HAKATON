import React, { useState, useEffect, useMemo, useRef } from 'react';

// --- КОНФИГУРАЦИЯ ---
const API_ENDPOINT = 'http://localhost:4000/api/universities';

// --- ИМИТАЦИЯ БАЗЫ ДАННЫХ (MOCK DATA) С РАСШИРЕННЫМИ ПОЛЯМИ ---
const MOCK_DATA = Array.from({length: 12}).map((_,i) => ({
    id: i, 
    name: i % 2 === 0 ? `Satbayev University #${i+1}` : `KIMEP University #${i+1}`, 
    city: ['Алматы', 'Астана', 'Шымкент'][i%3], 
    type: i % 3 === 0 ? 'Национальный' : 'Частный', 
    tuition_min_kzt: 600 + i*50, 
    unt_min_score: 70 + i,
    dormitory_available: i%2===0,
    rating: (4 + Math.random()).toFixed(1),
    // Новые поля для хакатона
    description: "Ведущий технический вуз страны, флагман инженерного образования. Миссия — подготовка лидеров новой формации.",
    history: "Основан в 1934 году. За годы существования подготовил более 100 000 специалистов.",
    programs: [
        { name: "Computer Science", degree: "Бакалавриат", duration: "4 года" },
        { name: "Petroleum Engineering", degree: "Бакалавриат", duration: "4 года" },
        { name: "Business Administration", degree: "MBA", duration: "2 года" }
    ],
    admission: {
        deadline: "25 августа",
        grants: 1500,
        requirements: "ЕНТ не менее 70 баллов, профильные предметы: Мат+Физ.",
        scholarship: "Стипендия Президента РК для отличников."
    },
    international: {
        partners: ["MIT (USA)", "Polytecnico di Milano (Italy)", "KAIST (Korea)"],
        exchange: "Программы двойного диплома и Erasmus+."
    },
    images: [
        "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop"
    ]
}));

// --- ХЕЛПЕРЫ ---
const formatPrice = (p) => p ? `${(p * 1000).toLocaleString('ru-RU')} ₸` : 'Н/Д';

// --- ХУКИ ---
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try { return JSON.parse(window.localStorage.getItem(key)) || initialValue; } 
        catch { return initialValue; }
    });
    const setValue = (value) => {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
    };
    return [storedValue, setValue];
};

// --- ИКОНКИ (LUCIDE STYLE) ---
const Icons = {
    Heart: ({ filled, ...p }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#F43F5E" : "none"} stroke={filled ? "#F43F5E" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Sparkles: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
    Search: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    X: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18"/><path d="M6 6 18 18"/></svg>,
    GraduationCap: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12l2 1 2-1M12 15l-10-5M12 15v7"/></svg>,
    Sun: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    Scale: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 3h4v18h-4zM2 20h20M6 7v13M18 10v10M6 7l-3-3M18 10l3-3"></path></svg>,
    Send: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
    Zap: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    Globe: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    BookOpen: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    Box: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    Bot: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>,
    User: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
};

// --- КОМПОНЕНТЫ ---

const ToastContainer = ({ toasts }) => (
    <div className="fixed top-24 right-6 z-[70] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur text-slate-800 dark:text-white px-5 py-3 rounded-2xl shadow-xl animate-slide-in-right flex items-center gap-3 border border-gray-100 dark:border-slate-700">
                {t.icon}
                <span className="font-bold text-sm">{t.text}</span>
            </div>
        ))}
    </div>
);

// --- УЛУЧШЕННЫЙ ЧАТ С КОНТЕКСТОМ ---
const ChatWidget = ({ isOpen, toggle, contextUni }) => {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef(null);

    // При открытии чата - приветствие в зависимости от контекста
    useEffect(() => {
        if(isOpen && msgs.length === 0) {
            const startMsg = contextUni 
                ? `Привет! Я вижу, ты смотришь ${contextUni.name}. Что тебя интересует: гранты, общежитие или специальности?`
                : 'Привет! Я AI-ассистент DataHub. Помогу выбрать ВУЗ, сравнить цены или найти грант. Спрашивай!';
            setMsgs([{ role: 'ai', content: startMsg }]);
        }
    }, [isOpen, contextUni]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, isTyping]);

    const send = async (txt = input) => {
        if(!txt.trim()) return;
        setMsgs(p => [...p, { role: 'user', content: txt }]);
        setInput('');
        setIsTyping(true);

        // Имитация "Думает..." и стриминга ответа
        setTimeout(() => {
            let reply = "Это интересный вопрос. Сейчас уточню в базе данных...";
            const t = txt.toLowerCase();
            
            // Логика ответов для Хакатона
            if(contextUni) {
                 if(t.includes('грант') || t.includes('балл')) reply = `Для поступления в ${contextUni.name} на грант в прошлом году нужно было набрать минимум ${contextUni.unt_min_score} баллов.`;
                 else if(t.includes('цена') || t.includes('стоит')) reply = `Стоимость обучения в ${contextUni.name} начинается от ${formatPrice(contextUni.tuition_min_kzt)} в год.`;
                 else if(t.includes('общ')) reply = contextUni.dormitory_available ? `Да, в ${contextUni.name} есть отличные общежития для студентов.` : `К сожалению, у ${contextUni.name} сейчас нет свободных мест в общежитии.`;
                 else reply = `Я могу рассказать про программы обучения, международные связи и условия поступления в ${contextUni.name}. Что интересно?`;
            } else {
                 if(t.includes('дешевле')) reply = "Самые доступные ВУЗы начинаются от 450 000 тг/год. Сортирую список по цене...";
                 else if(t.includes('it')) reply = "Лучшие IT вузы: МУИТ, КБТУ, Astana IT University. Открыть их список?";
                 else reply = "Я знаю всё о 120 ВУЗах Казахстана. Назови город или специальность, и я подберу варианты.";
            }

            setIsTyping(false);
            setMsgs(p => [...p, { role: 'ai', content: reply }]);
        }, 1500);
    };

    if (!isOpen) return (
        <button onClick={toggle} className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-full shadow-2xl hover:scale-110 transition z-50 flex items-center justify-center animate-bounce-slow ring-4 ring-white/20">
            <Icons.Sparkles className="w-8 h-8" />
        </button>
    );

    return (
        <div className="fixed bottom-6 right-6 w-[90vw] md:w-[380px] h-[550px] bg-white dark:bg-slate-900 rounded-[30px] shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-up ring-1 ring-black/5">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-4 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center"><Icons.Bot size={24}/></div>
                    <div>
                        <div className="font-bold">DataHub AI</div>
                        <div className="text-[10px] opacity-80 flex items-center gap-1">● Online</div>
                    </div>
                </div>
                <button onClick={toggle} className="hover:bg-white/20 p-2 rounded-full"><Icons.X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#0f1218]">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role==='user'?'bg-blue-600 text-white rounded-br-none':'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-gray-100 dark:border-slate-700'}`}>
                            {m.content}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="flex gap-1 ml-4"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"/><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"/><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"/></div>}
                <div ref={endRef} />
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border-t dark:border-slate-800">
                <div className="flex gap-2 relative">
                    <input 
                        className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full pl-5 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition"
                        placeholder="Задай вопрос..." 
                        value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
                    />
                    <button onClick={()=>send()} className="absolute right-1 top-1 w-10 h-10 bg-blue-600 rounded-full text-white flex items-center justify-center hover:bg-blue-700 transition"><Icons.Send size={18}/></button>
                </div>
            </div>
        </div>
    );
};

// --- МОДАЛКА ВУЗА (Вкладки, 3D тур и т.д.) ---
const DetailModal = ({ u, close, askAI }) => {
    const [activeTab, setActiveTab] = useState('about'); // about, programs, admission, international, tour

    const tabs = [
        { id: 'about', label: 'Об университете', icon: <Icons.User size={16}/> },
        { id: 'programs', label: 'Программы', icon: <Icons.BookOpen size={16}/> },
        { id: 'admission', label: 'Поступление', icon: <Icons.Zap size={16}/> },
        { id: 'international', label: 'International', icon: <Icons.Globe size={16}/> },
        { id: 'tour', label: '3D Тур', icon: <Icons.Box size={16}/> },
    ];

    if(!u) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={close}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-scale-up" onClick={e=>e.stopPropagation()}>
                
                {/* Header Image */}
                <div className="h-48 relative shrink-0">
                    <img src={u.images[0]} className="w-full h-full object-cover" alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <button onClick={close} className="absolute top-4 right-4 bg-white/10 hover:bg-white/30 p-2 rounded-full text-white backdrop-blur transition"><Icons.X/></button>
                    <div className="absolute bottom-4 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="px-2 py-0.5 bg-blue-600 rounded text-xs font-bold text-white uppercase tracking-wider">{u.city}</span>
                             <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm"><Icons.Zap size={14}/> Рейтинг {u.rating}</span>
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight">{u.name}</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-slate-800 overflow-x-auto no-scrollbar px-6 bg-white dark:bg-slate-900 sticky top-0 z-10">
                    {tabs.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-4 text-sm font-bold border-b-2 transition whitespace-nowrap ${activeTab === t.id ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-black/20 custom-scrollbar">
                    {activeTab === 'about' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-xs text-slate-400 font-bold uppercase">Грант</div>
                                    <div className="text-2xl font-black text-blue-600">{u.unt_min_score}+</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700">
                                    <div className="text-xs text-slate-400 font-bold uppercase">Стоимость</div>
                                    <div className="text-2xl font-black text-emerald-500">{Math.floor(u.tuition_min_kzt)}k ₸</div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 dark:text-white">Миссия и История</h3>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{u.description}</p>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mt-2">{u.history}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'programs' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="font-bold text-lg dark:text-white">Академические программы</h3>
                            <div className="grid gap-3">
                                {u.programs.map((p, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center hover:shadow-md transition">
                                        <div>
                                            <div className="font-bold text-slate-800 dark:text-white">{p.name}</div>
                                            <div className="text-xs text-slate-500">{p.degree} • {p.duration}</div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-600 flex items-center justify-center"><Icons.BookOpen size={16}/></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'admission' && (
                        <div className="space-y-6 animate-fade-in">
                             <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-2xl shadow-lg">
                                <div className="font-bold text-lg mb-1">Приемная комиссия</div>
                                <div className="text-white/80 text-sm">Дедлайн подачи: <b>{u.admission.deadline}</b></div>
                             </div>
                             <div>
                                 <h4 className="font-bold mb-2 dark:text-white">Требования</h4>
                                 <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                     <li>{u.admission.requirements}</li>
                                     <li>Количество грантов: {u.admission.grants}</li>
                                 </ul>
                             </div>
                             <div>
                                 <h4 className="font-bold mb-2 dark:text-white">Стипендии</h4>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700">{u.admission.scholarship}</p>
                             </div>
                        </div>
                    )}

                    {activeTab === 'international' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                                <Icons.Globe size={24}/>
                                <div className="text-sm font-medium">Студенты могут провести семестр за границей по программе Academic Mobility.</div>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2 dark:text-white">ВУЗы-партнеры</h4>
                                <div className="flex flex-wrap gap-2">
                                    {u.international.partners.map(partner => (
                                        <span key={partner} className="px-3 py-1 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm">{partner}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tour' && (
                        <div className="h-full flex flex-col animate-fade-in">
                            <div className="relative flex-1 rounded-2xl overflow-hidden group cursor-pointer border dark:border-slate-700">
                                {/* Fake 3D Tour Placeholder */}
                                <img src="https://images.unsplash.com/photo-1590579491624-f98f36d4c763?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" alt=""/>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center flex-col gap-3 group-hover:bg-black/30 transition">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur border border-white/50 flex items-center justify-center text-white animate-pulse">
                                        <Icons.Box size={32}/>
                                    </div>
                                    <span className="text-white font-bold tracking-widest uppercase text-sm">Запустить 3D Тур</span>
                                </div>
                                <div className="absolute bottom-4 left-4 text-white/80 text-xs bg-black/50 px-2 py-1 rounded">Кампус • Главный корпус</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex gap-3 bg-white dark:bg-slate-900">
                    <button onClick={() => { close(); askAI(u); }} className="flex-1 py-3 rounded-xl border-2 border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition flex items-center justify-center gap-2">
                        <Icons.Sparkles size={18}/> Спросить AI
                    </button>
                    <a href="#" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center transition shadow-lg shadow-blue-500/30">
                        Подать документы
                    </a>
                </div>
            </div>
        </div>
    );
};

// --- ИЗБРАННОЕ (DRAWER) ---
const FavoritesDrawer = ({ isOpen, close, items, data, remove, openUni }) => {
    const favs = data.filter(u => items.includes(u.id));
    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={close}/>}
            <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 p-6 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-xl dark:text-white flex items-center gap-2"><Icons.Heart filled/> Избранное</h2>
                    <button onClick={close}><Icons.X/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {favs.length === 0 ? <p className="text-slate-400 text-center mt-10">Список пуст</p> : favs.map(u => (
                        <div key={u.id} onClick={()=>{close(); openUni(u)}} className="flex gap-3 items-center p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer group">
                            <img src={u.images[0]} className="w-12 h-12 rounded-lg object-cover" alt=""/>
                            <div className="flex-1">
                                <div className="font-bold text-sm dark:text-white leading-tight">{u.name}</div>
                                <div className="text-xs text-slate-500">{u.city}</div>
                            </div>
                            <button onClick={(e)=>{e.stopPropagation(); remove(u.id)}} className="p-2 text-slate-300 hover:text-red-500"><Icons.X size={16}/></button>
                        </div>
                    ))}
                </div>
                <button onClick={close} className="w-full py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm mt-4">Закрыть</button>
            </div>
        </>
    );
};

// --- MAIN APP ---
const App = () => {
    const [darkMode, setDarkMode] = useLocalStorage('theme', false);
    const [favorites, setFavs] = useLocalStorage('favorites', []);
    const [compare, setCompare] = useState([]);
    const [data, setData] = useState(MOCK_DATA);
    
    const [search, setSearch] = useState('');
    const [selUni, setSelUni] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [favOpen, setFavOpen] = useState(false); // Состояние для панели лайков
    const [showCompare, setShowCompare] = useState(false);

    useEffect(() => { document.documentElement.classList.toggle('dark', darkMode); }, [darkMode]);

    const addToast = (text, icon) => {
        const id = Date.now();
        setToasts(p => [...p, { id, text, icon }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
    };

    const toggleFav = (id) => {
        const exists = favorites.includes(id);
        setFavs(p => exists ? p.filter(x => x !== id) : [...p, id]);
        if(!exists) addToast('Добавлено в избранное', <Icons.Heart className="text-rose-500"/>);
    };

    const toggleCmp = (id) => {
        if(compare.includes(id)) setCompare(p => p.filter(x => x !== id));
        else {
            if(compare.length >= 3) return addToast('Максимум 3 ВУЗа', <Icons.X/>);
            setCompare(p => [...p, id]);
            addToast('Добавлено к сравнению', <Icons.Scale className="text-blue-500"/>);
        }
    };

    const filtered = useMemo(() => data.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), [data, search]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-slate-900 dark:text-white font-sans selection:bg-blue-500 selection:text-white transition-colors duration-300">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .dark ::-webkit-scrollbar-thumb { background: #334155; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-slide-up { animation: slideUp 0.4s ease-out; }
                @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale-up { animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fadeIn 0.3s ease-in; }
            `}</style>
            
            <ToastContainer toasts={toasts} />
            <FavoritesDrawer isOpen={favOpen} close={()=>setFavOpen(false)} items={favorites} data={data} remove={toggleFav} openUni={setSelUni}/>

            {/* HEADER */}
            <header className="fixed top-0 w-full z-40 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Icons.GraduationCap/></div>
                        <span className="text-xl font-extrabold tracking-tight">DataHub<span className="text-blue-500">.RK</span></span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                            {darkMode ? <Icons.Sun size={20}/> : <Icons.Moon size={20}/>}
                        </button>
                        <button onClick={() => setFavOpen(true)} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition relative">
                            <Icons.Heart size={20} className={favorites.length ? "text-rose-500" : ""}/>
                            {favorites.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>}
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <div className="pt-32 pb-12 px-6 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6 border border-blue-100 dark:border-blue-800 animate-slide-up">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/> Общий каталог университетов 2024
                </div>
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight animate-slide-up">
                    Выбери свое <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">будущее сегодня</span>
                </h1>
                
                <div className="relative max-w-xl mx-auto group animate-slide-up">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                    <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-xl flex items-center">
                        <Icons.Search className="ml-4 text-slate-400" />
                        <input 
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Найти университет или программу..." 
                            className="w-full h-12 px-4 bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400 font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* COMPARE FLOATING BAR */}
            {compare.length > 0 && (
                <div className="fixed bottom-6 left-6 z-40 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-blue-100 dark:border-slate-700 animate-slide-up w-72">
                    <div className="flex justify-between text-xs font-bold mb-2 uppercase text-slate-400">
                        <span>Сравнение ({compare.length})</span>
                        <button onClick={()=>setCompare([])} className="text-rose-500">Очистить</button>
                    </div>
                    <div className="flex gap-2 mb-3">
                        {compare.map(id => <div key={id} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">{data.find(x=>x.id===id).name[0]}</div>)}
                    </div>
                    <button onClick={()=>setShowCompare(true)} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20">Сравнить ВУЗы</button>
                </div>
            )}

            {/* GRID */}
            <main className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(u => (
                    <div key={u.id} onClick={() => setSelUni(u)} className="group bg-white dark:bg-slate-800 rounded-[24px] overflow-hidden border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer h-[420px] flex flex-col">
                        <div className="h-48 relative overflow-hidden">
                            <img src={u.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt=""/>
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={(e)=>{e.stopPropagation(); toggleFav(u.id)}} className={`p-2 rounded-full backdrop-blur-md transition ${favorites.includes(u.id)?'bg-white text-rose-500':'bg-black/20 text-white hover:bg-white hover:text-rose-500'}`}><Icons.Heart size={18} filled={favorites.includes(u.id)}/></button>
                                <button onClick={(e)=>{e.stopPropagation(); toggleCmp(u.id)}} className={`p-2 rounded-full backdrop-blur-md transition ${compare.includes(u.id)?'bg-blue-600 text-white':'bg-black/20 text-white hover:bg-blue-600'}`}><Icons.Scale size={18}/></button>
                            </div>
                            <div className="absolute bottom-3 left-3 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 text-xs font-bold text-white uppercase">{u.city}</div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-bold leading-tight mb-1 line-clamp-2">{u.name}</h3>
                            <div className="text-sm text-slate-500 mb-4">{u.type} Университет</div>
                            
                            <div className="mt-auto grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Грант</div>
                                    <div className="font-bold text-blue-600">{u.unt_min_score}+</div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase">Цена</div>
                                    <div className="font-bold text-emerald-600">{Math.floor(u.tuition_min_kzt)}k ₸</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* COMPARE MODAL */}
            {showCompare && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4" onClick={()=>setShowCompare(false)}>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl p-6" onClick={e=>e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl">Сравнение</h2>
                            <button onClick={()=>setShowCompare(false)}><Icons.X/></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-3"></th>
                                        {data.filter(u=>compare.includes(u.id)).map(u=>(
                                            <th key={u.id} className="p-3 min-w-[200px]">{u.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {[
                                        {l:'Цена (год)', k:'tuition_min_kzt', fmt:formatPrice},
                                        {l:'Мин. балл', k:'unt_min_score'},
                                        {l:'Рейтинг', k:'rating'},
                                        {l:'Общежитие', k:'dormitory_available', bool:true}
                                    ].map((row,i)=>(
                                        <tr key={i} className="border-t border-gray-100 dark:border-slate-800">
                                            <td className="p-3 font-bold text-slate-500">{row.l}</td>
                                            {data.filter(u=>compare.includes(u.id)).map(u=>{
                                                let val = u[row.k];
                                                if(row.bool) val = val ? 'Есть' : 'Нет';
                                                if(row.fmt) val = row.fmt(val);
                                                return <td key={u.id} className="p-3">{val}</td>
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL & CHAT */}
            <DetailModal u={selUni} close={() => setSelUni(null)} askAI={(u)=>{setChatOpen(true);}} />
            <ChatWidget isOpen={chatOpen} toggle={() => setChatOpen(!chatOpen)} contextUni={selUni} />
        </div>
    );
};

export default App;