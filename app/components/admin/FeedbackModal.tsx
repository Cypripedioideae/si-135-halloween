"use client";

import { useState } from "react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  userName?: string;
  hintIndex?: number;
}

export default function FeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  userName,
  hintIndex,
}: FeedbackModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-zinc-950 border border-red-500/30 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-1">Reject Submission</h3>
        <p className="text-xs text-zinc-400 mb-4">
          Provide guidance for{" "}
          <span className="text-orange-300 font-semibold">{userName}</span> on
          Hint #{hintIndex} so they can retry.
        </p>

        <textarea
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. The photo is too dark/blurry, or the wrong clue was answered..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl transition hover:bg-zinc-900"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(reason);
              setReason("");
              onClose();
            }}
            className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl transition cursor-pointer"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
