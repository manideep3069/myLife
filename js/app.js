const ID = "FC_V4_";
let timerInterval;

// --- LOGIC ---

function bootSystem() {
    const name = localStorage.getItem(ID + 'name');
    const dob = localStorage.getItem(ID + 'dob');

    if (name && dob) {
        // Hide Setup, Show App
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('main-app').classList.add('visible');

        // Set Header
        document.getElementById('header-title').innerText = "PROJECT " + name;

        // Set Dynamic Quote
        const quote = `${name}, this is your life, and it's ending one second at a time!`;
        document.getElementById('dynamic-quote').innerText = quote;

        // Start Timer
        if (timerInterval) clearInterval(timerInterval);
        startEntropy(dob);

    } else {
        // Show Setup
        document.getElementById('setup-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.remove('visible');
    }
}

function initializeUser() {
    const name = document.getElementById('setup-name').value.trim();
    const dob = document.getElementById('setup-dob').value;

    if (!name || !dob) { alert("IDENTIFICATION REQUIRED."); return; }

    localStorage.setItem(ID + 'name', name);
    localStorage.setItem(ID + 'dob', dob);

    // BOOT without reload
    bootSystem();
}

function startEntropy(dob) {
    const birth = new Date(dob);
    const death = new Date(birth);
    death.setFullYear(birth.getFullYear() + 80); // 80 Years Lifespan

    function tick() {
        const now = new Date();
        const ms = death - now;

        if (ms <= 0) {
            document.getElementById('header-title').innerText = "TERMINATED";
            return;
        }

        // TOTAL REMAINING CALCULATIONS
        const sec = Math.floor(ms / 1000);
        const min = Math.floor(ms / (1000 * 60));
        const hrs = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const wks = Math.floor(ms / (1000 * 60 * 60 * 24 * 7));
        const mos = Math.floor(ms / (1000 * 60 * 60 * 24 * 30.44));
        const yrs = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));

        document.getElementById('t-years').innerText = yrs;
        document.getElementById('t-months').innerText = mos.toLocaleString();
        document.getElementById('t-weeks').innerText = wks.toLocaleString();
        document.getElementById('t-days').innerText = days.toLocaleString();
        document.getElementById('t-hours').innerText = hrs.toLocaleString();
        document.getElementById('t-minutes').innerText = min.toLocaleString();
        document.getElementById('t-seconds').innerText = sec.toLocaleString();
    }
    timerInterval = setInterval(tick, 1000);
    tick();
}

// --- DATA ---
function get(k) {
    let data = JSON.parse(localStorage.getItem(ID + k)) || [];
    // MIGRATION: Convert old string arrays to object arrays
    if (data.length > 0 && typeof data[0] === 'string') {
        data = data.map(text => ({ text, done: false }));
        set(k, data);
    }
    return data;
}
function set(k, v) { localStorage.setItem(ID + k, JSON.stringify(v)); }

function add(listId, inId) {
    const el = document.getElementById(inId);
    const val = el.value.trim();
    if (!val) return;
    const list = get(listId);
    // Add as object
    list.push({ text: val, done: false });
    set(listId, list);
    draw(listId, list);
    el.value = "";
}

function remove(listId, idx) {
    const list = get(listId);
    list.splice(idx, 1);
    set(listId, list);
    draw(listId, list);
}

function toggle(listId, idx) {
    const list = get(listId);
    list[idx].done = !list[idx].done;
    set(listId, list);
    draw(listId, list);
}

function draw(listId, list) {
    const ul = document.getElementById(listId);
    ul.innerHTML = "";
    list.forEach((item, i) => {
        const li = document.createElement('li');
        const isDone = item.done ? 'done' : '';
        const checkMark = item.done ? '[X]' : '[ ]';
        
        // Handle legacy string data just in case, though get() should migrate it
        const text = typeof item === 'object' ? item.text : item;
        
        li.className = isDone;
        li.innerHTML = `
            <span class="todo-item" onclick="toggle('${listId}', ${i})">
                <span class="check">${checkMark}</span> ${text}
            </span>
            <span class="del" onclick="remove('${listId}', ${i})">DEL</span>
        `;
        ul.appendChild(li);
    });
}

// --- MONEY ---
let totalUSD = parseFloat(localStorage.getItem(ID + 'money')) || 0;
function renderMoney() {
    document.getElementById('money-usd').innerText = totalUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
function addMoney() {
    const el = document.getElementById('in-rupees');
    const inr = parseFloat(el.value);
    if (isNaN(inr)) return;

    const usd = inr / 90;
    totalUSD += usd;
    localStorage.setItem(ID + 'money', totalUSD);

    const logs = get('l-money');
    const date = new Date().toLocaleDateString();
    logs.unshift(`${usd > 0 ? '+' : ''}${usd.toFixed(2)} USD (₹${inr}) - ${date}`);
    if (logs.length > 10) logs.pop();
    set('l-money', logs);

    renderMoney();
    draw('l-money', logs);
    el.value = "";
}

// --- TABS ---
function tab(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

// --- SYSTEM ---
function exportID() {
    let dump = {};
    for (let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if (k.startsWith(ID)) dump[k] = localStorage.getItem(k);
    }
    const str = btoa(JSON.stringify(dump));
    navigator.clipboard.writeText(str).then(() => alert("IDENTITY COPIED."));
}

function importID() {
    const str = prompt("PASTE IDENTITY CODE:");
    if (!str) return;
    try {
        const dump = JSON.parse(atob(str));
        for (let k in dump) localStorage.setItem(k, dump[k]);
        bootSystem(); // Refresh view
        alert("IDENTITY RESTORED.");
    } catch (e) { alert("INVALID DATA."); }
}

function resetAll() {
    if (confirm("DELETE EVERYTHING?")) {
        localStorage.clear();
        bootSystem(); // Reset to setup screen
    }
}

// --- SUBLIMINAL GLITCHES ---
const GLITCH_TEXTS = [
    "YOU ARE NOT YOUR JOB",
    "THIS IS YOUR LIFE",
    "DO IT NOW",
    "WAKE UP",
    "CONSUME LESS",
    "CREATE MORE",
    "NO FEAR",
    "LET GO"
];

function startSubliminal() {
    const el = document.createElement('div');
    el.id = 'subliminal-flash';
    document.body.appendChild(el);

    // Random interval between 30s and 3 mins
    function scheduleNext() {
        const delay = Math.random() * (180000 - 30000) + 30000;
        setTimeout(triggerFlash, delay);
    }

    function triggerFlash() {
        const text = GLITCH_TEXTS[Math.floor(Math.random() * GLITCH_TEXTS.length)];
        el.innerText = text;
        el.style.display = 'flex';
        
        // Flash for 100ms
        setTimeout(() => {
            el.style.display = 'none';
            scheduleNext();
        }, 100);
    }

    scheduleNext();
}

// --- SABOTAGE MODE ---
function checkSabotage() {
    const lastRun = localStorage.getItem(ID + 'last_sabotage');
    const today = new Date().toDateString();

    if (lastRun !== today) {
        // It's a new day (or first run)
        const dailyList = get('l-daily');
        const unfinished = dailyList.filter(item => !item.done);
        
        if (unfinished.length > 0 && lastRun) {
            // If there were unfinished tasks from a previous day, KILL THEM
            // We only kill if lastRun exists (meaning it's not the very first boot)
            // Actually, logic: if we are running today, and lastRun was yesterday or older...
            // But simply: Clear all unfinished daily tasks on new day boot.
            
            const kept = dailyList.filter(item => item.done);
            const killedCount = dailyList.length - kept.length;
            
            if (killedCount > 0) {
                alert(`SABOTAGE PROTOCOL: ${killedCount} unfinished daily tasks were deleted. Do better.`);
                set('l-daily', kept);
                draw('l-daily', kept);
            }
        }
        localStorage.setItem(ID + 'last_sabotage', today);
    }
}

// --- BOSS MODE ---
function toggleBossMode() {
    console.log("Boss Mode Toggled");
    const boss = document.getElementById('boss-mode');
    boss.classList.toggle('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        toggleBossMode();
    }
});

// --- BURN JOURNAL ---
function burnEntry() {
    console.log("Burn Entry Triggered");
    const area = document.getElementById('burn-area');
    const overlay = document.getElementById('fire-overlay');
    
    if (!area.value.trim()) return;
    
    // Add burning class and show overlay
    area.classList.add('burning');
    overlay.style.display = 'block';
    
    // Wait for animation then clear
    setTimeout(() => {
        area.value = "";
        area.classList.remove('burning');
        overlay.style.display = 'none';
        alert("IT IS GONE.");
    }, 2000);
}

// Attach Listeners
document.getElementById('btn-panic').addEventListener('click', toggleBossMode);
document.getElementById('btn-burn').addEventListener('click', burnEntry);

// --- INIT ---
// Load Lists
['l-daily', 'l-weekly', 'l-monthly', 'l-life', 'l-book', 'l-movie', 'l-place', 'l-ally', 'l-meet', 'l-bad', 'l-val', 'l-money'].forEach(k => draw(k, get(k)));
renderMoney();
bootSystem(); // Start
startSubliminal(); // Start Glitches
checkSabotage(); // Run Sabotage Check

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  showInstallPromotion();
});

function showInstallPromotion() {
    const btn = document.createElement('button');
    btn.innerText = "INSTALL SYSTEM";
    btn.className = "setup-btn";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.left = "50%";
    btn.style.transform = "translateX(-50%)";
    btn.style.width = "auto";
    btn.style.zIndex = "10002";
    btn.style.boxShadow = "0 0 20px var(--accent)";
    btn.onclick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            deferredPrompt = null;
            btn.remove();
        }
    };
    document.body.appendChild(btn);
}
