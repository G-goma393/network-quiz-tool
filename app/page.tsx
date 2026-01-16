"use client";

import { useState } from "react";
import Image from "next/image";

// 1. 各回のデータをインポート
import week1 from "../data/week1.json";
import week2 from "../data/week2.json";
import week3 from "../data/week3.json";
// 将来的に week3 ができたらここに追加： import week3 from "../../data/week3.json";

// 2. すべての問題を講義回順（配列の順番）に結合
const allQuestions = [...week1, ...week2, ...week3];

export default function QuizPage() {
  // 変数名を quizData から allQuestions に変更したため、stateの初期値などはそのままでOKですが、
  // 参照している変数名を変更します。
  const quizData = allQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = quizData[currentIndex];

  // ... (handleAnswer 関数などは変更なし) ...

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    // JSONのanswerは文字列の数字("0"〜"3")なので、Numberで変換して比較
    const correct = index === Number(currentQuestion.answer);
    setIsCorrect(correct);
  };

  const nextQuestion = () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }
  };

  // 進捗状況の表示を少しリッチに（講義回と問題番号がわかるように）
  // ID（例: W01-Q01）から情報をパースして表示するのも手ですが、今回はシンプルにIDを表示します

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded border border-slate-300">
          {/* 現在の問題IDを表示 */}
          {currentQuestion.id}
        </span>
        <span className="text-sm font-bold text-slate-500">
          {/* 全体の中での進捗 */}
          Question {currentIndex + 1} / {quizData.length}
        </span>
      </div>

      {/* ... (以下、表示ロジックは変更なし) ... */}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 leading-relaxed">
          {currentQuestion.question}
        </h2>
        {currentQuestion.statements && (
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4 text-left">
            <ul className="list-none space-y-2">
              {currentQuestion.statements.map((stmt: string, i: number) => (
                <li key={i} className="text-slate-700 font-medium">
                  {stmt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentQuestion.hasImage && (
          <div className="my-4 border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* 画像パスは public/images/ID.png を想定 */}
            <Image
              src={`/images/${currentQuestion.id}.png`}
              alt="問題画像"
              width={600}
              height={400}
              className="w-full h-auto"
              style={{ objectFit: "contain" }} // 画像が見切れないように調整
            />
          </div>
        )}
      </div>

      {/* ... (選択肢ボタン等のロジックも変更なし) ... */}

      <div className="grid grid-cols-1 gap-3 mb-8">
        {currentQuestion.options.map((option, index) => {
          // ... (中身は同じ) ...
          let buttonStyle = "border-2 p-4 rounded-xl text-left transition-all ";

          if (selectedAnswer === index) {
            buttonStyle += isCorrect
              ? "border-green-500 bg-green-50"
              : "border-red-500 bg-red-50";
          } else {
            buttonStyle +=
              "border-slate-200 hover:border-blue-400 active:bg-slate-50";
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={buttonStyle}
              disabled={selectedAnswer !== null}
            >
              <span className="font-bold mr-2">
                {["ア", "イ", "ウ", "エ"][index]}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* ... (解説表示部分) ... */}

      {selectedAnswer !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-4 rounded-lg mb-6 border ${isCorrect ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}
          >
            <p className="font-bold text-lg mb-2 text-center">
              {isCorrect ? "✨ 正解！" : "❌ 不正解..."}
            </p>
            {/* 解説文があれば表示（week1, week2どちらにも対応） */}
            {currentQuestion.explanation && (
              <p className="text-sm mt-2 pt-2 border-t border-current/20 leading-relaxed">
                💡 <strong>解説:</strong>
                <br />
                {currentQuestion.explanation}
              </p>
            )}
          </div>

          <button
            onClick={nextQuestion}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg"
          >
            {currentIndex === quizData.length - 1 ? "全問題終了" : "次の問題へ"}
          </button>
        </div>
      )}
    </main>
  );
}
