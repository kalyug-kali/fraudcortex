
/**
 * GUIDE: Connecting your Google Colab ML Model to this application
 * 
 * 1. In your Google Colab notebook, add the following code to create a simple Flask API:
 * 
 * ```python
 * # Install required packages
 * !pip install flask flask-cors pyngrok
 * 
 * # Import necessary libraries
 * from flask import Flask, request, jsonify
 * from flask_cors import CORS
 * from pyngrok import ngrok
 * import pandas as pd
 * import numpy as np
 * 
 * # Create a Flask app
 * app = Flask(__name__)
 * CORS(app)  # Enable CORS for all routes
 * 
 * # Your trained ML model should be available here
 * # This assumes you've already trained your model in the notebook
 * 
 * @app.route('/predict', methods=['POST'])
 * def predict():
 *     data = request.json
 *     transactions = data.get('transactions', [])
 *     
 *     # Convert to DataFrame or appropriate format for your model
 *     df = pd.DataFrame(transactions)
 *     
 *     # TODO: Use your model to predict fraud
 *     # This is a placeholder, replace with your actual model prediction
 *     # For example:
 *     # predictions = your_model.predict(df)
 *     
 *     # For now, we'll simulate predictions
 *     # Mark 11 transactions as fraud (targeting high amounts)
 *     df['amount'] = pd.to_numeric(df['amount'])
 *     df = df.sort_values('amount', ascending=False)
 *     fraud_ids = set(df.head(11)['transaction_id'].tolist())
 *     
 *     result = {
 *         'predictions': [
 *             {
 *                 'transaction_id': t['transaction_id'],
 *                 'is_fraud_predicted': t['transaction_id'] in fraud_ids,
 *                 'fraud_score': 0.9 if t['transaction_id'] in fraud_ids else 0.2
 *             }
 *             for t in transactions
 *         ],
 *         'total_fraud_count': len(fraud_ids),
 *         'model_version': 'colab-model-v1.0',
 *         'timestamp': pd.Timestamp.now().isoformat()
 *     }
 *     
 *     return jsonify(result)
 * 
 * # Start ngrok
 * public_url = ngrok.connect(5000)
 * print(f' * ngrok tunnel available at: {public_url}')
 * 
 * # Run the Flask app
 * app.run(port=5000)
 * ```
 * 
 * 2. Run the cell in your Colab notebook
 * 3. Copy the ngrok URL that appears (should look like https://something.ngrok.io)
 * 4. In this app, click on the "ML API Settings" button in the dashboard
 * 5. Paste your ngrok URL and save
 * 
 * Note: The ngrok URL will change every time you restart your Colab notebook.
 * For a more permanent solution, consider deploying your model to a cloud service.
 */

export const getColabGuide = () => {
  return "See the colabApiGuide.ts file for step-by-step instructions on connecting your Google Colab ML model.";
};
