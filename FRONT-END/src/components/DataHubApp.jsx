import React, { useState, useEffect, useMemo, useRef } from 'react';

// ==========================================
// ⚙️ НАСТРОЙКИ
// ==========================================
const API_URL = 'http://localhost:4000/api/universities'; 
const CHAT_API_URL = 'http://localhost:4000/api/chat'; // Ссылка на твой бэкенд ИИ

// --- ХЕЛПЕР: Исправленное форматирование цены ---
const formatPrice = (p) => {
    if (!p) return 'По запросу';
    let val = Number(p);
    // ХАК ДЛЯ ХАКАТОНА: Если число маленькое (например 100), умножаем на 1000
    if (val < 1000) val = val * 1000; 
    return `${val.toLocaleString('ru-RU')} ₸`;
};

// --- ИКОНКИ (SVG) ---
const Icons = {
    Heart: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Sparkles: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/><path d="M20 4v6"/><path d="M23 7h-6"/></svg>,
    Search: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    X: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18"/><path d="M6 6 18 18"/></svg>,
    GraduationCap: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12l2 1 2-1M12 15l-10-5M12 15v7"/></svg>,
    Sun: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
    Moon: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
    Send: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>,
    Brain: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
    ArrowRight: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>,
    Users: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    Trophy: (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17"/><path d="M14 14.66V17"/><path d="M18 2h-6c-2.3 0-4.07 1.6-4.13 3.9L7 12a5 5 0 0 0 5 5h0a5 5 0 0 0 5-5l-.87-6.1C16.07 3.6 14.3 2 12 2Z"/></svg>
};

// --- КОМПОНЕНТ: ИИ АССИСТЕНТ (С ПОДКЛЮЧЕНИЕМ К СЕРВЕРУ) ---
const AIChat = ({ isOpen, toggle, contextUni }) => {
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const endRef = useRef(null);

    useEffect(() => {
        if(isOpen && msgs.length === 0) {
            setMsgs([{ role: 'ai', content: `Привет! Я **DataHub AI**. ${contextUni ? `Спрашивай про **${contextUni.name}**.` : 'Готов помочь с выбором вуза.'}` }]);
        }
    }, [isOpen, contextUni]);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, isTyping]);

    const send = async (txt = input) => {
        if(!txt.trim()) return;
        
        // Добавляем сообщение пользователя в чат
        const userMsg = { role: 'user', content: txt };
        setMsgs(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // Формируем историю для Gemini
            // Gemini ожидает: [{ role: "user"|"model", parts: [{ text: "..." }] }]
            const historyForApi = msgs.map(m => ({
                role: m.role === 'ai' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));
            
            // Добавляем текущий контекст университета в запрос (промт инжиниринг)
            let finalPrompt = txt;
            if (contextUni) {
                finalPrompt = `Контекст: Пользователь смотрит страницу университета "${contextUni.name}". Город: ${contextUni.city}. Цена: ${formatPrice(contextUni.tuition_min_kzt)}. Рейтинг: ${contextUni.match_score}%. Описание: ${contextUni.description}. Вопрос пользователя: ${txt}`;
            }
            
            historyForApi.push({ role: 'user', parts: [{ text: finalPrompt }] });

            // 🚀 ОТПРАВЛЯЕМ ЗАПРОС НА ТВОЙ БЭКЕНД
            const response = await fetch(CHAT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: historyForApi })
            });

            if (!response.ok) throw new Error('Ошибка сети');
            const data = await response.json();

            // Парсим ответ от Gemini
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Извини, я задумался. Повтори вопрос.";
            
            setMsgs(prev => [...prev, { role: 'ai', content: replyText }]);

        } catch (error) {
            console.error("AI Error:", error);
            setMsgs(prev => [...prev, { role: 'ai', content: "⚠️ Бэкенд не отвечает. Проверь, запущен ли server.js на порту 4000." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return (
        <button onClick={toggle} className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-full shadow-[0_0_40px_-10px_rgba(124,58,237,0.6)] hover:scale-110 transition duration-300 z-50 flex items-center justify-center ring-2 ring-white/20 hover:ring-white/50 animate-bounce-slow">
            <Icons.Brain className="w-8 h-8 animate-pulse" />
        </button>
    );

    return (
        <div className="fixed bottom-8 right-8 w-[95vw] md:w-[400px] h-[600px] bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] z-50 flex flex-col overflow-hidden border border-white/20 dark:border-slate-700 animate-slide-up">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-0.5">
                <div className="bg-white/10 backdrop-blur-md p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white/20 to-transparent border border-white/20 flex items-center justify-center"><Icons.Sparkles className="w-5 h-5 text-yellow-300" /></div>
                        <div><div className="font-bold text-base leading-none">DataHub Copilot</div><div className="text-[10px] opacity-70 mt-1 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> ONLINE</div></div>
                    </div>
                    <button onClick={toggle} className="hover:bg-white/20 p-2 rounded-full transition"><Icons.X size={20}/></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
                {msgs.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm backdrop-blur-sm ${m.role === 'user' ? 'bg-violet-600 text-white rounded-br-none shadow-violet-500/20' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-lg'}`}>
                             {/* Рендеринг простого Markdown (жирный текст) */}
                             {m.content.split('\n').map((line, li) => <p key={li} className={li > 0 ? "mt-2" : ""} dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />)}
                        </div>
                    </div>
                ))}
                {isTyping && <div className="flex gap-2 ml-4 p-3"><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-75"/><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-150"/></div>}
                <div ref={endRef} />
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 relative">
                <input className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-2xl pl-5 pr-12 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 dark:text-white transition-all" placeholder="Спроси что угодно..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} />
                <button onClick={()=>send()} className="absolute right-6 top-6 w-8 h-8 bg-violet-600 rounded-lg text-white flex items-center justify-center hover:bg-violet-700 transition"><Icons.Send size={16}/></button>
            </div>
        </div>
    );
};

// --- КОМПОНЕНТ: МОДАЛКА ВУЗА (BENTO GRID) ---
const DetailModal = ({ u, close, askAI }) => {
    if(!u) return null;
    const desc = u.description || "Современный университет с богатой историей.";
    const score = u.unt_min_score || 70;
    const price = u.tuition_min_kzt || 0;
    const students = u.stats?.students || "10k+";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={close}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" />
            <div className="relative w-full max-w-5xl h-[90vh] bg-[#F8FAFC] dark:bg-[#0F172A] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-scale-up" onClick={e=>e.stopPropagation()}>
                <div className="h-[40%] relative shrink-0">
                    <img src={u.images?.[0] || u.image} className="w-full h-full object-cover" alt=""/>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#F8FAFC] dark:to-[#0F172A]"></div>
                    <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start">
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white font-bold text-sm">🏆 Top Choice</div>
                        <button onClick={close} className="bg-black/20 hover:bg-black/50 backdrop-blur text-white p-3 rounded-full transition border border-white/10"><Icons.X/></button>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 p-8">
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 leading-tight tracking-tight">{u.name}</h2>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                            <span className="flex items-center gap-1"><Icons.Users size={18}/> {students} Студентов</span>
                            <span className="w-1 h-1 bg-slate-400 rounded-full"/>
                            <span>{u.city || "Казахстан"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-lg font-bold mb-3 dark:text-white flex items-center gap-2"><Icons.Sparkles className="text-violet-500"/> Об университете</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">{desc}</p>
                            <div className="mt-4 flex gap-2 flex-wrap">
                                {u.tags?.map(t => <span key={t} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">#{t}</span>)}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:scale-150 transition duration-700"/>
                                <div className="text-xs font-bold uppercase opacity-80 mb-1">Стоимость / Год</div>
                                <div className="text-3xl font-black">{formatPrice(price)}</div>
                            </div>
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2"><Icons.Trophy size={24}/></div>
                                <div className="text-2xl font-black dark:text-white">{score}+</div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Проходной балл</div>
                            </div>
                        </div>
                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                             <button onClick={() => {close(); askAI(u)}} className="group relative overflow-hidden bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition hover:shadow-xl">
                                <span className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition duration-300"></span>
                                <span className="relative z-10 flex items-center gap-2"><Icons.Brain/> Анализ AI Copilot</span>
                             </button>
                             <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition">
                                <span>Подать документы</span> <Icons.ArrowRight/>
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
const App = () => {
    const [darkMode, setDarkMode] = useState(true);
    const [search, setSearch] = useState('');
    const [selUni, setSelUni] = useState(null);
    const [chatOpen, setChatOpen] = useState(false);
    
    // Данные из БД
    const [universities, setUniversities] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // ДЕМО ДАННЫЕ НА СЛУЧАЙ ОШИБКИ
    const FALLBACK_DATA = Array.from({length: 8}).map((_,i) => ({
        id: i, name: `Demo University`, city: 'Astana', tuition_min_kzt: 600, unt_min_score: 70,
        description: "Демо режим. Сервер не отвечает.", stats: { students: "12k+" }
    }));

    useEffect(() => {
        const fetchDB = async () => {
            try {
                const res = await fetch(API_URL);
                if (!res.ok) throw new Error("API Error");
                const rawData = await res.json();
                
                // АДАПТЕР: Делаем данные красивыми
                const adapted = rawData.map((u, i) => ({
                    ...u, 
                    id: u.id || i,
                    name: u.name || "University Name",
                    images: u.images || u.image_url ? [u.image_url] : [ i % 2 === 0 ? "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop" : "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop" ],
                    match_score: Math.floor(85 + Math.random() * 15),
                    tags: u.tags || ["IT", "Engineering", "Business"],
                    sub_name: u.specialization || (i % 2 === 0 ? 'Polytechnic National' : 'State University'),
                    unt_min_score: u.min_score || u.unt_min_score || (60 + i),
                    tuition_min_kzt: u.price || u.tuition_min_kzt || (500 + i*50)
                }));
                setUniversities(adapted);
            } catch (err) {
                console.warn("⚠️ API недоступен, демо режим", err);
                setError(true);
                const fallbackWithImages = FALLBACK_DATA.map((u, i) => ({ ...u, images: [ "https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop" ], match_score: 90, tags: ["Demo Mode"], sub_name: "Fallback Data" }));
                setUniversities(fallbackWithImages);
            } finally { setLoading(false); }
        };
        fetchDB();
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    const filtered = useMemo(() => universities.filter(u => u.name.toLowerCase().includes(search.toLowerCase())), [search, universities]);

    return (
        <div className={`min-h-screen font-sans selection:bg-violet-500 selection:text-white transition-colors duration-500 overflow-x-hidden ${darkMode ? 'bg-[#020617] text-white' : 'bg-[#F0F4F8] text-slate-900'}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94A3B8; border-radius: 10px; }
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .glass { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); }
            `}</style>
            
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            </div>

            <header className="fixed top-6 left-0 right-0 z-40 px-6 flex justify-center">
                <div className="w-full max-w-7xl glass rounded-full border border-white/10 shadow-lg px-6 py-4 flex items-center justify-between transition-all duration-300 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"><Icons.GraduationCap size={20} strokeWidth={3} /></div>
                        <span className="text-lg font-extrabold tracking-tight">DataHub<span className="text-violet-600 dark:text-violet-400">.RK</span></span>
                    </div>
                    <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-full px-4 py-2 border border-slate-200 dark:border-slate-700 w-96">
                        <Icons.Search className="text-slate-400" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm ml-2 w-full dark:text-white" placeholder="Поиск по вузам..." />
                    </div>
                    <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">{darkMode ? <Icons.Sun size={20}/> : <Icons.Moon size={20}/>}</button>
                </div>
            </header>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/10 backdrop-blur-md mb-6">
                        <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Hackathon Edition 2024</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] tracking-tight">Будущее образования <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600">начинается здесь</span></h1>
                    {error && <p className="text-rose-500 font-bold bg-rose-500/10 inline-block px-4 py-2 rounded-xl border border-rose-500/20">⚠️ Сервер недоступен. Показаны демо данные.</p>}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[1,2,3,4].map(i=><div key={i} className="h-[400px] bg-slate-200 dark:bg-slate-800/50 rounded-[32px] animate-pulse border border-white/5"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filtered.map((u) => (
                            <div key={u.id} onClick={() => setSelUni(u)} className="group relative bg-white dark:bg-slate-800 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-700/50 hover:border-violet-500/50 hover:shadow-[0_20px_50px_-12px_rgba(124,58,237,0.2)] transition-all duration-500 cursor-pointer flex flex-col h-[400px]">
                                <div className="h-48 relative overflow-hidden">
                                    <img src={u.images[0]} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt=""/>
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-60" />
                                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1"><Icons.Sparkles size={12} className="text-yellow-400"/> {u.match_score}% Match</div>
                                </div>
                                <div className="p-6 flex flex-col flex-1 relative">
                                    <div className="absolute -top-6 left-6 w-12 h-12 rounded-xl bg-white dark:bg-slate-700 shadow-lg flex items-center justify-center border-4 border-white dark:border-slate-800 text-xl font-black">{u.name[0]}</div>
                                    <div className="mt-4 mb-auto">
                                        <div className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">{u.city}</div>
                                        <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-violet-500 transition line-clamp-2">{u.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium">{u.sub_name}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 grid grid-cols-2 gap-4">
                                        <div><div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Грант</div><div className="font-black flex items-center gap-1">{u.unt_min_score} <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 rounded font-bold">БАЛЛ</span></div></div>
                                        <div className="text-right"><div className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Цена</div><div className="font-black">{formatPrice(u.tuition_min_kzt)}</div></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <DetailModal u={selUni} close={() => setSelUni(null)} askAI={(u) => { setSelUni(u); setChatOpen(true); }} />
            <AIChat isOpen={chatOpen} toggle={() => setChatOpen(!chatOpen)} contextUni={selUni} />
        </div>
    );
};

export default App;