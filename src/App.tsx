import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  History, 
  LogOut, 
  Search, 
  Filter,
  PieChart as PieChartIcon,
  TrendingUp,
  Wallet,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Transaction, TransactionType } from './types';
import { cn, formatCurrency } from './lib/utils';

// --- MOCK DATA ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'income', amount: 5000000, category: 'Gaji', date: '2024-04-01', note: 'Gaji Bulanan' },
  { id: '2', type: 'expense', amount: 500000, category: 'Makanan', date: '2024-04-02', note: 'Makan Siang Resto' },
  { id: '3', type: 'expense', amount: 200000, category: 'Transport', date: '2024-04-03', note: 'Bensin & Tol' },
  { id: '4', type: 'income', amount: 1500000, category: 'Freelance', date: '2024-04-05', note: 'Proyek Website' },
  { id: '5', type: 'expense', amount: 1200000, category: 'Belanja', date: '2024-04-07', note: 'Beli Sepatu Baru' },
  { id: '6', type: 'expense', amount: 300000, category: 'Hiburan', date: '2024-04-10', note: 'Nonton Bioskop' },
];

const CATEGORIES = {
  income: ['Gaji', 'Freelance', 'Bonus', 'Investasi', 'Lainnya'],
  expense: ['Makanan', 'Transport', 'Belanja', 'Hiburan', 'Utilitas', 'Kesehatan', 'Pendidikan', 'Lainnya']
};

// --- COMPONENTS ---

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("stat-card rounded-2xl overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled
}: { 
  children: React.ReactNode, 
  onClick?: () => void, 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost',
  className?: string,
  disabled?: boolean
}) => {
  const variants = {
    primary: "accent-gradient text-white shadow-lg shadow-indigo-500/20",
    secondary: "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700",
    danger: "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30",
    ghost: "bg-transparent text-slate-400 hover:bg-slate-800"
  };
  
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2.5 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'charts'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // --- LOGIN LOGIC ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    // Group by date for the area chart
    const groups: { [key: string]: { date: string, income: number, expense: number } } = {};
    
    transactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = { date: t.date, income: 0, expense: 0 };
      }
      if (t.type === 'income') groups[t.date].income += t.amount;
      else groups[t.date].expense += t.amount;
    });

    return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // --- ACTIONS ---
  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = {
      ...newTx,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions([tx, ...transactions]);
    setShowAddModal(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-200">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 glass backdrop-blur-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 accent-gradient rounded-2xl shadow-xl shadow-indigo-500/20">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">KasDigital</h1>
            <p className="text-slate-400 text-center mb-8 text-sm">Catat setiap rupiah, raih kemapanan finansial.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Email</label>
                <input 
                  type="email" 
                  defaultValue="user@kasdigital.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="masukkan email anda"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Password</label>
                <input 
                  type="password" 
                  defaultValue="password123"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
              <Button className="w-full mt-2">Masuk Sekarang</Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex font-sans text-slate-200">
      {/* --- SIDEBAR --- */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass border-r border-slate-800 transition-transform lg:relative lg:translate-x-0",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 accent-gradient rounded-lg shadow-lg shadow-indigo-500/20">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">KasDigital</span>
          </div>

          <nav className="flex-1 space-y-1">
            <NavItem 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="Dashboard" 
            />
            <NavItem 
              active={activeTab === 'transactions'} 
              onClick={() => setActiveTab('transactions')} 
              icon={<History size={20} />} 
              label="Riwayat" 
            />
            <NavItem 
              active={activeTab === 'charts'} 
              onClick={() => setActiveTab('charts')} 
              icon={<PieChartIcon size={20} />} 
              label="Laporan" 
            />
          </nav>

          <button 
            onClick={() => setIsLoggedIn(false)}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-medium mt-auto"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 transition-all bg-slate-900/50">
        {/* Header */}
        <header className="h-20 glass border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-white capitalize">
              {activeTab === 'dashboard' ? 'Ringkasan Keuangan' : activeTab}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={() => setShowAddModal(true)} className="hidden sm:flex">
              <Plus size={20} />
              <span>Tambah Transaksi</span>
            </Button>
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
          
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard 
                    label="Total Saldo" 
                    value={stats.balance} 
                    icon={<Wallet className="text-indigo-400" />}
                    trend="+12% dlm seminggu"
                    color="indigo"
                  />
                  <StatCard 
                    label="Pemasukan" 
                    value={stats.totalIncome} 
                    icon={<ArrowUpRight className="text-indigo-400" />}
                    color="indigo"
                  />
                  <StatCard 
                    label="Pengeluaran" 
                    value={stats.totalExpense} 
                    icon={<ArrowDownLeft className="text-purple-400" />}
                    color="purple"
                  />
                </div>

                {/* Main Graph */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-white">Tren Keuangan</h3>
                      <p className="text-sm text-slate-500">Perbandingan pemasukan vs pengeluaran</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                         <span className="text-xs font-medium text-slate-400">Masuk</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                         <span className="text-xs font-medium text-slate-400">Keluar</span>
                       </div>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#64748b' }} 
                          tickFormatter={(str) => format(new Date(str), 'dd MMM')}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} hide />
                        <Tooltip 
                          contentStyle={{ background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                          itemStyle={{ color: '#f1f5f9' }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorIncome)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expense" 
                          stroke="#a855f7" 
                          strokeWidth={2} 
                          fillOpacity={1}
                          fill="url(#colorExpense)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-white">Transaksi Terakhir</h3>
                      <button onClick={() => setActiveTab('transactions')} className="text-indigo-400 text-sm font-medium flex items-center gap-1">
                        Lihat Semua <ChevronRight size={16} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {transactions.slice(0, 5).map((tx) => (
                        <TransactionItem key={tx.id} transaction={tx} />
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-bold mb-6 text-white">Alokasi Pengeluaran</h3>
                    <div className="space-y-6">
                      {['Makanan', 'Transport', 'Belanja'].map((cat, i) => {
                        const total = transactions
                          .filter(t => t.category === cat && t.type === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0);
                        const percentage = Math.round((total / stats.totalExpense) * 100) || 0;
                        const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500'];
                        
                        return (
                          <div key={cat} className="space-y-2">
                            <div className="flex items-center justify-between text-sm font-medium">
                              <span className="text-slate-300">{cat}</span>
                              <span className="text-slate-500 font-mono italic">{formatCurrency(total)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={cn("h-full", colors[i])} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div 
                key="transactions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl border border-slate-800">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="text" 
                      placeholder="Cari transaksi..."
                      className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="secondary" className="flex-1 py-2 text-sm">
                      <Filter size={16} />
                      Filter
                    </Button>
                    <Button onClick={() => setShowAddModal(true)} className="flex-1 py-2 text-sm sm:hidden">
                      <Plus size={16} />
                      Tambah
                    </Button>
                  </div>
                </div>

                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-800/30 text-slate-500 text-xs uppercase tracking-wider font-bold">
                          <th className="px-6 py-4">Tanggal</th>
                          <th className="px-6 py-4">Kategori & Catatan</th>
                          <th className="px-6 py-4 text-right">Jumlah</th>
                          <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-400">
                                {format(new Date(tx.date), 'dd MMM yyyy')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                <span className="text-sm font-bold text-white block">{tx.category}</span>
                                <span className="text-xs text-slate-500 block italic">{tx.note}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={cn(
                                "text-sm font-bold font-mono",
                                tx.type === 'income' ? "text-indigo-400" : "text-rose-400"
                              )}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button 
                                onClick={() => deleteTransaction(tx.id)}
                                className="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

            {activeTab === 'charts' && (
              <motion.div 
                key="charts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-center h-[60vh]"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 glass bg-slate-800/50 rounded-full flex items-center justify-center mx-auto text-slate-600 border-slate-700">
                    <PieChartIcon size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Modul Laporan</h3>
                  <p className="text-slate-500 max-w-xs mx-auto text-sm">
                    Analisis mendalam pengeluaran bulanan akan segera hadir dengan visualisasi canggih.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* --- ADD TRANSACTION MODAL --- */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass bg-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Catat Transaksi Baru</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              
              <AddTransactionForm onAdd={addTransaction} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 accent-gradient text-white rounded-2xl shadow-xl shadow-indigo-500/30 flex items-center justify-center z-40 active:scale-90 transition-all font-bold"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
        active 
          ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm" 
          : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <motion.div layoutId="nav-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />}
    </button>
  );
}

function StatCard({ label, value, icon, trend, color }: { label: string, value: number, icon: React.ReactNode, trend?: string, color: string }) {
  const bgColors = {
    indigo: "bg-indigo-500/10 text-indigo-400",
    purple: "bg-purple-500/10 text-purple-400",
    rose: "bg-rose-500/10 text-rose-400"
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", bgColors[color as keyof typeof bgColors] || bgColors.indigo)}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-bold tracking-tight font-mono text-white">{formatCurrency(value)}</h4>
    </Card>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  
  return (
    <div className="flex items-center gap-4 group">
       <div className={cn(
         "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-slate-800 transition-all group-hover:scale-105",
         isIncome ? "bg-indigo-500/10 text-indigo-400" : "bg-purple-500/10 text-purple-400"
       )}>
         {isIncome ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
       </div>
       <div className="flex-1 min-w-0">
          <h5 className="text-sm font-bold truncate text-slate-200">{transaction.category}</h5>
          <p className="text-xs text-slate-500 truncate italic">{transaction.note}</p>
       </div>
       <div className="text-right">
          <p className={cn(
            "text-sm font-bold font-mono",
            isIncome ? "text-indigo-400" : "text-purple-400"
          )}>
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
          <p className="text-[10px] text-slate-500">{format(new Date(transaction.date), 'dd MMM')}</p>
       </div>
    </div>
  );
}

function AddTransactionForm({ onAdd }: { onAdd: (tx: Omit<Transaction, 'id'>) => void }) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !date) return;
    
    onAdd({
      type,
      amount: parseInt(amount),
      category,
      date,
      note: note || category
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Type Toggle */}
      <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800">
        <button 
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
            type === 'expense' ? "bg-slate-800 text-purple-400 shadow-sm shadow-purple-500/10" : "text-slate-500"
          )}
        >
          Pengeluaran
        </button>
        <button 
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={cn(
            "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
            type === 'income' ? "bg-slate-800 text-indigo-400 shadow-sm shadow-indigo-500/10" : "text-slate-500"
          )}
        >
          Pemasukan
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jumlah (Rp)</label>
          <input 
            type="number" 
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-4xl font-bold font-mono bg-transparent outline-none text-white focus:text-indigo-400 transition-colors placeholder:text-slate-800"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tanggal</label>
            <input 
              type="date" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
            <select 
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
            >
              <option value="">Pilih...</option>
              {CATEGORIES[type].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Catatan (Opsional)</label>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition-all font-medium h-24 resize-none"
            placeholder="Keterangan transaksi..."
          />
        </div>
      </div>

      <Button className="w-full py-4 text-base">Simpan Transaksi</Button>
    </form>
  );
}
