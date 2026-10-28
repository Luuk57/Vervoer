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

let currentUser = "";

// Elementen
const loginScreen = document.getElementById('login-screen');
const usernameInput = document.getElementById('usernameInput');
const btnLogin = document.getElementById('btnLogin');
const currentUserName = document.getElementById('currentUserName');

const statusInput = document.getElementById('statusInput');
const numberValue = document.getElementById('numberValue');
const activeUsersList = document.getElementById('activeUsersList');

// --- LOGIN AFHANDELING ---
btnLogin.addEventListener('click', () => {
    const name = usernameInput.value.trim();
    if (name === "") {
        alert("Vul een naam of voertuignummer in.");
        return;
    }

    currentUser = name;
    currentUserName.innerText = currentUser;
    loginScreen.style.display = 'none'; // Verberg login scherm

    // Registreer dit apparaat direct in de database
    updateMyData();
});

// Stuur wijzigingen door naar Firebase onder een uniek pad voor deze gebruiker
function updateMyData() {
    if (!currentUser) return;

    const userRef = db.ref('ritten/' + currentUser);
    userRef.set({
        name: currentUser,
        status: statusInput.value || "Online",
        value: numberValue.value || "0",
        lastUpdate: new Date().toLocaleTimeString()
    });
}

statusInput.addEventListener('input', updateMyData);
numberValue.addEventListener('input', updateMyData);

// --- CENTRALE OVERZICHT (Leest alle actieve apparaten uit) ---
db.ref('ritten').on('value', (snapshot) => {
    const allRitten = snapshot.val();
    activeUsersList.innerHTML = ""; // Maak lijst leeg en bouw opnieuw op

    if (allRitten) {
        Object.keys(allRitten).forEach((key) => {
            const data = allRitten[key];
            const li = document.createElement('li');
            li.innerHTML = `<strong>${data.name}</strong>: ${data.status} (Waarde: ${data.value}) <br><small style="color:gray;">Laatste update: ${data.lastUpdate || '-'}</small>`;
            activeUsersList.appendChild(li);
        });
    } else {
        activeUsersList.innerHTML = "<li>Nog geen actieve ritten/apparaten.</li>";
    }
});

// --- GPS FUNCTIONALITEIT ---
document.getElementById('btnGps').addEventListener('click', () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition((pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            document.getElementById('lat').innerText = lat.toFixed(5);
            document.getElementById('lng').innerText = lng.toFixed(5);
            
            // Stuur GPS ook mee naar de database voor deze gebruiker
            if (currentUser) {
                db.ref('ritten/' + currentUser + '/gps').set({ lat: lat, lng: lng });
            }
        }, (err) => {
            alert("GPS fout: " + err.message);
        }, { enableHighAccuracy: true });
    } else {
        alert("Geolocatie wordt niet ondersteund.");
    }
});

// --- WINDOWS UI ---
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

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
