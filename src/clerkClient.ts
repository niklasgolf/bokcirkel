import { Clerk } from "@clerk/clerk-js";

const publishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY saknas"
  );
}

export const clerk =
  new Clerk(publishableKey);

export async function loadClerk() {
  await clerk.load();
}