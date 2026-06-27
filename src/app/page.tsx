import { redirect } from "next/navigation";

export default function Home() {
  // Middleware handles the redirect, but this is a fallback
  redirect("/login");
}
