---
sidebar_position: 1
---

# Whisper Voice Commands

## Learning Objectives

By the end of this chapter, you will be able to:
- Install and configure OpenAI Whisper for voice command processing
- Integrate Whisper with ROS 2 for real-time speech recognition
- Implement voice command grammars and vocabularies for humanoid robots
- Process and interpret voice commands for robot control
- Handle speech recognition errors and implement robust fallbacks
- Optimize Whisper performance for real-time humanoid applications

## Introduction to Whisper for Robotics

### What is Whisper?

Whisper is OpenAI's automatic speech recognition (ASR) system trained on 680,000 hours of multilingual and multitask supervised data. For humanoid robotics, Whisper provides:

- **Multilingual support**: Recognition in multiple languages
- **Robust performance**: Works well in various acoustic conditions
- **Real-time capabilities**: Can be optimized for live speech processing
- **Open-source availability**: Free to use and modify
- **Context awareness**: Can be fine-tuned for specific domains

### Voice Commands in Humanoid Robotics

Voice commands enable natural human-robot interaction, allowing users to:
- Control robot navigation and actions
- Request information from the robot
- Issue complex multi-step instructions
- Interact without physical interfaces
- Enable accessibility for users with mobility limitations

## Installing Whisper

### System Requirements

- **Python**: 3.8 or higher
- **OS**: Linux, macOS, or Windows
- **RAM**: 8GB minimum, 16GB recommended
- **GPU**: Optional but recommended for real-time performance (CUDA-capable GPU)
- **Audio**: Microphone input device

### Installation Methods

#### Using pip (Recommended)

```bash
# Install Whisper with pip
pip install openai-whisper

# Install additional dependencies for audio processing
pip install torch torchaudio
pip install sounddevice pyaudio

# For GPU acceleration (if CUDA available)
pip install torch --index-url https://download.pytorch.org/whl/cu118
```

#### Using conda

```bash
# Create new environment
conda create -n whisper-robotics python=3.9
conda activate whisper-robotics

# Install Whisper
pip install openai-whisper
conda install pytorch torchaudio -c pytorch
```

### Verification

```python
import whisper
import torch

# Check if Whisper is properly installed
print(f"Whisper version: {whisper.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

# Load a model to verify installation
model = whisper.load_model("base")
print("Whisper installation verified successfully!")
```

## Whisper Models and Performance

### Model Sizes and Characteristics

| Model | Size | Required VRAM | Relative Speed | English-only | Multilingual |
|-------|------|---------------|----------------|--------------|--------------|
| tiny  | 75MB | ~1GB | ~32x | ✓ | ✓ |
| base  | 142MB | ~1GB | ~16x | ✓ | ✓ |
| small | 465MB | ~2GB | ~6x | ✓ | ✓ |
| medium | 1.5GB | ~5GB | ~2x | ✓ | ✓ |
| large | 3.0GB | ~10GB | 1x | ✗ | ✓ |

### Model Selection for Robotics

For humanoid robotics applications:

- **tiny** or **base**: Best for edge devices and real-time applications
- **small**: Good balance of accuracy and speed for most robots
- **medium**: For applications requiring higher accuracy
- **large**: For maximum accuracy in controlled environments

```python
import whisper

def select_model_for_robot(robot_specs):
    """
    Select appropriate Whisper model based on robot specifications
    """
    if robot_specs['gpu_memory'] < 2:  # Less than 2GB
        return whisper.load_model("tiny")
    elif robot_specs['gpu_memory'] < 4:  # Less than 4GB
        return whisper.load_model("base")
    elif robot_specs['gpu_memory'] < 6:  # Less than 6GB
        return whisper.load_model("small")
    elif robot_specs['gpu_memory'] < 10:  # Less than 10GB
        return whisper.load_model("medium")
    else:
        return whisper.load_model("large")

# Example usage
robot_specs = {
    'gpu_memory': 4,  # 4GB GPU
    'cpu_cores': 8,
    'ram': 16
}

model = select_model_for_robot(robot_specs)
```

## Audio Input and Processing

### Audio Capture Setup

```python
import pyaudio
import numpy as np
import threading
import queue
import time

class AudioCapture:
    def __init__(self, sample_rate=16000, chunk_size=1024, channels=1):
        self.sample_rate = sample_rate
        self.chunk_size = chunk_size
        self.channels = channels

        # Audio stream parameters
        self.format = pyaudio.paInt16
        self.audio_queue = queue.Queue()
        self.is_recording = False
        self.audio = pyaudio.PyAudio()

        # VAD (Voice Activity Detection) parameters
        self.energy_threshold = 1000  # Adjust based on environment
        self.silence_duration = 1.0   # Seconds of silence to stop recording

    def start_recording(self):
        """Start audio recording in a separate thread"""
        self.is_recording = True
        self.recording_thread = threading.Thread(target=self._record_audio)
        self.recording_thread.start()

    def stop_recording(self):
        """Stop audio recording"""
        self.is_recording = False
        if hasattr(self, 'recording_thread'):
            self.recording_thread.join()

    def _record_audio(self):
        """Internal method to handle audio recording"""
        stream = self.audio.open(
            format=self.format,
            channels=self.channels,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.chunk_size
        )

        audio_buffer = []
        silence_frames = 0
        max_silence_frames = int(self.silence_duration * self.sample_rate / self.chunk_size)

        try:
            while self.is_recording:
                data = stream.read(self.chunk_size)
                audio_array = np.frombuffer(data, dtype=np.int16)

                # Calculate energy for VAD
                energy = np.sum(audio_array.astype(np.float32) ** 2) / len(audio_array)

                if energy > self.energy_threshold:
                    # Voice detected, add to buffer and reset silence counter
                    audio_buffer.extend(audio_array)
                    silence_frames = 0
                else:
                    # Silence detected
                    silence_frames += 1
                    audio_buffer.extend(audio_array)  # Still add to buffer

                    # If silence duration exceeded, send audio for processing
                    if silence_frames > max_silence_frames and len(audio_buffer) > 0:
                        # Send audio buffer for processing
                        self.audio_queue.put(np.array(audio_buffer, dtype=np.float32))
                        audio_buffer = []  # Reset buffer
                        silence_frames = 0  # Reset silence counter

        except Exception as e:
            print(f"Audio recording error: {e}")
        finally:
            stream.stop_stream()
            stream.close()

    def get_audio_chunk(self, timeout=None):
        """Get audio chunk from the queue"""
        try:
            return self.audio_queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def __del__(self):
        """Cleanup audio resources"""
        self.audio.terminate()
```

### Audio Preprocessing for Whisper

```python
import torch
import librosa
from scipy import signal

class AudioPreprocessor:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.target_sample_rate = 16000  # Whisper expects 16kHz

    def preprocess_audio(self, audio_data):
        """
        Preprocess audio for Whisper input
        """
        # Convert to float32 if needed
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)

        # Normalize audio
        audio_data = audio_data / np.max(np.abs(audio_data))

        # Resample if necessary
        if self.sample_rate != self.target_sample_rate:
            audio_data = librosa.resample(
                audio_data,
                orig_sr=self.sample_rate,
                target_sr=self.target_sample_rate
            )

        # Apply pre-emphasis filter to enhance high frequencies
        audio_data = self.pre_emphasis_filter(audio_data)

        # Convert to torch tensor
        audio_tensor = torch.from_numpy(audio_data).float()

        return audio_tensor

    def pre_emphasis_filter(self, audio_data, pre_emphasis=0.97):
        """
        Apply pre-emphasis filter to enhance high frequencies
        """
        return signal.lfilter([1.0, -pre_emphasis], 1, audio_data)

    def remove_silence(self, audio_data, threshold=0.01, frame_length=256):
        """
        Remove silence from audio data
        """
        # Calculate energy for each frame
        frames = librosa.util.frame(audio_data, frame_length=frame_length, hop_length=frame_length//2)
        frame_energy = np.sum(frames**2, axis=0) / frame_length

        # Find non-silent frames
        non_silent_frames = frame_energy > threshold
        non_silent_indices = np.where(non_silent_frames)[0]

        if len(non_silent_indices) > 0:
            start_frame = non_silent_indices[0]
            end_frame = non_silent_indices[-1] + 1

            start_sample = start_frame * (frame_length // 2)
            end_sample = end_frame * (frame_length // 2) + frame_length

            return audio_data[start_sample:end_sample]
        else:
            return audio_data  # Return original if all silent
```

## ROS 2 Integration

### Whisper ROS 2 Node

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from audio_common_msgs.msg import AudioData
from sensor_msgs.msg import Audio
from builtin_interfaces.msg import Duration
import whisper
import torch
import numpy as np
from threading import Lock

class WhisperROSNode(Node):
    def __init__(self):
        super().__init__('whisper_voice_command_node')

        # Initialize Whisper model
        self.model = whisper.load_model("base")  # Adjust based on your needs
        self.model_lock = Lock()  # Thread safety for model

        # Audio input subscriber
        self.audio_sub = self.create_subscription(
            Audio,
            '/audio_input',
            self.audio_callback,
            10
        )

        # Voice command publisher
        self.command_pub = self.create_publisher(
            String,
            '/voice_commands',
            10
        )

        # Status publisher
        self.status_pub = self.create_publisher(
            String,
            '/voice_recognition_status',
            10
        )

        # Configuration parameters
        self.declare_parameter('model_size', 'base')
        self.declare_parameter('language', 'en')
        self.declare_parameter('temperature', 0.0)
        self.declare_parameter('initial_prompt', 'Humanoid robot voice commands')

        # Recognition parameters
        self.language = self.get_parameter('language').value
        self.temperature = self.get_parameter('temperature').value
        self.initial_prompt = self.get_parameter('initial_prompt').value

        # Audio buffer for accumulating chunks
        self.audio_buffer = []
        self.buffer_max_duration = 10.0  # Maximum 10 seconds of audio

        self.get_logger().info('Whisper voice command node initialized')

    def audio_callback(self, msg):
        """Process incoming audio data"""
        try:
            # Convert audio message to numpy array
            audio_data = self.audio_msg_to_numpy(msg)

            # Add to buffer
            self.audio_buffer.extend(audio_data)

            # Check if buffer is large enough for processing
            if len(self.audio_buffer) > 16000 * 2:  # At least 2 seconds of audio
                self.process_audio_buffer()

        except Exception as e:
            self.get_logger().error(f'Error processing audio: {e}')

    def audio_msg_to_numpy(self, audio_msg):
        """Convert ROS Audio message to numpy array"""
        # Convert byte data to numpy array
        audio_array = np.frombuffer(audio_msg.data, dtype=np.int16)

        # Convert to float32 and normalize
        audio_array = audio_array.astype(np.float32) / 32768.0

        return audio_array

    def process_audio_buffer(self):
        """Process accumulated audio buffer with Whisper"""
        if len(self.audio_buffer) == 0:
            return

        # Convert buffer to tensor
        audio_tensor = torch.from_numpy(np.array(self.audio_buffer, dtype=np.float32))

        # Process with Whisper (thread-safe)
        with self.model_lock:
            try:
                # Transcribe audio
                result = self.model.transcribe(
                    audio_tensor,
                    language=self.language,
                    temperature=self.temperature,
                    initial_prompt=self.initial_prompt
                )

                # Publish recognized text
                if result['text'].strip():
                    command_msg = String()
                    command_msg.data = result['text'].strip()
                    self.command_pub.publish(command_msg)

                    self.get_logger().info(f'Recognized: {result["text"]}')

                    # Publish status
                    status_msg = String()
                    status_msg.data = f"RECOGNIZED: {result['text']}"
                    self.status_pub.publish(status_msg)

            except Exception as e:
                self.get_logger().error(f'Whisper transcription error: {e}')
                status_msg = String()
                status_msg.data = f"ERROR: {str(e)}"
                self.status_pub.publish(status_msg)

        # Clear buffer after processing
        self.audio_buffer = []

    def set_language(self, language_code):
        """Change recognition language"""
        self.language = language_code
        self.get_logger().info(f'Language set to: {language_code}')

    def set_temperature(self, temperature):
        """Set transcription temperature"""
        self.temperature = temperature
        self.get_logger().info(f'Temperature set to: {temperature}')
```

## Voice Command Processing

### Command Grammar and Interpretation

```python
import re
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Optional

class CommandType(Enum):
    NAVIGATION = "navigation"
    MANIPULATION = "manipulation"
    INFORMATION = "information"
    SYSTEM = "system"

@dataclass
class ParsedCommand:
    command_type: CommandType
    action: str
    parameters: Dict[str, str]
    confidence: float
    original_text: str

class VoiceCommandProcessor:
    def __init__(self):
        # Define command patterns
        self.command_patterns = {
            CommandType.NAVIGATION: [
                r'go to (the )?(?P<location>\w+)',
                r'move to (the )?(?P<location>\w+)',
                r'walk to (the )?(?P<location>\w+)',
                r'navigate to (the )?(?P<location>\w+)',
                r'go (straight|left|right)',
                r'turn (left|right)',
                r'move (forward|backward)',
                r'stop',
                r'come here'
            ],
            CommandType.MANIPULATION: [
                r'pick up (the )?(?P<object>\w+)',
                r'grab (the )?(?P<object>\w+)',
                r'hold (the )?(?P<object>\w+)',
                r'put (the )?(?P<object>\w+) (down|on the (?P<surface>\w+))',
                r'give me (the )?(?P<object>\w+)',
                r'open (the )?(?P<object>\w+)',
                r'close (the )?(?P<object>\w+)'
            ],
            CommandType.INFORMATION: [
                r'what time is it',
                r'what is the weather',
                r'tell me about (the )?(?P<subject>\w+)',
                r'how (old|tall|heavy) (is|are) (the )?(?P<object>\w+)',
                r'where is (the )?(?P<location>\w+)'
            ],
            CommandType.SYSTEM: [
                r'shutdown',
                r'restart',
                r'sleep',
                r'wake up',
                r'hello',
                r'hi'
            ]
        }

        # Location mapping
        self.location_map = {
            'kitchen': 'kitchen_waypoint',
            'bedroom': 'bedroom_waypoint',
            'living room': 'living_room_waypoint',
            'office': 'office_waypoint',
            'bathroom': 'bathroom_waypoint'
        }

        # Object mapping
        self.object_map = {
            'bottle': 'bottle_object',
            'cup': 'cup_object',
            'book': 'book_object',
            'phone': 'phone_object'
        }

    def parse_command(self, text: str) -> Optional[ParsedCommand]:
        """Parse voice command and extract structured information"""
        text = text.lower().strip()

        for cmd_type, patterns in self.command_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    # Extract parameters
                    params = match.groupdict()

                    # Map parameters to internal representations
                    self._map_parameters(params)

                    # Calculate confidence based on match quality
                    confidence = self._calculate_confidence(text, pattern, match)

                    return ParsedCommand(
                        command_type=cmd_type,
                        action=match.group(0),
                        parameters=params,
                        confidence=confidence,
                        original_text=text
                    )

        return None

    def _map_parameters(self, params: Dict[str, str]):
        """Map parameters to internal robot representations"""
        # Map locations
        if 'location' in params:
            location_key = params['location'].replace('_', ' ')
            if location_key in self.location_map:
                params['location'] = self.location_map[location_key]

        # Map objects
        if 'object' in params:
            object_key = params['object'].replace('_', ' ')
            if object_key in self.object_map:
                params['object'] = self.object_map[object_key]

    def _calculate_confidence(self, text: str, pattern: str, match) -> float:
        """Calculate confidence score for command match"""
        # Simple confidence calculation based on match length and pattern specificity
        match_length = len(match.group(0))
        text_length = len(text)

        # Base confidence on how much of the text was matched
        length_confidence = match_length / text_length if text_length > 0 else 0.0

        # Additional confidence for specific patterns
        pattern_specificity = 1.0 - (pattern.count('\\w') * 0.1)  # Penalize generic patterns

        confidence = (length_confidence * 0.7) + (pattern_specificity * 0.3)

        return min(confidence, 1.0)  # Cap at 1.0

    def validate_command(self, command: ParsedCommand) -> bool:
        """Validate if command is appropriate for execution"""
        if command.confidence < 0.5:
            return False

        # Additional validation rules can be added here
        # For example, check if location exists, object is reachable, etc.

        return True

# Example usage
processor = VoiceCommandProcessor()
command = processor.parse_command("go to the kitchen")
if command and processor.validate_command(command):
    print(f"Command: {command.command_type.value}, Action: {command.action}, Params: {command.parameters}")
```

### Command Execution Interface

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from geometry_msgs.msg import PoseStamped
from action_msgs.msg import GoalStatus
from rclpy.action import ActionClient
from rclpy.callback_groups import ReentrantCallbackGroup
from threading import Lock

class VoiceCommandExecutor(Node):
    def __init__(self):
        super().__init__('voice_command_executor')

        # Command subscription
        self.command_sub = self.create_subscription(
            String,
            '/voice_commands',
            self.command_callback,
            10
        )

        # Navigation action client
        self.nav_client = ActionClient(
            self,
            NavigateToPose,
            'navigate_to_pose'
        )

        # System command publisher
        self.system_cmd_pub = self.create_publisher(
            String,
            '/system_commands',
            10
        )

        # Command processor
        self.command_processor = VoiceCommandProcessor()
        self.command_lock = Lock()

        # Active command tracking
        self.active_goal = None

        self.get_logger().info('Voice command executor initialized')

    def command_callback(self, msg):
        """Process incoming voice commands"""
        command_text = msg.data

        # Parse command
        parsed_command = self.command_processor.parse_command(command_text)

        if parsed_command and self.command_processor.validate_command(parsed_command):
            self.get_logger().info(f'Executing command: {parsed_command.action}')

            # Execute command based on type
            if parsed_command.command_type == CommandType.NAVIGATION:
                self.execute_navigation_command(parsed_command)
            elif parsed_command.command_type == CommandType.MANIPULATION:
                self.execute_manipulation_command(parsed_command)
            elif parsed_command.command_type == CommandType.INFORMATION:
                self.execute_information_command(parsed_command)
            elif parsed_command.command_type == CommandType.SYSTEM:
                self.execute_system_command(parsed_command)
        else:
            self.get_logger().warn(f'Invalid or low-confidence command: {command_text}')

    def execute_navigation_command(self, command: ParsedCommand):
        """Execute navigation commands"""
        if 'location' in command.parameters:
            location = command.parameters['location']

            # Look up location coordinates (this would come from a map)
            pose = self.get_location_pose(location)

            if pose:
                goal_msg = NavigateToPose.Goal()
                goal_msg.pose = pose

                # Send navigation goal
                self.nav_client.wait_for_server()
                future = self.nav_client.send_goal_async(goal_msg)
                future.add_done_callback(self.navigation_goal_callback)
            else:
                self.get_logger().error(f'Unknown location: {location}')

    def execute_system_command(self, command: ParsedCommand):
        """Execute system commands"""
        action = command.action.lower()

        if 'shutdown' in action:
            # Publish shutdown command
            shutdown_msg = String()
            shutdown_msg.data = 'SHUTDOWN'
            self.system_cmd_pub.publish(shutdown_msg)
        elif 'sleep' in action or 'rest' in action:
            # Publish sleep command
            sleep_msg = String()
            sleep_msg.data = 'SLEEP'
            self.system_cmd_pub.publish(sleep_msg)
        elif 'wake' in action or 'hello' in action or 'hi' in action:
            # Publish wake up command
            wake_msg = String()
            wake_msg.data = 'WAKE_UP'
            self.system_cmd_pub.publish(wake_msg)

    def get_location_pose(self, location_name: str) -> Optional[PoseStamped]:
        """Get pose for a named location"""
        # This would typically query a map or location database
        # For now, return a simple mapping
        location_poses = {
            'kitchen_waypoint': PoseStamped(),
            'bedroom_waypoint': PoseStamped(),
            'living_room_waypoint': PoseStamped(),
            'office_waypoint': PoseStamped(),
            'bathroom_waypoint': PoseStamped()
        }

        if location_name in location_poses:
            pose = location_poses[location_name]
            pose.header.frame_id = 'map'
            pose.header.stamp = self.get_clock().now().to_msg()
            return pose
        else:
            return None

    def navigation_goal_callback(self, future):
        """Handle navigation goal response"""
        goal_handle = future.result()
        if goal_handle.accepted:
            self.get_logger().info('Navigation goal accepted')
            self.active_goal = goal_handle
            # Wait for result
            result_future = goal_handle.get_result_async()
            result_future.add_done_callback(self.navigation_result_callback)
        else:
            self.get_logger().error('Navigation goal rejected')

    def navigation_result_callback(self, future):
        """Handle navigation result"""
        result = future.result().result
        status = future.result().status

        if status == GoalStatus.STATUS_SUCCEEDED:
            self.get_logger().info('Navigation completed successfully')
        else:
            self.get_logger().error(f'Navigation failed with status: {status}')
```

## Real-time Processing Optimization

### Streaming Recognition

```python
import asyncio
import threading
from collections import deque
import time

class StreamingWhisper:
    def __init__(self, model_size="base", language="en"):
        self.model = whisper.load_model(model_size)
        self.language = language

        # Audio buffer for streaming
        self.audio_buffer = deque(maxlen=48000)  # 3 seconds at 16kHz
        self.buffer_lock = threading.Lock()

        # Recognition parameters
        self.chunk_duration = 2.0  # Process every 2 seconds
        self.overlap_duration = 0.5  # 0.5 second overlap
        self.min_speech_duration = 0.5  # Minimum speech to trigger recognition

        # Recognition state
        self.is_listening = False
        self.recognition_thread = None

    def start_streaming(self):
        """Start streaming recognition"""
        self.is_listening = True
        self.recognition_thread = threading.Thread(target=self._streaming_loop)
        self.recognition_thread.start()

    def stop_streaming(self):
        """Stop streaming recognition"""
        self.is_listening = False
        if self.recognition_thread:
            self.recognition_thread.join()

    def add_audio_chunk(self, audio_chunk):
        """Add audio chunk to processing buffer"""
        with self.buffer_lock:
            for sample in audio_chunk:
                self.audio_buffer.append(sample)

    def _streaming_loop(self):
        """Main streaming recognition loop"""
        last_process_time = time.time()

        while self.is_listening:
            current_time = time.time()

            # Process audio if enough time has passed
            if current_time - last_process_time >= self.chunk_duration - self.overlap_duration:
                with self.buffer_lock:
                    if len(self.audio_buffer) > 0:
                        # Convert buffer to numpy array
                        audio_array = np.array(list(self.audio_buffer))

                        # Check if there's sufficient speech activity
                        if self._has_speech_activity(audio_array):
                            # Process the audio
                            self._process_audio_chunk(audio_array)

                            # Keep overlap for continuity
                            overlap_samples = int(self.overlap_duration * 16000)
                            if len(self.audio_buffer) > overlap_samples:
                                # Keep only the overlap portion
                                overlap_data = list(self.audio_buffer)[-overlap_samples:]
                                self.audio_buffer.clear()
                                for sample in overlap_data:
                                    self.audio_buffer.append(sample)
                            else:
                                self.audio_buffer.clear()

                last_process_time = current_time

            time.sleep(0.1)  # Small delay to prevent busy waiting

    def _has_speech_activity(self, audio_array):
        """Check if audio chunk has sufficient speech activity"""
        if len(audio_array) == 0:
            return False

        # Calculate energy
        energy = np.sum(audio_array.astype(np.float32) ** 2) / len(audio_array)

        # Check against threshold (adjust based on environment)
        threshold = 100  # This value should be tuned
        return energy > threshold

    def _process_audio_chunk(self, audio_array):
        """Process audio chunk with Whisper"""
        try:
            # Convert to tensor
            audio_tensor = torch.from_numpy(audio_array).float()

            # Transcribe
            result = self.model.transcribe(
                audio_tensor,
                language=self.language,
                temperature=0.0,
                compression_ratio_threshold=None,  # Disable threshold for streaming
                logprob_threshold=None,  # Disable threshold for streaming
            )

            # Only publish if there's meaningful text
            if result['text'].strip():
                print(f"Recognized: {result['text']}")
                # Here you would publish to ROS topic
                self.publish_recognition_result(result['text'])

        except Exception as e:
            print(f"Error processing audio chunk: {e}")

    def publish_recognition_result(self, text):
        """Publish recognition result (placeholder for ROS integration)"""
        # This would publish to a ROS topic in a real implementation
        pass
```

## Error Handling and Robustness

### Recognition Error Handling

```python
class RobustVoiceCommandHandler:
    def __init__(self):
        self.error_count = 0
        self.max_errors = 5
        self.error_reset_time = 60  # Reset error count after 60 seconds
        self.last_error_time = 0

        # Confidence thresholds
        self.min_confidence = 0.5
        self.high_confidence = 0.8

        # Command confirmation settings
        self.require_confirmation = True
        self.confirmation_timeout = 5.0  # seconds

    def handle_recognition_result(self, text, confidence):
        """Handle Whisper recognition result with error checking"""
        current_time = time.time()

        # Reset error count if enough time has passed
        if current_time - self.last_error_time > self.error_reset_time:
            self.error_count = 0

        # Check for low confidence
        if confidence < self.min_confidence:
            self.error_count += 1
            self.last_error_time = current_time

            if self.error_count >= self.max_errors:
                self.handle_error_mode()
                return None

            # Ask for repetition
            self.request_repetition()
            return None

        # High confidence command
        if confidence > self.high_confidence:
            self.error_count = max(0, self.error_count - 1)  # Reduce error count

        # Parse and validate command
        command = self.parse_and_validate(text)

        if command:
            if self.require_confirmation and confidence < self.high_confidence:
                # Request confirmation for medium-confidence commands
                return self.request_confirmation(command)
            else:
                return command
        else:
            # Invalid command structure
            self.error_count += 1
            self.last_error_time = current_time
            self.request_repetition()
            return None

    def handle_error_mode(self):
        """Handle when too many errors occur"""
        print("Too many recognition errors. Entering error mode.")
        # Implement error mode behavior
        # For example: reduce processing rate, request manual input, etc.

    def request_repetition(self):
        """Request user to repeat the command"""
        print("Could not understand. Please repeat your command.")
        # This would trigger TTS to ask for repetition

    def request_confirmation(self, command):
        """Request confirmation for uncertain commands"""
        print(f"Did you say: '{command.original_text}'? Please confirm.")
        # This would trigger TTS and wait for confirmation
        # Return command if confirmed, None if not
        return command  # Simplified - in reality would wait for confirmation

    def parse_and_validate(self, text):
        """Parse and validate the command"""
        processor = VoiceCommandProcessor()
        command = processor.parse_command(text)

        if command and processor.validate_command(command):
            return command
        else:
            return None
```

## Performance Optimization

### GPU Acceleration

```python
import torch
import whisper
from torch.utils.benchmark import Timer

class OptimizedWhisperProcessor:
    def __init__(self, model_size="base"):
        # Check for CUDA availability
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        # Load model to device
        self.model = whisper.load_model(model_size).to(self.device)

        # Set to evaluation mode
        self.model.eval()

        # Warm up the model
        self._warmup()

        # Performance metrics
        self.processing_times = []
        self.average_processing_time = 0

    def _warmup(self):
        """Warm up the model to ensure optimal performance"""
        # Create a short dummy audio tensor
        dummy_audio = torch.zeros(16000, dtype=torch.float32).to(self.device)

        # Process dummy audio to warm up GPU
        with torch.no_grad():
            self.model.transcribe(dummy_audio, temperature=0.0)

    def transcribe_audio(self, audio_tensor, language="en"):
        """Transcribe audio with performance monitoring"""
        start_time = time.time()

        # Move audio to device if needed
        if audio_tensor.device != self.device:
            audio_tensor = audio_tensor.to(self.device)

        # Perform transcription
        with torch.no_grad():
            result = self.model.transcribe(
                audio_tensor,
                language=language,
                temperature=0.0
            )

        end_time = time.time()
        processing_time = end_time - start_time

        # Update performance metrics
        self.processing_times.append(processing_time)
        if len(self.processing_times) > 100:  # Keep last 100 measurements
            self.processing_times = self.processing_times[-100:]

        self.average_processing_time = sum(self.processing_times) / len(self.processing_times)

        return result

    def get_performance_stats(self):
        """Get performance statistics"""
        if len(self.processing_times) == 0:
            return {"average_time": 0, "min_time": 0, "max_time": 0, "sample_count": 0}

        return {
            "average_time": self.average_processing_time,
            "min_time": min(self.processing_times),
            "max_time": max(self.processing_times),
            "sample_count": len(self.processing_times),
            "current_device": str(self.device)
        }
```

## Best Practices

### Voice Command Best Practices

1. **Clear Audio Input**: Ensure high-quality microphone placement
2. **Noise Reduction**: Implement noise reduction algorithms
3. **Appropriate Model**: Choose model size based on hardware constraints
4. **Context Awareness**: Use prompts to guide recognition
5. **Error Handling**: Implement robust error handling and recovery
6. **User Feedback**: Provide clear feedback for recognized commands
7. **Privacy Considerations**: Handle audio data appropriately

### Performance Best Practices

1. **Streaming Processing**: Use streaming for real-time applications
2. **GPU Acceleration**: Utilize GPU when available
3. **Model Optimization**: Choose appropriate model for your use case
4. **Memory Management**: Efficiently manage audio buffers
5. **Threading**: Use proper threading for real-time performance
6. **Resource Monitoring**: Monitor CPU/GPU usage and memory

### Integration Best Practices

1. **Modular Design**: Keep audio processing separate from command execution
2. **Configuration**: Make parameters configurable via ROS parameters
3. **Monitoring**: Implement comprehensive logging and monitoring
4. **Fallback Systems**: Have reliable fallback mechanisms
5. **Testing**: Test with various accents and environmental conditions

## Summary

Whisper provides a powerful foundation for voice command processing in humanoid robotics, enabling natural human-robot interaction through speech. Proper integration with ROS 2 and optimization for real-time performance allows humanoid robots to understand and respond to voice commands effectively.

The next chapter will cover cognitive planning using Large Language Models (LLMs), building on voice command recognition to enable intelligent decision-making.