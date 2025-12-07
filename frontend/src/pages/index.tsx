import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Learning - 5min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/docs/intro">
            Browse Curriculum
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container padding-vert--lg">
        <Heading as="h2" className="text--center padding-bottom--lg">
          Master Humanoid Robotics in 4 Modules
        </Heading>
        <div className="row">
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Weeks 1-2: Foundations</Heading>
              <p>Explore Physical AI & Embodied Intelligence. Understand how AI systems interact with the physical world through sensorimotor learning.</p>
              <Link to="/docs/week-1-2-foundations-of-physical-ai">
                Start with Foundations →
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Weeks 3-5: ROS 2</Heading>
              <p>Master the Robot Operating System for building complex humanoid robot applications. Learn nodes, topics, services, and URDF.</p>
              <Link to="/docs/module-1-ros2/chapter-1-introduction-to-ros2">
                Begin ROS 2 Journey →
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Weeks 6-7: Digital Twins</Heading>
              <p>Simulate and test humanoid robots in realistic virtual environments using Gazebo and Unity for physics simulation.</p>
              <Link to="/docs/module-2-digital-twin/chapter-1-gazebo-physics-simulation">
                Enter Virtual Worlds →
              </Link>
            </div>
          </div>
        </div>
        <div className="row padding-top--md">
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Weeks 8-10: NVIDIA Isaac</Heading>
              <p>Leverage GPU-accelerated robotics frameworks. Learn Isaac Sim, Isaac ROS, and Nav2 for humanoid motion planning.</p>
              <Link to="/docs/module-3-isaac/chapter-1-isaac-sim-photoreal-simulation">
                Access Isaac Platform →
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Weeks 11-13: VLA & AI</Heading>
              <p>Implement voice-activated autonomous systems using Whisper, LLMs, and human-robot interaction techniques.</p>
              <Link to="/docs/module-4-vla-humanoids/chapter-1-whisper-voice-commands">
                Enable Voice AI →
              </Link>
            </div>
          </div>
          <div className="col col--4">
            <div className={clsx('card', styles.featureCard)}>
              <Heading as="h3">Capstone: Autonomous Humanoid</Heading>
              <p>Apply all learned concepts to build a complete autonomous humanoid robot with integrated perception and control.</p>
              <Link to="/docs/capstone">
                Build Your Robot →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LearningOutcomes() {
  return (
    <section className={styles.learningOutcomes}>
      <div className="container padding-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset--2">
            <Heading as="h2" className="text--center padding-bottom--lg">
              What You'll Be Able To Do
            </Heading>
            <ul>
              <li>Design and implement embodied AI systems that understand and interact with the physical world</li>
              <li>Build complex humanoid robot applications using ROS 2 architecture and tools</li>
              <li>Simulate and validate humanoid robot behaviors in realistic digital twin environments</li>
              <li>Deploy GPU-accelerated robotics systems using the NVIDIA Isaac ecosystem</li>
              <li>Create voice-activated autonomous systems that integrate large language models for cognitive planning</li>
              <li>Construct a complete autonomous humanoid robot that integrates perception, planning, and control systems</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className={styles.testimonialsSection}>
      <div className="container padding-vert--lg">
        <Heading as="h2" className="text--center padding-bottom--lg">
          Success Stories
        </Heading>
        <div className="row">
          <div className="col col--4">
            <div className="card text--center">
              <div className="avatar avatar--vertical">
                <div className="avatar__intro">
                  <h3 className="avatar__name">Dr. Elena Rodriguez</h3>
                  <small className="avatar__subtitle">Research Scientist</small>
                </div>
              </div>
              <p>"The Physical AI foundations module helped me understand embodied intelligence in ways that transformed my research. The progression to digital twins was seamless and practical."</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="card text--center">
              <div className="avatar avatar--vertical">
                <div className="avatar__intro">
                  <h3 className="avatar__name">James Park</h3>
                  <small className="avatar__subtitle">Robotics Developer</small>
                </div>
              </div>
              <p>"The ROS 2 to NVIDIA Isaac pathway was perfectly structured. I built my first humanoid manipulation system in just 10 weeks. The curriculum delivers real results."</p>
            </div>
          </div>
          <div className="col col--4">
            <div className="card text--center">
              <div className="avatar avatar--vertical">
                <div className="avatar__intro">
                  <h3 className="avatar__name">Priya Sharma</h3>
                  <small className="avatar__subtitle">AI Engineer</small>
                </div>
              </div>
              <p>"The VLA module opened my eyes to the future of human-robot interaction. Integrating LLMs with physical systems felt like magic, but the curriculum made it technically rigorous."</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.callToAction}>
      <div className="container">
        <Heading as="h2">Begin Your Journey to Humanoid Robotics Mastery</Heading>
        <p>Join thousands of students and professionals building the future of embodied AI systems</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start Learning Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Physical AI & Humanoid Robotics Textbook`}
      description="Comprehensive textbook on Physical AI and Humanoid Robotics - From digital AI to robots that understand physical laws">
      <HomepageHeader />
      <main>
        {/* <HomepageFeatures /> */}
        <FeaturesSection />
        <LearningOutcomes />
        <TestimonialsSection />
        <CallToAction />
      </main>
    </Layout>
  );
}
