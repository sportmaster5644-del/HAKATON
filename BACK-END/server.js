import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; 

// !!! ПРЕДПОЛАГАЕМЫЕ ИМПОРТЫ !!!
// Замените их на фактические пути к вашим файлам
import sequelize from './config/db.js'; 
import universityRoutes from './routes/universityRoutes.js'; 

const app = express();
// Устанавливаем порт 4000, чтобы соответствовать frontend-конфигурации (http://localhost:4000/api/universities)
const PORT = process.env.PORT || 4000; 

// --- 1. Конфигурация Gemini AI ---
// !!! ВАЖНО: ХРАНИТЕ КЛЮЧ В ПЕРЕМЕННЫХ ОКРУЖЕНИЯ, НЕ В КОДЕ !!!
const GEMINI_API_KEY = process.env.LLM_API_KEY || "AIzaSyBVh3G9sLUXVIJXCnRTm77fh_k0Zcwjut0"; 
const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025'; // Используем более современную модель
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Инструкция для ИИ
const SYSTEM_PROMPT = "Ты — Академический Ассистент, дружелюбный эксперт, специализирующийся на высшем образовании, олимпиадном движении, исследованиях и подготовке к поступлению. Отвечай на вопросы пользователя, предоставляя полезную, мотивирующую и точную информацию, которая поможет ему выиграть на олимпиаде или углубить знания. Отвечай на русском языке.";


// --- 2. Middleware (Общий для всего) ---
app.use(cors({ origin: '*' })); // Разрешаем CORS для всех доменов
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// --- 3. University Routes ---
// Используем существующие маршруты для /api/universities
app.use('/api/universities', universityRoutes);


// --- 4. AI Chat Proxy Route ---
// Новый маршрут для проксирования запросов к Gemini API
app.post('/api/chat', async (req, res) => {
    try {
        // Мы ожидаем, что клиент отправит всю историю чата в поле 'contents'
        const { contents } = req.body; 

        if (!contents || contents.length === 0) {
            return res.status(400).json({ error: "Поле 'contents' (история чата) обязательно." });
        }
        
        if (GEMINI_API_KEY === "ВСТАВЬ_СЮДА_СВОЙ_КЛЮЧ_ИЗ_ПЕРЕМЕННОЙ_ОКРУЖЕНИЯ") {
             return res.status(500).json({ error: "Ошибка: API-ключ Gemini не установлен в server.js." });
        }
        
        const payload = {
            contents: contents, // Отправляем всю историю для контекста
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            tools: [{ "google_search": {} }], // Включаем поиск Google для актуальности
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errDetails = await response.json();
            console.error('Ошибка Google API:', errDetails);
            // Возвращаем ошибку 403, если ключ недействителен или отсутствует
            if (response.status === 403) {
                 return res.status(403).json({ error: "Ошибка аутентификации (403 Forbidden) при обращении к API Gemini. Проверьте ваш API-ключ." });
            }
            throw new Error(`Google API returned status ${response.status}`);
        }

        const data = await response.json();
        
        // Отправляем полный ответ ИИ, включая метаданные, обратно на фронтенд
        res.json(data);

    } catch (error) {
        console.error("Ошибка при обработке запроса /api/chat:", error);
        res.status(500).json({ 
            error: "Произошла внутренняя ошибка сервера. Проверьте консоль.",
            details: error.message
        });
    }
});


// --- 5. Database Connection and Server Start ---
async function startServer() {
    try {
        // Проверка подключения к базе данных (MySQL)
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных MySQL.');

        // Синхронизация моделей с базой данных
        await sequelize.sync({ force: false }); 
        console.log('Модели синхронизированы с базой данных.');

        // Запуск сервера Express
        app.listen(PORT, () => {
            console.log(`\n===================================================================`);
            console.log(`🟢 Сервер успешно запущен на порту: ${PORT}`);
            console.log(`🌐 API для Университетов: http://localhost:${PORT}/api/universities`);
            console.log(`🤖 API для ЧАТА:       http://localhost:${PORT}/api/chat (POST)`);
            console.log(`===================================================================\n`);
        });

    } catch (error) {
        console.error('❌ Ошибка при запуске сервера или подключении к БД:', error);
        process.exit(1); 
    }
}

startServer();