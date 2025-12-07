---
sidebar_position: 2
---

# Cognitive Planning using LLMs

## Learning Objectives

By the end of this chapter, you will be able to:
- Integrate Large Language Models (LLMs) with humanoid robotics systems
- Implement cognitive planning architectures for complex task execution
- Design prompt engineering strategies for robotic applications
- Create hierarchical task planning using LLMs
- Implement multi-modal reasoning combining vision, language, and action
- Handle uncertainty and error recovery in LLM-driven planning

## Introduction to LLMs in Robotics

### What are Large Language Models?

Large Language Models (LLMs) are deep learning models trained on vast amounts of text data to understand and generate human-like language. For robotics, LLMs provide:

- **Natural language understanding**: Interpret complex human instructions
- **World knowledge**: Access to general knowledge about objects, actions, and relationships
- **Reasoning capabilities**: Logical inference and problem-solving
- **Context awareness**: Understanding of context and history
- **Adaptability**: Ability to handle novel situations through reasoning

### Cognitive Planning in Humanoid Robotics

Cognitive planning using LLMs enables humanoid robots to:
- Interpret high-level natural language commands
- Break down complex tasks into executable actions
- Reason about the environment and available resources
- Adapt plans based on changing conditions
- Handle unexpected situations through reasoning

## LLM Integration Architecture

### System Architecture Overview

```
[Human Command] → [LLM Interface] → [Task Planner] → [Action Executor] → [Humanoid Robot]
      ↑                ↑                 ↑               ↑              ↑
[Natural Language] ←→ [Reasoning] ←→ [Planning] ←→ [Execution] ←→ [Physical World]
```

### LLM Selection and Setup

```python
import openai
import anthropic
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import asyncio
import json

class LLMManager:
    def __init__(self, model_config):
        self.model_type = model_config.get('type', 'openai')
        self.model_name = model_config.get('name', 'gpt-3.5-turbo')
        self.api_key = model_config.get('api_key')
        self.temperature = model_config.get('temperature', 0.7)
        self.max_tokens = model_config.get('max_tokens', 1000)

        self.setup_llm()

    def setup_llm(self):
        """Initialize the selected LLM based on configuration"""
        if self.model_type == 'openai':
            openai.api_key = self.api_key
            self.client = openai.AsyncOpenAI(api_key=self.api_key)
        elif self.model_type == 'anthropic':
            self.client = anthropic.AsyncAnthropic(api_key=self.api_key)
        elif self.model_type == 'local':
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")

    async def generate_response(self, prompt, system_prompt=None):
        """Generate response from LLM"""
        if self.model_type == 'openai':
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=messages,
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            return response.choices[0].message.content

        elif self.model_type == 'anthropic':
            system_message = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt

            response = await self.client.messages.create(
                model=self.model_name,
                system=system_prompt or "",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )
            return response.content[0].text

        elif self.model_type == 'local':
            # For local models, we'll use a different approach
            inputs = self.tokenizer.encode(prompt, return_tensors="pt")
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_length=len(inputs[0]) + self.max_tokens,
                    temperature=self.temperature,
                    do_sample=True
                )
            return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

# Example configuration
llm_config = {
    'type': 'openai',
    'name': 'gpt-4-turbo',
    'api_key': 'your-api-key-here',
    'temperature': 0.3,
    'max_tokens': 1500
}

llm_manager = LLMManager(llm_config)
```

### Context Management

```python
class ContextManager:
    def __init__(self, max_context_length=4096):
        self.max_context_length = max_context_length
        self.conversation_history = []
        self.environment_state = {}
        self.robot_capabilities = {}
        self.task_context = {}

    def add_interaction(self, user_input, robot_response, timestamp=None):
        """Add user-robot interaction to context"""
        interaction = {
            'timestamp': timestamp or time.time(),
            'user_input': user_input,
            'robot_response': robot_response,
            'type': 'interaction'
        }
        self.conversation_history.append(interaction)
        self.trim_context()

    def update_environment_state(self, new_state):
        """Update environment state information"""
        self.environment_state.update(new_state)

    def set_robot_capabilities(self, capabilities):
        """Set robot capabilities for planning"""
        self.robot_capabilities = capabilities

    def set_task_context(self, task_description, constraints, goals):
        """Set current task context"""
        self.task_context = {
            'description': task_description,
            'constraints': constraints,
            'goals': goals,
            'current_step': 0,
            'completed_steps': []
        }

    def get_context_prompt(self):
        """Generate context prompt for LLM"""
        context_parts = []

        # Add environment state
        if self.environment_state:
            context_parts.append("ENVIRONMENT STATE:")
            context_parts.append(json.dumps(self.environment_state, indent=2))

        # Add robot capabilities
        if self.robot_capabilities:
            context_parts.append("\nROBOT CAPABILITIES:")
            context_parts.append(json.dumps(self.robot_capabilities, indent=2))

        # Add task context
        if self.task_context:
            context_parts.append("\nCURRENT TASK:")
            context_parts.append(json.dumps(self.task_context, indent=2))

        # Add recent conversation history
        if self.conversation_history:
            context_parts.append("\nRECENT INTERACTIONS:")
            recent_interactions = self.conversation_history[-5:]  # Last 5 interactions
            for interaction in recent_interactions:
                context_parts.append(f"User: {interaction['user_input']}")
                context_parts.append(f"Robot: {interaction['robot_response']}")

        return "\n".join(context_parts)

    def trim_context(self):
        """Trim context to maintain reasonable length"""
        # Simple trimming: keep only recent interactions
        if len(self.conversation_history) > 20:  # Keep last 20 interactions
            self.conversation_history = self.conversation_history[-20:]
```

## Task Planning with LLMs

### Hierarchical Task Planner

```python
import json
from typing import List, Dict, Any
from dataclasses import dataclass
from enum import Enum

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class Task:
    id: str
    description: str
    action: str
    parameters: Dict[str, Any]
    dependencies: List[str]
    status: TaskStatus = TaskStatus.PENDING
    subtasks: List['Task'] = None

class HierarchicalTaskPlanner:
    def __init__(self, llm_manager: LLMManager, context_manager: ContextManager):
        self.llm_manager = llm_manager
        self.context_manager = context_manager
        self.tasks = {}
        self.current_plan = []

    async def create_plan(self, goal: str, constraints: List[str] = None) -> List[Task]:
        """Create hierarchical task plan using LLM"""
        # Prepare prompt for task decomposition
        prompt = self._create_planning_prompt(goal, constraints)

        # Get plan from LLM
        response = await self.llm_manager.generate_response(
            prompt,
            system_prompt=self._get_planning_system_prompt()
        )

        # Parse and validate the plan
        plan_data = self._parse_plan_response(response)
        self.current_plan = self._create_task_objects(plan_data)

        return self.current_plan

    def _create_planning_prompt(self, goal: str, constraints: List[str] = None) -> str:
        """Create prompt for task planning"""
        prompt_parts = [
            "Decompose the following goal into a hierarchical task plan.",
            f"GOAL: {goal}",
            "\nENVIRONMENT AND ROBOT CAPABILITIES:",
            self.context_manager.get_context_prompt(),
            "\nProvide the plan in the following JSON format:",
            self._get_plan_format_example()
        ]

        if constraints:
            prompt_parts.extend([f"\nCONSTRAINTS: {', '.join(constraints)}"])

        return "\n".join(prompt_parts)

    def _get_planning_system_prompt(self) -> str:
        """Get system prompt for planning"""
        return """
        You are an expert task planner for a humanoid robot. Your role is to decompose complex goals into executable tasks.

        Each task should be:
        - Specific and actionable
        - Have clear parameters
        - Consider the robot's capabilities and environment
        - Include dependencies where appropriate
        - Be hierarchically organized from high-level to low-level tasks

        Return the plan in valid JSON format as specified.
        """

    def _get_plan_format_example(self) -> str:
        """Get example format for plan response"""
        example = {
            "tasks": [
                {
                    "id": "task_1",
                    "description": "High-level task description",
                    "action": "action_type",
                    "parameters": {"param1": "value1"},
                    "dependencies": ["task_0"],  # Task IDs this task depends on
                    "subtasks": [  # Optional: subtasks for hierarchical planning
                        {
                            "id": "subtask_1_1",
                            "description": "Subtask description",
                            "action": "sub_action_type",
                            "parameters": {"param1": "value1"},
                            "dependencies": []
                        }
                    ]
                }
            ]
        }
        return json.dumps(example, indent=2)

    def _parse_plan_response(self, response: str) -> Dict:
        """Parse LLM response into plan structure"""
        try:
            # Try to find JSON in response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1

            if json_start != -1 and json_end != 0:
                json_str = response[json_start:json_end]
                plan_data = json.loads(json_str)
                return plan_data
            else:
                # If no JSON found, try to parse as plain text
                return self._parse_text_plan(response)
        except json.JSONDecodeError:
            return self._parse_text_plan(response)

    def _parse_text_plan(self, response: str) -> Dict:
        """Parse text response into plan structure"""
        # Simple parsing for non-JSON responses
        lines = response.split('\n')
        tasks = []

        for line in lines:
            if line.strip().startswith('- ') or line.strip().startswith('* '):
                task_text = line.strip()[2:]  # Remove '- ' or '* '
                if task_text:
                    task = {
                        "id": f"task_{len(tasks)}",
                        "description": task_text,
                        "action": "generic_action",
                        "parameters": {},
                        "dependencies": []
                    }
                    tasks.append(task)

        return {"tasks": tasks}

    def _create_task_objects(self, plan_data: Dict) -> List[Task]:
        """Create Task objects from plan data"""
        tasks = []

        for task_data in plan_data.get("tasks", []):
            task = self._create_single_task(task_data)
            tasks.append(task)
            self.tasks[task.id] = task

        return tasks

    def _create_single_task(self, task_data: Dict) -> Task:
        """Create a single Task object"""
        subtasks = []
        if "subtasks" in task_data and task_data["subtasks"]:
            for subtask_data in task_data["subtasks"]:
                subtasks.append(self._create_single_task(subtask_data))

        return Task(
            id=task_data["id"],
            description=task_data["description"],
            action=task_data["action"],
            parameters=task_data.get("parameters", {}),
            dependencies=task_data.get("dependencies", []),
            subtasks=subtasks if subtasks else None
        )

    async def execute_plan(self) -> bool:
        """Execute the current plan"""
        for task in self.current_plan:
            success = await self._execute_task(task)
            if not success:
                return False  # Plan execution failed
        return True

    async def _execute_task(self, task: Task) -> bool:
        """Execute a single task"""
        # Check dependencies
        for dep_id in task.dependencies:
            dep_task = self.tasks.get(dep_id)
            if dep_task and dep_task.status != TaskStatus.COMPLETED:
                return False  # Dependency not met

        # Execute the task
        try:
            # This would interface with actual robot execution
            execution_result = await self._execute_robot_action(task)

            if execution_result["success"]:
                task.status = TaskStatus.COMPLETED
                return True
            else:
                task.status = TaskStatus.FAILED
                return False
        except Exception as e:
            task.status = TaskStatus.FAILED
            print(f"Task execution failed: {e}")
            return False

    async def _execute_robot_action(self, task: Task) -> Dict[str, Any]:
        """Execute robot action (placeholder for actual robot interface)"""
        # This would interface with the actual robot
        # For now, return a mock response
        return {"success": True, "result": f"Executed {task.action} with params {task.parameters}"}
```

## Prompt Engineering for Robotics

### Effective Prompt Design

```python
class PromptEngineer:
    def __init__(self):
        self.templates = {
            'task_decomposition': self._get_task_decomposition_template(),
            'object_identification': self._get_object_identification_template(),
            'navigation_planning': self._get_navigation_planning_template(),
            'manipulation_planning': self._get_manipulation_planning_template(),
            'error_recovery': self._get_error_recovery_template()
        }

    def _get_task_decomposition_template(self) -> str:
        return """
        Decompose the goal "{goal}" into a sequence of executable tasks for a humanoid robot.

        ENVIRONMENT: {environment_state}
        ROBOT CAPABILITIES: {robot_capabilities}
        CONSTRAINTS: {constraints}

        Provide the plan in JSON format with the following structure:
        {{
            "tasks": [
                {{
                    "id": "unique_task_id",
                    "description": "Clear task description",
                    "action": "action_type",
                    "parameters": {{"param1": "value1"}},
                    "dependencies": ["other_task_id"],
                    "success_criteria": "How to verify task completion"
                }}
            ]
        }}

        Ensure tasks are:
        1. Specific and actionable
        2. Sequentially executable
        3. Within robot capabilities
        4. Consider environmental constraints
        """

    def _get_object_identification_template(self) -> str:
        return """
        Analyze the visual scene and identify objects relevant to the task "{task}".

        VISUAL INPUT: {visual_data}
        ENVIRONMENT: {environment_state}
        TARGET OBJECTS: {target_objects}

        Provide response in JSON format:
        {{
            "objects": [
                {{
                    "name": "object_name",
                    "category": "object_category",
                    "location": {{"x": float, "y": float, "z": float}},
                    "properties": {{"color": "color", "size": "size", "graspable": boolean}},
                    "relevance_score": float
                }}
            ],
            "actionable_objects": ["list", "of", "objects", "that", "can", "be", "manipulated"]
        }}

        Focus on objects that are:
        - Relevant to the current task
        - Reachable by the robot
        - Suitable for the requested action
        """

    def _get_navigation_planning_template(self) -> str:
        return """
        Plan a safe navigation path from current location to "{destination}".

        CURRENT LOCATION: {current_pose}
        ENVIRONMENT MAP: {environment_map}
        OBSTACLES: {obstacles}
        ROBOT DIMENSIONS: {robot_dimensions}
        NAVIGATION CONSTRAINTS: {constraints}

        Provide path in JSON format:
        {{
            "waypoints": [
                {{"x": float, "y": float, "theta": float}}
            ],
            "safety_margins": {{"min_distance_to_obstacles": float}},
            "alternative_paths": [
                [{{"x": float, "y": float, "theta": float}}]
            ]
        }}

        Consider:
        - Obstacle avoidance
        - Robot kinematic constraints
        - Safety margins
        - Efficient path planning
        """

    def _get_manipulation_planning_template(self) -> str:
        return """
        Plan manipulation actions to achieve "{goal}" with object "{object_name}".

        OBJECT PROPERTIES: {object_properties}
        ROBOT ARM CAPABILITIES: {arm_capabilities}
        CURRENT END-EFFECTOR STATE: {current_state}
        ENVIRONMENT CONSTRAINTS: {constraints}

        Provide manipulation plan in JSON:
        {{
            "grasp_strategy": "how_to_grasp_object",
            "approach_path": [{{"x": float, "y": float, "z": float, "orientation": [float, float, float, float]}}],
            "manipulation_sequence": [
                {{
                    "action": "move_approach|grasp|lift|move|release",
                    "target_pose": {{"x": float, "y": float, "z": float, "orientation": [float, float, float, float]}},
                    "gripper_state": "open|closed|force_value"
                }}
            ],
            "safety_checks": ["list", "of", "safety", "checks", "to", "perform"]
        }}

        Consider:
        - Object properties (size, weight, fragility)
        - Robot kinematic constraints
        - Collision avoidance
        - Grasp stability
        """

    def _get_error_recovery_template(self) -> str:
        return """
        Suggest recovery actions for the failed task: "{failed_task}".
        FAILURE REASON: "{failure_reason}"
        CURRENT STATE: {current_state}
        PREVIOUS ACTIONS: {previous_actions}

        Provide recovery options in JSON:
        {{
            "recovery_options": [
                {{
                    "option_id": "unique_id",
                    "description": "Recovery action description",
                    "estimated_success_probability": float,
                    "required_resources": ["list", "of", "required", "resources"],
                    "alternative_approach": "Alternative way to achieve the same goal"
                }}
            ],
            "recommended_option": "option_id_of_recommended_recovery"
        }}

        Consider:
        - Root cause of failure
        - Available alternatives
        - Safety implications
        - Task completion requirements
        """

    def generate_prompt(self, template_name: str, **kwargs) -> str:
        """Generate prompt using template and provided arguments"""
        if template_name not in self.templates:
            raise ValueError(f"Unknown template: {template_name}")

        template = self.templates[template_name]
        return template.format(**kwargs)
```

## Multi-Modal Reasoning

### Vision-Language-Action Integration

```python
import numpy as np
from typing import Dict, List, Any, Optional
from PIL import Image
import base64
from io import BytesIO

class MultiModalReasoner:
    def __init__(self, llm_manager: LLMManager, prompt_engineer: PromptEngineer):
        self.llm_manager = llm_manager
        self.prompt_engineer = prompt_engineer

    async def analyze_scene_and_plan(self,
                                   visual_data: np.ndarray,
                                   task_description: str,
                                   environment_state: Dict) -> Dict[str, Any]:
        """Analyze visual scene and generate action plan"""
        # Encode visual data for LLM (if needed)
        encoded_image = self._encode_image(visual_data)

        # Generate prompt for scene analysis and planning
        prompt = self.prompt_engineer.generate_prompt(
            'object_identification',
            visual_data=encoded_image,
            task=task_description,
            environment_state=environment_state,
            target_objects=self._extract_target_objects(task_description)
        )

        # Get analysis from LLM
        analysis = await self.llm_manager.generate_response(
            prompt,
            system_prompt="You are a visual scene analyzer for robotics. Identify objects and their properties relevant to the task."
        )

        # Parse the analysis
        parsed_analysis = self._parse_visual_analysis(analysis)

        # Generate action plan based on analysis
        action_plan = await self._generate_action_plan(
            task_description,
            parsed_analysis,
            environment_state
        )

        return {
            'scene_analysis': parsed_analysis,
            'action_plan': action_plan,
            'confidence': self._calculate_confidence(parsed_analysis, action_plan)
        }

    def _encode_image(self, image_array: np.ndarray) -> str:
        """Encode image array to base64 string"""
        if len(image_array.shape) == 3:  # RGB image
            pil_image = Image.fromarray(image_array.astype('uint8'), 'RGB')
        else:  # Grayscale
            pil_image = Image.fromarray(image_array.astype('uint8'), 'L')

        buffer = BytesIO()
        pil_image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"

    def _extract_target_objects(self, task_description: str) -> List[str]:
        """Extract target objects from task description"""
        # Simple keyword extraction (in practice, use NLP techniques)
        keywords = ['bottle', 'cup', 'book', 'phone', 'chair', 'table', 'door', 'light']
        target_objects = []

        task_lower = task_description.lower()
        for keyword in keywords:
            if keyword in task_lower:
                target_objects.append(keyword)

        return target_objects

    def _parse_visual_analysis(self, analysis_text: str) -> Dict[str, Any]:
        """Parse LLM analysis of visual scene"""
        try:
            # Try to find JSON in analysis
            import json
            json_start = analysis_text.find('{')
            json_end = analysis_text.rfind('}') + 1

            if json_start != -1 and json_end != 0:
                json_str = analysis_text[json_start:json_end]
                return json.loads(json_str)
            else:
                # Return text as is if no JSON found
                return {"raw_analysis": analysis_text}
        except:
            return {"raw_analysis": analysis_text}

    async def _generate_action_plan(self,
                                  task_description: str,
                                  visual_analysis: Dict,
                                  environment_state: Dict) -> Dict[str, Any]:
        """Generate action plan based on visual analysis"""
        prompt = self.prompt_engineer.generate_prompt(
            'task_decomposition',
            goal=task_description,
            environment_state=environment_state,
            robot_capabilities=environment_state.get('robot_capabilities', {}),
            constraints=environment_state.get('constraints', []),
            visual_analysis=visual_analysis
        )

        plan = await self.llm_manager.generate_response(
            prompt,
            system_prompt="You are a task planner for robotics. Generate executable actions based on visual analysis."
        )

        return self._parse_action_plan(plan)

    def _parse_action_plan(self, plan_text: str) -> Dict[str, Any]:
        """Parse action plan from LLM response"""
        try:
            import json
            json_start = plan_text.find('{')
            json_end = plan_text.rfind('}') + 1

            if json_start != -1 and json_end != 0:
                json_str = plan_text[json_start:json_end]
                return json.loads(json_str)
            else:
                return {"raw_plan": plan_text}
        except:
            return {"raw_plan": plan_text}

    def _calculate_confidence(self, analysis: Dict, plan: Dict) -> float:
        """Calculate confidence in the analysis and plan"""
        # Simple confidence calculation based on completeness
        confidence = 0.5  # Base confidence

        if 'objects' in analysis and len(analysis['objects']) > 0:
            confidence += 0.2

        if 'tasks' in plan and len(plan['tasks']) > 0:
            confidence += 0.3

        return min(confidence, 1.0)  # Cap at 1.0
```

## Error Handling and Recovery

### LLM-Driven Error Recovery

```python
class ErrorRecoveryManager:
    def __init__(self, llm_manager: LLMManager, prompt_engineer: PromptEngineer):
        self.llm_manager = llm_manager
        self.prompt_engineer = prompt_engineer
        self.error_history = []
        self.recovery_strategies = {}

    async def handle_error(self,
                          error_type: str,
                          error_description: str,
                          current_state: Dict,
                          previous_actions: List[Dict]) -> Dict[str, Any]:
        """Handle error using LLM-driven recovery"""
        # Log the error
        self._log_error(error_type, error_description, current_state)

        # Generate recovery options
        recovery_options = await self._generate_recovery_options(
            error_type, error_description, current_state, previous_actions
        )

        # Select best recovery option
        best_option = await self._select_best_recovery(recovery_options, current_state)

        return {
            'recovery_options': recovery_options,
            'selected_option': best_option,
            'confidence': self._calculate_recovery_confidence(best_option)
        }

    async def _generate_recovery_options(self,
                                       error_type: str,
                                       error_description: str,
                                       current_state: Dict,
                                       previous_actions: List[Dict]) -> List[Dict]:
        """Generate recovery options using LLM"""
        prompt = self.prompt_engineer.generate_prompt(
            'error_recovery',
            failed_task=error_description,
            failure_reason=error_type,
            current_state=current_state,
            previous_actions=previous_actions
        )

        response = await self.llm_manager.generate_response(
            prompt,
            system_prompt="You are an error recovery expert for robotics. Suggest recovery actions with estimated success probabilities."
        )

        return self._parse_recovery_options(response)

    def _parse_recovery_options(self, response: str) -> List[Dict]:
        """Parse recovery options from LLM response"""
        try:
            import json
            json_start = response.find('{')
            json_end = response.rfind('}') + 1

            if json_start != -1 and json_end != 0:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                return data.get('recovery_options', [])
            else:
                # If no JSON, create a simple option
                return [{
                    'option_id': 'default_recovery',
                    'description': response,
                    'estimated_success_probability': 0.5,
                    'required_resources': [],
                    'alternative_approach': 'Try again with different parameters'
                }]
        except:
            return [{
                'option_id': 'fallback_recovery',
                'description': 'Retry with modified parameters',
                'estimated_success_probability': 0.3,
                'required_resources': [],
                'alternative_approach': 'Use alternative approach'
            }]

    async def _select_best_recovery(self,
                                  recovery_options: List[Dict],
                                  current_state: Dict) -> Dict:
        """Select the best recovery option based on current state"""
        if not recovery_options:
            return {
                'option_id': 'no_recovery',
                'description': 'No recovery options available',
                'action': 'abort_task'
            }

        # For now, select the option with highest estimated success probability
        # In practice, consider current state, available resources, etc.
        best_option = max(recovery_options,
                         key=lambda x: x.get('estimated_success_probability', 0))

        return best_option

    def _calculate_recovery_confidence(self, recovery_option: Dict) -> float:
        """Calculate confidence in the recovery option"""
        return recovery_option.get('estimated_success_probability', 0.5)

    def _log_error(self, error_type: str, error_description: str, current_state: Dict):
        """Log error for future learning"""
        error_record = {
            'timestamp': time.time(),
            'error_type': error_type,
            'description': error_description,
            'state': current_state,
            'context': self._get_context_for_error()
        }
        self.error_history.append(error_record)

        # Keep only recent errors (last 100)
        if len(self.error_history) > 100:
            self.error_history = self.error_history[-100:]

    def _get_context_for_error(self) -> Dict:
        """Get context information for error analysis"""
        return {
            # This would include relevant context information
            # such as recent actions, environmental state, etc.
        }

    def get_recovery_statistics(self) -> Dict[str, Any]:
        """Get statistics about error recovery"""
        if not self.error_history:
            return {"total_errors": 0}

        error_types = {}
        for error in self.error_history:
            err_type = error['error_type']
            error_types[err_type] = error_types.get(err_type, 0) + 1

        return {
            "total_errors": len(self.error_history),
            "error_types": error_types,
            "recent_errors": self.error_history[-10:]  # Last 10 errors
        }
```

## ROS 2 Integration

### LLM-ROS Interface Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String, Float32
from geometry_msgs.msg import PoseStamped
from sensor_msgs.msg import Image
from action_msgs.msg import GoalStatus
from rclpy.action import ActionClient
from rclpy.callback_groups import ReentrantCallbackGroup
from rclpy.qos import QoSProfile, ReliabilityPolicy
import asyncio
from threading import Thread
import json

class LLMROSInterface(Node):
    def __init__(self):
        super().__init__('llm_ros_interface')

        # Initialize LLM components
        llm_config = {
            'type': 'openai',  # or 'anthropic', 'local'
            'name': 'gpt-4-turbo',
            'api_key': self.declare_parameter('llm_api_key', '').value or 'YOUR_API_KEY',
            'temperature': 0.3,
            'max_tokens': 1500
        }

        self.llm_manager = LLMManager(llm_config)
        self.context_manager = ContextManager()
        self.prompt_engineer = PromptEngineer()
        self.task_planner = HierarchicalTaskPlanner(self.llm_manager, self.context_manager)
        self.multi_modal_reasoner = MultiModalReasoner(self.llm_manager, self.prompt_engineer)
        self.error_recovery = ErrorRecoveryManager(self.llm_manager, self.prompt_engineer)

        # ROS 2 Publishers
        self.plan_pub = self.create_publisher(String, '/llm_plan', 10)
        self.status_pub = self.create_publisher(String, '/llm_status', 10)
        self.action_pub = self.create_publisher(String, '/robot_commands', 10)

        # ROS 2 Subscribers
        self.voice_cmd_sub = self.create_subscription(
            String,
            '/voice_commands',
            self.voice_command_callback,
            10
        )

        self.vision_sub = self.create_subscription(
            Image,
            '/camera/image_raw',
            self.vision_callback,
            QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE)
        )

        self.robot_state_sub = self.create_subscription(
            String,
            '/robot_state',
            self.robot_state_callback,
            10
        )

        # Action clients for robot execution
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        self.manip_client = ActionClient(self, ManipulateObject, 'manipulate_object')

        # Task execution parameters
        self.current_task = None
        self.task_queue = asyncio.Queue()
        self.execution_thread = Thread(target=self._execution_loop, daemon=True)
        self.execution_thread.start()

        self.get_logger().info('LLM-ROS interface initialized')

    def voice_command_callback(self, msg: String):
        """Handle voice commands from Whisper"""
        command_text = msg.data
        self.get_logger().info(f'Received voice command: {command_text}')

        # Add to context
        self.context_manager.add_interaction(command_text, "Processing...")

        # Create and execute plan in background
        asyncio.create_task(self._process_voice_command(command_text))

    async def _process_voice_command(self, command_text: str):
        """Process voice command using LLM"""
        try:
            # Update status
            status_msg = String()
            status_msg.data = f"PLANNING: {command_text}"
            self.status_pub.publish(status_msg)

            # Create plan
            plan = await self.task_planner.create_plan(command_text)

            if plan:
                # Publish plan
                plan_msg = String()
                plan_msg.data = json.dumps([{
                    'id': task.id,
                    'description': task.description,
                    'action': task.action,
                    'parameters': task.parameters
                } for task in plan])
                self.plan_pub.publish(plan_msg)

                # Add plan to execution queue
                await self.task_queue.put(plan)

                self.get_logger().info(f'Created plan with {len(plan)} tasks')
            else:
                self.get_logger().error('Failed to create plan')

        except Exception as e:
            self.get_logger().error(f'Error processing voice command: {e}')
            # Handle error with recovery
            error_result = await self.error_recovery.handle_error(
                'planning_error',
                str(e),
                self.context_manager.environment_state,
                []
            )
            self._handle_recovery(error_result)

    def vision_callback(self, msg: Image):
        """Handle visual input for multi-modal reasoning"""
        # Convert ROS Image to numpy array (simplified)
        # In practice, you'd properly convert the image message
        visual_data = self._ros_image_to_numpy(msg)

        # Process with multi-modal reasoner
        asyncio.create_task(self._process_visual_input(visual_data))

    async def _process_visual_input(self, visual_data: np.ndarray):
        """Process visual input and update context"""
        try:
            # For now, just update environment state with visual info
            # In practice, this would involve object detection, scene analysis, etc.
            visual_context = {
                'timestamp': time.time(),
                'has_visual_data': True,
                'image_shape': visual_data.shape if hasattr(visual_data, 'shape') else 'unknown'
            }
            self.context_manager.update_environment_state(visual_context)

            self.get_logger().info('Processed visual input')
        except Exception as e:
            self.get_logger().error(f'Error processing visual input: {e}')

    def robot_state_callback(self, msg: String):
        """Handle robot state updates"""
        try:
            state_data = json.loads(msg.data)
            self.context_manager.update_environment_state(state_data)

            self.get_logger().info(f'Updated robot state: {state_data.get("status", "unknown")}')
        except json.JSONDecodeError:
            self.get_logger().error(f'Invalid robot state JSON: {msg.data}')

    def _execution_loop(self):
        """Background execution loop for tasks"""
        asyncio.run(self._async_execution_loop())

    async def _async_execution_loop(self):
        """Async execution loop"""
        while rclpy.ok():
            try:
                # Get next plan from queue
                if not self.task_queue.empty():
                    plan = await self.task_queue.get()
                    await self._execute_plan(plan)

                await asyncio.sleep(0.1)  # Small delay to prevent busy waiting
            except Exception as e:
                self.get_logger().error(f'Execution loop error: {e}')
                await asyncio.sleep(1.0)

    async def _execute_plan(self, plan: List[Task]):
        """Execute a plan of tasks"""
        for task in plan:
            success = await self._execute_single_task(task)
            if not success:
                self.get_logger().error(f'Task execution failed: {task.description}')
                # Try recovery
                recovery_result = await self.error_recovery.handle_error(
                    'task_execution_failed',
                    f'Task {task.id} failed',
                    self.context_manager.environment_state,
                    [{'task_id': task.id, 'result': 'failed'}]
                )
                await self._handle_recovery(recovery_result)
                break  # Stop execution on failure for now

    async def _execute_single_task(self, task: Task) -> bool:
        """Execute a single task"""
        try:
            # Publish action command
            action_msg = String()
            action_msg.data = json.dumps({
                'task_id': task.id,
                'action': task.action,
                'parameters': task.parameters
            })
            self.action_pub.publish(action_msg)

            # Wait for task completion (simplified)
            # In practice, this would involve monitoring action feedback
            await asyncio.sleep(2.0)  # Simulate task execution time

            return True
        except Exception as e:
            self.get_logger().error(f'Task execution error: {e}')
            return False

    async def _handle_recovery(self, recovery_result: Dict):
        """Handle recovery based on LLM suggestions"""
        selected_option = recovery_result.get('selected_option', {})
        option_id = selected_option.get('option_id', 'no_recovery')

        if option_id != 'no_recovery':
            self.get_logger().info(f'Attempting recovery: {selected_option.get("description", "unknown")}')

            # Execute recovery action
            recovery_msg = String()
            recovery_msg.data = json.dumps({
                'recovery_option': option_id,
                'action': selected_option.get('alternative_approach', 'retry'),
                'description': selected_option.get('description', '')
            })
            self.action_pub.publish(recovery_msg)

    def _ros_image_to_numpy(self, img_msg: Image) -> np.ndarray:
        """Convert ROS Image message to numpy array (simplified)"""
        # This is a simplified conversion - in practice you'd handle
        # different encodings and formats properly
        import numpy as np

        # Assuming 8UC3 (RGB) encoding for simplicity
        height = img_msg.height
        width = img_msg.width
        step = img_msg.step

        # Convert image data to numpy array
        img_array = np.frombuffer(img_msg.data, dtype=np.uint8)
        img_array = img_array.reshape((height, width, 3))  # Assuming 3 channels (RGB)

        return img_array
```

## Performance Optimization

### Caching and Efficiency

```python
import functools
import hashlib
from typing import Callable, Any
import pickle
import os

class LLMCache:
    def __init__(self, cache_dir: str = "/tmp/llm_cache", max_size: int = 1000):
        self.cache_dir = cache_dir
        self.max_size = max_size
        self.cache = {}
        self.access_order = []  # For LRU eviction

        # Create cache directory if it doesn't exist
        os.makedirs(cache_dir, exist_ok=True)

    def _get_cache_key(self, prompt: str, system_prompt: str = None) -> str:
        """Generate cache key from prompt and system prompt"""
        combined = f"{prompt}|||{system_prompt or ''}"
        return hashlib.md5(combined.encode()).hexdigest()

    def _get_cache_path(self, cache_key: str) -> str:
        """Get file path for cache entry"""
        return os.path.join(self.cache_dir, f"{cache_key}.pkl")

    def get(self, prompt: str, system_prompt: str = None) -> Any:
        """Get cached response"""
        cache_key = self._get_cache_key(prompt, system_prompt)
        cache_path = self._get_cache_path(cache_key)

        if os.path.exists(cache_path):
            try:
                with open(cache_path, 'rb') as f:
                    return pickle.load(f)
            except:
                # If cache file is corrupted, remove it
                os.remove(cache_path)
                return None

        return None

    def set(self, prompt: str, response: Any, system_prompt: str = None):
        """Set cached response"""
        cache_key = self._get_cache_key(prompt, system_prompt)
        cache_path = self._get_cache_path(cache_key)

        try:
            with open(cache_path, 'wb') as f:
                pickle.dump(response, f)
        except:
            pass  # Ignore cache errors

    def cleanup(self):
        """Clean up cache files to maintain size limit"""
        cache_files = [f for f in os.listdir(self.cache_dir) if f.endswith('.pkl')]

        if len(cache_files) > self.max_size:
            # Remove oldest files (by modification time)
            cache_files.sort(key=lambda f: os.path.getmtime(os.path.join(self.cache_dir, f)))

            files_to_remove = cache_files[:len(cache_files) - self.max_size]
            for file in files_to_remove:
                try:
                    os.remove(os.path.join(self.cache_dir, file))
                except:
                    pass

class OptimizedLLMManager(LLMManager):
    def __init__(self, model_config, enable_caching=True):
        super().__init__(model_config)
        self.enable_caching = enable_caching
        self.cache = LLMCache() if enable_caching else None
        self.cache_hits = 0
        self.cache_misses = 0

    async def generate_response(self, prompt, system_prompt=None):
        """Generate response with caching"""
        if self.enable_caching:
            cached_response = self.cache.get(prompt, system_prompt)
            if cached_response is not None:
                self.cache_hits += 1
                return cached_response
            else:
                self.cache_misses += 1

        # Generate response normally
        response = await super().generate_response(prompt, system_prompt)

        # Cache the response
        if self.enable_caching:
            self.cache.set(prompt, response, system_prompt)

        return response

    def get_cache_stats(self):
        """Get cache performance statistics"""
        total_requests = self.cache_hits + self.cache_misses
        hit_rate = self.cache_hits / total_requests if total_requests > 0 else 0

        return {
            'cache_hits': self.cache_hits,
            'cache_misses': self.cache_misses,
            'hit_rate': hit_rate,
            'total_requests': total_requests
        }
```

## Best Practices

### Cognitive Planning Best Practices

1. **Context Management**: Maintain rich context for coherent reasoning
2. **Error Handling**: Implement robust error detection and recovery
3. **Performance Optimization**: Use caching and efficient prompting
4. **Safety First**: Validate all actions before execution
5. **Modular Design**: Separate reasoning from execution
6. **Monitoring**: Implement comprehensive logging and monitoring

### LLM Integration Best Practices

1. **Prompt Engineering**: Craft effective prompts for robotics tasks
2. **Response Validation**: Validate LLM outputs before execution
3. **Temperature Tuning**: Adjust temperature for different task types
4. **Context Window Management**: Handle long-running interactions
5. **Cost Management**: Optimize API usage and local processing
6. **Privacy Considerations**: Handle sensitive data appropriately

### Multi-Modal Integration Best Practices

1. **Data Fusion**: Combine multiple sensor modalities effectively
2. **Timing Synchronization**: Handle asynchronous sensor data
3. **Uncertainty Quantification**: Account for sensor and model uncertainty
4. **Real-time Performance**: Optimize for real-time constraints
5. **Fallback Systems**: Implement reliable fallback behaviors
6. **Calibration**: Ensure proper sensor calibration

## Summary

Cognitive planning using LLMs enables humanoid robots to perform complex reasoning and decision-making tasks. By combining natural language understanding with multi-modal perception and action execution, robots can interpret high-level commands and execute sophisticated behaviors. The integration of LLMs with ROS 2 provides a powerful framework for developing intelligent humanoid systems.

The next chapter will cover human-robot interaction paradigms and the development of the capstone autonomous humanoid project.