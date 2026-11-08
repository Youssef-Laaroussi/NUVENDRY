import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { LearningDemand } from '../../types';
import { 
  Sparkles, Trash2, Edit2, Loader2, Plus, CheckCircle2, 
  MessageSquare, AlertCircle
} from 'lucide-react';

export const MyDemands: React.FC = () => {
  const [demands, setDemands] = useState<LearningDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Demand Form
  const [showForm, setShowForm] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit & Delete State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editBudgetUsd, setEditBudgetUsd] = useState('50.00');
  const [editDifficulty, setEditDifficulty] = useState('intermediate');
  const [editSchedule, setEditSchedule] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDemands = useCallback(async () => {
    try {
      const data = await api.getDemands({ mine_only: true });
      setDemands(data);
    } catch (err) {
      console.error('Failed to load demands', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDemands();
  }, [fetchDemands]);

  useSyncRefresh(['demands', 'clusters'], fetchDemands);

  const handleExtract = async () => {
    if (prompt.trim().length < 10 || extracting) {
      if (prompt.trim().length < 10) {
        setFeedback({ type: 'error', message: 'Please describe your learning request in at least 10 characters.' });
      }
      return;
    }
    setExtracting(true);
    setFeedback(null);
    try {
      const res = await api.extractDemand(prompt.trim());
      setExtracted(res);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'AI constraint extraction failed.' });
    } finally {
      setExtracting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 10 || submitting) {
      if (prompt.trim().length < 10) {
        setFeedback({ type: 'error', message: 'Please describe your learning request in at least 10 characters.' });
      }
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      let parsed = extracted;
      if (!parsed) {
        parsed = await api.extractDemand(prompt.trim()).catch(() => null);
      }
      await api.createDemand({
        raw_prompt: prompt.trim(),
        topic: parsed?.topic,
        related_skills: parsed?.related_skills,
        preferred_difficulty: parsed?.preferred_difficulty,
        max_budget_cents: parsed?.max_budget_cents,
        language: parsed?.language,
        preferred_schedule: parsed?.preferred_schedule,
      });
      setPrompt('');
      setExtracted(null);
      setShowForm(false);
      setFeedback({ type: 'success', message: 'Learning demand persisted and queued for AI clustering.' });
      await fetchDemands();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit demand.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    setDeletingId(id);
    setFeedback(null);
    try {
      await api.deleteDemand(id);
      setDemands((prev) => prev.filter((d) => d.id !== id));
      setConfirmDeleteId(null);
      setFeedback({ type: 'success', message: 'Learning request deleted.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete demand.' });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (savingId) return;
    const parsedUsd = Number(editBudgetUsd);
    if (!editTopic.trim() || Number.isNaN(parsedUsd) || parsedUsd <= 0) {
      setFeedback({ type: 'error', message: 'Please enter a valid topic and positive USD budget.' });
      return;
    }
    setSavingId(id);
    setFeedback(null);
    try {
      await api.updateDemand(id, {
        topic: editTopic.trim(),
        max_budget_cents: Math.round(parsedUsd * 100),
        preferred_difficulty: editDifficulty,
        preferred_schedule: editSchedule.trim() || undefined,
      });
      setEditingId(null);
      setFeedback({ type: 'success', message: 'Demand constraints updated.' });
      await fetchDemands();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update demand.' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif text-charcoal">My Learning Demands</h1>
            <p className="text-xs text-charcoal/60">
              Submit custom learning needs and track how they group into workshop opportunities.
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFeedback(null);
            }}
            className="nv-btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Submit New Demand'}</span>
          </button>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-mint/50 border-forest/20 text-forest font-medium'
            }`}
          >
            {feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-forest" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Creator Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-warmgray p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm text-charcoal">Describe What You Want to Learn</h3>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (feedback?.type === 'error') setFeedback(null);
              }}
              placeholder="e.g. Practical FastAPI + React integration with PayPal checkout for under $35."
              className="w-full p-3 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting || submitting || !prompt.trim()}
                className="nv-btn-press px-3.5 py-2 rounded-lg bg-mint text-forest font-semibold text-xs hover:bg-forest hover:text-ivory disabled:opacity-60 transition-colors flex items-center gap-1.5"
              >
                {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-gold" />}
                <span>{extracting ? 'Extracting...' : 'Preview AI Extraction'}</span>
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting || !prompt.trim()}
                className="nv-btn-press px-4 py-2 rounded-lg bg-forest text-ivory font-semibold text-xs hover:bg-charcoal disabled:opacity-60 transition-colors shadow-xs flex items-center gap-1.5"
              >
                {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{submitting ? 'Saving...' : 'Confirm & Save'}</span>
              </button>
            </div>

            {/* Extracted preview */}
            {extracted && (
              <div className="p-3.5 rounded-xl bg-mint/40 border border-forest/20 text-xs space-y-1.5">
                <span className="font-semibold text-forest">Extracted Constraints:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-charcoal/80">
                  <div>Topic: <strong>{extracted.topic}</strong></div>
                  <div>Budget: <strong>${(extracted.max_budget_cents / 100).toFixed(2)}</strong></div>
                  <div>Difficulty: <strong>{extracted.preferred_difficulty}</strong></div>
                  <div>Confidence: <strong>{Math.round(extracted.confidence_score * 100)}%</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demands List */}
        {loading ? (
          <div className="py-12 text-center text-xs text-charcoal/60">Loading your demands...</div>
        ) : demands.length > 0 ? (
          <div className="space-y-4">
            {demands.map((d) => (
              <div key={d.id} className="nv-card-lift bg-white rounded-2xl border border-warmgray p-5 space-y-3 shadow-xs">
                {editingId === d.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-charcoal/70 mb-1 block">Topic</label>
                        <input
                          type="text"
                          value={editTopic}
                          onChange={(e) => setEditTopic(e.target.value)}
                          className="w-full p-2 bg-ivory border border-warmgray rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-charcoal/70 mb-1 block">Budget (USD)</label>
                        <input
                          type="number"
                          step="0.50"
                          min="1"
                          value={editBudgetUsd}
                          onChange={(e) => setEditBudgetUsd(e.target.value)}
                          className="w-full p-2 bg-ivory border border-warmgray rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-charcoal/70 mb-1 block">Difficulty</label>
                        <select
                          value={editDifficulty}
                          onChange={(e) => setEditDifficulty(e.target.value)}
                          className="w-full p-2 bg-ivory border border-warmgray rounded-lg text-xs"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-charcoal/70 mb-1 block">Schedule</label>
                        <input
                          type="text"
                          value={editSchedule}
                          onChange={(e) => setEditSchedule(e.target.value)}
                          placeholder="e.g. Weekend"
                          className="w-full p-2 bg-ivory border border-warmgray rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={savingId === d.id}
                        onClick={() => handleSaveEdit(d.id)}
                        className="nv-btn-press px-3 py-1.5 bg-forest text-ivory text-xs font-semibold rounded-md disabled:opacity-60 flex items-center gap-1.5"
                      >
                        {savingId === d.id && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        disabled={savingId === d.id}
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-warmgray text-charcoal text-xs font-semibold rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-charcoal">{d.topic}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-mint text-forest font-semibold uppercase">
                          {d.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {confirmDeleteId === d.id ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={deletingId === d.id}
                              onClick={() => handleDelete(d.id)}
                              className="nv-btn-press px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-semibold flex items-center gap-1"
                            >
                              {deletingId === d.id && <Loader2 className="w-3 h-3 animate-spin" />}
                              <span>Confirm</span>
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === d.id}
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded bg-warmgray text-charcoal text-[11px] font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(d.id);
                                setEditTopic(d.topic);
                                setEditBudgetUsd((d.max_budget_cents / 100).toFixed(2));
                                setEditDifficulty(d.preferred_difficulty || 'intermediate');
                                setEditSchedule(d.preferred_schedule || '');
                              }}
                              className="p-1.5 rounded-md text-charcoal/60 hover:text-forest hover:bg-ivory transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
                              title="Edit"
                              aria-label={`Edit ${d.topic}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(d.id)}
                              className="p-1.5 rounded-md text-charcoal/60 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                              title="Delete"
                              aria-label={`Delete ${d.topic}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-charcoal/80 italic bg-ivory p-3 rounded-xl border border-warmgray/50">
                      "{d.raw_prompt}"
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-charcoal/60 pt-2 border-t border-warmgray/50">
                      <div>Budget: <strong>${(d.max_budget_cents / 100).toFixed(2)} USD</strong></div>
                      <div>Format: <strong className="capitalize">{d.delivery_format.replace('_', ' ')}</strong></div>
                      <div>Level: <strong className="capitalize">{d.preferred_difficulty}</strong></div>
                      <div>Confidence: <strong>{Math.round(d.confidence_score * 100)}%</strong></div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-warmgray p-8 space-y-3">
            <MessageSquare className="w-8 h-8 text-charcoal/30 mx-auto" />
            <h3 className="font-semibold text-sm text-charcoal">No demands created yet</h3>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              Start by telling NUVENDRY what you'd like to learn. Instructors inspect demand clusters to create new workshops.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
