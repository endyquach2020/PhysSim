/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhysicsParams, PhysicsState } from '../types';

/**
 * Calculates the forces and acceleration for the current physics state.
 * All forces are aligned along the direction of the incline (positive = uphill, negative = downhill).
 * 
 * Incline geometry:
 * - Angle alpha (0 to 90 degrees)
 * - Positive direction: uphill (from left x=0 to right x=20)
 * - Gravity parallel component: F_g_parallel = -m * g * sin(alpha) (pulls downhill)
 * - Normal force: N = m * g * cos(alpha) (perpendicular to surface)
 * - Friction force: F_friction = mu * N = mu * m * g * cos(alpha)
 * - Applied force: F_applied (input by user, parallel to incline)
 */
export interface ForceComponents {
  gravityParallel: number;   // N, parallel to incline (always <= 0)
  gravityNormal: number;     // N, perpendicular to incline (always >= 0)
  normalForce: number;       // N, matches gravityNormal (always >= 0)
  maxFriction: number;       // N, mu * N
  appliedForce: number;      // N, force exerted by user
  frictionForce: number;     // N, actual friction acting on the body
  netForce: number;          // N, total sum of forces along incline
  acceleration: number;      // m/s^2
}

export function computeForces(
  params: PhysicsParams,
  position: number,
  velocity: number
): ForceComponents {
  const { mass, force: F_app, friction: mu, angle, gravity: g } = params;
  
  // Convert angle to radians
  const rad = (angle * Math.PI) / 180;
  
  // Gravity components
  const F_g_parallel = -mass * g * Math.sin(rad); // pulling downhill (negative x)
  const F_g_normal = mass * g * Math.cos(rad);    // pressing into incline
  
  const N = F_g_normal; // normal force
  const F_friction_max = mu * N; // maximum available static/kinetic friction force
  
  let F_friction_act = 0;
  let F_net = 0;
  
  // Active driving force (excluding friction): applied force + gravity parallel component
  const F_drive = F_app + F_g_parallel;
  
  if (velocity === 0) {
    // Static state: friction opposes F_drive up to F_friction_max
    if (Math.abs(F_drive) <= F_friction_max) {
      F_friction_act = -F_drive; // completely cancels driving force
      F_net = 0;
    } else {
      // Overcomes static friction
      F_friction_act = -Math.sign(F_drive) * F_friction_max;
      F_net = F_drive + F_friction_act;
    }
  } else {
    // Dynamic state: kinetic friction opposes direction of velocity
    F_friction_act = -Math.sign(velocity) * F_friction_max;
    F_net = F_drive + F_friction_act;
  }
  
  const acc = F_net / mass;
  
  return {
    gravityParallel: F_g_parallel,
    gravityNormal: F_g_normal,
    normalForce: N,
    maxFriction: F_friction_max,
    appliedForce: F_app,
    frictionForce: F_friction_act,
    netForce: F_net,
    acceleration: acc,
  };
}

/**
 * Updates the physics state for a small time step dt (in seconds).
 * Employs semi-implicit Euler-Cromer integration for numerical stability.
 */
export function stepPhysics(
  params: PhysicsParams,
  currentState: PhysicsState,
  dt: number,
  trackLength: number = 20.0
): { nextState: PhysicsState; forces: ForceComponents } {
  const { position, velocity, time, status } = currentState;
  
  if (status !== 'running') {
    const forces = computeForces(params, position, velocity);
    return { nextState: currentState, forces };
  }
  
  // 1. Compute forces at current state
  const forces = computeForces(params, position, velocity);
  const a = forces.acceleration;
  
  // 2. Compute new velocity
  let v_next = velocity + a * dt;
  let finishedDueToFriction = false;
  
  // 3. Friction cross-over check:
  // If the velocity changed sign in this timestep, it might have stopped due to friction.
  if (velocity !== 0 && Math.sign(velocity) !== Math.sign(v_next)) {
    // Determine if the active driving force can overcome friction in the new direction
    const F_drive = params.force - params.mass * params.gravity * Math.sin((params.angle * Math.PI) / 180);
    if (Math.abs(F_drive) <= forces.maxFriction) {
      // Object stops completely
      v_next = 0;
      finishedDueToFriction = true;
    }
  }
  
  // 4. Update position using average velocity for smoother visuals (trapezoidal rule)
  let x_next = position + 0.5 * (velocity + v_next) * dt;
  
  let nextStatus: 'running' | 'finished' = 'running';
  
  // 5. Boundary checks
  if (x_next >= trackLength) {
    x_next = trackLength;
    v_next = 0;
    nextStatus = 'finished';
  } else if (x_next <= 0) {
    x_next = 0;
    v_next = 0;
    nextStatus = 'finished';
  }
  
  if (finishedDueToFriction) {
    v_next = 0;
    nextStatus = 'finished';
  }
  
  // 6. Final force calculation for the next state
  const nextForces = computeForces(params, x_next, v_next);
  
  return {
    nextState: {
      time: time + dt,
      position: x_next,
      velocity: v_next,
      acceleration: nextStatus === 'finished' ? 0 : nextForces.acceleration,
      status: nextStatus,
    },
    forces: nextForces,
  };
}
