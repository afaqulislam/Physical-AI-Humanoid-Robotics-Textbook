# Data Model: Physical AI & Humanoid Robotics Textbook

**Date**: 2025-12-06
**Feature**: 001-physical-ai-textbook
**Modeler**: Claude Code

## Overview

This document defines the data model for the Physical AI & Humanoid Robotics textbook content structure. Since this is a static documentation site, the "data model" represents the content organization and metadata structure.

## Core Entities

### Textbook Module
- **Description**: Major section of the textbook representing a learning module
- **Attributes**:
  - `id`: Unique identifier (e.g., "module-1-ros2", "module-2-digital-twin")
  - `title`: Display title (e.g., "Module 1: ROS 2", "Module 2: Digital Twin")
  - `weeks`: Duration in weeks (e.g., "Weeks 3-5", "Weeks 6-7")
  - `description`: Brief description of the module focus
  - `learningObjectives`: Array of learning objectives for the module
  - `prerequisites`: Array of prerequisite knowledge areas
  - `chapters`: Array of chapter references in order

### Textbook Chapter
- **Description**: Individual chapter within a module
- **Attributes**:
  - `id`: Unique identifier (e.g., "introduction-to-ros2", "gazebo-physics-simulation")
  - `title`: Display title
  - `moduleId`: Reference to parent module
  - `learningObjectives`: Array of specific learning objectives
  - `prerequisites`: Array of specific prerequisites for this chapter
  - `content`: Main content body (Markdown)
  - `examples`: Array of code example references
  - `exercises`: Array of exercise references
  - `diagrams`: Array of diagram/image references
  - `references`: Array of external references and citations

### Learning Content
- **Description**: The actual educational material including theory, examples, and exercises
- **Attributes**:
  - `id`: Unique identifier
  - `chapterId`: Reference to parent chapter
  - `type`: Content type ("theory", "example", "exercise", "diagram", "summary")
  - `title`: Content section title
  - `content`: Content body (Markdown format)
  - `order`: Display order within the chapter
  - `metadata`: Additional metadata (tags, difficulty, estimated time)

### Code Example
- **Description**: Runnable code snippets and examples
- **Attributes**:
  - `id`: Unique identifier
  - `chapterId`: Reference to parent chapter
  - `title`: Example title
  - `description`: Brief description of what the example demonstrates
  - `language`: Programming language ("python", "bash", "yaml", etc.)
  - `code`: The actual code content
  - `safetyNotes`: Any safety warnings for hardware interaction
  - `dependencies`: Required dependencies and versions
  - `testScript`: Reference to validation script if applicable

### Diagram/Image Asset
- **Description**: Visual content including diagrams, illustrations, and photos
- **Attributes**:
  - `id`: Unique identifier
  - `filename`: File name in static directory
  - `altText`: Accessibility alt text
  - `title`: Descriptive title
  - `description`: Detailed description
  - `chapterId`: Reference to associated chapter
  - `usageContext`: Where the image is used (content section)

### Hardware Configuration
- **Description**: Documentation for hardware requirements and setup options
- **Attributes**:
  - `id`: Unique identifier (e.g., "workstation-setup", "edge-kit", "premium-lab")
  - `title`: Configuration title
  - `type`: Configuration type ("workstation", "edge-kit", "lab-option")
  - `specifications`: Detailed hardware specifications
  - `costEstimate`: Approximate cost
  - `complexity`: Difficulty level (beginner, intermediate, advanced)
  - `useCases`: Scenarios where this configuration is appropriate
  - `tradeoffs`: Advantages and disadvantages

## Content Validation Rules

### Module-Level Validation
- Each module must have 1-3 learning objectives
- Each module must specify prerequisites
- Each module must contain at least 1 chapter
- Module titles must follow the pattern: "Module X: [Name]" or "Weeks X-Y: [Name]"

### Chapter-Level Validation
- Each chapter must have 3-5 specific learning objectives
- Each chapter must specify prerequisites
- Each chapter must contain theory content
- Each chapter should include at least 1 code example
- Each chapter should include at least 1 exercise
- Each chapter must have a summary section

### Content-Level Validation
- All content must be in Markdown format
- All images must have alt text
- All code examples must be properly formatted with language specification
- All external references must be properly cited
- Content must use SI units and standard terminology as specified in the Constitution

## State Transitions

### Content Creation Workflow
1. **Draft** → Content is being written
2. **Review** → Content is under review by subject matter experts
3. **Approved** → Content has passed review and is ready for publication
4. **Published** → Content is live on the platform

### Validation Requirements
- Draft content must pass basic structural validation
- Review content must pass technical accuracy validation
- Approved content must pass accessibility and performance validation
- Published content must maintain all validation requirements

## Relationships

- Module (1) → Chapter (Many)
- Chapter (1) → Learning Content (Many)
- Chapter (1) → Code Example (Many)
- Chapter (1) → Diagram/Image Asset (Many)
- Course (1) → Hardware Configuration (Many)