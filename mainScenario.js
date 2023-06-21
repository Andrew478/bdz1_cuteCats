//  ============= здесь главный сценарий работы страницы =============

catsDBInitialize(); // инициализируем базу данных с котами на старте страницы

// временная инъекция
/* catsDB = [{
    "id": 1,
    "name": "Барсик",
    "image": "https://www.friendforpet.ru/api/sites/default/files/2022-01/064AEBCB-45EC-4CE7-AB13-C65F10F00B7B.jpeg",
    "age": 2,
    "rate": 5,
    "favorite": true,
    "description": "Внимательный, активный и ласковый. Любит играть, катать мяч, и мурчать на пледе рядом с людьми! Прилично воспитан, приучен к лотку. Вакцинирован, имеет ветеринарный паспорт."
  },
  {
    "id": 2,
    "name": "Персик",
    "image": "https://www.friendforpet.ru/api/sites/default/files/2022-01/064AEBCB-45EC-4CE7-AB13-C65F10F00B7B.jpeg",
    "age": 6,
    "rate": 5,
    "favorite": true,
    "description": "Простой кот"
  }]
  catsDBSaveAllInLocalStorage(catsDB); */

showCats();
