---
sidebar_position: 3
---

# Services, Actions, Parameters

## Learning Objectives

By the end of this chapter, you will be able to:
- Implement services for request-response communication in humanoid systems
- Create and use actions for goal-oriented tasks with feedback
- Manage parameters for configuration and tuning
- Design appropriate communication patterns for different use cases
- Implement robust service and action clients and servers

## Services in ROS 2

### Service Architecture

Services provide request-response communication patterns, ideal for operations that have a clear start and end:

```
[Service Client] → [Request] → [Service Server]
        ↑                            ↓
[Response] ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

### Creating Services

#### Service Definition

First, define your service in a `.srv` file:

```
# AddTwoInts.srv
int64 a
int64 b
---
int64 sum
```

#### Service Server Implementation

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class SimpleServiceServer(Node):
    def __init__(self):
        super().__init__('simple_service_server')
        self.srv = self.create_service(
            AddTwoInts,
            'add_two_ints',
            self.add_two_ints_callback
        )

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info(f'Returning: {request.a} + {request.b} = {response.sum}')
        return response

def main(args=None):
    rclpy.init(args=args)
    node = SimpleServiceServer()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### Service Client Implementation

```python
import rclpy
from rclpy.node import Node
from example_interfaces.srv import AddTwoInts

class SimpleServiceClient(Node):
    def __init__(self):
        super().__init__('simple_service_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')

        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('Service not available, waiting again...')

        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()

def main(args=None):
    rclpy.init(args=args)
    client = SimpleServiceClient()
    response = client.send_request(1, 2)
    client.get_logger().info(f'Result: {response.sum}')
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Actions in ROS 2

### Action Architecture

Actions are ideal for long-running tasks that provide feedback and can be canceled:

```
[Action Client] → [Goal] → [Action Server]
        ↑                   ↓
[Feedback] ←←←←←←←←←←←←←←←←←←←
        ↑                   ↓
[Result] ←←←←←←←←←←←←←←←←←←←←←
```

### Creating Actions

#### Action Definition

Define your action in a `.action` file:

```
# MoveJoint.action
# Goal
float64 target_position
float64 max_velocity
---
# Result
bool success
string message
---
# Feedback
float64 current_position
float64 remaining_distance
```

#### Action Server Implementation

```python
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from control_msgs.action import FollowJointTrajectory

class JointTrajectoryActionServer(Node):
    def __init__(self):
        super().__init__('joint_trajectory_action_server')
        self._action_server = ActionServer(
            self,
            FollowJointTrajectory,
            'joint_trajectory_action',
            self.execute_callback
        )

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        # Simulate trajectory execution
        feedback_msg = FollowJointTrajectory.Feedback()
        result = FollowJointTrajectory.Result()

        # Execute trajectory
        for i, point in enumerate(goal_handle.request.trajectory.points):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.error_code = -1
                result.error_string = "Goal canceled"
                return result

            # Simulate reaching the point
            feedback_msg.actual.positions = point.positions
            feedback_msg.actual.velocities = point.velocities
            feedback_msg.desired = point
            feedback_msg.error.positions = [0.0] * len(point.positions)

            goal_handle.publish_feedback(feedback_msg)
            self.get_logger().info(f'Executing trajectory point {i}')

        goal_handle.succeed()
        result.error_code = 0
        result.error_string = "Trajectory completed successfully"
        return result

def main(args=None):
    rclpy.init(args=args)
    node = JointTrajectoryActionServer()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

#### Action Client Implementation

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from control_msgs.action import FollowJointTrajectory
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint

class JointTrajectoryActionClient(Node):
    def __init__(self):
        super().__init__('joint_trajectory_action_client')
        self._action_client = ActionClient(
            self,
            FollowJointTrajectory,
            'joint_trajectory_action'
        )

    def send_goal(self, joint_names, positions, velocities):
        goal_msg = FollowJointTrajectory.Goal()
        goal_msg.trajectory = JointTrajectory()
        goal_msg.trajectory.joint_names = joint_names

        point = JointTrajectoryPoint()
        point.positions = positions
        point.velocities = velocities
        point.time_from_start.sec = 2
        goal_msg.trajectory.points.append(point)

        self._action_client.wait_for_server()
        self._send_goal_future = self._action_client.send_goal_async(
            goal_msg,
            feedback_callback=self.feedback_callback
        )

        self._send_goal_future.add_done_callback(self.goal_response_callback)

    def goal_response_callback(self, future):
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Goal rejected :(')
            return

        self.get_logger().info('Goal accepted :)')
        self._get_result_future = goal_handle.get_result_async()
        self._get_result_future.add_done_callback(self.get_result_callback)

    def feedback_callback(self, feedback_msg):
        self.get_logger().info(
            f'Remaining: {feedback_msg.feedback.remaining_time.sec} seconds'
        )

    def get_result_callback(self, future):
        result = future.result().result
        self.get_logger().info(f'Result: {result.error_string}')

def main(args=None):
    rclpy.init(args=args)
    action_client = JointTrajectoryActionClient()

    # Send a goal
    action_client.send_goal(
        ['joint1', 'joint2'],
        [1.0, 2.0],
        [0.5, 0.5]
    )

    rclpy.spin(action_client)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Parameters in ROS 2

### Parameter Basics

Parameters provide a way to configure nodes at runtime:

```python
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self):
        super().__init__('parameter_node')

        # Declare parameters with default values
        self.declare_parameter('robot_name', 'my_robot')
        self.declare_parameter('max_velocity', 1.0)
        self.declare_parameter('safety_distance', 0.5)

        # Get parameter values
        self.robot_name = self.get_parameter('robot_name').value
        self.max_velocity = self.get_parameter('max_velocity').value
        self.safety_distance = self.get_parameter('safety_distance').value

        # Set callback for parameter changes
        self.add_on_set_parameters_callback(self.parameter_callback)

    def parameter_callback(self, params):
        for param in params:
            if param.name == 'max_velocity' and param.value > 2.0:
                return SetParametersResult(successful=False, reason='Velocity too high')
        return SetParametersResult(successful=True)

def main(args=None):
    rclpy.init(args=args)
    node = ParameterNode()

    # Change parameter at runtime
    node.set_parameters([Parameter('max_velocity', Parameter.Type.DOUBLE, 1.5)])

    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Parameter Files

Create YAML files for parameter configuration:

```yaml
# config/robot_params.yaml
parameter_node:
  ros__parameters:
    robot_name: "humanoid_robot"
    max_velocity: 1.0
    safety_distance: 0.5
    joint_limits:
      min_position: -2.0
      max_position: 2.0
    control_gains:
      kp: 10.0
      ki: 0.1
      kd: 0.5
```

### Loading Parameters

```python
# In your launch file
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='my_package',
            executable='parameter_node',
            parameters=[
                'config/robot_params.yaml',
                {'robot_name': 'configured_robot'}
            ]
        )
    ])
```

## Communication Pattern Selection

### When to Use Each Pattern

| Pattern | Use Case | Example |
|---------|----------|---------|
| Topics | Continuous data flow | Sensor data, joint states |
| Services | Request-response, short duration | Calibration, configuration |
| Actions | Long-running tasks with feedback | Trajectory execution, navigation |
| Parameters | Configuration, tuning | Gains, limits, names |

### Humanoid-Specific Examples

#### Services for Humanoid Systems

```python
# Service for calibrating sensors
# CalibrateSensors.srv
bool force_calibration
---
bool success
string message

# Service for changing robot state
# ChangeRobotState.srv
string state  # "stand", "sit", "walk"
---
bool success
string message
```

#### Actions for Humanoid Systems

```python
# Action for walking
# Walk.action
float64 distance_x
float64 distance_y
float64 angle_theta
---
bool success
string message
---
float64 step_count
float64 remaining_distance
string current_gait

# Action for grasping
# Grasp.action
string object_name
float64 grasp_force
---
bool success
string message
---
float64 current_force
string grasp_status
```

## Advanced Service and Action Patterns

### Service with Multiple Possible Responses

```python
from rclpy.node import Node
from my_robot_msgs.srv import RobotAction

class AdvancedServiceServer(Node):
    def __init__(self):
        super().__init__('advanced_service_server')
        self.srv = self.create_service(
            RobotAction,
            'robot_action',
            self.action_callback
        )

    def action_callback(self, request, response):
        if request.action_type == 'move':
            # Handle move action
            response.success = self.handle_move(request)
            response.message = "Move completed"
        elif request.action_type == 'grasp':
            # Handle grasp action
            response.success = self.handle_grasp(request)
            response.message = "Grasp completed"
        elif request.action_type == 'balance':
            # Handle balance action
            response.success = self.handle_balance(request)
            response.message = "Balance maintained"
        else:
            response.success = False
            response.message = f"Unknown action type: {request.action_type}"

        return response
```

### Action with Subgoals

```python
from rclpy.action import ActionServer
from my_robot_msgs.action import ComplexTask

class ComplexTaskServer(Node):
    def __init__(self):
        super().__init__('complex_task_server')
        self._action_server = ActionServer(
            self,
            ComplexTask,
            'complex_task',
            self.execute_callback
        )

    def execute_callback(self, goal_handle):
        feedback_msg = ComplexTask.Feedback()
        result = ComplexTask.Result()

        # Break down complex task into subtasks
        subtasks = self.plan_subtasks(goal_handle.request.task_description)

        for i, subtask in enumerate(subtasks):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result.success = False
                result.message = "Task canceled"
                return result

            # Execute subtask
            subtask_success = self.execute_subtask(subtask)

            # Update feedback
            feedback_msg.current_subtask = i
            feedback_msg.total_subtasks = len(subtasks)
            feedback_msg.progress = float(i) / len(subtasks)
            goal_handle.publish_feedback(feedback_msg)

            if not subtask_success:
                goal_handle.abort()
                result.success = False
                result.message = f"Subtask {i} failed"
                return result

        goal_handle.succeed()
        result.success = True
        result.message = "All subtasks completed successfully"
        return result
```

## Parameter Management Strategies

### Hierarchical Parameter Organization

```python
# Organize parameters by subsystem
class HumanoidParameterNode(Node):
    def __init__(self):
        super().__init__('humanoid_params')

        # Joint controller parameters
        self.declare_parameter('joints.left_leg.kp', 10.0)
        self.declare_parameter('joints.left_leg.ki', 0.1)
        self.declare_parameter('joints.left_leg.kd', 0.5)

        # Balance controller parameters
        self.declare_parameter('balance.kp', 5.0)
        self.declare_parameter('balance.kd', 1.0)
        self.declare_parameter('balance.max_tilt', 0.1)

        # Safety parameters
        self.declare_parameter('safety.max_current', 10.0)
        self.declare_parameter('safety.max_temperature', 80.0)
```

### Parameter Validation

```python
from rclpy.parameter import Parameter
from rcl_interfaces.msg import SetParametersResult

class ValidatedParameterNode(Node):
    def __init__(self):
        super().__init__('validated_params')
        self.declare_parameter('control.gain', 1.0)
        self.declare_parameter('safety.limit', 100.0)
        self.add_on_set_parameters_callback(self.validate_parameters)

    def validate_parameters(self, parameters):
        result = SetParametersResult()
        result.successful = True

        for param in parameters:
            if param.name == 'control.gain':
                if param.value <= 0 or param.value > 100:
                    result.successful = False
                    result.reason = 'Control gain must be between 0 and 100'
                    break
            elif param.name == 'safety.limit':
                if param.value <= 0:
                    result.successful = False
                    result.reason = 'Safety limit must be positive'
                    break

        return result
```

## Performance Considerations

### Service Performance

- Use services for operations that complete quickly
- Implement timeouts to prevent hanging
- Consider caching results for expensive operations
- Use appropriate QoS settings for service communication

### Action Performance

- Provide regular feedback for long-running actions
- Implement efficient goal preemption
- Use appropriate goal expiration times
- Consider action result storage for historical data

### Parameter Performance

- Use parameters for configuration, not frequent updates
- Consider using topics for frequently changing values
- Group related parameters logically
- Validate parameters to prevent runtime errors

## Best Practices

### Service Best Practices

- Keep service calls short (under 1 second if possible)
- Provide meaningful error messages
- Implement proper timeout handling
- Use appropriate data types for request/response

### Action Best Practices

- Provide meaningful feedback during execution
- Implement proper goal preemption
- Handle cancellation requests gracefully
- Use appropriate result structures

### Parameter Best Practices

- Use descriptive parameter names
- Provide sensible default values
- Implement parameter validation
- Document parameter meanings and ranges

## Summary

Services, actions, and parameters provide essential communication patterns for humanoid robotics. Services are ideal for request-response interactions, actions handle long-running tasks with feedback, and parameters enable runtime configuration. Understanding when and how to use each pattern is crucial for building robust humanoid robot systems.

The next chapter will cover URDF (Unified Robot Description Format) for humanoid robot modeling.