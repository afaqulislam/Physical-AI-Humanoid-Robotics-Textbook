# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-06
**Feature**: 001-physical-ai-textbook
**Guide**: Claude Code

## Overview

This quickstart guide provides the essential steps to set up, develop, and deploy the Physical AI & Humanoid Robotics textbook using Docusaurus.

## Prerequisites

- Node.js LTS (v18 or higher)
- npm or yarn package manager
- Git
- Text editor with Markdown support

## Setup Instructions

### 1. Clone and Initialize the Repository

```bash
# Clone the repository
git clone <repository-url>
cd <repository-name>

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
# OR if using yarn
yarn install
```

### 2. Initialize Docusaurus Project (if not already done)

```bash
# If starting fresh, create new Docusaurus project
npx create-docusaurus@latest frontend classic

# Configure the project for Physical AI & Humanoid Robotics
```

### 3. Configure Docusaurus

Update `docusaurus.config.ts` with the following settings:

```typescript
// docusaurus.config.ts
import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Physical AI & Humanoid Robotics Textbook',
  tagline: 'AI-Native Technical Textbooks',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://physical-ai-humanoid-robotics-textbook-aui.vercel.app',
  baseUrl: '/',

  organizationName: 'physical-ai',
  projectName: 'humanoid-robotics-textbook',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
        },
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/global.css',
          ],
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },

    navbar: {
      title: 'Physical AI & Humanoid Robotics',
      logo: {
        alt: 'Physical AI & Humanoid Robotics Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'textbookSidebar',
          position: 'left',
          label: 'Textbook',
        },
        {
          href: 'https://github.com/afaqulislam/Physical-AI-Humanoid-Robotics-Textbook',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },

    // 🚫 DEFAULT FOOTER REMOVED INTENTIONALLY
    // You are using "CustomFooter" instead

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

```

### 4. Set Up Content Structure

Create the directory structure as defined in the implementation plan:

```bash
# Create content directories
mkdir -p docs/{weeks-1-2-intro,module-1-ros2,module-2-digital-twin,module-3-nvidia-isaac,module-4-vla,exercises}
mkdir -p static/img/{weeks-1-2-intro,module-1-ros2,module-2-digital-twin,module-3-nvidia-isaac,module-4-vla}
mkdir -p examples/{weeks-1-2-intro,module-1-ros2,module-2-digital-twin,module-3-nvidia-isaac,module-4-vla}
mkdir -p src/components
mkdir -p src/pages
```

### 5. Configure Sidebar Navigation

Update `sidebars.ts` to reflect the Constitution modules and chapters:

```typescript
// sidebars.ts
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

```

### 6. Add Custom Components

Create custom components for textbook-specific features (optional):

```bash
# Create a custom component for exercises
touch src/components/Exercise/Exercise.jsx
```

## Development Workflow

### Start Development Server

```bash
cd frontend
npm run start
# OR with specific port
npm run start -- --port 3000
```

### Build for Production

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## Content Creation Guidelines

### Creating a New Chapter

1. Create a new Markdown file in the appropriate module directory
2. Include frontmatter with metadata:

```markdown
---
title: Introduction to ROS 2
description: Learn the fundamentals of ROS 2 for humanoid robotics
tags: [ros2, middleware, robotics]
---

# Introduction to ROS 2

## Learning Objectives

- Understand the core concepts of ROS 2
- Learn about nodes, topics, services, and actions
- Apply ROS 2 concepts to humanoid robot control

## Prerequisites

- Basic understanding of robotics concepts
- Python programming knowledge

## Content

[Your chapter content here]
```

### Adding Code Examples

Use Docusaurus code blocks with proper language specification:

```python
# Example Python code for ROS 2
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
```

### Adding Images

Place images in the appropriate `static/img/` subdirectory and reference them:

```markdown
![Robot Architecture Diagram](/img/module-1-ros2/robot-architecture.png)
```

## Quality Assurance

### Before Publishing Content

1. Run the development server and review the content
2. Check for broken links: `npm run build && npx serve build`
3. Validate accessibility using browser tools
4. Verify code examples run correctly
5. Confirm all learning objectives are addressed

### Performance Testing

```bash
# Build and test locally
npm run build
npx serve build

# Run Lighthouse audit
npx @lhci/cli@0.10.x autorun
```

## Deployment

The textbook can be deployed to various platforms:

- **GitHub Pages**: Use `npm run deploy`
- **Vercel**: Connect repository and configure build settings
- **Netlify**: Connect repository and configure build settings

## Troubleshooting

### Common Issues

- **Missing dependencies**: Run `npm install` or `yarn install`
- **Build errors**: Check syntax in Markdown files and configuration
- **Broken links**: Use relative paths for internal links
- **Image not loading**: Ensure images are in `/static/img/` directory