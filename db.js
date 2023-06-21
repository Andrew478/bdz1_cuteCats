//  ============= Этот скрипт это база данных котов (localStorage + удалённый сервер) =============

let user = 'andrewzh';
let path = `https://cats.petiteweb.dev/api/single/${user}`;

let myStorage = window.localStorage;
const CATSLOCALSTORAGEKEY = 'catsDataBase';
let catsDB = []; // массив объектов cats

function catsDBSaveAll() {
    myStorage.setItem(CATSLOCALSTORAGEKEY, JSON.stringify(catsDB));
    // на сервер коты добавляются по одному
}



// ============= Операции с базой котов (сюда обращаются другие скрипты)

// при загрузке страницы опрашиваем localStorage и загружаем из него котов в базу. Если база пуста берём котов с сервера
async function catsDBInitialize() {
    catsDB = catsDBLoadAllCatsFromLocalStorage();
    if(catsDB.length) {
        console.log('catsDBInitialize(): котики успешно найдены в localStorage');
    }
    else {
        console.log('catsDBInitialize(): котики не найдены в localStorage, загружаю с сервера');
        catsDB = await catsDBLoadAllCatsDataFromServer();
        if(catsDB.length) {
            console.log('catsDBInitialize(): котики успешно найдены на сервере и загружены');
            console.log('catsDBInitialize(): загружаю котиков в localStorage');
            catsDBSaveAllInLocalStorage(catsDB);
            showCats();
        }
        else {
            console.log('catsDBInitialize(): Котиков нигде нет. База данных пуста.');
            showCats();
        }
    }
}
function catsDBAddCat(cat) {
    // проверяем есть ли уже такой котик по id
    let index = catsDBGetIndexById(cat.id);
    console.log(index);
    if(index === -1) { // кота с таким id в базе не найдено, можно добавлять
        catsDB.push(cat);
        catsDBSaveAllInLocalStorage(catsDB);
        return true;
    }
    else return false;
}
function catsDBDeleteCatFromDB(id) {
    let delIndex;
    let idFound = false;
    // находим айди
    for(let i in catsDB) {
        if(parseInt(catsDB[i].id) === parseInt(id)) {
            idFound = true;
            delIndex = i;
        }
    }
    if(idFound) {
        // если нашли удаляем
        console.log(`catsDBDeleteCatFromDB(id): котик с индексом ${id} найден в базе данных и удалён`);
        catsDB.splice(delIndex, 1);
        catsDBSaveAllInLocalStorage(catsDB);
        return true;
    }
    else return false;
}

function catsDBGetIndexById(id) {
    let result = -1;
    for(let i = 0; i < catsDB.length; i++) {
        if(parseInt(catsDB[i].id) === parseInt(id)) {
            result = i; 
        }
    }
    return result;
}
function catsDBGetById(id) {
    let result = {};
    for(let i = 0; i < catsDB.length; i++) {
        if(parseInt(catsDB[i].id) === parseInt(id)) {
            result = catsDB[i]; 
        }
    }
    return result;
}
function catsDBGetValue(id, key) {
    let result;
    let index = catsDBGetIndexById(id);
    if(index !== -1) { // -1 означает, что catsDBGetIndexById(id) не нашёл объект в базе
        result = catsDB[index][String(key)];
    }
    return result;
}
// изменить значение у объекта в базе по id
function catsDBChangeValue(id, key, value) {
    let index = catsDBGetIndexById(id);
    if(index !== -1) { // -1 означает, что catsDBGetIndexById(id) не нашёл объект в базе
        catsDB[index][String(key)] = value;
    }
    catsDBSaveAllInLocalStorage(catsDB);
    console.log(`catsDBChangeValue(): объект по id="${id}" изменил значение по ключу="${String(key)}" на "${value}"`);
}
// ============= Операции с local storage
function catsDBLoadAllCatsFromLocalStorage() {
    let allData = myStorage.getItem(CATSLOCALSTORAGEKEY);
    if(allData) { 
        allData = JSON.parse(allData);
        allData = [...allData];
        return allData;
    }
    return [];
}
// сохранить всех котов из массива с котами в localStorage
function catsDBSaveAllInLocalStorage(data) {
    myStorage.setItem(CATSLOCALSTORAGEKEY, JSON.stringify(data));
}

// ============= Операции с удалённым сервером
// загрузить всех котов с удалённой базы данных в нынешний массив данных
// метод всегда вернёт массив (если котов нет - пустой)
async function catsDBLoadAllCatsDataFromServer() {
    let result = await fetch(path + '/show')
    .then(res => {
        if(res.statusText === 'OK') {
            return res.json();
        }
        else return [];
    })
    .then(res => {
        res = [...res]; // получаем массив котов из json
        return res;
    })
    return result;
}
//метод всегда вернёт массив (если котов нет - пустой)
async function catsDBLoadAllCatsIdFromServer() {
    console.log(`вызов catsDBLoadAllCatsIdFromServer()`);
    let result = await fetch(path + '/ids')
    .then(res => res.json())
    .then(res => {
        res = [...res];
        return res;
    })
    return result;
}
async function catsDBDeleteCatOnServer(id) {
    let result = await fetch(`${path}/delete/${id}`, {
        method: 'delete'
    })
    .then(res => {
        //console.log(res.statusText);
    })
}
async function catsDBEditCatOnServer(cat) {
    fetch(path + `/update/${cat['id']}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(cat)
    })
    .then(res => {
        if(res.ok) { 
            console.log(`Кот с айди: ${cat['id']} и именем: "${cat['name']}" изменён на сервере`);
            return true; 
        }
        else {
            console.log(`Проблема с котом по айди: ${cat['id']} и именем: "${cat['name']}": не получилось изменить на сервере`);
            return false; 
        }
    })
}
async function catsDBAddCatOnServer(cat) {
    fetch(path + '/add', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(cat)
    })
    .then(res => {
        if(res.ok) { 
            console.log(`Кот с айди: ${cat['id']} и именем: "${cat['name']}" добавлен на сервер`);
            return true; 
        }
        else {
            console.log(`Проблема с котом по айди: ${cat['id']} и именем: "${cat['name']}": не получилось добавить на сервер`);
            return false; 
        }
    })
}
/*  Синхронизируем базу котов между localStorage и удалённым сервером.
toServer определяет направление синхронизации
toServer: true - отправляем из localStorage на сервер недостающих котов
toServer:false - отправляем с сервера в localStorage всех котов (просто скопом перезаписываем) */
async function catsDBsyncAll(toServer) {
    // 1. получаем котов с сервера
    let DBFromServer = await catsDBLoadAllCatsDataFromServer();
    console.log(`Коты с сервера загружены. Количество котов на сервере: ${DBFromServer.length}`);

    if(toServer) {
        // 2. формируем массив котов на отправку на сервер (add). Смотрим по id каких котов нет в массиве с сервера
        // 3. формируем массив котов на отправку на сервер (put метод), которые есть и там и там, но имеют отличия в данных
        // 4. формируем массив котов на удаление на сервере (delete), которые есть на сервере, но их нет здесь в LocalStorage.
        // 5. далее делаем все 3 запроса
        let arrayToAdd = [];
        
        

    }
    else {
        // 2. записываем данные в базу данных (в массив)
        // 3. записываем данные в localStorage
        // 4. обновляем страницу (showCats)
        catsDB = DBFromServer;
        catsDBSaveAllInLocalStorage(catsDB);
        showCats();
    }
}
// загрузить список котов со страницы на сервер (перезатрутся и обновятся данные на сервере)
async function catsDBLoadToServer() {
    console.log('catsDBLoadToServer(): загружаю список котов со страницы на сервер');
    let arrayAdd = []; // массив котов на добавление
    let arrayEdit = []; // массив котов на изменение данных
    let arrayDelete = []; // массив котов на удаление с сервера, если их нет в локальном хранилище

    let DBFromServer = await catsDBLoadAllCatsDataFromServer();

    // 1.1 инициализируем массивы "добавление" и "изменение"
    for(let i = 0; i < catsDB.length; i++) {
        let localCatId = parseInt(catsDB[i]['id']);
        let idFound = false; // найден ли в массиве сервера айди кота с локальной базы? false - добавляем на сервер, true - патчим
        for(let j = 0; j < DBFromServer.length; j++) {
            let serverCatId = parseInt(DBFromServer[j]['id']);
            if(serverCatId === localCatId) {
                idFound = true;
                continue;
            }
        }
        if(idFound) {
            arrayEdit.push(catsDB[i]);
        }
        else {
            arrayAdd.push(catsDB[i]);
        }
    }

    // 1.2 иницализируем массив "удаление"
    for(let i = 0; i < DBFromServer.length; i++) {
        let serverCatId = parseInt(DBFromServer[i]['id']);
        let idFound = false; // найден ли в локальном массиве айди кота с серверной базы? false - удаляем с сервера
        for(let j = 0; j < catsDB.length; j++) {
            let localCatId = parseInt(catsDB[j]['id']);
            if(serverCatId === localCatId) {
                idFound = true;
                continue;
            }
        }
        if(!idFound) arrayDelete.push(DBFromServer[i]);
    }

    // 2.1 добавляем на сервер
    for(let cat of arrayAdd) {
        await catsDBAddCatOnServer(cat);
    }
    console.log(`Добавлено котов на сервер: ${arrayAdd.length}`);
    // 2.2 изменяем на сервере
    for(let cat of arrayEdit) {
        await catsDBEditCatOnServer(cat);
    }
    console.log(`Изменено котов на сервере: ${arrayEdit.length}`);
    // 2.3 удаляем с сервера
    for(let cat of arrayDelete) {
        await catsDBDeleteCatOnServer(cat['id']);
    }
    console.log(`Удалено котов с сервера: ${arrayDelete.length}`);
    console.log('catsDBLoadToServer(): загрузка котов со страницы на сервер завершена');
}
// загрузить список котов с сервера на страницу (перезатрутся данные в локальном хранилище)
async function catsDBLoadFromServer() {
    console.log('catsDBLoadFromServer(): загружаю список котов с сервера');
    let DBFromServer = await catsDBLoadAllCatsDataFromServer();
    if(DBFromServer.length === 0) {
        console.log('catsDBLoadFromServer(): список котов на сервере пуст');
    }
    else {
        console.log(`catsDBLoadFromServer(): Коты с сервера загружены. Количество котов на сервере: ${DBFromServer.length}`);
        catsDB = DBFromServer;
        catsDBSaveAllInLocalStorage(catsDB);
        showCats();
    }
}


// ============= прочее









