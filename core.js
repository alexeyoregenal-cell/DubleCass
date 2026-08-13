/**
 * DubleCass V20 - Core System
 * Ядро операционной системы планшета
 * Оффлайн-режим, P2P подготовка, управление аккаунтами
 */

// === КОНФИГУРАЦИЯ СИСТЕМЫ ===
const CONFIG = {
    version: '20.0',
    startRating: 10000,
    minBalance: 3500, // Неприкосновенный минимум
    charityRate: 10000, // 10к дублей = 1 рейтинг
    taxInterval: 3600000, // 1 час в мс
    maxAccounts: 3,
    adminCode: 'ADMIN'
};

// === ГЛОБАЛЬНОЕ СОСТОЯНИЕ ===
let state = {
    accounts: [],
    currentAccountId: null,
    isAdmin: false,
    isLeader: false,
    weather: null,
    logs: []
};

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ===
document.addEventListener('DOMContentLoaded', () => {
    loadDatabase();
    initClock();
    renderAccountList();
    setupEventListeners();
    
    // Проверка геолокации для погоды (один раз)
    if (!localStorage.getItem('weatherCached')) {
        fetchWeather();
    } else {
        state.weather = JSON.parse(localStorage.getItem('weatherCached'));
        updateWeatherWidget();
    }
});

// === БАЗА ДАННЫХ (LOCALSTORAGE) ===
function saveDatabase() {
    localStorage.setItem('dubleOS_db', JSON.stringify({
        accounts: state.accounts,
        logs: state.logs
    }));
}

function loadDatabase() {
    const db = localStorage.getItem('dubleOS_db');
    if (db) {
        const parsed = JSON.parse(db);
        state.accounts = parsed.accounts || [];
        state.logs = parsed.logs || [];
    } else {
        // Создаем тестового админа если база пустая
        createTestAdmin();
    }
}

function createTestAdmin() {
    const adminAccount = createAccountObject('Администратор', 'admin', true);
    adminAccount.balance = 10000000;
    adminAccount.role = 'admin';
    state.accounts.push(adminAccount);
    saveDatabase();
}

// === УПРАВЛЕНИЕ АККАУНТАМИ ===
function createAccountObject(name, surname, isAdmin = false) {
    // Логика фамилии: если пусто -> "Дубли", если занята -> "Дубли1"
    let finalSurname = surname.trim() || 'Дубли';
    
    // Проверка на занятость фамилии (упрощенно)
    const existingSurnames = state.accounts.map(a => a.surname);
    let counter = 1;
    while (existingSurnames.includes(finalSurname)) {
        finalSurname = `Дубли${counter}`;
        counter++;
    }
    
    return {
        id: Date.now().toString(),
        name: name.trim() || 'Без имени',
        surname: finalSurname,
        balance: 5000, // Стартовый баланс
        rating: CONFIG.startRating,
        role: isAdmin ? 'admin' : 'user',
        passport: null,
        job: null,
        apps: ['dublinet', 'dubligramm', 'mybank', 'settings'], // Стандартные приложения
        folderApps: {}, // Приложения по папкам
        created: new Date().toISOString()
    };
}

function renderAccountList() {
    const list = document.getElementById('account-list');
    list.innerHTML = '';
    
    state.accounts.forEach(acc => {
        const div = document.createElement('div');
        div.className = 'account-slot';
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="account-avatar">${acc.name[0].toUpperCase()}</div>
                <div style="text-align:left;">
                    <div style="font-weight:bold;">${acc.name} ${acc.surname}</div>
                    <div style="font-size:0.8rem; opacity:0.7;">${acc.role === 'admin' ? 'Администратор' : 'Гражданин'}</div>
                </div>
            </div>
            <i class="fas fa-chevron-right"></i>
        `;
        div.onclick = () => login(acc.id);
        list.appendChild(div);
    });
}

function login(accountId) {
    state.currentAccountId = accountId;
    const account = getAccount(accountId);
    
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('os-screen').classList.add('active');
    
    updateStatusBar();
    renderDesktop();
    showNotification(`Добро пожаловать, ${account.name}!`, 'success');
}

function logout() {
    state.currentAccountId = null;
    state.isAdmin = false;
    state.isLeader = false;
    
    document.getElementById('os-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('app-window').classList.add('hidden');
    
    renderAccountList();
}

function getAccount(id = state.currentAccountId) {
    return state.accounts.find(a => a.id === id);
}

function saveAccount(account) {
    const index = state.accounts.findIndex(a => a.id === account.id);
    if (index !== -1) {
        state.accounts[index] = account;
        saveDatabase();
        updateStatusBar();
    }
}

// === СОЗДАНИЕ АККАУНТА (МОДАЛКА) ===
function showCreateAccountModal() {
    const modal = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    
    document.getElementById('modal-title').innerText = 'Новый пользователь';
    body.innerHTML = `
        <input type="text" id="new-name" placeholder="Имя (обязательно)">
        <input type="text" id="new-surname" placeholder="Фамилия (необязательно)">
        <input type="date" id="new-birthdate" placeholder="Дата рождения">
        <p style="font-size:0.8rem; opacity:0.7; margin-top:5px;">* Фамилия "Дубли" будет присвоена автоматически, если поле пустое</p>
    `;
    
    modal.classList.remove('hidden');
    
    document.getElementById('modal-confirm').onclick = () => {
        const name = document.getElementById('new-name').value;
        const surname = document.getElementById('new-surname').value;
        const birthdate = document.getElementById('new-birthdate').value;
        
        if (!name) {
            alert('Имя обязательно!');
            return;
        }
        if (!birthdate) {
            alert('Дата рождения обязательна!');
            return;
        }
        
        if (state.accounts.length >= CONFIG.maxAccounts) {
            alert('Максимум 3 аккаунта! Удалите старый.');
            return;
        }
        
        const newAcc = createAccountObject(name, surname);
        newAcc.birthdate = birthdate;
        state.accounts.push(newAcc);
        saveDatabase();
        
        modal.classList.add('hidden');
        renderAccountList();
        showNotification('Аккаунт создан!', 'success');
    };
    
    document.getElementById('modal-cancel').onclick = () => {
        modal.classList.add('hidden');
    };
}

// === АДМИН ПАНЕЛЬ ===
function checkAdminAccess() {
    const code = document.getElementById('admin-code').value;
    if (code === CONFIG.adminCode) {
        state.isAdmin = true;
        // Находим аккаунт админа или создаем временную сессию
        const adminAcc = state.accounts.find(a => a.role === 'admin');
        if (adminAcc) {
            login(adminAcc.id);
            showNotification('Режим Администратора активирован', 'warning');
        } else {
            showNotification('Аккаунт админа не найден', 'error');
        }
    } else {
        showNotification('Неверный код доступа', 'error');
    }
}

// === ИНТЕРФЕЙС И УВЕДОМЛЕНИЯ ===
function showNotification(text, type = 'info') {
    const area = document.getElementById('notification-area');
    const notif = document.createElement('div');
    notif.className = 'notification';
    
    let icon = 'info-circle';
    let color = 'var(--primary-color)';
    
    if (type === 'success') { icon = 'check-circle'; color = 'var(--success-color)'; }
    if (type === 'error') { icon = 'exclamation-circle'; color = 'var(--danger-color)'; }
    if (type === 'warning') { icon = 'exclamation-triangle'; color = '#ffc107'; }
    
    notif.style.borderLeftColor = color;
    notif.innerHTML = `<i class="fas fa-${icon}" style="color:${color}"></i> <span>${text}</span>`;
    
    area.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

function updateStatusBar() {
    const acc = getAccount();
    if (!acc) return;
    
    document.getElementById('current-user-name').innerText = `${acc.name} ${acc.surname}`;
    document.getElementById('user-balance-mini').innerText = `${acc.balance.toLocaleString()} Ð`;
    
    // Обновляем иконку если админ
    if (acc.role === 'admin') {
        document.getElementById('current-user-name').style.color = 'var(--primary-color)';
    }
}

function initClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'});
    }, 1000);
}

function updateWeatherWidget() {
    if (!state.weather) return;
    const widget = document.getElementById('weather-widget');
    widget.innerHTML = `<i class="fas fa-${state.weather.icon}"></i> ${state.weather.temp}°C`;
}

async function fetchWeather() {
    // Реальная погода через геолокацию (если есть сеть)
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                // Используем открытый API (можно заменить на свой оффлайн источник)
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current_weather=true`);
                const data = await response.json();
                
                state.weather = {
                    temp: Math.round(data.current_weather.temperature),
                    icon: data.current_weather.weathercode < 3 ? 'sun' : 'cloud'
                };
                
                localStorage.setItem('weatherCached', JSON.stringify(state.weather));
                updateWeatherWidget();
            } catch (e) {
                console.log('Нет сети для погоды, используем дефолт');
                state.weather = { temp: 20, icon: 'cloud' };
                updateWeatherWidget();
            }
        });
    }
}

// === ОБРАБОТЧИКИ СОБЫТИЙ ===
function setupEventListeners() {
    document.getElementById('add-account-btn').onclick = showCreateAccountModal;
    document.getElementById('check-admin-btn').onclick = checkAdminAccess;
    document.getElementById('logout-btn').onclick = logout;
    
    // Закрытие приложений
    document.getElementById('close-app-btn').onclick = () => {
        document.getElementById('app-window').classList.add('hidden');
    };
}

// === РЕНДЕРИНГ РАБОЧЕГО СТОЛА И ПАПОК ===
const APP_REGISTRY = {
    'dublinet': { name: 'ДублиНет', icon: 'fa-globe', color: '#4285F4', folder: 'internet' },
    'dubligramm': { name: 'ДублиГрамм', icon: 'fa-paper-plane', color: '#0088cc', folder: 'social' },
    'mybank': { name: 'Мой Банк', icon: 'fa-university', color: '#28a745', folder: 'finance' },
    'settings': { name: 'Настройки', icon: 'fa-cog', color: '#6c757d', folder: 'system' },
    'passport': { name: 'Паспорт', icon: 'fa-id-card', color: '#fd7e14', folder: 'gov' },
    'work': { name: 'Работа', icon: 'fa-briefcase', color: '#6f42c1', folder: 'work' },
    'avito': { name: 'Авито', icon: 'fa-store', color: '#95a5a6', folder: 'shopping' },
    'casino': { name: 'Казино', icon: 'fa-dice', color: '#e83e8c', folder: 'fun' },
    'map': { name: 'Земля', icon: 'fa-map-marked-alt', color: '#20c997', folder: 'gov' },
    'court': { name: 'Суд', icon: 'fa-gavel', color: '#343a40', folder: 'gov' },
    'fsb': { name: 'ФСБ', icon: 'fa-user-secret', color: '#000000', folder: 'special' },
    'mvd': { name: 'МВД', icon: 'fa-shield-alt', color: '#0056b3', folder: 'special' },
    'business': { name: 'Бизнес', icon: 'fa-chart-line', color: '#ffc107', folder: 'work' },
    'crypto': { name: 'Биржа', icon: 'fa-bitcoin', color: '#f39c12', folder: 'finance' },
    'dubliplay': { name: 'DublePlay', icon: 'fa-th-large', color: '#6610f2', folder: 'fun' },
    'mail': { name: 'Почта', icon: 'fa-envelope', color: '#d63384', folder: 'internet' },
    'ai': { name: 'DubleAI', icon: 'fa-brain', color: '#20c997', folder: 'system' }
};

const FOLDERS = {
    'gov': { name: 'Госуслуги', icon: 'fa-landmark' },
    'finance': { name: 'Финансы', icon: 'fa-wallet' },
    'social': { name: 'Соцсети', icon: 'fa-users' },
    'internet': { name: 'Интернет', icon: 'fa-wifi' },
    'work': { name: 'Работа', icon: 'fa-briefcase' },
    'shopping': { name: 'Магазины', icon: 'fa-shopping-bag' },
    'fun': { name: 'Развлечения', icon: 'fa-gamepad' },
    'special': { name: 'Спецслужбы', icon: 'fa-user-shield' },
    'system': { name: 'Система', icon: 'fa-cogs' }
};

function renderDesktop() {
    const grid = document.getElementById('app-grid');
    grid.innerHTML = '';
    
    const acc = getAccount();
    if (!acc) return;
    
    // Группируем приложения по папкам
    const folderContents = {};
    const directApps = [];
    
    acc.apps.forEach(appId => {
        const appInfo = APP_REGISTRY[appId];
        if (appInfo) {
            if (appInfo.folder) {
                if (!folderContents[appInfo.folder]) folderContents[appInfo.folder] = [];
                folderContents[appInfo.folder].push({ id: appId, ...appInfo });
            } else {
                directApps.push({ id: appId, ...appInfo });
            }
        }
    });
    
    // Рендерим папки
    Object.keys(folderContents).forEach(folderKey => {
        const folder = FOLDERS[folderKey];
        if (folder) {
            const folderEl = document.createElement('div');
            folderEl.className = 'app-icon folder-icon';
            folderEl.innerHTML = `
                <div class="icon-box"><i class="fas ${folder.icon}"></i></div>
                <div class="app-name">${folder.name}</div>
            `;
            
            // Клик по папке открывает содержимое (упрощенно - добавляет иконки внутрь)
            folderEl.onclick = () => openFolder(folder.name, folderContents[folderKey]);
            grid.appendChild(folderEl);
        }
    });
    
    // Рендерим отдельные приложения
    directApps.forEach(app => {
        const el = document.createElement('div');
        el.className = 'app-icon';
        el.innerHTML = `
            <div class="icon-box" style="background: ${app.color}"><i class="fas ${app.icon}"></i></div>
            <div class="app-name">${app.name}</div>
        `;
        el.onclick = () => openApp(app.id);
        grid.appendChild(el);
    });
}

function openFolder(name, apps) {
    // В реальной OS это открыло бы окно папки
    // Здесь мы просто покажем алерт или добавим временные иконки на стол
    showNotification(`Папка: ${name}`, 'info');
    // Можно реализовать модальное окно папки
}

function openApp(appId) {
    const appWindow = document.getElementById('app-window');
    const appTitle = document.getElementById('app-title');
    const appContent = document.getElementById('app-content');
    
    const appInfo = APP_REGISTRY[appId];
    if (!appInfo) return;
    
    appTitle.innerText = appInfo.name;
    appContent.innerHTML = '<div style="text-align:center; padding:50px;"><i class="fas fa-spinner fa-spin fa-3x"></i><p>Загрузка...</p></div>';
    
    appWindow.classList.remove('hidden');
    
    // Динамическая загрузка контента приложения
    loadAppContent(appId, appContent);
}

// Эта функция будет переопределена в apps.js для загрузки реального контента
window.loadAppContent = function(appId, container) {
    container.innerHTML = `<div style="padding:20px; text-align:center;"><h3>Приложение "${appId}"</h3><p>Контент загружается из apps.js...</p><button class="btn-primary" onclick="document.getElementById('app-window').classList.add('hidden')">Закрыть</button></div>`;
};

// Экспорт функций для других модулей
window.OS = {
    getState: () => state,
    getAccount: getAccount,
    saveAccount: saveAccount,
    showNotification: showNotification,
    openApp: openApp,
    CONFIG: CONFIG
};
