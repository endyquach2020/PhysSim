/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Save,
  Trash2,
  Undo,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Preset, PhysicsParams } from '../types';
import { PRESETS } from '../constants/presets';

interface PresetManagerProps {
  currentParams: PhysicsParams;
  currentInitialPos: number;
  onSelectPreset: (preset: Preset) => void;
}

export const PresetManager: React.FC<PresetManagerProps> = ({
  currentParams,
  currentInitialPos,
  onSelectPreset,
}) => {
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load custom presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('physsim_custom_presets');
    if (saved) {
      try {
        setCustomPresets(JSON.parse(saved));
      } catch (e) {
        console.error('Lỗi khi khôi phục thiết lập mẫu:', e);
      }
    }
  }, []);

  // Save a new custom preset
  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;

    const newPreset: Preset = {
      id: `custom-${Date.now()}`,
      name: newPresetName.trim(),
      vietnameseName: newPresetName.trim(),
      description: 'Custom experiment saved by user.',
      vietnameseDescription: 'Thiết lập thí nghiệm tùy chỉnh do người dùng tạo.',
      params: { ...currentParams },
      initialPosition: currentInitialPos,
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('physsim_custom_presets', JSON.stringify(updated));
    setNewPresetName('');
    
    setSuccessMessage('Đã lưu thiết lập thành công!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Delete a custom preset
  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('physsim_custom_presets', JSON.stringify(updated));
  };

  return (
    <div className="w-full flex flex-col gap-5 bg-slate-900/40 backdrop-blur-md p-5 rounded-2xl border border-slate-800/60 shadow-xl">
      {/* 1. Header */}
      <div>
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <GraduationCap className="w-4 h-4 text-blue-400" />
          Mẫu Thí Nghiệm / Lab Experiment Templates
        </h3>
        <p className="text-xs text-slate-400">
          Chọn một bài thí nghiệm mẫu có sẵn hoặc tự lưu thông số của riêng bạn.
        </p>
      </div>

      {/* 2. List of standard presets */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-blue-400" />
          Bài Thí Nghiệm Mẫu Hệ Thống
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="group p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950/75 hover:border-blue-500/45 transition-all cursor-pointer flex flex-col gap-1.5 shadow-md"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="font-bold text-xs text-slate-200 group-hover:text-blue-400 transition-colors">
                  {preset.vietnameseName}
                </span>
                <span className="text-[9px] font-mono text-blue-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded shrink-0">
                  {preset.params.angle}° / μ={preset.params.friction}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {preset.vietnameseDescription}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Custom saved presets from LocalStorage */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Thiết Lập Tự Lưu Của Bạn (LocalStorage)
        </h4>

        {customPresets.length === 0 ? (
          <div className="p-4 text-center rounded-xl border border-dashed border-slate-800 bg-slate-950/10 text-slate-500 text-xs leading-relaxed">
            Chưa có thiết lập tùy chỉnh nào được lưu. Hãy kéo thanh trượt điều chỉnh ở bảng điều khiển và nhấn "Lưu thí nghiệm" phía dưới!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="group p-3 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-950/75 hover:border-amber-500/45 transition-all cursor-pointer flex justify-between items-center shadow-md"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-xs text-slate-200 group-hover:text-amber-400">
                    {preset.vietnameseName}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">
                    m={preset.params.mass}kg | F={preset.params.force}N | μ={preset.params.friction} | θ={preset.params.angle}°
                  </span>
                </div>

                <button
                  onClick={(e) => handleDeletePreset(preset.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-all cursor-pointer"
                  title="Xóa thiết lập"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <hr className="border-slate-800/80" />

      {/* 4. Form to save current settings */}
      <form onSubmit={handleSavePreset} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
            Lưu thiết lập thanh trượt hiện tại làm bài mẫu
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ví dụ: Thí nghiệm dốc 30 độ lực đẩy lớn..."
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              className="flex-1 bg-slate-950/60 border border-slate-800 focus:border-blue-500/80 focus:bg-slate-950 text-xs px-3.5 py-2 rounded-xl outline-none transition-all placeholder:text-slate-650 text-slate-100"
            />
            <button
              type="submit"
              disabled={!newPresetName.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shrink-0 transition-all cursor-pointer border border-blue-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              Lưu Mẫu
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-900/40 p-2.5 rounded-lg animate-fade-in">
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
};
