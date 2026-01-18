"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// 1. 全データのインポート
// ファイルパスが正しいか確認してください（src/app/page.tsx から見た dataフォルダの位置）
import week1 from "../data/week1.json";
import week2 from "../data/week2.json";
import week3 from "../data/week3.json";
import week4 from "../data/week4.json";

// 型定義
type Question = {
  id: string;
  source: string;
  question: string;
  statements?: string[];
  options: string[];
  answer: string;
  explanation: string;
  hasImage: boolean;
};

// 2. 全データを結合（Master Data）
const MASTER_DATA: Question[] = [
  ...(week1 as Question[]),
  ...(week2 as Question[]),
  ...(week3 as Question[]),
  ...(week4 as Question[]),
];

// 3. シャッフル関数（フィッシャー・イェーツ法）
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function QuizPage() {
  // --- State管理 ---

  // 実際にプレイする問題リスト
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  // ゲームの状態 ('idle' = スタート画面, 'playing' = 回答中, 'result' = 結果画面)
  const [gameState, setGameState] = useState<"idle" | "playing" | "result">(
    "idle",
  );
  const [sessionScore, setSessionScore] = useState(0);

  // プレイ中の進捗
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 設定フラグ
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isSkipSolvedOn, setIsSkipSolvedOn] = useState(false);

  // 正解済みIDリスト
  const [solvedIds, setSolvedIds] = useState<string[]>([]);

  // --- 初期化処理 ---
  useEffect(() => {
    // マウント時にLocalStorageから成績を読み込む
    const saved = localStorage.getItem("solvedQuestions");
    if (saved) {
      setSolvedIds(JSON.parse(saved));
    }
  }, []);

  // --- 機能関数 ---

  // ゲーム開始処理
  const startGame = () => {
    let questions = [...MASTER_DATA];

    // 正解済みスキップ
    if (isSkipSolvedOn) {
      questions = questions.filter((q) => !solvedIds.includes(q.id));
    }

    // 問題がない場合のガード
    if (questions.length === 0) {
      alert(
        "条件に合う問題がありません（全て正解済みです）。設定を見直してください。",
      );
      return;
    }

    // シャッフル
    if (isShuffleOn) {
      questions = shuffleArray(questions);
    }

    // ゲーム状態のセット
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setSessionScore(0);
    setGameState("playing");
  };
  const startReview = (targetId: string) => {
    // マスターデータから対象の問題のインデックスを探す
    const targetIndex = MASTER_DATA.findIndex((q) => q.id === targetId);

    if (targetIndex === -1) return;

    // 設定（シャッフル等）は無視して、全問題を順番通りにセット
    setActiveQuestions(MASTER_DATA);
    setCurrentIndex(targetIndex); // クリックした問題の位置から開始
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
  };

  // 履歴リセット機能
  const resetHistory = () => {
    if (confirm("これまでの正解履歴をすべて消去しますか？")) {
      localStorage.removeItem("solvedQuestions");
      setSolvedIds([]);
    }
  };

  // 回答処理
  const currentQuestion = activeQuestions[currentIndex];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === Number(currentQuestion.answer);
    setIsCorrect(correct);

    // 正解ならLocalStorageに保存
    if (correct) {
      setSessionScore((prev) => prev + 1);
      if (!solvedIds.includes(currentQuestion.id)) {
        const newSolvedIds = [...solvedIds, currentQuestion.id];
        setSolvedIds(newSolvedIds);
        localStorage.setItem("solvedQuestions", JSON.stringify(newSolvedIds));
      }
    }
  };

  // 次の問題へ
  const nextQuestion = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setGameState("result");
    }
  };

  // --- レンダリング ---

  // 1. ホーム画面 (idle状態)
  if (gameState === "idle") {
    return (
      <main className="max-w-md mx-auto p-8 text-center min-h-screen flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-8 text-slate-800">
          ネットワーク概論
          <br />
          特訓ドリル
        </h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 text-left space-y-4">
          <h2 className="font-bold text-slate-500 mb-2 border-b pb-2">
            出題設定
          </h2>
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded transition-colors">
            <span className="font-medium text-slate-700">
              🔀 シャッフルして出題
            </span>
            <input
              type="checkbox"
              checked={isShuffleOn}
              onChange={(e) => setIsShuffleOn(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded transition-colors">
            <span className="font-medium text-slate-700">
              ✅ 正解済みをスキップ
            </span>
            <input
              type="checkbox"
              checked={isSkipSolvedOn}
              onChange={(e) => setIsSkipSolvedOn(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
        </div>

        {/* スタートボタン (既存) */}
        <button
          onClick={startGame}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 mb-8"
        >
          スタート！
        </button>
        <div className="text-left mb-8">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-bold text-slate-500">成績・復習リスト</h3>
            <span className="text-xs text-slate-400">
              正解済み: {solvedIds.length} / {MASTER_DATA.length}
            </span>
          </div>

          <div className="h-64 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-2 space-y-2 shadow-inner">
            {MASTER_DATA.map((q) => {
              const isSolved = solvedIds.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => startReview(q.id)}
                  className={`w-full text-left p-3 rounded-lg border flex items-center gap-3 transition-all group ${
                    isSolved
                      ? "bg-white border-green-200 hover:bg-green-50"
                      : "bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-200"
                  }`}
                >
                  {/* アイコン */}
                  <div
                    className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSolved
                        ? "bg-green-100 text-green-600"
                        : "bg-slate-100 text-slate-300 group-hover:bg-blue-100 group-hover:text-blue-400"
                    }`}
                  >
                    {isSolved ? "✔" : "-"}
                  </div>

                  {/* テキスト情報 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono bg-slate-100 px-1 rounded text-slate-500">
                        {q.id}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-700 truncate">
                      {q.question}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* -------------------------------------- */}

        <button
          onClick={resetHistory}
          className="text-sm text-slate-400 underline hover:text-slate-600 mb-8"
        >
          成績データをリセット
        </button>
      </main>
    );
  }
  if (gameState === "result") {
    const accuracy = Math.round((sessionScore / activeQuestions.length) * 100);

    return (
      <main className="max-w-md mx-auto p-8 text-center min-h-screen flex flex-col justify-center animate-in fade-in duration-500">
        <h2 className="text-2xl font-bold mb-2 text-slate-700">Result</h2>
        <div className="text-6xl font-black text-blue-600 mb-4">
          {accuracy}
          <span className="text-2xl ml-1">%</span>
        </div>
        <p className="text-slate-500 mb-8 font-bold">
          正解数: {sessionScore} / {activeQuestions.length} 問
        </p>

        {/* 次のアクション設定 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 text-left space-y-4">
          <h3 className="font-bold text-slate-500 text-sm mb-2 text-center">
            次の学習設定
          </h3>

          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded transition-colors">
            <span className="font-medium text-slate-700">
              🔀 シャッフルしてトライ
            </span>
            <input
              type="checkbox"
              checked={isShuffleOn}
              onChange={(e) => setIsShuffleOn(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-50 rounded transition-colors">
            <span className="font-medium text-slate-700">
              ✅ 正解済みをスキップ
            </span>
            <input
              type="checkbox"
              checked={isSkipSolvedOn}
              onChange={(e) => setIsSkipSolvedOn(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />
          </label>
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105 mb-4"
        >
          この設定で次に進む
        </button>

        <button
          onClick={() => setGameState("idle")}
          className="text-slate-400 font-bold hover:text-slate-600 underline"
        >
          ホームに戻る
        </button>
      </main>
    );
  }

  // 2. クイズ画面 (playing状態)
  // もし何らかのエラーでcurrentQuestionがない場合のガード
  if (!currentQuestion) return <div className="p-8">読み込み中...</div>;

  return (
    <main className="max-w-2xl mx-auto p-4 md:p-8">
      {/* ヘッダー: IDと進捗 */}
      <div className="mb-6 flex justify-between items-center">
        <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded border border-slate-300">
          {currentQuestion.id}
        </span>
        <span className="text-sm font-bold text-slate-500">
          Question {currentIndex + 1} / {activeQuestions.length}
        </span>
      </div>

      {/* 問題文エリア */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 leading-relaxed whitespace-pre-wrap">
          {currentQuestion.question}
        </h2>

        {/* 記述リスト (a. b. c. など) の表示 */}
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

        {/* 画像表示 */}
        {currentQuestion.hasImage && (
          <div className="my-4 border rounded-lg overflow-hidden bg-white shadow-sm flex justify-center p-4">
            <Image
              src={`/images/${currentQuestion.id}.png`}
              alt="問題画像"
              width={800}
              height={600}
              className="max-w-full h-auto"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
        )}
      </div>

      {/* 選択肢ボタン */}
      <div className="grid grid-cols-1 gap-3 mb-8">
        {currentQuestion.options.map((option, index) => {
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

      {/* 判定・解説・次へボタン */}
      {selectedAnswer !== null && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div
            className={`p-4 rounded-lg mb-6 border ${isCorrect ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}
          >
            <p className="font-bold text-lg mb-2 text-center">
              {isCorrect ? "✨ 正解！" : "❌ 不正解..."}
            </p>
            {/* 解説があれば表示 */}
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
            {currentIndex === activeQuestions.length - 1
              ? "ホームに戻る"
              : "次の問題へ"}
          </button>
        </div>
      )}

      {/* 問題マップ（ジャンプ機能） */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="font-bold text-slate-700 mb-4 text-sm">問題一覧</h3>
        <div className="flex flex-wrap gap-2">
          {activeQuestions.map((_, index) => {
            const isCurrent = index === currentIndex;
            let buttonClass =
              "w-10 h-10 rounded-lg font-mono text-sm font-bold transition-all ";

            if (isCurrent) {
              buttonClass +=
                "bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2 scale-110";
            } else {
              buttonClass +=
                "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105";
            }

            return (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setSelectedAnswer(null);
                  setIsCorrect(null);
                }}
                className={buttonClass}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
