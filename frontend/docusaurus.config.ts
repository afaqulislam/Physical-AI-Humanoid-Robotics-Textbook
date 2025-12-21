import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
require('dotenv').config(); // Load environment variables


const config: Config = {
  title: 'Physical AI & Humanoid Robotics Textbook',
  tagline: 'AI-Native Technical Textbooks',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://physical-ai-humanoid-robotics-textbook-aui.vercel.app',
  baseUrl: '/',

  organizationName: 'afaqulislam',
  projectName: 'Physical-AI-Humanoid-Robotics-Textbook',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  customFields: {
    bot_api_url: process.env.BOT_API_URL,
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
      defaultMode: 'light',
      disableSwitch: true,
      respectPrefersColorScheme: false,
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
    footer: {
      style: 'light',
      links: [
        {
          title: 'Textbook',
          items: [
            {
              label: 'Introduction',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/afaqulislam/Physical-AI-Humanoid-Robotics-Textbook',
            }
          ],
        },
        {
          title: 'Social Media',
          items: [
            {
              label: 'Linkedin',
              to: 'https://linkedin.com/in/afaqulislam/',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/afaqulislam',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Textbook. Built with ❤️ by <strong>Afaq Ul Islam</strong>.`,
    },

    prism: {
      theme: prismThemes.github,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
