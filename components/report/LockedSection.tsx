"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function LockedSection({
  children,
  preview,
  title,
  previewText,
  donated = false,
  teamId,
  shareToken,
}: {
  children: React.ReactNode;
  preview?: React.ReactNode;
  title: string;
  previewText: string;
  donated?: boolean;
  teamId?: string;
  shareToken?: string | null;
}) {
  const [isUnlocked, setIsUnlocked] = useState(donated);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // donated 상태가 true면 잠금 해제
    if (donated) {
      setIsUnlocked(true);
    }
  }, [donated]);

  const handleLockClick = () => {
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
        setIsUnlocked(true);
        // 페이지 새로고침하여 최신 donated 상태 반영
        window.location.reload();
      }
    } catch (error) {
      console.error("Donation error:", error);
    }
  };

  const handleSkip = () => {
    // "무료로 바로 볼게요" - 현재 페이지에서만 잠금 해제 (새로고침 시 다시 잠김)
    setShowModal(false);
    setIsUnlocked(true);
  };

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
              <div className="text-5xl mb-4">💛</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">전체 분석 보기</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">
                  <strong>✨ 모든 분석은 무료입니다!</strong>
                  <br />
                  <span className="text-xs text-blue-700">
                    "무료로 바로 볼게요"를 누르시면 바로 확인하실 수 있어요.
                    <br />
                    후원은 선택사항이며, 서비스 개선에 큰 힘이 됩니다.
                  </span>
                </p>
              </div>
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
                <p className="text-xs text-slate-600">QR코드를 스캔하거나 링크를 눌러 간편하고 안전하게 보내실 수 있습니다</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleDonate}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✓</span>
                <span>990원 후원 완료했어요</span>
              </button>

              <button
                onClick={handleSkip}
                className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                무료로 바로 볼게요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
