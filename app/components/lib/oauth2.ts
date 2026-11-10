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
    if (error?.code === "auth/popup-blocked") {
      alert(
        "Popup was blocked by your browser. Please allow popups for this site to sign in.",
      );
      // await signInWithRedirect(auth, provider);
      // return;
    }
    if (error?.code === "auth/popup-closed-by-user") {
      alert("Please refresh the page and retry the sign in process.");
    }
    throw error;
  }
}

export async function signOutUser() {
  await signOut(auth);
}
