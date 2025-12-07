---
sidebar_position: 5
---

# Launch Files & Packages

## Learning Objectives

By the end of this chapter, you will be able to:
- Create and organize ROS 2 packages for humanoid robotics
- Write launch files to start complex robot systems
- Use parameters and arguments in launch files
- Implement conditional launch logic
- Structure packages for maintainability and reusability

## ROS 2 Package Structure

### Basic Package Organization

A well-structured ROS 2 package for humanoid robotics typically follows this layout:

```
my_humanoid_package/
├── CMakeLists.txt          # Build configuration
├── package.xml             # Package metadata
├── launch/                 # Launch files
│   ├── robot.launch.py
│   ├── simulation.launch.py
│   └── hardware.launch.py
├── config/                 # Configuration files
│   ├── robot_params.yaml
│   ├── controllers.yaml
│   └── sensors.yaml
├── urdf/                   # Robot description
│   ├── robot.urdf.xacro
│   ├── materials.xacro
│   └── joints.xacro
├── src/                    # Source code
│   ├── controllers/
│   ├── sensors/
│   └── main.cpp
├── include/                # Header files
├── meshes/                 # 3D models
└── scripts/                # Utility scripts
```

### Package.xml Structure

```xml
<?xml version="1.0"?>
<?xml-model href="http://download.ros.org/schema/package_format3.xsd" schematypens="http://www.w3.org/2001/XMLSchema"?>
<package format="3">
  <name>my_humanoid_package</name>
  <version>1.0.0</version>
  <description>Humanoid robot package with controllers and sensors</description>
  <maintainer email="maintainer@humanoid-robotics.com">Maintainer Name</maintainer>
  <license>Apache License 2.0</license>

  <buildtool_depend>ament_cmake</buildtool_depend>

  <depend>rclcpp</depend>
  <depend>rclpy</depend>
  <depend>std_msgs</depend>
  <depend>sensor_msgs</depend>
  <depend>geometry_msgs</depend>
  <depend>control_msgs</depend>
  <depend>robot_state_publisher</depend>
  <depend>joint_state_publisher</depend>

  <test_depend>ament_lint_auto</test_depend>
  <test_depend>ament_lint_common</test_depend>

  <export>
    <build_type>ament_cmake</build_type>
  </export>
</package>
```

### CMakeLists.txt Structure

```cmake
cmake_minimum_required(VERSION 3.8)
project(my_humanoid_package)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# Find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclpy REQUIRED)
find_package(std_msgs REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(robot_state_publisher REQUIRED)

# Install launch files
install(DIRECTORY
  launch
  config
  urdf
  DESTINATION share/${PROJECT_NAME}
)

# Install executables
install(TARGETS
  DESTINATION lib/${PROJECT_NAME}
)

# Install Python scripts
install(PROGRAMS
  DESTINATION lib/${PROJECT_NAME}
)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
```

## Launch Files in Python

### Basic Launch File Structure

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Declare launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='false')
    robot_name = LaunchConfiguration('robot_name', default='humanoid_robot')

    # Include other launch files
    robot_description_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('my_robot_description'),
                'launch',
                'robot_description.launch.py'
            ])
        ])
    )

    # Launch robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        name='robot_state_publisher',
        parameters=[
            {'use_sim_time': use_sim_time},
            {'robot_description': PathJoinSubstitution([
                FindPackageShare('my_robot_description'),
                'urdf',
                'robot.urdf.xacro'
            ])}
        ]
    )

    # Launch joint state publisher
    joint_state_publisher = Node(
        package='joint_state_publisher',
        executable='joint_state_publisher',
        name='joint_state_publisher',
        parameters=[{'use_sim_time': use_sim_time}]
    )

    return LaunchDescription([
        robot_description_launch,
        robot_state_publisher,
        joint_state_publisher,
    ])
```

### Launch Arguments and Parameters

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Declare launch arguments
    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation time if true'
    )

    declare_robot_namespace = DeclareLaunchArgument(
        'robot_namespace',
        default_value='',
        description='Robot namespace for multi-robot systems'
    )

    declare_config_file = DeclareLaunchArgument(
        'config_file',
        default_value='',
        description='Path to configuration file'
    )

    # Get launch configurations
    use_sim_time = LaunchConfiguration('use_sim_time')
    robot_namespace = LaunchConfiguration('robot_namespace')
    config_file = LaunchConfiguration('config_file')

    # Robot controller node
    controller_node = Node(
        package='my_humanoid_package',
        executable='controller_node',
        name='robot_controller',
        namespace=robot_namespace,
        parameters=[
            {'use_sim_time': use_sim_time},
            config_file,
            {
                'kp': 10.0,
                'ki': 0.1,
                'kd': 0.5
            }
        ],
        remappings=[
            ('/joint_states', 'joint_states'),
            ('/cmd_vel', 'cmd_vel')
        ]
    )

    return LaunchDescription([
        declare_use_sim_time,
        declare_robot_namespace,
        declare_config_file,
        controller_node
    ])
```

## Advanced Launch File Features

### Conditional Launch Logic

```python
from launch import LaunchDescription, LaunchCondition
from launch.actions import DeclareLaunchArgument, OpaqueFunction
from launch.substitutions import LaunchConfiguration
from launch.conditions import IfCondition, UnlessCondition
from launch_ros.actions import Node

def launch_setup(context, *args, **kwargs):
    # Get launch configurations
    use_sim_time = LaunchConfiguration('use_sim_time').perform(context)
    enable_vision = LaunchConfiguration('enable_vision').perform(context)
    robot_type = LaunchConfiguration('robot_type').perform(context)

    nodes = []

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{'use_sim_time': use_sim_time}]
    )
    nodes.append(robot_state_publisher)

    # Add vision system only if enabled
    if enable_vision.lower() == 'true':
        vision_node = Node(
            package='vision_package',
            executable='vision_node',
            name='vision_system',
            parameters=[{'use_sim_time': use_sim_time}]
        )
        nodes.append(vision_node)

    # Add different controllers based on robot type
    if robot_type == 'simulation':
        controller_node = Node(
            package='controller_package',
            executable='sim_controller',
            name='controller'
        )
    else:
        controller_node = Node(
            package='controller_package',
            executable='hardware_controller',
            name='controller'
        )
    nodes.append(controller_node)

    return nodes

def generate_launch_description():
    # Declare launch arguments
    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation time'
    )

    declare_enable_vision = DeclareLaunchArgument(
        'enable_vision',
        default_value='true',
        description='Enable vision system'
    )

    declare_robot_type = DeclareLaunchArgument(
        'robot_type',
        default_value='simulation',
        choices=['simulation', 'hardware'],
        description='Type of robot to launch'
    )

    # Use OpaqueFunction for complex conditional logic
    opaque_launch = OpaqueFunction(function=launch_setup)

    return LaunchDescription([
        declare_use_sim_time,
        declare_enable_vision,
        declare_robot_type,
        opaque_launch
    ])
```

### Launch Files with Groups and Compositions

```python
from launch import LaunchDescription
from launch.actions import GroupAction, SetParameter
from launch_ros.actions import Node, PushRosNamespace

def generate_launch_description():
    # Group for sensor processing
    sensor_processing_group = GroupAction(
        actions=[
            PushRosNamespace('sensors'),
            SetParameter('use_sim_time', True),

            Node(
                package='sensor_package',
                executable='imu_processor',
                name='imu_processor'
            ),

            Node(
                package='sensor_package',
                executable='lidar_processor',
                name='lidar_processor'
            ),

            Node(
                package='sensor_package',
                executable='camera_processor',
                name='camera_processor'
            ),
        ]
    )

    # Group for control systems
    control_group = GroupAction(
        actions=[
            PushRosNamespace('control'),
            SetParameter('use_sim_time', True),

            Node(
                package='control_package',
                executable='balance_controller',
                name='balance_controller'
            ),

            Node(
                package='control_package',
                executable='gait_controller',
                name='gait_controller'
            ),
        ]
    )

    return LaunchDescription([
        sensor_processing_group,
        control_group
    ])
```

## Launch File Best Practices

### Parameter Organization

```python
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Robot configuration
    declare_robot_config = DeclareLaunchArgument(
        'robot_config',
        default_value=PathJoinSubstitution([
            FindPackageShare('my_humanoid_package'),
            'config',
            'humanoid_config.yaml'
        ]),
        description='Path to robot configuration file'
    )

    # Simulation parameters
    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation time'
    )

    robot_config = LaunchConfiguration('robot_config')
    use_sim_time = LaunchConfiguration('use_sim_time')

    # Robot controller with configuration file
    robot_controller = Node(
        package='my_humanoid_package',
        executable='robot_controller',
        parameters=[
            robot_config,
            {'use_sim_time': use_sim_time}
        ]
    )

    # Sensor manager
    sensor_manager = Node(
        package='my_humanoid_package',
        executable='sensor_manager',
        parameters=[
            robot_config,
            {'use_sim_time': use_sim_time}
        ]
    )

    return LaunchDescription([
        declare_robot_config,
        declare_use_sim_time,
        robot_controller,
        sensor_manager
    ])
```

### Modular Launch Files

```python
# launch/robot_description.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Declare arguments
    declare_description_file = DeclareLaunchArgument(
        'description_file',
        default_value=PathJoinSubstitution([
            FindPackageShare('my_robot_description'),
            'urdf',
            'robot.urdf.xacro'
        ]),
        description='Robot description file'
    )

    description_file = LaunchConfiguration('description_file')

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        parameters=[{'robot_description': description_file}]
    )

    return LaunchDescription([
        declare_description_file,
        robot_state_publisher
    ])
```

```python
# launch/sensors.launch.py
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node

def generate_launch_description():
    # Declare arguments
    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation time'
    )

    use_sim_time = LaunchConfiguration('use_sim_time')

    # IMU driver
    imu_driver = Node(
        package='imu_driver',
        executable='imu_driver_node',
        parameters=[{'use_sim_time': use_sim_time}]
    )

    # Camera driver
    camera_driver = Node(
        package='camera_driver',
        executable='camera_node',
        parameters=[{'use_sim_time': use_sim_time}]
    )

    return LaunchDescription([
        declare_use_sim_time,
        imu_driver,
        camera_driver
    ])
```

### Main Launch File Including Modules

```python
# launch/humanoid_robot.launch.py
from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Declare launch arguments
    declare_use_sim_time = DeclareLaunchArgument(
        'use_sim_time',
        default_value='false',
        description='Use simulation time'
    )

    declare_robot_name = DeclareLaunchArgument(
        'robot_name',
        default_value='humanoid_robot',
        description='Name of the robot'
    )

    # Include other launch files
    robot_description_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('my_humanoid_package'),
                'launch',
                'robot_description.launch.py'
            ])
        ])
    )

    sensors_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('my_humanoid_package'),
                'launch',
                'sensors.launch.py'
            ])
        ])
    )

    controllers_launch = IncludeLaunchDescription(
        PythonLaunchDescriptionSource([
            PathJoinSubstitution([
                FindPackageShare('my_humanoid_package'),
                'launch',
                'controllers.launch.py'
            ])
        ])
    )

    return LaunchDescription([
        declare_use_sim_time,
        declare_robot_name,
        robot_description_launch,
        sensors_launch,
        controllers_launch
    ])
```

## Package Management for Humanoid Systems

### Multi-Package Architecture

For humanoid robotics, consider organizing functionality across multiple packages:

```
humanoid_common/
├── humanoid_description/     # Robot URDF and meshes
├── humanoid_control/         # Controllers and motion planning
├── humanoid_sensors/         # Sensor drivers and processing
├── humanoid_navigation/      # Navigation and path planning
├── humanoid_bringup/         # Launch files and bringup
└── humanoid_msgs/            # Custom message definitions
```

### Package Dependencies

In your package.xml, specify dependencies clearly:

```xml
<depend>control_msgs</depend>
<depend>sensor_msgs</depend>
<depend>geometry_msgs</depend>
<depend>std_msgs</depend>
<depend>trajectory_msgs</depend>
<depend>builtin_interfaces</depend>
<depend>tf2_ros</depend>
<depend>tf2_geometry_msgs</depend>
<depend>robot_state_publisher</depend>
<depend>joint_state_publisher</depend>
<depend>controller_manager</depend>
<depend>ros2_control</depend>
<depend>ros2_controllers</depend>
```

## Debugging Launch Files

### Common Issues and Solutions

1. **Package Not Found**
   ```bash
   # Check if package is in ROS path
   ros2 pkg list | grep package_name

   # Source your workspace
   source install/setup.bash
   ```

2. **Node Not Starting**
   ```bash
   # Check launch file syntax
   python3 launch/your_launch_file.py

   # Run with verbose output
   ros2 launch package_name launch_file.py --debug
   ```

3. **Parameter Issues**
   ```python
   # Use proper parameter loading
   parameters=[
       PathJoinSubstitution([FindPackageShare('pkg'), 'config', 'params.yaml']),
       {'param_name': 'param_value'}
   ]
   ```

### Launch File Testing

```python
# test_launch_file.py
import unittest
import launch
from launch import LaunchDescription
from launch_ros.actions import Node
import launch_testing.actions
import pytest

@pytest.mark.launch_test
def generate_test_description():
    test_node = Node(
        package='my_humanoid_package',
        executable='test_node',
        name='test_node'
    )

    return LaunchDescription([
        test_node,
        launch_testing.actions.ReadyToTest()
    ])

def test_node_launch(test_runner):
    # Test that the node launches successfully
    assert test_runner.wait_for_node('/test_node', timeout=5.0)
```

## Performance Considerations

### Launch File Optimization

- **Lazy Loading**: Start nodes only when needed
- **Resource Management**: Monitor CPU and memory usage
- **Dependency Management**: Order nodes properly
- **Parameter Efficiency**: Use shared parameter files

### Monitoring and Profiling

```python
# In launch file, add monitoring nodes
system_monitor = Node(
    package='system_monitor',
    executable='system_monitor',
    name='system_monitor',
    parameters=[
        {'use_sim_time': use_sim_time},
        {'monitor_interval': 1.0}
    ]
)
```

## Best Practices Summary

### Launch File Best Practices

1. **Modularity**: Break complex systems into smaller launch files
2. **Parameterization**: Use launch arguments for flexibility
3. **Documentation**: Comment complex launch files thoroughly
4. **Validation**: Test launch files regularly
5. **Error Handling**: Include appropriate error handling

### Package Best Practices

1. **Clear Boundaries**: Each package should have a clear purpose
2. **Dependency Management**: Minimize dependencies between packages
3. **Consistent Structure**: Follow ROS 2 conventions
4. **Testing**: Include tests for all packages
5. **Documentation**: Provide clear documentation

## Summary

Launch files and packages are essential for organizing and managing complex humanoid robot systems. Well-structured launch files allow you to start entire robot systems with a single command, while properly organized packages make your code maintainable and reusable. Understanding these concepts is crucial for building professional humanoid robotics applications.

Module 1 has provided you with a comprehensive foundation in ROS 2 for humanoid robotics, covering everything from basic concepts to advanced system organization. The next module will focus on digital twin technologies for simulation and testing.

## References

1. ROS 2 Launch Documentation: https://docs.ros.org/en/humble/How-To-Guides/Launch-system.html
2. ROS 2 Package Development: https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package.html
3. Best Practices for ROS 2 Packages: Community guidelines and examples