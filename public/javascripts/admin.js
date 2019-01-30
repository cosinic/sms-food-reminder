"use strict";
window.onload = function () {

    let field_pw = document.getElementById('field__password');
    let field_num = document.getElementById('field__number');
    let btn = document.getElementById('button__send');

    btn.addEventListener('click', checkAndSend);

    field_pw.addEventListener('keydown', (e) => {
        let key = e.which || e.keyCode;
        if (key === 13)
            btn.click();
    });

    function checkAndSend() {
        let pw = field_pw.value;
        let num = field_num.value;
        if (pw && field_num) {
            sendRequest(pw, num);
        }
    }

    function sendRequest(pw, number) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", '/sms/send', true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                window.alert('Sent!');
                field_pw.value = '';
                field_num.value = '';
            } else if (this.readyState === XMLHttpRequest.DONE && this.status === 401) {
                window.alert('Password Incorrect');
            } else if (this.readyState === XMLHttpRequest.DONE && this.status === 400) {
                window.alert('Bad request');
            }
        }
        let str = "password=" + pw + "&number=" + number;
        xhr.send(str);
    }

}