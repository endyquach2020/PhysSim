/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PhysicsParams {
  mass: number;       // kg (e.g., 1 to 20)
  force: number;      // N (e.g., -50 to 50 or 0 to 100)
  friction: number;   // coefficient mu (e.g., 0 to 1)
  angle: number;      // incline angle in degrees (e.g., 0 to 90)
  gravity: number;    // m/s^2 (default 9.8)
}

export interface PhysicsState {
  time: number;          // seconds elapsed
  position: number;      // meters (e.g., 0 to 20)
  velocity: number;      // m/s
  acceleration: number;  // m/s^2
  status: 'idle' | 'running' | 'paused' | 'finished';
}

export interface DataPoint {
  time: number;          // s
  position: number;      // m
  velocity: number;      // m/s
  acceleration: number;  // m/s^2
}

export interface Preset {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  vietnameseDescription: string;
  params: PhysicsParams;
  initialPosition: number;
}
