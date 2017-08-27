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

        if (!phone.value.match(new RegExp(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/)) || !checkSum(phone.value, 30)) {
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

$(function($){
    $("#phoneInput").mask("+7(999)999-99-99");
});
