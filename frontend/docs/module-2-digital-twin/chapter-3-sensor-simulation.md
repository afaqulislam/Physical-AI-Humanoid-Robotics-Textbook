---
sidebar_position: 3
---

# Sensor Simulation (LiDAR, Depth, IMU)

## Learning Objectives

By the end of this chapter, you will be able to:
- Implement realistic LiDAR simulation in Gazebo and Unity
- Create depth camera simulation with realistic noise models
- Simulate IMU sensors with proper dynamics and noise characteristics
- Integrate multiple sensor simulations for comprehensive perception
- Validate sensor simulation accuracy against real-world sensors
- Optimize sensor simulation performance for real-time applications

## LiDAR Simulation

### Understanding LiDAR in Robotics

LiDAR (Light Detection and Ranging) sensors are crucial for humanoid robotics, providing 3D spatial information for navigation, mapping, and obstacle detection. In simulation, we need to replicate:

- **Range measurements**: Accurate distance measurements
- **Angular resolution**: Proper angular sampling
- **Noise characteristics**: Realistic sensor noise
- **Update rates**: Appropriate measurement frequency
- **Field of view**: Coverage area limitations

### Gazebo LiDAR Implementation

#### Basic LiDAR Sensor Configuration

```xml
<!-- In URDF/SDF for Gazebo -->
<gazebo reference="lidar_link">
  <sensor name="lidar" type="ray">
    <pose>0 0 0 0 0 0</pose>
    <ray>
      <scan>
        <horizontal>
          <samples>720</samples>  <!-- Angular resolution -->
          <resolution>1</resolution>
          <min_angle>-3.14159</min_angle>  <!-- -π radians -->
          <max_angle>3.14159</max_angle>   <!-- π radians -->
        </horizontal>
      </scan>
      <range>
        <min>0.1</min>      <!-- Minimum range (m) -->
        <max>30.0</max>     <!-- Maximum range (m) -->
        <resolution>0.01</resolution>  <!-- Range resolution (m) -->
      </range>
    </ray>
    <plugin name="lidar_controller" filename="libgazebo_ros_laser.so">
      <frame_name>lidar_link</frame_name>
      <topic_name>scan</topic_name>
      <update_rate>10</update_rate>  <!-- Hz -->
    </plugin>
  </sensor>
</gazebo>
```

#### Advanced LiDAR with Noise Models

```xml
<gazebo reference="lidar_link">
  <sensor name="lidar_advanced" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>1081</samples>  <!-- Higher resolution -->
          <resolution>1</resolution>
          <min_angle>-2.35619</min_angle>  <!-- -135 degrees -->
          <max_angle>2.35619</max_angle>   <!-- 135 degrees -->
        </horizontal>
      </scan>
      <range>
        <min>0.08</min>
        <max>10.0</max>
        <resolution>0.001</resolution>
      </range>
    </ray>
    <always_on>true</always_on>
    <update_rate>20</update_rate>
    <visualize>false</visualize>
    <plugin name="lidar_controller" filename="libgazebo_ros_laser.so">
      <topic_name>scan</topic_name>
      <frame_name>lidar_link</frame_name>
      <min_range>0.08</min_range>
      <max_range>10.0</max_range>
      <gaussian_noise>0.01</gaussian_noise>  <!-- 1cm noise -->
    </plugin>
  </sensor>
</gazebo>
```

#### Multi-Beam LiDAR (3D LiDAR Simulation)

```xml
<gazebo reference="velodyne_link">
  <sensor name="velodyne_VLP_16" type="ray">
    <ray>
      <scan>
        <horizontal>
          <samples>1800</samples>
          <resolution>1</resolution>
          <min_angle>-3.14159265359</min_angle>
          <max_angle>3.14159265359</max_angle>
        </horizontal>
        <vertical>
          <samples>16</samples>
          <resolution>1</resolution>
          <min_angle>-0.26179938779</min_angle>  <!-- -15 degrees -->
          <max_angle>0.26179938779</max_angle>   <!-- 15 degrees -->
        </vertical>
      </scan>
      <range>
        <min>0.4</min>
        <max>100</max>
        <resolution>0.001</resolution>
      </range>
    </ray>
    <always_on>true</always_on>
    <update_rate>10</update_rate>
    <visualize>false</visualize>
    <plugin name="gazebo_ros_laser" filename="libgazebo_ros_velodyne_gpu.so">
      <topicName>velodyne_points</topicName>
      <frameName>velodyne</frameName>
      <min_range>0.4</min_range>
      <max_range>100.0</max_range>
      <gaussian_noise>0.008</gaussian_noise>
    </plugin>
  </sensor>
</gazebo>
```

### Unity LiDAR Simulation

#### Raycasting-Based LiDAR

```csharp
// Unity LiDAR simulation using raycasting
using UnityEngine;
using System.Collections.Generic;
using RosMessageTypes.Sensor;

public class UnityLiDARSimulator : MonoBehaviour
{
    [Header("LiDAR Configuration")]
    public int horizontalSamples = 720;
    public int verticalSamples = 1;
    public float minAngle = -Mathf.PI;
    public float maxAngle = Mathf.PI;
    public float minRange = 0.1f;
    public float maxRange = 30.0f;
    public float updateRate = 10f;
    public LayerMask detectionLayers = -1;

    [Header("Noise Configuration")]
    public float gaussianNoise = 0.01f;
    public float uniformNoise = 0.005f;

    [Header("ROS Integration")]
    public string topicName = "/scan";

    private ROSConnection ros;
    private float[] ranges;
    private float[] intensities;
    private Vector3[] rayDirections;
    private LaserScanMsg laserScanMsg;
    private float lastUpdateTime;

    void Start()
    {
        InitializeLiDAR();
        ros = ROSConnection.instance;
    }

    void InitializeLiDAR()
    {
        int totalSamples = horizontalSamples * verticalSamples;
        ranges = new float[totalSamples];
        intensities = new float[totalSamples];
        rayDirections = new Vector3[totalSamples];

        // Calculate ray directions
        float angleStep = (maxAngle - minAngle) / (horizontalSamples - 1);
        for (int i = 0; i < totalSamples; i++)
        {
            int hIndex = i % horizontalSamples;
            float hAngle = minAngle + hIndex * angleStep;

            if (verticalSamples > 1)
            {
                int vIndex = i / horizontalSamples;
                float vAngle = CalculateVerticalAngle(vIndex);
                rayDirections[i] = CalculateRayDirection(hAngle, vAngle);
            }
            else
            {
                rayDirections[i] = new Vector3(Mathf.Sin(hAngle), 0, Mathf.Cos(hAngle));
            }
        }

        // Initialize ROS message
        laserScanMsg = new LaserScanMsg();
        laserScanMsg.angle_min = minAngle;
        laserScanMsg.angle_max = maxAngle;
        laserScanMsg.angle_increment = angleStep;
        laserScanMsg.time_increment = 0;
        laserScanMsg.scan_time = 1.0f / updateRate;
        laserScanMsg.range_min = minRange;
        laserScanMsg.range_max = maxRange;
    }

    Vector3 CalculateRayDirection(float hAngle, float vAngle)
    {
        // Calculate 3D ray direction with horizontal and vertical angles
        float x = Mathf.Cos(vAngle) * Mathf.Sin(hAngle);
        float y = Mathf.Sin(vAngle);
        float z = Mathf.Cos(vAngle) * Mathf.Cos(hAngle);
        return new Vector3(x, y, z).normalized;
    }

    float CalculateVerticalAngle(int vIndex)
    {
        // Calculate vertical angle for multi-beam LiDAR
        float vAngleStep = (0.26179938779f - (-0.26179938779f)) / (verticalSamples - 1);
        return -0.26179938779f + vIndex * vAngleStep;
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= 1f / updateRate)
        {
            SimulateLiDAR();
            PublishScanData();
            lastUpdateTime = Time.time;
        }
    }

    void SimulateLiDAR()
    {
        for (int i = 0; i < ranges.Length; i++)
        {
            Vector3 rayStart = transform.position;
            Vector3 rayDirection = transform.TransformDirection(rayDirections[i]);
            float maxDistance = maxRange;

            if (Physics.Raycast(rayStart, rayDirection, out RaycastHit hit, maxRange, detectionLayers))
            {
                float distance = hit.distance;

                // Add noise to the measurement
                distance = AddNoise(distance);

                ranges[i] = distance;
                intensities[i] = CalculateIntensity(hit);
            }
            else
            {
                ranges[i] = float.PositiveInfinity; // or maxRange
                intensities[i] = 0;
            }
        }
    }

    float AddNoise(float distance)
    {
        // Add Gaussian and uniform noise
        float gaussian = Random.insideUnitSphere.x * gaussianNoise;
        float uniform = (Random.value - 0.5f) * 2 * uniformNoise;
        return Mathf.Max(minRange, distance + gaussian + uniform);
    }

    float CalculateIntensity(RaycastHit hit)
    {
        // Calculate intensity based on surface properties
        // This is a simplified model - real LiDAR intensity depends on
        // surface reflectivity, angle of incidence, etc.
        float baseIntensity = 1000f; // Maximum intensity
        float distanceFactor = Mathf.Clamp01(1f - (hit.distance / maxRange));
        return baseIntensity * distanceFactor;
    }

    void PublishScanData()
    {
        laserScanMsg.ranges = ranges;
        laserScanMsg.intensities = intensities;
        laserScanMsg.header.stamp = new builtin_interfaces.msg.Time();
        laserScanMsg.header.frame_id = transform.name;

        ros.Send(topicName, laserScanMsg);
    }

    // Visualization for debugging
    void OnDrawGizmos()
    {
        if (ranges != null && rayDirections != null)
        {
            for (int i = 0; i < Mathf.Min(100, ranges.Length); i += 10) // Draw every 10th ray for performance
            {
                Vector3 rayDirection = transform.TransformDirection(rayDirections[i]);
                float range = ranges[i];

                if (range < maxRange)
                {
                    Gizmos.color = Color.red;
                    Gizmos.DrawRay(transform.position, rayDirection * range);
                }
                else
                {
                    Gizmos.color = Color.green;
                    Gizmos.DrawRay(transform.position, rayDirection * maxRange);
                }
            }
        }
    }
}
```

#### Point Cloud Generation from LiDAR

```csharp
// Convert LiDAR scan to point cloud
using UnityEngine;
using System.Collections.Generic;
using RosMessageTypes.Sensor;

public class LiDARPointCloudGenerator : MonoBehaviour
{
    [Header("Point Cloud Settings")]
    public GameObject pointCloudObject;
    public Material pointMaterial;
    public float pointSize = 0.02f;
    public Color pointColor = Color.red;

    private List<Vector3> points = new List<Vector3>();
    private ComputeBuffer pointBuffer;
    private PointCloud2Msg pointCloudMsg;

    public void GeneratePointCloud(float[] ranges, float[] intensities, Vector3 sensorPosition, Quaternion sensorRotation)
    {
        points.Clear();

        // Convert 2D scan to 3D points
        for (int i = 0; i < ranges.Length; i++)
        {
            if (ranges[i] > 0 && ranges[i] < 30f) // Valid range
            {
                float angle = CalculateAngleFromIndex(i);
                Vector3 localPoint = new Vector3(
                    ranges[i] * Mathf.Cos(angle),
                    0, // For 2D LiDAR
                    ranges[i] * Mathf.Sin(angle)
                );

                // Transform to world coordinates
                Vector3 worldPoint = sensorRotation * localPoint + sensorPosition;
                points.Add(worldPoint);
            }
        }

        // Create ROS PointCloud2 message
        CreatePointCloudMessage();
    }

    float CalculateAngleFromIndex(int index)
    {
        // Calculate angle based on your LiDAR configuration
        // This assumes a 360-degree scan with 720 samples
        return (index * 2 * Mathf.PI) / 720f - Mathf.PI;
    }

    void CreatePointCloudMessage()
    {
        // Create PointCloud2 message (simplified)
        pointCloudMsg = new PointCloud2Msg();
        // Implementation would involve creating the proper ROS PointCloud2 format
    }

    void UpdatePointCloudVisualization()
    {
        if (pointCloudObject != null && points.Count > 0)
        {
            // Update point cloud visualization
            // This could involve instanced rendering or other techniques
        }
    }
}
```

## Depth Camera Simulation

### Gazebo Depth Camera Configuration

```xml
<!-- Depth camera sensor in Gazebo -->
<gazebo reference="camera_link">
  <sensor name="depth_camera" type="depth">
    <update_rate>30</update_rate>
    <camera name="head">
      <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees -->
      <image>
        <width>640</width>
        <height>480</height>
        <format>R8G8B8</format>
      </image>
      <clip>
        <near>0.1</near>
        <far>10</far>
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
      <max_depth>10.0</max_depth>
    </plugin>
  </sensor>
</gazebo>
```

### Unity Depth Camera Simulation

```csharp
// Unity depth camera simulation
using UnityEngine;
using System.Collections;
using RosMessageTypes.Sensor;

public class UnityDepthCamera : MonoBehaviour
{
    [Header("Camera Settings")]
    public int width = 640;
    public int height = 480;
    public float fieldOfView = 60f;
    public float nearClip = 0.1f;
    public float farClip = 10f;

    [Header("Depth Settings")]
    public float depthScale = 1000f;  // Scale factor for depth values
    public float depthNoise = 0.01f;  // Noise level

    [Header("ROS Integration")]
    public string imageTopic = "/camera/image_raw";
    public string depthTopic = "/camera/depth/image_raw";

    private Camera cam;
    private RenderTexture depthTexture;
    private Texture2D imageTexture;
    private Texture2D depthTexture2D;
    private ROSConnection ros;

    void Start()
    {
        SetupCamera();
        SetupRenderTextures();
        ros = ROSConnection.instance;
    }

    void SetupCamera()
    {
        cam = GetComponent<Camera>();
        if (cam == null)
        {
            cam = gameObject.AddComponent<Camera>();
        }

        cam.fieldOfView = fieldOfView;
        cam.nearClipPlane = nearClip;
        cam.farClipPlane = farClip;
        cam.depthTextureMode = DepthTextureMode.Depth;
    }

    void SetupRenderTextures()
    {
        depthTexture = new RenderTexture(width, height, 24, RenderTextureFormat.Depth);
        cam.targetTexture = depthTexture;

        imageTexture = new Texture2D(width, height, TextureFormat.RGB24, false);
        depthTexture2D = new Texture2D(width, height, TextureFormat.RFloat, false);
    }

    void Update()
    {
        if (cam != null)
        {
            CaptureDepthImage();
            PublishCameraData();
        }
    }

    void CaptureDepthImage()
    {
        // Capture color image
        RenderTexture.active = cam.targetTexture;
        imageTexture.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        imageTexture.Apply();

        // Extract depth information
        ExtractDepthData();
    }

    void ExtractDepthData()
    {
        // Read depth values from the depth texture
        RenderTexture currentRT = RenderTexture.active;
        RenderTexture.active = depthTexture;

        depthTexture2D.ReadPixels(new Rect(0, 0, width, height), 0, 0);
        depthTexture2D.Apply();

        RenderTexture.active = currentRT;
    }

    void PublishCameraData()
    {
        // Convert to ROS image format and publish
        // This would involve converting Unity textures to ROS Image messages
        // and publishing to the appropriate topics
    }

    // Alternative approach: Use Unity's built-in depth rendering
    [ImageEffectOpaque]
    void OnRenderImage(RenderTexture source, RenderTexture destination)
    {
        // Custom depth rendering effect
        Graphics.Blit(source, destination);
    }
}
```

### Advanced Depth Processing

```csharp
// Depth processing for point cloud generation
using UnityEngine;
using System.Collections.Generic;

public class DepthProcessor : MonoBehaviour
{
    [Header("Processing Settings")]
    public float focalLengthX = 525f;  // Camera intrinsic parameters
    public float focalLengthY = 525f;
    public float centerX = 320f;
    public float centerY = 240f;

    public float[] ProcessDepthToPointCloud(float[] depthData, int width, int height)
    {
        List<float> pointCloudData = new List<float>();

        for (int y = 0; y < height; y++)
        {
            for (int x = 0; x < width; x++)
            {
                int index = y * width + x;
                float depth = depthData[index];

                if (depth > 0 && depth < 10f) // Valid depth range
                {
                    // Convert pixel coordinates to 3D world coordinates
                    float worldX = (x - centerX) * depth / focalLengthX;
                    float worldY = (height - y - centerY) * depth / focalLengthY;
                    float worldZ = depth;

                    // Add to point cloud data
                    pointCloudData.Add(worldX);
                    pointCloudData.Add(worldY);
                    pointCloudData.Add(worldZ);
                }
            }
        }

        return pointCloudData.ToArray();
    }

    public float[] FilterDepthData(float[] depthData, int width, int height)
    {
        // Apply noise reduction and filtering
        float[] filteredData = new float[depthData.Length];

        for (int i = 0; i < depthData.Length; i++)
        {
            int x = i % width;
            int y = i / width;

            if (x > 0 && x < width - 1 && y > 0 && y < height - 1)
            {
                // Apply 3x3 median filter
                List<float> neighbors = new List<float>();
                for (int dy = -1; dy <= 1; dy++)
                {
                    for (int dx = -1; dx <= 1; dx++)
                    {
                        int neighborIndex = (y + dy) * width + (x + dx);
                        if (depthData[neighborIndex] > 0)
                        {
                            neighbors.Add(depthData[neighborIndex]);
                        }
                    }
                }

                if (neighbors.Count > 0)
                {
                    neighbors.Sort();
                    filteredData[i] = neighbors[neighbors.Count / 2]; // Median
                }
                else
                {
                    filteredData[i] = depthData[i];
                }
            }
            else
            {
                filteredData[i] = depthData[i];
            }
        }

        return filteredData;
    }
}
```

## IMU Simulation

### Understanding IMU Sensors

IMU (Inertial Measurement Unit) sensors provide crucial information for humanoid robotics:
- **Accelerometer**: Measures linear acceleration (3-axis)
- **Gyroscope**: Measures angular velocity (3-axis)
- **Magnetometer**: Measures magnetic field direction (3-axis)

In simulation, we need to model:
- **Sensor dynamics**: Proper integration of motion
- **Noise characteristics**: Realistic sensor noise
- **Bias and drift**: Long-term sensor inaccuracies
- **Temperature effects**: Environmental impacts

### Gazebo IMU Configuration

```xml
<!-- IMU sensor in Gazebo -->
<gazebo reference="imu_link">
  <sensor name="imu_sensor" type="imu">
    <always_on>true</always_on>
    <update_rate>100</update_rate>
    <imu>
      <angular_velocity>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>  <!-- 0.2 mrad/s (bias) -->
            <bias_mean>0.002</bias_mean>
            <bias_stddev>0.0003</bias_stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
            <bias_mean>0.002</bias_mean>
            <bias_stddev>0.0003</bias_stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>2e-4</stddev>
            <bias_mean>0.002</bias_mean>
            <bias_stddev>0.0003</bias_stddev>
          </noise>
        </z>
      </angular_velocity>
      <linear_acceleration>
        <x>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>  <!-- 17 mg bias -->
            <bias_mean>0.017</bias_mean>
            <bias_stddev>0.0017</bias_stddev>
          </noise>
        </x>
        <y>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
            <bias_mean>0.017</bias_mean>
            <bias_stddev>0.0017</bias_stddev>
          </noise>
        </y>
        <z>
          <noise type="gaussian">
            <mean>0.0</mean>
            <stddev>1.7e-2</stddev>
            <bias_mean>0.017</bias_mean>
            <bias_stddev>0.0017</bias_stddev>
          </noise>
        </z>
      </linear_acceleration>
    </imu>
    <plugin name="imu_plugin" filename="libgazebo_ros_imu.so">
      <topicName>imu/data</topicName>
      <serviceName>imu/service</serviceName>
      <gaussianNoise>0.001</gaussianNoise>
      <frameName>imu_link</frameName>
    </plugin>
  </sensor>
</gazebo>
```

### Unity IMU Simulation

```csharp
// Unity IMU simulation
using UnityEngine;
using RosMessageTypes.Sensor;

public class UnityIMUSimulator : MonoBehaviour
{
    [Header("IMU Configuration")]
    public float updateRate = 100f;  // Hz
    public float accelerometerNoise = 0.017f;  // 17 mg
    public float gyroscopeNoise = 0.0002f;     // 0.2 mrad/s
    public float magnetometerNoise = 0.1f;     // Microtesla

    [Header("Bias and Drift")]
    public float accelerometerBias = 0.01f;
    public float gyroscopeBias = 0.001f;
    public float biasDriftRate = 0.0001f;      // Bias drift per second

    [Header("ROS Integration")]
    public string topicName = "/imu/data";

    private ROSConnection ros;
    private ImuMsg imuMsg;
    private float lastUpdateTime;
    private Vector3 accelerometerBias;
    private Vector3 gyroscopeBias;
    private Vector3 magnetometerBias;

    // For bias drift simulation
    private float biasDriftTimer = 0f;

    void Start()
    {
        ros = ROSConnection.instance;
        imuMsg = new ImuMsg();

        // Initialize bias values
        accelerometerBias = new Vector3(
            Random.Range(-accelerometerBias, accelerometerBias),
            Random.Range(-accelerometerBias, accelerometerBias),
            Random.Range(-accelerometerBias, accelerometerBias)
        );

        gyroscopeBias = new Vector3(
            Random.Range(-gyroscopeBias, gyroscopeBias),
            Random.Range(-gyroscopeBias, gyroscopeBias),
            Random.Range(-gyroscopeBias, gyroscopeBias)
        );

        magnetometerBias = new Vector3(
            Random.Range(-magnetometerNoise, magnetometerNoise),
            Random.Range(-magnetometerNoise, magnetometerNoise),
            Random.Range(-magnetometerNoise, magnetometerNoise)
        );
    }

    void Update()
    {
        if (Time.time - lastUpdateTime >= 1f / updateRate)
        {
            SimulateIMU();
            PublishIMUData();
            lastUpdateTime = Time.time;
        }

        // Update bias drift periodically
        biasDriftTimer += Time.deltaTime;
        if (biasDriftTimer >= 1f) // Update drift every second
        {
            UpdateBiasDrift();
            biasDriftTimer = 0f;
        }
    }

    void SimulateIMU()
    {
        // Get true values from Unity's physics simulation
        Vector3 trueAcceleration = GetTrueAcceleration();
        Vector3 trueAngularVelocity = GetTrueAngularVelocity();
        Vector3 trueMagneticField = GetTrueMagneticField();

        // Add noise and bias
        Vector3 noisyAcceleration = AddNoiseToVector(trueAcceleration, accelerometerNoise) + accelerometerBias;
        Vector3 noisyAngularVelocity = AddNoiseToVector(trueAngularVelocity, gyroscopeNoise) + gyroscopeBias;
        Vector3 noisyMagneticField = AddNoiseToVector(trueMagneticField, magnetometerNoise) + magnetometerBias;

        // Populate ROS message
        imuMsg.linear_acceleration.x = noisyAcceleration.x;
        imuMsg.linear_acceleration.y = noisyAcceleration.y;
        imuMsg.linear_acceleration.z = noisyAcceleration.z;

        imuMsg.angular_velocity.x = noisyAngularVelocity.x;
        imuMsg.angular_velocity.y = noisyAngularVelocity.y;
        imuMsg.angular_velocity.z = noisyAngularVelocity.z;

        // For magnetometer, use a separate message or include in IMU
        // In real systems, magnetometer is often separate

        // Set orientation (if available from robot state)
        imuMsg.orientation.w = transform.rotation.w;
        imuMsg.orientation.x = transform.rotation.x;
        imuMsg.orientation.y = transform.rotation.y;
        imuMsg.orientation.z = transform.rotation.z;

        // Set header
        imuMsg.header.stamp = new builtin_interfaces.msg.Time();
        imuMsg.header.frame_id = transform.name;
    }

    Vector3 GetTrueAcceleration()
    {
        // Calculate true acceleration from Unity physics
        // This is a simplified approach - in reality, you'd need to account for gravity
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb != null)
        {
            // Remove gravity to get proper acceleration
            return rb.velocity - Physics.gravity * Time.deltaTime;
        }
        else
        {
            // If no rigidbody, approximate from transform changes
            return (transform.position - transform.position) / Time.deltaTime; // This would be zero, need to store previous position
        }
    }

    Vector3 GetTrueAngularVelocity()
    {
        // Get true angular velocity
        Rigidbody rb = GetComponent<Rigidbody>();
        if (rb != null)
        {
            return rb.angularVelocity;
        }
        else
        {
            // Approximate from rotation changes
            return Vector3.zero; // Simplified
        }
    }

    Vector3 GetTrueMagneticField()
    {
        // Simulate Earth's magnetic field (simplified)
        // In real systems, this would be constant in world coordinates
        Vector3 worldMagneticField = new Vector3(0.2f, 0f, 0.4f); // Approximate Earth's field
        return transform.InverseTransformDirection(worldMagneticField);
    }

    Vector3 AddNoiseToVector(Vector3 vector, float noiseStdDev)
    {
        return new Vector3(
            AddNoiseToValue(vector.x, noiseStdDev),
            AddNoiseToValue(vector.y, noiseStdDev),
            AddNoiseToValue(vector.z, noiseStdDev)
        );
    }

    float AddNoiseToValue(float value, float noiseStdDev)
    {
        // Add Gaussian noise using Box-Muller transform
        float u1 = Random.value;
        float u2 = Random.value;
        float normal = Mathf.Sqrt(-2.0f * Mathf.Log(u1)) * Mathf.Cos(2.0f * Mathf.PI * u2);
        return value + normal * noiseStdDev;
    }

    void UpdateBiasDrift()
    {
        // Simulate slow bias drift
        accelerometerBias += new Vector3(
            Random.Range(-biasDriftRate, biasDriftRate),
            Random.Range(-biasDriftRate, biasDriftRate),
            Random.Range(-biasDriftRate, biasDriftRate)
        ) * Time.deltaTime;

        gyroscopeBias += new Vector3(
            Random.Range(-biasDriftRate, biasDriftRate),
            Random.Range(-biasDriftRate, biasDriftRate),
            Random.Range(-biasDriftRate, biasDriftRate)
        ) * Time.deltaTime;
    }

    void PublishIMUData()
    {
        ros.Send(topicName, imuMsg);
    }
}
```

## Multi-Sensor Fusion Simulation

### Sensor Fusion Architecture

```csharp
// Multi-sensor fusion simulator
using UnityEngine;
using System.Collections.Generic;

public class MultiSensorFusionSimulator : MonoBehaviour
{
    [Header("Fusion Settings")]
    public float fusionRate = 50f;  // Hz
    public float timeSyncTolerance = 0.01f;  // 10ms tolerance

    private Dictionary<string, SensorData> sensorBuffers = new Dictionary<string, SensorData>();
    private Queue<SensorData> fusionQueue = new Queue<SensorData>();
    private float lastFusionTime;

    [System.Serializable]
    public class SensorData
    {
        public string sensorType;
        public float timestamp;
        public Vector3[] data;
        public bool isValid;
    }

    void Start()
    {
        InitializeSensors();
    }

    void InitializeSensors()
    {
        // Initialize sensor buffers for different types
        sensorBuffers["lidar"] = new SensorData();
        sensorBuffers["camera"] = new SensorData();
        sensorBuffers["imu"] = new SensorData();
        sensorBuffers["gps"] = new SensorData(); // if applicable
    }

    void Update()
    {
        if (Time.time - lastFusionTime >= 1f / fusionRate)
        {
            PerformSensorFusion();
            lastFusionTime = Time.time;
        }
    }

    public void AddSensorData(string sensorType, SensorData data)
    {
        if (sensorBuffers.ContainsKey(sensorType))
        {
            sensorBuffers[sensorType] = data;
        }
    }

    void PerformSensorFusion()
    {
        // Check if we have synchronized data from multiple sensors
        float referenceTime = Time.time;
        List<SensorData> synchronizedData = new List<SensorData>();

        foreach (var kvp in sensorBuffers)
        {
            if (kvp.Value.isValid && Mathf.Abs(kvp.Value.timestamp - referenceTime) < timeSyncTolerance)
            {
                synchronizedData.Add(kvp.Value);
            }
        }

        if (synchronizedData.Count >= 2) // Need at least 2 sensors for fusion
        {
            // Perform fusion algorithm
            PerformFusionAlgorithm(synchronizedData);
        }
    }

    void PerformFusionAlgorithm(List<SensorData> sensorDataList)
    {
        // Example: Simple weighted average fusion
        // In practice, this would be a more sophisticated algorithm like Kalman filter

        Vector3 fusedPosition = Vector3.zero;
        Vector3 fusedOrientation = Vector3.zero;
        float totalWeight = 0f;

        foreach (var sensorData in sensorDataList)
        {
            float weight = GetSensorWeight(sensorData.sensorType);
            fusedPosition += GetPositionFromSensorData(sensorData) * weight;
            fusedOrientation += GetOrientationFromSensorData(sensorData) * weight;
            totalWeight += weight;
        }

        if (totalWeight > 0)
        {
            fusedPosition /= totalWeight;
            fusedOrientation /= totalWeight;

            // Publish fused data
            PublishFusedData(fusedPosition, fusedOrientation);
        }
    }

    float GetSensorWeight(string sensorType)
    {
        // Return weights based on sensor reliability
        switch (sensorType)
        {
            case "imu":
                return 0.3f;  // Good for short-term accuracy
            case "lidar":
                return 0.5f;  // Good for position accuracy
            case "camera":
                return 0.2f;  // Good for environment understanding
            default:
                return 0.1f;
        }
    }

    Vector3 GetPositionFromSensorData(SensorData data)
    {
        // Extract position from sensor data
        // Implementation depends on sensor type
        return Vector3.zero;
    }

    Vector3 GetOrientationFromSensorData(SensorData data)
    {
        // Extract orientation from sensor data
        // Implementation depends on sensor type
        return Vector3.zero;
    }

    void PublishFusedData(Vector3 position, Vector3 orientation)
    {
        // Publish fused sensor data to ROS
        // Implementation would use ROS TCP connector
    }
}
```

## Sensor Validation and Calibration

### Simulation vs Real-World Validation

```csharp
// Sensor validation framework
using UnityEngine;
using System.Collections.Generic;

public class SensorValidator : MonoBehaviour
{
    [Header("Validation Settings")]
    public float validationThreshold = 0.1f;  // Acceptable error threshold
    public int validationSampleSize = 100;    // Number of samples for validation

    private List<SensorValidationResult> validationResults = new List<SensorValidationResult>();

    [System.Serializable]
    public class SensorValidationResult
    {
        public string sensorType;
        public float meanError;
        public float stdDev;
        public float maxError;
        public float minError;
        public int sampleCount;
        public bool isValid;
    }

    public void ValidateLiDAR(LiDARSimulator sim, float[] realData)
    {
        float[] simData = sim.GetRanges();

        if (simData.Length != realData.Length)
        {
            Debug.LogError("Data length mismatch in LiDAR validation");
            return;
        }

        List<float> errors = new List<float>();
        for (int i = 0; i < simData.Length; i++)
        {
            if (realData[i] > 0 && simData[i] > 0) // Valid measurements
            {
                float error = Mathf.Abs(realData[i] - simData[i]);
                errors.Add(error);
            }
        }

        SensorValidationResult result = CalculateValidationMetrics(errors, "LiDAR");
        validationResults.Add(result);

        // Log validation results
        Debug.Log($"LiDAR Validation - Mean Error: {result.meanError:F3}m, " +
                 $"Std Dev: {result.stdDev:F3}m, Max Error: {result.maxError:F3}m");
    }

    public void ValidateIMU(UnityIMUSimulator sim, Vector3 realAccel, Vector3 realGyro)
    {
        // Compare simulated IMU data with real data
        // Implementation would compare true values with noisy simulated values
    }

    SensorValidationResult CalculateValidationMetrics(List<float> errors, string sensorType)
    {
        if (errors.Count == 0)
        {
            return new SensorValidationResult
            {
                sensorType = sensorType,
                meanError = float.PositiveInfinity,
                stdDev = float.PositiveInfinity,
                maxError = float.PositiveInfinity,
                minError = float.PositiveInfinity,
                sampleCount = 0,
                isValid = false
            };
        }

        float sum = 0f;
        float min = float.MaxValue;
        float max = float.MinValue;

        foreach (float error in errors)
        {
            sum += error;
            min = Mathf.Min(min, error);
            max = Mathf.Max(max, error);
        }

        float mean = sum / errors.Count;

        float varianceSum = 0f;
        foreach (float error in errors)
        {
            varianceSum += Mathf.Pow(error - mean, 2);
        }
        float stdDev = Mathf.Sqrt(varianceSum / errors.Count);

        return new SensorValidationResult
        {
            sensorType = sensorType,
            meanError = mean,
            stdDev = stdDev,
            maxError = max,
            minError = min,
            sampleCount = errors.Count,
            isValid = (mean < validationThreshold)
        };
    }

    public bool IsSensorValid(string sensorType)
    {
        var result = validationResults.Find(r => r.sensorType == sensorType);
        return result != null ? result.isValid : false;
    }

    public void GenerateValidationReport()
    {
        Debug.Log("=== Sensor Validation Report ===");
        foreach (var result in validationResults)
        {
            Debug.Log($"{result.sensorType}: Mean={result.meanError:F3}, " +
                     $"StdDev={result.stdDev:F3}, Valid={result.isValid}");
        }
    }
}
```

## Performance Optimization

### Efficient Sensor Simulation

```csharp
// Performance-optimized sensor simulation manager
using UnityEngine;
using System.Collections.Generic;

public class OptimizedSensorSimulator : MonoBehaviour
{
    [Header("Performance Settings")]
    public int maxSensors = 10;
    public float minUpdateInterval = 0.01f;  // 100Hz max
    public int maxRaycastsPerFrame = 100;    // Limit per frame

    private List<ISensorSimulator> activeSensors = new List<ISensorSimulator>();
    private int currentRaycastCount = 0;

    public interface ISensorSimulator
    {
        void UpdateSensor(float deltaTime);
        bool IsReadyToUpdate();
        string GetSensorType();
    }

    void Update()
    {
        float deltaTime = Time.deltaTime;

        // Update sensors in batches to avoid performance spikes
        int sensorsUpdated = 0;
        currentRaycastCount = 0;

        foreach (var sensor in activeSensors)
        {
            if (sensor.IsReadyToUpdate() &&
                currentRaycastCount < maxRaycastsPerFrame)
            {
                sensor.UpdateSensor(deltaTime);
                sensorsUpdated++;

                // Limit updates to prevent frame drops
                if (sensorsUpdated >= maxSensors)
                    break;
            }
        }
    }

    public void RegisterSensor(ISensorSimulator sensor)
    {
        if (activeSensors.Count < maxSensors)
        {
            activeSensors.Add(sensor);
        }
        else
        {
            Debug.LogWarning("Maximum sensor count reached. Sensor not registered.");
        }
    }

    public void UnregisterSensor(ISensorSimulator sensor)
    {
        activeSensors.Remove(sensor);
    }

    // Adaptive update rate based on sensor importance
    public void SetSensorPriority(ISensorSimulator sensor, float priority)
    {
        // Implementation would adjust update rates based on priority
    }
}
```

## Best Practices for Sensor Simulation

### Accuracy Considerations

1. **Physics-Based Simulation**: Use real physics principles rather than simple approximations
2. **Noise Modeling**: Include realistic noise characteristics for each sensor type
3. **Cross-Sensor Validation**: Validate sensor outputs against each other
4. **Environmental Factors**: Consider lighting, weather, and environmental impacts
5. **Temporal Consistency**: Maintain proper timing relationships between sensors

### Performance Considerations

1. **Selective Updates**: Update sensors only when necessary
2. **LOD for Sensors**: Use different detail levels based on distance/importance
3. **Culling**: Don't simulate sensors when not in use
4. **Batch Processing**: Process multiple sensor readings together
5. **Asynchronous Processing**: Use background threads where possible

### Validation Best Practices

1. **Real-World Comparison**: Compare simulation outputs to real sensor data
2. **Statistical Analysis**: Use statistical measures to validate sensor behavior
3. **Edge Case Testing**: Test sensors under extreme conditions
4. **Calibration Verification**: Ensure simulated calibration matches real sensors
5. **Integration Testing**: Test sensors as part of complete perception pipeline

## Summary

Sensor simulation is a critical component of digital twin systems for humanoid robotics, providing realistic representations of LiDAR, depth cameras, and IMU sensors. Proper modeling of sensor characteristics, noise, and dynamics ensures that algorithms developed in simulation will perform well on real robots.

The next module will cover NVIDIA Isaac, which builds on these simulation foundations with advanced GPU-accelerated perception and control systems.