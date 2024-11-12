// Firebase конфигурация (замените на данные вашего проекта)
const firebaseConfig = {
    apiKey: "AIzaSyBcDKsrAosMmOm0bBYX_S1RKaMNc-NaHow",
    authDomain: "answers-63e2f.firebaseapp.com",
    databaseURL: "https://answers-63e2f-default-rtdb.firebaseio.com",
    projectId: "answers-63e2f",
    storageBucket: "answers-63e2f.firebasestorage.app",
    messagingSenderId: "591324937083",
    appId: "1:591324937083:web:66f3694726b43f9b239bde",
    measurementId: "G-X8ZP4RPK6C"
  };
// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Правильные ответы
const correctAnswers = {
    q1: 1,
    q2: 1,
    q3: 1,
    q4: 3,
    q5: 1,
    q6: 1,
    q7: 0,
    q8: 2,
    q9: 1,
    q10: 1,
    q11: 2,
    q12: 1,
    q13: 1,
    q14: 2,
    q15: 1,
    q16: 0,
    q17: 1,
    q18: 0,
    q19: 2,
    q20: 2
};

// Переменные
let timer;
let timeLeft = 1200; // 20 минут в секундах
let isTestStarted = false;

// Элементы DOM
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const quizForm = document.getElementById('quiz-form');
const quizContainer = document.getElementById('quiz-container');
const timerDisplay = document.getElementById('time');
const resultModal = document.getElementById('result-modal');
const resultText = document.getElementById('result');
const closeBtn = document.getElementById('close-btn');
const usernameInput = document.getElementById('username');

// Загрузка сохраненного состояния из LocalStorage
window.onload = function() {
    if (localStorage.getItem('testState')) {
        let testState = JSON.parse(localStorage.getItem('testState'));
        if (testState.isTestStarted) {
            usernameInput.value = testState.username;
            isTestStarted = true;
            timeLeft = testState.timeLeft;
            startTest();
            restoreAnswers(testState.answers);
        }
    }
}

// Обработчик для кнопки "Старт"
startBtn.addEventListener('click', () => {
    if (usernameInput.value.trim() === '') {
        alert('Пожалуйста, введите ваше имя.');
        return;
    }
    isTestStarted = true;
    startTest();
});

// Функция для запуска теста
function startTest() {
    document.getElementById('user-info').style.display = 'none';
    quizForm.style.display = 'block';
    submitBtn.style.display = 'block';
    document.getElementById('timer').style.display = 'block';

    // Запускаем таймер
    timer = setInterval(countdown, 1000);
}

// Функция для обратного отсчета времени
function countdown() {
    if (timeLeft <= 0) {
        clearInterval(timer);
        submitAnswers();
    } else {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        saveTestState();
    }
}

// Обработчик для кнопки "Отправить ответы"
quizForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitAnswers();
});

// Функция для отправки ответов
function submitAnswers() {
    clearInterval(timer);
    let formData = new FormData(quizForm);
    let userAnswers = {};
    for (let [key, value] of formData.entries()) {
        userAnswers[key] = parseInt(value);
    }

    // Подсчет результатов
    let score = 0;
    let totalQuestions = Object.keys(correctAnswers).length;
    let resultDetails = '';

    for (let key in correctAnswers) {
        let userAnswer = userAnswers[key];
        if (userAnswer === correctAnswers[key]) {
            score++;
            resultDetails += `<p><strong>${key}:</strong> Верно</p>`;
        } else {
            resultDetails += `<p><strong>${key}:</strong> Неверно. Правильный ответ: ${getCorrectOptionText(key)}</p>`;
        }
    }

    // Отображение результатов
    resultText.innerHTML = `<p>${usernameInput.value}, вы набрали ${score} из ${totalQuestions}.</p>` + resultDetails;
    resultModal.style.display = 'block';

    // Сохранение результатов в Firebase
    saveToFirebase(usernameInput.value, score, userAnswers);

    // Очистка LocalStorage
    localStorage.removeItem('testState');
}

// Функция для получения текста правильного варианта ответа
function getCorrectOptionText(questionKey) {
    let questionNumber = questionKey.substring(1); // Получаем номер вопроса
    let questionElem = document.querySelector(`.question:nth-of-type(${questionNumber})`);
    let correctOptionIndex = correctAnswers[questionKey];
    let correctOptionLabel = questionElem.querySelectorAll('label')[correctOptionIndex].textContent;
    return correctOptionLabel;
}

// Обработчик для кнопки "Закрыть"
closeBtn.addEventListener('click', () => {
    resultModal.style.display = 'none';
    location.reload();
});

// Функция для сохранения состояния теста в LocalStorage
function saveTestState() {
    let formData = new FormData(quizForm);
    let answers = {};
    for (let [key, value] of formData.entries()) {
        answers[key] = parseInt(value);
    }
    let testState = {
        isTestStarted: isTestStarted,
        username: usernameInput.value,
        timeLeft: timeLeft,
        answers: answers
    };
    localStorage.setItem('testState', JSON.stringify(testState));
}

// Функция для восстановления ответов из LocalStorage
function restoreAnswers(answers) {
    for (let key in answers) {
        let option = document.querySelector(`input[name="${key}"][value="${answers[key]}"]`);
        if (option) {
            option.checked = true;
        }
    }
}

// Функция для сохранения результатов в Firebase
function saveToFirebase(username, score, answers) {
    const userData = {
        username: username,
        score: score,
        answers: answers,
        timestamp: new Date().toISOString()
    };

    database.ref('quiz-results').push(userData, (error) => {
        if (error) {
            console.error("Ошибка при сохранении данных:", error);
        } else {
            console.log("Данные успешно сохранены.");
        }
    });
}
