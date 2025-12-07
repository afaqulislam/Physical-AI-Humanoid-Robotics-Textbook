---
sidebar_position: 2
---

# Nodes & Topics

## Learning Objectives

By the end of this chapter, you will be able to:
- Create and manage ROS 2 nodes for humanoid robotics
- Implement publisher-subscriber communication patterns
- Design efficient topic architectures for robot systems
- Handle message synchronization and timing
- Debug node and topic communication issues

## Understanding Nodes

### Node Definition

A node is a process that performs computation in ROS 2. Nodes are the basic building blocks of a ROS system, and they communicate with other nodes through topics, services, and actions.

### Node Lifecycle

In ROS 2, nodes have a more sophisticated lifecycle compared to ROS 1:

```
Unconfigured → Inactive → Active → Finalized
     ↑                        ↓
     ←-------- Error State ←---
```

### Creating Nodes

#### Python Implementation

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class HumanoidSensorNode(Node):
    def __init__(self):
        super().__init__('humanoid_sensor_node')

        # Create publisher
        self.publisher_ = self.create_publisher(
            String,
            'sensor_data',
            10
        )

        # Create timer for periodic publishing
        self.timer = self.create_timer(
            0.1,  # 10 Hz
            self.timer_callback
        )

        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Sensor reading: {self.i}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Publishing: {msg.data}')
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    node = HumanoidSensorNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### C++ Implementation

```cpp
#include <rclcpp/rclcpp.hpp>
#include <std_msgs/msg/string.hpp>

using namespace std::chrono_literals;

class HumanoidController : public rclcpp::Node
{
public:
    HumanoidController() : Node("humanoid_controller")
    {
        publisher_ = this->create_publisher<std_msgs::msg::String>(
            "control_commands", 10);

        timer_ = this->create_wall_timer(
            50ms, std::bind(&HumanoidController::timer_callback, this));
    }

private:
    void timer_callback()
    {
        auto message = std_msgs::msg::String();
        message.data = "Control command: " + std::to_string(count_++);
        RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
        publisher_->publish(message);
    }

    rclcpp::TimerBase::SharedPtr timer_;
    rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
    size_t count_ = 0;
};

int main(int argc, char * argv[])
{
    rclpy::init(argc, argv);
    rclpy::spin(std::make_shared<HumanoidController>());
    rclpy::shutdown();
    return 0;
}
```

## Topics and Message Passing

### Topic Architecture

Topics in ROS 2 use a publish-subscribe pattern where publishers send messages to topics and subscribers receive messages from topics.

```
[Publisher Node] → [Topic] ← [Subscriber Node]
      ↑                        ↑
[Message Data] ←→ [DDS Layer] ←→ [Message Data]
```

### Quality of Service (QoS) Settings

QoS settings determine how messages are handled in terms of reliability, durability, and performance:

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

# For sensor data (high frequency, may lose some messages)
sensor_qos = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.BEST_EFFORT,
    history=HistoryPolicy.KEEP_LAST
)

# For critical commands (must not lose messages)
command_qos = QoSProfile(
    depth=1,
    reliability=ReliabilityPolicy.RELIABLE,
    history=HistoryPolicy.KEEP_LAST
)

# Create publisher with specific QoS
sensor_publisher = self.create_publisher(
    SensorMsg,
    'sensor_topic',
    sensor_qos
)
```

## Publisher Implementation

### Basic Publisher

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
import math

class JointStatePublisher(Node):
    def __init__(self):
        super().__init__('joint_state_publisher')

        self.publisher_ = self.create_publisher(
            JointState,
            'joint_states',
            10
        )

        self.timer = self.create_timer(0.05, self.publish_joint_states)  # 20 Hz
        self.joint_names = [
            'left_hip_joint', 'left_knee_joint', 'left_ankle_joint',
            'right_hip_joint', 'right_knee_joint', 'right_ankle_joint',
            'left_shoulder_joint', 'left_elbow_joint', 'left_wrist_joint'
        ]

    def publish_joint_states(self):
        msg = JointState()
        msg.name = self.joint_names
        msg.position = [math.sin(self.get_clock().now().nanoseconds * 1e-9 + i)
                       for i in range(len(self.joint_names))]
        msg.header.stamp = self.get_clock().now().to_msg()

        self.publisher_.publish(msg)
```

## Subscriber Implementation

### Basic Subscriber

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from trajectory_msgs.msg import JointTrajectory

class JointController(Node):
    def __init__(self):
        super().__init__('joint_controller')

        # Subscribe to joint states
        self.subscription = self.create_subscription(
            JointState,
            'joint_states',
            self.joint_state_callback,
            10
        )

        # Publisher for trajectory commands
        self.trajectory_publisher = self.create_publisher(
            JointTrajectory,
            'joint_trajectory',
            10
        )

    def joint_state_callback(self, msg):
        self.get_logger().info(f'Received joint states: {len(msg.name)} joints')
        # Process joint states and generate trajectory commands
        self.process_joint_states(msg)

    def process_joint_states(self, joint_state_msg):
        # Implement your control logic here
        trajectory_msg = JointTrajectory()
        # ... populate trajectory_msg based on current joint states
        self.trajectory_publisher.publish(trajectory_msg)
```

## Advanced Topic Patterns

### Multiple Publishers/Single Subscriber

```python
class SensorFusionNode(Node):
    def __init__(self):
        super().__init__('sensor_fusion_node')

        # Multiple sensor inputs
        self.imu_sub = self.create_subscription(
            Imu, 'imu/data', self.imu_callback, 10)

        self.lidar_sub = self.create_subscription(
            LaserScan, 'scan', self.lidar_callback, 10)

        self.camera_sub = self.create_subscription(
            Image, 'camera/image_raw', self.camera_callback, 10)

        # Single output
        self.fused_pub = self.create_publisher(
            SensorFusionResult, 'sensor_fusion_result', 10)

    def imu_callback(self, msg):
        # Process IMU data
        pass

    def lidar_callback(self, msg):
        # Process LIDAR data
        pass

    def camera_callback(self, msg):
        # Process camera data
        pass
```

### Message Synchronization

For synchronizing messages from multiple topics:

```python
from rclpy.time import Time
from rclpy.duration import Duration

class SynchronizedProcessor(Node):
    def __init__(self):
        super().__init__('sync_processor')

        self.camera_buffer = {}
        self.imu_buffer = {}

        self.camera_sub = self.create_subscription(
            Image, 'camera/image_raw', self.camera_callback, 10)
        self.imu_sub = self.create_subscription(
            Imu, 'imu/data', self.imu_callback, 10)

    def camera_callback(self, msg):
        timestamp = Time.from_msg(msg.header.stamp)
        self.camera_buffer[timestamp.nanoseconds] = msg
        self.process_synchronized_data(timestamp)

    def imu_callback(self, msg):
        timestamp = Time.from_msg(msg.header.stamp)
        self.imu_buffer[timestamp.nanoseconds] = msg
        self.process_synchronized_data(timestamp)

    def process_synchronized_data(self, target_time):
        # Find matching timestamps within tolerance
        tolerance = 50000000  # 50ms in nanoseconds

        for cam_time, cam_msg in self.camera_buffer.items():
            for imu_time, imu_msg in self.imu_buffer.items():
                if abs(cam_time - imu_time) < tolerance:
                    # Process synchronized data
                    self.process_pair(cam_msg, imu_msg)

                    # Remove processed data
                    del self.camera_buffer[cam_time]
                    del self.imu_buffer[imu_time]
                    break
```

## Topic Naming Conventions for Humanoid Robotics

### Standard Topic Names

- `/joint_states` - Current joint positions, velocities, efforts
- `/joint_commands` - Desired joint positions/velocities
- `/tf` and `/tf_static` - Transformations between coordinate frames
- `/imu/data` - IMU sensor data
- `/scan` - LIDAR scan data
- `/camera/image_raw` - Raw camera images
- `/odom` - Odometry data
- `/cmd_vel` - Velocity commands

### Humanoid-Specific Topics

- `/left_leg_controller/command` - Left leg trajectory commands
- `/right_arm_controller/state` - Right arm controller state
- `/balance_controller/target` - Balance control targets
- `/gait_planner/footprints` - Planned footstep locations
- `/head_controller/point_head` - Head pointing commands

## Performance Optimization

### Message Efficiency

- Use appropriate message types (avoid unnecessary data)
- Implement message compression for large data
- Use appropriate QoS settings
- Consider message throttling for high-frequency topics

### Memory Management

```python
# Limit message queue size
qos_profile = QoSProfile(depth=1)  # Only keep latest message

# Use callbacks efficiently
def efficient_callback(self, msg):
    # Process immediately without storing
    self.process_immediate(msg)
```

## Debugging Techniques

### Topic Monitoring

```bash
# Monitor topic activity
ros2 topic echo /joint_states

# Check topic statistics
ros2 topic info /joint_states

# List all topics
ros2 topic list

# Check message type
ros2 topic type /joint_states
```

### Node Monitoring

```bash
# List all nodes
ros2 node list

# Check node info
ros2 node info /joint_state_publisher

# Monitor node status
ros2 lifecycle list /lifecycle_node
```

## Best Practices for Humanoid Robotics

### Robust Communication

- Implement timeout handling for critical topics
- Use appropriate QoS settings for different data types
- Implement message validation
- Design fallback behaviors for communication failures

### Safety Considerations

- Separate safety-critical topics from regular topics
- Implement topic rate limiting for safety
- Use reliable QoS for safety-related messages
- Monitor topic health continuously

## Summary

Nodes and topics form the backbone of ROS 2 communication in humanoid robotics. Understanding how to design efficient topic architectures, implement robust publishers and subscribers, and handle message synchronization is crucial for building reliable humanoid robot systems.

The next chapter will cover services, actions, and parameters, which provide additional communication patterns for more complex interactions.