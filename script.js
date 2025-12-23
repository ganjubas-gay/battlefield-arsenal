document.addEventListener('DOMContentLoaded', function() {
    console.log('🔥 Battlefield 6 Arsenal загружен!');
    
    // Проверяем базу данных
    if (typeof weaponsDatabase === 'undefined') {
        console.error('❌ База данных оружия не загружена!');
        return;
    }
    
    console.log('✅ База данных доступна. Оружий: ' + weaponsDatabase.length);
    
    // Элементы DOM
    const classSelect = document.getElementById('class');
    const rankSelect = document.getElementById('rank');
    const fireRateSelect = document.getElementById('fireRate');
    const distanceSelect = document.getElementById('distance');
    const weaponsGrid = document.getElementById('weaponsGrid');
    const resultsInfo = document.getElementById('resultsInfo');
    const weaponsCount = document.getElementById('weaponsCount');
    const avgDamage = document.getElementById('avgDamage');
    const avgAccuracy = document.getElementById('avgAccuracy');
    
    // Маппинг скорострельности
    const fireRateMap = {
        'low': ['very low', 'low'],
        'medium': ['medium'],
        'high': ['high', 'very high']
    };
    
    // Маппинг текста скорострельности
    const fireRateTexts = {
        'very low': 'Очень низкая',
        'low': 'Низкая',
        'medium': 'Средняя',
        'high': 'Высокая',
        'very high': 'Очень высокая',
        'burst': 'Очередями',
        'semi': 'Полуавтомат',
        'bolt': 'Скользящий затвор',
        'pump': 'Помповый',
        'double': 'Двуствольный',
        'revolver': 'Револьвер',
        'railgun': 'Рельсотрон',
        'melee': 'Ближний бой'
    };
    
    // Маппинг дистанций
    const distanceTexts = {
        'close': 'Ближняя (0-50м)',
        'medium': 'Средняя (50-150м)',
        'long': 'Дальняя (150м+)'
    };
    
    // Функция фильтрации
    function filterWeapons() {
        try {
            // Получаем значения фильтров
            const selectedClass = classSelect.value;
            const selectedRank = rankSelect.value;
            const selectedFireRate = fireRateSelect.value;
            const selectedDistance = distanceSelect.value;
            
            // Фильтруем оружие
            const filteredWeapons = weaponsDatabase.filter(weapon => {
                // 1. Проверка класса
                if (weapon.class !== selectedClass) return false;
                
                // 2. Проверка ранга
                if (selectedRank !== 'any') {
                    // Для battle pickups особые правила
                    if (weapon.class === 'battlepickup') {
                        if (selectedRank < 7) return false;
                    } else if (weapon.rank.toString() !== selectedRank) {
                        return false;
                    }
                }
                
                // 3. Проверка скорострельности
                if (selectedFireRate !== 'any') {
                    const allowedRates = fireRateMap[selectedFireRate];
                    // Для специальных типов огня
                    const specialRates = ['burst', 'semi', 'bolt', 'pump', 'double', 'revolver', 'railgun', 'melee'];
                    if (specialRates.includes(weapon.fireRate)) {
                        // Специальные типы не фильтруются по скорострельности
                        return true;
                    }
                    if (!allowedRates || !allowedRates.includes(weapon.fireRate)) {
                        return false;
                    }
                }
                
                // 4. Проверка дистанции
                if (selectedDistance !== 'any') {
                    if (weapon.distance !== selectedDistance) return false;
                }
                
                return true;
            });
            
            // Сортируем по рангу
            filteredWeapons.sort((a, b) => a.rank - b.rank);
            
            // Отображаем результаты
            displayResults(filteredWeapons, selectedClass);
            
        } catch (error) {
            console.error('❌ Ошибка фильтрации:', error);
            resultsInfo.innerHTML = '<span style="color: #ef4444;">Ошибка при фильтрации</span>';
        }
    }
    
    // Функция отображения результатов
    function displayResults(weapons, className) {
        // Очищаем сетку
        weaponsGrid.innerHTML = '';
        
        // Обновляем статистику
        weaponsCount.textContent = weapons.length;
        
        if (weapons.length > 0) {
            // Средние значения
            const totalDamage = weapons.reduce((sum, w) => sum + w.damage, 0);
            const totalAccuracy = weapons.reduce((sum, w) => sum + w.accuracy, 0);
            avgDamage.textContent = Math.round(totalDamage / weapons.length);
            avgAccuracy.textContent = Math.round(totalAccuracy / weapons.length);
            
            // Сообщение
            const classText = weaponClasses[className] || className;
            resultsInfo.innerHTML = `
                <i class="fas fa-check-circle" style="color: #10b981; margin-right: 10px;"></i>
                <strong>Найдено ${weapons.length} оружия</strong> класса "${classText}"
            `;
            
            // Создаем карточки
            weapons.forEach(weapon => {
                const card = document.createElement('div');
                card.className = 'weapon-card';
                
                // Цвет рамки
                const borderColor = classColors[weapon.class] || '#3b82f6';
                card.style.borderTop = `4px solid ${borderColor}`;
                
                // Бейджи
                const seasonBadge = weapon.season ? 
                    `<span class="season-badge">${weapon.season}</span>` : '';
                
                const specialBadge = weapon.special ? 
                    `<span class="special-badge">${weapon.special}</span>` : '';
                
                // Тексты
                const fireRateText = fireRateTexts[weapon.fireRate] || weapon.fireRate;
                const distanceText = distanceTexts[weapon.distance] || weapon.distance;
                
                card.innerHTML = `
                    <div class="weapon-header">
                        <div class="weapon-name">
                            ${weapon.name}
                            ${seasonBadge}
                            ${specialBadge}
                        </div>
                        <div class="weapon-rank">Ур. ${weapon.rank}</div>
                    </div>
                    
                    <div class="weapon-class" style="background: ${borderColor}20; color: ${borderColor}">
                        ${weaponClasses[weapon.class]}
                    </div>
                    
                    <p class="weapon-description">${weapon.description}</p>
                    
                    <div class="weapon-stats">
                        <div class="stat-item">
                            <div class="stat-label">Урон</div>
                            <div class="stat-value">${weapon.damage}</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${Math.min(weapon.damage, 100)}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-label">Точность</div>
                            <div class="stat-value">${weapon.accuracy}%</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${weapon.accuracy}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-label">Контроль</div>
                            <div class="stat-value">${weapon.control}</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${weapon.control}%"></div>
                            </div>
                        </div>
                        
                        <div class="stat-item">
                            <div class="stat-label">Дальность</div>
                            <div class="stat-value">${weapon.range}</div>
                            <div class="stat-bar">
                                <div class="stat-fill" style="width: ${weapon.range}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="weapon-meta">
                        <span class="meta-item">
                            <i class="fas fa-tachometer-alt"></i>
                            ${fireRateText}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-bullseye"></i>
                            ${distanceText}
                        </span>
                    </div>
                `;
                
                weaponsGrid.appendChild(card);
            });
            
        } else {
            // Нет результатов
            avgDamage.textContent = '0';
            avgAccuracy.textContent = '0';
            
            const classText = weaponClasses[className] || className;
            resultsInfo.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b; margin-right: 10px;"></i>
                <strong>Оружие не найдено</strong><br>
                Класс: "${classText}"<br>
                <small>Попробуйте изменить параметры фильтров</small>
            `;
        }
    }
    
    // Сброс фильтров
    document.getElementById('resetBtn').addEventListener('click', function() {
        classSelect.value = 'assault';
        rankSelect.value = 'any';
        fireRateSelect.value = 'any';
        distanceSelect.value = 'any';
        filterWeapons();
    });
    
    // Автоматическая фильтрация при изменении
    [classSelect, rankSelect, fireRateSelect, distanceSelect].forEach(select => {
        select.addEventListener('change', filterWeapons);
    });
    
    // Кнопка поиска
    document.getElementById('searchBtn').addEventListener('click', filterWeapons);
    
    // Начальная загрузка
    filterWeapons();
});