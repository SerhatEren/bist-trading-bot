import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Position } from '../../services/mockData';

interface PositionsGridProps {
  positions: Position[];
  isLoading: boolean;
}

const PositionsGrid: React.FC<PositionsGridProps> = ({ positions, isLoading }) => {
  // Column definitions with proper typing
  const columnDefs: ColDef<Position>[] = [
    { 
      field: 'symbol' as keyof Position, 
      headerName: 'Symbol',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      cellStyle: { fontWeight: 'bold' }
    },
    { 
      field: 'quantity' as keyof Position, 
      headerName: 'Quantity',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 90,
      type: 'numericColumn'
    },
    { 
      field: 'avgPrice' as keyof Position, 
      headerName: 'Avg Price',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 110,
      valueFormatter: (params: ValueFormatterParams<Position, number>) => {
        return params.value !== undefined && params.value !== null 
          ? formatCurrency(params.value) 
          : '';
      },
      type: 'numericColumn'
    },
    { 
      field: 'currentPrice' as keyof Position, 
      headerName: 'Current',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 110,
      valueFormatter: (params: ValueFormatterParams<Position, number>) => {
        return params.value !== undefined && params.value !== null 
          ? formatCurrency(params.value) 
          : '';
      },
      type: 'numericColumn'
    },
    { 
      field: 'value' as keyof Position, 
      headerName: 'Value',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 120,
      valueFormatter: (params: ValueFormatterParams<Position, number>) => {
        return params.value !== undefined && params.value !== null 
          ? formatCurrency(params.value) 
          : '';
      },
      type: 'numericColumn'
    },
    { 
      field: 'changePercent' as keyof Position, 
      headerName: 'Change %',
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 100,
      cellRenderer: (params: ICellRendererParams<Position, number>) => {
        if (params.value === undefined || params.value === null) {
          return '';
        }
        const value = params.value;
        const displayValue = value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
        return `<span class="${value >= 0 ? 'profit' : 'loss'}">${displayValue}</span>`;
      },
      type: 'numericColumn'
    },
  ];

  // Grid default column definition
  const defaultColDef: ColDef<Position> = {
    flex: 1,
    minWidth: 90,
    resizable: true
  };

  return (
    <div className="ag-theme-alpine-dark positions-grid">
      <AgGridReact<Position>
        columnDefs={columnDefs}
        rowData={positions}
        defaultColDef={defaultColDef}
        animateRows={true}
        domLayout="autoHeight"
        suppressCellFocus={true}
        rowSelection="single"
        loadingOverlayComponent={() => <div className="loading">Loading positions...</div>}
        noRowsOverlayComponent={() => <div className="no-data">No positions in portfolio</div>}
        overlayLoadingTemplate={isLoading ? '<span class="loading">Loading positions...</span>' : ''}
        overlayNoRowsTemplate={positions.length === 0 ? '<span class="no-data">No positions in portfolio</span>' : ''}
      />
    </div>
  );
};

// Helper function to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default PositionsGrid; 