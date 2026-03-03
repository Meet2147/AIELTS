import { requireUser } from "@/lib/auth";
import { SpeakingPractice } from "@/lib/components/speaking-practice";

export default async function IELTSSpeakingPage() {
  await requireUser();
  return <SpeakingPractice />;
}
