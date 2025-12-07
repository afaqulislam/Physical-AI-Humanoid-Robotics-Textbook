---
sidebar_position: 1
---

# Introduction to ROS 2

## Learning Objectives

By the end of this chapter, you will be able to:
- Understand the architecture and concepts of ROS 2
- Distinguish ROS 2 from ROS 1 and explain the improvements
- Install and configure ROS 2 for humanoid robotics development
- Use basic ROS 2 tools and commands
- Set up your development environment for ROS 2

## What is ROS 2?

ROS 2 (Robot Operating System 2) is the next-generation robot middleware that provides libraries and tools to help software developers create robot applications. It addresses many of the limitations of ROS 1 and introduces new features for modern robotics applications.

### Key Improvements Over ROS 1

- **Real-time support**: Better support for real-time applications
- **Multi-robot systems**: Improved support for multiple robots
- **Security**: Built-in security and authentication
- **DDS integration**: Uses Data Distribution Service for communication
- **Cross-platform**: Better support for different operating systems
- **Lifecycle management**: Better node lifecycle management

### ROS 2 Architecture

ROS 2 uses a distributed architecture based on the DDS (Data Distribution Service) standard:

```
[ROS 2 Client Libraries] → [DDS Implementation] → [Network]
        ↑                          ↑                   ↑
[Nodes/Processes] ←→ [ROS 2 Middleware] ←→ [Communication]
```

## Installing ROS 2

### System Requirements

- **Operating System**: Ubuntu 22.04 (recommended) or Windows 10/11
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space
- **Processor**: Multi-core processor (Intel i5 or equivalent)

### Installation Steps

#### Ubuntu Installation

```bash
# Add ROS 2 GPG key and repository
sudo apt update && sudo apt install curl gnupg lsb-release
curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key | sudo gpg --dearmor -o /usr/share/keyrings/ros-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

sudo apt update
sudo apt install ros-humble-desktop
```

#### Windows Installation

1. Install Visual Studio 2019 or 2022 with C++ development tools
2. Install Python 3.8 or later
3. Download and run the ROS 2 installer from the official website
4. Follow the installation wizard

### Environment Setup

```bash
# Source ROS 2 environment
source /opt/ros/humble/setup.bash

# Add to your shell profile for automatic loading
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

## Basic ROS 2 Concepts

### Nodes

A node is a process that performs computation. In ROS 2, nodes are the basic unit of execution:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)

def main(args=None):
    rclpy.init(args=args)
    minimal_node = MinimalNode()
    rclpy.spin(minimal_node)
    minimal_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Topics and Messages

Topics are named buses over which nodes exchange messages. Messages are the data packets sent between nodes:

```python
from std_msgs.msg import String

# Publisher
publisher = node.create_publisher(String, 'topic_name', 10)

# Subscriber
subscriber = node.create_subscription(String, 'topic_name', callback_function, 10)
```

### Services and Actions

Services provide request-response communication, while actions provide goal-feedback-result patterns:

```python
from example_interfaces.srv import AddTwoInts

# Service server
service = node.create_service(AddTwoInts, 'add_two_ints', callback_function)

# Service client
client = node.create_client(AddTwoInts, 'add_two_ints')
```

## ROS 2 Tools

### Command Line Tools

- `ros2 run`: Run a node
- `ros2 topic`: View and interact with topics
- `ros2 service`: View and interact with services
- `ros2 node`: View and manage nodes
- `ros2 param`: View and manage parameters

### Example Commands

```bash
# List all topics
ros2 topic list

# Echo a topic
ros2 topic echo /topic_name std_msgs/msg/String

# List all nodes
ros2 node list

# Run a node
ros2 run package_name executable_name
```

## Creating Your First ROS 2 Package

### Package Structure

```
my_robot_package/
├── CMakeLists.txt
├── package.xml
├── src/
│   └── my_node.cpp
├── include/
│   └── my_robot_package/
│       └── my_header.h
├── launch/
│   └── my_launch_file.py
└── config/
    └── my_params.yaml
```

### Creating a Package

```bash
# Create a new package
ros2 pkg create --build-type ament_cmake my_robot_package

# Or with Python
ros2 pkg create --build-type ament_python my_robot_package
```

## ROS 2 for Humanoid Robotics

### Humanoid-Specific Considerations

- **Real-time requirements**: Humanoid robots need real-time response
- **Safety**: Multiple safety layers required
- **Complexity**: Many sensors and actuators to coordinate
- **Communication**: High-bandwidth sensor data

### URDF Integration

ROS 2 works seamlessly with URDF (Unified Robot Description Format) for robot modeling:

```xml
<robot name="my_humanoid_robot">
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.5"/>
      </geometry>
    </visual>
  </link>
</robot>
```

## Best Practices

### Code Organization

- Use meaningful package and node names
- Follow ROS 2 naming conventions
- Document your code thoroughly
- Use launch files for complex setups

### Performance Considerations

- Minimize message passing when possible
- Use appropriate QoS (Quality of Service) settings
- Consider message size and frequency
- Profile your applications regularly

## Summary

ROS 2 provides a robust foundation for humanoid robotics development. Its improved architecture, security features, and real-time capabilities make it ideal for the complex requirements of humanoid robots. Understanding these fundamentals is essential for the rest of the course.

In the next chapter, we'll explore nodes and topics in more detail, building on these foundational concepts.