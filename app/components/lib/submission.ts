import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  type Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./firebase";
import { uploadImage, uploadImages } from "./storage";

export interface SubmissionData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  hintIndex: number;
  missionTitle: string;
  textContent?: string;
  imageUrl?: string;
  imageUrls?: string[];
  storagePath?: string;
  storagePaths?: string[];
  status: "pending" | "approved" | "rejected";
  feedback?: string;
  dismissed?: boolean;
  createdAt?: Timestamp | null;
  submittedAt?: string;
}

export interface UserProfile {
  userEmail?: string;
  displayName?: string;
  assignedBuddyEmail?: string; // Can be username handle or full email
  assignedBuddyId?: string; // backwards compatibility
  hints?: {
    [key: number]: string;
  };
}

export interface FailureNotification {
  id: string;
  userEmail: string;
  failedMissionTitle: string;
  failedMissionNumber: number;
  feedback?: string;
}

export async function submitMissionProof({
  user,
  hintIndex,
  missionTitle,
  textContent,
  imageFile,
  imageFiles,
}: {
  user: User;
  hintIndex: number;
  missionTitle: string;
  textContent: string;
  imageFile?: File | null;
  imageFiles?: File[];
}) {
  const filesToUpload: File[] = [];
  if (imageFiles && imageFiles.length > 0) {
    filesToUpload.push(...imageFiles);
  } else if (imageFile) {
    filesToUpload.push(imageFile);
  }

  let imageUrls: string[] = [];
  let storagePaths: string[] = [];

  // 1. Upload images to firebase storage
  if (filesToUpload.length > 0) {
    const uploadResults = await uploadImages(filesToUpload, user.uid);
    imageUrls = uploadResults.map((r) => r.url);
    storagePaths = uploadResults.map((r) => r.path);
  }

  // 2. Submit into Firestore
  const submissionsRef = collection(db, "submissions");
  const docRef = await addDoc(submissionsRef, {
    userId: user.uid,
    userName:
      user.displayName || user.email?.split("@")[0] || `Participant${user.uid}`,
    userEmail: (user.email || "").toLowerCase(),
    hintIndex,
    missionTitle,
    textContent: textContent.trim(),
    imageUrl: imageUrls[0] || null,
    imageUrls: imageUrls.length > 0 ? imageUrls : null,
    storagePath: storagePaths[0] || null,
    storagePaths: storagePaths.length > 0 ? storagePaths : null,
    status: "pending",
    dismissed: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export function subscribeToSubmissions(
  callback: (submissions: SubmissionData[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(collection(db, "submissions"), orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SubmissionData[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        let formattedDate = "Just now";

        if (data.createdAt?.toDate) {
          formattedDate = data.createdAt.toDate().toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          });
        }

        const urls: string[] = Array.isArray(data.imageUrls)
          ? data.imageUrls
          : data.imageUrl
            ? [data.imageUrl]
            : [];

        return {
          id: docSnap.id,
          userId: data.userId,
          userName: data.userName || "Participant",
          userEmail: data.userEmail || "",
          hintIndex: data.hintIndex || 1,
          missionTitle: data.missionTitle || "",
          textContent: data.textContent || "",
          imageUrl: urls[0] || undefined,
          imageUrls: urls,
          storagePath: data.storagePath || undefined,
          storagePaths: Array.isArray(data.storagePaths) ? data.storagePaths : [],
          status: data.status || "pending",
          feedback: data.feedback || "",
          dismissed: data.dismissed ?? false,
          createdAt: data.createdAt,
          submittedAt: formattedDate,
        };
      });

      callback(items);
    },
    (error) => {
      console.error("Error listening to submissions:", error);
      if (onError) onError(error);
    },
  );
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: "approved" | "rejected",
  feedback?: string,
) {
  const docRef = doc(db, "submissions", submissionId);
  await updateDoc(docRef, {
    status,
    ...(feedback !== undefined ? { feedback } : {}),
    reviewedAt: serverTimestamp(),
    ...(status === "rejected" ? { dismissed: false } : {}),
  });
}

/**
 * Listen to all submissions created by the current user to drive dynamic hint state
 */
export function subscribeToUserSubmissions(
  userId: string,
  callback: (submissions: SubmissionData[]) => void,
  onError?: (error: Error) => void,
) {
  const q = query(
    collection(db, "submissions"),
    where("userId", "==", userId),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: SubmissionData[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          userName: data.userName || "Participant",
          userEmail: data.userEmail || "",
          hintIndex: data.hintIndex || 1,
          missionTitle: data.missionTitle || "",
          textContent: data.textContent || "",
          status: data.status || "pending",
          feedback: data.feedback || "",
          dismissed: data.dismissed ?? false,
          createdAt: data.createdAt,
        };
      });
      callback(items);
    },
    (error) => {
      console.error("Error listening to user submissions:", error);
      if (onError) onError(error);
    },
  );
}

/**
 * Mark a rejected submission as dismissed so it doesn't notify again
 */
export async function dismissFailureNotification(submissionId: string) {
  const docRef = doc(db, "submissions", submissionId);
  await updateDoc(docRef, {
    dismissed: true,
  });
}

/**
 * Extracts username handle if email is passed (e.g. "john.doe@domain.com" -> "john.doe")
 */
export function getProfileHandle(identifier: string): string {
  const clean = identifier.trim().toLowerCase();
  return clean.includes("@") ? clean.split("@")[0] : clean;
}

/**
 * Fetch a user profile by handle or email (falls back to exact ID if handle is not found)
 */
export async function getUserProfile(identifier: string): Promise<UserProfile | null> {
  const handle = getProfileHandle(identifier);
  
  // Try handle first (e.g. "user1")
  let docRef = doc(db, "user_profiles", handle);
  let snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // Fallback to exact raw identifier (e.g. full email or UID)
  const rawId = identifier.trim().toLowerCase();
  if (rawId !== handle) {
    docRef = doc(db, "user_profiles", rawId);
    snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
  }

  return null;
}
