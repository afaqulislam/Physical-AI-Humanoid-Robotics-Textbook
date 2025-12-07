---
sidebar_position: 4
---

# URDF for Humanoids

## Learning Objectives

By the end of this chapter, you will be able to:
- Create detailed URDF models for humanoid robots
- Define joints, links, and kinematic chains for humanoids
- Implement proper inertial properties and collision geometry
- Use Xacro for parameterized and modular URDF descriptions
- Integrate URDF with ROS 2 for simulation and visualization

## Introduction to URDF

### What is URDF?

URDF (Unified Robot Description Format) is an XML format used to describe robot models in ROS. It defines the physical and visual properties of a robot, including links, joints, and their relationships.

### URDF Structure

A URDF file consists of:
- **Links**: Rigid bodies of the robot
- **Joints**: Connections between links
- **Visual**: How the robot appears in visualization
- **Collision**: How the robot interacts with the environment
- **Inertial**: Mass properties for physics simulation

## Basic URDF Structure

### Simple URDF Example

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.2 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.01"/>
    </inertial>
  </link>

  <!-- Head link -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
      <material name="white">
        <color rgba="1 1 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.05"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.2"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Joint connecting base to head -->
  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="10" velocity="1"/>
  </joint>
</robot>
```

## Links in URDF

### Link Properties

Each link can have:
- **Visual**: How it appears in visualization
- **Collision**: How it interacts with physics simulation
- **Inertial**: Mass and inertia properties

### Visual Properties

```xml
<link name="link_name">
  <visual>
    <!-- Position and orientation offset -->
    <origin xyz="0.1 0 0" rpy="0 0 1.57"/>

    <!-- Geometry definition -->
    <geometry>
      <!-- Box -->
      <box size="0.1 0.1 0.1"/>

      <!-- Cylinder -->
      <!-- <cylinder radius="0.05" length="0.1"/> -->

      <!-- Sphere -->
      <!-- <sphere radius="0.05"/> -->

      <!-- Mesh -->
      <!-- <mesh filename="package://my_robot/meshes/link_name.stl"/> -->
    </geometry>

    <!-- Material -->
    <material name="red">
      <color rgba="1 0 0 1"/>
      <!-- Or reference texture -->
      <!-- <texture filename="package://my_robot/materials/textures/red.png"/> -->
    </material>
  </visual>
</link>
```

### Collision Properties

```xml
<link name="link_name">
  <collision>
    <!-- Often simpler than visual geometry for performance -->
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <!-- Use simpler shapes for collision -->
      <box size="0.1 0.1 0.1"/>
    </geometry>
  </collision>
</link>
```

### Inertial Properties

```xml
<link name="link_name">
  <inertial>
    <!-- Mass in kg -->
    <mass value="0.5"/>

    <!-- Inertia matrix -->
    <inertia
      ixx="0.001" ixy="0" ixz="0"
      iyy="0.001" iyz="0"
      izz="0.001"/>
  </inertial>
</link>
```

## Joints in URDF

### Joint Types

- **revolute**: Rotational joint with limits
- **continuous**: Rotational joint without limits
- **prismatic**: Linear sliding joint
- **fixed**: No movement (rigid connection)
- **floating**: 6 DOF (not commonly used in URDF)
- **planar**: Movement on a plane

### Joint Definition

```xml
<joint name="joint_name" type="revolute">
  <!-- Links connected by this joint -->
  <parent link="parent_link_name"/>
  <child link="child_link_name"/>

  <!-- Position and orientation of joint -->
  <origin xyz="0.1 0 0" rpy="0 0 0"/>

  <!-- Axis of rotation/translation -->
  <axis xyz="0 0 1"/>

  <!-- Joint limits (for revolute and prismatic) -->
  <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>

  <!-- Joint dynamics -->
  <dynamics damping="0.1" friction="0.0"/>
</joint>
```

## Humanoid Robot Structure

### Typical Humanoid Kinematic Chain

```
base_link (torso)
├── head
├── left_shoulder
│   ├── left_upper_arm
│   ├── left_lower_arm
│   └── left_hand
├── right_shoulder
│   ├── right_upper_arm
│   ├── right_lower_arm
│   └── right_hand
├── left_hip
│   ├── left_upper_leg
│   ├── left_lower_leg
│   └── left_foot
└── right_hip
    ├── right_upper_leg
    ├── right_lower_leg
    └── right_foot
```

### Complete Humanoid URDF Example

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid_robot">
  <!-- Torso -->
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

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.08"/>
      </geometry>
      <material name="white">
        <color rgba="1 1 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.08"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.002" ixy="0" ixz="0" iyy="0.002" iyz="0" izz="0.002"/>
    </inertial>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.5" upper="0.5" effort="5" velocity="1"/>
  </joint>

  <!-- Left Arm -->
  <link name="left_shoulder">
    <visual>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="0.5"/>
      <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
    </inertial>
  </link>

  <joint name="left_shoulder_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_shoulder"/>
    <origin xyz="-0.15 0 0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
  </joint>

  <!-- Additional links and joints would continue similarly -->
</robot>
```

## Xacro for Parameterized URDF

### Introduction to Xacro

Xacro (XML Macros) allows you to create parameterized and reusable URDF files using macros and properties.

### Basic Xacro Example

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="param_humanoid">

  <!-- Properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  <xacro:property name="torso_length" value="0.5" />
  <xacro:property name="torso_width" value="0.3" />
  <xacro:property name="torso_height" value="0.2" />

  <!-- Material definitions -->
  <material name="black">
    <color rgba="0.0 0.0 0.0 1.0"/>
  </material>

  <material name="red">
    <color rgba="0.8 0.0 0.0 1.0"/>
  </material>

  <!-- Macro for creating a simple link -->
  <xacro:macro name="simple_link" params="name xyz size mass color">
    <link name="${name}">
      <visual>
        <origin xyz="${xyz}"/>
        <geometry>
          <box size="${size}"/>
        </geometry>
        <material name="${color}"/>
      </visual>
      <collision>
        <origin xyz="${xyz}"/>
        <geometry>
          <box size="${size}"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="${mass}"/>
        <inertia ixx="0.001" ixy="0" ixz="0" iyy="0.001" iyz="0" izz="0.001"/>
      </inertial>
    </link>
  </xacro:macro>

  <!-- Use the macro -->
  <xacro:simple_link name="torso" xyz="0 0 0" size="0.3 0.2 0.5" mass="10.0" color="black"/>

</robot>
```

### Advanced Xacro for Humanoid

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="advanced_humanoid">

  <!-- Robot parameters -->
  <xacro:property name="robot_name" value="my_humanoid" />
  <xacro:property name="torso_mass" value="10.0" />
  <xacro:property name="arm_mass" value="2.0" />
  <xacro:property name="leg_mass" value="3.0" />

  <!-- Default joint limits -->
  <xacro:property name="hip_limit" value="1.57" />
  <xacro:property name="knee_limit" value="1.57" />
  <xacro:property name="shoulder_limit" value="2.0" />

  <!-- Macro for humanoid limb -->
  <xacro:macro name="limb_chain" params="side prefix parent_link start_xyz joint_limits">
    <!-- Upper part -->
    <link name="${prefix}_upper">
      <visual>
        <geometry>
          <cylinder radius="0.05" length="0.3"/>
        </geometry>
        <material name="${side}">
          <color rgba="0.5 0.5 0.5 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.05" length="0.3"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="${arm_mass}"/>
        <inertia ixx="0.01" ixy="0" ixz="0" iyy="0.01" iyz="0" izz="0.005"/>
      </inertial>
    </link>

    <joint name="${prefix}_joint" type="revolute">
      <parent link="${parent_link}"/>
      <child link="${prefix}_upper"/>
      <origin xyz="${start_xyz}" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="${-joint_limits}" upper="${joint_limits}" effort="20" velocity="2"/>
    </joint>

    <!-- Lower part -->
    <link name="${prefix}_lower">
      <visual>
        <geometry>
          <cylinder radius="0.04" length="0.3"/>
        </geometry>
        <material name="${side}">
          <color rgba="0.5 0.5 0.5 1"/>
        </material>
      </visual>
      <collision>
        <geometry>
          <cylinder radius="0.04" length="0.3"/>
        </geometry>
      </collision>
      <inertial>
        <mass value="${arm_mass * 0.8}"/>
        <inertia ixx="0.008" ixy="0" ixz="0" iyy="0.008" iyz="0" izz="0.004"/>
      </inertial>
    </link>

    <joint name="${prefix}_lower_joint" type="revolute">
      <parent link="${prefix}_upper"/>
      <child link="${prefix}_lower"/>
      <origin xyz="0 0 -0.3" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="0" upper="${joint_limits}" effort="15" velocity="2"/>
    </joint>
  </xacro:macro>

  <!-- Torso -->
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
      <mass value="${torso_mass}"/>
      <inertia ixx="0.2" ixy="0" ixz="0" iyy="0.3" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Use macros to create limbs -->
  <xacro:limb_chain side="left_arm" prefix="left_arm" parent_link="base_link"
                   start_xyz="-0.15 0 0.1" joint_limits="${shoulder_limit}"/>
  <xacro:limb_chain side="right_arm" prefix="right_arm" parent_link="base_link"
                   start_xyz="0.15 0 0.1" joint_limits="${shoulder_limit}"/>

</robot>
```

## URDF for Simulation

### Gazebo-Specific Elements

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="gazebo_humanoid">

  <!-- Gazebo material -->
  <gazebo reference="base_link">
    <material>Gazebo/Blue</material>
    <mu1>0.2</mu1>
    <mu2>0.2</mu2>
  </gazebo>

  <!-- Transmission for joint control -->
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

  <!-- Gazebo plugin -->
  <gazebo>
    <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
      <robotNamespace>/humanoid</robotNamespace>
    </plugin>
  </gazebo>

</robot>
```

## Best Practices for Humanoid URDF

### Naming Conventions

- Use consistent naming: `left_arm_joint`, `right_leg_link`
- Follow ROS conventions: lowercase with underscores
- Be descriptive but concise

### Mass and Inertia

- Calculate realistic mass properties
- Use CAD software to calculate inertia tensors
- Verify with physics simulation

### Joint Limits

- Set appropriate limits based on physical constraints
- Consider safety margins
- Account for motor limitations

### Visualization vs Collision

- Use detailed meshes for visualization
- Use simplified shapes for collision
- Balance quality with performance

## Common URDF Issues and Solutions

### Self-Collision

```xml
<!-- Disable self-collision between specific links -->
<link name="link_name">
  <collision>
    <geometry>
      <box size="0.1 0.1 0.1"/>
    </geometry>
  </collision>
  <self_collide>false</self_collide>
</link>
```

### Joint Axis Direction

```xml
<!-- Ensure joint axes are correctly oriented -->
<joint name="joint_name" type="revolute">
  <parent link="parent_link"/>
  <child link="child_link"/>
  <origin xyz="0.1 0 0" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>  <!-- Z-axis rotation -->
  <limit lower="-1.57" upper="1.57" effort="10" velocity="1"/>
</joint>
```

### Coordinate Frame Consistency

- Use consistent coordinate frames (typically X forward, Y left, Z up)
- Verify joint origins and orientations
- Use RViz to visualize the robot structure

## URDF Validation

### Tools for Validation

```bash
# Check URDF syntax
check_urdf /path/to/robot.urdf

# Parse Xacro to URDF
xacro input.xacro > output.urdf

# Use URDF parser in ROS 2
ros2 run rviz2 rviz2  # Load robot model
```

### Common Validation Checks

- All joints have parent and child links
- No duplicate names
- Proper mass and inertia values
- Joint limits are valid
- Links are connected properly

## Integration with ROS 2

### Robot State Publisher

```python
from launch import LaunchDescription
from launch_ros.actions import Node
from ament_index_python.packages import get_package_share_path

def generate_launch_description():
    urdf_path = get_package_share_path('my_robot_description') / 'urdf' / 'humanoid.urdf.xacro'

    return LaunchDescription([
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': open(urdf_path).read()}]
        ),
        Node(
            package='joint_state_publisher_gui',
            executable='joint_state_publisher_gui'
        ),
        Node(
            package='rviz2',
            executable='rviz2'
        )
    ])
```

## Summary

URDF is fundamental for representing humanoid robots in ROS 2. Creating accurate and efficient URDF models is crucial for simulation, visualization, and control. Using Xacro helps create parameterized and maintainable robot descriptions.

The next chapter will cover Launch Files & Packages, which are essential for managing complex humanoid robot systems.

## References

1. ROS URDF Documentation: http://wiki.ros.org/urdf
2. Xacro Tutorial: http://wiki.ros.org/xacro
3. Robot Modeling with URDF: Best practices and examples