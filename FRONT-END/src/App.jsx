import { Routes, Route } from 'react-router-dom';
import Layout from './Layout/Layout'; 
import DataHub from './components/DataHubApp';

export default function App() {
    return (
        <Routes>
            {/* Layout выступает оберткой для всех основных страниц */}
            <Route path="/" element={<Layout />}>
                <Route path="DataHub" element={<DataHub />} />
            </Route>
        </Routes>
    );
}
