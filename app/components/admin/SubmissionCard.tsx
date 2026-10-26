"use client";

import { useState } from "react";

export interface SubmissionItem {
  id: string;
  userName: string;
  userEmail: string;
  hintIndex: number;
  missionTitle: string;
  textContent?: string;
  imageUrl?: string;
  imageUrls?: string[];
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface SubmissionCardProps {
  submission: SubmissionItem;
  onApprove: (id: string) => void;
  onReject: (submission: SubmissionItem) => void;
}

export default function SubmissionCard({
  submission,
  onApprove,
  onReject,
}: SubmissionCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isPending = submission.status === "pending";
  const isApproved = submission.status === "approved";
  const isRejected = submission.status === "rejected";

  const images = submission.imageUrls && submission.imageUrls.length > 0
    ? submission.imageUrls
    : submission.imageUrl
      ? [submission.imageUrl]
      : [];

  return (
    <>
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h4 className="font-bold text-white text-base">
                {submission.userName}
              </h4>
              <p className="text-xs text-zinc-400">{submission.userEmail}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Hint #{submission.hintIndex}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  isApproved
                    ? "bg-emerald-500/20 text-emerald-300"
                    : isRejected
                      ? "bg-red-500/20 text-red-300"
                      : "bg-amber-500/20 text-amber-300"
                }`}
              >
                {submission.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Mission details */}
          <p className="text-xs font-semibold text-zinc-300 mb-2">
            Mission:{" "}
            <span className="text-orange-300">{submission.missionTitle}</span>
          </p>

          {/* Submission Content */}
          {submission.textContent && (
            <div className="bg-black/50 p-3 rounded-xl border border-zinc-800 mb-3 text-xs text-zinc-300 leading-relaxed">
              <span className="text-zinc-500 font-semibold block mb-0.5">
                Note:
              </span>
              {submission.textContent}
            </div>
          )}

          {/* Images Grid */}
          {images.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase">
                  Proof Images ({images.length})
                </span>
                <span className="text-[10px] text-zinc-500">
                  Click to enlarge
                </span>
              </div>

              {images.length === 1 ? (
                <div
                  onClick={() => setLightboxIndex(0)}
                  className="rounded-xl overflow-hidden border border-zinc-800 bg-black/40 cursor-pointer group"
                >
                  <img
                    src={images[0]}
                    alt="Proof"
                    className="w-full h-44 object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxIndex(idx)}
                      className="relative rounded-lg overflow-hidden border border-zinc-800 aspect-square bg-black/40 cursor-pointer group"
                    >
                      <img
                        src={url}
                        alt={`Proof ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/70 text-zinc-300 text-[10px] px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-[11px] text-zinc-500">
            Submitted: {submission.submittedAt}
          </p>
        </div>

        {/* Admin Action Bar */}
        <div className="mt-5 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
          {isPending ? (
            <>
              <button
                onClick={() => onReject(submission)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-red-300 hover:bg-red-950/40 border border-red-500/30 rounded-xl transition cursor-pointer"
              >
                ✕ Reject & Notify
              </button>
              <button
                onClick={() => onApprove(submission.id)}
                className="flex-1 py-2 px-3 text-xs font-semibold text-emerald-100 bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer shadow-md shadow-emerald-700/20"
              >
                ✓ Unlock Hint
              </button>
            </>
          ) : (
            <div className="w-full text-center text-xs text-zinc-500 py-1 font-medium">
              Reviewed ({submission.status})
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Enlarged View Modal */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute -top-10 right-0 text-zinc-400 hover:text-white p-2 text-xl font-bold transition cursor-pointer"
            >
              ✕ Close
            </button>

            {/* Main Enlarged Image */}
            <div className="w-full flex items-center justify-center rounded-2xl overflow-hidden border border-zinc-800 bg-black/60 max-h-[70vh]">
              <img
                src={images[lightboxIndex]}
                alt={`Proof ${lightboxIndex + 1}`}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>

            {/* Gallery Navigation Controls (if multiple images) */}
            {images.length > 1 && (
              <div className="mt-4 flex items-center gap-4">
                <button
                  type="button"
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : 0))}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  ◀ Previous
                </button>
                <span className="text-xs text-zinc-400 font-medium">
                  {lightboxIndex + 1} of {images.length}
                </span>
                <button
                  type="button"
                  disabled={lightboxIndex === images.length - 1}
                  onClick={() => setLightboxIndex((prev) => (prev !== null ? Math.min(images.length - 1, prev + 1) : 0))}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            )}

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto max-w-full p-1">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      lightboxIndex === idx
                        ? "border-orange-500 scale-105"
                        : "border-zinc-700 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
