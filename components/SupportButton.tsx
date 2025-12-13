"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function SupportButton({
  variant = "default",
  teamId,
  shareToken,
}: {
  variant?: "default" | "locked" | "minimal";
  teamId?: string;
  shareToken?: string | null;
}) {
  const [showModal, setShowModal] = useState(false);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleDonate = async () => {
    if (!teamId) return;

    try {
      const query = shareToken ? `?token=${shareToken}` : "";
      const response = await fetch(`/api/teams/${teamId}/donate${query}`, {
        method: "POST",
      });

      if (response.ok) {
        setShowModal(false);
        // 페이지 새로고침하여 최신 donated 상태 반영
        window.location.reload();
      }
    } catch (error) {
      console.error("Donation error:", error);
    }
  };

  const handleSkip = () => {
    // 모달만 닫기
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">후원하기</h3>
              <p className="text-slate-600 mb-4 text-sm">
                카카오페이로 간편하게 후원하시면
                <br />
                서비스 개선에 큰 힘이 됩니다
              </p>
            </div>

            {/* 카카오페이 QR 코드 */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 space-y-3">
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-lg shadow">
                  <QRCodeSVG
                    value="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold text-slate-800">990원 여기로 보내주세요</p>
                <a
                  href="https://qr.kakaopay.com/Ej7mhmDyi1ef05326"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline block break-all"
                >
                  https://qr.kakaopay.com/Ej7mhmDyi1ef05326
                </a>
                <p className="text-xs text-slate-600">링크를 눌러 간편하고 안전하게 보내실 수 있습니다</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                <span>후원 완료했어요</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 text-slate-600 text-sm hover:text-slate-800 transition-colors"
              >
                닫기
              </button>
            </div>

            <p className="text-xs text-center text-slate-500">
              💛 후원해주시면 서비스 개선에 큰 힘이 됩니다
            </p>
          </div>
        </div>
      )}
    </>
  );
}
