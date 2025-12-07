# Content Contracts: Physical AI & Humanoid Robotics Textbook

## Overview

Since this is a static documentation site using Docusaurus, traditional API contracts don't apply. Instead, this document defines the content contract structure and metadata schema used throughout the textbook.

## Content Metadata Schema

Each content page follows this metadata schema in the frontmatter:

```yaml
---
title: "Page Title"
description: "Brief description for SEO and social sharing"
tags: ["tag1", "tag2", "tag3"]
learningObjectives:
  - "Objective 1"
  - "Objective 2"
prerequisites:
  - "Prerequisite 1"
  - "Prerequisite 2"
date: "YYYY-MM-DD"
---
```

## Content Structure Contract

### Module Structure
- Directory: `/docs/module-[number]-[name]/`
- Required files: At least one chapter file
- Navigation: Auto-generated or manually specified in sidebars.js

### Chapter Structure
- File: `/docs/[module]/[chapter-name].md`
- Required sections: Learning Objectives, Content, Summary
- Optional sections: Prerequisites, Exercises, References

### Example Code Contract
- Location: `/examples/[module]/[example-name]`
- Required elements: Language specification, description, usage notes
- Safety: Any hardware interaction warnings must be included

## Navigation Contract

The sidebar navigation follows the hierarchy defined in `sidebars.js`:
- Modules contain chapters
- Chapters may contain sub-sections
- All navigation items link to valid content pages

## Content Linking Contract

- Internal links use relative paths: `[Link Text](./relative-path)`
- Image links use static path: `![Alt Text](/img/path-to-image)`
- All links must be valid within the site structure