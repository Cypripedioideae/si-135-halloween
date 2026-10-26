"use client";

import { useEffect, useState } from "react";
import HintCard from "./HintCard";
import MissionModal from "./MissionModal";
import NoticeModal from "./NoticeModal";
import { useAuth } from "../auth/AuthContext";
import {
  subscribeToUserSubmissions,
  getUserProfile,
  dismissFailureNotification,
  SubmissionData,
  FailureNotification,
} from "../lib/submission";

export interface Hint {
  id: number;
  title: string;
  status: "unlocked" | "active" | "pending" | "locked";
  hintText?: string;
  missionPoem?: string;
  missionTitle?: string;
  missionDescription?: string;
  imageCap?: number;
}

// Static mission definitions
const BASE_MISSIONS: Omit<Hint, "status" | "hintText">[] = [
  {
    id: 1,
    title: "Initial Clue",
    imageCap: 0,
  },
  {
    id: 2,
    title: "Mission 2",
    missionTitle: "🩸 Bloody Mary 🩸",
    missionPoem:
      "I'm thirsty, darling, can't you see?\nI need some blood, bring it to me.\nFind something red, that's your quest.\nSend me its pictures, and I'll do the rest.",
    missionDescription:
      'Find 6 things that are "RED" (like a drop of blood) and send them to me.',
    imageCap: 6,
  },
  {
    id: 3,
    title: "Mission 3",
    missionTitle: "👶 Ghost Child 👶",
    missionPoem:
      "I'm all alone, won't you come play?\nI've been waiting here all day.\nFind a friend and bring them too.\nPlay with me, and I'll give you the clue.",
    missionDescription:
      "Take a photo with 6 (or more) friends in one frame and send it to me",
    imageCap: 1,
  },
  {
    id: 4,
    title: "Mission 4",
    missionTitle: "👻 Casper the Ghost 👻",
    missionPoem:
      "I'm Casper the ghost, so friendly and sweet.\nTell me your favorite ghost, and our deal is complete!\n Share the one you love the most with me,\nand I'll reveal a secret for you to see!",
    missionDescription:
      "Tell me your favorite ghost, monster, or horror character and the name of the movie they're from.",
    imageCap: 0,
  },
  {
    id: 5,
    title: "Final Reveal",
    missionTitle: "🧟 Frankenstein 🧟",
    missionPoem:
      "I've tried and failed through experiments galore.\nCreating new things and always wanting more.\nBut tell me, my friends, which event did you love the best.\nShare your favorites, and I'll reveal the clue to put you to the test!",
    missionDescription:
      "Name one (or more) SISC event you've enjoyed the most and write any messages or suggestions to SISC.",
    imageCap: 0,
  },
];

export default function HintGrid() {
  const { user } = useAuth();
  const [buddyHints, setBuddyHints] = useState<{ [key: number]: string }>({});
  const [userSubmissions, setUserSubmissions] = useState<SubmissionData[]>([]);
  const [selectedHint, setSelectedHint] = useState<Hint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [failureNotifs, setFailureNotifs] = useState<FailureNotification[]>([]);

  // 1. Fetch user's profile and buddy hints from user_profiles collection
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    async function loadBuddyProfile() {
      try {
        const myProfile = await getUserProfile(user!.uid);
        if (myProfile?.assignedBuddyId) {
          const buddyProfile = await getUserProfile(myProfile.assignedBuddyId);
          if (isMounted && buddyProfile?.hints) {
            setBuddyHints(buddyProfile.hints);
          }
        }
      } catch (err) {
        console.error("Failed to load buddy hints:", err);
      }
    }

    loadBuddyProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // 2. Realtime listener for user submissions to derive hint progression & rejection notifications
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserSubmissions(user.uid, (subs) => {
      setUserSubmissions(subs);

      // Collect un-dismissed rejected submissions for the notice popup
      const unacknowledgedRejections: FailureNotification[] = subs
        .filter((s) => s.status === "rejected" && !s.dismissed)
        .map((s) => ({
          id: s.id,
          userEmail: s.userEmail,
          failedMissionTitle: s.missionTitle,
          failedMissionNumber: s.hintIndex,
          feedback: s.feedback,
        }));

      setFailureNotifs(unacknowledgedRejections);
    });

    return () => unsubscribe();
  }, [user]);

  // 3. Compute dynamic hints status based on submissions & buddyHints
  const hints: Hint[] = BASE_MISSIONS.map((baseHint, index) => {
    const hintNum = baseHint.id;
    const clueText = buddyHints[hintNum] || `Hint ${hintNum} will be revealed once approved.`;

    // Hint 1 is always unlocked initially
    if (hintNum === 1) {
      return {
        ...baseHint,
        status: "unlocked",
        hintText: buddyHints[1] || "Waiting for your secret buddy's clues to be assigned.",
      };
    }

    // Find all submissions for this hint, sorted newest first
    const missionSubs = userSubmissions.filter((s) => s.hintIndex === hintNum);
    const hasApproved = missionSubs.some((s) => s.status === "approved");
    const hasPending = missionSubs.some((s) => s.status === "pending");

    // Check if the previous hint is unlocked (approved or hint 1)
    const prevHintNum = hintNum - 1;
    const isPrevUnlocked =
      prevHintNum === 1 ||
      userSubmissions.some(
        (s) => s.hintIndex === prevHintNum && s.status === "approved",
      );

    let status: "unlocked" | "active" | "pending" | "locked" = "locked";

    if (hasApproved) {
      status = "unlocked";
    } else if (hasPending) {
      status = "pending";
    } else if (isPrevUnlocked) {
      status = "active";
    } else {
      status = "locked";
    }

    return {
      ...baseHint,
      status,
      hintText: status === "unlocked" ? clueText : undefined,
    };
  });

  const handleOpenMission = (hint: Hint) => {
    setSelectedHint(hint);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHint(null);
  };

  const handleDismissNotification = async (id: string) => {
    try {
      await dismissFailureNotification(id);
      setFailureNotifs((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to dismiss notification:", err);
    }
  };

  const handleDismissAllNotifications = async () => {
    const ids = failureNotifs.map((n) => n.id);
    setFailureNotifs([]);
    for (const id of ids) {
      try {
        await dismissFailureNotification(id);
      } catch (err) {
        console.error("Failed to dismiss notification:", err);
      }
    }
  };

  return (
    <>
      {/* Rejection Notice Modal */}
      <NoticeModal
        notifications={failureNotifs}
        onDismiss={handleDismissNotification}
        onDismissAll={handleDismissAllNotifications}
      />

      {/* Grid of Missions / Hints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hints.map((hint) => (
          <HintCard
            key={hint.id}
            hint={hint}
            onOpenMission={handleOpenMission}
          />
        ))}
      </div>

      {/* Mission Submission Modal */}
      <MissionModal
        hint={selectedHint}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}
