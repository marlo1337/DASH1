import { applyEntry } from './finance.js';

const departureDate = new Date('2024-12-01');
let events = [];
async function loadEventsData() {
  try {
    const res = await fetch('events.json');
    events = await res.json();
  } catch (e) {
    events = [];
  }
}
let entries = JSON.parse(localStorage.getItem('financeEntries') || '[]');
let currentBalance = parseFloat(localStorage.getItem('currentBalance') || '0');
let darkMode = localStorage.getItem('darkMode') === 'true';
let tickets = JSON.parse(localStorage.getItem('tickets') || '[]');

async function updateWeather() {
const city = 'Bangkok';
const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`;
try {
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();
    if (!geoData.results || geoData.results.length === 0) {
        document.getElementById('weather-content').innerText = 'Ville non trouvée';
        return;
    }
    const { latitude, longitude } = geoData.results[0];
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();
    if (weatherData && weatherData.current_weather) {
        const w = weatherData.current_weather;
        document.getElementById('weather-content').innerText = `Température: ${w.temperature}°C, Vent: ${w.windspeed} km/h`;
    }
} catch(e) {
    document.getElementById('weather-content').innerText = 'Erreur météo';
}
}

function updateCountdown() {
const today = new Date();
const diff = Math.ceil((departureDate - today) / (1000 * 60 * 60 * 24));
document.getElementById('days-left').innerText = diff;
}

async function loadEvents() {
  if (!events.length) await loadEventsData();
  const list = events.map(e => `<li>${e.date} - ${e.title}</li>`).join('');
  document.getElementById('events').innerHTML = list;
}

function renderFinance() {
const tbody = document.getElementById('finance-table').querySelector('tbody');
tbody.innerHTML = entries.map(e => `<tr><td>${e.date}</td><td>${e.type}</td><td>${e.label}</td><td>${e.amount.toFixed(2)}</td></tr>`).join('');
document.getElementById('current-balance').innerText = currentBalance.toFixed(2);
}

function setInitialBalance() {
const amount = parseFloat(document.getElementById('initial-balance').value || '0');
currentBalance = amount;
entries = [];
localStorage.setItem('currentBalance', currentBalance);
localStorage.setItem('financeEntries', JSON.stringify(entries));
renderFinance();
}

function renderTickets() {
    const tbody = document.getElementById('tickets-table').querySelector('tbody');
    tbody.innerHTML = tickets.map(t =>
        `<tr class="ticket-row"><td>${t.type}</td><td>${t.date}</td><td>${t.time}</td><td>${t.file}</td></tr>`
    ).join('');
}

async function importTicket() {
    if (!docsDirHandle) {
        alert('Choisissez d\'abord le dossier principal dans Gestion des fichiers');
        return;
    }
    const input = document.getElementById('ticket-file');
    input.onchange = async () => {
        const file = input.files[0];
        const type = document.getElementById('ticket-type').value;
        const date = document.getElementById('ticket-date').value;
        const time = document.getElementById('ticket-time').value;
        if (!file || !date || !time) {
            alert('Veuillez renseigner la date, l\'heure et sélectionner un fichier');
            return;
        }
        const fh = await docsDirHandle.getFileHandle(file.name, { create: true });
        const writable = await fh.createWritable();
        await writable.write(file);
        await writable.close();
        tickets.push({ type, date, time, file: file.name });
        localStorage.setItem('tickets', JSON.stringify(tickets));
        renderTickets();
        input.value = '';
    };
    input.click();
}

function addEntry() {
const date = document.getElementById('entry-date').value;
const type = document.getElementById('entry-type').value;
const label = document.getElementById('entry-label').value;
const amount = parseFloat(document.getElementById('entry-amount').value || '0');
if (!date || isNaN(amount)) {
    alert('Veuillez saisir une date et un montant valides');
    return;
}
currentBalance = applyEntry(currentBalance, type, amount);
entries.push({date, type, label, amount: type === 'depense' ? -amount : amount});
localStorage.setItem('currentBalance', currentBalance);
localStorage.setItem('financeEntries', JSON.stringify(entries));
renderFinance();
}

document.getElementById('set-balance').addEventListener('click', setInitialBalance);
document.getElementById('add-entry').addEventListener('click', addEntry);

function populateCurrencies() {
const list = ['EUR','USD','GBP','JPY','THB'];
const from = document.getElementById('conv-from');
const to = document.getElementById('conv-to');
list.forEach(c => {
    const opt1 = document.createElement('option');
    opt1.value = opt1.text = c;
    from.appendChild(opt1.cloneNode(true));
    const opt2 = document.createElement('option');
    opt2.value = opt2.text = c;
    to.appendChild(opt2);
});
from.value = 'EUR';
to.value = 'USD';
}

async function convertCurrency() {
const amount = parseFloat(document.getElementById('conv-amount').value || '0');
const from = document.getElementById('conv-from').value;
const to = document.getElementById('conv-to').value;
const url = `https://api.exchangerate.host/convert?from=${from}&to=${to}&amount=${amount}`;
try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && data.result) {
        document.getElementById('conv-result').innerText = data.result.toFixed(2);
    } else {
        document.getElementById('conv-result').innerText = 'Conversion indisponible';
    }
} catch(e) {
    document.getElementById('conv-result').innerText = 'Erreur conversion';
}
}
let rootDirHandle;
let docsDirHandle;

async function createFolder() {
    if (!window.showDirectoryPicker) {
        alert("Cette fonctionnalité n'est pas supportée par votre navigateur.");
        document.getElementById("file-status").innerText = "API non supportée";
        return;
    }
    const name = prompt('Nom du dossier ?');
    if (!name) return;
    try {
        const handle = await window.showDirectoryPicker();
        docsDirHandle = await handle.getDirectoryHandle(name, { create: true });
        rootDirHandle = docsDirHandle;
        document.getElementById("file-status").innerText = `Dossier \"${name}\" créé`;
        document.getElementById("import-files").disabled = false;
    } catch (e) {
        document.getElementById("file-status").innerText = "Échec création dossier";
    }
}

async function chooseDirectory() {
if (!window.showDirectoryPicker) {
    document.getElementById("file-status").innerText = "API non supportée";
    return;
}
try {
    const handle = await window.showDirectoryPicker();
    rootDirHandle = await handle.getDirectoryHandle("DASH", { create: true });
    docsDirHandle = await rootDirHandle.getDirectoryHandle("documents", { create: true });
    document.getElementById("file-status").innerText = "Dossier prêt";
    document.getElementById("import-files").disabled = false;
} catch (e) {
    document.getElementById("file-status").innerText = "Échec sélection dossier";
}
}

async function importFiles() {
if (!docsDirHandle) return;
const input = document.getElementById("file-input");
input.onchange = async () => {
    const files = Array.from(input.files);
    for (const file of files) {
        const fh = await docsDirHandle.getFileHandle(file.name, { create: true });
        const writable = await fh.createWritable();
        await writable.write(file);
        await writable.close();
    }
    document.getElementById("file-status").innerText = files.length + " fichier(s) importé(s)";
    input.value = "";
};
input.click();
}

document.getElementById("choose-dir").addEventListener("click", chooseDirectory);
document.getElementById("create-folder").addEventListener("click", createFolder);
document.getElementById("import-files").addEventListener("click", importFiles);
document.getElementById('import-ticket').addEventListener('click', importTicket);


document.getElementById('convert-currency').addEventListener('click', convertCurrency);
document.getElementById('dark-toggle').addEventListener('change', e => {
    darkMode = e.target.checked;
    localStorage.setItem('darkMode', darkMode);
    applyDarkMode();
});
document.getElementById('export-note').addEventListener('click', () => {
const text = document.getElementById('note-text').value;
const date = new Date().toISOString().slice(0,10);
const blob = new Blob([text], {type:'text/plain'});
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = `note-${date}.txt`;
a.click();
URL.revokeObjectURL(a.href);
});

function applyDarkMode() {
    document.body.classList.toggle('dark', darkMode);
    document.getElementById('dark-toggle').checked = darkMode;
}

function updateNetworkStatus() {
    const el = document.getElementById('network-status');
    if (el) el.innerText = navigator.onLine ? 'En ligne' : 'Hors ligne';
}

window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

populateCurrencies();
updateWeather();
updateCountdown();
loadEvents();
renderFinance();
renderTickets();
applyDarkMode();
updateNetworkStatus();
setInterval(updateCountdown, 86400000);
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
