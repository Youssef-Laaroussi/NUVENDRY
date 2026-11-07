import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { LearningDemand } from '../../types';
import { 
  Sparkles, Trash2, Edit2, Loader2, Plus, CheckCircle2, 
  MessageSquare, DollarSign, Calendar, Globe 
} from 'lucide-react';

export const MyDemands: React.FC = () => {
  const [demands, setDemands] = useState<LearningDemand[]>([]);
  const [loading, setLoading] = useState(true);

  // New Demand Form
  const [showForm, setShowForm] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTopic, setEditTopic] = useState('');
  const [editBudget, setEditBudget] = useState(5000);

  const fetchDemands = async () => {
    setLoading(true);
    try {
      const data = await api.getDemands({ mine_only: true });
      setDemands(data);
    } catch (err) {
      console.error('Failed to load demands', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleExtract = async () => {
    if (!prompt.trim()) return;
    setExtracting(true);
    try {
      const res = await api.extractDemand(prompt);
      setExtracted(res);
    } catch (err) {
      console.error('Extraction failed', err);
    } finally {
      setExtracting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setSubmitting(true);
    try {
      await api.createDemand({
        raw_prompt: prompt,
        topic: extracted?.topic,
        related_skills: extracted?.related_skills,
        preferred_difficulty: extracted?.preferred_difficulty,
        max_budget_cents: extracted?.max_budget_cents,
        language: extracted?.language,
        preferred_schedule: extracted?.preferred_schedule,
      });
      setPrompt('');
      setExtracted(null);
      setShowForm(false);
      fetchDemands();
    } catch (err) {
      console.error('Failed to submit demand', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this learning request?')) return;
    try {
      await api.deleteDemand(id);
      setDemands(demands.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete demand', err);
    }
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await api.updateDemand(id, {
        topic: editTopic,
        max_budget_cents: editBudget,
      });
      setEditingId(null);
      fetchDemands();
    } catch (err) {
      console.error('Failed to update demand', err);
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
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-ivory text-xs font-semibold hover:bg-charcoal transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Cancel' : 'Submit New Demand'}</span>
          </button>
        </div>

        {/* Creator Form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-warmgray p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-sm text-charcoal">Describe What You Want to Learn</h3>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Practical FastAPI + React integration with PayPal checkout for under $35."
              className="w-full p-3 bg-ivory border border-warmgray rounded-xl text-xs text-charcoal focus:outline-hidden focus:ring-1 focus:ring-forest"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExtract}
                disabled={extracting || !prompt.trim()}
                className="px-3.5 py-2 rounded-lg bg-mint text-forest font-semibold text-xs hover:bg-forest hover:text-ivory transition-colors flex items-center gap-1.5"
              >
                {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-gold" />}
                <span>Preview AI Extraction</span>
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={submitting || !prompt.trim()}
                className="px-4 py-2 rounded-lg bg-forest text-ivory font-semibold text-xs hover:bg-charcoal transition-colors shadow-xs"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm & Save</span>}
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
              <div key={d.id} className="bg-white rounded-2xl border border-warmgray p-5 space-y-3 shadow-xs">
                {editingId === d.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <label className="text-[11px] font-medium text-charcoal/70 mb-1 block">Budget (Cents)</label>
                        <input
                          type="number"
                          value={editBudget}
                          onChange={(e) => setEditBudget(Number(e.target.value))}
                          className="w-full p-2 bg-ivory border border-warmgray rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(d.id)}
                        className="px-3 py-1 bg-forest text-ivory text-xs font-semibold rounded-md"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-warmgray text-charcoal text-xs font-semibold rounded-md"
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
                        <button
                          onClick={() => {
                            setEditingId(d.id);
                            setEditTopic(d.topic);
                            setEditBudget(d.max_budget_cents);
                          }}
                          className="p-1.5 text-charcoal/60 hover:text-forest transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 text-charcoal/60 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

