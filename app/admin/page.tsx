"use client";

import { useEffect, useState } from "react";
import SubmissionCard, {
  SubmissionItem,
} from "../components/admin/SubmissionCard";
import {
  SubmissionData,
  subscribeToSubmissions,
  updateSubmissionStatus,
} from "../components/lib/submission";
import FeedbackModal from "../components/admin/FeedbackModal";

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [rejectingItem, setRejectingItem] = useState<SubmissionItem | null>(
    null,
  );

  useEffect(() => {
    const unsubscribe = subscribeToSubmissions(
      (items: SubmissionData[]) => {
        const mapped: SubmissionItem[] = items.map((item) => ({
          id: item.id,
          userName: item.userName,
          userEmail: item.userEmail,
          hintIndex: item.hintIndex,
          missionTitle: item.missionTitle,
          textContent: item.textContent,
          imageUrl: item.imageUrl,
          imageUrls: item.imageUrls,
          status: item.status,
          submittedAt: item.submittedAt || "Recently",
        }));
        setSubmissions(mapped);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to submissions:", error);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);
  const handleApprove = async (id: string) => {
    try {
      await updateSubmissionStatus(id, "approved");
    } catch (err) {
      console.error("Error approving submission:", err);
      alert("Failed to approve submission. Check Firestore permissions.");
    }
  };

  const handleOpenReject = (item: SubmissionItem) => {
    setRejectingItem(item);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingItem) return;
    try {
      await updateSubmissionStatus(
        rejectingItem.id,
        "rejected",
        reason || "Invalid mission proof",
      );
      setRejectingItem(null);
    } catch (err) {
      console.error("Error rejecting submission:", err);
      alert("Failed to reject submission. Check Firestore permissions.");
    }
  };

  const filteredSubmissions = submissions.filter((item) =>
    filter === "all" ? true : item.status === filter,
  );

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Submissions Moderation
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Evaluate mission proofs and unlock buddy clues for participants.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
          {(["pending", "approved", "rejected", "all"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                filter === tab
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Submissions Grid */}
      {loading ? (
        <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-400 text-sm animate-pulse">
            Loading mission submissions from Firestore...
          </p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-800">
          <p className="text-zinc-500 text-sm">
            No {filter} submissions found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubmissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              onApprove={handleApprove}
              onReject={handleOpenReject}
            />
          ))}
        </div>
      )}

      {/* Rejection Feedback Modal */}
      <FeedbackModal
        isOpen={Boolean(rejectingItem)}
        userName={rejectingItem?.userName}
        hintIndex={rejectingItem?.hintIndex}
        onClose={() => setRejectingItem(null)}
        onSubmit={handleConfirmReject}
      />
    </div>
  );
}
