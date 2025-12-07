---
id: 2
title: Amend Physical AI Textbook Constitution
stage: constitution
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "textbook", "physical-ai", "humanoid-robotics", "amendment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

You are tasked with creating the **Constitution for an AI-native technical textbook** on "Physical AI & Humanoid Robotics." This Constitution must define all rules, standards, and workflows for writing the book before generating any content. The output should be structured, detailed, and ready to produce a document similar to the reference Constitution provided below.

The Constitution must ensure that the textbook includes **all chapters, sub-modules, weekly topics, hardware requirements, lab setups, and exercises** as specified in this document. Every module, chapter, and learning objective listed below must appear in the final textbook.

Requirements for the Constitution:

1. **Book Focus, Purpose & Audience**
   - Theme: AI Systems in the Physical World, Embodied Intelligence.
   - Goal: Bridge the gap between digital brain and physical body; students apply AI knowledge to control humanoid robots in simulated and real-world environments.
   - Audience: Students, engineers, and AI enthusiasts learning to design, simulate, control, and deploy humanoid robots using ROS 2, Gazebo, Unity, NVIDIA Isaac, and Vision-Language-Action systems.
   - Learning Objectives: Cover all Physical AI principles, ROS 2 control, Gazebo/Unity simulation, NVIDIA Isaac development, humanoid robot design, and GPT-integrated conversational robotics.

2. **Quarter Overview & Weekly Breakdown**
   - Weeks 1-2: Introduction to Physical AI
     - Foundations of Physical AI and embodied intelligence
     - From digital AI to robots that understand physical laws
     - Overview of humanoid robotics landscape
     - Sensor systems: LIDAR, cameras, IMUs, force/torque sensors
   - Weeks 3-5: Module 1 – The Robotic Nervous System (ROS 2)
     - Focus: Middleware for robot control
     - Topics: ROS 2 nodes, topics, services, actions
     - Bridging Python agents to ROS controllers using `rclpy`
     - Understanding URDF (Unified Robot Description Format) for humanoids
     - ROS 2 package development project
   - Weeks 6-7: Module 2 – The Digital Twin (Gazebo & Unity)
     - Focus: Physics simulation and environment building
     - Topics: Simulating physics, gravity, collisions in Gazebo
     - High-fidelity rendering and human-robot interaction in Unity
     - Simulating sensors: LiDAR, Depth Cameras, and IMUs
     - Gazebo simulation implementation project
   - Weeks 8-10: Module 3 – The AI-Robot Brain (NVIDIA Isaac)
     - Focus: Advanced perception and training
     - Topics: NVIDIA Isaac Sim photorealistic simulation and synthetic data generation
     - Isaac ROS: Hardware-accelerated VSLAM and navigation
     - Nav2 path planning for bipedal humanoid movement
     - Reinforcement learning for robot control
     - Sim-to-real transfer techniques
     - Isaac-based perception pipeline project
   - Weeks 11-12: Module 4 – Vision-Language-Action (VLA)
     - Focus: Convergence of LLMs and robotics
     - Voice-to-Action using OpenAI Whisper
     - Cognitive planning: translating natural language commands into ROS 2 actions
     - Humanoid robot kinematics, dynamics, bipedal locomotion, balance control, manipulation and grasping, human-robot interaction design
   - Week 13: Capstone Project – The Autonomous Humanoid
     - Integrate ROS 2, Gazebo/Isaac simulation, VLA, and conversational AI
     - Robot receives voice command, plans path, navigates obstacles, identifies objects using computer vision, and manipulates them

3. **Content Standards & Guidelines**
   - Accuracy: All formulas, physics, algorithms, and code must be correct and verifiable. Cite sources where applicable.
   - Clarity: Chapters must follow a logical learning progression from fundamentals to advanced topics.
   - Structure: Chapters must include Learning Objectives, Prerequisites, Content (Theory → Examples → Applications), Summary, Exercises, and References.
   - Code: Complete, runnable, safe, and versioned. Prefer widely-used libraries (ROS 2, Python, NumPy, PyTorch).
   - Diagrams & Media: Include descriptive alt text; images in `/static/img/[chapter-name]/`; SVG preferred.

4. **Hardware Requirements & Lab Architecture**
   - Module-specific hardware setups: RTX-enabled workstation (Isaac Sim/Gazebo/Unity), Edge AI Kit (Jetson Orin Nano, RealSense camera, IMU, USB mic), and optional humanoid robot for sim-to-real deployment
   - Lab options:
     - Proxy approach (Unitree Go2 Edu or robotic arm)
     - Miniature humanoid (Hiwonder TonyPi, Unitree G1 or Robotis OP3)
     - Premium lab (Unitree G1 Humanoid)
   - Cloud-based alternatives: AWS RoboMaker, NVIDIA Omniverse Cloud, with Jetson kits for local deployment
   - Emphasize sim-to-real considerations, latency issues, and performance trade-offs

5. **Docusaurus Frontend & Publishing**
   - Build the book site using Docusaurus without manually creating folders
   - Metadata for every `.md` file: `title`, `description`, `keywords`, `sidebar_position`
   - Sidebar hierarchy: Fundamentals → Intermediate → Advanced → Capstone
   - Optimize for accessibility, search, and performance (fast load, LCP < 2.5s, CLS < 0.1)
   - Deploy using GitHub Pages or Vercel

6. **RAG & Personalization Integration**
   - Include placeholders for RAG chatbot content, personalized chapters, and Urdu translation support
   - Chapters should support integration with Claude Code Subagents and Agent Skills

7. **Assessment & Capstone Integration**
   - Weekly projects aligned with each module (ROS 2, Gazebo simulation, Isaac perception pipeline)
   - Capstone project: fully autonomous humanoid with voice, vision, navigation, and manipulation

8. **Workflow & Quality Gates**
   - Spec-Kit workflow: Constitution → Specification → Plan → Tasks → Implementation
   - ADRs (Architectural Decision Records) for key design choices
   - Pre-merge gates: Docusaurus build validation, broken link checks, code & formula verification, accessibility, SEO, performance

9. **Future-Proofing for Physical AI & H

## Response snapshot

Constitution successfully updated to version 1.0.1 with detailed weekly breakdowns, hardware requirements, and enhanced learning objectives for the Physical AI & Humanoid Robotics Textbook project.

## Outcome

- ✅ Impact: Updated constitution with detailed module breakdowns, hardware requirements, and lab architecture
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated to version 1.0.1
- 🔁 Next prompts: /sp.specify to create feature specifications
- 🧠 Reflection: Constitution now includes comprehensive weekly schedule with specific topics, hardware requirements, and enhanced focus on Physical AI and embodied intelligence

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - Constitution properly updated with all required elements
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A