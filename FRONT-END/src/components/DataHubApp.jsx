import React, { useState, useEffect, useMemo, useCallback } from 'react';

const API_ENDPOINT = 'http://localhost:4000/api/universities';

const iconPaths = {
    Filter: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    Search: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    X: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    DollarSign: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    Award: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 15a6 6 0 0 0 9-3 6 6 0 0 0-9-3"/><path d="M12 15a6 6 0 0 1-9-3 6 6 0 0 1 9-3"/><path d="M10 21.4c.1.2.3.4.6.4h2.8c.3 0 .5-.2.6-.4L12 17.6l-2 3.8z"/></svg>,
    MapPin: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 21.7c4.4-4 8-8.2 8-12.2a8 8 0 1 0-16 0c0 4 3.6 8.2 8 12.2z"/><circle cx="12" cy="10" r="3"/></svg>,
    Menu: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    CheckCircle: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    GraduationCap: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12l2 1 2-1M12 15l-10-5M12 15v7"/></svg>,
    Clock: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    Globe: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    Users: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    TrendingUp: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="18 7 22 7 22 11"/></svg>,
    Briefcase: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    ChevronDown: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>,
    Box: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    ExternalLink: (size, className) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
};

const Icon = ({ name, size = 24, className = '' }) => {
    const IconComponent = iconPaths[name];
    if (!IconComponent) return null;
    return IconComponent(size, className);
};

const STATS_MAP = {
    Алматы: { color: 'bg-red-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Астана: { color: 'bg-blue-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Караганда: { color: 'bg-green-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Шымкент: { color: 'bg-yellow-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Тараз: { color: 'bg-purple-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Атырау: { color: 'bg-pink-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Туркестан: { color: 'bg-indigo-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Актобе: { color: 'bg-orange-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Актау: { color: 'bg-sky-500', count: 0, avg_unt: 0, total_tuition: 0 },
    'Усть-Каменогорск': { color: 'bg-gray-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Петропавловск: { color: 'bg-teal-500', count: 0, avg_unt: 0, total_tuition: 0 },
    Уральск: { color: 'bg-amber-500', count: 0, avg_unt: 0, total_tuition: 0 },
};

const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Н/Д';
    return `${(price * 1000).toLocaleString('ru-RU')} ₸`;
};

const UniversityCard = ({ uni, onClick }) => {
    const tuitionRange = `${formatPrice(uni.tuition_min_kzt)} - ${formatPrice(uni.tuition_max_kzt)}`;
    const dormitory = uni.dormitory_available ? (uni.dormitory_cost_min_kzt ? `от ${formatPrice(uni.dormitory_cost_min_kzt)}/мес.` : 'Есть') : 'Нет';
    const hasTour = uni.virtual_tour_url && uni.virtual_tour_url !== '#';

    return (
        <div onClick={() => onClick(uni)} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 flex flex-col space-y-4 border border-gray-100 cursor-pointer relative overflow-hidden">
            {hasTour && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 flex items-center shadow-sm">
                    <Icon name="Box" size={14} className="mr-1" />
                    3D-тур
                </div>
            )}

            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full text-white ${uni.logo_bg || 'bg-gray-600'} flex-shrink-0 shadow-md`}>
                    <Icon name="GraduationCap" size={24} />
                </div>
                <div className="flex-grow pr-16">
                    <h2 className="text-xl font-bold text-gray-900 leading-snug">{uni.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">{uni.shortName} | {uni.type}</p>
                </div>
            </div>

            <p className="text-sm text-gray-700 italic line-clamp-3">
                {uni.mission}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-700">
                    <Icon name="MapPin" size={16} className="text-indigo-500" />
                    <span>{uni.city}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                    <Icon name="Award" size={16} className="text-yellow-500" />
                    <span className="truncate">{uni.ranking}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                    <Icon name="DollarSign" size={16} className="text-green-500" />
                    <span className="font-semibold">{tuitionRange}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700">
                    <Icon name="CheckCircle" size={16} className={uni.dormitory_available ? "text-teal-500" : "text-red-500"} />
                    <span>Общ.: {dormitory}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 col-span-2">
                    <Icon name="TrendingUp" size={16} className="text-fuchsia-500" />
                    <span>
                        <span className="font-medium">ЕНТ:</span> {uni.unt_min_score}+
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
                {uni.focus && uni.focus.slice(0, 3).map((focus, index) => (
                    <span key={index} className="px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                        {focus}
                    </span>
                ))}
            </div>

            <button className="mt-auto w-full text-center bg-gray-50 text-indigo-600 border border-indigo-200 py-2 rounded-lg font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-200">
                Подробнее
            </button>
        </div>
    );
};

const FilterSidebar = ({ filters, setFilters, uniqueCities, uniqueTypes, uniqueFocus }) => {
    const handleFilterChange = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
        }));
    }, [setFilters]);

    const handleFocusToggle = useCallback((focus) => {
        setFilters(prev => {
            const currentFocus = prev.focus || [];
            if (currentFocus.includes(focus)) {
                return { ...prev, focus: currentFocus.filter(f => f !== focus) };
            } else {
                return { ...prev, focus: [...currentFocus, focus] };
            }
        });
    }, [setFilters]);

    const handleUntRangeChange = useCallback((e) => {
        const value = e.target.value === '' ? null : Number(e.target.value);
        setFilters(prev => ({
            ...prev,
            unt_min_score: value,
        }));
    }, [setFilters]);

    const cityOptions = useMemo(() => ['Все', ...uniqueCities].map(city => ({ value: city, label: city })), [uniqueCities]);
    const typeOptions = useMemo(() => ['Все', ...uniqueTypes].map(type => ({ value: type, label: type })), [uniqueTypes]);

    const FilterDropdown = ({ title, options, filterKey }) => (
        <div className="mb-4 bg-white p-3 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                {title}
            </label>
            <select
                value={filters[filterKey]}
                onChange={(e) => handleFilterChange(filterKey, e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none bg-gray-50 border"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="p-4 bg-gray-50 rounded-xl space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Icon name="Filter" size={20} className="mr-2 text-indigo-600" />
                Фильтры
            </h3>

            <div className="space-y-4">
                <FilterDropdown title="Город" options={cityOptions} filterKey="city" />
                <FilterDropdown title="Тип ВУЗа" options={typeOptions} filterKey="type" />

                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <label htmlFor="unt_min_score" className="block text-sm font-medium text-gray-700 mb-2">
                        Мин. балл ЕНТ ({filters.unt_min_score || 'Любой'})
                    </label>
                    <input
                        type="range"
                        id="unt_min_score"
                        min="50"
                        max="140"
                        step="5"
                        value={filters.unt_min_score || 50}
                        onChange={handleUntRangeChange}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>50</span>
                        <span>140+</span>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Направление</h4>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2">
                        {uniqueFocus.map(focus => (
                            <button
                                key={focus}
                                onClick={() => handleFocusToggle(focus)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-150 ${
                                    filters.focus && filters.focus.includes(focus)
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'
                                }`}
                            >
                                {focus}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            id="dormitory"
                            checked={filters.dormitory_available}
                            onChange={(e) => handleFilterChange('dormitory_available', e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="dormitory" className="ml-2 text-sm font-medium text-gray-700">
                            Только с общежитием
                        </label>
                    </div>
                </div>

                <button
                    onClick={() => setFilters({ search: filters.search, city: 'Все', type: 'Все', focus: [], unt_min_score: null, dormitory_available: false })}
                    className="w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                >
                    <Icon name="X" size={18} className="mr-2" />
                    Сбросить все
                </button>
            </div>
        </div>
    );
};

const UniversityStats = ({ universities }) => {
    const stats = useMemo(() => {
        const cityStats = JSON.parse(JSON.stringify(STATS_MAP));
        let totalUnt = 0;
        let totalTuition = 0;

        universities.forEach(uni => {
            const city = uni.city;
            if (cityStats[city]) {
                cityStats[city].count++;
                cityStats[city].avg_unt += uni.unt_min_score || 0;
                cityStats[city].total_tuition += uni.tuition_min_kzt || 0;
            }
            totalUnt += uni.unt_min_score || 0;
            totalTuition += uni.tuition_min_kzt || 0;
        });

        const activeCities = Object.entries(cityStats)
            .filter(([, s]) => s.count > 0)
            .map(([city, s]) => ({ city, ...s }));
        
        const totalCount = universities.length;
        const avgUntGlobal = totalCount > 0 ? (totalUnt / totalCount).toFixed(1) : 0;
        const avgTuitionGlobal = totalCount > 0 ? formatPrice(totalTuition / totalCount) : 'Н/Д';

        return {
            totalCount,
            avgUntGlobal,
            avgTuitionGlobal,
            cityStats: activeCities.map(s => ({
                ...s,
                avg_unt: (s.count > 0 ? (s.avg_unt / s.count).toFixed(1) : 0),
                avg_tuition: s.count > 0 ? formatPrice(s.total_tuition / s.count) : 'Н/Д',
            })).sort((a, b) => b.count - a.count)
        };
    }, [universities]);

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg space-y-4 border border-indigo-100 mb-6">
            <h3 className="text-xl font-bold text-indigo-700 flex items-center">
                <Icon name="TrendingUp" size={20} className="mr-2" />
                Сводная аналитика
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-extrabold text-indigo-600">{stats.totalCount}</p>
                    <p className="text-xs text-gray-500 mt-1">Найдено ВУЗов</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-extrabold text-indigo-600">{stats.avgUntGlobal}</p>
                    <p className="text-xs text-gray-500 mt-1">Средний ЕНТ</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-extrabold text-indigo-600 truncate pt-2">{stats.avgTuitionGlobal}</p>
                    <p className="text-xs text-gray-500 mt-1">Средняя Мин. Цена</p>
                </div>
            </div>

            <div className="space-y-3 pt-3">
                <h4 className="text-sm font-semibold text-gray-700">Топ Города по количеству ВУЗов:</h4>
                {stats.cityStats.slice(0, 5).map(city => (
                    <div key={city.city} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${city.color}`}></span>
                            <span className="text-gray-700">{city.city} ({city.count})</span>
                        </div>
                        <span className="text-gray-500 text-xs">Средний ЕНТ: {city.avg_unt}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const UniversityDetailModal = ({ uni, onClose }) => {
    if (!uni) return null;

    const admission = uni.admission || {};
    const cooperation = uni.cooperation || {};
    const hasTour = uni.virtual_tour_url && uni.virtual_tour_url !== '#';

    const StatItem = ({ Icon, title, value }) => (
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
            <Icon size={20} className="text-indigo-600 flex-shrink-0 mt-1" />
            <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{title}</p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{value}</p>
            </div>
        </div>
    );

    const formatTuition = (min, max) => `${formatPrice(min)} - ${formatPrice(max)}`;
    const formatDormitory = (cost) => cost ? `от ${formatPrice(cost)} в мес.` : 'Нет данных';

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 md:scale-100 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="sticky top-0 bg-indigo-600 p-4 flex justify-between items-center z-20 shadow-md">
                    <h2 className="text-xl md:text-2xl font-bold text-white truncate pr-4">{uni.name}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors bg-white/10 p-1 rounded-full">
                        <Icon name="X" size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center space-x-2 text-indigo-600 font-medium">
                            <span className="bg-indigo-50 px-3 py-1 rounded-full text-sm">{uni.type}</span>
                            <span className="text-gray-400">•</span>
                            <span>{uni.city}</span>
                        </div>
                        
                        <p className="text-lg text-gray-700 leading-relaxed border-l-4 border-indigo-500 pl-4 bg-gray-50 py-2 rounded-r-lg">
                            {uni.mission}
                        </p>
                    </section>

                    {hasTour && (
                        <section className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg group cursor-pointer bg-gradient-to-br from-indigo-900 to-purple-900">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-30 transition-opacity duration-500"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center z-10">
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300 border border-white/30">
                                    <Icon name="Box" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold mb-1 shadow-black drop-shadow-lg">Виртуальный 3D-тур</h3>
                                <p className="text-sm text-indigo-100 max-w-md shadow-black drop-shadow-md">Прогуляйтесь по кампусу, загляните в аудитории и лаборатории, не выходя из дома.</p>
                                <a 
                                    href={uni.virtual_tour_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="mt-4 px-6 py-2 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-lg flex items-center"
                                >
                                    Начать тур <Icon name="ExternalLink" size={16} className="ml-2" />
                                </a>
                            </div>
                        </section>
                    )}

                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatItem Icon={(props) => <Icon name="DollarSign" {...props} />} title="Стоимость (год)" value={formatTuition(uni.tuition_min_kzt, uni.tuition_max_kzt)} />
                        <StatItem Icon={(props) => <Icon name="Award" {...props} />} title="Рейтинг" value={`${uni.ranking} место`} />
                        <StatItem Icon={(props) => <Icon name="Users" {...props} />} title="Студентов" value={uni.students_count ? uni.students_count.toLocaleString('ru-RU') : 'Н/Д'} />
                        <StatItem Icon={(props) => <Icon name="GraduationCap" {...props} />} title="Мин. балл ЕНТ" value={uni.unt_min_score} />
                        <StatItem Icon={(props) => <Icon name="Clock" {...props} />} title="Общежитие" value={uni.dormitory_available ? `Есть (${formatDormitory(uni.dormitory_cost_min_kzt)})` : 'Нет'} />
                        <StatItem Icon={(props) => <Icon name="Briefcase" {...props} />} title="Направления" value={uni.focus ? uni.focus.slice(0, 2).join(', ') + '...' : 'Н/Д'} />
                    </section>

                    <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Icon name="CheckCircle" size={20} className="text-indigo-600 mr-2" />
                            Поступление и финансы
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Процедура</span>
                                <p className="text-sm text-gray-800 mt-1">{admission.procedures || 'Информация отсутствует'}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Гранты и скидки</span>
                                <p className="text-sm text-gray-800 mt-1">{admission.finance || 'Информация отсутствует'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                         <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Icon name="Globe" size={20} className="text-blue-600 mr-2" />
                            Международные связи
                        </h3>
                         <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <p className="text-sm text-gray-800">
                                <span className="font-semibold text-blue-800">Партнеры:</span> {cooperation.partners ? cooperation.partners.join(', ') : 'Нет данных'}
                            </p>
                            <p className="text-sm text-gray-800 mt-2">
                                <span className="font-semibold text-blue-800">Обмен:</span> {cooperation.exchange || 'Нет данных'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App = () => {
    const [universities, setUniversities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        city: 'Все',
        type: 'Все',
        focus: [],
        unt_min_score: null,
        dormitory_available: false,
    });
    const [selectedUni, setSelectedUni] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            const fetchWithRetry = async (url, options, retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url, options);
                        if (!response.ok) {
                            throw new Error(`Ошибка HTTP: ${response.status}`);
                        }
                        return response;
                    } catch (err) {
                        if (i < retries - 1) {
                            const delay = Math.pow(2, i) * 1000;
                            await new Promise(resolve => setTimeout(resolve, delay));
                        } else {
                            throw err;
                        }
                    }
                }
            };
            
            try {
                const response = await fetchWithRetry(API_ENDPOINT);
                
                const rawData = await response.json();
                
                const processedData = rawData.map(uni => ({
                    ...uni,
                    admission: typeof uni.admission === 'string' ? JSON.parse(uni.admission) : uni.admission,
                    cooperation: typeof uni.cooperation === 'string' ? JSON.parse(uni.cooperation) : uni.cooperation
                }));

                setUniversities(processedData);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError(`Не удалось загрузить данные: ${err.message}. Проверьте доступность бэкенда по адресу ${API_ENDPOINT}.`);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const uniqueCities = useMemo(() => {
        const cities = universities.map(uni => uni.city).filter(Boolean);
        return [...new Set(cities)].sort();
    }, [universities]);

    const uniqueTypes = useMemo(() => {
        const types = universities.map(uni => uni.type).filter(Boolean);
        return [...new Set(types)].sort();
    }, [universities]);

    const uniqueFocus = useMemo(() => {
        const focusAreas = universities.flatMap(uni => uni.focus || []).filter(Boolean);
        return [...new Set(focusAreas)].sort();
    }, [universities]);

    const filteredUniversities = useMemo(() => {
        return universities.filter(uni => {
            const searchLower = filters.search.toLowerCase();
            const matchesSearch = uni.name.toLowerCase().includes(searchLower) ||
                                  uni.shortName.toLowerCase().includes(searchLower) ||
                                  (uni.focus && uni.focus.some(f => f.toLowerCase().includes(searchLower)));

            const matchesCity = filters.city === 'Все' || uni.city === filters.city;
            const matchesType = filters.type === 'Все' || uni.type === filters.type;
            const matchesFocus = filters.focus.length === 0 || (uni.focus && filters.focus.every(f => uni.focus.includes(f)));
            const matchesUnt = filters.unt_min_score === null || uni.unt_min_score >= filters.unt_min_score;
            const matchesDormitory = !filters.dormitory_available || uni.dormitory_available === true;

            return matchesSearch && matchesCity && matchesType && matchesFocus && matchesUnt && matchesDormitory;
        }).sort((a, b) => b.unt_min_score - a.unt_min_score);
    }, [universities, filters]);

    const handleSearchChange = useCallback((e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    }, []);

    const handleCardClick = useCallback((uni) => {
        setSelectedUni(uni);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedUni(null);
    }, []);

    const handleFilterToggle = useCallback(() => {
        setIsFilterOpen(prev => !prev);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
            <style jsx global>{`
                html { scroll-behavior: smooth; }
                body { margin: 0; background-color: #f9fafb; }
            `}</style>

            <header className="sticky top-0 bg-white shadow-md z-30 p-4 border-b border-indigo-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex justify-between items-center w-full md:w-auto">
                        <h1 className="text-2xl font-extrabold text-indigo-700 flex items-center cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                            <Icon name="GraduationCap" size={30} className="mr-2 text-indigo-500" />
                            DataHub ВУЗ-ов "РК"
                        </h1>
                        <button
                            onClick={handleFilterToggle}
                            className="md:hidden p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                        >
                            <Icon name="Menu" size={24} />
                        </button>
                    </div>
                    
                    <div className="relative w-full md:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon name="Search" size={20} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск ВУЗа, специальности..."
                            value={filters.search}
                            onChange={handleSearchChange}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-shadow duration-200 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-6">
                <aside className={`
                    fixed md:sticky top-0 left-0 w-full md:w-80 h-full md:h-[calc(100vh-100px)] md:top-24 bg-white md:bg-transparent z-40 transition-transform duration-300 ease-in-out transform
                    ${isFilterOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    overflow-y-auto p-4 md:p-0 shadow-2xl md:shadow-none
                `}>
                    <div className="md:hidden flex justify-end mb-4">
                        <button onClick={handleFilterToggle} className="p-2 bg-gray-200 rounded-full">
                            <Icon name="X" size={24} />
                        </button>
                    </div>
                    <FilterSidebar
                        filters={filters}
                        setFilters={setFilters}
                        uniqueCities={uniqueCities}
                        uniqueTypes={uniqueTypes}
                        uniqueFocus={uniqueFocus}
                    />
                </aside>

                <div className="flex-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                            <p className="text-indigo-600 font-semibold animate-pulse">Загрузка университетов...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Icon name="X" size={24} className="text-red-500" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <UniversityStats universities={filteredUniversities} />
                            
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Результаты: {filteredUniversities.length}
                                </h2>
                            </div>

                            {filteredUniversities.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                                    <Icon name="Search" size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-xl text-gray-500 font-medium">По вашему запросу ничего не найдено</p>
                                    <button 
                                        onClick={() => setFilters({ search: '', city: 'Все', type: 'Все', focus: [], unt_min_score: null, dormitory_available: false })}
                                        className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                                    >
                                        Сбросить фильтры
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {filteredUniversities.map(uni => (
                                        <UniversityCard key={uni.id} uni={uni} onClick={handleCardClick} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {selectedUni && (
                <UniversityDetailModal uni={selectedUni} onClose={handleCloseModal} />
            )}

            {isFilterOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
                    onClick={handleFilterToggle}
                ></div>
            )}
        </div>
    );
};

export default App;