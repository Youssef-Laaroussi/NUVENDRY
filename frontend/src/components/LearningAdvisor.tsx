import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Bot, CalendarDays, Code, Network, MessageSquare, RotateCw, Send, Sparkles, X } from 'lucide-react';
import { api } from '../api/client';
import type { AdvisorTurn } from '../types';

const suggestions = [
  { label: 'Python workshops', question: 'Which available workshops teach Python?', icon: Code },
  { label: 'Learn about LLMs', question: 'Find a beginner workshop on large language models.', icon: Sparkles },
  { label: 'Upcoming workshops', question: 'Show available workshops', icon: CalendarDays },
  { label: 'LangGraph workshops', question: 'Find available LangGraph workshops.', icon: Network },
];

function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-gray-100 px-1">{part.slice(1, -1)}</code>;
    return part;
  })}</>;
}

function AdvisorAnswer({ text }: { text: string }) {
  return <div className="space-y-2 leading-relaxed break-words">
    {text.trim().split(/\n{2,}/).map((block, index) => {
      const lines = block.split('\n');
      if (lines.every(line => /^[-*]\s+/.test(line))) {
        return <ul key={index} className="list-disc space-y-1 pl-5">{lines.map((line, item) => (
          <li key={item}><InlineText text={line.replace(/^[-*]\s+/, '')}/></li>
        ))}</ul>;
      }
      return <p key={index} className="whitespace-pre-line"><InlineText text={block.replace(/^#{1,6}\s+/gm, '')}/></p>;
    })}
  </div>;
}

export function LearningAdvisor({ embedded = false, iconOnly = false }: { embedded?: boolean; iconOnly?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [turns, setTurns] = useState<AdvisorTurn[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const history = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (history.current) history.current.scrollTop = history.current.scrollHeight;
  }, [turns, embedded, sending]);

  async function loadHistory() {
    setLoading(true);
    setError('');
    try {
      setTurns(await api.getAdvisorHistory());
    } catch {
      setError('Unable to load the conversation.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (embedded) void loadHistory();
  }, [embedded]);

  function open() {
    dialog.current?.showModal();
    if (!sending && !resetting) void loadHistory();
  }

  async function resetConversation() {
    if (loading || sending || resetting) return;
    setResetting(true);
    setError('');
    try {
      await api.resetAdvisorHistory();
      setTurns([]);
      setQuestion('');
    } catch {
      setError('Unable to reset the conversation.');
    } finally {
      setResetting(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(question);
  }

  async function send(message: string) {
    const text = message.trim();
    if (!text || sending || loading || resetting) return;
    setQuestion(text);
    setSending(true);
    setError('');
    try {
      const turn = await api.askAdvisor(text);
      setTurns(history => [...history, turn]);
      setQuestion('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send your question.');
    } finally {
      setSending(false);
    }
  }

  const conversation = <>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#DCE9E0] bg-[#F4FAF5] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#9DCBB0] bg-[#DFF1E4] text-[#0E6636]">
            <Bot size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 id="advisor-heading" className="text-[13px] font-bold text-[#14211B]">NUVENDRY Learning Advisor</h2>
            <p className="mt-0.5 text-[11px] text-[#356B4A]">Workshop and learning assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" title="Reset conversation" aria-label="Reset conversation"
            disabled={loading || sending || resetting} onClick={() => void resetConversation()}
            className="rounded-full p-2 text-[#37604A] hover:bg-[#E1F1E6] disabled:opacity-40">
            <RotateCw size={17} />
          </button>
          {!embedded && <button type="button" title="Close advisor" aria-label="Close advisor"
            onClick={() => dialog.current?.close()} className="rounded-full p-2 text-[#37604A] hover:bg-[#E1F1E6]">
            <X size={18} />
          </button>}
        </div>
      </header>
      <div ref={history} role="log" aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-xs">
        {loading && <p role="status">Loading your conversation…</p>}
        {!loading && !sending && !turns.length && (
          <div className="flex min-h-full flex-col items-center justify-center gap-3 py-4 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#E5F4E9] text-[#0E6636]">
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-2 font-serif text-xl font-bold text-[#0E6636]">Welcome to NUVENDRY!</h3>
            <p className="max-w-[16rem] text-xs leading-relaxed text-[#526359]">Ask me to find workshops, compare options, or suggest what to learn next.</p>
            <div className="flex max-w-[17rem] flex-wrap justify-center gap-1.5">
              {suggestions.map(({ label, question, icon: Icon }) => (
                <button key={label} type="button" disabled={resetting} onClick={() => void send(question)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#CDE5D4] bg-[#F1F8F3] px-2.5 py-1.5 text-[11px] font-semibold text-[#0E6636] hover:bg-[#DFF1E4]">
                  <Icon size={14} aria-hidden="true" />{label}
                </button>
              ))}
            </div>
          </div>
        )}
        {turns.map(turn => <article key={turn.id} className="flex flex-col gap-3">
          <div className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-[#EBF9EA] px-4 py-2.5">
            <span className="sr-only">You</span>
            <p className="whitespace-pre-wrap break-words">{turn.question}</p>
          </div>
          <div className="w-full rounded-2xl rounded-tl-md border border-[#E5E7E0] bg-white px-4 py-3">
            <p className="mb-2 text-xs font-semibold text-[#0E6636]">{turn.mode === 'model' ? 'AI Advisor' : 'Catalog search'}</p>
            <AdvisorAnswer text={turn.answer}/>
            {!!turn.sources.length && (
              <ul className="mt-3 space-y-1.5" aria-label="Matching workshops">
                {turn.sources.map(source => (
                  <li key={source.id}>
                    <Link to={`/workshops/${source.id}`} onClick={() => dialog.current?.close()}
                      className="group flex items-center gap-2.5 rounded-xl border border-[#DCE9E0] bg-[#F5FAF6] px-2.5 py-2 text-[#184C34] transition-colors hover:border-[#9DCBB0] hover:bg-[#EAF6EC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0E6636]">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#E1F1E6] text-[#0E6636]">
                        <BookOpen size={14} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 break-words text-xs font-semibold leading-snug">{source.title}</span>
                      <ArrowRight size={14} aria-hidden="true" className="shrink-0 text-[#0E6636] transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>)}
        {sending && <div className="flex flex-col gap-2">
          <p className="max-w-[85%] self-end whitespace-pre-wrap break-words rounded-2xl bg-[#EBF9EA] px-4 py-2.5">{question.trim()}</p>
          <p role="status" className="px-3 text-gray-600">Checking your request…</p>
        </div>}
      </div>
      <footer className="shrink-0 border-t border-[#DCE9E0] bg-[#F4FAF5] p-2.5">
        {error && <p role="alert" className="mb-2 px-2 text-xs text-red-700">{error}</p>}
        <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border border-[#B6D6C0] bg-white p-1.5 focus-within:ring-2 focus-within:ring-[#B6D6C0]">
          <label htmlFor="advisor-question" className="sr-only">Your question</label>
          <textarea ref={composer} id="advisor-question" maxLength={1200} placeholder="Ask about a skill or workshop…"
            rows={1} value={question} disabled={sending || resetting} onChange={event => setQuestion(event.target.value)}
            className="min-h-9 min-w-0 flex-1 resize-none rounded-xl px-2.5 py-2 text-xs focus:outline-none" />
          <button type="submit" title="Send question" aria-label="Send question" disabled={loading || sending || resetting || !question.trim()}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0E6636] text-white hover:bg-[#094D29] disabled:opacity-40">
            <Send size={17} aria-hidden="true" />
          </button>
        </form>
      </footer>
  </>;

  if (embedded) return <section aria-labelledby="advisor-heading" className="rounded-2xl border border-[#C5DFD0] bg-white p-4 shadow-sm">{conversation}</section>;

  return <>
    {iconOnly ? (
      <button type="button" onClick={open} aria-label="Open AI Learning Advisor" title="AI Learning Advisor"
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#C7A74D] to-[#E7C85B] text-[#15120A] shadow-[0_8px_26px_rgba(183,143,46,0.35)] hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#745715] sm:bottom-6 sm:right-6">
        <MessageSquare size={22} aria-hidden="true" />
        <span aria-hidden="true" className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-[#171914] bg-[#70A85C]" />
      </button>
    ) : <button type="button" onClick={open} className="w-full py-2 px-3 rounded-xl bg-white border border-[#C5DFD0] hover:border-[#0E6636] hover:bg-[#EBF9EA]/40 text-[#0E6636] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm">
      <MessageSquare className="w-3.5 h-3.5" /> Ask the AI Advisor
    </button>}
    <dialog ref={dialog} aria-labelledby="advisor-heading" className="fixed inset-auto bottom-4 right-4 m-0 h-[min(34rem,calc(100dvh_-_3rem))] w-[min(23rem,calc(100vw_-_2rem))] overflow-hidden rounded-[1.5rem] border border-[#C5DFD0] bg-white p-0 text-[#1A2621] shadow-2xl backdrop:bg-black/30 open:flex open:flex-col sm:bottom-6 sm:right-6">
      {conversation}
    </dialog>
  </>;
}
