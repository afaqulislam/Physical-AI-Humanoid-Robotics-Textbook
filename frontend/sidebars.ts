import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // Custom sidebar for the Physical AI & Humanoid Robotics textbook
  textbookSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: [
        'intro',
        'week-1-2-foundations-of-physical-ai',
        'week-1-2-sensor-systems'
      ],
      collapsed: false
    },
    {
      type: 'category',
      label: 'Module 1: ROS 2 (Weeks 3-5)',
      items: [
        'module-1-ros2/chapter-1-introduction-to-ros2',
        'module-1-ros2/chapter-2-nodes-and-topics',
        'module-1-ros2/chapter-3-services-actions-parameters',
        'module-1-ros2/chapter-4-urdf-for-humanoids',
        'module-1-ros2/chapter-5-launch-files-packages'
      ],
      collapsed: false
    },
    {
      type: 'category',
      label: 'Module 2: Digital Twin (Weeks 6-7)',
      items: [
        'module-2-digital-twin/chapter-1-gazebo-physics-simulation',
        'module-2-digital-twin/chapter-2-unity-visualization',
        'module-2-digital-twin/chapter-3-sensor-simulation'
      ],
      collapsed: false
    },
    {
      type: 'category',
      label: 'Module 3: NVIDIA Isaac (Weeks 8-10)',
      items: [
        'module-3-isaac/chapter-1-isaac-sim-photoreal-simulation',
        'module-3-isaac/chapter-2-isaac-ros-acceleration-stack',
        'module-3-isaac/chapter-3-nav2-humanoid-motion-planning'
      ],
      collapsed: false
    },
    {
      type: 'category',
      label: 'Module 4: VLA & Humanoids (Weeks 11-13)',
      items: [
        'module-4-vla-humanoids/chapter-1-whisper-voice-commands',
        'module-4-vla-humanoids/chapter-2-cognitive-planning-using-llms',
        'module-4-vla-humanoids/chapter-3-human-robot-interaction-capstone'
      ],
      collapsed: false
    },
    {
      type: 'doc',
      id: 'hardware-requirements'
    },
    {
      type: 'doc',
      id: 'capstone'
    }
  ]
};

export default sidebars;
