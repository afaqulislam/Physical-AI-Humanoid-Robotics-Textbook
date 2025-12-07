---
sidebar_position: 3
---

# Nav2 for Humanoid Motion Planning

## Learning Objectives

By the end of this chapter, you will be able to:
- Configure Navigation 2 (Nav2) for humanoid robot navigation
- Implement custom motion planners for bipedal locomotion
- Integrate perception data from Isaac ROS with navigation planning
- Handle dynamic obstacles and human-aware navigation
- Optimize navigation parameters for humanoid-specific constraints
- Deploy navigation systems on humanoid platforms

## Introduction to Navigation 2 (Nav2)

### What is Nav2?

Navigation 2 (Nav2) is the next-generation autonomous navigation system for ROS 2, designed to replace the original ROS Navigation stack. For humanoid robotics, Nav2 provides:

- **Flexible architecture**: Modular design for custom navigation behaviors
- **Advanced planning**: Sophisticated path planning algorithms
- **Safety features**: Collision avoidance and emergency stopping
- **Dynamic reconfiguration**: Runtime parameter adjustment
- **Multi-robot support**: Coordination between multiple robots
- **Simulation integration**: Seamless simulation-to-reality transfer

### Nav2 Architecture for Humanoids

```
[Perception Layer] → [Costmap Layer] → [Path Planner] → [Controller] → [Humanoid Robot]
      ↑                   ↑                ↑            ↑           ↑
[Isaac ROS] ←→ [Local/Global Costmaps] ←→ [A*/Dijkstra] ←→ [MPC/TEB] ←→ [Hardware]
```

### Key Components

1. **Navigation Server**: Main orchestrator of navigation tasks
2. **Path Planner**: Global path planning (NavFn, A*, Dijkstra)
3. **Controller**: Local path following (DWB, TEB, MPC)
4. **Costmap**: Obstacle representation and collision checking
5. **Recovery Behaviors**: Actions when navigation fails
6. **Smoother**: Path smoothing algorithms

## Nav2 Installation and Setup

### System Requirements

- **ROS 2**: Humble Hawksbill or later
- **OS**: Ubuntu 20.04/22.04
- **Dependencies**: OpenCV, PCL, Eigen, Boost
- **Sensors**: LiDAR, cameras, IMU, odometry

### Installation

```bash
# Install Nav2 packages
sudo apt update
sudo apt install ros-humble-navigation2
sudo apt install ros-humble-nav2-bringup
sudo apt install ros-humble-nav2-rviz-plugins
sudo apt install ros-humble-nav2-common

# Install additional dependencies
sudo apt install ros-humble-dwb-core
sudo apt install ros-humble-teb-local-planner
sudo apt install ros-humble-slam-toolbox
```

### Basic Configuration

```yaml
# config/nav2_params.yaml
amcl:
  ros__parameters:
    use_sim_time: True
    alpha1: 0.2
    alpha2: 0.2
    alpha3: 0.2
    alpha4: 0.2
    alpha5: 0.2
    base_frame_id: "base_footprint"
    beam_skip_distance: 0.5
    beam_skip_error_threshold: 0.9
    beam_skip_threshold: 0.3
    do_beamskip: false
    global_frame_id: "map"
    lambda_short: 0.1
    laser_likelihood_max_dist: 2.0
    laser_max_range: 100.0
    laser_min_range: -1.0
    laser_model_type: "likelihood_field"
    max_beams: 60
    max_particles: 2000
    min_particles: 500
    odom_frame_id: "odom"
    pf_err: 0.05
    pf_z: 0.99
    recovery_alpha_fast: 0.0
    recovery_alpha_slow: 0.0
    resample_interval: 1
    robot_model_type: "nav2_amcl::DifferentialMotionModel"
    save_pose_rate: 0.5
    sigma_hit: 0.2
    tf_broadcast: true
    transform_tolerance: 1.0
    update_min_a: 0.2
    update_min_d: 0.25
    z_hit: 0.5
    z_max: 0.05
    z_rand: 0.5
    z_short: 0.05

amcl_map_client:
  ros__parameters:
    use_sim_time: True

amcl_rclcpp_node:
  ros__parameters:
    use_sim_time: True

bt_navigator:
  ros__parameters:
    use_sim_time: True
    global_frame: map
    robot_base_frame: base_link
    odom_topic: /odom
    bt_loop_duration: 10
    default_server_timeout: 20
    enable_groot_monitoring: True
    groot_zmq_publisher_port: 1666
    groot_zmq_server_port: 1667
    # Specify the path to the Behavior Tree XML file
    default_nav_through_poses_bt_xml: "navigate_w_replanning_and_recovery.xml"
    default_nav_to_pose_bt_xml: "navigate_w_replanning_and_recovery.xml"
    # Plugins
    plugin_lib_names:
    - nav2_compute_path_to_pose_action_bt_node
    - nav2_compute_path_through_poses_action_bt_node
    - nav2_smooth_path_action_bt_node
    - nav2_follow_path_action_bt_node
    - nav2_spin_action_bt_node
    - nav2_wait_action_bt_node
    - nav2_assisted_teleop_action_bt_node
    - nav2_back_up_action_bt_node
    - nav2_drive_on_heading_bt_node
    - nav2_clear_costmap_service_bt_node
    - nav2_is_stuck_condition_bt_node
    - nav2_goal_reached_condition_bt_node
    - nav2_goal_updated_condition_bt_node
    - nav2_globally_updated_goal_condition_bt_node
    - nav2_is_path_valid_condition_bt_node
    - nav2_initial_pose_received_condition_bt_node
    - nav2_reinitialize_global_localization_service_bt_node
    - nav2_rate_controller_bt_node
    - nav2_distance_controller_bt_node
    - nav2_speed_controller_bt_node
    - nav2_truncate_path_action_bt_node
    - nav2_truncate_path_local_action_bt_node
    - nav2_goal_updater_node_bt_node
    - nav2_recovery_node_bt_node
    - nav2_pipeline_sequence_bt_node
    - nav2_round_robin_node_bt_node
    - nav2_transform_available_condition_bt_node
    - nav2_time_expired_condition_bt_node
    - nav2_path_expiring_timer_condition
    - nav2_distance_traveled_condition_bt_node
    - nav2_single_trigger_bt_node
    - nav2_is_battery_low_condition_bt_node
    - nav2_navigate_through_poses_action_bt_node
    - nav2_navigate_to_pose_action_bt_node
    - nav2_remove_passed_goals_action_bt_node
    - nav2_planner_selector_bt_node
    - nav2_controller_selector_bt_node
    - nav2_goal_checker_selector_bt_node
    - nav2_controller_cancel_bt_node
    - nav2_path_longer_on_approach_bt_node
    - nav2_wait_cancel_bt_node
    - nav2_spin_cancel_bt_node
    - nav2_back_up_cancel_bt_node
    - nav2_assisted_teleop_cancel_bt_node
    - nav2_drive_on_heading_cancel_bt_node

bt_navigator_rclcpp_node:
  ros__parameters:
    use_sim_time: True

controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 20.0
    min_x_velocity_threshold: 0.001
    min_y_velocity_threshold: 0.5
    min_theta_velocity_threshold: 0.001
    failure_tolerance: 0.3
    progress_checker_plugin: "progress_checker"
    goal_checker_plugin: "goal_checker"
    controller_plugins: ["FollowPath"]

    # DWB parameters
    FollowPath:
      plugin: "dwb_core::DWBLocalPlanner"
      debug_trajectory_details: True
      min_vel_x: 0.0
      min_vel_y: 0.0
      max_vel_x: 0.5
      max_vel_y: 0.0
      max_vel_theta: 1.0
      min_speed_xy: 0.0
      max_speed_xy: 0.5
      min_speed_theta: 0.0
      acc_lim_x: 2.5
      acc_lim_y: 0.0
      acc_lim_theta: 3.2
      decel_lim_x: -2.5
      decel_lim_y: 0.0
      decel_lim_theta: -3.2
      vx_samples: 20
      vy_samples: 5
      vtheta_samples: 20
      sim_time: 1.7
      linear_granularity: 0.05
      angular_granularity: 0.025
      transform_tolerance: 0.2
      xy_goal_tolerance: 0.25
      trans_stopped_velocity: 0.1
      short_circuit_trajectory_evaluation: True
      stateful: True
      critics: ["RotateToGoal", "Oscillation", "BaseObstacle", "GoalAlign", "PathAlign", "PathDist", "GoalDist"]
      BaseObstacle.scale: 0.02
      PathAlign.scale: 32.0
      PathAlign.forward_point_distance: 0.1
      GoalAlign.scale: 24.0
      GoalAlign.forward_point_distance: 0.1
      PathDist.scale: 32.0
      GoalDist.scale: 24.0
      RotateToGoal.scale: 32.0
      RotateToGoal.slowing_factor: 5.0
      RotateToGoal.lookahead_time: -1.0

controller_server_rclcpp_node:
  ros__parameters:
    use_sim_time: True

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_link
      use_sim_time: True
      rolling_window: true
      width: 3
      height: 3
      resolution: 0.05
      robot_radius: 0.3
      plugins: ["voxel_layer", "inflation_layer"]
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        publish_voxel_map: True
        origin_z: 0.0
        z_resolution: 0.2
        z_voxels: 10
        max_obstacle_height: 2.0
        mark_threshold: 0
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        map_subscribe_transient_local: True
  local_costmap_client:
    ros__parameters:
      use_sim_time: True
  local_costmap_rclcpp_node:
    ros__parameters:
      use_sim_time: True

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 1.0
      publish_frequency: 1.0
      global_frame: map
      robot_base_frame: base_link
      use_sim_time: True
      robot_radius: 0.3
      resolution: 0.05
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]
      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 2.0
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 3.0
          raytrace_min_range: 0.0
          obstacle_max_range: 2.5
          obstacle_min_range: 0.0
      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 3.0
        inflation_radius: 0.55
  global_costmap_client:
    ros__parameters:
      use_sim_time: True
  global_costmap_rclcpp_node:
    ros__parameters:
      use_sim_time: True

map_server:
  ros__parameters:
    use_sim_time: True
    yaml_filename: "turtlebot3_world.yaml"

map_saver:
  ros__parameters:
    use_sim_time: True
    save_map_timeout: 5.0
    free_thresh_default: 0.25
    occupied_thresh_default: 0.65

planner_server:
  ros__parameters:
    expected_planner_frequency: 20.0
    use_sim_time: True
    planner_plugins: ["GridBased"]
    GridBased:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.5
      use_astar: false
      allow_unknown: true

planner_server_rclcpp_node:
  ros__parameters:
    use_sim_time: True

smoother_server:
  ros__parameters:
    use_sim_time: True
    smoother_plugins: ["simple_smoother"]
    simple_smoother:
      plugin: "nav2_smoother::SimpleSmoother"
      tolerance: 1.0e-10
      max_its: 1000
      do_refinement: True

behavior_server:
  ros__parameters:
    costmap_topic: local_costmap/costmap_raw
    footprint_topic: local_costmap/published_footprint
    cycle_frequency: 10.0
    behavior_plugins: ["spin", "backup", "drive_on_heading", "assisted_teleop", "wait"]
    spin:
      plugin: "nav2_behaviors/Spin"
      spin_dist: 1.57
    backup:
      plugin: "nav2_behaviors/BackUp"
      backup_dist: 0.15
      backup_speed: 0.025
    drive_on_heading:
      plugin: "nav2_behaviors/DriveOnHeading"
      drive_on_heading_max_linear_speed: 0.4
      drive_on_heading_max_angular_speed: 1.0
    wait:
      plugin: "nav2_behaviors/Wait"
      wait_duration: 1.0

robot_state_publisher:
  ros__parameters:
    use_sim_time: True

waypoint_follower:
  ros__parameters:
    loop_rate: 20
    stop_on_failure: false
    waypoint_task_executor_plugin: "wait_at_waypoint"
    wait_at_waypoint:
      plugin: "nav2_waypoint_follower::WaitAtWaypoint"
      enabled: true
      waypoint_pause_duration: 200
```

## Humanoid-Specific Navigation Configuration

### Bipedal Motion Constraints

```yaml
# config/humanoid_nav2_params.yaml
# Humanoid-specific Nav2 configuration
controller_server:
  ros__parameters:
    use_sim_time: True
    controller_frequency: 10.0  # Lower frequency for humanoid stability
    min_x_velocity_threshold: 0.05  # Minimum forward speed
    min_y_velocity_threshold: 0.05  # Minimum lateral speed
    min_theta_velocity_threshold: 0.05  # Minimum angular speed
    failure_tolerance: 0.5  # Higher tolerance for humanoid dynamics
    progress_checker_plugin: "humanoid_progress_checker"
    goal_checker_plugin: "humanoid_goal_checker"
    controller_plugins: ["HumanoidMPCController"]

    # Humanoid MPC Controller
    HumanoidMPCController:
      plugin: "nav2_mpc_controller::MPC"
      # Humanoid-specific parameters
      time_steps: 20
      time_interval: 0.1
      control_horizon: 10
      # Kinematic constraints for bipedal locomotion
      cmd_vel_limits:
        x: [0.0, 0.4]  # Forward speed limits (m/s)
        y: [-0.2, 0.2]  # Lateral speed limits (m/s)
        theta: [-0.5, 0.5]  # Angular speed limits (rad/s)
      # Acceleration limits for stable walking
      cmd_acc_limits:
        x: [0.5, 1.0]  # Forward acceleration (m/s²)
        y: [0.5, 1.0]  # Lateral acceleration (m/s²)
        theta: [1.0, 2.0]  # Angular acceleration (rad/s²)
      # Cost function weights for humanoid walking
      state_cost:
        x: 1.0
        y: 1.0
        theta: 0.5
        vx: 0.1
        vy: 0.1
        vtheta: 0.1
      control_cost:
        x: 0.01
        y: 0.01
        theta: 0.01
      terminal_state_cost:
        x: 1.0
        y: 1.0
        theta: 0.5

local_costmap:
  local_costmap:
    ros__parameters:
      update_frequency: 5.0
      publish_frequency: 2.0
      global_frame: odom
      robot_base_frame: base_footprint  # Use base_footprint for humanoid
      use_sim_time: True
      rolling_window: true
      width: 4  # Wider for humanoid step planning
      height: 4
      resolution: 0.05  # Fine resolution for precise foot placement
      robot_radius: 0.4  # Larger radius for humanoid safety
      plugins: ["voxel_layer", "inflation_layer", "footprint_layer"]

      # Humanoid-specific inflation
      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 5.0  # Higher scaling for safety
        inflation_radius: 0.8  # Larger inflation for humanoid steps
        inflate_unknown: false

      # 3D obstacle detection for humanoid navigation
      voxel_layer:
        plugin: "nav2_costmap_2d::VoxelLayer"
        enabled: True
        publish_voxel_map: True
        origin_z: 0.0
        z_resolution: 0.1  # Higher resolution for step detection
        z_voxels: 20  # More voxels for height variation
        max_obstacle_height: 1.8  # Up to humanoid height
        unknown_threshold: 15
        mark_threshold: 0
        observation_sources: scan depth_camera
        scan:
          topic: /scan
          max_obstacle_height: 1.8
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 5.0  # Longer range for planning
          raytrace_min_range: 0.1
          obstacle_max_range: 4.0
          obstacle_min_range: 0.1
        depth_camera:
          topic: /camera/depth/image_raw
          max_obstacle_height: 1.8
          clearing: True
          marking: True
          data_type: "PointCloud2"
          expected_update_rate: 10.0
          observation_persistence: 0.0
          max_obstacle_range: 4.0
          min_obstacle_range: 0.1

global_costmap:
  global_costmap:
    ros__parameters:
      update_frequency: 0.5  # Slower updates for humanoid path planning
      publish_frequency: 0.5
      global_frame: map
      robot_base_frame: base_footprint
      use_sim_time: True
      robot_radius: 0.4
      resolution: 0.1  # Coarser for global planning
      track_unknown_space: true
      plugins: ["static_layer", "obstacle_layer", "inflation_layer"]

      obstacle_layer:
        plugin: "nav2_costmap_2d::ObstacleLayer"
        enabled: True
        observation_sources: scan
        scan:
          topic: /scan
          max_obstacle_height: 1.8
          clearing: True
          marking: True
          data_type: "LaserScan"
          raytrace_max_range: 10.0
          raytrace_min_range: 0.0
          obstacle_max_range: 8.0
          obstacle_min_range: 0.0

      static_layer:
        plugin: "nav2_costmap_2d::StaticLayer"
        map_subscribe_transient_local: True

      inflation_layer:
        plugin: "nav2_costmap_2d::InflationLayer"
        cost_scaling_factor: 5.0
        inflation_radius: 1.0  # Larger for humanoid safety

planner_server:
  ros__parameters:
    expected_planner_frequency: 1.0  # Lower frequency for humanoid planning
    use_sim_time: True
    planner_plugins: ["HumanoidGridPlanner", "HumanoidAStar"]
    HumanoidGridPlanner:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.8  # Higher tolerance for humanoid navigation
      use_astar: false
      allow_unknown: true
    HumanoidAStar:
      plugin: "nav2_navfn_planner/NavfnPlanner"
      tolerance: 0.8
      use_astar: true  # Use A* for better path quality
      allow_unknown: false
```

## Custom Path Planners for Humanoids

### Humanoid Path Planner Node

```python
# Custom humanoid path planner
import rclpy
from rclpy.node import Node
from nav_msgs.msg import Path
from geometry_msgs.msg import PoseStamped, Point
from sensor_msgs.msg import LaserScan
from visualization_msgs.msg import Marker, MarkerArray
from builtin_interfaces.msg import Duration
from nav2_msgs.action import ComputePathToPose
from nav2_util.lifecycle_node import LifecycleNode
from rclpy.action import ActionServer
import numpy as np
from scipy.spatial import distance
import math

class HumanoidPathPlanner(LifecycleNode):
    def __init__(self):
        super().__init__('humanoid_path_planner')

        # Action server for path computation
        self._action_server = ActionServer(
            self,
            ComputePathToPose,
            'compute_path_to_pose',
            self.execute_path_planning
        )

        # Publishers
        self.path_pub = self.create_publisher(Path, 'plan', 10)
        self.visualization_pub = self.create_publisher(MarkerArray, 'path_visualization', 10)

        # Subscribers
        self.scan_sub = self.create_subscription(
            LaserScan,
            'scan',
            self.scan_callback,
            10
        )

        # Humanoid-specific parameters
        self.step_length = 0.3  # Maximum step length (m)
        self.step_width = 0.2   # Maximum step width (m)
        self.turn_radius = 0.5  # Minimum turning radius (m)
        self.clearance = 0.4    # Safety clearance (m)

        # Costmap for humanoid navigation
        self.costmap_resolution = 0.05
        self.costmap_width = 200  # cells
        self.costmap_height = 200  # cells
        self.costmap_origin = [0, 0]  # [x, y] in map coordinates

    def execute_path_planning(self, goal_handle):
        """Execute path planning for humanoid robot"""
        self.get_logger().info('Received path planning request')

        start = goal_handle.request.start.pose
        goal = goal_handle.request.goal.pose

        # Plan path considering humanoid constraints
        path = self.plan_humanoid_path(start, goal)

        if path is not None:
            # Publish path for visualization
            self.publish_path(path)

            # Create result
            result = ComputePathToPose.Result()
            result.path = path
            goal_handle.succeed()

            self.get_logger().info('Path planning succeeded')
            return result
        else:
            goal_handle.abort()
            self.get_logger().error('Path planning failed')
            return ComputePathToPose.Result()

    def plan_humanoid_path(self, start, goal):
        """Plan path considering humanoid locomotion constraints"""
        # Convert poses to path
        planned_path = Path()
        planned_path.header.frame_id = "map"
        planned_path.header.stamp = self.get_clock().now().to_msg()

        # Check if direct path is feasible considering humanoid constraints
        if self.is_direct_path_feasible(start, goal):
            # Create direct path with intermediate waypoints
            waypoints = self.create_direct_path_with_waypoints(start, goal)
        else:
            # Use A* or other algorithm considering humanoid constraints
            waypoints = self.plan_with_constraints(start, goal)

        # Add waypoints to path
        for waypoint in waypoints:
            pose_stamped = PoseStamped()
            pose_stamped.header.frame_id = "map"
            pose_stamped.pose.position.x = waypoint[0]
            pose_stamped.pose.position.y = waypoint[1]
            pose_stamped.pose.position.z = 0.0
            pose_stamped.pose.orientation.w = 1.0  # Default orientation

            # Calculate orientation to next point
            if waypoints.index(waypoint) < len(waypoints) - 1:
                next_point = waypoints[waypoints.index(waypoint) + 1]
                yaw = math.atan2(next_point[1] - waypoint[1], next_point[0] - waypoint[0])
                pose_stamped.pose.orientation.z = math.sin(yaw / 2)
                pose_stamped.pose.orientation.w = math.cos(yaw / 2)

            planned_path.poses.append(pose_stamped)

        return planned_path

    def is_direct_path_feasible(self, start, goal):
        """Check if direct path is feasible for humanoid"""
        # Calculate distance
        dist = math.sqrt((goal.position.x - start.position.x)**2 +
                        (goal.position.y - start.position.y)**2)

        # Check if distance is within single step capability
        if dist <= self.step_length * 0.8:  # 80% of step length for safety
            # Check for obstacles along the path
            return self.check_path_clearance(start, goal)

        return False

    def check_path_clearance(self, start, goal):
        """Check if path has sufficient clearance for humanoid"""
        # Sample points along the path
        num_samples = int(math.sqrt((goal.position.x - start.position.x)**2 +
                                   (goal.position.y - start.position.y)**2) / 0.1)

        for i in range(num_samples + 1):
            t = i / num_samples if num_samples > 0 else 0
            x = start.position.x + t * (goal.position.x - start.position.x)
            y = start.position.y + t * (goal.position.y - start.position.y)

            # Check if point is in free space with clearance
            if not self.is_point_clear(x, y, self.clearance):
                return False

        return True

    def is_point_clear(self, x, y, clearance):
        """Check if point is clear of obstacles with given clearance"""
        # This would check against costmap with clearance
        # For now, return True (implement based on your costmap)
        return True

    def plan_with_constraints(self, start, goal):
        """Plan path using A* with humanoid constraints"""
        # Implement A* algorithm considering humanoid step constraints
        # This is a simplified version - full implementation would be more complex

        # For now, return a simple path
        waypoints = []

        # Calculate intermediate waypoints
        dx = goal.position.x - start.position.x
        dy = goal.position.y - start.position.y
        dist = math.sqrt(dx*dx + dy*dy)

        if dist > 0:
            # Create waypoints with maximum step size
            num_steps = int(dist / (self.step_length * 0.8))  # 80% of max step
            for i in range(num_steps + 1):
                t = i / num_steps if num_steps > 0 else 0
                x = start.position.x + t * dx
                y = start.position.y + t * dy
                waypoints.append([x, y])

        # Ensure last waypoint is the goal
        waypoints.append([goal.position.x, goal.position.y])

        return waypoints

    def create_direct_path_with_waypoints(self, start, goal):
        """Create direct path with appropriate waypoints"""
        waypoints = []

        # Add start point
        waypoints.append([start.position.x, start.position.y])

        # Add goal point
        waypoints.append([goal.position.x, goal.position.y])

        return waypoints

    def scan_callback(self, msg):
        """Process laser scan for obstacle detection"""
        # Update costmap based on laser scan
        # This would update the internal costmap representation
        pass

    def publish_path(self, path):
        """Publish planned path for visualization"""
        self.path_pub.publish(path)

        # Create visualization markers
        marker_array = MarkerArray()

        # Path line marker
        line_marker = Marker()
        line_marker.header.frame_id = "map"
        line_marker.header.stamp = self.get_clock().now().to_msg()
        line_marker.ns = "path"
        line_marker.id = 0
        line_marker.type = Marker.LINE_STRIP
        line_marker.action = Marker.ADD
        line_marker.pose.orientation.w = 1.0
        line_marker.scale.x = 0.05  # Line width
        line_marker.color.r = 0.0
        line_marker.color.g = 1.0
        line_marker.color.b = 0.0
        line_marker.color.a = 1.0

        for pose_stamped in path.poses:
            point = Point()
            point.x = pose_stamped.pose.position.x
            point.y = pose_stamped.pose.position.y
            point.z = 0.05  # Slightly above ground
            line_marker.points.append(point)

        marker_array.markers.append(line_marker)

        # Publish visualization
        self.visualization_pub.publish(marker_array)
```

## Humanoid-Specific Controllers

### MPC Controller for Humanoid Locomotion

```python
# Model Predictive Controller for humanoid navigation
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped
from nav_msgs.msg import Path
from sensor_msgs.msg import LaserScan
from tf2_ros import TransformListener, Buffer
from visualization_msgs.msg import MarkerArray
import numpy as np
from scipy.optimize import minimize
import math

class HumanoidMPCController(Node):
    def __init__(self):
        super().__init__('humanoid_mpc_controller')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.visualization_pub = self.create_publisher(MarkerArray, 'mpc_visualization', 10)

        # Subscribers
        self.path_sub = self.create_subscription(
            Path,
            'plan',
            self.path_callback,
            10
        )

        self.scan_sub = self.create_subscription(
            LaserScan,
            'scan',
            self.scan_callback,
            10
        )

        self.odom_sub = self.create_subscription(
            Odometry,
            'odom',
            self.odom_callback,
            10
        )

        # TF listener for robot pose
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # MPC parameters
        self.horizon = 20  # Prediction horizon
        self.dt = 0.1      # Time step (s)
        self.control_horizon = 10  # Control horizon

        # Robot constraints
        self.max_vel_x = 0.4   # m/s
        self.max_vel_y = 0.2   # m/s
        self.max_vel_theta = 0.5  # rad/s
        self.max_acc_x = 0.5   # m/s²
        self.max_acc_y = 0.3   # m/s²
        self.max_acc_theta = 1.0  # rad/s²

        # MPC weights
        self.state_weights = [1.0, 1.0, 0.5, 0.1, 0.1, 0.1]  # [x, y, theta, vx, vy, vtheta]
        self.control_weights = [0.01, 0.01, 0.01]  # [ax, ay, atheta]
        self.terminal_weights = [1.0, 1.0, 0.5]  # [x, y, theta]

        # Internal state
        self.current_path = None
        self.current_pose = None
        self.current_velocity = None
        self.obstacles = []

        # Timer for control loop
        self.control_timer = self.create_timer(0.1, self.control_loop)

    def path_callback(self, msg):
        """Receive planned path"""
        self.current_path = msg

    def scan_callback(self, msg):
        """Process laser scan for obstacle detection"""
        # Convert laser scan to obstacle points
        self.obstacles = []
        angle_min = msg.angle_min
        angle_increment = msg.angle_increment

        for i, range_val in enumerate(msg.ranges):
            if msg.range_min <= range_val <= msg.range_max:
                angle = angle_min + i * angle_increment
                x = range_val * math.cos(angle)
                y = range_val * math.sin(angle)
                self.obstacles.append([x, y])

    def odom_callback(self, msg):
        """Process odometry for current state"""
        self.current_pose = msg.pose.pose
        self.current_velocity = msg.twist.twist

    def control_loop(self):
        """Main MPC control loop"""
        if self.current_path is None or self.current_pose is None:
            return

        # Get current state
        x = self.current_pose.position.x
        y = self.current_pose.position.y
        theta = self.get_yaw_from_quaternion(self.current_pose.orientation)

        vx = self.current_velocity.linear.x
        vy = self.current_velocity.linear.y
        vtheta = self.current_velocity.angular.z

        current_state = np.array([x, y, theta, vx, vy, vtheta])

        # Get reference trajectory from path
        reference_trajectory = self.get_reference_trajectory(current_state)

        if reference_trajectory is not None and len(reference_trajectory) > 0:
            # Solve MPC optimization problem
            optimal_controls = self.solve_mpc(current_state, reference_trajectory)

            if optimal_controls is not None:
                # Apply first control input
                cmd_vel = Twist()
                cmd_vel.linear.x = optimal_controls[0][0]
                cmd_vel.linear.y = optimal_controls[0][1]
                cmd_vel.angular.z = optimal_controls[0][2]

                # Publish command
                self.cmd_vel_pub.publish(cmd_vel)

                # Publish visualization
                self.publish_mpc_visualization(current_state, reference_trajectory, optimal_controls)

    def get_reference_trajectory(self, current_state):
        """Extract reference trajectory from path"""
        if self.current_path is None or len(self.current_path.poses) == 0:
            return None

        reference_trajectory = []

        # Find closest point on path
        current_pos = np.array([current_state[0], current_state[1]])
        closest_idx = 0
        min_dist = float('inf')

        for i, pose_stamped in enumerate(self.current_path.poses):
            path_pos = np.array([pose_stamped.pose.position.x, pose_stamped.pose.position.y])
            dist = np.linalg.norm(current_pos - path_pos)
            if dist < min_dist:
                min_dist = dist
                closest_idx = i

        # Extract next N points as reference trajectory
        for i in range(min(closest_idx + self.horizon, len(self.current_path.poses))):
            pose = self.current_path.poses[i].pose
            yaw = self.get_yaw_from_quaternion(pose.orientation)
            reference_trajectory.append([pose.position.x, pose.position.y, yaw, 0, 0, 0])  # Assume zero velocity reference

        # Pad with last point if needed
        while len(reference_trajectory) < self.horizon:
            if len(reference_trajectory) > 0:
                reference_trajectory.append(reference_trajectory[-1])
            else:
                break

        return np.array(reference_trajectory)

    def solve_mpc(self, current_state, reference_trajectory):
        """Solve MPC optimization problem"""
        # Define state and control dimensions
        n_states = 6  # [x, y, theta, vx, vy, vtheta]
        n_controls = 3  # [ax, ay, atheta]

        # Initial guess for control sequence
        initial_controls = np.zeros((self.control_horizon, n_controls))

        # Flatten initial controls for optimization
        initial_flat = initial_controls.flatten()

        # Define constraints
        constraints = []

        # State dynamics constraints
        for k in range(self.control_horizon):
            constraints.append({
                'type': 'eq',
                'fun': lambda vars, k=k: self.state_dynamics_constraint(vars, k, current_state, reference_trajectory)
            })

        # Control bounds
        control_bounds = []
        for _ in range(self.control_horizon * n_controls):
            control_bounds.append((-1.0, 1.0))  # Will be refined in cost function

        # Solve optimization problem
        try:
            result = minimize(
                self.mpc_cost_function,
                initial_flat,
                args=(current_state, reference_trajectory),
                method='SLSQP',
                bounds=control_bounds,
                constraints=constraints,
                options={'maxiter': 100}
            )

            if result.success:
                # Reshape optimal controls
                optimal_flat = result.x
                optimal_controls = optimal_flat.reshape((self.control_horizon, n_controls))

                # Apply constraints to ensure feasibility
                for i in range(len(optimal_controls)):
                    optimal_controls[i][0] = np.clip(optimal_controls[i][0], -self.max_acc_x, self.max_acc_x)
                    optimal_controls[i][1] = np.clip(optimal_controls[i][1], -self.max_acc_y, self.max_acc_y)
                    optimal_controls[i][2] = np.clip(optimal_controls[i][2], -self.max_acc_theta, self.max_acc_theta)

                return optimal_controls
            else:
                self.get_logger().warn('MPC optimization failed')
                return None

        except Exception as e:
            self.get_logger().error(f'MPC optimization error: {e}')
            return None

    def mpc_cost_function(self, flat_controls, current_state, reference_trajectory):
        """MPC cost function"""
        n_controls = 3
        n_states = 6

        # Reshape controls
        controls = flat_controls.reshape((self.control_horizon, n_controls))

        # Simulate trajectory
        state = current_state.copy()
        total_cost = 0.0

        for k in range(self.control_horizon):
            # Apply control and simulate dynamics
            next_state = self.integrate_dynamics(state, controls[k])

            # State cost
            if k < len(reference_trajectory):
                state_error = next_state[:3] - reference_trajectory[k][:3]  # Only position/orientation error
                state_cost = (np.array(self.state_weights[:3]) * (state_error ** 2)).sum()
            else:
                state_cost = 0.0

            # Control cost
            control_cost = (np.array(self.control_weights) * (controls[k] ** 2)).sum()

            # Obstacle avoidance cost
            obstacle_cost = self.compute_obstacle_cost(next_state[:2])

            total_cost += state_cost + control_cost + obstacle_cost

            # Update state for next iteration
            state = next_state

        # Terminal cost
        if len(reference_trajectory) > 0:
            final_state_error = state[:3] - reference_trajectory[-1][:3]
            terminal_cost = (np.array(self.terminal_weights) * (final_state_error ** 2)).sum()
            total_cost += terminal_cost

        return total_cost

    def state_dynamics_constraint(self, flat_controls, k, current_state, reference_trajectory):
        """State dynamics constraints for optimization"""
        n_controls = 3
        controls = flat_controls.reshape((self.control_horizon, n_controls))

        # Start from current state or previous state
        if k == 0:
            state = current_state
        else:
            # Need to simulate to get previous state
            temp_state = current_state.copy()
            for i in range(k):
                temp_state = self.integrate_dynamics(temp_state, controls[i])
            state = temp_state

        # Simulate next state
        next_state = self.integrate_dynamics(state, controls[k])

        # This would be part of a more complex constraint system
        # For now, return 0 (satisfied constraint)
        return 0.0

    def integrate_dynamics(self, state, control):
        """Integrate humanoid dynamics"""
        x, y, theta, vx, vy, vtheta = state
        ax, ay, atheta = control

        # Simple kinematic model integration
        new_vx = vx + ax * self.dt
        new_vy = vy + ay * self.dt
        new_vtheta = vtheta + atheta * self.dt

        # Apply velocity limits
        new_vx = np.clip(new_vx, -self.max_vel_x, self.max_vel_x)
        new_vy = np.clip(new_vy, -self.max_vel_y, self.max_vel_y)
        new_vtheta = np.clip(new_vtheta, -self.max_vel_theta, self.max_vel_theta)

        # Update positions
        new_x = x + new_vx * self.dt
        new_y = y + new_vy * self.dt
        new_theta = theta + new_vtheta * self.dt

        return np.array([new_x, new_y, new_theta, new_vx, new_vy, new_theta])

    def compute_obstacle_cost(self, position):
        """Compute cost for obstacle avoidance"""
        cost = 0.0
        min_distance = float('inf')

        for obs in self.obstacles:
            dist = math.sqrt((position[0] - obs[0])**2 + (position[1] - obs[1])**2)
            min_distance = min(min_distance, dist)

        # Exponential cost for close obstacles
        if min_distance < 1.0:  # 1 meter threshold
            cost = 1000.0 * math.exp(-min_distance * 2)

        return cost

    def get_yaw_from_quaternion(self, quat):
        """Extract yaw from quaternion"""
        siny_cosp = 2 * (quat.w * quat.z + quat.x * quat.y)
        cosy_cosp = 1 - 2 * (quat.y * quat.y + quat.z * quat.z)
        return math.atan2(siny_cosp, cosy_cosp)

    def publish_mpc_visualization(self, current_state, reference_trajectory, optimal_controls):
        """Publish MPC visualization markers"""
        marker_array = MarkerArray()

        # Reference trajectory
        ref_marker = Marker()
        ref_marker.header.frame_id = "map"
        ref_marker.header.stamp = self.get_clock().now().to_msg()
        ref_marker.ns = "reference_trajectory"
        ref_marker.id = 0
        ref_marker.type = Marker.LINE_STRIP
        ref_marker.action = Marker.ADD
        ref_marker.pose.orientation.w = 1.0
        ref_marker.scale.x = 0.02
        ref_marker.color.r = 1.0
        ref_marker.color.a = 0.7

        for state in reference_trajectory:
            point = Point()
            point.x = state[0]
            point.y = state[1]
            point.z = 0.05
            ref_marker.points.append(point)

        marker_array.markers.append(ref_marker)

        # Current position
        pos_marker = Marker()
        pos_marker.header.frame_id = "map"
        pos_marker.header.stamp = self.get_clock().now().to_msg()
        pos_marker.ns = "current_position"
        pos_marker.id = 1
        pos_marker.type = Marker.SPHERE
        pos_marker.action = Marker.ADD
        pos_marker.pose.position.x = current_state[0]
        pos_marker.pose.position.y = current_state[1]
        pos_marker.pose.position.z = 0.1
        pos_marker.pose.orientation.w = 1.0
        pos_marker.scale.x = 0.2
        pos_marker.scale.y = 0.2
        pos_marker.scale.z = 0.2
        pos_marker.color.b = 1.0
        pos_marker.color.a = 1.0

        marker_array.markers.append(pos_marker)

        self.visualization_pub.publish(marker_array)
```

## Integration with Isaac ROS Perception

### Perception-Integrated Navigation

```python
# Integration of Isaac ROS perception with Nav2
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, LaserScan, PointCloud2
from vision_msgs.msg import Detection2DArray
from geometry_msgs.msg import PoseStamped
from nav_msgs.msg import OccupancyGrid
from std_msgs.msg import String
from tf2_ros import TransformListener, Buffer
from visualization_msgs.msg import MarkerArray
from builtin_interfaces.msg import Duration
import numpy as np
import math

class IsaacROSNav2Integrator(Node):
    def __init__(self):
        super().__init__('isaac_ros_nav2_integrator')

        # Perception subscribers from Isaac ROS
        self.detection_sub = self.create_subscription(
            Detection2DArray,
            '/isaac_ros_detections',
            self.detection_callback,
            10
        )

        self.pointcloud_sub = self.create_subscription(
            PointCloud2,
            '/isaac_ros_pointcloud',
            self.pointcloud_callback,
            10
        )

        # Navigation publishers
        self.dynamic_costmap_pub = self.create_publisher(
            OccupancyGrid,
            '/dynamic_costmap',
            10
        )

        self.navigation_status_pub = self.create_publisher(
            String,
            '/navigation_status',
            10
        )

        self.visualization_pub = self.create_publisher(
            MarkerArray,
            '/perception_nav_visualization',
            10
        )

        # TF listener for coordinate transforms
        self.tf_buffer = Buffer()
        self.tf_listener = TransformListener(self.tf_buffer, self)

        # Perception processing
        self.human_detector = HumanDetector()
        self.obstacle_detector = ObstacleDetector()
        self.dynamic_object_tracker = DynamicObjectTracker()

        # Navigation parameters
        self.safe_distance_to_humans = 1.0  # meters
        self.safe_distance_to_obstacles = 0.5  # meters
        self.navigation_priority = "avoid_dynamic_objects"

        # Timer for processing loop
        self.processing_timer = self.create_timer(0.1, self.process_perception_data)

    def detection_callback(self, msg):
        """Process Isaac ROS detections"""
        # Process all detections
        humans = []
        obstacles = []

        for detection in msg.detections:
            if detection.results[0].hypothesis.class_id == "person":
                humans.append(detection)
            else:
                obstacles.append(detection)

        # Update dynamic object tracking
        self.dynamic_object_tracker.update_humans(humans)
        self.dynamic_object_tracker.update_obstacles(obstacles)

    def pointcloud_callback(self, msg):
        """Process Isaac ROS point cloud"""
        # Convert point cloud to usable format
        points = self.pointcloud_to_array(msg)

        # Extract ground plane and obstacles
        ground_points, obstacle_points = self.separate_ground_obstacles(points)

        # Update costmap with 3D obstacle information
        self.update_3d_costmap(obstacle_points)

    def pointcloud_to_array(self, pointcloud_msg):
        """Convert PointCloud2 message to numpy array"""
        # Implementation to convert ROS PointCloud2 to numpy array
        # This would use sensor_msgs_py.point_cloud2
        pass

    def separate_ground_obstacles(self, points):
        """Separate ground points from obstacle points"""
        # Simple ground plane segmentation
        ground_threshold = 0.1  # meters above ground
        ground_points = []
        obstacle_points = []

        for point in points:
            if abs(point[2]) < ground_threshold:  # Close to ground level
                ground_points.append(point)
            else:
                obstacle_points.append(point)

        return np.array(ground_points), np.array(obstacle_points)

    def update_3d_costmap(self, obstacle_points):
        """Update costmap with 3D obstacle information"""
        # Create 2D occupancy grid from 3D points
        resolution = 0.05  # meters per cell
        width = 200  # cells
        height = 200  # cells

        occupancy_grid = OccupancyGrid()
        occupancy_grid.header.frame_id = "map"
        occupancy_grid.header.stamp = self.get_clock().now().to_msg()
        occupancy_grid.info.resolution = resolution
        occupancy_grid.info.width = width
        occupancy_grid.info.height = height
        occupancy_grid.info.origin.position.x = -5.0  # Center of grid
        occupancy_grid.info.origin.position.y = -5.0
        occupancy_grid.info.origin.position.z = 0.0
        occupancy_grid.info.origin.orientation.w = 1.0

        # Initialize with unknown (-1)
        occupancy_grid.data = [-1] * (width * height)

        # Mark obstacle cells
        for point in obstacle_points:
            # Convert world coordinates to grid coordinates
            grid_x = int((point[0] - occupancy_grid.info.origin.position.x) / resolution)
            grid_y = int((point[1] - occupancy_grid.info.origin.position.y) / resolution)

            if 0 <= grid_x < width and 0 <= grid_y < height:
                idx = grid_y * width + grid_x
                # Mark as occupied (100) if not already more occupied
                if occupancy_grid.data[idx] < 50:
                    occupancy_grid.data[idx] = 100

        # Publish dynamic costmap
        self.dynamic_costmap_pub.publish(occupancy_grid)

    def process_perception_data(self):
        """Main processing loop for perception-integrated navigation"""
        # Get tracked dynamic objects
        tracked_humans = self.dynamic_object_tracker.get_tracked_humans()
        tracked_obstacles = self.dynamic_object_tracker.get_tracked_obstacles()

        # Update navigation behavior based on perception
        navigation_advice = self.analyze_dynamic_environment(
            tracked_humans, tracked_obstacles
        )

        # Publish navigation status
        status_msg = String()
        status_msg.data = navigation_advice
        self.navigation_status_pub.publish(status_msg)

        # Publish visualization
        self.publish_perception_visualization(
            tracked_humans, tracked_obstacles
        )

    def analyze_dynamic_environment(self, humans, obstacles):
        """Analyze dynamic environment for navigation decisions"""
        advice = "normal_navigation"

        # Check for humans in path
        for human in humans:
            distance_to_human = self.calculate_distance_to_robot(human)
            if distance_to_human < self.safe_distance_to_humans:
                advice = "cautious_navigation"
                break

        # Check for moving obstacles
        for obstacle in obstacles:
            if obstacle.velocity > 0.1:  # Moving obstacle
                advice = "dynamic_avoidance"
                break

        return advice

    def calculate_distance_to_robot(self, object_pose):
        """Calculate distance from object to robot"""
        try:
            # Get robot's current transform
            robot_transform = self.tf_buffer.lookup_transform(
                "map", "base_link", rclpy.time.Time()
            )

            robot_x = robot_transform.transform.translation.x
            robot_y = robot_transform.transform.translation.y

            object_x = object_pose.pose.position.x
            object_y = object_pose.pose.position.y

            distance = math.sqrt((robot_x - object_x)**2 + (robot_y - object_y)**2)
            return distance
        except:
            return float('inf')  # Return large distance if transform unavailable

    def publish_perception_visualization(self, humans, obstacles):
        """Publish visualization for perception data"""
        marker_array = MarkerArray()

        # Visualize humans
        for i, human in enumerate(humans):
            human_marker = Marker()
            human_marker.header.frame_id = "map"
            human_marker.header.stamp = self.get_clock().now().to_msg()
            human_marker.ns = "humans"
            human_marker.id = i
            human_marker.type = Marker.CYLINDER
            human_marker.action = Marker.ADD
            human_marker.pose = human.pose
            human_marker.scale.x = 0.6  # Width
            human_marker.scale.y = 0.6  # Depth
            human_marker.scale.z = 1.8  # Height
            human_marker.color.g = 1.0
            human_marker.color.a = 0.7

            marker_array.markers.append(human_marker)

        # Visualize obstacles
        for i, obstacle in enumerate(obstacles):
            obstacle_marker = Marker()
            obstacle_marker.header.frame_id = "map"
            obstacle_marker.header.stamp = self.get_clock().now().to_msg()
            obstacle_marker.ns = "obstacles"
            obstacle_marker.id = i
            obstacle_marker.type = Marker.CUBE
            obstacle_marker.action = Marker.ADD
            obstacle_marker.pose = obstacle.pose
            obstacle_marker.scale.x = 0.5
            obstacle_marker.scale.y = 0.5
            obstacle_marker.scale.z = 0.5
            obstacle_marker.color.r = 1.0
            obstacle_marker.color.a = 0.7

            marker_array.markers.append(obstacle_marker)

        self.visualization_pub.publish(marker_array)

class HumanDetector:
    """Human detection processor"""
    def __init__(self):
        self.detection_threshold = 0.7
        self.tracking_window = 5  # frames

    def process_detections(self, detections):
        """Process human detections"""
        humans = []
        for detection in detections:
            if detection.results[0].hypothesis.score > self.detection_threshold:
                humans.append(detection)
        return humans

class ObstacleDetector:
    """Obstacle detection processor"""
    def __init__(self):
        pass

    def process_pointcloud(self, pointcloud):
        """Process point cloud for obstacles"""
        # Implementation for obstacle detection from point cloud
        pass

class DynamicObjectTracker:
    """Track dynamic objects over time"""
    def __init__(self):
        self.tracked_objects = {}
        self.next_id = 0

    def update_humans(self, human_detections):
        """Update human tracking"""
        # Implementation for tracking humans over time
        pass

    def update_obstacles(self, obstacle_detections):
        """Update obstacle tracking"""
        # Implementation for tracking obstacles over time
        pass

    def get_tracked_humans(self):
        """Get currently tracked humans"""
        return []

    def get_tracked_obstacles(self):
        """Get currently tracked obstacles"""
        return []
```

## Human-Aware Navigation

### Social Navigation Behaviors

```python
# Human-aware navigation behaviors
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped, Point
from nav_msgs.msg import Path
from visualization_msgs.msg import MarkerArray
from std_msgs.msg import ColorRGBA
from builtin_interfaces.msg import Duration
import math
import numpy as np

class HumanAwareNavigation(Node):
    def __init__(self):
        super().__init__('human_aware_navigation')

        # Publishers
        self.cmd_vel_pub = self.create_publisher(Twist, 'cmd_vel', 10)
        self.social_path_pub = self.create_publisher(Path, 'social_plan', 10)
        self.visualization_pub = self.create_publisher(MarkerArray, 'social_navigation_viz', 10)

        # Subscribers
        self.human_pose_sub = self.create_subscription(
            PoseStamped,
            '/tracked_humans',
            self.human_pose_callback,
            10
        )

        self.path_sub = self.create_subscription(
            Path,
            'plan',
            self.path_callback,
            10
        )

        # Social navigation parameters
        self.personal_space_radius = 0.8  # meters
        self.social_zone_radius = 1.5    # meters
        self.comfort_zone_radius = 2.0   # meters
        self.following_distance = 1.0    # meters when following
        self.avoidance_strength = 2.0    # force multiplier

        # Social navigation states
        self.social_navigation_mode = "respects_personal_space"
        self.humans_in_area = []
        self.current_path = None
        self.robot_pose = None

        # Timer for social navigation updates
        self.social_timer = self.create_timer(0.1, self.social_navigation_update)

    def human_pose_callback(self, msg):
        """Receive human pose information"""
        # Update list of humans in the area
        human_info = {
            'pose': msg.pose,
            'timestamp': msg.header.stamp,
            'velocity': self.estimate_human_velocity(msg)
        }

        # Add or update human in our tracking list
        self.update_human_tracking(human_info)

    def path_callback(self, msg):
        """Receive original navigation path"""
        self.current_path = msg
        self.modify_path_for_social_navigation()

    def update_human_tracking(self, human_info):
        """Update tracking of humans in the area"""
        # Check if this is a new human or updating existing
        updated = False
        for i, tracked_human in enumerate(self.humans_in_area):
            distance = self.calculate_distance_3d(
                human_info['pose'].position,
                tracked_human['pose'].position
            )

            if distance < 2.0:  # Same human if within 2m
                # Update the existing human's information
                self.humans_in_area[i] = human_info
                updated = True
                break

        if not updated:
            # New human detected
            self.humans_in_area.append(human_info)

        # Remove humans that haven't been seen for a while
        current_time = self.get_clock().now()
        self.humans_in_area = [
            h for h in self.humans_in_area
            if (current_time.nanoseconds - h['timestamp'].nanosec) < 5e9  # 5 seconds
        ]

    def estimate_human_velocity(self, human_pose_msg):
        """Estimate human velocity from pose history"""
        # This would use pose history to estimate velocity
        # For now, return zero velocity
        return [0.0, 0.0, 0.0]

    def modify_path_for_social_navigation(self):
        """Modify path considering social navigation rules"""
        if self.current_path is None or len(self.current_path.poses) == 0:
            return

        # Create social-aware path
        social_path = Path()
        social_path.header = self.current_path.header

        if len(self.humans_in_area) == 0:
            # No humans, follow original path
            social_path = self.current_path
        else:
            # Modify path to respect social spaces
            social_path = self.compute_socially_aware_path()

        # Publish modified path
        self.social_path_pub.publish(social_path)

    def compute_socially_aware_path(self):
        """Compute path that respects social spaces"""
        if self.current_path is None:
            return Path()

        # Create a copy of the original path
        modified_path = Path()
        modified_path.header = self.current_path.header

        for pose_stamped in self.current_path.poses:
            modified_pose = PoseStamped()
            modified_pose.header = pose_stamped.header

            # Calculate repulsive forces from humans
            total_force = [0.0, 0.0]

            for human in self.humans_in_area:
                force = self.calculate_social_force(
                    [pose_stamped.pose.position.x, pose_stamped.pose.position.y],
                    [human['pose'].position.x, human['pose'].position.y]
                )
                total_force[0] += force[0]
                total_force[1] += force[1]

            # Apply forces to modify position
            modified_pose.pose.position.x = pose_stamped.pose.position.x + total_force[0] * 0.1
            modified_pose.pose.position.y = pose_stamped.pose.position.y + total_force[1] * 0.1
            modified_pose.pose.position.z = pose_stamped.pose.position.z  # Keep original z

            # Keep original orientation for now
            modified_pose.pose.orientation = pose_stamped.pose.orientation

            modified_path.poses.append(modified_pose)

        return modified_path

    def calculate_social_force(self, robot_pos, human_pos):
        """Calculate social force from human to robot position"""
        dx = robot_pos[0] - human_pos[0]
        dy = robot_pos[1] - human_pos[1]
        distance = math.sqrt(dx*dx + dy*dy)

        if distance < 0.1:  # Very close, maximum repulsion
            distance = 0.1

        # Calculate force magnitude based on distance
        if distance < self.personal_space_radius:
            force_magnitude = self.avoidance_strength * (1.0 / distance - 1.0 / self.personal_space_radius)
        elif distance < self.social_zone_radius:
            force_magnitude = self.avoidance_strength * 0.5 * (1.0 / distance - 1.0 / self.social_zone_radius)
        else:
            force_magnitude = 0.0  # Outside social zones

        # Normalize and scale force
        if distance > 0:
            force_x = (dx / distance) * force_magnitude
            force_y = (dy / distance) * force_magnitude
        else:
            force_x = 0.0
            force_y = 0.0

        return [force_x, force_y]

    def social_navigation_update(self):
        """Main social navigation update loop"""
        if len(self.humans_in_area) == 0:
            return

        # Check if we need to modify navigation behavior
        closest_human_dist = float('inf')
        closest_human = None

        for human in self.humans_in_area:
            dist = self.calculate_distance_to_robot(human['pose'])
            if dist < closest_human_dist:
                closest_human_dist = dist
                closest_human = human

        if closest_human_dist < self.comfort_zone_radius:
            # Human is in comfort zone, adjust behavior
            self.adjust_navigation_for_proximity(closest_human, closest_human_dist)

    def adjust_navigation_for_proximity(self, human, distance):
        """Adjust navigation when human is in proximity"""
        cmd_vel = Twist()

        if distance < self.personal_space_radius:
            # Too close, stop or move away
            cmd_vel.linear.x = -0.1  # Move backward slowly
            cmd_vel.angular.z = 0.2  # Add some turning
        elif distance < self.social_zone_radius:
            # In social zone, slow down and be cautious
            cmd_vel.linear.x = 0.1  # Move slowly
            cmd_vel.angular.z = 0.1  # Gentle turning to avoid
        else:
            # In comfort zone, normal navigation but aware
            cmd_vel.linear.x = 0.2  # Normal speed but cautious
            cmd_vel.angular.z = 0.05  # Gentle course corrections

        # Publish modified velocity
        self.cmd_vel_pub.publish(cmd_vel)

    def calculate_distance_to_robot(self, human_pose):
        """Calculate distance from human to robot"""
        # This would get robot's current position from TF or odometry
        # For now, assume robot is at origin [0, 0]
        robot_pos = [0.0, 0.0]  # Should get from TF
        human_pos = [human_pose.position.x, human_pose.position.y]

        return math.sqrt((robot_pos[0] - human_pos[0])**2 + (robot_pos[1] - human_pos[1])**2)

    def calculate_distance_3d(self, pos1, pos2):
        """Calculate 3D distance between two positions"""
        return math.sqrt(
            (pos1.x - pos2.x)**2 +
            (pos1.y - pos2.y)**2 +
            (pos1.z - pos2.z)**2
        )

    def publish_social_visualization(self):
        """Publish social navigation visualization"""
        marker_array = MarkerArray()

        # Personal space visualization
        for i, human in enumerate(self.humans_in_area):
            personal_space = Marker()
            personal_space.header.frame_id = "map"
            personal_space.header.stamp = self.get_clock().now().to_msg()
            personal_space.ns = "personal_space"
            personal_space.id = i
            personal_space.type = Marker.SPHERE
            personal_space.action = Marker.ADD
            personal_space.pose.position = human['pose'].position
            personal_space.pose.orientation.w = 1.0
            personal_space.scale.x = self.personal_space_radius * 2
            personal_space.scale.y = self.personal_space_radius * 2
            personal_space.scale.z = 0.1
            personal_space.color.r = 1.0
            personal_space.color.a = 0.2

            marker_array.markers.append(personal_space)

        # Social zone visualization
        for i, human in enumerate(self.humans_in_area):
            social_zone = Marker()
            social_zone.header.frame_id = "map"
            social_zone.header.stamp = self.get_clock().now().to_msg()
            social_zone.ns = "social_zone"
            social_zone.id = i + 100  # Different ID range
            social_zone.type = Marker.SPHERE
            social_zone.action = Marker.ADD
            social_zone.pose.position = human['pose'].position
            social_zone.pose.orientation.w = 1.0
            social_zone.scale.x = self.social_zone_radius * 2
            social_zone.scale.y = self.social_zone_radius * 2
            social_zone.scale.z = 0.1
            social_zone.color.b = 1.0
            social_zone.color.a = 0.2

            marker_array.markers.append(social_zone)

        self.visualization_pub.publish(marker_array)
```

## Performance Optimization

### Navigation Performance Tuning

```python
# Performance optimization for humanoid navigation
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, Int32
from nav_msgs.msg import Path
from geometry_msgs.msg import Twist
import time
import threading

class NavigationPerformanceOptimizer(Node):
    def __init__(self):
        super().__init__('navigation_performance_optimizer')

        # Performance monitoring publishers
        self.planning_time_pub = self.create_publisher(Float32, '/planning_time', 10)
        self.control_frequency_pub = self.create_publisher(Float32, '/control_frequency', 10)
        self.path_quality_pub = self.create_publisher(Float32, '/path_quality', 10)

        # Performance parameters
        self.target_planning_time = 0.1  # seconds
        self.target_control_frequency = 10.0  # Hz
        self.performance_history = {
            'planning_times': [],
            'control_frequencies': [],
            'path_lengths': []
        }

        # Adaptive parameters
        self.adaptation_enabled = True
        self.planning_resolution = 0.05  # meters
        self.control_horizon = 20

        # Performance monitoring timer
        self.monitor_timer = self.create_timer(1.0, self.performance_monitoring)

    def performance_monitoring(self):
        """Monitor navigation performance and adapt parameters"""
        if not self.adaptation_enabled:
            return

        # Calculate average performance metrics
        avg_planning_time = self.get_average_planning_time()
        avg_control_freq = self.get_average_control_frequency()
        path_quality = self.get_path_quality()

        # Publish metrics
        time_msg = Float32()
        time_msg.data = avg_planning_time
        self.planning_time_pub.publish(time_msg)

        freq_msg = Float32()
        freq_msg.data = avg_control_freq
        self.control_frequency_pub.publish(freq_msg)

        quality_msg = Float32()
        quality_msg.data = path_quality
        self.path_quality_pub.publish(quality_msg)

        # Adapt parameters based on performance
        self.adapt_parameters(avg_planning_time, avg_control_freq, path_quality)

    def get_average_planning_time(self):
        """Get average path planning time"""
        if len(self.performance_history['planning_times']) > 0:
            return sum(self.performance_history['planning_times']) / len(self.performance_history['planning_times'])
        return 0.0

    def get_average_control_frequency(self):
        """Get average control frequency"""
        if len(self.performance_history['control_frequencies']) > 0:
            return sum(self.performance_history['control_frequencies']) / len(self.performance_history['control_frequencies'])
        return 0.0

    def get_path_quality(self):
        """Evaluate path quality"""
        if len(self.performance_history['path_lengths']) > 0:
            # Path quality could be based on smoothness, length efficiency, etc.
            return 1.0  # Placeholder
        return 0.0

    def adapt_parameters(self, planning_time, control_freq, path_quality):
        """Adapt navigation parameters based on performance"""
        # Adjust planning resolution based on computation time
        if planning_time > self.target_planning_time * 1.2:
            # Planning too slow, reduce resolution
            self.planning_resolution = min(self.planning_resolution * 1.1, 0.2)
        elif planning_time < self.target_planning_time * 0.8:
            # Planning too fast, can increase resolution
            self.planning_resolution = max(self.planning_resolution * 0.9, 0.02)

        # Adjust control horizon based on performance
        if control_freq < self.target_control_frequency * 0.8:
            # Control too slow, reduce horizon
            self.control_horizon = max(self.control_horizon - 2, 5)
        elif control_freq > self.target_control_frequency * 1.2:
            # Control fast enough, can increase horizon
            self.control_horizon = min(self.control_horizon + 1, 30)

        self.get_logger().info(f'Adapted parameters - Resolution: {self.planning_resolution:.3f}, Horizon: {self.control_horizon}')

    def record_planning_time(self, planning_time):
        """Record path planning time for performance analysis"""
        self.performance_history['planning_times'].append(planning_time)
        # Keep only last 100 measurements
        if len(self.performance_history['planning_times']) > 100:
            self.performance_history['planning_times'] = self.performance_history['planning_times'][-100:]

    def record_control_frequency(self, frequency):
        """Record control frequency"""
        self.performance_history['control_frequencies'].append(frequency)
        if len(self.performance_history['control_frequencies']) > 100:
            self.performance_history['control_frequencies'] = self.performance_history['control_frequencies'][-100:]

    def record_path_length(self, length):
        """Record path length for quality assessment"""
        self.performance_history['path_lengths'].append(length)
        if len(self.performance_history['path_lengths']) > 100:
            self.performance_history['path_lengths'] = self.performance_history['path_lengths'][-100:]
```

## Best Practices

### Navigation Best Practices for Humanoids

1. **Safety First**: Always prioritize safety over efficiency
2. **Stability Considerations**: Account for humanoid balance during navigation
3. **Multi-Sensor Fusion**: Combine multiple sensor inputs for robust navigation
4. **Human-Aware Navigation**: Consider human presence and comfort
5. **Adaptive Parameters**: Adjust parameters based on environment and performance

### Performance Best Practices

1. **Efficient Path Planning**: Use appropriate planning algorithms for the task
2. **Real-time Constraints**: Ensure navigation runs within real-time requirements
3. **Memory Management**: Efficiently manage memory for large maps and data
4. **Computational Optimization**: Optimize algorithms for humanoid platforms
5. **Robust Error Handling**: Handle failures gracefully and recover safely

### Deployment Best Practices

1. **Extensive Testing**: Test in various environments before deployment
2. **Safety Validation**: Validate safety systems thoroughly
3. **Calibration**: Ensure all sensors are properly calibrated
4. **Monitoring**: Implement comprehensive monitoring and logging
5. **Fallback Systems**: Have reliable fallback behaviors for failures

## Summary

Navigation 2 provides a powerful framework for humanoid motion planning, with the flexibility to incorporate humanoid-specific constraints and behaviors. When integrated with Isaac ROS perception capabilities, it enables sophisticated human-aware navigation that considers both static and dynamic obstacles.

The next module will cover VLA (Vision-Language-Action) systems and their integration with humanoid robotics for cognitive planning and human-robot interaction.