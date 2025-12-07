---
sidebar_position: 2
---

# Unity Visualization

## Learning Objectives

By the end of this chapter, you will be able to:
- Set up Unity for humanoid robotics visualization
- Import and configure humanoid robot models in Unity
- Implement real-time data synchronization between ROS 2 and Unity
- Create interactive 3D environments for humanoid robots
- Implement advanced visualization techniques for sensor data
- Build custom Unity interfaces for robot monitoring and control

## Introduction to Unity for Robotics

### Why Unity for Robotics Visualization?

Unity provides several advantages for robotics visualization:
- **High-quality graphics**: Realistic rendering and lighting
- **Cross-platform deployment**: Windows, Linux, WebGL, mobile
- **Asset ecosystem**: Extensive library of 3D models and environments
- **Scripting flexibility**: C# scripting for custom behaviors
- **Real-time performance**: Optimized for real-time applications
- **VR/AR support**: Extended reality capabilities for immersive experiences

### Unity Robotics Ecosystem

Unity offers specialized tools for robotics:
- **Unity Robotics Hub**: Centralized access to robotics packages
- **ROS#**: ROS communication bridge
- **ML-Agents**: Machine learning framework for robotics
- **Synthesis**: Synthetic data generation tools
- **Robotics Simulation Engine**: Physics and simulation tools

## Setting Up Unity for Robotics

### System Requirements

- **Operating System**: Windows 10/11, Ubuntu 20.04+ (Linux support limited)
- **Unity Version**: 2021.3 LTS or later recommended
- **Graphics**: DirectX 11 compatible GPU with 2GB+ VRAM
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 20GB free space for Unity installation

### Installation Process

1. **Download Unity Hub**
   - Visit unity.com and download Unity Hub
   - Install Unity Hub for package management

2. **Install Unity Editor**
   - Open Unity Hub
   - Install Unity 2021.3 LTS or later
   - Select modules: Linux Build Support (if needed), Visual Studio integration

3. **Install Robotics Packages**
   - Open Unity Package Manager (Window > Package Manager)
   - Install: ROS-TCP-Connector, Robotics Library, Visual Scripting

### ROS# Setup

Unity Robotics provides the ROS# package for ROS 2 communication:

```csharp
// Example ROS# publisher
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Std;

public class UnityRobotPublisher : MonoBehaviour
{
    ROSConnection ros;
    float publishMessageFrequency = 1f;
    float timeCounter = 0f;

    void Start()
    {
        ros = ROSConnection.instance;
    }

    void Update()
    {
        timeCounter += Time.deltaTime;
        if (timeCounter > publishMessageFrequency)
        {
            // Publish robot state
            ros.Send<UInt64Msg>("unity_robot_state", new UInt64Msg((ulong)Time.time));
            timeCounter = 0f;
        }
    }
}
```

## Importing Humanoid Robot Models

### Model Preparation

Before importing humanoid models into Unity:

1. **Mesh Optimization**
   - Reduce polygon count for real-time performance
   - Combine meshes where possible
   - Use appropriate texture resolution

2. **Coordinate System Conversion**
   - ROS uses right-handed coordinate system (X forward, Y left, Z up)
   - Unity uses left-handed coordinate system (X right, Y up, Z forward)
   - Apply transformation: X→Z, Y→Y, Z→-X (with sign flip)

3. **Joint Hierarchy Setup**
   - Create proper parent-child relationships
   - Ensure joint axes align with ROS URDF
   - Set up inverse kinematics if needed

### Import Process

```csharp
// Robot model controller script
using UnityEngine;

public class HumanoidModelController : MonoBehaviour
{
    [Header("Joint References")]
    public Transform torso;
    public Transform head;
    public Transform leftUpperArm;
    public Transform leftLowerArm;
    public Transform rightUpperArm;
    public Transform rightLowerArm;
    public Transform leftUpperLeg;
    public Transform leftLowerLeg;
    public Transform rightUpperLeg;
    public Transform rightLowerLeg;

    [Header("Joint Limits")]
    public float headYawMin = -30f;
    public float headYawMax = 30f;
    public float headPitchMin = -20f;
    public float headPitchMax = 45f;

    // Joint positions from ROS
    private float[] jointPositions = new float[20]; // Example: 20 joints

    void Update()
    {
        // Update joint positions based on ROS data
        UpdateJointPositions();
    }

    void UpdateJointPositions()
    {
        // Example: Update head joints
        if (head != null)
        {
            head.localRotation = Quaternion.Euler(
                Mathf.Clamp(jointPositions[0] * Mathf.Rad2Deg, headPitchMin, headPitchMax),
                Mathf.Clamp(jointPositions[1] * Mathf.Rad2Deg, headYawMin, headYawMax),
                0
            );
        }

        // Update other joints similarly...
    }

    public void SetJointPositions(float[] positions)
    {
        jointPositions = positions;
    }
}
```

### 3D Model Import Settings

When importing 3D models in Unity:

1. **Model Import Settings**
   - Scale Factor: Match ROS URDF scale (typically 1 unit = 1 meter)
   - Import Animation: Enable if model has animation
   - Generate Colliders: Only for physics interactions
   - Read/Write Enabled: For dynamic mesh modifications

2. **Materials and Textures**
   - Import textures at appropriate resolution
   - Set up materials to match physical properties
   - Use physically-based rendering (PBR) materials

3. **Rig Configuration**
   - Set Animation Type to "Generic" or "Humanoid"
   - Configure Avatar for humanoid models
   - Set up animation clips for common movements

## Real-time Data Synchronization

### ROS-TCP-Connector Setup

```csharp
// Connection manager for ROS communication
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;
using RosMessageTypes.Geometry;
using System.Collections.Generic;

public class ROSDataManager : MonoBehaviour
{
    [Header("ROS Topics")]
    public string jointStateTopic = "/joint_states";
    public string tfTopic = "/tf";
    public string imuTopic = "/imu/data";

    private ROSConnection ros;
    private Dictionary<string, float> jointPositions = new Dictionary<string, float>();
    private Dictionary<string, float> jointVelocities = new Dictionary<string, float>();
    private Dictionary<string, float> jointEfforts = new Dictionary<string, float>();

    void Start()
    {
        ros = ROSConnection.instance;

        // Subscribe to ROS topics
        ros.Subscribe<JointStateMsg>(jointStateTopic, OnJointStateReceived);
        ros.Subscribe<ImuMsg>(imuTopic, OnImuReceived);
    }

    void OnJointStateReceived(JointStateMsg jointState)
    {
        for (int i = 0; i < jointState.name.Count; i++)
        {
            if (i < jointState.position.Count)
                jointPositions[jointState.name[i]] = (float)jointState.position[i];

            if (i < jointState.velocity.Count)
                jointVelocities[jointState.name[i]] = (float)jointState.velocity[i];

            if (i < jointState.effort.Count)
                jointEfforts[jointState.name[i]] = (float)jointState.effort[i];
        }
    }

    void OnImuReceived(ImuMsg imu)
    {
        // Process IMU data for visualization
        Vector3 orientation = new Vector3(
            (float)imu.orientation.x,
            (float)imu.orientation.y,
            (float)imu.orientation.z,
            (float)imu.orientation.w
        );

        // Update visualization based on IMU data
        UpdateIMUVisualization(orientation);
    }

    void UpdateIMUVisualization(Vector4 orientation)
    {
        // Update robot orientation visualization
        // Implementation depends on your visualization needs
    }

    public float GetJointPosition(string jointName)
    {
        return jointPositions.ContainsKey(jointName) ? jointPositions[jointName] : 0f;
    }
}
```

### Data Processing Pipeline

```csharp
// Data processing and visualization manager
using UnityEngine;
using System.Collections.Generic;

public class DataVisualizationManager : MonoBehaviour
{
    [Header("Visualization Settings")]
    public float visualizationScale = 1.0f;
    public float updateRate = 60f; // Hz
    public bool enableInterpolation = true;

    private float lastUpdateTime;
    private Dictionary<string, float> previousJointPositions = new Dictionary<string, float>();
    private Dictionary<string, float> targetJointPositions = new Dictionary<string, float>();
    private Dictionary<string, float> currentJointPositions = new Dictionary<string, float>();

    private ROSDataManager rosDataManager;

    void Start()
    {
        rosDataManager = FindObjectOfType<ROSDataManager>();
        lastUpdateTime = Time.time;
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= 1f / updateRate)
        {
            UpdateJointData();
            lastUpdateTime = Time.time;
        }

        if (enableInterpolation)
        {
            InterpolateJointPositions();
        }
    }

    void UpdateJointData()
    {
        // Get latest joint positions from ROS
        var jointNames = rosDataManager.GetJointNames();
        foreach (string jointName in jointNames)
        {
            previousJointPositions[jointName] = currentJointPositions.ContainsKey(jointName) ?
                                              currentJointPositions[jointName] : 0f;
            targetJointPositions[jointName] = rosDataManager.GetJointPosition(jointName);
        }
    }

    void InterpolateJointPositions()
    {
        float interpolationFactor = Mathf.Clamp01((Time.time - lastUpdateTime) * updateRate);

        foreach (string jointName in targetJointPositions.Keys)
        {
            float start = previousJointPositions.ContainsKey(jointName) ?
                         previousJointPositions[jointName] : targetJointPositions[jointName];
            float end = targetJointPositions[jointName];

            currentJointPositions[jointName] = Mathf.Lerp(start, end, interpolationFactor);
        }

        // Apply interpolated positions to robot model
        ApplyJointPositionsToModel();
    }

    void ApplyJointPositionsToModel()
    {
        // Apply current joint positions to the 3D model
        // This would typically involve updating joint transforms
    }
}
```

## Creating Interactive Environments

### Environment Setup

```csharp
// Environment manager for Unity scene
using UnityEngine;
using System.Collections.Generic;

public class EnvironmentManager : MonoBehaviour
{
    [Header("Environment Objects")]
    public GameObject[] obstacles;
    public GameObject[] interactiveObjects;
    public Transform[] spawnPoints;

    [Header("Environment Settings")]
    public float environmentScale = 1.0f;
    public Color floorColor = Color.gray;
    public float gravity = -9.81f;

    [Header("Lighting")]
    public Light mainLight;
    public float lightIntensity = 1.0f;

    void Start()
    {
        InitializeEnvironment();
        SetupPhysics();
    }

    void InitializeEnvironment()
    {
        // Configure floor
        GameObject floor = GameObject.FindWithTag("Floor");
        if (floor != null)
        {
            floor.GetComponent<Renderer>().material.color = floorColor;
        }

        // Set up lighting
        if (mainLight != null)
        {
            mainLight.intensity = lightIntensity;
        }

        // Position obstacles
        for (int i = 0; i < obstacles.Length; i++)
        {
            if (spawnPoints.Length > i)
            {
                obstacles[i].transform.position = spawnPoints[i].position;
            }
        }
    }

    void SetupPhysics()
    {
        Physics.gravity = new Vector3(0, gravity * environmentScale, 0);
    }

    public void AddObstacle(Vector3 position, Quaternion rotation)
    {
        // Dynamically add obstacles to the environment
        GameObject obstacle = GameObject.CreatePrimitive(PrimitiveType.Cube);
        obstacle.transform.position = position;
        obstacle.transform.rotation = rotation;
        obstacle.AddComponent<Rigidbody>();
    }

    public void RemoveObstacle(GameObject obstacle)
    {
        Destroy(obstacle);
    }
}
```

### Sensor Simulation Visualization

```csharp
// LiDAR visualization
using UnityEngine;
using System.Collections.Generic;

public class LiDARVisualizer : MonoBehaviour
{
    [Header("LiDAR Settings")]
    public int numberOfRays = 720;
    public float maxRange = 30.0f;
    public float minRange = 0.1f;
    public float fieldOfView = 360f;
    public float updateRate = 10f; // Hz

    [Header("Visualization")]
    public Material rayMaterial;
    public GameObject rayOrigin;
    public LineRenderer[] rayRenderers;

    private float[] ranges;
    private Vector3[] rayDirections;
    private RaycastHit[] raycastHits;

    void Start()
    {
        InitializeLiDAR();
        CreateRayRenderers();
    }

    void InitializeLiDAR()
    {
        ranges = new float[numberOfRays];
        rayDirections = new Vector3[numberOfRays];
        raycastHits = new RaycastHit[numberOfRays];

        // Calculate ray directions based on FoV
        float angleStep = fieldOfView / numberOfRays;
        for (int i = 0; i < numberOfRays; i++)
        {
            float angle = (i * angleStep - fieldOfView / 2) * Mathf.Deg2Rad;
            rayDirections[i] = new Vector3(Mathf.Sin(angle), 0, Mathf.Cos(angle));
        }
    }

    void CreateRayRenderers()
    {
        rayRenderers = new LineRenderer[numberOfRays];
        for (int i = 0; i < numberOfRays; i++)
        {
            GameObject rayGO = new GameObject($"LiDAR_Ray_{i}");
            rayGO.transform.SetParent(transform);
            LineRenderer lr = rayGO.AddComponent<LineRenderer>();
            lr.material = rayMaterial;
            lr.startWidth = 0.01f;
            lr.endWidth = 0.01f;
            lr.positionCount = 2;
            rayRenderers[i] = lr;
        }
    }

    void Update()
    {
        if (Time.time % (1f / updateRate) < Time.deltaTime)
        {
            SimulateLiDAR();
            UpdateVisualization();
        }
    }

    void SimulateLiDAR()
    {
        for (int i = 0; i < numberOfRays; i++)
        {
            Vector3 rayStart = rayOrigin.transform.position;
            Vector3 rayDirection = rayOrigin.transform.TransformDirection(rayDirections[i]);
            Vector3 rayEnd = rayStart + rayDirection * maxRange;

            if (Physics.Raycast(rayStart, rayDirection, out raycastHits[i], maxRange))
            {
                ranges[i] = raycastHits[i].distance;
            }
            else
            {
                ranges[i] = maxRange;
            }
        }
    }

    void UpdateVisualization()
    {
        for (int i = 0; i < numberOfRays; i++)
        {
            Vector3 rayStart = rayOrigin.transform.position;
            Vector3 rayDirection = rayOrigin.transform.TransformDirection(rayDirections[i]);

            if (ranges[i] < maxRange)
            {
                Vector3 hitPoint = rayStart + rayDirection * ranges[i];
                rayRenderers[i].SetPosition(0, rayStart);
                rayRenderers[i].SetPosition(1, hitPoint);
            }
            else
            {
                Vector3 rayEnd = rayStart + rayDirection * maxRange;
                rayRenderers[i].SetPosition(0, rayStart);
                rayRenderers[i].SetPosition(1, rayEnd);
            }
        }
    }

    public float[] GetRanges()
    {
        return ranges;
    }
}
```

## Advanced Visualization Techniques

### Point Cloud Visualization

```csharp
// Point cloud visualization from depth camera
using UnityEngine;
using System.Collections.Generic;

[RequireComponent(typeof(PointCloudRenderer))]
public class PointCloudVisualizer : MonoBehaviour
{
    [Header("Point Cloud Settings")]
    public int width = 640;
    public int height = 480;
    public float focalLength = 525f; // Camera focal length in pixels
    public float pointSize = 0.01f;

    [Header("Visualization")]
    public Material pointMaterial;
    public Color pointColor = Color.white;

    private PointCloudRenderer pointCloudRenderer;
    private List<Vector3> points = new List<Vector3>();
    private List<Color> colors = new List<Color>();

    void Start()
    {
        pointCloudRenderer = GetComponent<PointCloudRenderer>();
        InitializePointCloud();
    }

    void InitializePointCloud()
    {
        // Create initial point cloud structure
        points.Clear();
        colors.Clear();

        // Generate points based on camera parameters
        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                // Convert pixel coordinates to 3D points
                float worldX = (x - width / 2f) / focalLength;
                float worldY = (height / 2f - y) / focalLength;
                float worldZ = 1f; // Placeholder depth

                Vector3 point = new Vector3(worldX, worldY, worldZ);
                points.Add(point);
                colors.Add(pointColor);
            }
        }

        UpdatePointCloud();
    }

    public void UpdatePointCloudFromDepth(float[] depthData)
    {
        if (depthData.Length != width * height)
        {
            Debug.LogError("Depth data size doesn't match expected dimensions");
            return;
        }

        for (int i = 0; i < points.Count && i < depthData.Length; i++)
        {
            int x = i % width;
            int y = i / width;

            float depth = depthData[i];
            if (depth > 0 && depth < 30f) // Valid depth range
            {
                float worldX = (x - width / 2f) / focalLength * depth;
                float worldY = (height / 2f - y) / focalLength * depth;
                float worldZ = depth;

                points[i] = new Vector3(worldX, worldY, worldZ);

                // Color based on depth
                float normalizedDepth = Mathf.InverseLerp(0.1f, 30f, depth);
                colors[i] = Color.HSVToRGB(normalizedDepth, 1f, 1f);
            }
        }

        UpdatePointCloud();
    }

    void UpdatePointCloud()
    {
        // Update the point cloud renderer with new data
        pointCloudRenderer.UpdatePoints(points, colors, pointSize);
    }
}
```

### Sensor Fusion Visualization

```csharp
// Sensor fusion visualization dashboard
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class SensorFusionDashboard : MonoBehaviour
{
    [Header("UI Elements")]
    public Text imuStatusText;
    public Text lidarStatusText;
    public Text cameraStatusText;
    public Text jointStatusText;
    public RawImage cameraFeed;
    public GameObject lidarVisualization;
    public GameObject imuVisualization;

    [Header("Visualization Objects")]
    public GameObject robotModel;
    public GameObject coordinateAxes;

    private Dictionary<string, bool> sensorStatus = new Dictionary<string, bool>();
    private Dictionary<string, float[]> sensorData = new Dictionary<string, float[]>();

    void Start()
    {
        InitializeDashboard();
    }

    void InitializeDashboard()
    {
        // Initialize sensor status
        sensorStatus["imu"] = false;
        sensorStatus["lidar"] = false;
        sensorStatus["camera"] = false;
        sensorStatus["joints"] = false;

        // Set up coordinate system visualization
        SetupCoordinateAxes();
    }

    void SetupCoordinateAxes()
    {
        // Create coordinate axes for orientation visualization
        GameObject axesGO = new GameObject("CoordinateAxes");
        axesGO.transform.SetParent(transform);

        // X-axis (Red)
        CreateAxis(axesGO.transform, Vector3.right, Color.red, "X");
        // Y-axis (Green)
        CreateAxis(axesGO.transform, Vector3.up, Color.green, "Y");
        // Z-axis (Blue)
        CreateAxis(axesGO.transform, Vector3.forward, Color.blue, "Z");
    }

    GameObject CreateAxis(Transform parent, Vector3 direction, Color color, string name)
    {
        GameObject axis = new GameObject($"Axis_{name}");
        axis.transform.SetParent(parent);
        axis.transform.position = Vector3.zero;
        axis.transform.LookAt(direction);

        LineRenderer lr = axis.AddComponent<LineRenderer>();
        lr.material = new Material(Shader.Find("Sprites/Default"));
        lr.startColor = color;
        lr.endColor = color;
        lr.startWidth = 0.02f;
        lr.endWidth = 0.02f;
        lr.positionCount = 2;
        lr.SetPosition(0, Vector3.zero);
        lr.SetPosition(1, direction * 0.5f); // 0.5m length

        return axis;
    }

    void Update()
    {
        UpdateSensorStatus();
        UpdateVisualizations();
    }

    void UpdateSensorStatus()
    {
        // Update UI based on sensor status
        imuStatusText.text = $"IMU: {(sensorStatus["imu"] ? "Active" : "Inactive")}";
        lidarStatusText.text = $"LiDAR: {(sensorStatus["lidar"] ? "Active" : "Inactive")}";
        cameraStatusText.text = $"Camera: {(sensorStatus["camera"] ? "Active" : "Inactive")}";
        jointStatusText.text = $"Joints: {(sensorStatus["joints"] ? "Active" : "Inactive")}";
    }

    void UpdateVisualizations()
    {
        // Update robot model based on joint data
        if (sensorStatus["joints"] && sensorData.ContainsKey("joint_positions"))
        {
            UpdateRobotModel(sensorData["joint_positions"]);
        }

        // Update IMU visualization
        if (sensorStatus["imu"] && sensorData.ContainsKey("imu_orientation"))
        {
            UpdateIMUVisualization(sensorData["imu_orientation"]);
        }
    }

    public void UpdateSensorData(string sensorType, float[] data, bool isActive = true)
    {
        sensorStatus[sensorType] = isActive;
        sensorData[sensorType] = data;

        // Handle specific sensor updates
        switch (sensorType)
        {
            case "camera_image":
                UpdateCameraFeed(data);
                break;
            case "lidar_ranges":
                UpdateLiDARVisualization(data);
                break;
        }
    }

    void UpdateRobotModel(float[] jointPositions)
    {
        // Apply joint positions to robot model
        // Implementation depends on your robot model structure
    }

    void UpdateIMUVisualization(float[] orientation)
    {
        // Update coordinate axes based on IMU orientation
        if (coordinateAxes != null)
        {
            // Apply orientation to axes
            coordinateAxes.transform.rotation = Quaternion.Euler(
                orientation[0], orientation[1], orientation[2]
            );
        }
    }

    void UpdateCameraFeed(float[] imageData)
    {
        // Update camera feed texture
        // This would typically involve converting image data to Texture2D
    }

    void UpdateLiDARVisualization(float[] ranges)
    {
        // Update LiDAR visualization based on range data
        if (lidarVisualization != null)
        {
            // Update the LiDAR visualization object
        }
    }
}
```

## Custom Unity Interfaces

### Robot Control Interface

```csharp
// Custom robot control interface
using UnityEngine;
using UnityEngine.UI;
using System.Collections.Generic;

public class RobotControlInterface : MonoBehaviour
{
    [Header("Control Elements")]
    public Button moveForwardButton;
    public Button moveBackwardButton;
    public Button turnLeftButton;
    public Button turnRightButton;
    public Slider velocitySlider;
    public Toggle balanceToggle;
    public Dropdown gaitSelection;

    [Header("Status Display")]
    public Text statusText;
    public Text batteryLevelText;
    public Text jointStatusText;

    [Header("ROS Integration")]
    public string cmdVelTopic = "/cmd_vel";
    public string jointCmdTopic = "/joint_commands";

    private ROSConnection ros;
    private Vector3 currentVelocity = Vector3.zero;
    private bool balanceEnabled = false;

    void Start()
    {
        SetupUIElements();
        ros = ROSConnection.instance;
    }

    void SetupUIElements()
    {
        // Setup button listeners
        moveForwardButton.onClick.AddListener(() => SendVelocityCommand(1f, 0f, 0f));
        moveBackwardButton.onClick.AddListener(() => SendVelocityCommand(-1f, 0f, 0f));
        turnLeftButton.onClick.AddListener(() => SendVelocityCommand(0f, 0f, 1f));
        turnRightButton.onClick.AddListener(() => SendVelocityCommand(0f, 0f, -1f));

        // Setup slider listener
        velocitySlider.onValueChanged.AddListener(OnVelocityChanged);

        // Setup toggle listener
        balanceToggle.onValueChanged.AddListener(OnBalanceToggleChanged);

        // Setup dropdown listener
        gaitSelection.onValueChanged.AddListener(OnGaitChanged);

        // Initialize UI
        velocitySlider.value = 0.5f; // Default velocity
    }

    void OnVelocityChanged(float value)
    {
        // Update velocity based on slider
        statusText.text = $"Velocity: {value:F2} m/s";
    }

    void OnBalanceToggleChanged(bool isOn)
    {
        balanceEnabled = isOn;
        statusText.text = $"Balance: {(isOn ? "Enabled" : "Disabled")}";
        SendBalanceCommand(isOn);
    }

    void OnGaitChanged(int index)
    {
        string selectedGait = gaitSelection.options[index].text;
        statusText.text = $"Gait: {selectedGait}";
        SendGaitCommand(selectedGait);
    }

    void SendVelocityCommand(float x, float y, float theta)
    {
        // Send velocity command to ROS
        // Implementation would use ROS TCP connector
        Debug.Log($"Sending velocity command: ({x}, {y}, {theta})");
    }

    void SendBalanceCommand(bool enable)
    {
        // Send balance enable/disable command
        Debug.Log($"Sending balance command: {enable}");
    }

    void SendGaitCommand(string gaitType)
    {
        // Send gait selection command
        Debug.Log($"Sending gait command: {gaitType}");
    }

    public void UpdateStatus(string newStatus)
    {
        statusText.text = newStatus;
    }

    public void UpdateBatteryLevel(float level)
    {
        batteryLevelText.text = $"Battery: {level:F1}%";
    }

    public void UpdateJointStatus(Dictionary<string, float> jointPositions)
    {
        string jointInfo = "Joints: ";
        foreach (var kvp in jointPositions)
        {
            jointInfo += $"{kvp.Key}: {kvp.Value:F2} ";
        }
        jointStatusText.text = jointInfo;
    }
}
```

## Performance Optimization

### Rendering Optimization

```csharp
// Performance optimization manager
using UnityEngine;
using System.Collections.Generic;

public class PerformanceOptimizer : MonoBehaviour
{
    [Header("LOD Settings")]
    public int lodDistance1 = 10;
    public int lodDistance2 = 30;
    public int lodDistance3 = 50;

    [Header("Quality Settings")]
    public int targetFrameRate = 60;
    public int maxRenderedObjects = 1000;
    public bool enableOcclusionCulling = true;

    [Header("Resource Management")]
    public float cleanupInterval = 5f;
    public int maxMemoryUsageMB = 1024;

    private float lastCleanupTime;
    private List<GameObject> managedObjects = new List<GameObject>();

    void Start()
    {
        ConfigureQualitySettings();
        lastCleanupTime = Time.time;
    }

    void Update()
    {
        if (Time.time - lastCleanupTime > cleanupInterval)
        {
            CleanupResources();
            lastCleanupTime = Time.time;
        }

        OptimizeRendering();
    }

    void ConfigureQualitySettings()
    {
        Application.targetFrameRate = targetFrameRate;
        QualitySettings.vSyncCount = 0; // Disable vsync for consistent frame rate

        // Enable occlusion culling if specified
        if (enableOcclusionCulling)
        {
            // This should be set in the scene view
            StaticOcclusionCulling.GenerateInBackground();
        }
    }

    void OptimizeRendering()
    {
        // Implement Level of Detail (LOD) system
        GameObject robot = GameObject.FindGameObjectWithTag("Robot");
        if (robot != null)
        {
            float distance = Vector3.Distance(Camera.main.transform.position, robot.transform.position);

            // Adjust detail based on distance
            if (distance > lodDistance3)
            {
                SetLowDetail(robot);
            }
            else if (distance > lodDistance2)
            {
                SetMediumDetail(robot);
            }
            else if (distance > lodDistance1)
            {
                SetHighDetail(robot);
            }
            else
            {
                SetMaximumDetail(robot);
            }
        }
    }

    void SetLowDetail(GameObject robot)
    {
        // Disable complex rendering features
        Renderer[] renderers = robot.GetComponentsInChildren<Renderer>();
        foreach (Renderer r in renderers)
        {
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            r.receiveShadows = false;
        }
    }

    void SetMediumDetail(GameObject robot)
    {
        // Enable basic shadows
        Renderer[] renderers = robot.GetComponentsInChildren<Renderer>();
        foreach (Renderer r in renderers)
        {
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
            r.receiveShadows = true;
        }
    }

    void SetHighDetail(GameObject robot)
    {
        // Enable all rendering features
        Renderer[] renderers = robot.GetComponentsInChildren<Renderer>();
        foreach (Renderer r in renderers)
        {
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.On;
            r.receiveShadows = true;
            r.lightProbeUsage = UnityEngine.Rendering.LightProbeUsage.BlendProbes;
        }
    }

    void SetMaximumDetail(GameObject robot)
    {
        // Enable highest quality settings
        SetHighDetail(robot);
    }

    void CleanupResources()
    {
        // Cleanup unused objects and resources
        List<GameObject> objectsToRemove = new List<GameObject>();

        foreach (GameObject obj in managedObjects)
        {
            if (obj == null)
            {
                objectsToRemove.Add(obj);
            }
        }

        foreach (GameObject obj in objectsToRemove)
        {
            managedObjects.Remove(obj);
        }
    }

    public void RegisterManagedObject(GameObject obj)
    {
        if (!managedObjects.Contains(obj))
        {
            managedObjects.Add(obj);
        }
    }
}
```

## Integration with ROS 2

### Bridge Architecture

The Unity-ROS bridge typically uses TCP communication:

```csharp
// Enhanced ROS bridge for Unity
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Sensor;
using RosMessageTypes.Geometry;
using System.Collections.Generic;

public class EnhancedROSBridge : MonoBehaviour
{
    [Header("Connection Settings")]
    public string rosIP = "127.0.0.1";
    public int rosPort = 10000;
    public float connectionTimeout = 10f;

    [Header("Topic Configuration")]
    public List<TopicConfiguration> topics = new List<TopicConfiguration>();

    private ROSConnection ros;
    private Dictionary<string, System.Action<object>> messageHandlers =
        new Dictionary<string, System.Action<object>>();

    [System.Serializable]
    public class TopicConfiguration
    {
        public string topicName;
        public string messageType;
        public bool isPublisher;
        public bool isSubscriber;
        public float publishRate = 10f;
    }

    void Start()
    {
        ConnectToROS();
        SetupMessageHandlers();
        SubscribeToTopics();
    }

    void ConnectToROS()
    {
        ros = ROSConnection.instance;
        ros.Initialize(rosIP, rosPort);
    }

    void SetupMessageHandlers()
    {
        // Setup handlers for different message types
        messageHandlers["/joint_states"] = HandleJointStates;
        messageHandlers["/tf"] = HandleTF;
        messageHandlers["/imu/data"] = HandleIMU;
        messageHandlers["/camera/image_raw"] = HandleCameraImage;
    }

    void SubscribeToTopics()
    {
        foreach (var topic in topics)
        {
            if (topic.isSubscriber)
            {
                SubscribeToTopic(topic);
            }
        }
    }

    void SubscribeToTopic(TopicConfiguration topic)
    {
        switch (topic.messageType)
        {
            case "sensor_msgs/JointState":
                ros.Subscribe<JointStateMsg>(topic.topicName,
                    (JointStateMsg msg) => HandleMessage(topic.topicName, msg));
                break;
            case "sensor_msgs/Imu":
                ros.Subscribe<ImuMsg>(topic.topicName,
                    (ImuMsg msg) => HandleMessage(topic.topicName, msg));
                break;
            // Add more message types as needed
        }
    }

    void HandleMessage(string topicName, object message)
    {
        if (messageHandlers.ContainsKey(topicName))
        {
            messageHandlers[topicName](message);
        }
    }

    void HandleJointStates(object message)
    {
        JointStateMsg jointState = (JointStateMsg)message;
        // Process joint state data
        UpdateRobotModel(jointState);
    }

    void HandleIMU(object message)
    {
        ImuMsg imu = (ImuMsg)message;
        // Process IMU data
        UpdateIMUVisualization(imu);
    }

    void UpdateRobotModel(JointStateMsg jointState)
    {
        // Update 3D model based on joint positions
        // Implementation depends on your robot model structure
    }

    void UpdateIMUVisualization(ImuMsg imu)
    {
        // Update IMU visualization
        // Implementation depends on your visualization approach
    }

    public void PublishMessage(string topicName, object message)
    {
        ros.Send(topicName, message);
    }
}
```

## Best Practices

### Visualization Best Practices

1. **Performance First**: Optimize for real-time performance
2. **Realistic Representation**: Accurately represent robot and environment
3. **Clear Information**: Present sensor data clearly and intuitively
4. **User-Friendly Interface**: Create intuitive control interfaces
5. **Scalable Architecture**: Design for different robot configurations

### Unity-Specific Considerations

1. **Coordinate Systems**: Handle ROS-Unity coordinate conversion properly
2. **Timing**: Synchronize Unity time with ROS time
3. **Data Rates**: Match Unity update rates with ROS message rates
4. **Memory Management**: Efficiently handle large datasets
5. **Threading**: Manage ROS communication on separate threads if needed

## Summary

Unity provides powerful visualization capabilities for humanoid robotics, enabling realistic rendering, interactive environments, and intuitive user interfaces. The combination of high-quality graphics with real-time ROS data creates effective digital twins for robot development and testing.

The next chapter will cover sensor simulation in Unity, including realistic modeling of LiDAR, cameras, and IMUs for comprehensive digital twin validation.