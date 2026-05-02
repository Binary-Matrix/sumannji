import { useState } from "react";
import { sfx } from "@/lib/sfx";

const defaultQuestions = [
  { label: "Your number", placeholder: "e.g. +977 98..." },
  { label: "Your Instagram handle", placeholder: "@yourhandle" },
  { label: "Your college", placeholder: "e.g. Mid-Valley College" },
  { label: "Your message", placeholder: "Say something to Suman..." },
];

export const ContactSection = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const update = (label: string, value: string) => setForm((f) => ({ ...f, [label]: value }));

  const handleSend = () => {
    sfx.sparkle();
    setSent(true);
  };

  return (
    <section className="border-t border-border/40 px-6 py-24">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">08 · connect</p>
        <h2 className="mt-2 text-4xl font-bold sm:text-5xl">Contact Suman</h2>
        <p className="mt-3 text-muted-foreground">Have something to say? Drop a message.</p>

        {!open ? (
          <button
            onClick={() => { setOpen(true); sfx.pop(); }}
            className="mt-8 rounded-full bg-ember px-8 py-4 text-sm font-semibold text-primary-foreground shadow-ember transition hover:scale-105"
          >
            contact with suman →
          </button>
        ) : (
          <div className="mt-8 glass-strong rounded-3xl p-6 sm:p-8 text-left animate-fade-in">
            {sent ? (
              <div className="text-center py-8">
                <p className="text-2xl font-bold text-ember">Thank you!</p>
                <p className="mt-2 text-sm text-muted-foreground">Suman will get back to you soon.</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {defaultQuestions.map((q) => (
                    <div key={q.label}>
                      <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{q.label}</label>
                      <input
                        value={form[q.label] || ""}
                        onChange={(e) => update(q.label, e.target.value)}
                        placeholder={q.placeholder}
                        className="mt-1 w-full border-b border-border bg-transparent px-1 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-primary"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => { setOpen(false); sfx.click(); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >cancel</button>
                  <button
                    onClick={handleSend}
                    disabled={!form["Your message"]?.trim()}
                    className="rounded-full bg-ember px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-ember transition hover:scale-105 disabled:opacity-30"
                  >send message</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
