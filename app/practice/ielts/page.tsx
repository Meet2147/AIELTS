import Link from "next/link";
import { requireUser } from "@/lib/auth";

export default async function IELTSHubPage() {
  await requireUser();

  return (
    <div className="grid" style={{ gap: "1rem" }}>
      <section className="card">
        <h1 style={{ marginTop: 0 }}>IELTS Practice Suite</h1>
        <p className="muted">Pick a module to continue your IELTS prep.</p>
        <div className="grid cols-3">
          <Link className="card" href="/practice/ielts-writing">
            <h3 style={{ marginTop: 0 }}>Writing</h3>
            <p className="muted">Task 2 essay prompts with AI rubric feedback.</p>
          </Link>
          <Link className="card" href="/practice/ielts-listening">
            <h3 style={{ marginTop: 0 }}>Listening</h3>
            <p className="muted">Listen to streamed prompt and answer MCQs.</p>
          </Link>
          <Link className="card" href="/practice/ielts-speaking">
            <h3 style={{ marginTop: 0 }}>Speaking</h3>
            <p className="muted">Live video/audio stream + AI speaking evaluation.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
