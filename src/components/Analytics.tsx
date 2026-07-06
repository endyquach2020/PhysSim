/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  ChevronRight,
  Download,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { PhysicsParams, PhysicsState, DataPoint } from '../types';
import { computeForces } from '../utils/physicsEngine';

interface AnalyticsProps {
  params: PhysicsParams;
  state: PhysicsState;
  chartData: DataPoint[];
  onClearHistory: () => void;
}

type ChartType = 'all' | 'position' | 'velocity' | 'acceleration';

export const Analytics: React.FC<AnalyticsProps> = ({
  params,
  state,
  chartData,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<ChartType>('velocity');

  // Compute exact force vectors acting at this split second
  const forces = useMemo(() => {
    return computeForces(params, state.position, state.velocity);
  }, [params, state.position, state.velocity]);

  const activeTabClass = (tab: ChartType) =>
    `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
      activeTab === tab
        ? 'bg-blue-600 text-white shadow-md border border-blue-500/20'
        : 'bg-slate-950/40 text-slate-400 border border-slate-850/60 hover:bg-slate-950/70 hover:text-slate-200'
    }`;

  // Formatter for export CSV
  const handleExportCSV = () => {
    if (chartData.length === 0) return;
    const headers = 'Time (s),Position (m),Velocity (m/s),Acceleration (m/s^2)\n';
    const rows = chartData
      .map(
        (dp) =>
          `${dp.time.toFixed(3)},${dp.position.toFixed(3)},${dp.velocity.toFixed(3)},${dp.acceleration.toFixed(3)}`
      )
      .join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `physics_lab_data_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/60 shadow-xl">
      {/* 1. Telemetry and forces readout - Left col in desktop */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Activity className="w-4 h-4 text-blue-400" />
            Bảng Số Liệu Trực Quan / Digital Dashboard
          </h3>
          <p className="text-xs text-slate-400">
            Xem chính xác trạng thái vật lý và độ lớn lực tức thời.
          </p>
        </div>

        {/* Live physical properties grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/60 flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Thời Gian (t)</span>
            <span className="text-xl font-bold text-slate-200 font-mono mt-0.5">
              {state.time.toFixed(2)} <span className="text-xs font-sans text-slate-500">s</span>
            </span>
          </div>

          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/60 flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Tọa Độ (x)</span>
            <span className="text-xl font-bold text-blue-400 font-mono mt-0.5">
              {state.position.toFixed(2)} <span className="text-xs font-sans text-slate-500">m</span>
            </span>
          </div>

          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/60 flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Vận Tốc (v)</span>
            <span className="text-xl font-bold text-amber-400 font-mono mt-0.5">
              {state.velocity.toFixed(2)} <span className="text-xs font-sans text-slate-500">m/s</span>
            </span>
          </div>

          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-850/60 flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Gia Tốc (a)</span>
            <span className="text-xl font-bold text-rose-400 font-mono mt-0.5">
              {state.acceleration.toFixed(2)} <span className="text-xs font-sans text-slate-500">m/s²</span>
            </span>
          </div>
        </div>

        {/* Forces Breakdown Card */}
        <div className="bg-slate-950/45 p-4 rounded-xl border border-slate-850/60 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-300">Phân Tích Lực Thành Phần (Newton)</span>
            <span className="text-[9px] bg-slate-900 text-slate-400 border border-slate-800 font-bold px-1.5 py-0.5 rounded font-mono">∑F = m·a</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-mono text-slate-400">
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Lực kéo đẩy (F_k):
              </span>
              <span className="font-bold text-slate-200">
                {forces.appliedForce > 0 ? '+' : ''}
                {forces.appliedForce.toFixed(1)} N
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                Lực ma sát thực tế (F_ms):
              </span>
              <span className="font-bold text-rose-400">
                {forces.frictionForce.toFixed(1)} N
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                Trọng lực dốc (P_||):
              </span>
              <span className="font-bold text-blue-400">
                {forces.gravityParallel.toFixed(1)} N
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Phản lực sàn (N):
              </span>
              <span className="font-bold text-amber-400">
                {forces.normalForce.toFixed(1)} N
              </span>
            </div>

            <div className="flex justify-between py-1.5 bg-slate-900/60 border border-slate-850 px-2 rounded mt-1.5 text-slate-200">
              <span className="font-bold text-slate-300">HỢP LỰC (F_net):</span>
              <span className="font-bold text-sm text-blue-400">
                {forces.netForce > 0 ? '+' : ''}
                {forces.netForce.toFixed(2)} N
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-time graphs - Right col in desktop */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Đồ Thị Khảo Sát Động Học / Real-time Kinematic Plots
            </h3>
            <p className="text-xs text-slate-400">
              Mô tả sự biến thiên của các đại lượng theo thời gian.
            </p>
          </div>

          {/* History Operations */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={handleExportCSV}
              disabled={chartData.length === 0}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Xuất dữ liệu CSV"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={onClearHistory}
              disabled={chartData.length === 0}
              className="px-2.5 py-1.5 bg-rose-950/30 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Xóa lịch sử đồ thị"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1 bg-slate-950/50 p-1.5 rounded-xl border border-slate-850/60 self-start">
          <button
            onClick={() => setActiveTab('position')}
            className={activeTabClass('position')}
          >
            Quãng đường s(t)
          </button>
          <button
            onClick={() => setActiveTab('velocity')}
            className={activeTabClass('velocity')}
          >
            Vận tốc v(t)
          </button>
          <button
            onClick={() => setActiveTab('acceleration')}
            className={activeTabClass('acceleration')}
          >
            Gia tốc a(t)
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={activeTabClass('all')}
          >
            Hợp nhất tất cả
          </button>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-64 bg-slate-950/60 rounded-xl border border-slate-850/60 p-2 relative flex items-center justify-center">
          {chartData.length === 0 ? (
            <div className="flex flex-col items-center gap-1 text-center max-w-sm">
              <Activity className="w-8 h-8 text-slate-700 animate-pulse" />
              <p className="text-xs font-semibold text-slate-500">Chưa có dữ liệu đồ thị</p>
              <p className="text-[10px] text-slate-600">
                Ấn nút <strong>Bắt đầu</strong> để cho vật chuyển động và ghi nhận dữ liệu liên tục trên đồ thị thực tế.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity="0.6" />
                <XAxis
                  dataKey="time"
                  tickFormatter={(val) => `${val.toFixed(1)}s`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  stroke="#334155"
                  label={{ value: 't (s)', position: 'insideBottomRight', offset: -5, fill: '#64748b', fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} stroke="#334155" />
                <Tooltip
                  labelFormatter={(lbl) => `Thời gian: ${Number(lbl).toFixed(2)}s`}
                  contentStyle={{
                    fontSize: '11px',
                    borderRadius: '8px',
                    backgroundColor: '#090d16',
                    borderColor: '#1e293b',
                    color: '#f1f5f9',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />

                {/* Conditional Lines Based on selected Tab */}
                {(activeTab === 'all' || activeTab === 'position') && (
                  <Line
                    type="monotone"
                    dataKey="position"
                    name="Quãng đường s (m)"
                    stroke="#3b82f6" // blue-500 neon
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'velocity') && (
                  <Line
                    type="monotone"
                    dataKey="velocity"
                    name="Vận tốc v (m/s)"
                    stroke="#f59e0b" // amber-500 neon
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {(activeTab === 'all' || activeTab === 'acceleration') && (
                  <Line
                    type="monotone"
                    dataKey="acceleration"
                    name="Gia tốc a (m/s²)"
                    stroke="#f43f5e" // rose-500 neon
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Physical Interpretation Box */}
        <div className="bg-blue-950/20 rounded-xl p-3 border border-blue-900/40 text-xs text-blue-300 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <p className="leading-relaxed font-sans">
            {activeTab === 'position' && (
              <>
                <strong>Giải nghĩa đồ thị s(t):</strong> + Quãng đường tăng nhanh theo hình parabol chỉ chuyển động nhanh dần đều. + Đường thẳng chỉ chuyển động thẳng đều. + Đường nằm ngang biểu thị vật đang đứng yên.
              </>
            )}
            {activeTab === 'velocity' && (
              <>
                <strong>Giải nghĩa đồ thị v(t):</strong> + Đoạn xiên đi lên chỉ chuyển động tăng tốc (gia tốc dương). + Đoạn xiên đi xuống chỉ chuyển động giảm tốc (gia tốc âm). + Đoạn nằm ngang chỉ chuyển động thẳng đều.
              </>
            )}
            {activeTab === 'acceleration' && (
              <>
                <strong>Giải nghĩa đồ thị a(t):</strong> + Giá trị gia tốc không đổi cho thấy một chuyển động biến đổi đều ổn định. + Gia tốc bằng 0 nghĩa là lực kéo cân bằng với lực cản (ma sát + trọng lực dốc) hoặc vật đứng yên.
              </>
            )}
            {activeTab === 'all' && (
              <>
                <strong>Mối quan hệ động học:</strong> Hệ số góc (độ dốc) của đồ thị s-t chính là vận tốc v. Độ dốc của đồ thị v-t chính là gia tốc a. Cả 3 đại lượng đều liên hệ chặt chẽ qua Định luật II Newton.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
