// (c)2020 Giuseppe Rossi

/*
Funzioni e parametri:

    L'input di ciascuna funzione (h=...) deve essere codificato in base64 con la funzione btoa()
    L'output di ciascuna funzione deve essere decodificato con la funzione atob()

    Per le operaz. che richiedono il parametro key, questo è dato da: btoa({n=nickname, psw=SHA1(password)})

  - getClas() Richiesta classifica
    - Input: {h=c}
    - Output: {rank:[{n=nickname, s=score}]}
  - isValid() Validazione username
    - Input: {h=vu, n=nickname}
    - Output: {v=isValid} isValid = true / false
  - pushScore() Push risultato
    - Input: {h=p, s=score, key=key}
    - Output: getTop(c)
    - Error: {r=0, e="key"} Credenziali errate
  - register() Registra nuovo utente
    - Input: {h=r, n=nickname, psw=password(in chiaro)}
  - login() Login
    - Input: {h=l, n=nickname, psw=password(in chiaro)}
    - Output: {r=1, n=nickname, psw=password(hash) s=score}
    - Error: {r=0, e="key"} Credenziali errate
*/


// Alla ricezione di una richiesta HTTP
// POST
function doPost(e) {
  return interpreta(e.postData.contents);
}

function interpreta(string) {
  try {
    var t = decode(string);
  } catch (e) {
    return null;
  } finally {
    var t = decode(string);
    if (t.h == null) return null;
    if (t.h == 'p') return pushScore(t);
    if (t.h == 'vu') return isValid(t);
    if (t.h == 'c') return getClas(t);
    if (t.h == 'r') return register(t);
    if (t.h == 'l') return login(t);
  }
}

// Aggiunge punteggio
function pushScore(body) {
  var key = decode(body.key);
  var score = body.s;
  if (!key.n || score < 0 || score > 999999)
    return ret({ "r": 0, "e": "values" });
  var nickname = key.n;
  var timestamp = Utilities.formatDate(new Date(), "GMT+1", "dd/MM/yyyy HH:mm:ss");

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var clasP = ss.getSheets()[1];
  var order;
  var total;

  // Chiedo un Lock Pubblico, per bloccare in inserimento
  var lock = LockService.getPublicLock();
  lock.waitLock(30000); // Aspetto 30 secondi prima di annullare la richiesta

  var ok = 0;

  try {

    // Operazione su Players
    datas = clasP.getDataRange().getValues();

    // Aggiorno highscore e timestamp
    for (var i = 0; i < datas.length; i++) {
      if (datas[i][0] == nickname) {
        if (datas[i][1] == key.psw) {
          total = datas[i][2];
          order = i + 1;
          if (score > total) {
            var update = clasP.getRange(order, 3).setValue(score);
            var update = clasP.getRange(order, 4).setValue(timestamp);
            total = score;
            Logger.log('Aggiornato Player ' + nickname);
          }
        } else {
          return ret({ "r": 0, "e": "key" });
        }
        break;
      }
    }

    // Ordino la classifica
    var range = clasP.getRange("A:D");
    range.sort({
      column: 3,
      ascending: false
    });

  } catch (e) { // Se qualcosa va storto, ritorno un errore
    return ret({ "r": 0, "e": "lock" });
  } finally { // Rilascio il lock
    lock.releaseLock();
  }
  var ris = {
    r: 1,
    s: total
  };
  return ret(ris);
}

function getClas(body) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var clasP = ss.getSheets()[1];

  var risposta = {
    rank: []
  };

  var datas = clasP.getDataRange().getValues();

  for (var i = 0; i < datas.length && risposta.rank.length < 100 && datas[i][2] > 0; i++) {
    var elem = {
      n: datas[i][0],
      s: datas[i][2]
    }
    risposta.rank.push(elem);
  }

  return ret(risposta);
}

// Funzioni usate per verifiche interne
function isValidPsw(str) {
  var pattPsw = new RegExp("^(?=.{5,64})");
  return pattPsw.exec(str);
}

function isValidInt(n) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[1];
  datas = sheet.getDataRange().getValues();
  var pattern = new RegExp("^[a-z0-9_]{1}[a-z0-9_\\.]{2,20}[a-z0-9_]{1}$");
  return !datas.map(x => x[0]).includes(n) && pattern.exec(n);
}
// Funzioni chiamate dai client
function isValid(body) {
  var r = {
    "v": isValidInt(body.n)
  };
  return ret(r);
}

// Genera stringa casuale di lunghezza iLen
function generateRandomString(iLen) {
  var sRnd = '';
  var sChrs = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  for (var i = 0; i < iLen; i++) {
    var randomPoz = Math.floor(Math.random() * sChrs.length);
    sRnd += sChrs.substring(randomPoz, randomPoz + 1);
  }
  return sRnd;
}

// Calcola SHA1
function getSHA1(input) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_1, input);
  var txtHash = '';
  for (j = 0; j < rawHash.length; j++) {
    var hashVal = rawHash[j];
    if (hashVal < 0)
      hashVal += 256;
    if (hashVal.toString(16).length == 1)
      txtHash += "0";
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function pulisci() {
  var ui = SpreadsheetApp.getUi();
  var stringa = generateRandomString(8);
  var response = ui.prompt('Sei sicuro di voler pulire il database? (Scrivere "' + stringa + '")');
  if (response.getResponseText() == stringa) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var escludi = 2; //esclude i primi N fogli dall'eliminazione

    for (var i = 0 + escludi; i < sheets.length; i++) {
      ss.deleteSheet(sheets[i]);
    }
    sheets[0].clearContents(); //pulisce contenuto primo foglio
    sheets[1].clearContents(); //pulisce contenuto secondo foglio
  }
}

function ret(pippo) {
  var encoded = Utilities.base64Encode(JSON.stringify(pippo));
  return ContentService.createTextOutput(encoded).setMimeType(ContentService.MimeType.JSON);
}

function register(body) {
  var username = body.n;
  var password = body.psw;

  if (!isValidInt(username) || !isValidPsw(password))
    return ret({ "r": 0, "e": "values" });

  var timestamp = new Date();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var clasP = ss.getSheets()[1];

  // Chiedo un Lock Pubblico, per bloccare in inserimento
  var lock = LockService.getPublicLock();
  lock.waitLock(30000); // Aspetto 30 secondi prima di annullare la richiesta

  try {
    // Aggiungo una riga con le informazioni del nuovo utente
    clasP.appendRow([username, getSHA1(password), 0, timestamp]);
  } catch (e) { // Se qualcosa va storto, ritorno un errore
    return ret({ "r": 0, "e": "lock" });
  } finally { // Rilascio il lock
    lock.releaseLock();
  }
  var key = {
    n: username,
    psw: getSHA1(password)
  };
  var ris = {
    "r": 1,
    "n": username,
    "s": 0,
    "key": Utilities.base64Encode(JSON.stringify(key))
  }
  return ret(ris);
}

function login(body) {
  var user = body.n;
  var psw = getSHA1(body.psw);

  if (isValidInt(body.n))
    return ret({ "r": 0, "e": "key" });

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var clasP = ss.getSheets()[1];

  datas = clasP.getDataRange().getValues();
  var risposta = {
    r: 0
  };

  for (var i = 0; i < datas.length; i++) {
    if (datas[i][0] == user) {
      if (datas[i][1] == psw) {
        var elem = {
          "n": user,
          "psw": psw
        };
        risposta.r = 1;
        risposta.n = datas[i][0];
        risposta.s = datas[i][2];
        risposta.key = Utilities.base64Encode(JSON.stringify(elem));
      } else {
        risposta.r = 0;
        risposta.e = "key";
      }
      break;
    }
  }
  return ret(risposta);
}

function decode(param) {
  return JSON.parse(Utilities.newBlob(Utilities.base64Decode(param)).getDataAsString());
}
