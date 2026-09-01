import { redirect } from "next/navigation";

/** Legacy route — onboarding + signup now live at /get-started. */
export default function SignUpPage() {
  redirect("/get-started");
}
