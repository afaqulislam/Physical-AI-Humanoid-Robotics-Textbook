---
id: 1
title: Create Physical AI Textbook Constitution
stage: constitution
date: 2025-12-06
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution", "textbook", "physical-ai", "humanoid-robotics"]
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

Requirements for the Constitution:

1. **Book Purpose & Audience**
   - Teach students, engineers, and AI enthusiasts to design, simulate, control, and deploy humanoid robots using ROS 2, Gazebo, Unity, NVIDIA Isaac, and Vision-Language-Action systems.
   - Define learning objectives, prerequisites, and expected outcomes for each module and chapter.

2. **Modules & Weekly Schedule**
   - Include all four modules and the capstone project, mapped to weeks:
     - Module 1: Robotic Nervous System (ROS 2) – Weeks 3-5
     - Module 2: Digital Twin (Gazebo & Unity) – Weeks 6-7
     - Module 3: AI-Robot Brain (NVIDIA Isaac) – Weeks 8-10
     - Module 4: Vision-Language-Action (VLA) – Weeks 11-12
     - Capstone: Autonomous Humanoid – Week 13
   - Each module should include multiple chapters covering concepts, code examples, hands-on exercises, and simulations.

3. **Content Standards & Guidelines**
   - Accuracy: All formulas, physics, algorithms, and code must be correct and verifiable. Cite sources where applicable.
   - Clarity: Chapters must follow a logical learning progression from fundamentals to advanced topics.
   - Structure: Chapters should include Learning Objectives, Prerequisites, Content (Theory → Examples → Applications), Summary, Exercises, and References.
   - Code: Complete, runnable, safe, and versioned. Prefer widely-used libraries (ROS 2, Python, NumPy, PyTorch).
   - Diagrams & Media: Must include descriptive alt text; images in `/static/img/[chapter-name]/`; SVG preferred.

4. **Docusaurus Frontend & Publishing**
   - Use Docusaurus to build the book site; do not create the folder structure manually.
   - Ensure metadata (`title`, `description`, `keywords`, `sidebar_position`) for every `.md` file.
   - Sidebar hierarchy: Fundamentals → Intermediate → Advanced → Capstone.
   - Optimize for accessibility, search, and performance (fast load, LCP < 2.5s, CLS < 0.1).
   - Use GitHub Pages or Vercel for deployment.

5. **RAG & Personalization Integration**
   - Include placeholders for RAG chatbot content, personalized chapters, and Urdu translation support.
   - Chapters should support integration with Claude Code Subagents and Agent Skills.

6. **Assessment & Capstone Integration**
   - Include weekly projects and exercises aligned with each module.
   - Capstone project should integrate ROS 2, Gazebo/Isaac simulation, VLA, and conversational AI.

7. **Technical Awareness**
   - Include hardware setup notes (RTX PC, Jetson Orin kits, RealSense sensors, edge devices).
   - Include guidance for sim-to-real transfer, latency considerations, cloud vs local labs.

8. **Workflow & Quality Gates**
   - Define Spec-Kit workflow: Constitution → Specification → Plan → Tasks → Implementation.
   - Include ADRs (Architectural Decision Records) for important design choices.
   - Pre-merge gates: Docusaurus build validation, broken link check, code & formula accuracy, accessibility, SEO, performance.

9. **Future-Proofing for Physical AI & Humanoid Robotics**
   - Ensure flexibility to add more modules, chapters, and books in the platform.
   - Maintain templates for personalization, AI-agent integration, and multi-language support.

**Output Requirement:**
- The Constitution should produce a document similar to the reference provided, with sections for Core Principles, Workflow, ADRs, Quality Gates, Deployment, and Governance.
- Include rules, rationale, and detailed technical, educational, and publishing standards.
- Include all hackathon-specific requirements and weekly schedule for modules.

## Response snapshot

Constitution successfully created for the Physical AI & Humanoid Robotics Textbook project with 6 core principles, technical standards, development workflow, and governance rules.

## Outcome

- ✅ Impact: Created complete project constitution defining standards for AI-native technical textbook
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated with new constitution
- 🔁 Next prompts: /sp.specify to create feature specifications
- 🧠 Reflection: Constitution properly defines educational excellence, structured learning, practical implementation, multi-platform integration, accessibility, and future-proofing principles

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - Constitution properly created with all required elements
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A