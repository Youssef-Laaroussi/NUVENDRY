import React, { useEffect, useState, useCallback } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountAnalytics: React.FC = () => {
  const [trends, setTrends] = useState<any[]>([]);
  const [overview, setOverview] = useState<any | null>(null);

  const load = useCallback(async () => {
    try {
      const [t, o] = await Promise.all([
        api.getDemandTrends(),
        api.getAnalyticsOverview(),
      ]);
      setTrends(t);
      setOverview(o);
    } catch (err) {
      console.error('Failed to load analytics', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['demands', 'clusters', 'reservations', 'workshops', 'analytics'], load);

  const chartData = trends.map((t) => ({
    name: t.topic,
    requests: t.count,
    budget: Math.round(t.avg_budget_cents / 100),
  }));

  return (
    <>
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Database-Derived Insights
          </span>
          <h1 className="text-2xl font-serif text-charcoal mt-1">Analytics & Conversion</h1>
          <p className="text-xs text-charcoal/60">
            Real metrics calculated from persisted learner demands, published offers, and confirmed PayPal transactions.
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/merchant/demand-intelligence"
            className="nv-card-lift bg-white p-4 rounded-xl border border-warmgray space-y-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="text-[11px] font-medium text-charcoal/60">Total Demands</span>
            <div className="text-xl font-bold font-mono text-charcoal">{overview?.total_demands || 0}</div>
          </Link>
          <Link
            to="/merchant/demand-intelligence"
            className="nv-card-lift bg-white p-4 rounded-xl border border-warmgray space-y-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="text-[11px] font-medium text-charcoal/60">Active Clusters</span>
            <div className="text-xl font-bold font-mono text-charcoal">{overview?.active_clusters || 0}</div>
          </Link>
          <Link
            to="/merchant/reservations"
            className="nv-card-lift bg-white p-4 rounded-xl border border-warmgray space-y-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="text-[11px] font-medium text-charcoal/60">Confirmed Bookings</span>
            <div className="text-xl font-bold font-mono text-forest">{overview?.confirmed_reservations || 0}</div>
          </Link>
          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60">Conversion Rate</span>
            <div className="text-xl font-bold font-mono text-charcoal">{overview?.conversion_rate_percentage || 0}%</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Learner Request Volume by Topic */}
          <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <Layers className="w-4 h-4 text-forest" />
              Learner Demand Volume by Topic
            </h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E9E2" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#205C49" radius={[4, 4, 0, 0]} name="Learner Requests" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-charcoal/40">
                  No demand data available.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Average Willingness-to-Pay ($) by Topic */}
          <div className="bg-white rounded-2xl border border-warmgray p-6 space-y-4 shadow-xs">
            <h3 className="text-sm font-semibold text-charcoal flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-forest" />
              Average Willingness-to-Pay ($ USD)
            </h3>
            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E9E2" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [`$${value}`, 'Avg Budget']} />
                    <Bar dataKey="budget" fill="#D7AC58" radius={[4, 4, 0, 0]} name="Target Price ($)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-charcoal/40">
                  No pricing data available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
