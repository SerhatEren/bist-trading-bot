import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ValidationModule } from 'ag-grid-community';
import { CellStyleModule } from 'ag-grid-community';
import { TextFilterModule } from 'ag-grid-community';
import { NumberFilterModule } from 'ag-grid-community';
import { ColDef, ModuleRegistry, ValueFormatterParams } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// Import the specific type with alias
import { BinanceBalance as Balance } from '../../types/api'; 

// Remove local TickerPrice interface
// interface TickerPrice { ... }

// Define the structure of the data we'll actually display in the grid
interface PositionRow {
    asset: string;
    quantity: number;
    currentPrice?: number; // Price in USDT
    value?: number; // Value in USDT
}

interface PositionsGridProps {
  balances: Balance[];
  // Accept tickerMap directly
  tickerMap: Map<string, number>; 
  isLoading: boolean;
}

// Register modules (if not already done)
// ModuleRegistry.registerModules([...]);

const PositionsGrid: React.FC<PositionsGridProps> = ({ balances, tickerMap, isLoading }) => {

  // Transform balances using the tickerMap directly
  const rowData: PositionRow[] = React.useMemo(() => {
    if (!balances || tickerMap.size === 0) return [];

    const cashAssets = ['USDT', 'BUSD', 'USDC', 'FDUSD', 'TUSD']; 
    // Get conversion rates needed for fallbacks directly from the map
    const btcUsdtPrice = tickerMap.get('BTCUSDT');
    const ethUsdtPrice = tickerMap.get('ETHUSDT');
    const bnbUsdtPrice = tickerMap.get('BNBUSDT');

    return balances
      .map(b => ({
        asset: b.asset,
        quantity: parseFloat(b.free) + parseFloat(b.locked),
      }))
      .filter(b => !isNaN(b.quantity) && b.quantity > 0 && !cashAssets.includes(b.asset))
      .map(b => {
        let valueInUsdt = 0;
        let currentPrice : number | undefined = undefined;
        const asset = b.asset;
        let price: number | undefined; // Re-declare price here

        // Try price lookups using the passed tickerMap
        price = tickerMap.get(asset + 'USDT');
        if (price) {
            currentPrice = price;
            valueInUsdt = b.quantity * price;
        } else {
            price = tickerMap.get(asset + 'BTC');
            if (price && btcUsdtPrice) { 
                currentPrice = price * btcUsdtPrice; // Store estimated USDT price
                valueInUsdt = b.quantity * currentPrice;
            } else {
                price = tickerMap.get(asset + 'ETH');
                if (price && ethUsdtPrice) { 
                    currentPrice = price * ethUsdtPrice;
                    valueInUsdt = b.quantity * currentPrice;
                } else {
                    price = tickerMap.get(asset + 'BNB');
                    if (price && bnbUsdtPrice) { 
                        currentPrice = price * bnbUsdtPrice;
                        valueInUsdt = b.quantity * currentPrice;
                    } else {
                        // No price found
                        currentPrice = undefined;
                        valueInUsdt = 0; 
                    }
                }
            }
        }
        return {
          ...b,
          currentPrice: currentPrice,
          value: valueInUsdt, // Use calculated USDT value
        };
      });
  // Depend on balances and the tickerMap directly
  }, [balances, tickerMap]);

  // Column Definitions (Referencing PositionRow fields)
  const columnDefs: ColDef<PositionRow>[] = [
    { 
      field: 'asset', 
      headerName: 'Asset', 
      minWidth: 100, cellStyle: { fontWeight: 'bold' }, sortable: true, filter: true
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      minWidth: 110, type: 'numericColumn', sortable: true, filter: true,
      valueFormatter: (params: ValueFormatterParams<PositionRow, number>) => {
         if (params.value === undefined || params.value === null) return '0';
         return params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
      }
    },
    { 
      field: 'currentPrice', 
      headerName: 'Price (USDT)', 
      minWidth: 130, type: 'numericColumn', sortable: true, filter: true,
      valueFormatter: (params: ValueFormatterParams<PositionRow, number | undefined>) => { // Allow undefined
        return params.value !== undefined && params.value !== null ? formatCurrency(params.value, 4) : '-';
      }
    },
    { 
      field: 'value', 
      headerName: 'Value (USDT)', 
      minWidth: 140, type: 'numericColumn', sortable: true, filter: true,
      valueFormatter: (params: ValueFormatterParams<PositionRow, number | undefined>) => { // Allow undefined
        return params.value !== undefined && params.value !== null ? formatCurrency(params.value, 2) : '-'; 
      }
    },
  ];

  const defaultColDef: ColDef<PositionRow> = {
    flex: 1,
    minWidth: 90,
    resizable: true
  };

  const overlayLoadingTemplate = isLoading ? '<span class="loading">Loading positions...</span>' : undefined;
  const overlayNoRowsTemplate = !isLoading && rowData.length === 0 ? '<span class="no-data">No non-cash positions found</span>' : undefined;

  return (
    <div className="ag-theme-alpine-dark positions-grid" style={{ height: 300 }}> 
      <AgGridReact<PositionRow>
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        animateRows={true}
        domLayout="normal"
        suppressCellFocus={true}
        overlayLoadingTemplate={overlayLoadingTemplate}
        overlayNoRowsTemplate={overlayNoRowsTemplate}
        theme="legacy"
      />
    </div>
  );
};

// Helper function to format currency
function formatCurrency(value: number, precision: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', 
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

export default PositionsGrid; 