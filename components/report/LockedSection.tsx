"use client";

import { useEffect, useState } from "react";

export function LockedSection({
  children,
  preview,
  title,
  previewText,
}: {
  children: React.ReactNode;
  preview?: React.ReactNode;
  title: string;
  previewText: string;
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // localStorage로 후원 여부 체크
    const donated = localStorage.getItem("team-saju-donated");
    if (donated === "true") {
      setIsUnlocked(true);
    }
  }, []);

  const handleLockClick = () => {
    setShowModal(true);
  };

  const handleDonate = () => {
    // Mock: 실제로는 Buy Me a Coffee로 리다이렉트
    // window.open("https://www.buymeacoffee.com/YOUR_USERNAME", "_blank");
    localStorage.setItem("team-saju-donated", "true");
    setShowModal(false);
    window.location.reload();
  };

  const handleSkip = () => {
    // "나중에 할래요" - 세션 동안만 잠금 해제
    sessionStorage.setItem("team-saju-skip-donation", "true");
    setShowModal(false);
    setIsUnlocked(true);
  };

  useEffect(() => {
    // 세션 동안 건너뛰기 했는지 체크
    const skipped = sessionStorage.getItem("team-saju-skip-donation");
    if (skipped === "true") {
      setIsUnlocked(true);
    }
  }, []);

  if (isUnlocked) {
    return (
      <>
        {preview}
        {children}
      </>
    );
  }

  return (
    <>
      <div className="relative">
        {/* 프리뷰 영역 (첫 번째 아이템) */}
        {preview && <div className="mb-4">{preview}</div>}

        {/* 블러 처리된 나머지 */}
        <div className="blur-sm pointer-events-none select-none opacity-40 max-h-64 overflow-hidden">
          {children}
        </div>

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white flex flex-col items-center justify-center p-6 rounded-lg">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-4xl">🔒</div>
            <h4 className="text-lg font-semibold text-slate-800">{title}</h4>
            <p className="text-sm text-slate-600">{previewText}</p>

            <button
              onClick={handleLockClick}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <span className="text-xl">🔓</span>
              <span>전체 보기</span>
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="text-5xl mb-4">☕</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">전체 분석 보기</h3>
              <p className="text-slate-600 mb-4">
                무료로 보실 수 있습니다!
                <br />
                <span className="text-sm">
                  커피 한잔 후원하시면 서비스 개선에 큰 힘이 됩니다 😊
                </span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">☕</span>
                <span>커피 한잔 후원하고 보기</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                후원 없이 무료로 볼래요
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
