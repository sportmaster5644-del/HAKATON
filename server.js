import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'; 
import sequelize from './config/db.js'; 
import universityRoutes from './routes/universityRoutes.js'; 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/universities', universityRoutes);

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных MySQL.');

        await sequelize.sync({ force: false }); 
        console.log('Модели синхронизированы с базой данных.');

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту: ${PORT}`);
            console.log(`API доступно по адресу: http://localhost:${PORT}/api/universities`);
        });

    } catch (error) {
        console.error('Ошибка при запуске сервера или подключении к БД:', error);
        process.exit(1); 
    }
}

startServer();