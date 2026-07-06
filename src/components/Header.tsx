/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Atom, HelpCircle, GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-850 shadow-xl">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse">
          <Atom className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              PhysSim <span className="text-blue-400 font-normal">Interactive Lab</span>
            </h1>
            <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-500/15 border border-blue-500/35 text-blue-400 rounded-full shadow-sm">
              Thực Hành Vật Lý Ảo
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed mt-1">
            Khám phá động lực học chất điểm: Định luật Newton, dốc nghiêng có ma sát, và rơi tự do trong môi trường thí nghiệm ảo 60FPS độ chính xác cao.
          </p>
        </div>
      </div>

      {/* Guide/Badge overlay */}
      <div className="flex items-center gap-3 text-xs font-medium text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 self-stretch md:self-auto">
        <GraduationCap className="w-5 h-5 text-blue-400 shrink-0" />
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Đối tượng</span>
          <span className="text-slate-300 font-bold text-[11px]">Giáo viên & Học sinh</span>
        </div>
      </div>
    </header>
  );
};
