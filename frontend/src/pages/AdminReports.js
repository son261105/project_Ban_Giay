import React, { useEffect, useState, useMemo } from 'react';
import { AdminLayout } from './AdminDashboard';
import {
  getRevenueByDayRange,
  getRevenueByMonthRange,
  getTopProducts
} from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList
} from 'recharts';

const ACCENT = '#FF3D00';
const ACCENT2 = '#FFD600';
const DARK = '#111111';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

// Rút gọn số tiền lớn cho gọn trục Y / nhãn cột, ví dụ 12.000.000 -> "12tr"
const formatCompact = (p) => {
  const n = Number(p) || 0;
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return String(n);
};

const KpiCard = ({ title, value, sub, trend, color }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)', flex: 1, minWidth: 200 }}>
    <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', color: '#888', marginBottom: 10 }}>{title}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: color || DARK, marginBottom: 6 }}>{value}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 18 }}>
      {trend != null && Number.isFinite(trend) && (
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: trend >= 0 ? '#16a34a' : '#dc2626',
          background: trend >= 0 ? '#dcfce7' : '#fee2e2',
          borderRadius: 20, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4
        }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </span>
      )}
      {sub && <span style={{ fontSize: 12, color: '#aaa' }}>{sub}</span>}
    </div>
  </div>
);

const SegmentedControl = ({ options, value, onChange }) => (
  <div style={{ display: 'inline-flex', background: '#f0f0f0', borderRadius: 10, padding: 4, gap: 2 }}>
    {options.map(opt => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          border: 'none', cursor: 'pointer', borderRadius: 8, padding: '7px 16px',
          fontSize: 13, fontWeight: 700, transition: 'all .2s',
          background: value === opt.value ? DARK : 'transparent',
          color: value === opt.value ? 'white' : '#666'
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ChartTooltip = ({ active, payload, label, unitLabel }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: DARK, color: 'white', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-hover)' }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div>Doanh thu: <b style={{ color: ACCENT2 }}>{formatPrice(d.revenue)}</b></div>
      <div style={{ color: '#bbb' }}>{d.totalOrders} {unitLabel || 'đơn'} (không tính đã hủy)</div>
    </div>
  );
};

const ChartCard = ({ title, headerExtra, children, empty, emptyText }) => (
  <div style={{ background: 'white', borderRadius: 16, padding: 28, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <h2 style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</h2>
      {headerExtra}
    </div>
    {empty ? (
      <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>{emptyText || 'Chưa có dữ liệu'}</div>
    ) : children}
  </div>
);

const AdminReports = () => {
  const currentYear = new Date().getFullYear();

  const [dayRangeMode, setDayRangeMode] = useState(7); // 7 hoặc 30
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [dayData, setDayData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topProductMetric, setTopProductMetric] = useState('quantity'); // 'quantity' | 'revenue'
  const [loading, setLoading] = useState(true);

  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [d, m, t] = await Promise.all([
        getRevenueByDayRange(dayRangeMode),
        getRevenueByMonthRange(selectedYear),
        getTopProducts()
      ]);
      setDayData(d.data.data || []);
      setMonthData(m.data.data || []);
      setTopProducts(t.data.topProducts || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [dayRangeMode, selectedYear]);

  // Chuẩn hoá dữ liệu ngày: nhãn ngắn dạng "24/06"
  const dayChartData = useMemo(() => dayData.map(item => {
    const [, mo, da] = item.date.split('-');
    return { ...item, label: `${da}/${mo}` };
  }), [dayData]);

  // Chuẩn hoá dữ liệu tháng: nhãn "Th1".."Th12"
  const monthChartData = useMemo(() => monthData.map(item => ({
    ...item, label: `Th${item.month}`
  })), [monthData]);

  // KPI: tổng + so sánh kỳ trước (nửa đầu vs nửa sau của dãy ngày đang xem)
  const dayKpi = useMemo(() => {
    if (dayChartData.length === 0) return { total: 0, totalOrders: 0, trend: null };
    const total = dayChartData.reduce((s, x) => s + x.revenue, 0);
    const totalOrders = dayChartData.reduce((s, x) => s + x.totalOrders, 0);
    const mid = Math.floor(dayChartData.length / 2);
    const firstHalf = dayChartData.slice(0, mid).reduce((s, x) => s + x.revenue, 0);
    const secondHalf = dayChartData.slice(mid).reduce((s, x) => s + x.revenue, 0);
    const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : (secondHalf > 0 ? 100 : 0);
    return { total, totalOrders, trend };
  }, [dayChartData]);

  // KPI tháng: tổng năm + so sánh tháng hiện tại với tháng trước (nếu đang xem năm hiện tại)
  const monthKpi = useMemo(() => {
    if (monthChartData.length === 0) return { total: 0, totalOrders: 0, trend: null };
    const total = monthChartData.reduce((s, x) => s + x.revenue, 0);
    const totalOrders = monthChartData.reduce((s, x) => s + x.totalOrders, 0);
    const isCurrentYear = selectedYear === currentYear;
    let trend = null;
    if (isCurrentYear) {
      const nowIdx = new Date().getMonth(); // 0-based -> tháng hiện tại
      const prevIdx = nowIdx - 1;
      if (prevIdx >= 0) {
        const cur = monthChartData[nowIdx]?.revenue ?? 0;
        const prev = monthChartData[prevIdx]?.revenue ?? 0;
        trend = prev > 0 ? ((cur - prev) / prev) * 100 : (cur > 0 ? 100 : 0);
      }
    }
    return { total, totalOrders, trend };
  }, [monthChartData, selectedYear, currentYear]);

  const sortedTopProducts = useMemo(() => {
    const arr = [...topProducts];
    arr.sort((a, b) => topProductMetric === 'quantity'
      ? b.total_quantity - a.total_quantity
      : b.total_revenue - a.total_revenue);
    return arr.map(p => ({
      ...p,
      shortName: p.product_name.length > 18 ? p.product_name.slice(0, 18) + '…' : p.product_name
    }));
  }, [topProducts, topProductMetric]);

  const topColors = [ACCENT, '#FF6B35', '#FF9A5C', '#FFB380', '#FFD6B8'];

  return (
    <AdminLayout>
      <h1 className="page-title" style={{ marginBottom: 32 }}>BÁO CÁO / THỐNG KÊ</h1>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <>
          {/* Doanh thu theo ngày */}
          <ChartCard
            title="DOANH THU THEO NGÀY"
            headerExtra={
              <SegmentedControl
                value={dayRangeMode}
                onChange={setDayRangeMode}
                options={[{ value: 7, label: '7 ngày' }, { value: 30, label: '30 ngày' }]}
              />
            }
            empty={dayChartData.every(d => d.revenue === 0)}
            emptyText="Chưa có doanh thu trong khoảng thời gian này"
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <KpiCard title="Tổng doanh thu" value={formatPrice(dayKpi.total)} color={ACCENT} trend={dayKpi.trend} sub="so với nửa đầu kỳ" />
              <KpiCard title="Tổng số đơn" value={dayKpi.totalOrders} sub={`trong ${dayRangeMode} ngày`} />
            </div>
            <ResponsiveContainer width="100%" height={dayRangeMode === 30 ? 320 : 280}>
              <BarChart data={dayChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#888' }}
                  axisLine={{ stroke: '#eee' }}
                  tickLine={false}
                  interval={dayRangeMode === 30 ? 3 : 0}
                />
                <YAxis
                  tickFormatter={formatCompact}
                  tick={{ fontSize: 11, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,61,0,0.06)' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={dayRangeMode === 30 ? 18 : 36}>
                  {dayChartData.map((entry, idx) => (
                    <Cell key={idx} fill={idx === dayChartData.length - 1 ? ACCENT : '#FFD0BB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Doanh thu theo tháng */}
          <ChartCard
            title="DOANH THU THEO THÁNG"
            headerExtra={
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="form-input"
                style={{ width: 'auto' }}
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            }
            empty={monthChartData.every(d => d.revenue === 0)}
            emptyText={`Chưa có doanh thu trong năm ${selectedYear}`}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <KpiCard title={`Tổng doanh thu năm ${selectedYear}`} value={formatPrice(monthKpi.total)} color={ACCENT} trend={monthKpi.trend} sub={monthKpi.trend != null ? 'so với tháng trước' : null} />
              <KpiCard title="Tổng số đơn" value={monthKpi.totalOrders} sub={`trong năm ${selectedYear}`} />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={monthChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#888' }} axisLine={{ stroke: '#eee' }} tickLine={false} />
                <YAxis tickFormatter={formatCompact} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<ChartTooltip unitLabel="đơn" />} cursor={{ fill: 'rgba(255,61,0,0.06)' }} />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={42}>
                  {monthChartData.map((entry, idx) => (
                    <Cell key={idx} fill={(selectedYear === currentYear && idx === new Date().getMonth()) ? ACCENT : '#FFD0BB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Top 5 sản phẩm bán chạy */}
          <ChartCard
            title="TOP 5 SẢN PHẨM BÁN CHẠY"
            headerExtra={
              <SegmentedControl
                value={topProductMetric}
                onChange={setTopProductMetric}
                options={[{ value: 'quantity', label: 'Theo số lượng' }, { value: 'revenue', label: 'Theo doanh thu' }]}
              />
            }
            empty={topProducts.length === 0}
            emptyText="Chưa có dữ liệu đơn hàng"
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={sortedTopProducts}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                <XAxis
                  type="number"
                  tickFormatter={topProductMetric === 'quantity' ? (v) => v : formatCompact}
                  tick={{ fontSize: 11, fill: '#888' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 13, fill: '#333', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={150}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,61,0,0.06)' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: DARK, color: 'white', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: 'var(--shadow-hover)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.product_name}</div>
                        <div>Đã bán: <b style={{ color: ACCENT2 }}>{d.total_quantity} đôi</b></div>
                        <div style={{ color: '#bbb' }}>Doanh thu: {formatPrice(d.total_revenue)}</div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey={topProductMetric === 'quantity' ? 'total_quantity' : 'total_revenue'}
                  radius={[0, 8, 8, 0]}
                  maxBarSize={28}
                >
                  {sortedTopProducts.map((entry, idx) => (
                    <Cell key={idx} fill={topColors[idx] || '#f0f0f0'} />
                  ))}
                  <LabelList
                    dataKey={topProductMetric === 'quantity' ? 'total_quantity' : 'total_revenue'}
                    position="right"
                    formatter={topProductMetric === 'quantity' ? (v) => `${v} đôi` : formatCompact}
                    style={{ fontSize: 12, fontWeight: 700, fill: DARK }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
