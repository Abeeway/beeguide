import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'quick-start/intro',
      label: 'Quick Start',
    },
    {
      type: 'category',
      label: 'Abeeway Devices',
      link: {
        type: 'generated-index',
        title: 'Abeeway Devices',
        description: 'Product briefs',
      },
      items: [
        'devices/combo-compact'
      ],
    },
    {
      type: 'category',
      label: 'Payload Format',
      link: {
        type: 'generated-index',
        title: 'Payload Format',
        description: 'Payload reference for uplink and downlink messages.',
      },
      items: [
        'payload-format/uplink-messages', 
        'payload-format/downlink-messages'
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      link: {
        type: 'generated-index',
        title: 'Configuration',
        description: 'Tracker behavior and feature configuration guides.',
      },
      items: [
        'configuration/intro',
        'configuration/beehive',
        'configuration/beequeen',
      ],
    },
    {
      type: 'category',
      label: 'Integration',
      link: {
        type: 'generated-index',
        title: 'Integration',
        description: 'Network server integration guides and best practices.',
      },
      items: [
        // 'integration/intro',
        'integration/intro',
        'integration/lorawan',
        'integration/cellular',
      ],
    },
  ],
};

export default sidebars;
