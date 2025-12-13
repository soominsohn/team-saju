"use client";

import { useState } from "react";

export function SupportButton({ variant = "default" }: { variant?: "default" | "locked" | "minimal" }) {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleDonate = () => {
    // Mock: 실제로는 Buy Me a Coffee URL
    // window.open("https://www.buymeacoffee.com/YOUR_USERNAME", "_blank");

    // 데모용: localStorage에 후원 기록
    localStorage.setItem("team-saju-donated", "true");
    setShowModal(false);
    // 모든 LockedSection이 업데이트되도록 이벤트 발생
    window.dispatchEvent(new CustomEvent("donation-completed"));
  };

  const handleSkip = () => {
    // "나중에 할래요" - 하단 버튼에서는 그냥 모달만 닫기
    setShowModal(false);
  };

  if (variant === "locked") {
    return (
      <button
        onClick={handleButtonClick}
        className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <span className="text-xl">💛</span>
        <span>990원 후원하고 전체 분석 보기</span>
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button
        onClick={handleButtonClick}
        className="text-sm text-amber-700 hover:text-amber-900 underline decoration-dotted"
      >
        💛 후원하기
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors flex items-center gap-2 border border-amber-300"
      >
        <span>☕</span>
        <span className="text-sm">이 서비스가 도움이 되었다면?</span>
      </button>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-4">💛</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">전체 분석 보기</h3>
              <p className="text-slate-600 mb-4">
                무료로 보실 수 있습니다!
                <br />
                <span className="text-sm">
                  990원 후원하시면 서비스 개선에 큰 힘이 됩니다 😊
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">💛</span>
                <span>990원 후원하고 보기</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                아니요, 나중에 할래요
              </button>
            </div>

            <p className="text-xs text-center text-slate-500">
              💛 지금 바로 무료로 보시거나, 후원하시면 큰 도움이 돼요
            </p>
          </div>
        </div>
      )}
    </>
  );
}
