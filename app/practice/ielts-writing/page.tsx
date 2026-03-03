import { requireUser } from "@/lib/auth";
import { WritingPractice } from "@/lib/components/writing-practice";

const prompts = [
  {
    id: "i1",
    title: "Technology in education",
    prompt:
      "Some people think technology improves education, while others believe it creates distractions. Discuss both views and give your opinion."
  },
  {
    id: "i2",
    title: "Public transport",
    prompt:
      "In many cities, traffic congestion is getting worse. What are the main causes, and what measures can governments take to solve this problem?"
  }
];

export default async function IELTSWritingPage() {
  await requireUser();
  return <WritingPractice exam="ielts" section="Writing Task 2" prompts={prompts} />;
}
