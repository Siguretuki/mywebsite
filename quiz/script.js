// ===========================================
// microCMS 設定 (ご自身の情報に置き換えてください)
// ===========================================
const SERVICE_DOMAIN = process.env.SERVICE_DOMAIN;
const API_KEY = process.env.API_KEY;
const ENDPOINT = "blogs";
const API_URL = `https://${SERVICE_DOMAIN}.microcms.io/api/v1/${ENDPOINT}`;

// ===========================================
// アプリの状態管理
// ===========================================
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let isSubmitting = false; // 二重送信防止フラグ

// ===========================================
// DOMエレメントの取得
// ===========================================
const statusMessageEl = document.getElementById('status-message');
const quizAreaEl = document.getElementById('quiz-area');
const questionNumberEl = document.getElementById('question-number');
const questionImageEl = document.getElementById('question-image');
const questionTextEl = document.getElementById('question-text');
const answerInputEl = document.getElementById('answer-input');
const submitButtonEl = document.getElementById('submit-button');
const resultMessageEl = document.getElementById('result-message');


// ===========================================
// ユーティリティ関数
// ===========================================

// 配列をランダムにシャッフルする (Fisher-Yatesアルゴリズム)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// HTMLタグを除去する (リッチエディタのcontentを想定)
function stripHtmlTags(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// ===========================================
// メインロジック
// ===========================================

/**
 * microCMSから問題をフェッチし、シャッフルして初期化する
 */
async function initQuiz() {
    statusMessageEl.textContent = "問題を読み込み中...";
    quizAreaEl.style.display = 'none';

    try {
        const response = await fetch(API_URL, {
            headers: { 'X-MICROCMS-API-KEY': API_KEY }
        });
        
        if (!response.ok) {
            throw new Error(`APIエラー: ${response.status}`);
        }

        const data = await response.json();
        
        // データをシャッフル
        shuffledQuestions = shuffleArray(data.contents); 

        if (shuffledQuestions.length === 0) {
            statusMessageEl.textContent = "問題がありません。microCMSのコンテンツを確認してください。";
            return;
        }

        // 初期表示
        statusMessageEl.style.display = 'none';
        quizAreaEl.style.display = 'block';
        displayQuestion();

    } catch (error) {
        statusMessageEl.textContent = `データの取得に失敗しました: ${error.message}`;
        console.error("Initialization Error:", error);
    }
}

/**
 * 現在の問題を表示する
 */
function displayQuestion() {
    resultMessageEl.textContent = "";
    answerInputEl.value = "";
    submitButtonEl.disabled = false;
    isSubmitting = false;

    const question = shuffledQuestions[currentQuestionIndex];
    
    questionNumberEl.textContent = `問題 ${currentQuestionIndex + 1} / ${shuffledQuestions.length}`;
    
    // 画像は eyecatch.url を使用
    if (question.eyecatch && question.eyecatch.url) {
        questionImageEl.src = question.eyecatch.url;
    } else {
        questionImageEl.src = ''; // 画像がない場合は空にする
    }

    // 問題文 (content) はHTMLタグを除去して表示
    questionTextEl.textContent = stripHtmlTags(question.content || "問題文がありません");
    answerInputEl.focus();
}

/**
 * 回答をチェックする
 */
function checkAnswer() {
    if (isSubmitting) return; // 二重送信防止
    isSubmitting = true;
    submitButtonEl.disabled = true;

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const userAnswer = answerInputEl.value.trim();
    
    // 正解データは microCMS の title を使用
    const correctAnswer = currentQuestion.title.trim();

    // 回答を比較 (ここでは大文字小文字を区別しない、全角半角は区別)
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        resultMessageEl.textContent = "正解です！";
        resultMessageEl.className = "correct";
        
        // 1.5秒後に次の問題へ自動遷移
        setTimeout(goToNextQuestion, 1500); 

    } else {
        resultMessageEl.textContent = "不正解です。もう一度チャレンジ！";
        resultMessageEl.className = "incorrect";
        
        // 不正解の場合は入力欄をクリアし、再入力を促す
        answerInputEl.value = "";
        submitButtonEl.disabled = false;
        isSubmitting = false;
        answerInputEl.focus();
    }
}

/**
 * 次の問題へ移行、または終了する
 */
function goToNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < shuffledQuestions.length) {
        // 次の問題へ
        displayQuestion();
    } else {
        // 全問終了
        quizAreaEl.style.display = 'none';
        statusMessageEl.style.display = 'block';
        statusMessageEl.textContent = `🎉 全問クリア！お疲れ様でした！ (${shuffledQuestions.length}問中${shuffledQuestions.length}問正解)`;
    }
}

// ===========================================
// イベントリスナー
// ===========================================

// 「判定」ボタンクリック
submitButtonEl.addEventListener('click', checkAnswer);

// 回答欄でEnterキーを押したとき
answerInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// アプリケーションの開始

initQuiz();
