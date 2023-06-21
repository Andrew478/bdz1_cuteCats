//  ============= Здесь все основные методы (кроме базы данных) =============

/* async function showSomething() {
    console.log(`вызов showSomething()`);
    let value = await catsDBLoadAllCatsIdFromServer();
    console.log(`showSomething(): получено значение: ${value}`);
}

showSomething(); */



let mainBox = document.querySelector('.mainContainer');
let box = document.querySelector('.container');
let btnAddCat = document.querySelector(".btnAddCat");
// let btnUpdatePage = document.querySelector(".btnUpdatePage");

let modalWindowAddCat = document.querySelector(".modal-container");
let btnModalWindowClose = document.querySelector(".modal-close");
let formAddCat = document.forms.formAddCat;

// форма редактирования информации о коте
let modalWindowEditCat = document.querySelector(".modal-container2");
let btnModalWindowEditCatClose = document.querySelector(".modal-close2");
let formEditCat = document.forms.formEditCat;

let btnDropdownSync = document.querySelector('#btnDropdownSync');
let dropdownSync = document.querySelector('#dropdownSync');
let btnSyncFromServer = document.querySelector('#btnSyncFromServer');
let btnSyncToServer = document.querySelector('#btnSyncToServer');






function createCard(cat, el = box) {
    let card = document.createElement('div');
    card.className = 'card';

    let name = document.createElement('h3');
    let age = document.createElement('span');
    let image = document.createElement('img');
    let likeContainer = document.createElement('p');
    let deleteButton = document.createElement('i');
    let like = document.createElement('i');

    name.innerText = (cat.name) ? cat.name : 'Безымянный кот';
    age.innerText = ((cat.age) && (cat.age >= 0)) ? `Возраст лет: ${cat.age}` : 'Возраст не указан';
    likeContainer.className = 'card__fav';
    deleteButton.className = 'fa-regular fa-trash-can card__fav__item';
    like.className = 'fa-heart';
    like.classList.add(cat.favorite ? 'fa-solid' : 'fa-regular'); /* определяем отображать лайкнутое сердечко или нет */
    let imageSrc = ((!cat.image) ? 'img/cat-default.jpg' : cat.image); // если у объекта cat, полученного от сервера, нет свойства image (оно пустое)
    image.src = imageSrc;
    image.className = 'card__image';

    // присваиваем айди кота в айди карточки, чтобы понимать чья это карточка в будущем
    card.setAttribute('id', cat.id);

    likeContainer.append(deleteButton, like);
    card.append(image, likeContainer, name, age);
    el.append(card);

    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCard(cat.id, card);
    });
    like.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = cat.id;
        changeFavoriteStatus(e, id);
    });
    card.addEventListener('click', e => { // изменение карточки кота
        e.stopPropagation();
        showFormEditCat(e);
    });
}




// удалить кота из базы и со страницы
function deleteCard(id, el) {
    if(catsDBDeleteCatFromDB(id)) {
        el.remove();
        if(!catsDB.length) mainBox.innerHTML = "<div class=\"empty\">У вас пока ещё нет питомцев</div>";
    }
}
function changeFavoriteStatus(e, id) {
    let currentValue = catsDBGetValue(id, 'favorite');
    catsDBChangeValue(id, 'favorite', !currentValue);
    e.currentTarget.classList.toggle('fa-solid');
    e.currentTarget.classList.toggle('fa-regular');
}
// показать форму для изменения кота
function showFormEditCat(e) {
    let id, name, age, rate, imageLink, image, like, description;
    let bodyForm = {};
    bodyForm = catsDBGetById(e.currentTarget.getAttribute('id')); 

    id = bodyForm['id'];
    name  = bodyForm['name'];
    age = bodyForm['age'];
    rate = bodyForm['rate'];
    imageLink = bodyForm['image'];
    like = bodyForm['favorite'];
    description = bodyForm['description'];

    image = formEditCat.querySelector('img');
    image.setAttribute('src', imageLink);

    for(let i = 0; i < formEditCat.elements.length; i++) {
        let input = formEditCat.elements[i];
        if(input.name) {
            if(input.type === 'checkbox') {
                input.checked = like;
            }
            else {
                if(input.name === 'id') input.value = id;
                else if(input.name === 'name') input.value = name;
                else if(input.name === 'age') input.value = age;
                else if(input.name === 'rate') input.value = rate;
                else if(input.name === 'image') input.value = imageLink;
                else if(input.name === 'description') input.value = description;
            }
        }
    }

    modalWindowEditCat.style.display = 'flex';
}

// отобразить котов, которые есть в базе
function showCats() {
    if(!catsDB.length) {
        mainBox.innerHTML = "<div class=\"empty\">У вас пока ещё нет питомцев</div>";
    } else {
        mainBox.innerHTML = ''; // убираем empty если таковой имелся
        box.innerHTML = ''; // очищаем блок с котами, чтобы наполнить актуальными. без этого коты будут преумножаться.
        mainBox.append(box); // добавляем чистенький блок с котами и далее его наполняем
        for(let i = 0; i < catsDB.length; i++) {
            createCard(catsDB[i], box);
        }
    }
}

btnAddCat.addEventListener('click', e => {
    modalWindowAddCat.style.display = 'flex';
});
btnModalWindowClose.addEventListener('click', e => {
    modalWindowAddCat.style.display = 'none';
});
btnModalWindowEditCatClose.addEventListener('click', e => {
    modalWindowEditCat.style.display = 'none';
});

formAddCat.addEventListener('submit', e => { // добавить кота
    e.preventDefault(); // остановить действие по умолчанию (отправка пустой формы)
    let bodyForm = {}

    for(let i = 0; i < formAddCat.elements.length; i++) {
        let input = formAddCat.elements[i];

        if(input.name) { // если элемент формы имеет атрибут name (отсортировываем безымянные элементы ненужные, а именно кнопку submit).
            if(input.type === 'checkbox') { // отлавливаем чекбокс ввиду его специфики работы (с ним нужно по особому)
                bodyForm[input.name] = (input.checked) ? input.checked : false; // если checkbox не трогать будет undefined, как я понял
            }
            else {
                bodyForm[input.name] = input.value; // отлов значений у обычных элементов типо имя, возраст, рейтинг.
            }
        }
    }
    if(catsDBAddCat(bodyForm)) { // если кот добавлен  в базу успешно
        formAddCat.reset(); // очищаем форму после добавления кота
        modalWindowAddCat.style.display = 'none';
        showCats();
    }
    else {
        alert('Кот с таким id уже есть в базе');
    }
})

formEditCat.addEventListener('submit', e => {
    e.preventDefault(); // остановить действие по умолчанию (отправка пустой формы)
    let bodyForm = {}

    for(let i = 0; i < formEditCat.elements.length; i++) {
        let input = formEditCat.elements[i];

        if(input.name) {
            if(input.type === 'checkbox') { 
                bodyForm[input.name] = input.checked; // вот так, а не через value считывается значение у checkbox
            }
            else {
                bodyForm[input.name] = input.value; // отлов значений у обычных элементов типо имя, возраст, рейтинг.
            }
        }
        
    }
    catsDB[catsDBGetIndexById(bodyForm['id'])] = bodyForm;
    formEditCat.reset();
    modalWindowEditCat.style.display = 'none';
    showCats();
})


function showDropdownSync() {
    console.log('Вызов showDropdownSync()');
    dropdownSync.classList.toggle('showDropdown');
}
btnDropdownSync.addEventListener('click', showDropdownSync);

window.addEventListener('click', e => {
    if(!e.target.matches('#btnDropdownSync')) {
        dropdownSync.classList.remove('showDropdown');
    }
})

btnSyncFromServer.addEventListener('click', catsDBLoadFromServer);
btnSyncToServer.addEventListener('click', catsDBLoadToServer);