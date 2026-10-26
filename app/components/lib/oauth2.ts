import { auth } from "./firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";

const provider = new GoogleAuthProvider();
auth.useDeviceLanguage();

export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (
      error?.code === "auth/popup-blocked" ||
      error?.code === "auth/popup-closed-by-user"
    ) {
      await signInWithRedirect(auth, provider);
      return;
    }
    throw error;
  }
}

export async function signOutUser() {
  await signOut(auth);
}
