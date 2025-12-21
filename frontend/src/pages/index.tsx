import type { ReactNode } from 'react';
import React, { useRef } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

// Import new modular CSS files for each section
import heroStyles from '../css/Hero.module.css';
import featuresStyles from '../css/Features.module.css';
import testimonialsStyles from '../css/Testimonials.module.css';
import ctaStyles from '../css/Cta.module.css';
import ChatBot from '../components/ChatBot';


function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={heroStyles.heroBanner}>
      <div className={heroStyles.heroContent}>
        <Heading as="h1" className={heroStyles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={heroStyles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={heroStyles.buttonsContainer}>
          <Link
            className={heroStyles.primaryButton}
            to="/docs/intro">
            Start Learning - 5min ⏱️
            <span className={heroStyles.buttonIcon}>→</span>
          </Link>
          <Link
            className={heroStyles.secondaryButton}
            to="/docs/intro">
            Browse Curriculum
            <span className={heroStyles.buttonIcon}>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function FeaturesSection() {
  return (
    <section className={featuresStyles.featuresSection}>
      <div className="container padding-vert--lg">
        <Heading as="h2" className={featuresStyles.sectionTitle}>
          Master Humanoid Robotics in 4 Modules
        </Heading>

        <div className={featuresStyles.featuresGrid}>
          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>1</div>
            <Heading as="h3">Weeks 1-2: Foundations</Heading>
            <p>
              Explore Physical AI & Embodied Intelligence. Understand how AI
              systems interact with the physical world through sensorimotor
              learning.
            </p>
            <Link to="/docs/week-1-2-foundations-of-physical-ai">
              Start with Foundations →
            </Link>
          </div>

          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>2</div>
            <Heading as="h3">Weeks 3-5: ROS 2</Heading>
            <p>
              Master the Robot Operating System for building complex humanoid
              robot applications. Learn nodes, topics, services, and URDF.
            </p>
            <Link to="/docs/module-1-ros2/chapter-1-introduction-to-ros2">
              Begin ROS 2 Journey →
            </Link>
          </div>

          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>3</div>
            <Heading as="h3">Weeks 6-7: Digital Twins</Heading>
            <p>
              Simulate and test humanoid robots in realistic virtual
              environments using Gazebo and Unity for physics simulation.
            </p>
            <Link to="/docs/module-2-digital-twin/chapter-1-gazebo-physics-simulation">
              Enter Virtual Worlds →
            </Link>
          </div>

          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>4</div>
            <Heading as="h3">Weeks 8-10: NVIDIA Isaac</Heading>
            <p>
              Leverage GPU-accelerated robotics frameworks. Learn Isaac Sim,
              Isaac ROS, and Nav2 for humanoid motion planning.
            </p>
            <Link to="/docs/module-3-isaac/chapter-1-isaac-sim-photoreal-simulation">
              Access Isaac Platform →
            </Link>
          </div>

          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>5</div>
            <Heading as="h3">Weeks 11-13: VLA & AI</Heading>
            <p>
              Implement voice-activated autonomous systems using Whisper,
              LLMs, and human-robot interaction techniques.
            </p>
            <Link to="/docs/module-4-vla-humanoids/chapter-1-whisper-voice-commands">
              Enable Voice AI →
            </Link>
          </div>

          <div className={featuresStyles.featureCard}>
            <div className={featuresStyles.cardNumber}>6</div>
            <Heading as="h3">Capstone: Autonomous Humanoid</Heading>
            <p>
              Apply all learned concepts to build a complete autonomous
              humanoid robot with integrated perception and control.
            </p>
            <Link to="/docs/capstone">
              Build Your Robot →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className={testimonialsStyles.testimonialsSection}>
      <div className="container padding-vert--lg">
        <Heading as="h2" className={testimonialsStyles.sectionTitle}>
          Success Stories
        </Heading>
        <div className={testimonialsStyles.testimonialsGrid}>
          <div className={testimonialsStyles.testimonialCard}>
            <div className={testimonialsStyles.stars}>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
            </div>
            <div className={testimonialsStyles.quoteIcon}>“</div>
            <p className={testimonialsStyles.testimonialContent}>"The Physical AI foundations module helped me understand embodied intelligence in ways that transformed my research. The progression to digital twins was seamless and practical."</p>
            <div className={testimonialsStyles.avatarContainer}>
              <h3 className={testimonialsStyles.avatarName}>Dr. Elena Rodriguez</h3>
              <small className={testimonialsStyles.avatarTitle}>Research Scientist</small>
            </div>
          </div>
          <div className={testimonialsStyles.testimonialCard}>
            <div className={testimonialsStyles.stars}>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
            </div>
            <div className={testimonialsStyles.quoteIcon}>“</div>
            <p className={testimonialsStyles.testimonialContent}>"The ROS 2 to NVIDIA Isaac pathway was perfectly structured. I built my first humanoid manipulation system in just 10 weeks. The curriculum delivers real results."</p>
            <div className={testimonialsStyles.avatarContainer}>
              <h3 className={testimonialsStyles.avatarName}>James Park</h3>
              <small className={testimonialsStyles.avatarTitle}>Robotics Developer</small>
            </div>
          </div>
          <div className={testimonialsStyles.testimonialCard}>
            <div className={testimonialsStyles.stars}>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
              <span className={testimonialsStyles.star}>★</span>
            </div>
            <div className={testimonialsStyles.quoteIcon}>“</div>
            <p className={testimonialsStyles.testimonialContent}>"The VLA module opened my eyes to the future of human-robot interaction. Integrating LLMs with physical systems felt like magic, but the curriculum made it technically rigorous."</p>
            <div className={testimonialsStyles.avatarContainer}>
              <h3 className={testimonialsStyles.avatarName}>Priya Sharma</h3>
              <small className={testimonialsStyles.avatarTitle}>AI Engineer</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function CallToAction() {
  return (
    <section className={ctaStyles.callToAction}>
      <div className={ctaStyles.ctaContainer}>
        <Heading as="h2" className={ctaStyles.ctaTitle}>Begin Your Journey to Humanoid Robotics Mastery</Heading>
        <p className={ctaStyles.ctaSubtitle}>Join thousands of students and professionals building the future of embodied AI systems</p>
        <div className={ctaStyles.buttonsContainer}>
          <Link
            className={ctaStyles.ctaButton}
            to="/docs/intro">
            Start Learning Now
            <span className={ctaStyles.buttonIcon}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      description="Comprehensive textbook on Physical AI and Humanoid Robotics - From digital AI to robots that understand physical laws">
      <HomepageHeader />
      <main>
        <ChatBot />
        <FeaturesSection />
        <TestimonialsSection />
        <CallToAction />
      </main>
    </Layout>
  );
}
