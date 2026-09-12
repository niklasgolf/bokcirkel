import { Clerk } from "@clerk/clerk-js";
import { convex } from "./convexClient";

declare global {
  interface Window {
    __internal_ClerkUICtor: any;
  }
}

const publishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY saknas"
  );
}

const clerkDomain =
  atob(
    publishableKey.split("_")[2]
  ).slice(0, -1);

export const clerk =
  new Clerk(publishableKey);

let clerkLoaded = false;

export async function loadClerk() {
  if (clerkLoaded) {
    return;
  }

  await new Promise<void>(
    (resolve, reject) => {
      const existingScript =
        document.querySelector(
          'script[data-clerk-ui="true"]'
        );

      if (existingScript) {
        resolve();
        return;
      }

      const script =
        document.createElement(
          "script"
        );

      script.src =
        `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;

      script.async = true;

      script.crossOrigin =
        "anonymous";

      script.dataset.clerkUi =
        "true";

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            "Kunde inte ladda Clerk UI"
          )
        );
      };

      document.head.appendChild(
        script
      );
    }
  );

  await clerk.load({
    ui: {
      ClerkUI:
        window.__internal_ClerkUICtor,
    },
  });

  convex.setAuth(async () => {
    return await clerk.session?.getToken() ?? null;
  });

  clerkLoaded = true;
}