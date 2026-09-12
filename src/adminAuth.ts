import { clerk, loadClerk } from "./clerkClient";

const allowedEmails = [
  "kerstin.herrloff@gmail.com",
  "niklas.herrloff@gmail.com",
];


export async function initializeAdminAuth() {
  await loadClerk();
}


export function isSignedIn() {
  return clerk.isSignedIn;
}


export function getCurrentEmail() {
  return (
    clerk.user
      ?.primaryEmailAddress
      ?.emailAddress ?? null
  );
}


export function isAllowedAdmin() {
  const email =
    getCurrentEmail();

  if (!email) {
    return false;
  }

  return allowedEmails.includes(
    email.toLowerCase()
  );
}


export function showSignIn(
  container: HTMLDivElement
) {
  clerk.mountSignIn(container);
}


export async function signOut() {
  await clerk.signOut();
}