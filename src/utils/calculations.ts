import { 
    BinanceAccountInfo as AccountInfo, 
    BinanceBalance as Balance 
} from '../types/api';

interface PortfolioMetrics {
  totalValue: number;
  cashBalance: number;
  investedValue: number;
}

/**
 * Calculates the estimated total portfolio value and cash balance in USDT.
 * @param accountInfo - The Binance account information containing balances.
 * @param tickerMap - A Map where keys are ticker symbols (e.g., 'BTCUSDT') and values are their current prices (as numbers).
 * @returns An object containing totalValue, cashBalance, and investedValue.
 */
export const calculatePortfolioMetrics = (
    accountInfo: AccountInfo | null,
    tickerMap: Map<string, number>
): PortfolioMetrics => {
    
    if (!accountInfo || !Array.isArray(accountInfo.balances) || tickerMap.size === 0) {
        // console.debug('calculatePortfolioMetrics: Missing accountInfo, balances, or tickerMap');
        return { totalValue: 0, cashBalance: 0, investedValue: 0 };
    }

    // Get necessary conversion rates first
    const btcUsdtPrice = tickerMap.get('BTCUSDT');
    const ethUsdtPrice = tickerMap.get('ETHUSDT');
    const bnbUsdtPrice = tickerMap.get('BNBUSDT');
    const cashAssets = ['USDT', 'BUSD', 'USDC', 'FDUSD', 'TUSD'];
    
    let calculatedTotal = 0;
    let calculatedCash = 0;

    accountInfo.balances.forEach((balance: Balance) => {
        const totalBalance = parseFloat(balance.free) + parseFloat(balance.locked);
        if (isNaN(totalBalance) || totalBalance <= 0) return;
        
        let valueInUsdt = 0;
        const asset = balance.asset;

        if (cashAssets.includes(asset)) { 
            valueInUsdt = totalBalance;
            calculatedCash += valueInUsdt; // Accumulate cash balance
        } else {
            let price = tickerMap.get(asset + 'USDT');
            if (price) {
                valueInUsdt = totalBalance * price;
            } else {
                price = tickerMap.get(asset + 'BTC');
                if (price && btcUsdtPrice) { 
                    valueInUsdt = totalBalance * price * btcUsdtPrice;
                } else {
                    price = tickerMap.get(asset + 'ETH');
                    if (price && ethUsdtPrice) { 
                        valueInUsdt = totalBalance * price * ethUsdtPrice;
                    } else {
                        price = tickerMap.get(asset + 'BNB');
                        if (price && bnbUsdtPrice) { 
                            valueInUsdt = totalBalance * price * bnbUsdtPrice;
                        } else {
                            if(totalBalance > 0.0001) {
                                // console.debug(`calculatePortfolioMetrics: Could not find price route for ${asset} (balance: ${totalBalance})`);
                            }
                            valueInUsdt = 0; 
                        }
                    }
                }
            }
        }
        calculatedTotal += valueInUsdt; // Accumulate total value including cash
    }); 
      
    const calculatedInvested = calculatedTotal - calculatedCash;

    return {
        totalValue: calculatedTotal,
        cashBalance: calculatedCash,
        investedValue: calculatedInvested
    };
};

// Add other calculation utility functions here if needed 