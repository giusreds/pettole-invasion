// (c)2020 Giuseppe Rossi

// Script Google
const theUrl = "https://script.google.com/macros/s/AKfycbwg46p8shI9z5uGQV33n-DP-Mgblo2zgUb969NmeYbmAnThnA/exec";
// Storage
const sender = "loginfr";
var tempStorage = "";

// Espressione regolare per Email.
var mail_regex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}";

// Username: minimo 5, max 16 cratteri. Solo lettere minuscole, numeri, underscore e punto.
// Non può iniziare con punto o un numero.
var username_regex = "^[a-z0-9_]{1}[a-z0-9_\\.]{2,20}[a-z0-9_]{1}$";
// Almeno una lettera
var username_regex_char = "[a-z]+";

// Password
var password_regex = new RegExp("^(?=.{5,64})");

// Messaggi all'utente

var msg_out = [

    // 0:   Controllo validita
    "Sto controllando...",
    // 1:   Indirizzo mail gia registrato
    "Indirizzo gia' associato ad un altro account",
    // 2:   Utente gia registrato
    "Nome utente non disponibile",
    // 3:   Password non corrispondono
    "Le password non corrispondono",
    // 4:   Username o password errati
    "Username o password errati",
    // 5:   Seleziona... (Menu Provincia/Comune)
    "Seleziona...",
    // 6:   Errore registrazione
    "Errore nella registrazione",
    // 7:   Inserire una mail valida
    "Inserisci un indirizzo email valido",
    // 8:   Username inizio punto
    "Il tuo username non puo' iniziare con un punto",
    // 9:   Username termina punto
    "Il tuo username non può terminare con un punto",
    // 10:  Username non contiene lettere
    "Il tuo username deve contenere almeno una lettera",
    // 11:  Username non maiuscole
    "Il tuo username non può contenere lettere maiuscole",
    // 12:  Username troppo corto
    "Il tuo username deve essere lungo almeno 4 caratteri",
    // 13:  Username troppo lungo
    "Il tuo username non puo' superare i 22 caratteri",
    // 14:  Username no caratteri speciali
    "Il tuo username non puo' contenere caratteri speciali",
    // 15:  Password corta
    "La password deve contenere almeno 5 caratteri"
];

// Document elements

var username = document.getElementById("username_r");
var psw1 = document.getElementById("password1");
var psw2 = document.getElementById("password2");
var pswBkp;
var username_msg = document.getElementById("username-msg");
var username_l = document.getElementById("username_l");
var password_l = document.getElementById("password_l");

// Registrazione
function register() {

    /* if(!(userNameValid() && passwordValid() && emailValid() && comune.value == null)){
         document.getElementById("error").innerHTML = "Controlla tutti i campi";
         return;
     }*/
    username.disabled = true;
    psw1.disabled = true;
    psw2.disabled = true;
    document.getElementById("registrati-btn").innerHTML = "ATTENDI...";
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            var risposta = JSON.parse(atob(xmlHttp.responseText));

            if (!risposta.r) {
                document.getElementById("error").innerHTML = msg_out[6];
            } else {
                saveStorage(risposta);
                window.parent.postMessage('{"name":"salvaLogin"}', '*');
            }
            username.disabled = false;
            psw1.disabled = false;
            psw2.disabled = false;
            document.getElementById("registrati-btn").innerHTML = "REGISTRATI";

        }
    }
    pswBkp = psw1.value;
    var body = {
        "h": "r",
        "n": username.value,
        "psw": psw1.value
    };
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send(btoa(JSON.stringify(body)));
    return false;
}

// Sezione validazione

// Username valido
function userNameValid() {
    if (username.value.match(username_regex)
        && username.value.match(username_regex_char)) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                var risposta = JSON.parse(atob(xmlHttp.responseText));
                if (!risposta.v) {
                    username.className = "nes-input is-error";
                    username.setCustomValidity(" "); // Invalid
                    username_msg.className = "nes-text is-error";
                    username_msg.innerHTML = msg_out[2];
                } else {
                    username.className = "nes-input is-success";
                    username.setCustomValidity(""); // Valid
                    username_msg.innerHTML = "";
                }
                return risposta.v;
            } else {
                username.className = "nes-input is-warning";
                username.setCustomValidity(" "); // Invalid 
                username_msg.className = "nes-text is-warning";
                username_msg.innerHTML = msg_out[0]; // Controllando...
            }
        }
        var body = {
            "h": "vu",
            "n": username.value
        };
        xmlHttp.open("POST", theUrl, true);
        xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlHttp.send(btoa(JSON.stringify(body)));
    } else {
        username.className = "nes-input is-error";
        username.setCustomValidity(" "); // Invalid
        var error;

        // Contenere lettere
        if (username.value.match("[^a-zA-Z0-9_\\.]"))
            error = msg_out[14];
        // Inizia con punto
        else if (username.value.match("^[\\.]"))
            error = msg_out[8];
        // Finisce con punto
        else if (username.value.match("[\\.]$"))
            error = msg_out[9];
        // Troppo lungo
        else if (username.value.match("^.{23,}$"))
            error = msg_out[13];
        // Troppo corto
        else if (username.value.match("^.{0,3}$"))
            error = msg_out[12];
        // Contiene lettere maiuscole
        else if (username.value.match("[A-Z]+"))
            error = msg_out[11];
        else
            error = msg_out[10];

        if (username.value) {
            username_msg.className = "nes-text is-error";
            username_msg.innerHTML = error;
        }
    }
}

username.addEventListener('invalid', userNameValid);
psw2.addEventListener("invalid", passwordValid);
psw2.addEventListener("change", passwordValid);
username.addEventListener("change", userNameValid);

var psw1_msg = document.getElementById("psw1-msg");
var psw2_msg = document.getElementById("psw2-msg");

psw1.addEventListener("invalid", passwordPattern);
psw1.addEventListener("keyup", passwordPattern);


// STORAGE

function getStorage() {
    window.parent.postMessage('{"name":"getStorage"}', "*");
    return new Promise((resolve) => {
        function rsm(event) {
            var r = JSON.parse(event.data);
            if (r.name == "storage") {
                console.log("storage: " + r.value);
                window.removeEventListener("message", rsm);
                resolve(r.value);
            }
        }
        window.addEventListener("message", rsm);
    });
}

function saveStorage(data) {
    var strg = getStorage();
    strg.then(value => {
        try {
            if (value != null) {
                var ts = JSON.parse(atob(value));
                ts.n = data.n;
                ts.key = data.key;
                if (data.s > ts.s) ts.s = data.s
            } else {
                var ts = {
                    n: data.n,
                    key: data.key,
                    s: data.s
                };
            }
            setStorage(btoa(JSON.stringify(ts)));
        } catch (e) {
            logout();
        }
    });
}

function passwordPattern() {
    if (psw1.value.match(password_regex)) {
        psw1.className = "nes-input is-success";
        psw1.setCustomValidity(""); // Valid
        psw1_msg.innerHTML = "";
    } else {
        psw1.className = "nes-input is-error";
        psw1.setCustomValidity(" "); // Invalid
        psw1_msg.className = "nes-text is-error";
        if (psw1.value.length)
            psw1_msg.innerHTML = msg_out[15];
    }
    if (psw2.value) passwordValid();
}

function loginFieldsValid() {
    var username = document.getElementById("username_l");
    var password = document.getElementById("password_l");
    var uvalid = true;
    var pvalid = true;
    if (!username.value) {
        username.setCustomValidity(" ");
        uvalid = false;
        username.className = "nes-input is-error";
        username.addEventListener("change", loginFieldsValid);
    } else {
        username.setCustomValidity("");
        uvalid = true;
        username.className = "nes-input";
    }
    if (!password.value) {
        password.setCustomValidity(" ");
        pvalid = false;
        password.className = "nes-input is-error";
        password.addEventListener("change", loginFieldsValid);
    } else {
        password.setCustomValidity("");
        pvalid = true;
        password.className = "nes-input";
    }
    return uvalid && pvalid;
}

function passwordValid() {
    if (!psw2.value)
        psw2.className = "nes-input is-error";
    else if (psw1.value != psw2.value) {
        psw2.className = "nes-input is-error";
        psw2.setCustomValidity(" "); // Invalid
        psw2_msg.className = "nes-text is-error";
        psw2_msg.innerHTML = msg_out[3];
    } else {
        psw2.className = "nes-input is-success"
        psw2.setCustomValidity(""); // Valid
        psw2_msg.innerHTML = "";
    }
    return (psw1.value == psw2.value);
}

function toLogin() {
    document.getElementById("registrati").style.display = "none";
    document.getElementById("hogia").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("nhogia").style.display = "block";
}
function toReg() {
    document.getElementById("registrati").style.display = "block";
    document.getElementById("hogia").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("nhogia").style.display = "none";
}

function accedi() {

    if (!loginFieldsValid()) return false;

    var xmlHttp = new XMLHttpRequest();

    username_l.disabled = true;
    password_l.disabled = true;
    document.getElementById("accedi-btn").innerHTML = "ATTENDI...";
    document.getElementById("error_l").innerHTML = "";
    document.getElementById("password_l").className = "nes-input is-disabled";
    document.getElementById("username_l").className = "nes-input is-disabled";

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            var risposta = JSON.parse(atob(xmlHttp.responseText));

            if (!risposta.r) {
                document.getElementById("password_l").className = "nes-input is-error";
                document.getElementById("username_l").className = "nes-input is-error";
                document.getElementById("error_l").className = "nes-text is-error";
                document.getElementById("error_l").innerHTML = msg_out[4];
            } else {
                document.getElementById("password_l").className = "nes-input";
                document.getElementById("username_l").className = "nes-input";
                document.getElementById("error_l").innerHTML = "";

                saveStorage(risposta);
                window.parent.postMessage('{"name":"salvaLogin"}', '*');
            }
            username_l.disabled = false;
            password_l.disabled = false;
            document.getElementById("accedi-btn").innerHTML = "ACCEDI";

        }
    }
    var psw = document.getElementById("password_l").value;
    var un = document.getElementById("username_l").value;
    var body = {
        "h": "l",
        "n": un,
        "psw": psw
    };
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send(btoa(JSON.stringify(body)));
    return false;
}

function chiudiLogin() {
    window.parent.postMessage('{"name":"chiudiLogin"}', '*');
}

window.addEventListener("message", receiveMessage, false);
document.addEventListener("DOMContentLoaded", requestStorage);

// Storage
function receiveMessage(event) {
    var message = JSON.parse(event.data);
    if (message.name == "load") requestStorage();
    if (message.name == "storage") {
        tempStorage = message.value;
        logged();
    }
}
function requestStorage() {
    var d = {
        "name": "getStorage"
    };
    window.parent.postMessage(JSON.stringify(d), "*");
}
function setStorage(val) {
    var d = {
        "name": "setStorage",
        "value": val
    };
    tempStorage = val;
    window.parent.postMessage(JSON.stringify(d), "*");
}

function logged() {
    document.getElementById("register-form").reset();
    document.getElementById("login-form").reset();
    try {
        var t = JSON.parse(atob(tempStorage));
    } catch (e) {
        var t = {
            key: null
        };
    }
    if (t.key) {
        document.getElementById("login").style.display = "none";
        document.getElementById("registrati").style.display = "none";
        document.getElementById("logout").style.display = "block";
        document.getElementById("nhogia").style.display = "none";
        document.getElementById("hogia").style.display = "none";
        document.getElementById("loggedUserName").innerHTML = t.n;
    } else {
        document.getElementById("login").style.display = "none";
        document.getElementById("registrati").style.display = "block";
        document.getElementById("logout").style.display = "none";
        document.getElementById("nhogia").style.display = "none";
        document.getElementById("hogia").style.display = "block";
    }
}

document.getElementById("logout-btn").addEventListener("click", logout);

function logout() {
    tempStorage = "";
    window.parent.postMessage('{"name":"clearStorage"}', "*");
    window.parent.postMessage('{"name":"salvaLogin"}', '*');
}

// Force Lowercase
document.getElementById("username_r").addEventListener("input", forceLower);
document.getElementById("username_l").addEventListener("input", forceLower);
function forceLower(event) {
    event.target.value = event.target.value.toLowerCase();
}