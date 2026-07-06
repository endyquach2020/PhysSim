/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { PhysicsParams, PhysicsState } from '../types';
import { computeForces } from '../utils/physicsEngine';

interface StageProps {
  params: PhysicsParams;
  state: PhysicsState;
  showVectors: boolean;
  showGrid: boolean;
  showRuler: boolean;
  showValues: boolean;
}

export const Stage: React.FC<StageProps> = ({
  params,
  state,
  showVectors,
  showGrid,
  showRuler,
  showValues,
}) => {
  const { angle, mass } = params;
  const { position, velocity } = state;

  // Geometry configuration for SVG (800x420 viewport)
  const width = 800;
  const height = 420;
  const trackLengthPx = 600; // Track length in pixels

  // Starting and ending coordinates for the incline track
  // Start near the bottom-left, end near the right/top depending on the angle.
  const startX = 100;
  const startY = 340;

  // Convert angle to radians for calculation
  const angleRad = (angle * Math.PI) / 180;

  // Compute end coordinates based on current angle
  const endX = startX + trackLengthPx * Math.cos(angleRad);
  const endY = startY - trackLengthPx * Math.sin(angleRad);

  // Compute block position in pixel space (based on position 0m to 20m)
  const positionRatio = position / 20.0;
  const blockX = startX + positionRatio * (endX - startX);
  const blockY = startY + positionRatio * (endY - startY);

  // Compute forces to get precise values for vector lengths
  const forces = useMemo(() => {
    return computeForces(params, position, velocity);
  }, [params, position, velocity]);

  // Vector arrow scaling function: square root scaling to keep both small and large forces visible and elegant
  const getVectorLength = (forceVal: number) => {
    if (Math.abs(forceVal) < 0.1) return 0;
    // Base length + proportional length, capped at 120px
    return Math.sign(forceVal) * Math.min(130, 20 + Math.sqrt(Math.abs(forceVal)) * 12);
  };

  // Coordinates and details for each force vector
  const vectors = useMemo(() => {
    if (!showVectors) return [];

    const list = [];

    // 1. Gravity Vector (P) - points straight down globally
    const gravityVal = mass * params.gravity;
    const gravityLen = Math.min(130, 20 + Math.sqrt(gravityVal) * 12);
    list.push({
      id: 'gravity',
      name: 'P (Trọng lực)',
      symbol: 'P',
      x1: blockX,
      y1: blockY,
      x2: blockX,
      y2: blockY + gravityLen,
      color: '#4f46e5', // Indigo-600
      value: `${gravityVal.toFixed(1)} N`,
      description: 'Trọng lực hút thẳng đứng xuống dưới',
    });

    // 2. Normal Force (N) - perpendicular to incline, pointing up-away
    const normalVal = forces.normalForce;
    if (normalVal > 0.05) {
      const normalLen = Math.min(130, 20 + Math.sqrt(normalVal) * 12);
      // Normal vector is perpendicular to incline, so its angle is (angleRad + Math.PI/2) pointing upwards
      // In SVG coordinate system:
      // dx = -normalLen * sin(angleRad)
      // dy = -normalLen * cos(angleRad)
      list.push({
        id: 'normal',
        name: 'N (Phản lực)',
        symbol: 'N',
        x1: blockX,
        y1: blockY,
        x2: blockX - normalLen * Math.sin(angleRad),
        y2: blockY - normalLen * Math.cos(angleRad),
        color: '#f59e0b', // Amber-500
        value: `${normalVal.toFixed(1)} N`,
        description: 'Phản lực vuông góc với mặt tiếp xúc',
      });
    }

    // 3. Applied Force (F_applied) - along incline
    const appForceVal = forces.appliedForce;
    if (Math.abs(appForceVal) > 0.05) {
      const appLen = getVectorLength(appForceVal);
      // Direction along incline: dx = appLen * cos(angle), dy = -appLen * sin(angle)
      list.push({
        id: 'applied',
        name: 'F (Lực kéo)',
        symbol: 'F_k',
        x1: blockX,
        y1: blockY,
        x2: blockX + appLen * Math.cos(angleRad),
        y2: blockY - appLen * Math.sin(angleRad),
        color: '#10b981', // Emerald-500
        value: `${Math.abs(appForceVal).toFixed(1)} N`,
        description: 'Lực đẩy/kéo của người tác dụng dọc mặt dốc',
      });
    }

    // 4. Friction Force (F_friction) - opposing motion or drive along incline
    const frictionVal = forces.frictionForce;
    if (Math.abs(frictionVal) > 0.05) {
      const frictLen = getVectorLength(frictionVal);
      // Direction is already signed along the incline (positive = uphill, negative = downhill)
      list.push({
        id: 'friction',
        name: 'F_ms (Lực ma sát)',
        symbol: 'F_ms',
        x1: blockX,
        y1: blockY,
        x2: blockX + frictLen * Math.cos(angleRad),
        y2: blockY - frictLen * Math.sin(angleRad),
        color: '#f43f5e', // Rose-500
        value: `${Math.abs(frictionVal).toFixed(1)} N`,
        description: 'Lực ma sát cản trở xu hướng chuyển động',
      });
    }

    return list;
  }, [showVectors, blockX, blockY, angleRad, mass, params.gravity, forces]);

  // Generate grid background lines
  const gridLines = useMemo(() => {
    if (!showGrid) return null;
    const lines = [];
    const step = 40;
    for (let x = 0; x < width; x += step) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2,4"
          opacity="0.6"
        />
      );
    }
    for (let y = 0; y < height; y += step) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2,4"
          opacity="0.6"
        />
      );
    }
    return lines;
  }, [showGrid]);

  // Generate ruler tick marks and values
  const rulerElements = useMemo(() => {
    if (!showRuler) return null;

    const ticks = [];
    const tickInterval = 2; // Ticks every 2 meters
    const totalMeters = 20;

    for (let m = 0; m <= totalMeters; m += 1) {
      const ratio = m / totalMeters;
      const tX = startX + ratio * (endX - startX);
      const tY = startY + ratio * (endY - startY);

      // Vector perpendicular to track pointing downhill/down-right
      const perpX = Math.sin(angleRad);
      const perpY = Math.cos(angleRad);

      const isMajor = m % tickInterval === 0;
      const tickLength = isMajor ? 12 : 6;

      ticks.push(
        <line
          key={`tick-${m}`}
          x1={tX}
          y1={tY}
          x2={tX + tickLength * perpX}
          y2={tY + tickLength * perpY}
          stroke={isMajor ? '#475569' : '#334155'}
          strokeWidth={isMajor ? 1.5 : 1}
        />
      );

      if (isMajor) {
        ticks.push(
          <text
            key={`text-${m}`}
            x={tX + 22 * perpX}
            y={tY + 22 * perpY}
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#64748b"
            className="select-none font-bold"
            transform={angle > 45 ? `rotate(${-angle + 90}, ${tX + 22 * perpX}, ${tY + 22 * perpY})` : undefined}
          >
            {m}m
          </text>
        );
      }
    }

    return ticks;
  }, [showRuler, angleRad, startX, startY, endX, endY, angle]);

  return (
    <div 
      className="relative w-full overflow-hidden bg-slate-950 rounded-xl border border-slate-800 shadow-2xl"
      style={{
        backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      {/* Simulation Info Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-mono shadow-md border border-slate-850">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-slate-300">VẬT LÝ THỰC THỜI</span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-bold">θ = {angle.toFixed(1)}°</span>
        </div>
        {showValues && (
          <div className="bg-slate-900/90 backdrop-blur-md text-slate-100 text-xs px-3 py-2.5 rounded-lg font-mono border border-slate-850 shadow-md flex flex-col gap-1.5">
            <div><span className="text-slate-500">Tọa độ x:</span> <span className="font-bold text-blue-400">{position.toFixed(2)} m</span></div>
            <div><span className="text-slate-500">Vận tốc v:</span> <span className="font-bold text-amber-400">{velocity.toFixed(2)} m/s</span></div>
            <div><span className="text-slate-500">Gia tốc a:</span> <span className="font-bold text-rose-400">{state.acceleration.toFixed(2)} m/s²</span></div>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex flex-col items-end gap-1 text-right text-xs text-slate-500 font-mono">
        <div>Hệ số ma sát μ = {params.friction.toFixed(2)}</div>
        <div>Khối lượng m = {params.mass.toFixed(1)} kg</div>
      </div>

      <svg
        id="physics-canvas"
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        style={{ aspectRatio: `${width}/${height}` }}
      >
        {/* SVG Defs for reusable gradients & marker arrows */}
        <defs>
          {/* Support Wedge Gradient */}
          <linearGradient id="wedgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
          </linearGradient>

          {/* Block Material Gradient - High Tech Cyan/Blue Glow */}
          <linearGradient id="blockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Earth Ground / Concrete Base Gradient */}
          <linearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* Custom markers for force arrows to prevent double line heads */}
          {['applied', 'friction', 'gravity', 'normal'].map((fid) => {
            const colors: Record<string, string> = {
              applied: '#10b981',
              friction: '#f43f5e',
              gravity: '#6366f1',
              normal: '#f59e0b',
            };
            return (
              <marker
                key={`marker-${fid}`}
                id={`arrow-${fid}`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill={colors[fid]} />
              </marker>
            );
          })}
        </defs>

        {/* 1. Background Grid */}
        {gridLines}

        {/* 2. Static Ground level (x=0 floor level) */}
        <rect
          x={0}
          y={startY}
          width={width}
          height={height - startY}
          fill="url(#groundGradient)"
        />
        <line
          x1={0}
          y1={startY}
          x2={width}
          y2={startY}
          stroke="#1e293b"
          strokeWidth="2"
        />

        {/* 3. The Supporting Wedge (inclined wedge of wood/iron supporting the track) */}
        {angle > 0 && angle < 90 && (
          <polygon
            points={`${startX},${startY} ${endX},${startY} ${endX},${endY}`}
            fill="url(#wedgeGradient)"
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {/* 4. Support Pole for 90 degrees vertical falling */}
        {angle === 90 && (
          <line
            x1={startX}
            y1={endY}
            x2={startX}
            y2={startY}
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.8"
          />
        )}

        {/* 5. The Track itself (surface lines) */}
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke="#475569"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* 6. Ruler Ticks & Ticks Numbers */}
        {rulerElements}

        {/* 7. The Sliding Block Object */}
        <g
          id="sliding-block-group"
          transform={`rotate(${-angle}, ${blockX}, ${blockY})`}
        >
          {/* Main Block Box */}
          <rect
            x={blockX - 25}
            y={blockY - 30}
            width={50}
            height={30}
            rx={4}
            fill="url(#blockGradient)"
            stroke="#2563eb"
            strokeWidth="2"
            className="transition-shadow duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-grab active:cursor-grabbing"
          />
          {/* Aesthetic inner detail for block weight */}
          <line
            x1={blockX - 15}
            y1={blockY - 15}
            x2={blockX + 15}
            y2={blockY - 15}
            stroke="#93c5fd"
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.6"
          />
          {/* Label of mass printed on block */}
          <text
            x={blockX}
            y={blockY - 8}
            fontSize="10"
            fontWeight="bold"
            fill="#ffffff"
            textAnchor="middle"
            className="font-mono select-none"
          >
            {mass.toFixed(1)}kg
          </text>
        </g>

        {/* 8. Force Vector Arrows (Drawn globally so their actual directions are realistic) */}
        {showVectors &&
          vectors.map((vec) => {
            const dx = vec.x2 - vec.x1;
            const dy = vec.y2 - vec.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            if (len < 5) return null; // don't draw extremely small arrows to prevent clutter

            // Calculate offset position for labels to prevent overlapping at block center
            const textOffsetFactor = 1.25;
            const labelX = vec.x1 + dx * textOffsetFactor;
            const labelY = vec.y1 + dy * textOffsetFactor;

            return (
              <g key={`vector-${vec.id}`} className="group cursor-help">
                <title>{vec.description}</title>
                {/* Arrow Shaft (Line) */}
                <line
                  x1={vec.x1}
                  y1={vec.y1}
                  x2={vec.x2}
                  y2={vec.y2}
                  stroke={vec.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  markerEnd={`url(#arrow-${vec.id})`}
                />
                
                {/* Hover Glow effect */}
                <line
                  x1={vec.x1}
                  y1={vec.y1}
                  x2={vec.x2}
                  y2={vec.y2}
                  stroke={vec.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0"
                  className="hover:opacity-15 transition-opacity duration-200"
                />

                {/* Force Label Badge background */}
                <rect
                  x={labelX - 18}
                  y={labelY - 10}
                  width="36"
                  height="18"
                  rx="4"
                  fill="#0f172a"
                  stroke={vec.color}
                  strokeWidth="1.5"
                  className="shadow-md filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                />

                {/* Force Label Text */}
                <text
                  x={labelX}
                  y={labelY + 2}
                  fontSize="11"
                  fontWeight="bold"
                  fill={vec.color}
                  textAnchor="middle"
                  className="font-sans select-none"
                >
                  {vec.symbol}
                </text>

                {/* Numerical Value Hover Label */}
                <text
                  x={labelX}
                  y={labelY - 14}
                  fontSize="9.5"
                  fontWeight="bold"
                  fill="#f1f5f9"
                  textAnchor="middle"
                  className="font-mono select-none opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  {vec.value}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
};
