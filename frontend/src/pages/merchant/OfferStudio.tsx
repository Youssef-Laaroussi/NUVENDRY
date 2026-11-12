import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api, useSyncRefresh } from '../../api/client';
import { DemandCluster } from '../../types';
import { 
  Sparkles, Layers, Target, Pencil, Eye, Save, Rocket, Calendar, Clock, Monitor, Users, Tag, Check, Cloud, Plus
} from 'lucide-react';

import terrain from '../../assets/offer-geoai.webp';
import './OfferStudio.css';

const DRAFT_STORAGE_KEY = 'nv_offer_studio_draft';

interface OfferDraftState {
  format: string;
  schedule: string;
  prerequisites: string[];
  outcomes: string[];
  title: string;
  description: string;
  duration: string;
  level: string;
  priceDollars: string;
  capacity: string;
  category: string;
  offerId: string | null;
}

const DEFAULT_DRAFT: OfferDraftState = {
  format: 'Live Workshop (Online)',
  schedule: '',
  prerequisites: [],
  outcomes: [],
  title: '',
  description: '',
  duration: '2 hours',
  level: 'Intermediate',
  priceDollars: '12',
  capacity: '20',
  category: '',
  offerId: null,
};

export const OfferStudio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialClusterId = searchParams.get('cluster_id') || '';
  const initialTopic = searchParams.get('topic') || '';

  const [clusters, setClusters] = useState<DemandCluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>(initialClusterId);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<Pick<OfferDraftState, 'title' | 'priceDollars' | 'outcomes'> | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [language, setLanguage] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [draft, setDraft] = useState<OfferDraftState>(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_DRAFT, ...JSON.parse(raw) };
      }
    } catch {
      // Ignore storage errors
    }
    if (initialTopic) {
      return {
        ...DEFAULT_DRAFT,
        title: `${initialTopic} — Hands-on Intensive`,
        category: initialTopic,
      };
    }
    return DEFAULT_DRAFT;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore
    }
  }, [draft]);

  const [imagePreview, setImagePreview] = useState('');
  useEffect(() => {
    if (!image) { setImagePreview(''); return; }
    const url = URL.createObjectURL(image);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const loadClusters = useCallback(async () => {
    try {
      const res = await api.getClusters();
      setClusters(res);
      if (res.length && !selectedClusterId) setSelectedClusterId(res[0].id);
      if (initialClusterId && res.some((c) => c.id === initialClusterId)) {
        setSelectedClusterId(initialClusterId);
      } else if (initialTopic) {
        const byTopic = res.find((c) => c.name.toLowerCase().includes(initialTopic.toLowerCase()));
        if (byTopic) setSelectedClusterId(byTopic.id);
      }
    } catch (err) {
      console.error(err);
    }
  }, [initialClusterId, initialTopic]);

  useEffect(() => {
    loadClusters();
  }, [loadClusters]);

  useSyncRefresh(['clusters', 'demands'], loadClusters);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) || {
    id: '',
    name: 'Select a demand cluster',
    topic: 'LangGraph Agents',
    summary: 'Run demand matching in Demand Intelligence to create an opportunity.',
    member_count: 0,
    avg_budget_cents: 3900,
    difficulty: 'intermediate',
  };

  const handleGenerateProposal = async () => {
    if (generating) return;
    if (!clusters.some((c) => c.id === selectedCluster.id)) {
      setFeedback({ type: 'error', message: 'Select an active PostgreSQL cluster before generating an AI proposal.' });
      return;
    }
    setGenerating(true);
    setFeedback(null);
    setCurrentStep(2);
    try {
      const proposal = await api.generateOffer(selectedCluster.id);
      const capLevel =
        selectedCluster.difficulty.charAt(0).toUpperCase() + selectedCluster.difficulty.slice(1).toLowerCase();
      setDraft({
        ...draft,
        title: proposal.suggested_title,
        description: [proposal.evidence_summary, ...(proposal.learning_outcomes || []), ...(proposal.session_outline || []), proposal.constraints_summary].filter(Boolean).join('\n\n'),
        duration: `${proposal.suggested_duration_hours} hours`,
        level: ['Beginner', 'Intermediate', 'Advanced'].includes(capLevel) ? capLevel : 'Intermediate',
        priceDollars: (proposal.suggested_price_cents / 100).toFixed(2),
        capacity: String(Math.max(1, selectedCluster.member_count)),
        outcomes: proposal.learning_outcomes ?? [],
        prerequisites: [],
        category: selectedCluster.topic || selectedCluster.name,
        offerId: proposal.id,
      });
      setGeneratedDraft({
        title: proposal.suggested_title,
        priceDollars: (proposal.suggested_price_cents / 100).toFixed(2),
        outcomes: proposal.learning_outcomes ?? [],
      });
      setCurrentStep(3);
      setFeedback({
        type: 'success',
        message: 'AI workshop proposal synthesized from cluster constraints. Review and customize below.',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate AI workshop proposal.' });
    } finally {
      setGenerating(false);
    }
  };

  const persistWorkshop = async (publishImmediately: boolean) => {
    const parsedPrice = parseFloat(draft.priceDollars);
    const parsedSeats = parseInt(draft.capacity, 10);
    if (!draft.title.trim() || Number.isNaN(parsedPrice) || parsedPrice <= 0 || Number.isNaN(parsedSeats) || parsedSeats < 1) {
      setFeedback({ type: 'error', message: 'Please provide a valid title, positive USD price, and seat capacity.' });
      return;
    }

    if (publishImmediately) {
      setPublishing(true);
      setCurrentStep(4);
    } else {
      setSavingDraft(true);
    }
    setFeedback(null);

    try {
      const scheduledDate = new Date(draft.schedule);

      const imageData = image ? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Could not read the workshop image.'));
        reader.readAsDataURL(image);
      }) : undefined;
      const created = await api.createWorkshop({
        image_data: imageData,
        language: language.trim() || undefined,
        delivery_format: ({'Live Workshop (Online)': 'live_online', 'In Person': 'in_person', 'Hybrid': 'hybrid', 'Hands-on Lab': 'hands_on_lab', 'On Demand': 'on_demand'} as Record<string, string>)[draft.format],
        offer_id: draft.offerId,
        title: draft.title.trim(),
        description: [draft.description, draft.format, draft.prerequisites.length && 'Prerequisites: ' + draft.prerequisites.join('; '), draft.outcomes.length && "What you’ll learn: " + draft.outcomes.filter(Boolean).join('; ')].filter(Boolean).join('\n\n'),
        category: draft.category || 'AI Systems',
        difficulty: draft.level.toLowerCase(),
        duration_hours: parseInt(draft.duration, 10) || 2,
        price_cents: Math.round(parsedPrice * 100),
        total_seats: parsedSeats,
        scheduled_at: scheduledDate.toISOString(),
      });

      if (publishImmediately) {
        await api.publishWorkshop(created.id);
      }

      try {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch {
        // Ignore
      }
      navigate(publishImmediately ? '/merchant/workshops?published=1' : '/merchant/workshops?draft=1');
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to persist workshop.' });
    } finally {
      setPublishing(false);
      setSavingDraft(false);
    }
  };

  const [prerequisite,setPrerequisite]=useState('');
  const [previewOpen,setPreviewOpen]=useState(false);
  const liveCluster=clusters.find(c=>c.id===selectedClusterId);
  const opportunity=liveCluster?.name || initialTopic || 'No opportunity selected';
  const category=draft.category || liveCluster?.topic || 'Workshop';
  function update<K extends keyof OfferDraftState>(key:K,value:OfferDraftState[K]){
    setDraft(previous=>({...previous,[key]:value}));
  }
  const start=new Date(draft.schedule);
  const validDate=Number.isFinite(start.getTime());
  const time=(d:Date)=>d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const date=validDate?start.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'}):'Choose a date';
  const hours=validDate?time(start)+' – '+time(new Date(start.getTime()+parseInt(draft.duration)*3600000)):'Choose a time';
  const preview=<><div className="offer-art"><img src={imagePreview || terrain} alt="" className={imagePreview ? "offer-uploaded-cover" : undefined}/><b>{category}</b></div>
    <h3>{draft.title}</h3><p>{draft.description}</p>
    <ul className="offer-meta"><li><Calendar/>{date}</li><li><Clock/>{hours} ({draft.duration})</li><li><Monitor/>{draft.format}</li><li><Users/>Up to {draft.capacity} seats</li><li><Tag/>${draft.priceDollars}</li></ul>
    <h2><Target/>What You’ll Learn</h2><ul>{draft.outcomes.filter(Boolean).map((o,i)=><li key={i}><Check/>{o}</li>)}</ul></>;
  const sections=['opportunity','recommendations','customize','publish'];
  return <div className="studio-overview offer-page">
    <header className="studio-hero"><h1>Offer Studio <Layers/></h1><p>Create and publish high-impact workshops with AI assistance. Turn demand insights into compelling offers, customize the details, and go live on NUVENDRY.</p></header>
    <nav className="offer-steps" aria-label="Workshop creation steps">{['Select Opportunity','AI Draft','Customize','Publish'].map((label,i)=><button key={label} aria-current={currentStep===i+1?'step':undefined} onClick={()=>{setCurrentStep((i+1) as 1|2|3|4);document.getElementById('offer-'+sections[i])?.focus()}}><b>{i+1}</b>{label}<span>›</span></button>)}</nav>
    <div className="offer-grid"><aside>
      <section className="offer-card" id="offer-opportunity" tabIndex={-1}><h2><Target/>Selected Opportunity</h2>
        <div className="offer-selected"><div className="offer-art"><img src={terrain} alt=""/><b>{category}</b></div><div><strong>{opportunity}</strong></div></div>
        <dl>{[['Topic Area',liveCluster?.topic || initialTopic || '—'],['Recent Interest',liveCluster?liveCluster.member_count+' requests':'—']].map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>
        {clusters.length>0&&<select aria-label="Select demand opportunity" value={selectedClusterId} onChange={e=>{setSelectedClusterId(e.target.value);setGeneratedDraft(null);update('offerId',null)}}><option value="">Select an opportunity</option>{clusters.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>}</section>
      <section className="offer-card" id="offer-recommendations" tabIndex={-1}><h2><Sparkles/>AI Recommendations</h2><p>Generate a proposal from a selected demand opportunity, or fill in the workshop manually.</p>
        {generatedDraft && (['title','priceDollars','outcomes'] as const).map((key,i)=><article key={key}>
          <button onClick={()=>update(key,generatedDraft[key])}>✓ Apply</button>
          <strong>{['Naming','Pricing','Content Focus'][i]}</strong>
          {key==='outcomes'?<ul>{generatedDraft.outcomes.map((outcome,i)=><li key={i}>{outcome}</li>)}</ul>:<p>{key==='priceDollars'?'$':''}{generatedDraft[key]}</p>}
        </article>)}
        {liveCluster&&<button className="studio-action" onClick={handleGenerateProposal} disabled={generating}>{generating?'Generating…':'Generate AI Draft'}</button>}</section></aside>
      <form id="offer-customize" tabIndex={-1} className="offer-card offer-form" onSubmit={e=>{e.preventDefault();if(!publishing&&!savingDraft)persistWorkshop((e.nativeEvent as SubmitEvent).submitter?.getAttribute('value')==='publish')}}>
        <h2><Pencil/>Customize Your Workshop</h2><p>Refine the AI draft, add your expertise, and set the key details for your offer.</p>
        <label>Workshop Title <small>{draft.title.length} / 120</small><input required maxLength={120} value={draft.title} onChange={e=>update('title',e.target.value)}/></label>
        <label>Workshop cover <small>Optional · JPG, PNG or WebP · 2 MB max</small><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{
          const file = e.currentTarget.files?.[0] ?? null;
          if (file && (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024)) {
            e.currentTarget.value = '';
            setImage(null);
            setFeedback({type:'error', message:'Choose a JPEG, PNG, or WebP image up to 2 MB.'});
            return;
          }
          setImage(file);
          setFeedback(null);
        }}/></label>
        <div className="offer-fields"><label>Format<select value={draft.format} onChange={e=>update('format',e.target.value)}>{['Live Workshop (Online)','In Person','Hybrid','Hands-on Lab','On Demand'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Duration<select value={draft.duration} onChange={e=>update('duration',e.target.value)}>{[...new Set(['1 hour','2 hours','3 hours','4 hours',draft.duration])].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Price (USD)<input required type="number" min=".01" step=".01" value={draft.priceDollars} onChange={e=>update('priceDollars',e.target.value)}/></label></div>
        <div className="offer-fields schedule"><label>Schedule (local time)<input type="datetime-local" required value={draft.schedule} onChange={e=>update('schedule',e.target.value)}/></label><label>Capacity<input required type="number" min="1" value={draft.capacity} onChange={e=>update('capacity',e.target.value)}/></label></div>
        <fieldset><legend>Prerequisites</legend><div className="offer-tags">{draft.prerequisites.map((v,i)=><button type="button" key={i} onClick={()=>update('prerequisites',draft.prerequisites.filter((_,n)=>n!==i))}>{v} ×</button>)}</div><div className="offer-add"><input aria-label="Add prerequisite" placeholder="Add a prerequisite…" value={prerequisite} onChange={e=>setPrerequisite(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();if(prerequisite.trim())update('prerequisites',[...draft.prerequisites,prerequisite.trim()]);setPrerequisite('')}}}/><button type="button" disabled={!prerequisite.trim()} onClick={()=>{update('prerequisites',[...draft.prerequisites,prerequisite.trim()]);setPrerequisite('')}}>Add</button></div></fieldset>
        <fieldset><legend>Learning Outcomes</legend>{draft.outcomes.map((o,i)=><div className="offer-outcome" key={i}><Check/><input required aria-label={'Learning outcome '+(i+1)} value={o} onChange={e=>update('outcomes',draft.outcomes.map((x,n)=>i===n?e.target.value:x))}/><button type="button" aria-label={'Remove outcome '+(i+1)} onClick={()=>update('outcomes',draft.outcomes.filter((_,n)=>n!==i))}>×</button></div>)}<button className="studio-action" disabled={draft.outcomes.length>=6} type="button" onClick={()=>update('outcomes',[...draft.outcomes,''])}><Plus/>Add Outcome</button><small>{draft.outcomes.length} / 6 outcomes</small></fieldset>
        <details><summary>Additional details</summary><label>Topic / category<input maxLength={100} value={draft.category} onChange={e=>update('category',e.target.value)}/></label><label>Workshop language<input maxLength={50} placeholder="e.g. English" value={language} onChange={e=>setLanguage(e.target.value)}/></label><label>Description<textarea value={draft.description} onChange={e=>update('description',e.target.value)}/></label><label>Level<select value={draft.level} onChange={e=>update('level',e.target.value)}>{['Beginner','Intermediate','Advanced'].map(x=><option key={x}>{x}</option>)}</select></label></details></form>
      <section className="offer-card offer-preview"><small>Draft</small><h2><Eye/>Live Offer Preview</h2><p>This is how your workshop will appear to learners.</p>{preview}</section></div>
    {feedback&&<p role={feedback.type==='error'?'alert':'status'}>{feedback.message}</p>}
    <footer id="offer-publish" tabIndex={-1} className="offer-card"><span><Cloud/>Workshop draft</span><button form="offer-customize" value="save" disabled={publishing||savingDraft}><Save/>{savingDraft?'Saving…':'Save Draft'}</button><button onClick={()=>setPreviewOpen(true)}><Eye/>Preview Offer</button><button form="offer-customize" value="publish" disabled={publishing||savingDraft}><Rocket/>{publishing?'Publishing…':'Publish Workshop'}</button></footer>
    {previewOpen&&<dialog ref={el=>{if(el&&!el.open)el.showModal()}} onClose={()=>setPreviewOpen(false)} className="offer-card offer-preview offer-dialog"><button autoFocus onClick={()=>setPreviewOpen(false)}>Close preview ×</button>{preview}</dialog>}
  </div>;
};
