// Define shared types for ML service responses

// Example structure for technical indicators
export interface TechnicalIndicators {
    rsi?: number;
    macd?: number;
    sma_50?: number;
    sma_200?: number;
    // Add other indicators as needed
    [key: string]: number | undefined; // Allow arbitrary indicators
}

// Example structure for NLP sentiment analysis result
export interface NLPSentiment {
    sentiment: 'positive' | 'negative' | 'neutral' | string; // Allow string for unknown cases
    score: number; // Confidence score of the prediction
    details?: {
        probabilities: { [label: string]: number }; // Probabilities per class
    };
}

// Example structure for ML price prediction result
export interface MLPrediction {
    prediction: number; // The predicted price
    is_scaled?: boolean; // Indicates if the value returned by service was scaled
    timeframe: string;
    modelType?: string;
    // Add other prediction details if available
} 