import { requireUser } from "@/lib/auth";
import { ListeningPractice } from "@/lib/components/listening-practice";

export default async function IELTSListeningPage() {
  await requireUser();
  return <ListeningPractice />;
}
