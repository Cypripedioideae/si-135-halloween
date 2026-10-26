"use client";

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { submitMissionProof } from "../lib/submission";

interface Hint {
  id: number;
  title: string;
  status: "unlocked" | "active" | "pending" | "locked";
  hintText?: string;
  missionPoem?: string;
  missionTitle?: string;
  missionDescription?: string;
  imageCap?: number;
}

interface MissionModalProps {
  hint: Hint | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MissionModal({
  hint,
  isOpen,
  onClose,
}: MissionModalProps) {
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user, loading } = useAuth();

  if (!isOpen || !hint) return null;

  const imageCap = hint.imageCap !== undefined ? hint.imageCap : 1;
  const isImageUploadAllowed = imageCap > 0;
  const isPending = hint.status === "pending";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incomingFiles = Array.from(e.target.files);

    if (imageCap === 1) {
      if (incomingFiles.length > 0) {
        setSelectedFiles([incomingFiles[0]]);
      }
    } else {
      setSelectedFiles((prev) => {
        const combined = [...prev, ...incomingFiles];
        if (combined.length > imageCap) {
          alert(`You can only upload up to ${imageCap} images for this mission.`);
          return combined.slice(0, imageCap);
        }
        return combined;
      });
    }

    // Reset input value so selecting the same file again triggers change
    e.target.value = "";
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  async function handleSubmit() {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    if (!hint) return;

    // Check if at least text or image is provided
    if (selectedFiles.length === 0 && !submissionText.trim()) {
      alert(
        isImageUploadAllowed
          ? "Please provide an answer/note or upload image proof."
          : "Please provide an answer/note before submitting.",
      );
      return;
    }

    try {
      setUploading(true);
      await submitMissionProof({
        user,
        hintIndex: hint.id,
        missionTitle: hint.missionTitle || hint.title,
        textContent: submissionText,
        imageFiles: selectedFiles,
      });

      alert(
        "Mission proof submitted successfully! The admin console will review it.",
      );
      setSelectedFiles([]);
      setSubmissionText("");
      onClose();
    } catch (err: unknown) {
      console.error("Submission error:", err);
      alert(
        err instanceof Error ? err.message : "Failed to submit mission proof.",
      );
    } finally {
      setUploading(false);
    }
  }

  const handleClose = () => {
    setSelectedFiles([]);
    setSubmissionText("");
    onClose();
  };

  // Determine submit disabled condition
  const hasContent = submissionText.trim().length > 0 || selectedFiles.length > 0;
  const isSubmitDisabled = loading || !user || uploading || !hasContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-orange-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/40">
          <div>
            <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
              Mission for Hint #{hint.id}
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              {hint.missionTitle || "Mystery Objective"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Mission Details */}
          <div className="flex justify-center p-4 rounded-xl bg-orange-950/20 border border-orange-500/30">
            <p className="font-serif text-lg italic leading-loose text-zinc-100 whitespace-pre-line text-center">
              {hint.missionPoem || "Mission Description Missing"}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/30">
            <h4 className="text-sm font-semibold text-orange-300 mb-1">
              📜 Your Task:
            </h4>
            <p className="text-sm text-zinc-200 leading-relaxed">
              {hint.missionDescription || "Mission Description Missing"}
            </p>
          </div>

          {isPending ? (
            <div className="p-4 bg-purple-950/30 border border-purple-500/40 rounded-xl text-center">
              <span className="text-2xl mb-1 block">⏳</span>
              <p className="text-sm font-medium text-purple-200">
                You have already submitted this mission.
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Admin is evaluating your proof. You will be notified once it is
                approved or rejected!
              </p>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* Text Area */}
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1.5">
                  Answer / Notes
                </label>
                <textarea
                  rows={3}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Type your answer, riddle clue, or mission notes..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* File Upload Box (Hidden if imageCap === 0) */}
              {isImageUploadAllowed && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-zinc-400">
                      Proof Photo{imageCap > 1 ? "s" : ""} (Max {imageCap})
                    </label>
                    <span className="text-xs text-zinc-500 font-medium">
                      {selectedFiles.length}/{imageCap} selected
                    </span>
                  </div>

                  {/* Upload Trigger Area */}
                  {selectedFiles.length < imageCap && (
                    <div className="border-2 border-dashed border-zinc-700 hover:border-orange-500/60 transition rounded-xl p-5 text-center bg-zinc-900/50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        id="file-upload"
                        multiple={imageCap > 1}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer block">
                        <span className="text-3xl block mb-2">📸</span>
                        <p className="text-sm font-medium text-zinc-200">
                          {selectedFiles.length === 0
                            ? imageCap > 1
                              ? `Click to upload up to ${imageCap} images`
                              : "Click to upload an image"
                            : `Add more photos (up to ${imageCap})`}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          PNG, JPG, or WEBP up to 10MB each (auto-compressed)
                        </p>
                      </label>
                    </div>
                  )}

                  {/* Thumbnail Previews List */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        {selectedFiles.map((file, idx) => {
                          const previewUrl = URL.createObjectURL(file);
                          return (
                            <div
                              key={`${file.name}-${idx}`}
                              className="relative group rounded-lg overflow-hidden border border-zinc-700 aspect-square bg-zinc-900"
                            >
                              <img
                                src={previewUrl}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                onLoad={() => URL.revokeObjectURL(previewUrl)}
                              />
                              <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs transition cursor-pointer"
                                title="Remove image"
                              >
                                ✕
                              </button>
                              <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 truncate text-[10px] text-zinc-300">
                                {file.name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          {!isPending && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="px-5 py-2 text-sm font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition shadow-lg shadow-orange-600/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
