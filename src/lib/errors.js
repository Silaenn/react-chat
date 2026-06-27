const firebaseErrorMap = {
  "auth/user-not-found": "No account found with this email address.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/network-request-failed": "Network error. Please check your connection.",
};

export const getFirebaseErrorMessage = (code) => {
  return firebaseErrorMap[code] || "Something went wrong. Please try again.";
};
