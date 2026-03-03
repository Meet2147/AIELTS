import { requireUser } from "@/lib/auth";
import { WritingPractice } from "@/lib/components/writing-practice";

const prompts = [
  {
    id: "t1",
    title: "Independent writing",
    prompt:
      "Do you agree or disagree with the following statement? University students should be required to take classes outside their major. Use specific reasons and examples to support your answer."
  },
  {
    id: "t2",
    title: "Integrated-style summary",
    prompt:
      "Read and listen materials often present conflicting views. Summarize the points made in the lecture and explain how they challenge the reading passage's claims about remote work productivity."
  }
];

export default async function TOEFLWritingPage() {
  await requireUser();
  return <WritingPractice exam="toefl" section="Writing" prompts={prompts} />;
}
