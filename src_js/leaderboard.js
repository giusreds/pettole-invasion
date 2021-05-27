const theUrl = "https://script.google.com/macros/s/AKfycbwg46p8shI9z5uGQV33n-DP-Mgblo2zgUb969NmeYbmAnThnA/exec";
var tempStorage = "";
const sender = "leaderb";

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {
    var message = JSON.parse(event.data);
    if (message.name == "sync") start();
    if (message.name == "storage") {
        tempStorage = message.value;
        logged();
    }
}

function logged() {
    try {
        var st = JSON.parse(atob(tempStorage))
    } catch (e) {
        var st = {
            "key": null
        };
    }
    if (!st.key) {
        $("#accedi").show();
        $("#stats").hide();
    } else {
        $("#accedi").hide();
        $("#stats").show();
    }

}

function start() {
    syncData();
    requestStorage();
}

function requestStorage() {
    var d = {
        "name": "getStorage",
        "value": 0,
        "sender": sender
    };
    window.parent.postMessage(JSON.stringify(d), "*");
}

$("#accedi-btn").click(function () {
    window.parent.postMessage('{"name":"apriLogin"}', "*");
    window.parent.postMessage('{"name":"chiudiLeaderboard"}', "*");
});

$(window).on("load", syncData);


function syncData() {
    syncCountApi();
    document.getElementById("container").style.display = "none";
    document.getElementById("loading").style.display = "block";

    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {

            var risposta = JSON.parse(atob(xmlHttp.responseText));
            if (risposta.rank.length > 0) {
                var clasComunale = '<div class="table" id="comunale">';
                // clasComunale += "<tr><th colspan='2'>" + comune;
                for (var i = 0; i < risposta.rank.length; i++) {
                    var temp = '<div class="row">';
                    temp += '<div class="rank">' + (i + 1) + "</div>";
                    var nm = (risposta.rank[i].n.length > 13) ? risposta.rank[i].n.slice(0, 13) + "..." : risposta.rank[i].n
                    temp += '<div><div class="main">' + nm + "</div>";
                    temp += "<div class='score'>" + fPunto(risposta.rank[i].s) + "</div></div></div>";
                    clasComunale += temp;
                }
                clasComunale += "</div>";
            } else {
                var clasComunale = "<p>Nulla da mostrare</p>";
            }
            document.getElementById("clasComunale").innerHTML = clasComunale;
            document.getElementById("container").style.display = "block";
            document.getElementById("loading").style.display = "none";
        }
    }

    xmlHttp.onprogress = function (event) {
        if (event.lengthComputable) {
            var percentComplete = (event.loaded / event.total) * 100;
            console.log(percentComplete);
        }
    }

    var body = {
        "h": "c"
    };
    xmlHttp.open("POST", theUrl, true);
    xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xmlHttp.send(btoa(JSON.stringify(body)));
}

function fPunto(num) {
    return num.toLocaleString('it', { useGrouping: true });
}

document.getElementById("chiudi").addEventListener("click", function () {
    window.parent.postMessage('{"name":"chiudiLeaderboard"}', '*');
});

document.getElementById("aggiorna").addEventListener("click", syncData);


// Menu buttons
$("#comunale-btn").click(function () {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#clasComunale").offset().top - 80
    }, 600);
});
$("#regionale-btn").click(function () {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#clasGenerale").offset().top - 80
    }, 600);
});
$("#players-btn").click(function () {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#clasPlayers").offset().top - 80
    }, 600);
});


function syncCountApi() {
    $.getJSON("https://api.countapi.xyz/get/giusreds.github.io/PettolePlay", function (response) {
        $("#PettolePlay").text(fPunto(response.value));
    });
    $.getJSON("https://api.countapi.xyz/get/giusreds.github.io/PettoleDegustate", function (response) {
        $("#PettoleDegustate").text(fPunto(response.value));
    });
}