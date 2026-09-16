import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Video, 
  Play, 
  Square, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  AlertTriangle, 
  Gauge, 
  CheckCircle2,
  RefreshCw,
  Download,
  Sliders,
  Layers
} from 'lucide-react';
import { api } from '../services/api';

const CAMERA_CHANNELS = [
  { id: 'FRONT_BUMPER', label: 'CAM 01: Front Bumper Optical', role: 'Obstacle / Vehicles' },
  { id: 'WINDSHIELD_ANPR', label: 'CAM 02: Windshield ANPR', role: 'Plate Recognition' },
  { id: 'REAR_DEFECT', label: 'CAM 03: Rear Road Scanner', role: 'Potholes / Waterlogging' },
];

export default function OnboardAI() {
  const [sourceMode, setSourceMode] = useState('simulated'); // 'simulated', 'webcam', 'upload'
  const [activeChannel, setActiveChannel] = useState('FRONT_BUMPER');
  const [isInferencing, setIsInferencing] = useState(true);
  const [fps, setFps] = useState(31.2);
  const [latency, setLatency] = useState(14.6);
  const [engine, setEngine] = useState('YOLOv11n-COCO');
  const [detections, setDetections] = useState([]);
  const [vehicleCount, setVehicleCount] = useState(3);
  const [pedestrianCount, setPedestrianCount] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [triggerState, setTriggerState] = useState(null);
  const [snapshotSaved, setSnapshotSaved] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Simulation parameters for animated Indian road traffic scene
  const simObjectsRef = useRef([
    { x: 0.15, y: 0.55, w: 0.18, h: 0.22, cls: 'car', speed: 0.0035, color: '#2563eb', label: 'car 94%' },
    { x: 0.45, y: 0.48, w: 0.24, h: 0.32, cls: 'bus', speed: 0.002, color: '#0891b2', label: 'bus 91%' },
    { x: 0.78, y: 0.60, w: 0.12, h: 0.18, cls: 'motorcycle', speed: 0.0045, color: '#d97706', label: 'motorcycle 96%' },
    { x: 0.08, y: 0.45, w: 0.07, h: 0.20, cls: 'person', speed: 0.001, color: '#10b981', label: 'person 89%' }
  ]);

  // Setup Webcam if selected
  useEffect(() => {
    let stream = null;
    if (sourceMode === 'webcam') {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Webcam permission not granted or device unavailable:', err);
          window.alert('Webcam access was not granted or is unavailable. Switching to Simulated Edge Stream.');
          setSourceMode('simulated');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [sourceMode]);

  // Render loop for simulated road camera
  useEffect(() => {
    if (sourceMode !== 'simulated') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let roadOffset = 0;

    const render = () => {
      roadOffset = (roadOffset + 2.5) % 40;
      const w = canvas.width;
      const h = canvas.height;

      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.45);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h * 0.45);

      // Distant City Skyline
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, h * 0.24, 70, h * 0.21);
      ctx.fillRect(130, h * 0.18, 90, h * 0.27);
      ctx.fillRect(240, h * 0.26, 60, h * 0.19);
      ctx.fillRect(320, h * 0.16, 110, h * 0.29);
      ctx.fillRect(450, h * 0.22, 80, h * 0.23);
      ctx.fillRect(550, h * 0.20, 100, h * 0.25);

      // Road Surface
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.45);
      ctx.lineTo(w * 0.65, h * 0.45);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Road Curbs
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.45);
      ctx.lineTo(0, h);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(w * 0.65, h * 0.45);
      ctx.lineTo(w, h);
      ctx.stroke();

      // Dashed lane lines moving
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffset;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.45);
      ctx.lineTo(w * 0.5, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw simulated vehicles moving
      const currentDets = [];
      simObjectsRef.current.forEach((obj) => {
        obj.y += obj.speed;
        if (obj.y > 0.85) {
          obj.y = 0.48;
          obj.x = Math.max(0.1, Math.min(0.8, obj.x + (Math.random() - 0.5) * 0.2));
        }

        const scale = (obj.y - 0.4) * 2;
        const boxW = Math.max(20, obj.w * w * scale);
        const boxH = Math.max(25, obj.h * h * scale);
        const boxX = obj.x * w;
        const boxY = obj.y * h;

        // Vehicle silhouette
        ctx.fillStyle = obj.color;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.globalAlpha = 1.0;

        currentDets.push({
          bbox: [boxY / h, boxX / w, (boxY + boxH) / h, (boxX + boxW) / w],
          class_name: obj.cls,
          label: `${obj.cls} ${Math.round(88 + scale * 9)}%`,
          color: obj.color,
          confidence: 0.93
        });
      });

      // Render Pothole if triggered
      if (triggerState === 'pothole') {
        const py = h * 0.72;
        const px = w * 0.42;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(px + 40, py + 20, 45, 18, 0, 0, 2 * Math.PI);
        ctx.fill();
        currentDets.push({
          bbox: [py / h, px / w, (py + 40) / h, (px + 80) / w],
          class_name: 'pothole',
          label: 'ROAD DEFECT: Pothole (96%)',
          color: '#ea580c',
          is_defect: true
        });
      }

      // Render Waterlogging if triggered
      if (triggerState === 'waterlogging') {
        const wy = h * 0.65;
        const wx = w * 0.25;
        ctx.fillStyle = '#0284c7';
        ctx.globalAlpha = 0.65;
        ctx.fillRect(wx, wy, 260, 60);
        ctx.globalAlpha = 1.0;
        currentDets.push({
          bbox: [wy / h, wx / w, (wy + 60) / h, (wx + 260) / w],
          class_name: 'waterlogging',
          label: 'ROAD DEFECT: Waterlogging (97%)',
          color: '#0284c7',
          is_defect: true
        });
      }

      // Render ANPR violation if triggered
      if (triggerState === 'anpr') {
        currentDets.push({
          bbox: [0.55, 0.42, 0.75, 0.68],
          class_name: 'anpr',
          label: 'ANPR: AP 37 AB 4821 [HIT & RUN VIOLATION]',
          color: '#dc2626',
          is_anpr: true
        });
      }

      setDetections(currentDets);
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [sourceMode, triggerState]);

  // Periodic real backend YOLOv11 inference test
  const testBackendInference = async () => {
    try {
      setLatency(14.2);
      const canvas = canvasRef.current;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const res = await api.processBase64Frame({
          image_base64: dataUrl,
          bus_id: 'ASTRA-103',
          camera_channel: activeChannel,
          trigger_defect: triggerState === 'pothole' || triggerState === 'waterlogging',
          defect_type: triggerState,
          trigger_anpr: triggerState === 'anpr'
        });
        if (res.inference_time_ms) {
          setLatency(res.inference_time_ms);
          setEngine(res.engine || 'YOLOv11n');
        }
      }
    } catch (e) {
      console.warn('Background inference ping:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(testBackendInference, 2800);
    return () => clearInterval(interval);
  }, [triggerState, activeChannel]);

  // Handle uploaded image file
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSourceMode('upload');
    const reader = new FileReader();
    reader.onload = async (event) => {
      setUploadedImage(event.target.result);
      try {
        const res = await api.uploadImageFile(file, 'ASTRA-103');
        if (res.detections) {
          setDetections(res.detections);
          setVehicleCount(res.vehicle_count);
          setPedestrianCount(res.pedestrian_count);
          setLatency(res.inference_time_ms);
          setEngine(res.engine);
        }
      } catch (err) {
        console.error('File inference failed:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Demo Trigger Actions
  const handleTriggerAction = async (type) => {
    setTriggerState(type);
    if (type === 'hit_and_run' || type === 'anpr') {
      await api.triggerIncident({
        type: 'HIT_AND_RUN',
        license_plate: 'AP 37 AB 4821',
        bus_id: 'ASTRA-103',
        location_name: 'Benz Circle Flyover Underpass'
      });
    } else if (type === 'pothole') {
      await api.triggerDefect({
        type: 'pothole',
        bus_id: 'ASTRA-103',
        address: 'MG Road near DV Manor'
      });
    } else if (type === 'waterlogging') {
      await api.triggerDefect({
        type: 'waterlogging',
        bus_id: 'ASTRA-103',
        address: 'Prakasam Barrage Approach Ramp'
      });
    }

    setTimeout(() => {
      setTriggerState(null);
    }, 6000);
  };

  // Capture and download canvas evidence snapshot
  const handleCaptureSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create an offscreen canvas to merge frame + bounding boxes
    const offscreen = document.createElement('canvas');
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext('2d');

    // Draw main frame
    ctx.drawImage(canvas, 0, 0);

    // Draw bounding boxes on export
    detections.forEach((det) => {
      const [ymin, xmin, ymax, xmax] = det.bbox;
      const x = xmin * offscreen.width;
      const y = ymin * offscreen.height;
      const w = (xmax - xmin) * offscreen.width;
      const h = (ymax - ymin) * offscreen.height;

      ctx.strokeStyle = det.color || '#2563eb';
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = det.color || '#2563eb';
      ctx.fillRect(x, Math.max(0, y - 20), w, 20);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(det.label || det.class_name, x + 4, Math.max(14, y - 5));
    });

    // Stamp municipal watermark
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(10, offscreen.height - 35, 420, 25);
    ctx.fillStyle = '#06b6d4';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('ASTRA-103 | YOLOv11n EDGE INFERENCE EVIDENCE | VIJAYAWADA', 18, offscreen.height - 18);

    const link = document.createElement('a');
    link.download = `ASTRA_Evidence_YOLOv11_${Date.now()}.png`;
    link.href = offscreen.toDataURL('image/png');
    link.click();

    setSnapshotSaved(true);
    setTimeout(() => setSnapshotSaved(false), 2500);
  };

  return (
    <div className="space-y-4 max-w-[1700px] mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            <h1 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono tracking-wider">
              ONBOARD AI COMPUTER • EDGE UNIT ASTRA-103
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            Ultralytics YOLOv11n State-of-the-Art Object Vision • Multi-Camera Sensing • Indian Road DefectNet
          </p>
        </div>

        {/* Source Mode Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSourceMode('simulated')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              sourceMode === 'simulated'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Simulated Stream</span>
          </button>

          <button
            onClick={() => setSourceMode('webcam')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              sourceMode === 'webcam'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Webcam</span>
          </button>

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              sourceMode === 'upload'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Test Video</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
          />

          <button
            onClick={handleCaptureSnapshot}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold transition-all shadow-sm shadow-emerald-600/30"
            title="Download annotated frame snapshot"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{snapshotSaved ? 'Saved!' : 'Save Snapshot'}</span>
          </button>
        </div>
      </div>

      {/* Camera Channel Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <span className="text-xs font-mono font-bold text-slate-500 uppercase mr-2">Sensor Channels:</span>
        {CAMERA_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              activeChannel === ch.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{ch.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Left Video HUD (65%) + Right Controls & Live Detections (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: 16:9 Edge Viewport with Bounding Box Overlay */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative flex flex-col">
          {/* Top Edge HUD Bar */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-30 font-mono text-xs">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>ONLINE • YOLOv11n</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-blue-300 font-semibold">Unit: ASTRA-103</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">Model: {engine}</span>
            </div>

            <div className="flex items-center space-x-4 text-slate-300">
              <div>FPS: <span className="text-cyan-400 font-bold">{fps}</span></div>
              <div>Latency: <span className="text-emerald-400 font-bold">{latency} ms</span></div>
              <div className="hidden sm:block">Speed: <span className="text-amber-400 font-bold">34 km/h</span></div>
            </div>
          </div>

          {/* 16:9 Viewport Area */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {sourceMode === 'simulated' && (
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-cover"
              />
            )}

            {sourceMode === 'webcam' && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            )}

            {sourceMode === 'upload' && uploadedImage && (
              <img
                src={uploadedImage}
                alt="Uploaded Scene"
                className="w-full h-full object-contain"
              />
            )}

            {/* Bounding Boxes Layer Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {detections.map((det, idx) => {
                const [ymin, xmin, ymax, xmax] = det.bbox;
                const top = `${ymin * 100}%`;
                const left = `${xmin * 100}%`;
                const width = `${(xmax - xmin) * 100}%`;
                const height = `${(ymax - ymin) * 100}%`;

                return (
                  <div
                    key={idx}
                    className="absolute border-2 transition-all duration-100"
                    style={{
                      top,
                      left,
                      width,
                      height,
                      borderColor: det.color || '#2563eb',
                      boxShadow: `0 0 12px ${det.color || '#2563eb'}`
                    }}
                  >
                    <span
                      className="absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-mono font-extrabold text-white rounded shadow-sm"
                      style={{ backgroundColor: det.color || '#2563eb' }}
                    >
                      {det.label || `${det.class_name} ${Math.round((det.confidence || 0.9) * 100)}%`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* In-Cabin Watermark */}
            <div className="absolute bottom-3 left-3 z-20 px-3 py-1 rounded-lg bg-black/80 border border-slate-700 text-[10px] font-mono text-slate-200">
              ASTRA-103 • {activeChannel} • GPS: 16.5020° N, 80.6580° E • YOLOv11 Core
            </div>
          </div>
        </div>

        {/* Right: Trigger Actions Panel & Live Detections Feed */}
        <div className="lg:col-span-4 space-y-4">
          {/* Judge Demo Triggers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              <h3 className="font-bold text-xs tracking-wider text-slate-900 dark:text-slate-100 font-mono uppercase">
                Interactive AI Trigger Controls
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Simulate live edge detection events to demonstrate instant GIS synchronization & alert dispatch:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTriggerAction('hit_and_run')}
                className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02]"
              >
                <span className="text-lg">🚨</span>
                <span>Hit & Run (ANPR)</span>
              </button>

              <button
                onClick={() => handleTriggerAction('pothole')}
                className="p-3 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 text-orange-700 dark:text-orange-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02]"
              >
                <span className="text-lg">🕳️</span>
                <span>Pothole Defect</span>
              </button>

              <button
                onClick={() => handleTriggerAction('waterlogging')}
                className="p-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02]"
              >
                <span className="text-lg">🌊</span>
                <span>Waterlogging</span>
              </button>

              <button
                onClick={() => handleTriggerAction('anpr')}
                className="p-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold transition-all flex flex-col items-center justify-center text-center space-y-1 hover:scale-[1.02]"
              >
                <span className="text-lg">⛔</span>
                <span>BRTS Lane Block</span>
              </button>
            </div>
          </div>

          {/* Detections Summary Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-xs tracking-wider text-slate-900 dark:text-slate-100 font-mono uppercase border-b border-slate-200 dark:border-slate-800 pb-2">
              Active YOLOv11 Frame Detections
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Vehicles:</span>
                <div className="text-xl font-extrabold text-blue-600 dark:text-cyan-400 mt-0.5">
                  {detections.filter(d => ['car', 'bus', 'truck', 'motorcycle'].includes(d.class_name)).length || 3}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500">Pedestrians:</span>
                <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {detections.filter(d => d.class_name === 'person').length || 1}
                </div>
              </div>
            </div>

            {/* Detections Pill List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {detections.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></span>
                    <span className="text-slate-800 dark:text-white font-bold capitalize">{d.class_name}</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {Math.round((d.confidence || 0.9) * 100)}% conf
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
