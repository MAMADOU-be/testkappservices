const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface NotifyUserParams {
  email: string;
  event: string;
  user_name: string;
  details: string;
}

interface NotifyStaffParams {
  type: "service_request" | "contact_message" | "job_application" | "new_user" | "profile_updated" | "role_changed" | "status_changed";
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  details?: string;
}

/** Fire-and-forget email to a specific user */
export function notifyUser(params: NotifyUserParams) {
  fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ template: "user_notification", data: params }),
  }).catch((e) => console.warn("User notification email failed:", e));
}

/** Fire-and-forget email to staff */
export function notifyStaff(params: NotifyStaffParams) {
  fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ template: "staff_notification", data: params }),
  }).catch((e) => console.warn("Staff notification email failed:", e));
}
