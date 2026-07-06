/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Stage } from './components/Stage';
import { Controls } from './components/Controls';
import { Analytics } from './components/Analytics';
import { PresetManager } from './components/PresetManager';
import { PhysicsParams, PhysicsState, DataPoint, Preset } from './types';
import { stepPhysics, computeForces } from './utils/physicsEngine';
import { PRESETS } from './constants/presets';
import { Info, Sparkles, X, RotateCcw } from 'lucide-react';

export default function App() {
  // 1. Core Parameter and Initial Position States (Synced with LocalStorage)
  const [params, setParams] = useState<PhysicsParams>(() => {
    const saved = localStorage.getItem('physsim_current_params');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      mass: 5.0,
      force: 25.0,
      friction: 0.15,
      angle: 15.0,
      gravity: 9.8,
    };
  });

  const [initialPosition, setInitialPosition] = useState<number>(() => {
    const saved = localStorage.getItem('physsim_initial_position');
    if (saved) {
      try {
        return parseFloat(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return 1.0;
  });

  // 2. Real-time Kinematic State of the block
  const [state, setState] = useState<PhysicsState>({
    time: 0,
    position: 1.0,
    velocity: 0,
    acceleration: 0,
    status: 'idle',
  });

  // 3. Real-time charting history
  const [chartData, setChartData] = useState<DataPoint[]>([]);

  // 4. View Customization Toggles
  const [showVectors, setShowVectors] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [showValues, setShowValues] = useState(true);
  const [showCharts, setShowCharts] = useState(true);

  // 5. Toast / Notifications List
  const [toasts, setToasts] = useState<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  }[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync parameters & initial position to LocalStorage when changed
  useEffect(() => {
    localStorage.setItem('physsim_current_params', JSON.stringify(params));
    localStorage.setItem('physsim_initial_position', initialPosition.toString());
  }, [params, initialPosition]);

  // Adjust current block position instantly when initialPosition slider is dragged in idle/finished state
  useEffect(() => {
    if (state.status !== 'running') {
      const forces = computeForces(params, initialPosition, 0);
      setState({
        time: 0,
        position: initialPosition,
        velocity: 0,
        acceleration: forces.acceleration,
        status: 'idle',
      });
      // Establish initial graph dot
      setChartData([
        {
          time: 0,
          position: initialPosition,
          velocity: 0,
          acceleration: forces.acceleration,
        },
      ]);
    }
  }, [initialPosition, params]);

  // 6. Main High-Precision Physics Step Loop using requestAnimationFrame
  const lastStateStatusRef = useRef(state.status);
  lastStateStatusRef.current = state.status;

  useEffect(() => {
    if (state.status !== 'running') return;

    let lastTimestamp = performance.now();
    let animationFrameId: number;

    const runLoop = (now: number) => {
      // Delta time in seconds
      let dt = (now - lastTimestamp) / 1000;
      
      // Safety bounds for dt (limits jump when browser is unfocused / tab active switching)
      if (dt > 0.04) {
        dt = 0.016; // default 60fps frame
      }
      lastTimestamp = now;

      setState((current) => {
        if (current.status !== 'running') return current;

        const { nextState, forces } = stepPhysics(params, current, dt, 20.0);

        // Check if just finished to throw appropriate pedagogical toast notifications
        if (nextState.status === 'finished' && current.status === 'running') {
          if (nextState.position >= 20.0) {
            addToast('Vật chạm biên giới hạn PHẢI (20.0 m) của đường chạy!', 'warning');
          } else if (nextState.position <= 0.0) {
            addToast('Vật chạm biên giới hạn TRÁI (0.0 m) của đường chạy!', 'warning');
          } else {
            addToast('Vật đã dừng lại hoàn toàn do lực ma sát cản hết động năng!', 'success');
          }
        }

        // Limit chart updates slightly to keep graphing library performant
        setChartData((prev) => {
          const lastPoint = prev[prev.length - 1];
          const shouldAppend =
            !lastPoint ||
            nextState.time - lastPoint.time >= 0.05 ||
            nextState.status === 'finished';

          if (shouldAppend) {
            return [
              ...prev,
              {
                time: nextState.time,
                position: nextState.position,
                velocity: nextState.velocity,
                acceleration: nextState.status === 'finished' ? 0 : forces.acceleration,
              },
            ];
          }
          return prev;
        });

        return nextState;
      });

      animationFrameId = requestAnimationFrame(runLoop);
    };

    animationFrameId = requestAnimationFrame(runLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [state.status, params, addToast]);

  // 7. Interactive Callback Actions
  const handlePlay = useCallback(() => {
    if (state.status === 'finished') return;
    
    setState((current) => ({ ...current, status: 'running' }));
    addToast('Bắt đầu chạy mô phỏng!', 'success');
  }, [state.status, addToast]);

  const handlePause = useCallback(() => {
    setState((current) => ({ ...current, status: 'paused' }));
    addToast('Tạm dừng mô phỏng.', 'info');
  }, [addToast]);

  const handleReset = useCallback(() => {
    const forces = computeForces(params, initialPosition, 0);
    setState({
      time: 0,
      position: initialPosition,
      velocity: 0,
      acceleration: forces.acceleration,
      status: 'idle',
    });
    setChartData([
      {
        time: 0,
        position: initialPosition,
        velocity: 0,
        acceleration: forces.acceleration,
      },
    ]);
    addToast('Đã thiết lập lại trạng thái ban đầu.', 'info');
  }, [params, initialPosition, addToast]);

  const handleStepForward = useCallback(() => {
    if (state.status === 'running' || state.status === 'finished') return;

    const dt = 0.05; // 50ms step size for single frame analysis
    setState((current) => {
      const { nextState, forces } = stepPhysics(params, current, dt, 20.0);

      if (nextState.status === 'finished' && current.status !== 'finished') {
        if (nextState.position >= 20.0) {
          addToast('Vật chạm biên giới hạn PHẢI (20.0 m)!', 'warning');
        } else if (nextState.position <= 0.0) {
          addToast('Vật chạm biên giới hạn TRÁI (0.0 m)!', 'warning');
        } else {
          addToast('Vật đã dừng tĩnh hoàn toàn do ma sát.', 'success');
        }
      }

      setChartData((prev) => [
        ...prev,
        {
          time: nextState.time,
          position: nextState.position,
          velocity: nextState.velocity,
          acceleration: nextState.status === 'finished' ? 0 : forces.acceleration,
        },
      ]);

      return nextState;
    });
  }, [params, state.status, addToast]);

  // Handle Preset Loading
  const handleSelectPreset = useCallback((preset: Preset) => {
    setParams(preset.params);
    setInitialPosition(preset.initialPosition);
    
    const forces = computeForces(preset.params, preset.initialPosition, 0);
    setState({
      time: 0,
      position: preset.initialPosition,
      velocity: 0,
      acceleration: forces.acceleration,
      status: 'idle',
    });
    setChartData([
      {
        time: 0,
        position: preset.initialPosition,
        velocity: 0,
        acceleration: forces.acceleration,
      },
    ]);
    addToast(`Đã tải bài mẫu: ${preset.vietnameseName}`, 'success');
  }, [addToast]);

  const handleClearHistory = useCallback(() => {
    setChartData([
      {
        time: state.time,
        position: state.position,
        velocity: state.velocity,
        acceleration: state.acceleration,
      },
    ]);
    addToast('Đã xóa dữ liệu đồ thị lịch sử.', 'info');
  }, [state, addToast]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 font-sans p-4 md:p-6 lg:p-8 flex flex-col gap-6 w-full relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/5 blur-[120px] pointer-events-none" />

      {/* 1. Scientific Branding Header */}
      <Header />

      {/* 2. Real-time Status Alert / Toast Manager */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
          {toasts.map((t) => {
            const colors = {
              success: 'bg-slate-950/90 border-emerald-500/50 text-emerald-400 shadow-emerald-950/20',
              info: 'bg-slate-950/90 border-blue-500/50 text-blue-400 shadow-blue-950/20',
              warning: 'bg-slate-950/90 border-amber-500/50 text-amber-400 shadow-amber-950/20',
            };
            return (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 ${colors[t.type]} animate-fade-in`}
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <p className="text-[11px] md:text-xs font-semibold leading-relaxed">
                    {t.message}
                  </p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Central Working Board Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10 w-full max-w-7xl mx-auto">
        {/* Left Column: Visual Space + Realtime Plot Analytics (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-6 w-full">
          {/* Main SVG Laboratory Canvas */}
          <Stage
            params={params}
            state={state}
            showVectors={showVectors}
            showGrid={showGrid}
            showRuler={showRuler}
            showValues={showValues}
          />

          {/* Real-time Kinematic Graphs */}
          {showCharts && (
            <Analytics
              params={params}
              state={state}
              chartData={chartData}
              onClearHistory={handleClearHistory}
            />
          )}
        </section>

        {/* Right Column: Dynamic Controller + Lab Templates Manager (4 cols) */}
        <section className="lg:col-span-4 flex flex-col gap-6 w-full">
          {/* Slider Controllers */}
          <Controls
            params={params}
            onChangeParams={setParams}
            state={state}
            initialPosition={initialPosition}
            onChangeInitialPosition={setInitialPosition}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onStepForward={handleStepForward}
            showVectors={showVectors}
            setShowVectors={setShowVectors}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showRuler={showRuler}
            setShowRuler={setShowRuler}
            showValues={showValues}
            setShowValues={setShowValues}
            showCharts={showCharts}
            setShowCharts={setShowCharts}
          />

          {/* Pre-configured Presets & Custom Presets LocalStorage manager */}
          <PresetManager
            currentParams={params}
            currentInitialPos={initialPosition}
            onSelectPreset={handleSelectPreset}
          />
        </section>
      </main>

      {/* 4. Footer credits with help guides */}
      <footer className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-800/60 pt-5 text-xs text-slate-500 relative z-10 max-w-7xl mx-auto">
        <div>
          © 2026 PhysSim Interactive Lab. Được thiết kế tối ưu cho giảng dạy phổ thông.
        </div>
        <div className="flex gap-4">
          <a
            href="#physics-canvas"
            onClick={(e) => {
              e.preventDefault();
              addToast('Đố bạn: Tại góc nghiêng θ = 90°, tại sao lực ma sát Fms lại triệt tiêu về 0?', 'info');
            }}
            className="hover:text-blue-400 font-semibold transition-colors"
          >
            Đố vui Vật lý
          </a>
          <span>|</span>
          <a
            href="#physics-canvas"
            onClick={(e) => {
              e.preventDefault();
              addToast('Hãy thử tải Preset "Cân bằng tĩnh có ma sát" để xem lực ma sát nghỉ tự điều chỉnh độ lớn!', 'info');
            }}
            className="hover:text-blue-400 font-semibold transition-colors"
          >
            Mẹo thực hành
          </a>
        </div>
      </footer>
    </div>
  );
}
