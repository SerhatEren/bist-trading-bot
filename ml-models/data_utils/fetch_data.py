import yfinance as yf
import pandas as pd
import csv
import os
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta

# 🗂️ Güncel BIST30 sembolleri (suffix olmadan)
# Note: NETAS might not be BIST30 consistently, verify if needed.
BIST30 = {
    "AKBNK","ARCLK","ASELS","BIMAS","DOHOL","EREGL","FROTO","GARAN","HALKB",
    "ISCTR","KCHOL","KOZAL","PETKM","SAHOL","SISE","TAVHL","THYAO","TKFEN",
    "TCELL","TOASO","TTKOM","TUPRS","ULKER","VAKBN","YKBNK","KRDMD" # Removed NETAS for now, add if confirmed
}

# Define the default output directory relative to this script's location
DEFAULT_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data', 'historical'))

def fetch_bist30(
    symbol: str,
    end_date: str | None = None,
    out_dir: str = DEFAULT_OUTPUT_DIR,
    save_csv: bool = True
) -> pd.DataFrame | None:
    """
    BIST30 listesinden bir sembolün geçmiş 8 yıllık verisini çeker ve formatlı DataFrame/CSV döner.
    İlk satırdaki default %0 PctChange'i de drop eder.

    Args:
        symbol: BIST30 stock symbol (e.g., "THYAO").
        end_date: End date in "YYYY-MM-DD" format. Defaults to tomorrow.
        out_dir: Directory to save the CSV file.
        save_csv: If True, saves the CSV file. If False, only returns DataFrame.

    Returns:
        Formatted pandas DataFrame if save_csv is False or file is saved. None if error.
    """
    try:
        # 1️⃣ Sembol validasyonu ve tamlaştırma
        sym = symbol.upper().replace(".IS", "")
        if sym not in BIST30:
            print(f"⚠️ Uyarı: '{symbol}' güncel BIST30 listesinde bulunamadı, yine de deneniyor.")
            # raise ValueError(f"'{symbol}' BIST30 listesinde değil.") # Allow fetching non-listed for flexibility
        ticker = f"{sym}.IS"

        # 2️⃣ Start-date: bugün-8 yıl
        start_dt = date.today() - relativedelta(years=8)
        start = start_dt.strftime("%Y-%m-%d")

        # 3️⃣ End-date ayarı: None ise yarını kullan
        if end_date is None:
            end = (date.today() + timedelta(days=1)).strftime("%Y-%m-%d")
        else:
            end = end_date

        print(f"⬇️ Veri indiriliyor: {ticker} ({start} -> {end})", end="... ")
        # 4️⃣ Veriyi indir
        df = yf.download(
            tickers    = ticker,
            start      = start,
            end        = end,
            interval   = "1d",
            progress   = False,
            auto_adjust=False, # Keep OHLC separate
            rounding   = True # Round price data
        )
        print(f"{len(df)} satır.")

        if df.empty:
            print(f"❌ Hata: {ticker} için veri bulunamadı.")
            return None

        # 5️⃣ Flatten & Price sütunu (Use 'Close' as 'Price' for consistency before pct_change)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        # Rename after calculations if needed, use Close consistently first
        # if "Adj Close" in df.columns:
        #     df.rename(columns={"Adj Close": "Price"}, inplace=True)
        # else:
        #     df["Price"] = df["Close"]

        # Ensure required columns exist
        required_cols = ['Open', 'High', 'Low', 'Close', 'Volume']
        if not all(col in df.columns for col in required_cols):
            print(f"❌ Hata: {ticker} için gerekli sütunlar eksik: {required_cols}. Mevcut: {df.columns.tolist()}")
            return None


        # 6️⃣ Tarihe göre sıralayıp yüzde değişimi hesapla
        df.sort_index(inplace=True)
        df["PctChange"] = df["Close"].pct_change() * 100

        # Drop the very first row with default NaN pct_change
        df = df.iloc[1:]

        # Fill subsequent NaNs (e.g., after splits/holidays) with 0
        df["PctChange"] = df["PctChange"].fillna(0)
        df["Volume"] = df["Volume"].fillna(0) # Also fill Volume NaNs if any

        # Use 'Close' for 'Şimdi' column consistently
        df["Price"] = df["Close"] # Now assign Price column for output

        # 7️⃣ Hücreleri istenen formata çevir
        rows = []
        for dt, r in df.iterrows():
            d      = dt.strftime("%d.%m.%Y")
            price  = f"{r['Price']:.2f}".replace(".", ",")
            open_  = f"{r['Open']:.2f}".replace(".", ",")
            high   = f"{r['High']:.2f}".replace(".", ",")
            low    = f"{r['Low']:.2f}".replace(".", ",")
            vol_m  = r["Volume"] / 1e6
            volume = f"{vol_m:.2f}".replace(".", ",") + "M" if vol_m > 0 else "0,00M"
            pct    = f"{r['PctChange']:.2f}".replace(".", ",") + "%"
            rows.append([d, price, open_, high, low, volume, pct])

        # 8️⃣ En yeni tarih en üstte
        rows.reverse()

        # 9️⃣ Çıktıyı hazırla
        header = ["Tarih","Şimdi","Açılış","Yüksek","Düşük","Hac.","Fark %"]
        df_out = pd.DataFrame(rows, columns=header)

        # 🔟 CSV'ye kaydet veya DataFrame döndür
        if save_csv:
            # Ensure output directory exists
            os.makedirs(out_dir, exist_ok=True)
            # Use ticker (e.g., THYAO.IS) in filename for clarity
            csv_filename = os.path.join(out_dir, f"{ticker}.csv")
            df_out.to_csv(
                csv_filename,
                index=False,
                header=header,
                sep=",",
                quoting=csv.QUOTE_ALL,
                encoding="utf-8-sig"
            )
            print(f"✅ Kaydedildi: {csv_filename}")
            return df_out # Also return df after saving
        else:
            return df_out

    except Exception as e:
        print(f"❌ Hata ({symbol}): {e}")
        return None

# --- Kullanım örneği ---
if __name__ == "__main__":
    print(f"Varsayılan Kayıt Dizini: {DEFAULT_OUTPUT_DIR}")
    # Example: Fetch and save THYAO data to the default directory
    df_thyao = fetch_bist30("THYAO", save_csv=True)
    if df_thyao is not None:
        print("\nTHYAO DataFrame İlk 5 Satır:")
        print(df_thyao.head())

    # Example: Fetch EREGL data but only return the DataFrame
    # df_eregl = fetch_bist30("EREGL", save_csv=False)
    # if df_eregl is not None:
    #     print("\nEREGL DataFrame İlk 5 Satır:")
    #     print(df_eregl.head())

    # Example: Fetch data for all symbols in BIST30
    # print("\nTüm BIST30 sembolleri indiriliyor...")
    # for sym in BIST30:
    #     fetch_bist30(sym, save_csv=True)
    # print("\nTüm BIST30 sembolleri indirildi.") 