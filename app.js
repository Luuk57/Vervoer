const firebaseConfig = {
    apiKey: "AIzaSyDOj-x4BV4J1rkZ21Rl29D5kKnkTaswWVw",
    authDomain: "tabos-vocht.firebaseapp.com",
    databaseURL: "https://tabos-vocht-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tabos-vocht",
    storageBucket: "tabos-vocht.appspot.com",
    messagingSenderId: "372380067963",
    appId: "1:372380067963:web:a9edec9815588e64b41ade"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const statusInput = document.getElementById('statusInput');
const numberValue = document.getElementById('numberValue');
const liveStatusDisplay = document.getElementById('liveStatusDisplay');
const liveValueDisplay = document.getElementById('liveValueDisplay');

statusInput.addEventListener('input', (e) => {
    db.ref('liveData/statusText').set(e.target.value);
});

numberValue.addEventListener('input', (e) => {
    db.ref('liveData/numberVal').set(e.target.value);
});

db.ref('liveData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.statusText !== undefined) {
            liveStatusDisplay.innerText = data.statusText;
            if (document.activeElement !== statusInput) {
                statusInput.value = data.statusText;
            }
        }
        if (data.numberVal !== undefined) {
            liveValueDisplay.innerText = data.numberVal;
            if (document.activeElement !== numberValue) {
                numberValue.value = data.numberVal;
            }
        }
    }
});

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

document.querySelectorAll('.btn-min, .btn-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const win = e.target.closest('.window');
        win.classList.add('minimized');
    });
});

document.querySelectorAll('.taskbar-item').forEach(item => {
    item.addEventListener('click', () => {
        const winId = item.getAttribute('data-window');
        const win = document.getElementById(winId);
        win.classList.toggle('minimized');
    });
});

document.getElementById('btnGps').addEventListener('click', () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            document.getElementById('lat').innerText = lat.toFixed(5);
            document.getElementById('lng').innerText = lng.toFixed(5);
            db.ref('liveData/gps').set({ lat: lat, lng: lng });
        }, (err) => {
            alert("GPS fout: " + err.message);
        }, { enableHighAccuracy: true });
    } else {
        alert("Geolocatie wordt niet ondersteund.");
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
