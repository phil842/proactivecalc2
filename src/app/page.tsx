import { redirect } from "next/navigation";

export default function Home() {
  // Root page: always redirect to onboarding.
  // The onboarding flow saves userId to localStorage, then redirects to /home.
  redirect("/onboarding");
}
