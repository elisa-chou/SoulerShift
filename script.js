// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDeotcJAbPety_DjOf0rN0LEHEGP1PxMiQ",
    authDomain: "soulershift.firebaseapp.com",
    projectId: "soulershift",
    storageBucket: "soulershift.firebasestorage.app",
    messagingSenderId: "520394769260",
    appId: "1:520394769260:web:d053f3ea7a9b0f25b52949"
};

// 初始化 Firebase
let db;
let firebaseInitialized = false;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log("✅ Firebase 已成功初始化");
    
    // 測試連線
    db.collection('schedules').doc('current').get()
        .then(() => {
            console.log("✅ Firestore 連線測試成功");
            showConnectionStatus(true);
        })
        .catch((error) => {
            console.error("❌ Firestore 連線失敗:", error);
            console.error("錯誤代碼:", error.code);
            console.error("錯誤訊息:", error.message);
            showConnectionStatus(false, error.message);
        });
} catch (error) {
    console.warn("❌ Firebase 初始化失敗，將使用本地儲存模式", error);
    showConnectionStatus(false, "Firebase 初始化失敗");
}

// 員工資料
const employees = [
    { name: '星貞', label: 'A' },
    { name: '國渝', label: 'B' },
    { name: '樹穎', label: 'C' }
];

// 排班狀態
const SHIFT_STATES = {
    UNSCHEDULED: 'unscheduled',
    FULLDAY: 'fullday',
    MORNING: 'morning',
    AFTERNOON: 'afternoon'
};

const SHIFT_LABELS = {
    [SHIFT_STATES.UNSCHEDULED]: '',
    [SHIFT_STATES.FULLDAY]: '',
    [SHIFT_STATES.MORNING]: '(上午)',
    [SHIFT_STATES.AFTERNOON]: '(下午)'
};

// 狀態切換順序
const STATE_CYCLE = [
    SHIFT_STATES.UNSCHEDULED,
    SHIFT_STATES.FULLDAY,
    SHIFT_STATES.MORNING,
    SHIFT_STATES.AFTERNOON
];

// 儲存班表資料
let scheduleData = {
    week1: {
        startDate: '',
        cleaner: '',
        notes: '',
        schedule: {}
    },
    week2: {
        startDate: '',
        cleaner: '',
        notes: '',
        schedule: {}
    }
};

// 顯示連線狀態
function showConnectionStatus(isConnected, errorMessage = '') {
    const statusIndicator = document.getElementById('connection-status');
    if (!statusIndicator) return;
    
    if (isConnected) {
        statusIndicator.innerHTML = '🟢 雲端同步已連線';
        statusIndicator.className = 'connection-status connected';
    } else {
        statusIndicator.innerHTML = `🔴 雲端同步失敗 - 使用本地模式${errorMessage ? '<br><small>' + errorMessage + '</small>' : ''}`;
        statusIndicator.className = 'connection-status disconnected';
    }
    statusIndicator.style.display = 'block';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initWeekSchedule(1);
    initWeekSchedule(2);
    loadScheduleData();
    setupEventListeners();
});

// 初始化週班表
function initWeekSchedule(weekNum) {
    const scheduleTable = document.getElementById(`week${weekNum}-schedule`);
    scheduleTable.innerHTML = '';

    // 創建週一到週五的列
    for (let day = 1; day <= 5; day++) {
        const dayColumn = createDayColumn(weekNum, day);
        scheduleTable.appendChild(dayColumn);
    }
}

// 創建日期列
function createDayColumn(weekNum, dayIndex) {
    const dayColumn = document.createElement('div');
    dayColumn.className = 'day-column';

    const dayNames = ['週一', '週二', '週三', '週四', '週五'];
    
    // 日期標題
    const dayHeader = document.createElement('div');
    dayHeader.className = 'day-header';
    dayHeader.innerHTML = `
        <div class="day-name">${dayNames[dayIndex - 1]}</div>
        <div class="day-date" id="week${weekNum}-day${dayIndex}-date">-/-</div>
    `;
    dayColumn.appendChild(dayHeader);

    // 員工卡片容器
    const employeeCards = document.createElement('div');
    employeeCards.className = 'employee-cards';

    // 創建三個員工卡片
    employees.forEach(employee => {
        const card = createEmployeeCard(weekNum, dayIndex, employee);
        employeeCards.appendChild(card);
    });

    dayColumn.appendChild(employeeCards);
    return dayColumn;
}

// 創建員工卡片
function createEmployeeCard(weekNum, dayIndex, employee) {
    const card = document.createElement('div');
    card.className = `employee-card unscheduled ${employee.name}`;
    card.dataset.week = weekNum;
    card.dataset.day = dayIndex;
    card.dataset.employee = employee.name;
    card.dataset.state = SHIFT_STATES.UNSCHEDULED;

    card.innerHTML = `
        <div class="employee-label">${employee.label}</div>
        <div class="employee-info">
            <div class="employee-name">${employee.name}<span class="shift-label">${SHIFT_LABELS[SHIFT_STATES.UNSCHEDULED]}</span></div>
        </div>
    `;

    // 點擊切換狀態
    card.addEventListener('click', () => {
        toggleShiftState(card);
    });

    return card;
}

// 切換排班狀態
function toggleShiftState(card) {
    const currentState = card.dataset.state;
    const currentIndex = STATE_CYCLE.indexOf(currentState);
    const nextIndex = (currentIndex + 1) % STATE_CYCLE.length;
    const nextState = STATE_CYCLE[nextIndex];

    // 更新狀態
    card.dataset.state = nextState;

    // 移除所有狀態類別
    STATE_CYCLE.forEach(state => card.classList.remove(state));
    
    // 添加新狀態類別
    card.classList.add(nextState);

    // 更新標籤文字
    const shiftLabel = card.querySelector('.shift-label');
    shiftLabel.textContent = SHIFT_LABELS[nextState];

    // 儲存資料
    saveScheduleData();
}

// 設置事件監聽器
function setupEventListeners() {
    // 日期輸入變更
    ['week1-start', 'week2-start'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('change', (e) => {
            const weekNum = id.includes('week1') ? 1 : 2;
            updateWeekDates(weekNum, e.target.value);
            saveScheduleData();
        });
    });

    // 打掃人員選擇
    ['week1-cleaner', 'week2-cleaner'].forEach(id => {
        const select = document.getElementById(id);
        select.addEventListener('change', (e) => {
            updateCleanerStyle(select, e.target.value);
            saveScheduleData();
        });
    });

    // 備註輸入
    ['week1-notes', 'week2-notes'].forEach(id => {
        const textarea = document.getElementById(id);
        textarea.addEventListener('input', () => {
            saveScheduleData();
        });
    });
}

// 更新週日期
function updateWeekDates(weekNum, startDateStr) {
    if (!startDateStr) {
        // 清空日期顯示
        for (let day = 1; day <= 5; day++) {
            const dateElement = document.getElementById(`week${weekNum}-day${day}-date`);
            dateElement.textContent = '-/-';
        }
        document.getElementById(`week${weekNum}-range`).textContent = '';
        return;
    }

    const startDate = new Date(startDateStr);
    
    // 更新每一天的日期
    for (let day = 1; day <= 5; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (day - 1));
        
        const month = currentDate.getMonth() + 1;
        const date = currentDate.getDate();
        
        const dateElement = document.getElementById(`week${weekNum}-day${day}-date`);
        dateElement.textContent = `${month}/${date}`;
    }

    // 更新日期範圍顯示
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4);
    
    const rangeText = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
    document.getElementById(`week${weekNum}-range`).textContent = rangeText;
}

// 更新打掃人員樣式
function updateCleanerStyle(selectElement, cleaner) {
    selectElement.className = 'cleaner-select';
    if (cleaner) {
        selectElement.classList.add(`selected-${cleaner}`);
    }
}

// 清空週資料
function clearWeek(weekNum) {
    if (!confirm(`確定要清空第 ${weekNum} 週的所有資料嗎？`)) {
        return;
    }

    // 如果是清空第一週，將第二週的資料移到第一週
    if (weekNum === 1) {
        moveWeek2ToWeek1();
        return;
    }

    // 清空日期
    document.getElementById(`week${weekNum}-start`).value = '';
    updateWeekDates(weekNum, '');

    // 清空打掃人員
    const cleanerSelect = document.getElementById(`week${weekNum}-cleaner`);
    cleanerSelect.value = '';
    updateCleanerStyle(cleanerSelect, '');

    // 清空備註
    document.getElementById(`week${weekNum}-notes`).value = '';

    // 重置所有員工卡片
    const cards = document.querySelectorAll(`[data-week="${weekNum}"]`);
    cards.forEach(card => {
        card.dataset.state = SHIFT_STATES.UNSCHEDULED;
        STATE_CYCLE.forEach(state => card.classList.remove(state));
        card.classList.add('unscheduled');
        const shiftLabel = card.querySelector('.shift-label');
        shiftLabel.textContent = SHIFT_LABELS[SHIFT_STATES.UNSCHEDULED];
    });

    // 儲存資料
    saveScheduleData();
}

// 將第二週的資料移到第一週，清空第二週
function moveWeek2ToWeek1() {
    // 先收集第二週的資料
    const week2Data = {
        startDate: document.getElementById('week2-start').value,
        cleaner: document.getElementById('week2-cleaner').value,
        notes: document.getElementById('week2-notes').value,
        schedule: {}
    };

    // 收集第二週的排班狀態
    for (let day = 1; day <= 5; day++) {
        employees.forEach(employee => {
            const card = document.querySelector(
                `[data-week="2"][data-day="${day}"][data-employee="${employee.name}"]`
            );
            if (card) {
                const key = `day${day}-${employee.name}`;
                week2Data.schedule[key] = card.dataset.state;
            }
        });
    }

    // 將第二週的資料套用到第一週
    // 設定日期
    document.getElementById('week1-start').value = week2Data.startDate;
    updateWeekDates(1, week2Data.startDate);

    // 設定打掃人員
    const cleaner1Select = document.getElementById('week1-cleaner');
    cleaner1Select.value = week2Data.cleaner;
    updateCleanerStyle(cleaner1Select, week2Data.cleaner);

    // 設定備註
    document.getElementById('week1-notes').value = week2Data.notes;

    // 設定排班狀態
    for (let day = 1; day <= 5; day++) {
        employees.forEach(employee => {
            const key = `day${day}-${employee.name}`;
            const state = week2Data.schedule[key] || SHIFT_STATES.UNSCHEDULED;
            
            const card = document.querySelector(
                `[data-week="1"][data-day="${day}"][data-employee="${employee.name}"]`
            );
            
            if (card) {
                card.dataset.state = state;
                STATE_CYCLE.forEach(s => card.classList.remove(s));
                card.classList.add(state);
                const shiftLabel = card.querySelector('.shift-label');
                shiftLabel.textContent = SHIFT_LABELS[state];
            }
        });
    }

    // 清空第二週
    document.getElementById('week2-start').value = '';
    updateWeekDates(2, '');

    const cleaner2Select = document.getElementById('week2-cleaner');
    cleaner2Select.value = '';
    updateCleanerStyle(cleaner2Select, '');

    document.getElementById('week2-notes').value = '';

    // 重置第二週所有員工卡片
    const week2Cards = document.querySelectorAll('[data-week="2"]');
    week2Cards.forEach(card => {
        card.dataset.state = SHIFT_STATES.UNSCHEDULED;
        STATE_CYCLE.forEach(state => card.classList.remove(state));
        card.classList.add('unscheduled');
        const shiftLabel = card.querySelector('.shift-label');
        shiftLabel.textContent = SHIFT_LABELS[SHIFT_STATES.UNSCHEDULED];
    });

    // 儲存資料
    saveScheduleData();
    
    // 提示用戶
    console.log('第二週資料已移至第一週');
}

// 收集當前班表資料
function collectScheduleData() {
    const data = {
        week1: {
            startDate: document.getElementById('week1-start').value,
            cleaner: document.getElementById('week1-cleaner').value,
            notes: document.getElementById('week1-notes').value,
            schedule: {}
        },
        week2: {
            startDate: document.getElementById('week2-start').value,
            cleaner: document.getElementById('week2-cleaner').value,
            notes: document.getElementById('week2-notes').value,
            schedule: {}
        }
    };

    // 收集所有員工排班狀態
    [1, 2].forEach(weekNum => {
        for (let day = 1; day <= 5; day++) {
            employees.forEach(employee => {
                const card = document.querySelector(
                    `[data-week="${weekNum}"][data-day="${day}"][data-employee="${employee.name}"]`
                );
                if (card) {
                    const key = `day${day}-${employee.name}`;
                    data[`week${weekNum}`].schedule[key] = card.dataset.state;
                }
            });
        }
    });

    return data;
}

// 儲存班表資料
async function saveScheduleData() {
    const data = collectScheduleData();
    scheduleData = data;

    // 先儲存到本地儲存（作為備份）
    localStorage.setItem('scheduleData', JSON.stringify(data));

    // 儲存到 Firebase
    if (db && firebaseInitialized) {
        try {
            await db.collection('schedules').doc('current').set(data);
            console.log('✅ 資料已同步至雲端');
        } catch (error) {
            console.error('❌ 雲端儲存失敗:', error);
            console.error('錯誤代碼:', error.code);
            console.error('錯誤訊息:', error.message);
            
            // 顯示錯誤提示
            if (error.code === 'permission-denied') {
                alert('⚠️ Firebase 權限被拒絕\n\n請確認：\n1. Firestore 資料庫已啟用\n2. 安全規則已正確設定\n\n目前資料僅保存在本地瀏覽器中。');
            }
        }
    }
}

// 載入班表資料
async function loadScheduleData() {
    let data = null;

    // 從 Firebase 載入
    if (db && firebaseInitialized) {
        try {
            const doc = await db.collection('schedules').doc('current').get();
            if (doc.exists) {
                data = doc.data();
                console.log('✅ 從雲端載入資料');
            } else {
                console.log('ℹ️ 雲端尚無資料');
            }
        } catch (error) {
            console.error('❌ 雲端載入失敗:', error);
            console.error('錯誤代碼:', error.code);
            console.error('錯誤訊息:', error.message);
        }
    }

    // 如果 Firebase 失敗，從本地儲存載入
    if (!data) {
        const localData = localStorage.getItem('scheduleData');
        if (localData) {
            data = JSON.parse(localData);
            console.log('ℹ️ 從本地儲存載入資料');
        }
    }

    // 如果有資料，套用到介面
    if (data) {
        applyScheduleData(data);
    }

    // 設置即時監聽 (如果使用 Firebase)
    if (db && firebaseInitialized) {
        db.collection('schedules').doc('current').onSnapshot(
            (doc) => {
            if (doc.exists) {
                const newData = doc.data();
                // 只在資料真的改變時才更新
                if (JSON.stringify(newData) !== JSON.stringify(scheduleData)) {
                    applyScheduleData(newData);
                        console.log('🔄 接收到雲端更新');
                    }
                }
            },
            (error) => {
                console.error('❌ 即時監聽失敗:', error);
                console.error('錯誤代碼:', error.code);
                console.error('錯誤訊息:', error.message);
            }
        );
    }
}

// 套用班表資料到介面
function applyScheduleData(data) {
    scheduleData = data;

    [1, 2].forEach(weekNum => {
        const weekKey = `week${weekNum}`;
        const weekData = data[weekKey];

        if (!weekData) return;

        // 套用日期
        if (weekData.startDate) {
            document.getElementById(`week${weekNum}-start`).value = weekData.startDate;
            updateWeekDates(weekNum, weekData.startDate);
        }

        // 套用打掃人員
        if (weekData.cleaner !== undefined) {
            const cleanerSelect = document.getElementById(`week${weekNum}-cleaner`);
            cleanerSelect.value = weekData.cleaner;
            updateCleanerStyle(cleanerSelect, weekData.cleaner);
        }

        // 套用備註
        if (weekData.notes !== undefined) {
            document.getElementById(`week${weekNum}-notes`).value = weekData.notes;
        }

        // 套用排班狀態
        if (weekData.schedule) {
            for (let day = 1; day <= 5; day++) {
                employees.forEach(employee => {
                    const key = `day${day}-${employee.name}`;
                    const state = weekData.schedule[key];
                    
                    if (state) {
                        const card = document.querySelector(
                            `[data-week="${weekNum}"][data-day="${day}"][data-employee="${employee.name}"]`
                        );
                        
                        if (card) {
                            card.dataset.state = state;
                            STATE_CYCLE.forEach(s => card.classList.remove(s));
                            card.classList.add(state);
                            const shiftLabel = card.querySelector('.shift-label');
                            shiftLabel.textContent = SHIFT_LABELS[state];
                        }
                    }
                });
            }
        }
    });
}

