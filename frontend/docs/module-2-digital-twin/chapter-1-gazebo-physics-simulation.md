---
sidebar_position: 1
---

# Gazebo Physics Simulation

## Learning Objectives

By the end of this chapter, you will be able to:
- Install and configure Gazebo for humanoid robotics simulation
- Create realistic physics environments for humanoid robots
- Configure physics properties and parameters for accurate simulation
- Implement sensor simulation with realistic noise models
- Debug and optimize simulation performance
- Validate simulation results against real-world behavior

## Introduction to Gazebo Simulation

### What is Gazebo?

Gazebo is a 3D simulation environment that provides realistic physics simulation, high-quality graphics, and convenient programmatic interfaces. For humanoid robotics, Gazebo offers:

- **Accurate physics simulation**: Realistic dynamics, collisions, and contacts
- **Sensor simulation**: Cameras, LiDAR, IMUs, force/torque sensors
- **Visual rendering**: High-quality 3D graphics for visualization
- **Plugin system**: Extensible functionality through plugins
- **ROS 2 integration**: Seamless integration with ROS 2 systems

### Why Digital Twins for Humanoid Robotics?

Digital twins provide a safe, cost-effective environment for:
- **Algorithm testing**: Validate control algorithms without hardware risk
- **Training**: Train machine learning models in simulation
- **Prototyping**: Test new robot designs and behaviors
- **Safety validation**: Ensure safe robot behaviors before deployment
- **Performance optimization**: Tune parameters and configurations

## Installing Gazebo

### System Requirements

- **Operating System**: Ubuntu 22.04 LTS (recommended)
- **Graphics**: Dedicated GPU with OpenGL 3.3+ support
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for basic installation

### Installation Methods

#### Using APT (Recommended)

```bash
# Install Gazebo Garden (latest stable)
sudo apt update
sudo apt install gazebo libgazebo-dev

# Or install specific version
sudo apt install gazebo-garden
```

#### Using ROS 2 Integration

```bash
# Install ROS 2 Gazebo packages
sudo apt install ros-humble-gazebo-ros-pkgs
sudo apt install ros-humble-gazebo-ros2-control
sudo apt install ros-humble-gazebo-dev
```

### Verification

```bash
# Check Gazebo installation
gazebo --version

# Launch basic simulation
gazebo
```

## Gazebo World Setup

### Basic World Structure

A Gazebo world file is an SDF (Simulation Description Format) file that defines the simulation environment:

```xml
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="humanoid_world">
    <!-- Include standard models -->
    <include>
      <uri>model://ground_plane</uri>
    </include>
    <include>
      <uri>model://sun</uri>
    </include>

    <!-- Custom models -->
    <model name="humanoid_robot">
      <!-- Robot definition will be included here -->
    </model>

    <!-- Physics engine configuration -->
    <physics name="1ms" type="ode">
      <max_step_size>0.001</max_step_size>
      <real_time_factor>1.0</real_time_factor>
      <real_time_update_rate>1000.0</real_time_update_rate>
    </physics>
  </world>
</sdf>
```

### Physics Engine Configuration

```xml
<physics name="ode_physics" type="ode">
  <!-- Time step configuration -->
  <max_step_size>0.001</max_step_size>
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000.0</real_time_update_rate>

  <!-- ODE-specific parameters -->
  <ode>
    <solver>
      <type>quick</type>
      <iters>10</iters>
      <sor>1.3</sor>
    </solver>
    <constraints>
      <cfm>0.0</cfm>
      <erp>0.2</erp>
      <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
      <contact_surface_layer>0.001</contact_surface_layer>
    </constraints>
  </ode>
</physics>
```

### Environment Models

```xml
<!-- Add obstacles and environment elements -->
<model name="table">
  <pose>2 0 0.5 0 0 0</pose>
  <link name="table_base">
    <collision name="collision">
      <geometry>
        <box>
          <size>1 0.8 0.8</size>
        </box>
      </geometry>
    </collision>
    <visual name="visual">
      <geometry>
        <box>
          <size>1 0.8 0.8</size>
        </box>
      </geometry>
      <material>
        <ambient>0.8 0.6 0.4 1</ambient>
        <diffuse>0.8 0.6 0.4 1</diffuse>
      </material>
    </visual>
    <inertial>
      <mass>10.0</mass>
      <inertia>
        <ixx>1.0</ixx>
        <ixy>0.0</ixy>
        <ixz>0.0</ixz>
        <iyy>1.0</iyy>
        <iyz>0.0</iyz>
        <izz>1.0</izz>
      </inertia>
    </inertial>
  </link>
</model>
```

## Robot Integration with Gazebo

### URDF to SDF Conversion

For Gazebo integration, robots are often defined in URDF and loaded into Gazebo. Here's a complete example with Gazebo-specific elements:

```xml
<?xml version="1.0"?>
<robot name="humanoid_robot" xmlns:xacro="http://www.ros.org/wiki/xacro">
  <!-- Include Gazebo-specific elements -->
  <gazebo>
    <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
      <robotNamespace>/humanoid</robotNamespace>
      <robotSimType>gazebo_ros_control/DefaultRobotHWSim</robotSimType>
    </plugin>
  </gazebo>

  <!-- Torso link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
      <material name="gray">
        <color rgba="0.5 0.5 0.5 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="10.0"/>
      <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.3" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Hip joint with Gazebo transmission -->
  <joint name="left_hip_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_upper_leg"/>
    <origin xyz="-0.1 -0.1 0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100" velocity="2"/>
    <dynamics damping="1.0" friction="0.1"/>
  </joint>

  <link name="left_upper_leg">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.4"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.4"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="2.0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
    </inertial>
  </link>

  <!-- Gazebo transmission for joint control -->
  <transmission name="left_hip_trans">
    <type>transmission_interface/SimpleTransmission</type>
    <joint name="left_hip_joint">
      <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
    </joint>
    <actuator name="left_hip_motor">
      <hardwareInterface>hardware_interface/PositionJointInterface</hardwareInterface>
      <mechanicalReduction>1</mechanicalReduction>
    </actuator>
  </transmission>

  <!-- Gazebo-specific link properties -->
  <gazebo reference="left_upper_leg">
    <mu1>0.8</mu1>
    <mu2>0.8</mu2>
    <kp>1000000.0</kp>
    <kd>100.0</kd>
    <material>Gazebo/Grey</material>
  </gazebo>
</robot>
```

## Gazebo Plugins for Humanoid Robotics

### ROS 2 Control Plugin

The `gazebo_ros_control` plugin enables ROS 2 control interfaces:

```xml
<gazebo>
  <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
    <robotNamespace>/humanoid</robotNamespace>
    <robotSimType>gazebo_ros_control/DefaultRobotHWSim</robotSimType>
    <controlPeriod>0.001</controlPeriod>
  </plugin>
</gazebo>
```

### Sensor Plugins

Gazebo provides various sensor plugins for humanoid applications:

#### IMU Sensor

```xml
<gazebo reference="imu_link">
  <sensor name="imu_sensor" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
          </noise>
        </z>
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>
  </sensor>
</gazebo>
```

#### Camera Sensor

```xml
<gazebo reference="camera_link">
  <sensor name="camera" type="camera">
    <update_rate>30</update_rate>
    <camera name="head">
      <horizontal_fov>1.3962634</horizontal_fov>
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>100</far>
      </clip>
      <noise>
        <type>gaussian</type>
        <mean>0.0</mean>
        <stddev>0.007</stddev>
      </noise>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
      <frame_name>camera_optical_frame</frame_name>
      <min_depth>0.1</min_depth>
      <max_depth>100</max_depth>
    </plugin>
  </sensor>
</gazebo>
```

#### LiDAR Sensor

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <pose>0 0 0 0 0 0</pose>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>
          <max_angle>3.14159</max_angle>
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>
        <max>30.0</max>
        <resolution>0.01</resolution>
      </range>
    </ray>
    <plugin name="lidar_controller" filename="libgazebo_ros_laser.so">
      <frame_name>lidar_link</frame_name>
      <topic_name>scan</topic_name>
    </plugin>
  </sensor>
</gazebo>
```

## Launching Gazebo with ROS 2

### Basic Launch File

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription, ExecuteProcess
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    world_file = LaunchConfiguration('world', default='empty.sdf')

    # Launch Gazebo
    gazebo = ExecuteProcess(
        cmd=['gazebo', '-s', 'libgazebo_ros_factory.so',
             '-s', 'libgazebo_ros_init.so', world_file],
        output='screen'
    )

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[
            {'use_sim_time': use_sim_time},
            {'robot_description': PathJoinSubstitution([
                FindPackageShare('humanoid_description'),
                'urdf',
                'humanoid.urdf.xacro'
            ])}
        ]
    )

    # Spawn robot in Gazebo
    spawn_entity = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-topic', 'robot_description',
            '-entity', 'humanoid_robot'
        ],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'world',
            default_value=PathJoinSubstitution([
                FindPackageShare('humanoid_gazebo'),
                'worlds',
                'humanoid_world.sdf'
            ]),
            description='SDF world file'
        ),
        gazebo,
        robot_state_publisher,
        spawn_entity
    ])
```

### Advanced Launch Configuration

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, SetEnvironmentVariable
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Environment setup
    gz_model_path = SetEnvironmentVariable(
        name='GZ_MODEL_PATH',
        value=PathJoinSubstitution([
            FindPackageShare('humanoid_gazebo'),
            'models'
        ])
    )

    gz_resource_path = SetEnvironmentVariable(
        name='GZ_RESOURCE_PATH',
        value=PathJoinSubstitution([
            FindPackageShare('humanoid_gazebo'),
            'worlds'
        ])
    )

    # Launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')
    robot_name = LaunchConfiguration('robot_name', default='humanoid_robot')
    world_file = LaunchConfiguration('world', default='humanoid_world.sdf')

    # Gazebo server
    gzserver = Node(
        package='gazebo_ros',
        executable='gzserver',
        arguments=[world_file, '-s', 'libgazebo_ros_init.so',
                   '-s', 'libgazebo_ros_factory.so'],
        parameters=[{'use_sim_time': use_sim_time}],
        output='screen'
    )

    # Gazebo client
    gzclient = Node(
        package='gazebo_ros',
        executable='gzclient',
        output='screen',
        condition=IfCondition(LaunchConfiguration('gui', default='true'))
    )

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[
            {'use_sim_time': use_sim_time},
            {'robot_description': PathJoinSubstitution([
                FindPackageShare('humanoid_description'),
                'urdf',
                'humanoid.urdf.xacro'
            ])}
        ]
    )

    # Controller manager
    controller_manager = Node(
        package='controller_manager',
        executable='ros2_control_node',
        parameters=[
            PathJoinSubstitution([
                FindPackageShare('humanoid_control'),
                'config',
                'controllers.yaml'
            ]),
            {'use_sim_time': use_sim_time}
        ],
        output='screen'
    )

    return LaunchDescription([
        gz_model_path,
        gz_resource_path,
        DeclareLaunchArgument('world', default_value=world_file),
        DeclareLaunchArgument('gui', default_value='true'),
        gzserver,
        gzclient,
        robot_state_publisher,
        controller_manager
    ])
```

## Physics Configuration for Humanoid Robots

### Contact Parameters

For humanoid robots, proper contact handling is crucial:

```xml
<world name="humanoid_world">
  <physics name="ode_physics" type="ode">
    <ode>
      <solver>
        <type>quick</type>
        <iters>100</iters>
        <sor>1.3</sor>
      </solver>
      <constraints>
        <cfm>0.000001</cfm>
        <erp>0.2</erp>
        <contact_max_correcting_vel>100.0</contact_max_correcting_vel>
        <contact_surface_layer>0.001</contact_surface_layer>
      </constraints>
    </ode>
  </physics>
</world>
```

### Joint Dynamics

Proper joint dynamics for stable humanoid simulation:

```xml
<joint name="left_knee_joint" type="revolute">
  <parent link="left_upper_leg"/>
  <child link="left_lower_leg"/>
  <origin xyz="0 0 -0.4" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="0" upper="2.356" effort="100" velocity="2"/>
  <dynamics damping="5.0" friction="0.5"/>
  <safety_controller k_position="100" k_velocity="10"
                    soft_lower_limit="0.05" soft_upper_limit="2.306"/>
</joint>
```

## Simulation Validation

### Comparing Simulation to Reality

To validate your simulation:

1. **Static Tests**: Compare robot poses and kinematics
2. **Dynamic Tests**: Compare motion patterns and stability
3. **Sensor Tests**: Compare sensor readings in similar conditions
4. **Control Tests**: Compare control responses and behaviors

### Performance Metrics

```python
# Example validation node
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from geometry_msgs.msg import PoseStamped
import numpy as np

class SimulationValidator(Node):
    def __init__(self):
        super().__init__('simulation_validator')

        self.joint_sub = self.create_subscription(
            JointState, 'joint_states', self.joint_callback, 10)

        self.pose_sub = self.create_subscription(
            PoseStamped, 'robot_pose', self.pose_callback, 10)

        self.validation_timer = self.create_timer(1.0, self.validate)

        self.joint_history = []
        self.pose_history = []

    def joint_callback(self, msg):
        self.joint_history.append({
            'timestamp': self.get_clock().now(),
            'positions': list(msg.position),
            'velocities': list(msg.velocity)
        })

    def pose_callback(self, msg):
        self.pose_history.append({
            'timestamp': self.get_clock().now(),
            'position': [msg.pose.position.x, msg.pose.position.y, msg.pose.position.z],
            'orientation': [msg.pose.orientation.x, msg.pose.orientation.y,
                           msg.pose.orientation.z, msg.pose.orientation.w]
        })

    def validate(self):
        # Calculate stability metrics
        if len(self.pose_history) > 10:
            z_positions = [p['position'][2] for p in self.pose_history[-10:]]
            stability = np.std(z_positions)  # Should be low for stable walking

            self.get_logger().info(f'Robot stability (Z std): {stability:.4f}')
```

## Optimization Techniques

### Performance Optimization

1. **Reduce Update Rates**: Lower sensor update rates where possible
2. **Simplify Models**: Use simpler collision geometry
3. **Adjust Physics**: Tune physics parameters for performance
4. **Limit Simulation Steps**: Use appropriate time steps

### Physics Tuning

```xml
<!-- For faster simulation -->
<physics name="fast_physics" type="ode">
  <max_step_size>0.01</max_step_size>  <!-- Larger steps for speed -->
  <real_time_factor>2.0</real_time_factor>  <!-- Run faster than real-time -->
  <real_time_update_rate>100.0</real_time_update_rate>
  <ode>
    <solver>
      <iters>20</iters>  <!-- Fewer iterations -->
    </solver>
  </ode>
</physics>

<!-- For accurate simulation -->
<physics name="accurate_physics" type="ode">
  <max_step_size>0.001</max_step_size>  <!-- Smaller steps for accuracy -->
  <real_time_factor>1.0</real_time_factor>
  <real_time_update_rate>1000.0</real_time_update_rate>
  <ode>
    <solver>
      <iters>100</iters>  <!-- More iterations -->
    </solver>
  </ode>
</physics>
```

## Common Issues and Troubleshooting

### Instability Issues

- **Jittery motion**: Increase solver iterations or reduce time step
- **Joint limits exceeded**: Check joint limits and safety controllers
- **Penetration**: Adjust contact parameters (CFM, ERP)

### Performance Issues

- **Slow simulation**: Simplify collision geometry, reduce update rates
- **High CPU usage**: Optimize physics parameters, limit update rates
- **Memory leaks**: Monitor and restart simulation periodically

### Sensor Issues

- **Noisy data**: Verify noise parameters in sensor configuration
- **Incorrect readings**: Check sensor placement and calibration
- **Missing data**: Verify plugin configuration and topics

## Best Practices

### Simulation Best Practices

1. **Start Simple**: Begin with basic models and add complexity gradually
2. **Validate Early**: Compare simulation to real robot behavior regularly
3. **Document Parameters**: Keep track of physics and sensor parameters
4. **Use Realistic Noise**: Include appropriate sensor noise models
5. **Monitor Performance**: Track simulation real-time factor

### Humanoid-Specific Considerations

1. **Stability Focus**: Prioritize balance and contact stability
2. **Realistic Dynamics**: Use appropriate mass and inertia properties
3. **Contact Modeling**: Configure contact parameters for feet and hands
4. **Control Integration**: Ensure seamless ROS 2 control integration
5. **Safety Boundaries**: Implement virtual safety limits

## Summary

Gazebo provides a powerful platform for humanoid robotics simulation, offering realistic physics, sensor simulation, and ROS 2 integration. Proper configuration of physics parameters, sensors, and control systems is essential for creating accurate digital twins that effectively represent real-world humanoid robots.

The next chapter will cover Unity visualization for enhanced digital twin capabilities.