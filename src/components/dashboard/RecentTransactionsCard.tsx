import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { Order } from '../../types/api';
import '../../styles/Dashboard.css';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef, GridOptions, ValueFormatterParams, ModuleRegistry, GridReadyEvent } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';

// Register necessary AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface RecentTransactionsCardProps {
  orders: Order[] | null;
  isLoading: boolean;
}

const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({ 
  orders, 
  isLoading 
}) => {
  // Format Unix timestamp (number) to a readable date/time string
  const formatDateTime = (value: string | undefined): string => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      // Format as needed, e.g., MM/DD/YYYY HH:MM:SS
      return date.toLocaleString('en-US', { 
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (value: number | undefined, precision: number = 2): string => {
    if (value === undefined || isNaN(value)) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  };

  // AG Grid column definitions with ColDef type
  const columnDefs: ColDef<Order>[] = [
    { headerName: "Date", field: "createdAt", flex: 1, sortable: true, filter: true, valueFormatter: (params: ValueFormatterParams<Order>) => formatDateTime(params.value) },
    { headerName: "Symbol", field: "symbol", flex: 1, sortable: true, filter: true },
    { headerName: "Side", field: "side", flex: 0.5, sortable: true, filter: true },
    { headerName: "Type", field: "type", flex: 0.7, sortable: true, filter: true },
    { headerName: "Price", field: "price", flex: 1, sortable: true, filter: 'agNumberColumnFilter', valueFormatter: (params: ValueFormatterParams<Order>) => formatCurrency(params.value, 4) },
    { headerName: "Quantity", field: "quantity", flex: 1, sortable: true, filter: 'agNumberColumnFilter' },
    { headerName: "Status", field: "status", flex: 1, sortable: true, filter: true }
  ];

  // AG Grid options with GridOptions type
  const gridOptions: GridOptions<Order> = {
    domLayout: 'autoHeight',
    pagination: true,
    paginationPageSize: 5,
    suppressRowClickSelection: true,
  };

  const rowData = useMemo(() => {
      return orders?.filter(order => order && order.id).map(order => ({ ...order })) || [];
  }, [orders]);

  const onGridReady = (params: GridReadyEvent) => {
      params.api.sizeColumnsToFit();
  };

  return (
    <div className="dashboard-card recent-transactions-card">
      <div className="card-header">
        <h3 className="card-title">
          <span className="card-icon">📋</span>
          Recent Orders
        </h3>
        {/* <Link to="/transactions" className="view-more">View All</Link> */}
      </div>
      <div className="card-body" style={{ height: 'calc(100% - 50px)', overflow: 'hidden' }}>
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : !rowData || rowData.length === 0 ? (
          <div className="no-data">No recent orders found.</div>
        ) : (
          <div className="ag-theme-alpine" style={{ height: '100%', width: '100%' }}>
            <AgGridReact<Order>
              columnDefs={columnDefs}
              rowData={rowData}
              gridOptions={gridOptions}
              getRowId={(params) => params.data.id ?? Math.random().toString()}
              onGridReady={onGridReady}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactionsCard; 