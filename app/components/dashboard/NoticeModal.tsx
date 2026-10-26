"use client";

import { FailureNotification } from "../lib/submission";

interface NoticeModalProps {
  notifications: FailureNotification[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
}

export default function NoticeModal({
  notifications,
  onDismiss,
  onDismissAll,
}: NoticeModalProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-zinc-950 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-red-950/30 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-base font-bold text-red-200">Notice</h3>
            <p className="text-xs text-red-300/80">Submission Update</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Some of your submissions were declined by the admin! Please resubmit the mission listed below:
          </p>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-zinc-900/80 border border-red-500/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    {item.failedMissionTitle}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono font-medium border border-red-500/30">
                    Hint #{item.failedMissionNumber}
                  </span>
                </div>

                {item.feedback ? (
                  <div className="text-xs text-zinc-300 bg-black/40 p-2.5 rounded-lg border border-zinc-800">
                    <span className="text-red-400 font-semibold block mb-0.5">Admin Note:</span>
                    {item.feedback}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic">No specific feedback note provided.</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex justify-end">
          <button
            onClick={onDismissAll}
            className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition shadow-lg shadow-red-600/30 cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
