import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function FinancialDashboard() {
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [savings, setSavings] = useState('');
  const [advice, setAdvice] = useState('');
  const [userId, setUserId] = useState('');
  const [fetchUserId, setFetchUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [exchangeRate, setExchangeRate] = useState({});
  const [stockPrice, setStockPrice] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('AAPL'); // Default stock symbol for Apple Inc.

  // Function to fetch exchange rates from ExchangeRate-API
  const fetchExchangeRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD'); // Get rates for USD
      const data = await response.json();
      // Keep only the main three exchange rates
      const mainRates = {
        EUR: data.rates.EUR,
        GBP: data.rates.GBP,
        JPY: data.rates.JPY,
      };
      setExchangeRate(mainRates);
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
    }
  };

  // Function to fetch stock prices from Alpha Vantage
  const fetchStockPrice = async () => {
    try {
      const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${stockSymbol}&interval=1min&apikey=YOUR_API_KEY`);
      const data = await response.json();
      const latestTime = Object.keys(data['Time Series (1min)'])[0];
      setStockPrice(data['Time Series (1min)'][latestTime]['1. open']);
    } catch (error) {
      console.error('Error fetching stock price:', error);
    }
  };

  // Fetch exchange rates and stock price when the component mounts
  useEffect(() => {
    fetchExchangeRate();
    fetchStockPrice();
  }, [stockSymbol]);

  // Form submit handler for financial data
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    if (income <= 0 || expenses < 0 || savings < 0) {
      alert('No negative values allowed. Please enter valid financial details.');
      return;
    }

    if (expenses + savings !== income) {
      alert('Expenses and savings must equal the income.');
      return;
    }

    if (!userId) {
      alert('User ID is required.');
      return;
    }

    // Prepare the data to be sent to the back-end
    const financialData = {
      income: parseFloat(income),
      expenses: parseFloat(expenses),
      savings: parseFloat(savings),
      userId: userId,
    };

    try {
      // Send the data to the back-end API
      const response = await fetch('http://localhost:5000/api/financial-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(financialData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setAdvice(result.advice); // Update the advice state with the returned advice
        setIncome(''); // Clear input after submission
        setExpenses(''); // Clear input after submission
        setSavings(''); // Clear input after submission
        setUserId(''); // Clear input after submission
      } else {
        alert(result.message); // Display error message
      }
    } catch (error) {
      console.error('Error fetching advice:', error);
      alert('Failed to get financial advice.');
    }
  };

  // Fetch user financial data based on user ID
  const handleGetData = async () => {
    if (!fetchUserId) {
      alert('Please enter a user ID.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/financial-data/${fetchUserId}`);
      const result = await response.json();

      if (result.data) {
        setUserData(result.data);
        setIncome(result.data.income);
        setExpenses(result.data.expenses);
        setSavings(result.data.savings);
        setAdvice(result.advice); // Display the advice based on retrieved data
      } else {
        alert(result.message); // Display error message for missing data
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to retrieve user data.');
    }
  };

  return (
    <>
      <nav className="navbar navbar-dark bg-dark sticky-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Mymoneykarma
          </a>
        </div>
      </nav>

      <div className="container my-5 d-flex justify-content-center">
        <div className="row w-75">
          <div className="col-md-6 mb-4">
            <div className="card shadow p-4">
              <h4 className="text-center mb-4">Enter Your Financial Details</h4>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label>User ID:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your User ID"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Income:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value))}
                    placeholder="Enter your income"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Expenses:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={expenses}
                    onChange={(e) => setExpenses(parseFloat(e.target.value))}
                    placeholder="Enter your expenses"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label>Savings:</label>
                  <input
                    type="number"
                    className="form-control"
                    value={savings}
                    onChange={(e) => setSavings(parseFloat(e.target.value))}
                    placeholder="Enter your savings"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Submit
                </button>
              </form>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow p-4">
              <h4 className="text-center mb-4">Financial Advice</h4>

              {advice ? (
                <p>{advice}</p>
              ) : (
                <p>No advice to display. Submit your details or fetch by User ID.</p>
              )}
            </div>
            <div className="mt-4">
              <label>Fetch Data by User ID:</label>
              <input
                type="text"
                className="form-control mb-3"
                value={fetchUserId}
                onChange={(e) => setFetchUserId(e.target.value)}
                placeholder="Enter User ID to fetch data"
              />
              <button onClick={handleGetData} className="btn btn-success w-100">
                Get Data by User ID
              </button>
              {userData && (
                <div className="mt-3">
                  <h5>Retrieved Financial Data:</h5>
                  <p><strong>Income:</strong> {userData.income}</p>
                  <p><strong>Expenses:</strong> {userData.expenses}</p>
                  <p><strong>Savings:</strong> {userData.savings}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Combined Section for Exchange Rates and Stock Prices */}
      <div className="container my-5">
        <div className="card shadow p-4">
          <h4 className="text-center mb-4">Exchange Rates and Stock Price</h4>
          <div className="row">
            <div className="col-md-6">
              <h5 className="text-center">Exchange Rates</h5>
              {Object.keys(exchangeRate).length > 0 ? (
                <ul className="list-group">
                  <li className="list-group-item">EUR: {exchangeRate.EUR}</li>
                  <li className="list-group-item">GBP: {exchangeRate.GBP}</li>
                  <li className="list-group-item">JPY: {exchangeRate.JPY}</li>
                </ul>
              ) : (
                <p>Loading exchange rates...</p>
              )}
            </div>

            <div className="col-md-6">
              <h5 className="text-center">Stock Price</h5>
              <div className="mb-3">
                <label>Enter Stock Symbol:</label>
                <input
                  type="text"
                  className="form-control"
                  value={stockSymbol}
                  onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL for Apple"
                />
              </div>
              <button onClick={fetchStockPrice} className="btn btn-secondary mb-3">
                Get Stock Price
              </button>
              {stockPrice ? (
                <p>Current Price of {stockSymbol}: ${stockPrice}</p>
              ) : (
                <p>Loading stock price...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FinancialDashboard;
