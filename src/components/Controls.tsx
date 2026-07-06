/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Info,
  Layers,
  Grid,
  Ruler,
  TrendingUp,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { PhysicsParams, PhysicsState } from '../types';

interface ControlsProps {
  params: PhysicsParams;
  onChangeParams: (newParams: PhysicsParams) => void;
  state: PhysicsState;
  initialPosition: number;
  onChangeInitialPosition: (pos: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  
  // Toggle displays
  showVectors: boolean;
  setShowVectors: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showRuler: boolean;
  setShowRuler: (val: boolean) => void;
  showValues: boolean;
  setShowValues: (val: boolean) => void;
  showCharts: boolean;
  setShowCharts: (val: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  params,
  onChangeParams,
  state,
  initialPosition,
  onChangeInitialPosition,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  showVectors,
  setShowVectors,
  showGrid,
  setShowGrid,
  showRuler,
  setShowRuler,
  showValues,
  setShowValues,
  showCharts,
  setShowCharts,
}) => {
  const handleSliderChange = (key: keyof PhysicsParams, value: number) => {
    // Prevent modifying parameters while the simulation is actively running (except force for dynamic changes!)
    if (state.status === 'running' && key !== 'force') {
      return;
    }
    onChangeParams({
      ...params,
      [key]: value,
    });
  };

  const isRunning = state.status === 'running';
  const isFinished = state.status === 'finished';

  return (
    <div className="w-full flex flex-col gap-5 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/60 shadow-xl">
      {/* 1. Playback / Interactive Controls */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          Điều khiển Mô phỏng / Simulation Controls
        </h3>
        
        <div className="grid grid-cols-4 gap-2">
          {/* Play / Pause button */}
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl bg-amber-600 text-white font-medium hover:bg-amber-500 transition-all shadow-md cursor-pointer border border-amber-500/30"
            >
              <Pause className="w-4 h-4 fill-current" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Tạm dừng</span>
            </button>
          ) : (
            <button
              onClick={onPlay}
              disabled={isFinished}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl text-white font-medium shadow-lg transition-all cursor-pointer border ${
                isFinished
                  ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 border-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span className="text-[9px] uppercase font-bold tracking-wider">Bắt đầu</span>
            </button>
          )}

          {/* Step Frame (Từng bước) */}
          <button
            onClick={onStepForward}
            disabled={isRunning || isFinished}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border font-medium transition-all cursor-pointer ${
              isRunning || isFinished
                ? 'bg-slate-950/40 border-slate-900 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <SkipForward className="w-4 h-4" />
            <span className="text-[9px] uppercase font-bold tracking-wider">Từng Khung</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="col-span-2 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-950/40 text-rose-400 font-bold hover:bg-rose-900/30 transition-all shadow-md cursor-pointer border border-rose-900/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Thiết lập lại (Reset)</span>
          </button>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* 2. Physics Parameter Sliders */}
      <div className="flex flex-col gap-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          Thông số Vật lý / Physical Parameters
        </h3>

        {/* Warning Badge when Running */}
        {isRunning && (
          <div className="bg-blue-950/40 text-blue-300 rounded-xl p-3 text-xs flex items-start gap-2 border border-blue-900/40 shadow-inner">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Bạn có thể điều chỉnh <strong>Lực kéo (F)</strong> khi mô phỏng đang chạy. Các thông số khác cần tạm dừng hoặc Reset để thay đổi.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Mass (m) Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                Khối lượng / Mass (<span className="text-blue-400 font-mono">m</span>)
              </span>
              <span className="bg-slate-950/60 border border-slate-800 text-blue-400 px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                {params.mass.toFixed(1)} kg
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={params.mass}
              disabled={isRunning}
              onChange={(e) => handleSliderChange('mass', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>1 kg (Nhẹ)</span>
              <span>10 kg</span>
              <span>20 kg (Nặng)</span>
            </div>
          </div>

          {/* Applied Force (F) Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                Lực kéo / Applied Force (<span className="text-emerald-400 font-mono">F_k</span>)
              </span>
              <span className="bg-slate-950/60 border border-slate-800 text-emerald-400 px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                {params.force > 0 ? `+${params.force.toFixed(1)}` : params.force.toFixed(1)} N
              </span>
            </div>
            <input
              type="range"
              min="-40.0"
              max="100.0"
              step="1.0"
              value={params.force}
              onChange={(e) => handleSliderChange('force', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>-40 N (Đẩy ngược)</span>
              <span>0 N (Không lực)</span>
              <span>100 N (Kéo tới)</span>
            </div>
          </div>

          {/* Friction Coefficient (mu) Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                Hệ số ma sát / Friction (<span className="text-rose-400 font-mono">μ</span>)
              </span>
              <span className="bg-slate-950/60 border border-slate-800 text-rose-400 px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                {params.friction.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.00"
              max="1.00"
              step="0.02"
              value={params.friction}
              disabled={isRunning}
              onChange={(e) => handleSliderChange('friction', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.00 (Trơn tuột)</span>
              <span>0.50 (Sàn trung bình)</span>
              <span>1.00 (Nhám thô)</span>
            </div>
          </div>

          {/* Incline Angle (alpha) Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                Góc nghiêng / Incline Angle (<span className="text-amber-400 font-mono">θ</span>)
              </span>
              <span className="bg-slate-950/60 border border-slate-800 text-amber-400 px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                {params.angle.toFixed(1)}°
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="90.0"
              step="1.0"
              value={params.angle}
              disabled={isRunning}
              onChange={(e) => handleSliderChange('angle', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.0° (Nằm ngang)</span>
              <span>45.0° (Dốc xiên)</span>
              <span>90.0° (Rơi đứng)</span>
            </div>
          </div>

          {/* Initial Position Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1">
                Vị trí ban đầu / Initial Position (<span className="text-slate-400 font-mono">x₀</span>)
              </span>
              <span className="bg-slate-950/60 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded font-mono font-bold text-[11px]">
                {initialPosition.toFixed(1)} m
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="20.0"
              step="0.5"
              value={initialPosition}
              disabled={isRunning}
              onChange={(e) => onChangeInitialPosition(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-400 disabled:opacity-40"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>0.0 m (Cận trái)</span>
              <span>10.0 m (Giữa)</span>
              <span>20.0 m (Cận phải)</span>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-800/80" />

      {/* 3. Render Settings / Toggles */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Tùy chọn hiển thị / Display Toggles
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Vectors Toggle */}
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/55 cursor-pointer hover:bg-slate-950/70 transition-all select-none">
            <input
              type="checkbox"
              checked={showVectors}
              onChange={(e) => setShowVectors(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Vector lực (F, N, P, Fms)
            </span>
          </label>

          {/* Grid Toggle */}
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/55 cursor-pointer hover:bg-slate-950/70 transition-all select-none">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Grid className="w-3.5 h-3.5 text-slate-400" />
              Lưới tọa độ (Grid)
            </span>
          </label>

          {/* Ruler Toggle */}
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/55 cursor-pointer hover:bg-slate-950/70 transition-all select-none">
            <input
              type="checkbox"
              checked={showRuler}
              onChange={(e) => setShowRuler(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              Thước đo mét (Ruler)
            </span>
          </label>

          {/* Values Toggle */}
          <label className="flex items-center gap-2.5 p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/55 cursor-pointer hover:bg-slate-950/70 transition-all select-none">
            <input
              type="checkbox"
              checked={showValues}
              onChange={(e) => setShowValues(e.target.checked)}
              className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
            />
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Chỉ số tức thời
            </span>
          </label>
        </div>

        <label className="flex items-center gap-2.5 p-2.5 mt-1 bg-slate-950/40 rounded-xl border border-slate-800/55 cursor-pointer hover:bg-slate-950/70 transition-all select-none text-xs w-full">
          <input
            type="checkbox"
            checked={showCharts}
            onChange={(e) => setShowCharts(e.target.checked)}
            className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
          />
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Biểu đồ phân tích động học / Performance Analytics Chart
          </span>
        </label>
      </div>
    </div>
  );
};
