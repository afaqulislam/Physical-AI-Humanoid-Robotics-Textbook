# Physical AI & Humanoid Robotics Textbook

**AI-Native Technical Textbook for Building Autonomous Humanoid Robots**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/) [![Node.js >=20.0](https://img.shields.io/badge/node->=20.0-green.svg)](https://nodejs.org/) [![ROS 2 Compatible](https://img.shields.io/badge/ROS%202-Foxy/Humble/Galactic-brightgreen.svg)](https://docs.ros.org/en/humble/index.html)


## 📖 Overview

Welcome to **Physical AI & Humanoid Robotics**, a comprehensive 13-week curriculum that takes you from understanding the fundamentals of embodied intelligence to building autonomous humanoid robots capable of interacting with the physical world.

This AI-native textbook combines theoretical foundations with hands-on practice in a cutting-edge educational platform featuring:
- Interactive learning modules covering ROS 2, digital twins, NVIDIA Isaac, and VLA systems
- Advanced AI-powered Q&A system for personalized learning support
- Real-time simulation and hardware integration capabilities

## 🎯 What is Physical AI?

Physical AI represents a paradigm shift from traditional digital AI systems to embodied intelligence that understands and interacts with the physical world. Unlike conventional AI that processes abstract data, Physical AI systems must navigate the complexities of physics, dynamics, sensorimotor control, and real-world uncertainty.

### Key Concepts:
- **Embodied Intelligence**: Intelligence that emerges from the interaction between an agent and its physical environment
- **Sensorimotor Learning**: Learning through sensory input and motor output coordination
- **Physics Understanding**: Comprehension of physical laws, forces, and dynamics
- **Real-world Interaction**: Direct engagement with objects, surfaces, and environmental conditions

## 🧠 Course Structure (13-Week Curriculum)

### Module 1: ROS 2 (Weeks 3-5)
- Introduction to ROS 2 architecture and concepts
- Node and topic communication patterns
- Services, actions, and parameters
- URDF for humanoid robot modeling
- Launch files and package management

### Module 2: Digital Twin (Weeks 6-7)
- Gazebo physics simulation environment
- Unity visualization and rendering
- Sensor simulation (LiDAR, cameras, IMUs, force/torque)
- Physics-based testing and validation

### Module 3: NVIDIA Isaac (Weeks 8-10)
- Isaac Sim for photorealistic simulation
- Isaac ROS acceleration stack
- Navigation 2 (Nav2) for humanoid motion planning
- GPU-accelerated perception and control

### Module 4: VLA & Humanoids (Weeks 11-13)
- Voice commands with Whisper integration
- Cognitive planning using Large Language Models (LLMs)
- Human-robot interaction paradigms
- Capstone: Autonomous Humanoid Project

## 🏗️ Architecture

This textbook project is built as a modern full-stack application with the following components:

### Frontend ([`/frontend`](./frontend/))
- **Framework**: [Docusaurus v3](https://docusaurus.io/) (React-based static site generator)
- **Styling**: Custom CSS with responsive design
- **Features**: Interactive textbook interface, documentation, search functionality
- **Deployment**: Hosted on Vercel (`https://physical-ai-humanoid-robotics-textbook-aui.vercel.app`)

### Backend ([`/backend`](./backend/))
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python ASGI web framework)
- **AI Integration**: Semantic search and retrieval-augmented generation (RAG) system
- **Database**: [Qdrant](https://qdrant.tech/) (vector similarity search engine)
- **Embeddings**: [Sentence Transformers](https://www.sbert.net/) (`all-MiniLM-L6-v2`)
- **LLM Integration**: OpenRouter API for question answering

## 🛠️ Technical Requirements

### Hardware Requirements

#### Computing Platform
- **CPU**: 8-core processor (Intel i7 or AMD Ryzen 7 equivalent) - *Minimum*
- **GPU**: NVIDIA RTX 3060 or better (8GB+ VRAM) for AI acceleration
- **RAM**: 16GB DDR4 minimum, 32GB recommended
- **Storage**: 512GB NVMe SSD minimum, 1TB recommended
- **Operating System**: Ubuntu 20.04/22.04 LTS

#### Recommended Specifications
- **CPU**: 12+ core processor (Intel i9 or AMD Ryzen 9 equivalent)
- **GPU**: NVIDIA RTX 4070/4080 or better (12GB+ VRAM)
- **RAM**: 32GB+ DDR4/DDR5
- **Storage**: 1TB+ NVMe SSD

### Software Dependencies

#### Frontend
- **Node.js**: >=20.0
- **Yarn**: Package manager
- **Docusaurus**: Modern static site generator
- **React**: JavaScript library for building user interfaces

#### Backend
- **Python**: 3.8+
- **FastAPI**: Modern web framework for API development
- **Pydantic**: Data validation and parsing
- **Qdrant Client**: Vector database client
- **Sentence Transformers**: State-of-the-art sentence embeddings
- **BeautifulSoup**: XML/HTML parsing for content ingestion
- **Requests**: HTTP library
- **OpenAI Agents**: AI agent framework

## 🔧 Setup and Installation

### Prerequisites
- Node.js >= 20.0
- Python 3.8+
- Git
- Access to OpenRouter API (for LLM integration)

### Environment Variables

#### Backend
Create a `.env` file in the backend directory with the following variables:
```env
SITEMAP_URL= # URL to your textbook sitemap
COLLECTION_NAME= # Qdrant collection name
QDRANT_URL= # Qdrant cluster URL
QDRANT_API_KEY= # Qdrant API key
OPENROUTER_API_KEY= # OpenRouter API key
OPENROUTER_BASE_URL= # OpenRouter API base URL
OPENROUTER_MODEL= # Model name
```

#### Frontend
Create a `.env` file in the frontend directory with:
```env
BOT_API_URL= # Backend API URL for AI assistant
```

### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the application
uvicorn main:app --reload --port 8000
```

The backend will automatically fetch and index the textbook content from the sitemap URL upon startup.

### Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Start development server
yarn start

# Build for production
yarn build
```

## 🚀 Features

### Interactive Textbook Interface
- Comprehensive curriculum covering 13 weeks of humanoid robotics education
- Rich multimedia content and interactive elements
- Responsive design for multiple devices

### AI-Powered Assistant
- **Semantic Search**: Find relevant content using natural language queries
- **Contextual Understanding**: The AI assistant understands the textbook context
- **Real-time Answers**: Get instant responses to questions about physical AI and humanoid robotics
- **Source Attribution**: All answers are linked to relevant textbook sections

### Content Ingestion Engine
- Automatically fetch and parse content from sitemap URLs
- Chunk text into manageable segments for vector storage
- Embed semantic representations using state-of-the-art models
- Store in Qdrant vector database for efficient retrieval

### Full-Stack Integration
- Seamless communication between frontend and backend services
- Real-time streaming responses from AI assistant
- Cross-platform compatibility

## 💡 Learning Outcomes

By the end of this course, you will be able to:
- Design and implement embodied AI systems for physical interaction
- Develop humanoid robots using ROS 2 and simulation frameworks
- Integrate perception, planning, and control systems
- Apply machine learning to physical tasks and environments
- Build voice-activated autonomous humanoid systems
- Complete a comprehensive capstone project with an autonomous humanoid robot

## 🤝 Contributing

Contributions to improve the textbook content, fix bugs, or enhance features are welcome! 

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍🏫 About the Author

Built with ❤️ by **Afaq Ul Islam** - Dedicated to advancing the field of Physical AI and making humanoid robotics education accessible to everyone.

## 🐙 GitHub Repository

Check out the repository: [https://github.com/afaqulislam/Physical-AI-Humanoid-Robotics-Textbook](https://github.com/afaqulislam/Physical-AI-Humanoid-Robotics-Textbook)

## 📞 Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

<div align="center">
  <sub>Built for the next generation of Physical AI researchers and engineers</sub>
</div>