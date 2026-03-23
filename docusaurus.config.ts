import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)
const siteBaseUrl = '/beeguide/';

const config: Config = {
  title: 'BeeGuide',
  tagline: 'Quick reference guide for Abeeway trackers',
  favicon: 'img/beeguide-favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://norbertherbert.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: siteBaseUrl,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'norbertherbert', // Usually your GitHub org/user name.
  projectName: 'beeguide', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          showLastUpdateTime: true,
          remarkPlugins: [
            [require('./plugins/remark-firmware-latest-links'), {baseUrl: siteBaseUrl}],
          ],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/norbertherbert/beeguide',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/beeguide-icon-book.svg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'BeeGuide',
      logo: {
        alt: 'BeeGuide Logo',
        src: 'img/beeguide-icon-book.svg',
      },
      items: [
        {
          href: 'https://abeeway.com/',
          label: 'Abeeway',
          position: 'right',
        },
        {
          href: 'https://github.com/Abeeway',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Quick Start',
              to: '/docs/category/quick-start',
            },
            {
              label: 'Firmware Reference Guide',
              to: '/docs/category/firmware-reference-guide',
            },
          ],
        },
        {
          title: 'Abeeway',
          items: [
            {
              label: 'Website',
              href: 'https://abeeway.com/',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/Abeeway',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Abeeway.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
