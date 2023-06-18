/* ToDo List:
- когда удаляешь последнего котика форма не перезагружается в состояние "у вас нет питомцев. Просто пустая страница



*/



let user = 'andrewzh';
let path = `https://cats.petiteweb.dev/api/single/${user}`;

let catsDatabase = []; // сюда мы записываем данные по котам с сервера, отсюда берём данные для создания карточек

let mainBox = document.querySelector('.mainContainer');
let box = document.querySelector('.container');
let btnAddCat = document.querySelector(".btnAddCat");
let btnUpdatePage = document.querySelector(".btnUpdatePage");

let modalWindowAddCat = document.querySelector(".modal-container");
let btnModalWindowClose = document.querySelector(".modal-close");
let formAddCat = document.forms.formAddCat;

// форма редактирования информации о коте
let modalWindowEditCat = document.querySelector(".modal-container2");
let btnModalWindowEditCatClose = document.querySelector(".modal-close2");
let formEditCat = document.forms.formEditCat;

// ================== методы работы с catsDataBase

function catsDataBaseGetById(id) {
    /* console.log(`Присланный айди: ${id} имеет тип: ${typeof id} Значение при парсинге: ${parseInt(id)}, тип: ${typeof parseInt(id)}`); */
    let result = {};
    for(let i = 0; i < catsDatabase.length; i++) {
        if(parseInt(catsDatabase[i].id) === parseInt(id)) {
            /* console.log(`Айди предмета в массиве: ${catsDatabase[i].id}, тип: ${typeof catsDatabase[i].id}. Значение при парсинге: ${parseInt(catsDatabase[i].id)}, тип: ${typeof parseInt(catsDatabase[i].id)}`);
            console.log(`Присланный id и id текущего объекта равны без парсинга? ${catsDatabase[i].id === id} А с парсингом: ${(parseInt(catsDatabase[i].id) === parseInt(id))}`); */
            result = catsDatabase[i]; 
        }
    }
    console.log(result);
    return result;
}

// ================== 


/* в методе createCard мы вторым аргументом передаём el - Это элемент, внутри которого отрисовываем card
    по умолчанию мы задаём, что это будет box (удобно конкретно для этого проекта),
    но можно и задать любой другой элемент.
 */
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
    age.innerText = (cat.age >= 0) ? `Возраст лет: ${cat.age}` : 'Возраст не указан';
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
        if(cat.id) {
            fetch(`${path}/update/${cat.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify({favorite: !cat.favorite})
            })
            .then(function(res) {
                if(res.status === 200) {
                    like.classList.toggle('fa-solid');
                    like.classList.toggle('fa-regular');
                }
            })
        }
    });
    card.addEventListener('click', e => { // изменение карточки кота
        e.stopPropagation();
        /* console.log(e.target.getAttribute('id'));
        console.log(catsDataBaseGetById(4));
        console.log(catsDataBaseGetById(e.target.getAttribute('id'))); */
        // наполняем форму данными личного дела кота
        let id, name, age, rate, imageLink, image, like, description;
        
        let bodyForm = {};
        bodyForm = catsDataBaseGetById(e.target.getAttribute('id')); 

        /* for(let i = 0; i < formEditCat.elements.length; i++) {
            let input = formEditCat.elements[i];
            if(input.name) { // если элемент формы имеет атрибут name (отсортировываем безымянные элементы ненужные, а именно кнопку submit).
                if(input.type === 'checkbox') { // отлавливаем чекбокс ввиду его специфики работы (с ним нужно по особому)
                    bodyForm[input.name] = input.checked; // вот так, а не через value считывается значение у checkbox
                }
                else {
                    bodyForm[input.name] = input.value; // отлов значений у обычных элементов типо имя, возраст, рейтинг.
                }
            }
        } */

        id = bodyForm['id'];
        name  = bodyForm['name'];
        age = bodyForm['age'];
        rate = bodyForm['rate'];
        imageLink = bodyForm['image'];
        like = bodyForm['favorite'];
        console.log(`Значение bodyForm['favorite']: ${bodyForm['favorite']}`);  
        description = bodyForm['description'];

        image = formEditCat.querySelector('img');
        image.setAttribute('src', imageLink);

        /* console.log(`bodyForm[id]: ${bodyForm['id']}, id: ${id}`);
        console.log(`bodyForm[name]: ${bodyForm['name']}, name: ${name}`);
        console.log(`bodyForm[description]: ${bodyForm['description']}, description: ${description}`); */

        for(let i = 0; i < formEditCat.elements.length; i++) {
            let input = formEditCat.elements[i];
            if(input.name) {
                if(input.type === 'checkbox') {
                    console.log(`Значение input.checked перед присваиванием: ${input.checked}`);  
                    input.checked = like;
                    console.log(`Значение like: ${like}, input.checked: ${input.checked}`); 
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
    });
}
// удалить кота с сервера
function deleteCard(id, el) {
    if(id) { // забыл и не могу понять, для чего тут if() ?
        fetch(`${path}/delete/${id}`, {
            method: 'delete'
        })
        .then(function(res) {
            if(res.status === 200) { 
                el.remove();
                if(!catsDatabase.length) mainBox.innerHTML = "<div class=\"empty\">У вас пока ещё нет питомцев</div>";
            }
        })
    }
}
// ToDo: функция ниже для отображения котов на сервере затирает весь документ с местом их отображения, если котов нет
// что коты, которых мы добавляем просто вызовом из кода на страницу они не видны.

// отобразить котов, которые есть на сервере
function showCats() {
    fetch(path + '/show')
    .then(function (res) {
        /* console.log(res); */
        if(res.statusText === 'OK') {
            return res.json();
        }
    })
    .then(function(data) {
        /* console.log(data); */
        if(!data.length) {
            mainBox.innerHTML = "<div class=\"empty\">У вас пока ещё нет питомцев</div>";
        } else {
            box.innerHTML = ''; // без этого форма если коты уже имеются будет преумножаться.
            catsDatabase = [];
            for(let c of data) {
                catsDatabase.push(c);
            }
            for(let i = 0; i < catsDatabase.length; i++) {
                createCard(catsDatabase[i], box);
            }
            /* for(let c of data) {
                createCard(c, box);
            } */
        }
    })
}

// добавить кота на сервер
function addCat(cat) {
    fetch(path + '/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(cat)
    })
    .then(res => res.json())
    .then(function(data) {
        console.log(data);
    }) 
}

function chooseIdForNewCat() {
    let ids = [];
    fetch(path + '/ids')
    .then(res => res.json())
    .then(function (data) {
        console.log(`список id: ${data}`);
        ids = [...data];
        // метод автоматического определения id для добавляемого кота на сервер чтобы он не совпадал с существующими
        let newId = ids.length ? (ids[ids.length - 1] + 1) : 1; // если с сервера возвращаются отсортированные айдишники, то метод сработает. Если нет айдишников, то коту назначается id = 1.
        return newId;
    })
}


btnModalWindowEditCatClose.addEventListener('click', e => {
    modalWindowEditCat.style.display = 'none';
});

/* createCard(cat1);
createCard(cat2);
createCard(cat3); */

btnAddCat.addEventListener('click', e => {
    modalWindowAddCat.style.display = 'flex';
});
btnModalWindowClose.addEventListener('click', e => {
    modalWindowAddCat.style.display = 'none';
});
btnUpdatePage.addEventListener('click', e => {
    showCats();
});

formAddCat.addEventListener('submit', e => { // добавить кота
    e.preventDefault(); // остановить действие по умолчанию (отправка пустой формы)
    let bodyForm = {}

    for(let i = 0; i < formAddCat.elements.length; i++) {
        let input = formAddCat.elements[i];
        /* console.log(input);
        console.log(input.name);
        console.log(input.value); */

        if(input.name) { // если элемент формы имеет атрибут name (отсортировываем безымянные элементы ненужные, а именно кнопку submit).
            if(input.type === 'checkbox') { // отлавливаем чекбокс ввиду его специфики работы (с ним нужно по особому)
                /* bodyForm[input.name] = input.checked; // вот так, а не через value считывается значение у checkbox */
                bodyForm[input.name] = (input.checked) ? input.checked : false; // если checkbox не трогать будет undefined, как я понял
            }
            else {
                bodyForm[input.name] = input.value; // отлов значений у обычных элементов типо имя, возраст, рейтинг.
            }
        }
        
    }
    /* console.log(bodyForm); */
    fetch(path + '/add', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(bodyForm)
    })
    .then(res => {
        if(res.ok) { // если ответ от сервера успешный, то не идём дальше, просто заканчиваем этот метод
            formAddCat.reset(); // очищаем форму так как кот уже добавлен
            modalWindowAddCat.style.display = 'none';
            showCats(); // может заменить на showCats? форма если пустая то empty удалится? Да, проверено. Заменил
        }
        else {
            return res.json();
        }
    })
    .then(err => {
        if(err && err.message) { // err - проверяем существует ли такой переданный объект, ведь в случае успешного добавления кота мы ничего не передаём
            alert(err.message);
        }
    });
})


formEditCat.addEventListener('submit', e => {
    e.preventDefault(); // остановить действие по умолчанию (отправка пустой формы)
    let bodyForm = {}

    for(let i = 0; i < formEditCat.elements.length; i++) {
        let input = formEditCat.elements[i];
        /* console.log(input);
        console.log(input.name);
        console.log(input.value); */

        if(input.name) { // если элемент формы имеет атрибут name (отсортировываем безымянные элементы ненужные, а именно кнопку submit).
            if(input.type === 'checkbox') { // отлавливаем чекбокс ввиду его специфики работы (с ним нужно по особому)
                bodyForm[input.name] = input.checked; // вот так, а не через value считывается значение у checkbox
            }
            else {
                bodyForm[input.name] = input.value; // отлов значений у обычных элементов типо имя, возраст, рейтинг.
            }
        }
        
    }
    /* console.log(bodyForm); */
    fetch(path + `/update/${bodyForm['id']}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(bodyForm)
    })
    .then(res => {
        if(res.ok) { // если ответ от сервера успешный, то не идём дальше, просто заканчиваем этот метод
            formEditCat.reset(); // очищаем форму так как кот уже добавлен
            modalWindowEditCat.style.display = 'none';
            showCats(); // может заменить на showCats? форма если пустая то empty удалится? Да, проверено. Заменил
        }
        else {
            return res.json();
        }
    })
    .then(err => {
        if(err && err.message) { // err - проверяем существует ли такой переданный объект, ведь в случае успешного добавления кота мы ничего не передаём
            alert(err.message);
        }
    });
})
// --------------- НАЧАЛО ВЫПОЛНЕНИЯ ПРОГРАММЫ ------------------

showCats();