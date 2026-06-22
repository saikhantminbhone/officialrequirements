import { redirect } from "next/navigation";

// Canonicalized: the Germany hub now lives at /study/de (one hub system for all
// destinations). Redirect preserves any old links/backlinks.
export default function GermanyStudyRedirect() {
  redirect("/study/de");
}
