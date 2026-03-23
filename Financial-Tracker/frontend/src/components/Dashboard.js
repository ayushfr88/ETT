import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import "./Dashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Dashboard = ({ token, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }, [token]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(amount), category, type, date }),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions([data.transaction, ...transactions]);
        setAmount("");
        setCategory("");
        setDate("");
      } else {
        alert(data.message || "Failed to add transaction");
      }
    } catch (err) {
      console.error("Error adding transaction", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(transactions.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Error deleting transaction", err);
    }
  };

  // Compute Summaries
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
  const balance = totalIncome - totalExpense;

  // Pie Chart Data (Expenses by Category)
  const expenseCategories = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const pieData = {
    labels: Object.keys(expenseCategories),
    datasets: [
      {
        data: Object.values(expenseCategories),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  // Bar Chart Data (Income vs Expense)
  const barData = {
    labels: ["Income", "Expense"],
    datasets: [
      {
        label: "Amount",
        data: [totalIncome, totalExpense],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Finance Dashboard</h2>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* Summary Cards */}
      <section className="summary-cards">
        <div className="card income">
          <h3>Total Income</h3>
          <p>Rs {totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense">
          <h3>Total Expense</h3>
          <p>Rs {totalExpense.toFixed(2)}</p>
        </div>
        <div className="card balance">
          <h3>Balance</h3>
          <p>Rs {balance.toFixed(2)}</p>
        </div>
      </section>

      <div className="dashboard-main">
        {/* Form */}
        <section className="form-section">
          <h3>Add Transaction</h3>
          <form onSubmit={handleAddTransaction} className="transaction-form">
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Category (e.g., Food, Salary)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Transaction"}
            </button>
          </form>
        </section>

        {/* Charts */}
        <section className="charts-section">
          <div className="chart-wrapper">
            <h3>Income vs Expense</h3>
            <Bar
              data={barData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
          <div className="chart-wrapper">
            <h3>Expenses by Category</h3>
            {Object.keys(expenseCategories).length > 0 ? (
              <Pie
                data={pieData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            ) : (
              <p>No expenses to chart</p>
            )}
          </div>
        </section>
      </div>

      {/* Table */}
      <section className="table-section">
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p>No transactions found. Add some!</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.date).toLocaleDateString()}</td>
                  <td>{t.category}</td>
                  <td className={t.type === "income" ? "text-success" : "text-danger"}>
                    {t.type}
                  </td>
                  <td>Rs {Number(t.amount).toFixed(2)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
