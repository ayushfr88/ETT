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

const CATEGORY_ICONS = {
  food: "🍔", salary: "💼", transport: "🚗", shopping: "🛍️",
  health: "🏥", entertainment: "🎬", rent: "🏠", utilities: "⚡",
  education: "📚", savings: "💰", investment: "📈",
};

const getCategoryIcon = (cat) => {
  const key = cat?.toLowerCase();
  return CATEGORY_ICONS[key] || "💳";
};

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
      if (data.success) setTransactions(data.transactions);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
  }, [token]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      if (data.success) setTransactions(transactions.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting transaction", err);
    }
  };

  // Compute Summaries
  const totalIncome = transactions.filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);
  const balance = totalIncome - totalExpense;

  const fmt = (n) => "Rs " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Pie Chart Data
  const expenseCategories = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const CHART_COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#eab308", "#22c55e", "#06b6d4"];

  const pieData = {
    labels: Object.keys(expenseCategories),
    datasets: [{
      data: Object.values(expenseCategories),
      backgroundColor: CHART_COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const barData = {
    labels: ["Income", "Expense"],
    datasets: [{
      label: "Amount (Rs)",
      data: [totalIncome, totalExpense],
      backgroundColor: ["rgba(74, 222, 128, 0.8)", "rgba(248, 113, 113, 0.8)"],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "rgba(255,255,255,0.6)", font: { family: "Inter", size: 11 }, boxWidth: 10, padding: 12 } },
      tooltip: {
        backgroundColor: "rgba(15,12,41,0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "rgba(255,255,255,0.6)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { ticks: { color: "rgba(255,255,255,0.4)", font: { family: "Inter", size: 11 } }, grid: { display: false } },
      y: { ticks: { color: "rgba(255,255,255,0.4)", font: { family: "Inter", size: 11 }, callback: (v) => "Rs " + v.toLocaleString("en-IN") }, grid: { color: "rgba(255,255,255,0.04)" } },
    },
  };

  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="dashboard-wrapper">
      {/* NAV */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="nav-logo">💹</div>
          <div>
            <div className="nav-title">FinTrack</div>
            <div className="nav-subtitle">Personal Finance</div>
          </div>
        </div>
        <div className="nav-right">
          <span className="nav-date">{todayStr}</span>
          <button onClick={onLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-container">
        {/* SUMMARY CARDS */}
        <section className="summary-cards">
          <div className="card income">
            <span className="card-icon">💚</span>
            <div className="card-label">Total Income</div>
            <div className="card-amount">{fmt(totalIncome)}</div>
            <div className="card-footer">{transactions.filter(t => t.type === "income").length} transactions</div>
          </div>
          <div className="card expense">
            <span className="card-icon">🔴</span>
            <div className="card-label">Total Expense</div>
            <div className="card-amount">{fmt(totalExpense)}</div>
            <div className="card-footer">{transactions.filter(t => t.type === "expense").length} transactions</div>
          </div>
          <div className="card balance">
            <span className="card-icon">⚖️</span>
            <div className="card-label">Net Balance</div>
            <div className="card-amount">{fmt(balance)}</div>
            <div className="card-footer">{balance >= 0 ? "✅ Positive balance" : "⚠️ Negative balance"}</div>
          </div>
        </section>

        {/* MAIN SECTION */}
        <div className="dashboard-main">
          {/* ADD FORM */}
          <section className="form-section">
            <div className="section-title">Add Transaction</div>
            <div className="section-subtitle">Record your income or expense</div>
            <form onSubmit={handleAddTransaction} className="transaction-form">
              <div className="form-group">
                <label>Amount (Rs)</label>
                <input type="number" step="0.01" placeholder="0.00" value={amount}
                  onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" placeholder="e.g. Food, Salary, Rent" value={category}
                  onChange={(e) => setCategory(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">💸 Expense</option>
                  <option value="income">💰 Income</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <button type="submit" className="form-submit-btn" disabled={loading}>
                {loading ? "⏳ Adding..." : "＋ Add Transaction"}
              </button>
            </form>
          </section>

          {/* CHARTS */}
          <section className="charts-section">
            <div className="chart-wrapper">
              <div className="section-title">Income vs Expense</div>
              <div className="chart-inner">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>
            <div className="chart-wrapper">
              <div className="section-title">Expense Breakdown</div>
              {Object.keys(expenseCategories).length > 0 ? (
                <div className="chart-inner">
                  <Pie data={pieData} options={chartOptions} />
                </div>
              ) : (
                <div className="no-chart-data">
                  <span>📊</span>
                  No expense data yet
                </div>
              )}
            </div>
          </section>
        </div>

        {/* TRANSACTIONS TABLE */}
        <section className="table-section">
          <div className="table-header">
            <div>
              <div className="section-title">Recent Transactions</div>
              <div className="section-subtitle">All your recorded transactions</div>
            </div>
            <span className="table-count">{transactions.length} entries</span>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-state">
              <span>📋</span>
              No transactions yet. Add your first one!
            </div>
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
                    <td>{new Date(t.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td>
                      <span className="category-badge">
                        {getCategoryIcon(t.category)} {t.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-tag ${t.type}`}>{t.type === "income" ? "↑ Income" : "↓ Expense"}</span>
                    </td>
                    <td>
                      <span className={t.type === "income" ? "amount-income" : "amount-expense"}>
                        {t.type === "income" ? "+" : "-"} {fmt(Number(t.amount))}
                      </span>
                    </td>
                    <td>
                      <button className="delete-btn" onClick={() => handleDelete(t.id)}>
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
