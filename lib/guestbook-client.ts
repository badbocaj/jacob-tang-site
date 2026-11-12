import type { SubmitState } from "./guestbook-submit";

/* Browser-safe guestbook helpers: no server-only imports, so the form can use them. */

export const COMMS_DOWN_MESSAGE = "Comms down, try again in a minute.";

/**
 * Runs the submit server action, turning a failed request (network blip, timeout, a
 * redeploy while the tab was open) into the normal comms-down error, so the page
 * doesn't crash and the visitor's draft stays in the form.
 */
export async function settleSubmit(run: () => Promise<SubmitState>): Promise<SubmitState> {
  try {
    return await run();
  } catch (err) {
    console.error("[guestbook] submit request failed", err);
    return { status: "error", message: COMMS_DOWN_MESSAGE };
  }
}
