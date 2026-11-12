export const previewTopics = [
  {name:'MLOps & Production AI',count:46}, {name:'Geospatial Data Science',count:29},
  {name:'AI Agents & LLM Systems',count:24}, {name:'Spatial Analytics (GeoAI)',count:16},
  {name:'Other Topics',count:19},
];

const titles = ['Production MLOps: Serving & Monitoring','Building AI Agents with LangGraph','Spatial Data Science with Python','Geospatial AI for Real-World Apps','LLM Ops for Geospatial Data'];
export const previewPayments = titles.map((workshop_title,i) => ({
  id: String(i), workshop_title, buyer_name: 'learner.demo+0'+(i+1)+'@nuve.dev',
  paypal_order_id:'SBX-'+[104892,104881,104875,104861,104848][i], currency:'USD',
  amount_cents:[29900,34900,24900,27900,29900][i], created_at:'2026-11-'+[19,18,17,16,14][i]+'T14:47:00Z',status:'confirmed'
}));
export const previewActivity = [
  ['New reservation confirmed',titles[0]+' (1 seat)','5 min ago'],
  ['Workshop updated',titles[1]+' (v1.3)','42 min ago'],
  ['New demand opportunity','8 new requests for “Spatial Analytics (GeoAI)”','2 hours ago'],
  ['Rewards redeemed','240 points redeemed by 3 learners','3 hours ago'],
  ['Workshop published',titles[2],'Yesterday']
];
