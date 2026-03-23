import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const appLinks = [
  // {
  //   title: 'BeeGuide',
  //   href: 'https://norbertherbert.github.io/beeguide',
  //   description: 'Quick reference guide',
  // },
  {
    title: 'BeeHive',
    href: 'https://norbertherbert.github.io/beehive',
    description: 'Bluetooth/USB management and debug tool',
    icon: '/img/beehive-icon-small.png',
  },
  {
    title: 'BeeQueen',
    href: 'https://norbertherbert.github.io/beequeen',
    description: 'Configuration editor',
    icon: '/img/beequeen-icon-small.png',
  },
  {
    title: 'AbwBattery',
    href: 'https://norbertherbert.github.io/abeeway-battery',
    description: 'Battery lifetime estimation tool for Abeeway Trackers',
    icon: '/img/abeeway-battery-icon.svg',
  },
  {
    title: 'RelayBattery',
    href: 'https://norbertherbert.github.io/abeeway-relay-battery',
    description: 'Battery lifetime estimation tool for Abeeway Relay',
    icon: '/img/relay-battery-icon.svg',
  },
  {
    title: 'BeeMap',
    href: 'https://norbertherbert.github.io/beemap',
    description: 'Demo map tool for tracking',
    icon: '/img/beemap-icon.svg',
  },
  {
    title: 'PayloadDecoder',
    href: 'https://abeeway.github.io/abeeway-codec/examples/codec-as-browser-module.html',
    description: 'Demo tool for decoding hex-encoded payload',
    icon: '/img/beemap-icon.svg',
  },
];

const legacyAppLinks = [
  {
    title: 'BeeHiveAT2',
    href: 'https://norbertherbert.github.io/beehive-at2',
    description: 'Bluetooth/USB management and debug tool for AT2 Firmware',
    icon: '/img/beehive-icon-small.png',
  },
  {
    title: 'BeeQueenAT2',
    href: 'https://norbertherbert.github.io/beequeen-at2',
    description: 'Configuration editor for AT2 Firmware',
    icon: '/img/beequeen-icon-small.png',
  },
  {
    title: 'TiltMonitor',
    href: 'https://norbertherbert.github.io/tilt-monitoring',
    description: 'Demo tool for tilt monitoring',
    icon: '/img/tilt-monitor-icon.svg',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  const iconUrl = useBaseUrl('/img/beeguide-icon-book.svg');
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
          <img
            src={iconUrl}
            alt="BeeGuide icon"
            className={styles.heroTitleIcon}
          />
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/quick-start/intro">
            Open Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

function AppLinks(): ReactNode {
  return (
    <section className={styles.appSection}>
      <div className="container">
        <div className={styles.appSectionHeader}>
          <Heading as="h2">Abeeway Tools for AT3 Firmware</Heading>
        </div>
        <div className={styles.appGrid}>
          {appLinks.map((app) => (
            <a
              key={app.title}
              href={app.href}
              className={styles.appCard}
              target="_blank"
              rel="noopener noreferrer">
              <Heading as="h3" className={styles.appCardTitle}>
                {app.icon ? (
                  <img
                    src={useBaseUrl(app.icon)}
                    alt={`${app.title} icon`}
                    className={styles.appCardIcon}
                  />
                ) : null}
                {app.title}
              </Heading>
              <p>{app.description}</p>
            </a>
          ))}
        </div>
        <div className={styles.legacySectionHeader}>
          <Heading as="h2">Legacy Tools for AT2 Firmware</Heading>
        </div>
        <div className={styles.appGrid}>
          {legacyAppLinks.map((app) => (
            <a
              key={app.title}
              href={app.href}
              className={styles.appCard}
              target="_blank"
              rel="noopener noreferrer">
              <Heading as="h3" className={styles.appCardTitle}>
                {app.icon ? (
                  <img
                    src={useBaseUrl(app.icon)}
                    alt={`${app.title} icon`}
                    className={styles.appCardIcon}
                  />
                ) : null}
                {app.title}
              </Heading>
              <p>{app.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Abeeway Documentation"
      description="Practical documentation for Abeeway tracker devices and integrations.">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
        <AppLinks />
      </main>
    </Layout>
  );
}
