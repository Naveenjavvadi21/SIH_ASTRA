"""
ASTRA Sample Video Generator
Generates sample-video.mp4 using OpenCV for testing the Onboard AI video upload
"""
import os
import cv2
import numpy as np

def generate_sample_video():
    output_path = os.path.join(os.path.dirname(__file__), "sample-video.mp4")
    width, height = 640, 360
    fps = 24
    seconds = 5
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    print(f"Generating synthetic dashcam driving video: {output_path}")

    for frame_idx in range(fps * seconds):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Sky
        frame[0:160, :] = [60, 40, 30]
        # Road
        pts = np.array([[width*0.35, 160], [width*0.65, 160], [width, height], [0, height]], np.int32)
        cv2.fillPoly(frame, [pts], (45, 45, 45))

        # Lane markings
        offset = (frame_idx * 6) % 30
        for y in range(160 + offset, height, 40):
            cv2.line(frame, (int(width*0.5), y), (int(width*0.5), min(height, y + 20)), (255, 255, 255), 3)

        # Moving car 1
        car1_y = int(170 + (frame_idx * 1.5) % 150)
        car1_scale = (car1_y - 150) / 180.0
        c1_w = int(40 + car1_scale * 60)
        c1_h = int(25 + car1_scale * 45)
        c1_x = int(width * 0.35 - c1_w / 2)
        cv2.rectangle(frame, (c1_x, car1_y), (c1_x + c1_w, car1_y + c1_h), (220, 80, 50), -1)
        cv2.putText(frame, "AP 16 Z 4091", (c1_x, car1_y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)

        # Moving car 2
        car2_y = int(180 + (frame_idx * 2.0) % 140)
        car2_scale = (car2_y - 150) / 180.0
        c2_w = int(35 + car2_scale * 55)
        c2_h = int(22 + car2_scale * 40)
        c2_x = int(width * 0.62 - c2_w / 2)
        cv2.rectangle(frame, (c2_x, car2_y), (c2_x + c2_w, car2_y + c2_h), (50, 150, 240), -1)

        # HUD overlay
        cv2.putText(frame, f"ASTRA-103 CAM 01 | FRAME {frame_idx:04d}", (15, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 240, 255), 1)

        out.write(frame)

    out.release()
    print("Video generation complete: sample-video.mp4")

if __name__ == "__main__":
    generate_sample_video()
