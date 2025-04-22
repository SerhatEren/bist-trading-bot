# model_service/app.py
import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import numpy as np
import joblib
import tensorflow as tf # Make sure tf is imported

# --- Custom Layer Definition (from Notebook) ---
# Decorator removed as it causes AttributeError in older TF versions
# @tf.keras.saving.register_keras_serializable()
class Attention(tf.keras.layers.Layer): # Inherit from tf.keras.layers.Layer
    def __init__(self, **kwargs):
        super(Attention, self).__init__(**kwargs)

    def build(self, input_shape):
        # input_shape: (batch_size, time_steps, features)
        # Using tf.Variable for weights is more standard in recent TF/Keras
        self.W = self.add_weight(name="att_weight", shape=(input_shape[-1], input_shape[-1]),
                                 initializer="glorot_uniform", trainable=True)
        self.b = self.add_weight(name="att_bias", shape=(input_shape[-1],),
                                 initializer="zeros", trainable=True)
        super(Attention, self).build(input_shape) # Ensure build method of parent is called

    def call(self, x):
        # x: (batch_size, time_steps, features)
        # Using tf.keras.backend functions can sometimes cause issues with newer TF features like eager execution
        # Prefer using tf functions directly where possible
        e = tf.nn.tanh(tf.tensordot(x, self.W, axes=1) + self.b) # Using tf.nn.tanh and tf.tensordot
        a = tf.nn.softmax(e, axis=1) # Using tf.nn.softmax
        output = tf.reduce_sum(x * a, axis=1) # Using tf.reduce_sum
        return output

    # Needed for saving/loading model configuration with custom layers
    def get_config(self):
        config = super(Attention, self).get_config()
        # Add any custom initialization arguments here if needed
        # Example: config.update({"units": self.units})
        return config


# --- Model Loading ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
SERVICE_DIR = os.path.dirname(__file__)
# Prefer .keras format if available
LSTM_MODEL_PATH_KERAS = os.path.join(MODEL_DIR, '3xB-LSTM_rnn_model.keras')
LSTM_MODEL_PATH_H5 = os.path.join(MODEL_DIR, '3xB-LSTM_rnn_model.h5')
TRANSFORMER_MODEL_PATH = os.path.join(MODEL_DIR, 'fine_tuned_3class_model')
SCALER_PATH = os.path.join(SERVICE_DIR, 'scaler.pkl')

# --- Scaler Loading ---
scaler = None
n_features = 9
prediction_column_index = 3
try:
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        logger.info(f"Scaler loaded successfully from {SCALER_PATH}")
        if hasattr(scaler, 'n_features_in_') and scaler.n_features_in_ != n_features:
             logger.warning(f"Loaded scaler expects {scaler.n_features_in_} features, but analysis indicated {n_features}. Check consistency.")
    else:
        logger.error(f"Scaler file not found at {SCALER_PATH}. LSTM predictions will likely be incorrect.")
except ImportError:
    logger.error("scikit-learn or joblib not installed. Scaler cannot be loaded.")
except Exception as e:
    logger.error(f"Error loading scaler: {e}", exc_info=True)


# --- TensorFlow / Keras LSTM Model ---
lstm_model = None
expected_timesteps = 20
custom_objects = {'Attention': Attention} # Define custom objects dictionary

try:
    # Prioritize loading the .keras format
    if os.path.exists(LSTM_MODEL_PATH_KERAS):
        logger.info(f"Loading LSTM model from: {LSTM_MODEL_PATH_KERAS}")
        # Pass the custom Attention class during loading
        lstm_model = tf.keras.models.load_model(LSTM_MODEL_PATH_KERAS, custom_objects=custom_objects)
        logger.info("LSTM model (.keras) loaded successfully.")
    elif os.path.exists(LSTM_MODEL_PATH_H5):
        logger.info(f"Loading LSTM model from legacy .h5 format: {LSTM_MODEL_PATH_H5}")
        # Pass the custom Attention class during loading
        lstm_model = tf.keras.models.load_model(LSTM_MODEL_PATH_H5, custom_objects=custom_objects)
        logger.info("LSTM model (.h5) loaded successfully.")
    else:
        logger.warning(f"LSTM model file not found at {LSTM_MODEL_PATH_KERAS} or {LSTM_MODEL_PATH_H5}")
except ImportError:
    logger.warning("TensorFlow not installed. LSTM model functionality will be disabled.")
except Exception as e:
    logger.error(f"Error loading LSTM model: {e}", exc_info=True) # More detailed traceback is helpful now


# --- Hugging Face Transformer Model ---
transformer_model = None
tokenizer = None
try:
    # Ensure accelerate is available for transformers
    import accelerate
    from transformers import AutoModelForSequenceClassification, AutoTokenizer
    if os.path.exists(TRANSFORMER_MODEL_PATH) and os.path.isdir(TRANSFORMER_MODEL_PATH):
        logger.info(f"Loading Transformer model and tokenizer from: {TRANSFORMER_MODEL_PATH}")
        transformer_model = AutoModelForSequenceClassification.from_pretrained(TRANSFORMER_MODEL_PATH)
        tokenizer = AutoTokenizer.from_pretrained(TRANSFORMER_MODEL_PATH)
        logger.info("Transformer model and tokenizer loaded successfully.")
    else:
        logger.warning(f"Transformer model directory not found at {TRANSFORMER_MODEL_PATH}")
except ImportError:
    logger.warning("Transformers library, PyTorch/TensorFlow, or Accelerate not installed. Transformer model functionality will be disabled.")
except NameError as ne:
    if 'init_empty_weights' in str(ne):
        logger.error(f"Error loading Transformer model: {ne}. The 'accelerate' library might be missing or incompatible.", exc_info=False)
        logger.error("Suggestion: Ensure 'accelerate' is in requirements.txt and run 'pip install -r requirements.txt' in your venv.")
    else:
        logger.error(f"Error loading Transformer model: {ne}", exc_info=True)
except Exception as e:
    logger.error(f"Error loading Transformer model: {e}", exc_info=True)

# --- Flask App Setup ---
load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Helper Function for API Response ---
def create_api_response(data=None, success=True, error=None):
    response = {"success": success}
    if data is not None:
        response["data"] = data
    if error is not None:
        response["error"] = str(error)
        response["success"] = False
    return jsonify(response)

# --- API Endpoints ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    return create_api_response(data={"status": "ok"})

@app.route('/api/indicators/<symbol>', methods=['GET'])
def get_indicators(symbol):
    """Placeholder for technical indicators."""
    timeframe = request.args.get('timeframe', '1d')
    logger.info(f"Received request for indicators: symbol={symbol}, timeframe={timeframe}")
    mock_indicators = {
        "rsi": np.random.rand() * 100,
        "macd": np.random.rand() * 5 - 2.5,
        "sma_50": np.random.rand() * 100 + 50,
        "sma_200": np.random.rand() * 100 + 100,
    }
    return create_api_response(data=mock_indicators)

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    """Analyze sentiment using the Transformer model."""
    logger.info("Received request for sentiment analysis")
    if not transformer_model or not tokenizer:
        return create_api_response(error="Transformer model not loaded", success=False), 500

    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return create_api_response(error="Missing 'text' field in request body", success=False), 400

        text_to_analyze = data['text']
        logger.info(f"Analyzing sentiment for text: {text_to_analyze[:100]}...")

        inputs = tokenizer(text_to_analyze, return_tensors="pt", truncation=True, max_length=512)
        outputs = transformer_model(**inputs)
        probabilities = outputs.logits.softmax(dim=-1)
        predicted_class_id = probabilities.argmax().item()

        # Updated map based on notebook analysis
        sentiment_map = {0: 'negative', 1: 'neutral', 2: 'positive'}
        predicted_label = sentiment_map.get(predicted_class_id, "Unknown")
        class_probabilities = probabilities.squeeze().tolist()

        logger.info(f"Sentiment prediction: {predicted_label}, Probabilities: {class_probabilities}")
        result = {
            "sentiment": predicted_label,
            "score": class_probabilities[predicted_class_id],
            "details": {
                "probabilities": {label: prob for label, prob in zip(sentiment_map.values(), class_probabilities)}
            }
        }
        return create_api_response(data=result)

    except Exception as e:
        logger.error(f"Error during sentiment analysis: {e}", exc_info=True)
        return create_api_response(error=f"Sentiment analysis failed: {e}", success=False), 500


@app.route('/api/prediction/price', methods=['POST'])
def predict_price():
    """Predict price using the LSTM model."""
    logger.info("Received request for price prediction")
    if not lstm_model:
        return create_api_response(error="LSTM model not loaded", success=False), 500
    if not scaler:
        # Allow prediction with warning if scaler failed, but results will be scaled
         logger.warning("Scaler not loaded. Returning scaled prediction.")
         # return create_api_response(error="Scaler not loaded, cannot process prediction.", success=False), 500

    try:
        data = request.get_json()
        if not data or 'features' not in data:
            return create_api_response(error="Missing 'features' field in request body", success=False), 400

        # Expecting features for the last 'expected_timesteps' days, shape (20, 9)
        input_features = np.array(data['features'])
        if input_features.shape != (expected_timesteps, n_features):
            return create_api_response(error=f"Input features have incorrect shape. Expected ({expected_timesteps}, {n_features}), got {input_features.shape}", success=False), 400

        logger.info(f"Received features with shape: {input_features.shape}")

        # --- Preprocessing Step ---
        if scaler:
            scaled_features = scaler.transform(input_features)
        else:
            scaled_features = input_features # Use raw if scaler is missing (prediction will be scaled)

        # Reshape for LSTM: (batch_size, timesteps, features)
        reshaped_features = scaled_features.reshape(1, expected_timesteps, n_features)
        logger.info(f"Predicting price with input shape: {reshaped_features.shape}")

        # --- Prediction ---
        # Use predict method, which is safer for potential graph mode issues
        prediction_scaled = lstm_model.predict(reshaped_features)
        prediction_scaled_flat = prediction_scaled.flatten() # Shape (1,)

        # --- Inverse Transform Step ---
        if scaler:
            # Create a dummy array with the shape the scaler expects for inverse_transform
            prediction_full_shape = np.zeros((1, n_features))
            # Place the scaled prediction into the correct column
            prediction_full_shape[:, prediction_column_index] = prediction_scaled_flat
            # Apply inverse transform
            prediction_original_scale = scaler.inverse_transform(prediction_full_shape)
            # Extract the prediction from the correct column
            final_prediction_value = prediction_original_scale[0, prediction_column_index]
            logger.info(f"Scaled prediction: {prediction_scaled_flat[0]}, Original scale prediction: {final_prediction_value}")
        else:
            # If scaler is missing, return the scaled value with a warning note
            final_prediction_value = prediction_scaled_flat[0]
            logger.warning(f"Returning scaled prediction value as scaler is missing: {final_prediction_value}")


        result = {
            "prediction": float(final_prediction_value), # Convert numpy float to standard float
            "is_scaled": scaler is None, # Indicate if the returned value is scaled
            "timeframe": data.get("timeframe", "1d"),
            "modelType": "LSTM"
        }
        return create_api_response(data=result)

    except Exception as e:
        logger.error(f"Error during price prediction: {e}", exc_info=True)
        return create_api_response(error=f"Price prediction failed: {e}", success=False), 500

# --- Add other endpoints from modelBridgeService.ts as needed ---
# @app.route('/api/models', methods=['GET'])
# def get_models():
#     pass

# @app.route('/api/models/execute/<modelId>', methods=['POST'])
# def execute_model(modelId):
#     pass

# @app.route('/api/models/train', methods=['POST'])
# def train_model():
#     pass

# @app.route('/api/models/train/status/<jobId>', methods=['GET'])
# def get_training_status(jobId):
#     pass

# --- Global Error Handler ---
@app.errorhandler(Exception)
def handle_exception(e):
    """Handle unexpected errors."""
    logger.error(f"An unexpected error occurred: {e}", exc_info=True)
    return create_api_response(error="An internal server error occurred", success=False), 500

# --- Run the App ---
if __name__ == '__main__':
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port) # Use debug=False in production 