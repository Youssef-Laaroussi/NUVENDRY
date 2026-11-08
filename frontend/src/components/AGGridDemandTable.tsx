import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { DemandCluster } from '../types';
import { Sparkles } from 'lucide-react';

interface AGGridDemandTableProps {
  clusters: DemandCluster[];
  onGenerateOffer: (clusterId: string) => void;
}

export const AGGridDemandTable: React.FC<AGGridDemandTableProps> = ({
  clusters,
  onGenerateOffer,
}) => {
  const columnDefs = useMemo<ColDef[]>(() => [
    {
      field: 'topic',
      headerName: 'Topic',
      flex: 1.5,
      filter: true,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="font-semibold text-charcoal">{params.value}</span>
      )
    },
    {
      field: 'name',
      headerName: 'Aggregated Opportunity',
      flex: 2,
      filter: true,
      sortable: true,
    },
    {
      field: 'member_count',
      headerName: 'Learner Demand',
      flex: 1,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-mint text-forest">
          {params.value} Requests
        </span>
      )
    },
    {
      field: 'avg_budget_cents',
      headerName: 'Target Price',
      flex: 1,
      sortable: true,
      valueFormatter: (params: any) => `$${(params.value / 100).toFixed(2)} USD`
    },
    {
      field: 'difficulty',
      headerName: 'Level',
      flex: 1,
      sortable: true,
      cellRenderer: (params: any) => (
        <span className="capitalize text-xs text-charcoal/80 font-medium">
          {params.value}
        </span>
      )
    },
    {
      headerName: 'Action',
      flex: 1.2,
      cellRenderer: (params: any) => (
        <button
          type="button"
          onClick={() => onGenerateOffer(params.data.id)}
          className="nv-btn-press inline-flex items-center gap-1 px-3 py-1 bg-forest hover:bg-charcoal text-ivory text-xs font-semibold rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
        >
          <Sparkles className="w-3 h-3 text-gold" />
          <span>AI Offer</span>
        </button>
      )
    }
  ], [onGenerateOffer]);

  const defaultColDef = useMemo<ColDef>(() => ({
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-alpine w-full h-[400px] rounded-xl overflow-hidden border border-warmgray shadow-xs">
      <AgGridReact
        rowData={clusters}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={10}
      />
    </div>
  );
};

