/**
 * DubleCass V20 - Приложения
 * Все приложения системы: Банк, Мессенджер, Госуслуги, Бизнес и др.
 */

// Переопределяем функцию загрузки контента
window.loadAppContent = function(appId, container) {
    const app = APP_HANDLERS[appId];
    if (app && app.render) {
        app.render(container);
    } else {
        container.innerHTML = `
            <div style="padding:40px; text-align:center;">
                <i class="fas fa-exclamation-triangle fa-3x" style="color:var(--danger-color)"></i>
                <h3>Приложение не найдено</h3>
                <p>Приложение "${appId}" еще не разработано или удалено.</p>
                <button class="btn-primary" onclick="document.getElementById('app-window').classList.add('hidden')">Закрыть</button>
            </div>
        `;
    }
};

// === ОБРАБОТЧИКИ ПРИЛОЖЕНИЙ ===
const APP_HANDLERS = {
    
    // 1. НАСТРОЙКИ
    'settings': {
        render: (container) => {
            const acc = OS.getAccount();
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-user"></i> Профиль</h3>
                    <p><strong>Имя:</strong> ${acc.name} ${acc.surname}</p>
                    <p><strong>ID:</strong> ${acc.id}</p>
                    <p><strong>Рейтинг:</strong> ${acc.rating}</p>
                    <p><strong>Дата создания:</strong> ${new Date(acc.created).toLocaleDateString()}</p>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-palette"></i> Оформление</h3>
                    <div class="row">
                        <span>Тёмная тема</span>
                        <input type="checkbox" checked disabled>
                    </div>
                    <p style="font-size:0.8rem; opacity:0.7;">Тёмная тема включена по умолчанию для экономии батареи.</p>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-database"></i> Данные</h3>
                    <button class="btn-primary" onclick="exportData()"><i class="fas fa-download"></i> Экспорт базы (JSON)</button>
                    <button class="btn-secondary" onclick="importData()"><i class="fas fa-upload"></i> Импорт базы</button>
                    <input type="file" id="import-file" style="display:none" onchange="processImport(this)">
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-info-circle"></i> О системе</h3>
                    <p>DubleCass OS v${OS.CONFIG.version}</p>
                    <p>Оффлайн-режим активен</p>
                </div>
            `;
        }
    },
    
    // 2. МОЙ БАНК (Как Сбербанк)
    'mybank': {
        render: (container) => {
            const acc = OS.getAccount();
            container.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, #007bff, #00d2ff); color:white;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <p style="opacity:0.8; font-size:0.9rem;">Баланс карты</p>
                            <h2 style="font-size:2rem;">${acc.balance.toLocaleString()} Ð</h2>
                        </div>
                        <i class="fas fa-university fa-3x" style="opacity:0.3;"></i>
                    </div>
                    <div style="margin-top:15px; font-size:0.8rem;">
                        **** 4582 &nbsp;&bull; Срок: 12/28
                    </div>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button class="btn-primary" onclick="bankAction('transfer')"><i class="fas fa-exchange-alt"></i> Перевод</button>
                    <button class="btn-primary" style="background:var(--success-color)" onclick="bankAction('deposit')"><i class="fas fa-plus"></i> Пополнить</button>
                    <button class="btn-primary" style="background:var(--warning-color); color:#000" onclick="bankAction('history')"><i class="fas fa-history"></i> История</button>
                    <button class="btn-primary" style="background:var(--danger-color)" onclick="bankAction('credit')"><i class="fas fa-hand-holding-usd"></i> Кредиты</button>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-percent"></i> Вклады</h3>
                    <p>У вас нет активных вкладов.</p>
                    <button class="btn-secondary" style="width:100%; margin-top:10px;">Открыть вклад</button>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-coins"></i> Обмен валют</h3>
                    <div class="row">
                        <span>Ð → ₽</span>
                        <span style="color:var(--danger-color)">Запрещено ЦБ</span>
                    </div>
                    <div class="row">
                        <span>Ð → $DUB</span>
                        <span>1 Ð = 0.5 $DUB</span>
                    </div>
                    <button class="btn-primary" onclick="bankAction('exchange')">Обменять</button>
                </div>
            `;
        }
    },
    
    // 3. ДУБЛИГРАММ (Мессенджер как Telegram)
    'dubligramm': {
        render: (container) => {
            container.innerHTML = `
                <div style="display:flex; height:calc(100vh - 100px);">
                    <!-- Список чатов -->
                    <div style="width:30%; border-right:1px solid rgba(255,255,255,0.1); overflow-y:auto;">
                        <div style="padding:10px;">
                            <input type="text" placeholder="Поиск @username" style="border-radius:20px; padding-left:15px;">
                        </div>
                        
                        <div class="chat-item" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;">
                            <div style="display:flex; gap:10px;">
                                <div style="width:40px; height:40px; background:#0088cc; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;"><i class="fas fa-bullhorn"></i></div>
                                <div>
                                    <div style="font-weight:bold;">Новости DubleNet</div>
                                    <div style="font-size:0.8rem; opacity:0.7;">Добро пожаловать в систему...</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chat-item" style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;">
                            <div style="display:flex; gap:10px;">
                                <div style="width:40px; height:40px; background:#28a745; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;"><i class="fas fa-users"></i></div>
                                <div>
                                    <div style="font-weight:bold;">Рабочий чат</div>
                                    <div style="font-size:0.8rem; opacity:0.7;">Иван: Когда сдача проекта?</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Окно чата -->
                    <div style="flex:1; display:flex; flex-direction:column;">
                        <div style="padding:15px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">
                            <div style="width:35px; height:35px; background:#0088cc; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;"><i class="fas fa-bullhorn"></i></div>
                            <div>
                                <div style="font-weight:bold;">Новости DubleNet</div>
                                <div style="font-size:0.7rem; opacity:0.7;">12 453 подписчика</div>
                            </div>
                        </div>
                        
                        <div style="flex:1; padding:15px; overflow-y:auto;" id="chat-messages">
                            <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:10px; max-width:80%;">
                                Добро пожаловать в DubleGramm! 🎉
                                <div style="font-size:0.7rem; opacity:0.5; text-align:right; margin-top:5px;">10:00</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px; margin-bottom:10px; max-width:80%;">
                                Это официальный канал новостей системы. Здесь публикуются обновления и важные объявления.
                                <div style="font-size:0.7rem; opacity:0.5; text-align:right; margin-top:5px;">10:01</div>
                            </div>
                        </div>
                        
                        <div style="padding:10px; border-top:1px solid rgba(255,255,255,0.1);">
                            <div style="display:flex; gap:10px;">
                                <input type="text" placeholder="Написать сообщение..." id="msg-input" style="flex:1; border-radius:20px;">
                                <button class="btn-primary" style="width:auto; border-radius:50%; padding:10px 15px;" onclick="sendMessage()"><i class="fas fa-paper-plane"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // 4. ПАСПОРТ
    'passport': {
        render: (container) => {
            const acc = OS.getAccount();
            const hasPassport = acc.passport !== null;
            
            container.innerHTML = `
                <div class="card" style="${hasPassport ? 'border: 2px solid var(--success-color);' : ''}">
                    <h3><i class="fas fa-id-card"></i> Паспорт гражданина</h3>
                    ${hasPassport ? `
                        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:10px; margin:15px 0;">
                            <div class="row"><span>ФИО:</span> <strong>${acc.surname} ${acc.name}</strong></div>
                            <div class="row"><span>Дата рождения:</span> <strong>${acc.birthdate || 'Не указана'}</strong></div>
                            <div class="row"><span>Серия/Номер:</span> <strong>${acc.passport.series} ${acc.passport.number}</strong></div>
                            <div class="row"><span>Выдан:</span> <strong>МВД DubleLand</strong></div>
                            <div class="row"><span>Дата выдачи:</span> <strong>${acc.passport.issueDate}</strong></div>
                        </div>
                        <div style="text-align:center;">
                            <i class="fas fa-check-circle fa-3x" style="color:var(--success-color)"></i>
                            <p style="margin-top:10px;">Паспорт действителен</p>
                        </div>
                    ` : `
                        <div style="text-align:center; padding:20px;">
                            <i class="fas fa-id-card fa-3x" style="opacity:0.3; margin-bottom:15px;"></i>
                            <p>У вас нет паспорта</p>
                            <p style="font-size:0.8rem; opacity:0.7;">Паспорт позволяет работать в госструктурах и покупать землю.</p>
                            <button class="btn-primary" onclick="applyForPassport()">Подать заявление</button>
                        </div>
                    `}
                </div>
                
                ${hasPassport ? `
                <div class="card">
                    <h3><i class="fas fa-exchange-alt"></i> Замена паспорта</h3>
                    <p>Стоимость: 500 Ð</p>
                    <button class="btn-secondary" style="width:100%">Подать на замену</button>
                </div>
                ` : ''}
            `;
        }
    },
    
    // 5. РАБОТА (hh.du)
    'work': {
        render: (container) => {
            const acc = OS.getAccount();
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-search"></i> Поиск работы</h3>
                    <input type="text" placeholder="Должность или компания">
                    <select>
                        <option>Все сферы</option>
                        <option>Госслужба</option>
                        <option>IT / Программирование</option>
                        <option>Продажи</option>
                        <option>Производство</option>
                    </select>
                    <button class="btn-primary">Найти вакансии</button>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-briefcase"></i> Популярные вакансии</h3>
                    
                    <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Сотрудник МВД</strong>
                            <span style="color:var(--success-color)">от 50 000 Ð</span>
                        </div>
                        <div style="font-size:0.8rem; opacity:0.7;">МВД DubleLand • Требуется паспорт</div>
                        <button class="btn-secondary" style="margin-top:5px; padding:5px 10px; font-size:0.8rem;" onclick="applyJob('mvd')">Откликнуться</button>
                    </div>
                    
                    <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Разработчик JS</strong>
                            <span style="color:var(--success-color)">от 80 000 Ð</span>
                        </div>
                        <div style="font-size:0.8rem; opacity:0.7;">DubleSoft • Удалённо</div>
                        <button class="btn-secondary" style="margin-top:5px; padding:5px 10px; font-size:0.8rem;" onclick="applyJob('dev')">Откликнуться</button>
                    </div>
                    
                    <div style="padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Губернатор</strong>
                            <span style="color:var(--warning-color)">Выборная должность</span>
                        </div>
                        <div style="font-size:0.8rem; opacity:0.7;">Правительство • Только выборы</div>
                        <button class="btn-secondary" style="margin-top:5px; padding:5px 10px; font-size:0.8rem;" disabled>Выборы не объявлены</button>
                    </div>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-user-tie"></i> Моя работа</h3>
                    ${acc.job ? `
                        <p><strong>Должность:</strong> ${acc.job.title}</p>
                        <p><strong>Зарплата:</strong> ${acc.job.salary} Ð/час</p>
                        <p><strong>Стаж:</strong> 0 дней</p>
                        <button class="btn-secondary" style="width:100%; margin-top:10px; background:var(--danger-color)">Уволиться</button>
                    ` : `
                        <p>Вы безработный</p>
                        <p style="font-size:0.8rem; opacity:0.7;">Пособие: 0 Ð</p>
                    `}
                </div>
            `;
        }
    },
    
    // 6. ДУБЛИНЕТ (Поисковик)
    'dublinet': {
        render: (container) => {
            container.innerHTML = `
                <div style="text-align:center; padding:40px 20px;">
                    <h1 style="font-size:3rem; margin-bottom:10px;">
                        <span style="color:#4285F4">D</span><span style="color:#EA4335">u</span><span style="color:#FBBC05">b</span><span style="color:#4285F4">l</span><span style="color:#34A853">e</span><span style="color:#EA4335">N</span><span style="color:#4285F4">et</span>
                    </h1>
                    <p style="opacity:0.7; margin-bottom:30px;">Закрытая поисковая система DubleLand</p>
                    
                    <div style="display:flex; gap:10px; max-width:500px; margin:0 auto;">
                        <input type="text" placeholder="Введите запрос..." style="flex:1; border-radius:24px; padding:12px 20px;">
                        <button class="btn-primary" style="width:auto; border-radius:24px; padding:10px 25px;"><i class="fas fa-search"></i></button>
                    </div>
                    
                    <div style="margin-top:40px; text-align:left;">
                        <h4>Рекомендуемые сайты:</h4>
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap:15px; margin-top:15px;">
                            <div class="card" style="padding:15px; cursor:pointer;" onclick="openSite('centralbank')">
                                <i class="fas fa-university fa-2x" style="color:var(--success-color)"></i>
                                <p style="margin-top:10px; font-weight:bold;">Центральный Банк</p>
                                <p style="font-size:0.7rem; opacity:0.7;">centralbank.du</p>
                            </div>
                            <div class="card" style="padding:15px; cursor:pointer;" onclick="openSite('government')">
                                <i class="fas fa-landmark fa-2x" style="color:var(--primary-color)"></i>
                                <p style="margin-top:10px; font-weight:bold;">Правительство</p>
                                <p style="font-size:0.7rem; opacity:0.7;">gov.du</p>
                            </div>
                            <div class="card" style="padding:15px; cursor:pointer;" onclick="openSite('news')">
                                <i class="fas fa-newspaper fa-2x" style="color:var(--danger-color)"></i>
                                <p style="margin-top:10px; font-weight:bold;">Новости</p>
                                <p style="font-size:0.7rem; opacity:0.7;">news.du</p>
                            </div>
                            <div class="card" style="padding:15px; cursor:pointer;" onclick="openSite('wiki')">
                                <i class="fas fa-book fa-2x" style="color:var(--warning-color)"></i>
                                <p style="margin-top:10px; font-weight:bold;">Википедия</p>
                                <p style="font-size:0.7rem; opacity:0.7;">wiki.du</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // 7. АВИТО (Магазин)
    'avito': {
        render: (container) => {
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-plus-circle"></i> Подать объявление</h3>
                    <input type="text" placeholder="Название товара">
                    <input type="number" placeholder="Цена (Ð)">
                    <textarea placeholder="Описание" rows="3"></textarea>
                    <input type="text" placeholder="URL картинки (необязательно)">
                    <button class="btn-primary" onclick="OS.showNotification('Объявление отправлено на модерацию', 'info')">Разместить</button>
                </div>
                
                <div class="card">
                    <h3><i class="fas fa-store"></i> Свежие объявления</h3>
                    
                    <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px;">
                        <div style="width:80px; height:80px; background:#333; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:2rem;">📱</div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <strong>iPhone 15 Pro</strong>
                                <span style="color:var(--success-color); font-weight:bold;">120 000 Ð</span>
                            </div>
                            <p style="font-size:0.8rem; opacity:0.7; margin:5px 0;">Продам телефон, б/у 1 месяц...</p>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.7rem; opacity:0.5;">Москва • 2 часа назад</span>
                                <div style="color:#ffc107;">★★★★☆</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:15px; margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:15px;">
                        <div style="width:80px; height:80px; background:#333; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:2rem;">🚗</div>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between;">
                                <strong>BMW X5</strong>
                                <span style="color:var(--success-color); font-weight:bold;">8 500 000 Ð</span>
                            </div>
                            <p style="font-size:0.8rem; opacity:0.7; margin:5px 0;">В отличном состоянии, один владелец...</p>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:0.7rem; opacity:0.5;">СПб • 5 часов назад</span>
                                <div style="color:#ffc107;">★★★★★</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    },
    
    // 8. КАЗИНО
    'casino': {
        render: (container) => {
            container.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, #e83e8c, #fd7e14); color:white;">
                    <h3 style="text-align:center;"><i class="fas fa-dice"></i> Lucky Duble Casino</h3>
                    <p style="text-align:center; opacity:0.8;">Испытай удачу!</p>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button class="btn-primary" style="background:#28a745;" onclick="casinoGame('slots')"><i class="fas fa-slot-machine"></i> Слоты</button>
                    <button class="btn-primary" style="background:#dc3545;" onclick="casinoGame('roulette')"><i class="fas fa-circle-notch"></i> Рулетка</button>
                    <button class="btn-primary" style="background:#007bff;" onclick="casinoGame('blackjack')"><i class="fas fa-cards"></i> Блэкджек</button>
                    <button class="btn-primary" style="background:#6f42c1;" onclick="casinoGame('crash')"><i class="fas fa-chart-line"></i> Краш</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-trophy"></i> Топ игроков сегодня</h4>
                    <ol style="padding-left:20px; margin-top:10px;">
                        <li>AlexWin — +1 500 000 Ð</li>
                        <li>LuckyGuy — +890 000 Ð</li>
                        <li>CasinoKing — +450 000 Ð</li>
                    </ol>
                </div>
                
                <div class="card" style="border:1px solid var(--danger-color);">
                    <p style="font-size:0.8rem; color:var(--danger-color); text-align:center;">
                        ⚠️ Азартные игры могут вызывать зависимость. Играйте ответственно.<br>
                        Казино всегда в плюсе (House Edge: 5%)
                    </p>
                </div>
            `;
        }
    },
    
    // 9. ЗЕМЛЯ (Карта)
    'map': {
        render: (container) => {
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-map-marked-alt"></i> Моя земля</h3>
                    <div style="height:300px; background:#2c3e50; border-radius:10px; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;">
                        <!-- Имитация карты -->
                        <div style="position:absolute; width:100%; height:100%; background: repeating-linear-gradient(45deg, #34495e 0, #34495e 10px, #2c3e50 10px, #2c3e50 20px);"></div>
                        <div style="z-index:1; text-align:center;">
                            <i class="fas fa-map fa-3x" style="opacity:0.5;"></i>
                            <p style="margin-top:10px;">Интерактивная карта DubleLand</p>
                            <p style="font-size:0.8rem; opacity:0.7;">Интеграция с Google Maps API</p>
                        </div>
                        <!-- Маркеры -->
                        <div style="position:absolute; top:30%; left:40%; color:#e74c3c; font-size:1.5rem;"><i class="fas fa-map-marker-alt"></i></div>
                        <div style="position:absolute; top:60%; left:70%; color:#2ecc71; font-size:1.5rem;"><i class="fas fa-home"></i></div>
                    </div>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-file-contract"></i> Кадастр</h4>
                    <p>У вас нет зарегистрированной земли.</p>
                    <button class="btn-primary" onclick="OS.showNotification('Функция покупки земли доступна только через Росреестр', 'info')">Купить участок</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-exclamation-triangle"></i> Правила</h4>
                    <ul style="padding-left:20px; font-size:0.9rem;">
                        <li>Штраф за чужую территорию: 50 000 Ð</li>
                        <li>50% штрафа идёт владельцу земли</li>
                        <li>50% штрафа идёт в казну</li>
                        <li>Налог на землю: 100 Ð/час</li>
                    </ul>
                </div>
            `;
        }
    },
    
    // 10. СУД
    'court': {
        render: (container) => {
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-gavel"></i> Электронное правосудие</h3>
                    <p>Подача исков в судебную систему DubleLand.</p>
                </div>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:15px;">
                    <button class="btn-primary" onclick="courtAction('new')"><i class="fas fa-plus"></i> Новый иск</button>
                    <button class="btn-secondary" onclick="courtAction('my')"><i class="fas fa-folder-open"></i> Мои дела</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-balance-scale"></i> Открытые дела</h4>
                    <p style="font-size:0.8rem; opacity:0.7;">Дела, ожидающие рассмотрения судьёй.</p>
                    
                    <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Дело №4521</strong>
                            <span class="badge badge-warning">На рассмотрении</span>
                        </div>
                        <p style="font-size:0.8rem; margin:5px 0;">Истец: Иванов И.И. | Ответчик: Петров П.П.</p>
                        <p style="font-size:0.8rem; opacity:0.7;">Суть: Невозврат долга в размере 50 000 Ð</p>
                    </div>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-book"></i> Законы</h4>
                    <ul style="padding-left:20px;">
                        <li>Конституция DubleLand</li>
                        <li>Федеральный закон "О полиции"</li>
                        <li>Налоговый кодекс</li>
                        <li>Уголовный кодекс</li>
                    </ul>
                    <button class="btn-secondary" style="width:100%; margin-top:10px;">Читать полный текст</button>
                </div>
            `;
        }
    },
    
    // 11. ФСБ
    'fsb': {
        render: (container) => {
            const acc = OS.getAccount();
            if (acc.role !== 'admin' && acc.role !== 'fsb') {
                container.innerHTML = `
                    <div style="text-align:center; padding:50px;">
                        <i class="fas fa-lock fa-4x" style="color:var(--danger-color); margin-bottom:20px;"></i>
                        <h3>ДОСТУП ЗАПРЕЩЁН</h3>
                        <p>Это приложение доступно только сотрудникам ФСБ.</p>
                        <p style="font-size:0.8rem; opacity:0.7;">Попытка несанкционированного доступа зафиксирована.</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="card" style="border:1px solid var(--danger-color);">
                    <h3><i class="fas fa-user-secret"></i> Панель ФСБ</h3>
                    <p style="color:var(--danger-color);">Секретный уровень доступа: Alpha</p>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-satellite-dish"></i> Слежка</h4>
                    <input type="text" placeholder="Введите ID гражданина или @username">
                    <button class="btn-primary" onclick="OS.showNotification('Геолокация цели обновлена', 'success')">Найти цель</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-comments"></i> Мониторинг чатов</h4>
                    <p>Активные прослушки: 3</p>
                    <div style="font-size:0.8rem; opacity:0.7; margin-top:5px;">
                        - Чат "Рабочий" (ID: 4521)<br>
                        - ЛС: Alex ↔ Maria<br>
                        - Канал "Новости"
                    </div>
                    <button class="btn-secondary" style="width:100%; margin-top:10px;">Открыть расшифровки</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-ban"></i> Блокировки</h4>
                    <input type="text" placeholder="ID пользователя для бана">
                    <button class="btn-primary" style="background:var(--danger-color)" onclick="OS.showNotification('Пользователь заблокирован', 'warning')">Заблокировать</button>
                </div>
            `;
        }
    },
    
    // 12. МВД
    'mvd': {
        render: (container) => {
            const acc = OS.getAccount();
            if (acc.role !== 'admin' && acc.role !== 'mvd') {
                container.innerHTML = `
                    <div style="text-align:center; padding:50px;">
                        <i class="fas fa-shield-alt fa-4x" style="color:var(--primary-color); margin-bottom:20px;"></i>
                        <h3>ДОСТУП ТОЛЬКО ДЛЯ СОТРУДНИКОВ МВД</h3>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = `
                <div class="card" style="border:1px solid var(--primary-color);">
                    <h3><i class="fas fa-shield-alt"></i> Панель МВД</h3>
                    <p>Сотрудник: ${acc.name} ${acc.surname}</p>
                    <p>Звание: Майор полиции</p>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-search"></i> КПК (Проверка гражданина)</h4>
                    <input type="text" placeholder="ФИО или ID">
                    <button class="btn-primary" onclick="checkCitizen()">Проверить</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-handcuffs"></i> Действия</h4>
                    <button class="btn-secondary" style="width:100%; margin-bottom:5px;" onclick="OS.showNotification('Штраф выписан', 'warning')">Выписать штраф</button>
                    <button class="btn-secondary" style="width:100%; margin-bottom:5px;" onclick="OS.showNotification('Карта заблокирована', 'warning')">Заблокировать карту</button>
                    <button class="btn-secondary" style="width:100%; margin-bottom:5px;" onclick="OS.showNotification('Счёт арестован', 'danger')">Арестовать счёт</button>
                    <button class="btn-danger" style="width:100%; background:var(--danger-color);" onclick="OS.showNotification('Ордер на арест выдан', 'danger')">Арест (Тюрьма)</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-list"></i> В розыске</h4>
                    <p>Активных ордеров: 2</p>
                </div>
            `;
        }
    },
    
    // 13. БИЗНЕС
    'business': {
        render: (container) => {
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-chart-line"></i> Мой бизнес</h3>
                    <p>У вас нет зарегистрированных предприятий.</p>
                    <button class="btn-primary" onclick="registerBusiness()">Зарегистрировать ИП/ООО</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-store"></i> Создать магазин</h4>
                    <p>Стоимость регистрации: 50 000 Ð</p>
                    <p style="font-size:0.8rem; opacity:0.7;">Включает кассу, товары, чеки и систему лояльности.</p>
                    <button class="btn-primary" onclick="OS.showNotification('Магазин создан!', 'success')">Открыть магазин</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-file-invoice-dollar"></i> Налоги</h4>
                    <p>НДС: 20%</p>
                    <p>Неприкосновенный минимум: 3500 Ð</p>
                    <button class="btn-secondary" style="width:100%;">Подать декларацию</button>
                </div>
            `;
        }
    },
    
    // 14. БИРЖА / КРИПТА
    'crypto': {
        render: (container) => {
            container.innerHTML = `
                <div class="card" style="background: linear-gradient(135deg, #f39c12, #e67e22); color:white;">
                    <h3><i class="fab fa-bitcoin"></i> CryptoExchange</h3>
                    <p>Курс Bitcoin: $42,150 (+2.5%)</p>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-coins"></i> Курсы валют</h4>
                    <div class="row"><span>1 Ð</span> <span>0.50 $DUB</span></div>
                    <div class="row"><span>1 $DUB</span> <span>2.00 Ð</span></div>
                    <div class="row"><span>1 BTC</span> <span>~8 000 000 Ð</span></div>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-plus"></i> Торговля</h4>
                    <input type="number" placeholder="Сумма в Ð">
                    <select>
                        <option>Купить $DUB</option>
                        <option>Продать $DUB</option>
                    </select>
                    <button class="btn-primary" onclick="OS.showNotification('Ордер исполнен', 'success')">Обменять</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-rocket"></i> Создать свою крипту</h4>
                    <p>Стоимость запуска токена: 1 000 000 Ð</p>
                    <button class="btn-primary" onclick="OS.showNotification('Токен создан!', 'success')">Запустить ICO</button>
                </div>
            `;
        }
    },
    
    // 15. DUBLEPLAY (Магазин приложений)
    'dubliplay': {
        render: (container) => {
            container.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3><i class="fas fa-th-large"></i> DublePlay</h3>
                    <p>Магазин приложений и игр</p>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-code"></i> Разработка</h4>
                    <p>Создайте своё приложение и опубликуйте в магазине.</p>
                    <button class="btn-primary" style="background:var(--success-color)" onclick="createApp()">Создать приложение (50 000 Ð)</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-terminal"></i> Консоли</h4>
                    <button class="btn-secondary" style="width:100%; margin-bottom:5px;" onclick="OS.showNotification('Python IDE запущена', 'info')">Python Console</button>
                    <button class="btn-secondary" style="width:100%; margin-bottom:5px;" onclick="OS.showNotification('Java IDE запущена', 'info')">Java IDE</button>
                    <button class="btn-secondary" style="width:100%;" onclick="OS.showNotification('IDLE запущен', 'info')">IDLE</button>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-tasks"></i> Шаблоны</h4>
                    <button class="btn-secondary" style="width:100%;" onclick="OS.showNotification('Шаблон "Список дел" загружен', 'info')">Список дел (To-Do)</button>
                </div>
            `;
        }
    },
    
    // 16. ПОЧТА
    'mail': {
        render: (container) => {
            container.innerHTML = `
                <div class="card">
                    <h3><i class="fas fa-envelope"></i> Входящие</h3>
                    <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Центральный Банк</strong>
                            <span style="font-size:0.7rem; opacity:0.5;">10:30</span>
                        </div>
                        <p style="font-size:0.8rem; opacity:0.7;">Уведомление о начислении процентов по вкладу.</p>
                    </div>
                    <div style="border-bottom:1px solid rgba(255,255,255,0.1); padding:10px 0;">
                        <div style="display:flex; justify-content:space-between;">
                            <strong>Налоговая служба</strong>
                            <span style="font-size:0.7rem; opacity:0.5;">Вчера</span>
                        </div>
                        <p style="font-size:0.8rem; opacity:0.7;">Напоминание об уплате налога.</p>
                    </div>
                </div>
                
                <div class="card">
                    <h4><i class="fas fa-paper-plane"></i> Написать письмо</h4>
                    <input type="email" placeholder="Email получателя">
                    <input type="text" placeholder="Тема">
                    <textarea placeholder="Текст письма" rows="4"></textarea>
                    <button class="btn-primary" onclick="OS.showNotification('Письмо отправлено', 'success')">Отправить</button>
                </div>
            `;
        }
    },
    
    // 17. DUBLE AI
    'ai': {
        render: (container) => {
            container.innerHTML = `
                <div class="card" style="text-align:center;">
                    <h3><i class="fas fa-brain"></i> DubleAI</h3>
                    <p>Искусственный интеллект DubleLand</p>
                </div>
                
                <div style="height:300px; overflow-y:auto; border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:15px; margin-bottom:15px;" id="ai-chat">
                    <div style="background:rgba(32, 201, 151, 0.2); padding:10px; border-radius:10px; margin-bottom:10px;">
                        Привет! Я DubleAI. Чем могу помочь?
                    </div>
                </div>
                
                <div style="display:flex; gap:10px;">
                    <input type="text" placeholder="Спроси что угодно..." id="ai-input" style="flex:1;">
                    <button class="btn-primary" style="width:auto;" onclick="askAI()"><i class="fas fa-paper-plane"></i></button>
                </div>
                
                <div class="card" style="margin-top:15px;">
                    <h4><i class="fas fa-question-circle"></i> Помощь</h4>
                    <p style="font-size:0.8rem; opacity:0.7;">Озвучка инструкций доступна в настройках.</p>
                    <button class="btn-secondary" style="width:100%;" onclick="OS.showNotification('Голосовой помощник активирован', 'info')">Включить голос</button>
                </div>
            `;
        }
    }
};

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЙ ===

// Банк действия
function bankAction(action) {
    if (action === 'transfer') {
        const to = prompt('Введите номер карты получателя:');
        if (!to) return;
        const amount = prompt('Сумма перевода:');
        if (!amount || isNaN(amount)) return;
        
        const acc = OS.getAccount();
        if (acc.balance >= amount) {
            acc.balance -= parseInt(amount);
            OS.saveAccount(acc);
            OS.showNotification(`Перевод ${amount} Ð выполнен`, 'success');
        } else {
            OS.showNotification('Недостаточно средств', 'error');
        }
    } else if (action === 'deposit') {
        const amount = prompt('Сумма пополнения:');
        if (amount && !isNaN(amount)) {
            const acc = OS.getAccount();
            acc.balance += parseInt(amount);
            OS.saveAccount(acc);
            OS.showNotification(`Баланс пополнен на ${amount} Ð`, 'success');
        }
    } else if (action === 'history') {
        OS.showNotification('История операций пуста', 'info');
    } else if (action === 'credit') {
        OS.showNotification('У вас нет активных кредитов', 'info');
    } else if (action === 'exchange') {
        OS.showNotification('Обмен выполнен по курсу 1:0.5', 'success');
    }
}

// Отправка сообщения в чате
function sendMessage() {
    const input = document.getElementById('msg-input');
    const text = input.value.trim();
    if (!text) return;
    
    const chat = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.style = "background:var(--primary-color); padding:10px; border-radius:10px; margin-bottom:10px; max-width:80%; margin-left:auto;";
    msgDiv.innerHTML = `${text}<div style="font-size:0.7rem; opacity:0.7; text-align:right; margin-top:5px;">${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>`;
    chat.appendChild(msgDiv);
    chat.scrollTop = chat.scrollHeight;
    input.value = '';
}

// Подача на паспорт
function applyForPassport() {
    const acc = OS.getAccount();
    if (!acc.birthdate) {
        OS.showNotification('Сначала укажите дату рождения в настройках', 'error');
        return;
    }
    
    if (acc.balance < 5000) {
        OS.showNotification('Недостаточно средств для госпошлины (5000 Ð)', 'error');
        return;
    }
    
    acc.balance -= 5000;
    acc.passport = {
        series: Math.floor(1000 + Math.random() * 9000),
        number: Math.floor(100000 + Math.random() * 900000),
        issueDate: new Date().toLocaleDateString('ru-RU')
    };
    OS.saveAccount(acc);
    OS.showNotification('Паспорт получен!', 'success');
    
    // Перерисовываем приложение
    const content = document.getElementById('app-content');
    APP_HANDLERS['passport'].render(content);
}

// Отклик на вакансию
function applyJob(type) {
    OS.showNotification('Отклик отправлен! Работодатель свяжется с вами.', 'success');
}

// Открытие сайта в ДублиНет
function openSite(site) {
    OS.showNotification(`Переход на ${site}.du...`, 'info');
}

// Казино игры
function casinoGame(game) {
    const acc = OS.getAccount();
    const bet = prompt('Ваша ставка:', '1000');
    if (!bet || isNaN(bet)) return;
    
    if (acc.balance < bet) {
        OS.showNotification('Недостаточно средств', 'error');
        return;
    }
    
    acc.balance -= parseInt(bet);
    
    // Простая логика выигрыша (House Edge 5%)
    const win = Math.random() > 0.55; // 45% шанс выиграть
    if (win) {
        const winAmount = parseInt(bet) * 2;
        acc.balance += winAmount;
        OS.showNotification(`Вы выиграли ${winAmount} Ð!`, 'success');
    } else {
        OS.showNotification('Вы проиграли. Попробуйте ещё раз!', 'error');
    }
    
    OS.saveAccount(acc);
}

// Суд действия
function courtAction(type) {
    if (type === 'new') {
        OS.showNotification('Иск принят в обработку', 'success');
    } else {
        OS.showNotification('Список дел пуст', 'info');
    }
}

// Проверка гражданина (МВД)
function checkCitizen() {
    OS.showNotification('Данные гражданина загружены в КПК', 'success');
}

// Регистрация бизнеса
function registerBusiness() {
    OS.showNotification('Заявка на регистрацию бизнеса отправлена', 'info');
}

// Создание приложения
function createApp() {
    const acc = OS.getAccount();
    if (acc.balance < 50000) {
        OS.showNotification('Недостаточно средств (50 000 Ð)', 'error');
        return;
    }
    acc.balance -= 50000;
    OS.saveAccount(acc);
    OS.showNotification('Приложение создано и отправлено на модерацию!', 'success');
}

// AI чат
function askAI() {
    const input = document.getElementById('ai-input');
    const text = input.value.trim();
    if (!text) return;
    
    const chat = document.getElementById('ai-chat');
    
    // Сообщение пользователя
    const userMsg = document.createElement('div');
    userMsg.style = "background:rgba(255,255,255,0.1); padding:10px; border-radius:10px; margin-bottom:10px; text-align:right;";
    userMsg.innerText = text;
    chat.appendChild(userMsg);
    
    // Ответ AI (имитация)
    setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.style = "background:rgba(32, 201, 151, 0.2); padding:10px; border-radius:10px; margin-bottom:10px;";
        
        // Простые ответы
        let response = "Я пока учусь и не могу ответить на этот вопрос.";
        if (text.toLowerCase().includes('привет')) response = "Здравствуйте! Чем могу помочь?";
        if (text.toLowerCase().includes('баланс')) response = `Ваш баланс: ${OS.getAccount().balance} Ð`;
        if (text.toLowerCase().includes('налог')) response = "Налог составляет 20% от дохода. Минимум 3500 Ð неприкосновенен.";
        if (text.toLowerCase().includes('паспорт')) response = "Для получения паспорта обратитесь в приложение 'Паспорт'.";
        
        aiMsg.innerText = response;
        chat.appendChild(aiMsg);
        chat.scrollTop = chat.scrollHeight;
    }, 500);
    
    input.value = '';
}

// Экспорт данных (Админ)
function exportData() {
    const data = localStorage.getItem('dubleOS_db');
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duble_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    OS.showNotification('База экспортирована', 'success');
}

// Импорт данных (Админ)
function importData() {
    document.getElementById('import-file').click();
}

function processImport(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.setItem('dubleOS_db', JSON.stringify(data));
            location.reload();
        } catch (err) {
            OS.showNotification('Ошибка импорта: неверный формат', 'error');
        }
    };
    reader.readAsText(file);
}
