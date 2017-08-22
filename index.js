// 1. Разметка
//
// На странице должна быть задана html-форма с id="myForm", внутри которой содержатся
// a. инпуты
// - ФИО (name="fio"),
//     - Email (name="email"),
//     - Телефон (name="phone");
// b. кнопка отправки формы (id="submitButton").
//     А также должен быть задан div-контейнер с id="resultContainer" для вывода результата работы формы.
//
// 2. Поведение
//
// При отправке формы должна срабатывать валидация полей по следующим правилам:
//     - ФИО: Ровно три слова.
// - Email: Формат email-адреса, но только в доменах ya.ru, yandex.ru, yandex.ua, yandex.by, yandex.kz, yandex.com.
// - Телефон: Номер телефона, который начинается на +7, и имеет формат +7(999)999-99-99. Кроме того, сумма всех цифр телефона не должна превышать 30. Например, для +7(111)222-33-11 сумма равняется 24, а для +7(222)444-55-66 сумма равняется 47.
//
// Если валидация не прошла, соответствующим инпутам должен добавиться класс error с заданным стилем border: 1px solid red.
//     Если валидация прошла успешно, кнопка отправки формы должна стать неактивной и должен отправиться ajax-запрос на адрес, указанный в атрибуте action формы.*
//
// Может быть 3 варианта ответа на запрос с разным поведением для каждого:
//     a. {"status":"success"} – контейнеру resultContainer должен быть выставлен класс success и добавлено содержимое с текстом "Success"
// b. {"status":"error","reason":String} - контейнеру resultContainer должен быть выставлен класс error и добавлено содержимое с текстом из поля reason
// c. {"status":"progress","timeout":Number} - контейнеру resultContainer должен быть выставлен класс progress и через timeout миллисекунд необходимо повторить запрос (логика должна повторяться, пока в ответе не вернется отличный от progress статус)
//
// * Для простоты тестирования сабмита формы можно выполнять запросы на статические файлы с разными подготовленными вариантами ответов (success.json, error.json, progress.json). Поднимать отдельный сервер с выдачей разных ответов будет избыточным.
//
// 3. Глобальный объект
//
// В глобальной области видимости должен быть определен объект MyForm с методами
// validate() => { isValid: Boolean, errorFields: String[] }
// getData() => Object
// setData(Object) => undefined
// submit() => undefined
//
// Метод validate возвращает объект с признаком результата валидации (isValid) и массивом названий полей, которые не прошли валидацию (errorFields).
//     Метод getData возвращает объект с данными формы, где имена свойств совпадают с именами инпутов.
//     Метод setData принимает объект с данными формы и устанавливает их инпутам формы. Поля кроме phone, fio, email игнорируются.
//     Метод submit выполняет валидацию полей и отправку ajax-запроса, если валидация пройдена. Вызывается по клику на кнопку отправить.
//
//
//     В корне проекта обязательно должны присутствовать файлы
// /index.html — разметка страницы;
// /index.js – вся клиентская логика страницы.

MyForm = {
    validate: function () {
        var result = {
            isValid: true,
            errorFields: []
        };

        var fio = document.getElementsByName("fio")[0];
        var email = document.getElementsByName("email")[0];
        var phone = document.getElementsByName("phone")[0];

        if (fio.value.trim().replace("  ", " ").split(" ").length !== 3) {
            result.isValid = false;
            result.errorFields.push('fio');
            fio.classList.add("error");
        } else {
            fio.classList.remove("error");
        }

        if (!email.value.match(new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/i))) {
            result.isValid = false;
            result.errorFields.push('email');
            email.classList.add("error");
        } else {
            email.classList.remove("error");
        }

        if (!phone.value.match(new RegExp(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/)) && !checkSum(phone.value, 30)) {
            result.isValid = false;
            result.errorFields.push('phone');
            phone.classList.add("error");
        } else {
            phone.classList.remove("error");
        }

        function checkSum(phone, max) {
            var sum = 0;
            for (var i = 0; i < phone.length; i++) {
                var symbol = phone.charAt(i);
                var number = parseInt(symbol);
                if (!isNaN(number)) {
                    sum += number;
                    if (sum > max)
                        return false;
                }
            }
            return true;
        }

        return result;
    },
    getData: function () {
        return {
            fio: document.getElementsByName("fio")[0].value,
            email: document.getElementsByName("email")[0].value,
            phone: document.getElementsByName("phone")[0].value
        }
    },
    setData: function (data) {
        document.getElementsByName("fio")[0].value = data.fio;
        document.getElementsByName("email")[0].value = data.email;
        document.getElementsByName("phone")[0].value = data.phone;
    },
    submit: function () {
        document.getElementById("resultContainer").innerHTML = '';
        document.getElementById("resultContainer").classList.remove("success");
        document.getElementById("resultContainer").classList.remove("error");
        document.getElementById("resultContainer").classList.remove("progress");
        if (this.validate().isValid) {
            document.getElementById("submitButton").disabled = true;
            MyForm.setAction();
            $.ajax({
                url: document.getElementById("myForm").action,
                type: "GET",
                success: function (response) {
                    switch (response.status) {
                        case 'progress':
                            document.getElementById("resultContainer").classList.add("progress");
                            document.getElementById("resultContainer").innerHTML = "Loading...";
                            setTimeout(function () {
                                MyForm.submit();
                            }, response.timeout);
                            break;
                        case 'error':
                            document.getElementById("resultContainer").classList.add("error");
                            document.getElementById("resultContainer").innerHTML = response.reason;
                            document.getElementById("submitButton").disabled = false;
                            break;
                        case 'success':
                            document.getElementById("resultContainer").classList.add("success");
                            document.getElementById("resultContainer").innerHTML = response.result;
                            document.getElementById("submitButton").disabled = false;
                            break;
                    }
                }
            });
        }

        return false;
    },
    setAction: function () {
        document.getElementById("myForm").action = ["json/progress.json", "json/success.json", "json/error.json"][Math.floor(Math.random() * 3)];
    }
};

MyForm.setData({
    fio: 'abc a a',
    email: 'mqlo@ya.ru',
    phone: '123'
});
