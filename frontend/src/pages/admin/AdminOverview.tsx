import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api, useSyncRefresh } from '../../api/client';
import { ShieldAlert, Users, Database, Activity, CheckCircle2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const AdminOverview: React.FC = () => {
  const location = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const [u, a] = await Promise.all([
        api.getAdminUsers(),
        api.getAdminAudit(),
      ]);
      setUsers(u);
      setAuditLogs(a);
    } catch (err) {
      console.error('Failed to load admin overview', err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useSyncRefresh(['user', 'reservations', 'workshops', 'demands', 'rewards'], load);

  const isUsersRoute = location.pathname === '/admin/users';
  const isAuditRoute = location.pathname === '/admin/audit';
  const isPaymentsRoute = location.pathname === '/admin/payments';
  const isContentRoute = location.pathname === '/admin/content';

  const visibleAuditLogs = useMemo(() => {
    if (isPaymentsRoute) {
      return auditLogs.filter(
        (l) =>
          String(l.resource_type || '').toLowerCase().includes('payment') ||
          String(l.resource_type || '').toLowerCase().includes('reservation') ||
          String(l.action || '').toLowerCase().includes('paypal')
      );
    }
    if (isContentRoute) {
      return auditLogs.filter(
        (l) =>
          String(l.resource_type || '').toLowerCase().includes('workshop') ||
          String(l.resource_type || '').toLowerCase().includes('demand')
      );
    }
    return auditLogs;
  }, [auditLogs, isPaymentsRoute, isContentRoute]);

  return (
    <>
      <div className="space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-forest font-mono">
            Platform Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-charcoal mt-1">
            Administrator Workspace
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/60">
            System health, user accounts directory, and immutable PostgreSQL audit trails.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="nv-card-lift bg-white p-4 rounded-xl border border-warmgray space-y-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-forest" /> Total Registered Users
            </span>
            <div className="text-xl font-bold font-mono text-charcoal">{users.length}</div>
          </Link>

          <Link
            to="/admin/audit"
            className="nv-card-lift bg-white p-4 rounded-xl border border-warmgray space-y-1 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          >
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-forest" /> Audit Events Logged
            </span>
            <div className="text-xl font-bold font-mono text-charcoal">{auditLogs.length}</div>
          </Link>

          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-forest" /> Database Status
            </span>
            <div className="text-xs font-semibold text-forest flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> PostgreSQL Connected
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-warmgray space-y-1">
            <span className="text-[11px] font-medium text-charcoal/60 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-forest" /> PayPal Sandbox
            </span>
            <div className="text-xs font-semibold text-forest flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Orders v2 Active
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div
          className={`bg-white rounded-2xl border p-6 space-y-4 shadow-xs ${
            isUsersRoute ? 'border-forest ring-2 ring-forest/20' : 'border-warmgray'
          }`}
        >
          <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
            <Users className="w-4 h-4 text-forest" /> User Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory text-charcoal/60 font-mono uppercase text-[10px] border-b border-warmgray">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Referral Code</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-ivory/50">
                    <td className="py-2.5 px-3 text-charcoal font-semibold">{u.full_name}</td>
                    <td className="py-2.5 px-3 text-charcoal/70">{u.email}</td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="px-2 py-0.5 rounded-full bg-mint text-forest text-[10px] font-semibold">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-charcoal/60">{u.referral_code || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-charcoal/50 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log Table */}
        <div
          className={`bg-white rounded-2xl border p-6 space-y-4 shadow-xs ${
            isAuditRoute || isPaymentsRoute || isContentRoute
              ? 'border-forest ring-2 ring-forest/20'
              : 'border-warmgray'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-charcoal flex items-center gap-2">
              <Activity className="w-4 h-4 text-forest" /> Security & Mutation Audit Trail
            </h3>
            {(isPaymentsRoute || isContentRoute) && (
              <Link to="/admin/audit" className="text-xs font-semibold text-forest hover:underline">
                Show all events
              </Link>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-ivory text-charcoal/60 uppercase text-[10px] border-b border-warmgray">
                <tr>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3">Resource ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warmgray/60 text-[11px]">
                {visibleAuditLogs.map((l) => (
                  <tr key={l.id} className="nv-row-hover hover:bg-ivory/50">
                    <td className="py-2.5 px-3 text-forest font-bold">{l.action}</td>
                    <td className="py-2.5 px-3 text-charcoal/80 font-sans">{l.resource_type}</td>
                    <td className="py-2.5 px-3 text-charcoal/60 truncate max-w-xs">{l.resource_id}</td>
                    <td className="py-2.5 px-3 text-charcoal/50 text-[10px]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
