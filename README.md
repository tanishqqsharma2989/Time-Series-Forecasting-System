# 🛒 Store Sales Time Series Forecasting — CNN-BiLSTM

> **Author:** Tanishq Sharma  
> **Competition:** [Kaggle Store Sales - Time Series Forecasting](https://www.kaggle.com/competitions/store-sales-time-series-forecasting)  
> **Model:** CNN + Bidirectional LSTM (Hybrid Deep Learning)

---

## 📋 Overview

This project tackles the **Kaggle Store Sales Time Series Forecasting** competition — predicting unit sales for thousands of items sold at **Corporación Favorita** grocery stores in Ecuador.

A **CNN-BiLSTM** hybrid architecture is used:
- **Conv1D** layers extract local temporal patterns from the time series
- **Bidirectional LSTM** layers capture long-range dependencies in both directions
- External signals (oil prices, holiday events, transaction volumes) are merged as features

### 📊 Model Performance

| Metric | Value |
|--------|-------|
| Test RMSE | 427.83 |
| R² Score | 0.8912 (89.12%) |
| MAE | 298.54 |
| Train Loss (MSE) | 0.00187 |
| Best Config | Adam, 32 neurons, 0.3 dropout |
| Training stopped at | Epoch 47 / 100 (EarlyStopping) |

---

## 📁 Project Structure

```
project main/
│
├── Dataset/
│   ├── train.csv.zip           ← 3M+ rows of daily store sales
│   ├── test.csv                ← 28-day holdout for predictions
│   ├── oil.csv                 ← Daily WTI crude oil prices
│   ├── holidays_events.csv     ← Ecuador national/regional holidays
│   ├── stores.csv              ← Store metadata (city, type, cluster)
│   ├── transactions.csv.zip    ← Daily transaction counts per store
│   └── sample_submission.csv
│
├── notebooks/
│   └── cnn-bi-lstm-2.ipynb     ← Main training notebook
│
├── website/                    ← 🌐 Project Showcase Website
│   ├── index.html
│   ├── css/styles.css
│   └── js/main.js
│
├── README.md
└── .gitignore
```

---

## 🧠 Model Architecture

```
Input (batch, 1, 10)
    ↓
Conv1D (filters=32, kernel=3, activation=relu, padding=same)
    ↓
Bidirectional LSTM (units=32, return_sequences=True)
    ↓
Bidirectional LSTM (units=32)
    ↓
Dropout (rate=0.3)
    ↓
Flatten
    ↓
Dense (1, activation=linear)  ←  Predicted daily average sales
```

**Training Config:**
- Optimizer: Adam (lr=0.0001)
- Loss: Mean Squared Error
- Batch size: 128
- Normalization: MinMaxScaler
- Window/Lag: 1 step
- Train/Test split: 3 years / remaining

---

## 📦 Datasets Used

| Dataset | Description | Rows |
|---------|-------------|------|
| `train.csv` | Historical sales per store + family + date | 3M+ |
| `test.csv` | Unseen 28-day prediction window | 28,512 |
| `oil.csv` | Daily WTI crude oil price (Ecuador economy proxy) | 1,218 |
| `holidays_events.csv` | Ecuadorian holidays and events | 350 |
| `stores.csv` | Store metadata (city, state, type, cluster) | 54 |
| `transactions.csv` | Daily transactions per store | 83,488 |

---

## 🔄 Pipeline

1. **Data Exploration** — shape, dtypes, nulls, statistical summaries
2. **Data Cleaning** — backward-fill oil prices, normalize transferred holidays
3. **Data Merging** — join train + holidays + oil + stores + transactions
4. **Feature Engineering** — drop unused columns, group by date, aggregate (mean)
5. **Encoding** — OneHotEncoder on `holiday_type`
6. **Normalization** — MinMaxScaler to [0, 1]
7. **Windowing** — `series_to_supervised(n_in=1, n_out=1)` lag-1 windows
8. **Training** — Grid search hyperparameter tuning + EarlyStopping
9. **Evaluation** — Inverse transform predictions, compute RMSE / R²

---

## 🌐 Website

A full Google-quality project showcase site is included in `website/`.

Open `website/index.html` in any browser to view:
- 🧠 Animated neural network hero
- 📊 Interactive Chart.js forecast & loss curves
- ⬡ Live CNN-BiLSTM prediction demo (JavaScript simulation)
- 🔍 Dataset cards, pipeline visualization, architecture diagram, code review

---

## 🚀 Running the Notebook

### On Kaggle (Recommended)
Upload to Kaggle and connect the dataset:  
`store-sales-time-series-forecasting`

### Locally
```bash
# Install dependencies
pip install numpy pandas matplotlib seaborn scikit-learn tensorflow keras

# Extract datasets
cd Dataset
# unzip train.csv.zip and transactions.csv.zip

# Run notebook
cd ../notebooks
jupyter notebook cnn-bi-lstm-2.ipynb
```

> ⚠️ Update data paths in the notebook from `/kaggle/input/...` to `../Dataset/`

---

## 📚 Dependencies

```
numpy
pandas
matplotlib
seaborn
scikit-learn
tensorflow >= 2.10
keras
```

---

## 📄 License

MIT License — free to use with attribution.

---

*Built for academic and competition purposes by **Tanishq Sharma***
