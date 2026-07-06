/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Preset } from '../types';

export const PRESETS: Preset[] = [
  {
    id: 'flat-frictionless',
    name: 'Horizontal Frictionless Motion',
    vietnameseName: 'Chuyển Động Trơn Trên Sàn Ngang',
    description: 'An object sliding on a horizontal, frictionless surface with a constant applied force (Newton\'s 1st & 2nd Laws).',
    vietnameseDescription: 'Vật trượt trên mặt phẳng ngang không ma sát với lực tác dụng không đổi (Minh họa Định luật I và II Newton).',
    initialPosition: 1.0,
    params: {
      mass: 5.0,
      force: 10.0,
      friction: 0.0,
      angle: 0.0,
      gravity: 9.8,
    }
  },
  {
    id: 'flat-friction',
    name: 'Overcoming Sliding Friction',
    vietnameseName: 'Đẩy Vật Có Lực Ma Sát Trượt',
    description: 'A block pushed against friction on a rough floor. Shows how friction opposes movement and can bring a moving body to rest.',
    vietnameseDescription: 'Đẩy vật trên sàn nhám có lực ma sát. Quan sát ma sát cản trở chuyển động và hãm phanh làm vật dừng lại.',
    initialPosition: 2.0,
    params: {
      mass: 8.0,
      force: 30.0,
      friction: 0.25,
      angle: 0.0,
      gravity: 9.8,
    }
  },
  {
    id: 'sliding-downhill',
    name: 'Sliding Down an Inclined Plane',
    vietnameseName: 'Vật Tự Trượt Xuống Dốc Nghiêng',
    description: 'A block placed near the top of an incline with no applied force. Gravitational pull downhill overcomes friction, causing acceleration.',
    vietnameseDescription: 'Đặt vật ở đỉnh dốc nghiêng mà không tác dụng lực đẩy. Thành phần trọng lực kéo vật tự trượt nhanh dần đều xuống dốc.',
    initialPosition: 18.0,
    params: {
      mass: 6.0,
      force: 0.0,
      friction: 0.15,
      angle: 25.0,
      gravity: 9.8,
    }
  },
  {
    id: 'pushing-uphill',
    name: 'Pushing a Block Uphill',
    vietnameseName: 'Đẩy Vật Lên Mặt Phẳng Nghiêng',
    description: 'A high applied force is used to push a heavy block up an inclined plane against both gravity and friction forces.',
    vietnameseDescription: 'Tác dụng lực đẩy lớn để đẩy một khối hộp nặng đi lên dốc nghiêng, thắng cả lực ma sát trượt và thành phần trọng lực cản.',
    initialPosition: 1.0,
    params: {
      mass: 5.0,
      force: 45.0,
      friction: 0.2,
      angle: 15.0,
      gravity: 9.8,
    }
  },
  {
    id: 'free-fall',
    name: 'Free Fall Simulation',
    vietnameseName: 'Thí Nghiệm Rơi Tự Do',
    description: 'An incline of 90 degrees represents free fall. Gravitational force acts fully downhill with zero friction.',
    vietnameseDescription: 'Mặt phẳng nghiêng góc 90 độ tương đương trạng thái rơi tự do. Trọng lực kéo trực tiếp vật rơi xuống mà không có ma sát.',
    initialPosition: 19.0,
    params: {
      mass: 3.0,
      force: 0.0,
      friction: 0.0,
      angle: 90.0,
      gravity: 9.8,
    }
  },
  {
    id: 'unbalanced-equilibrium',
    name: 'Friction Static Equilibrium',
    vietnameseName: 'Cân Bằng Tĩnh Có Ma Sát',
    description: 'An applied force is too small to overcome static friction on a horizontal plane. Net force is zero, keeping the body static.',
    vietnameseDescription: 'Lực kéo quá nhỏ chưa thắng được lực ma sát nghỉ cực đại trên sàn ngang. Hợp lực bằng không và vật đứng yên tĩnh.',
    initialPosition: 5.0,
    params: {
      mass: 10.0,
      force: 15.0,
      friction: 0.3,
      angle: 0.0,
      gravity: 9.8,
    }
  }
];
