# VisionAnnotate Studio

**VisionAnnotate Studio** is a high-throughput, web-based Image Data Annotation and Computer Vision Labeling platform engineered for machine learning practitioners, computer vision engineers, and dataset curators.

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Vite**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. High-Performance Multi-Layer Annotation Canvas
- **Sub-pixel Precision Rendering**: Pure vector SVG overlays on high-resolution image backdrops.
- **Dynamic Pan & Zoom Engine**: Smooth mouse wheel zooming from 25% to 400% centered on cursor, with hand-tool panning or middle-click dragging.
- **Bounding Box Tool (`B`)**: 2-click or click-and-drag creation with 8 interactive resize handles (NW, N, NE, E, SE, S, SW, W) and real-time dimension badges.
- **Polygon Segmentation Tool (`P`)**: Real-time rubberband previews, origin vertex snapping within 12px to close contour, and vertex repositioning handles.
- **Keypoint Marker Tool (`K`)**: Single-click landmark placement with concentric target rings and label chips.
- **Select & Transform Tool (`V`)**: Move, resize, reshape, and reassign taxonomy classes.

### 2. Automated Geometric QA Validator
Audits annotations in real-time to prevent training pipeline corruption:
- **Self-Intersecting Polygon Detection**: Algorithmic line-segment intersection detector flags invalid bow-tie polygons.
- **Micro-Box Filter**: Flags annotations under 15px width/height as potential noise artifacts.
- **Boundary Overflow Checker**: Ensures coordinates stay within physical image boundaries.
- **Duplicate IoU Analysis**: Flags overlapping duplicate bounding boxes with IoU &ge; 0.90.
- **Confidence Advisory**: Alerts reviewers when confidence drops below 65%.

### 3. Rich Benchmark Datasets
Pre-loaded with 4 vector benchmark datasets:
1. **Urban Traffic & Autonomous Driving**: Vehicles, trucks, pedestrians, cyclists, lane boundaries, traffic lights.
2. **Aerial Drone Infrastructure**: Warehouses, solar panel arrays, water bodies, highway bridges.
3. **Retail Shelf Stock**: Beverage cans, glass bottles, cereal boxes, price tags, out-of-stock voids.
4. **Medical Fluorescence Microscopy**: Cell nuclei, atypical mitotic spindles, extracellular tissue.
*Supports uploading custom images via file picker or drag-and-drop.*

### 4. CV Dataset Export & Import
- **MS COCO 1.0 JSON**: Complete schema with category mapping, bounding boxes, polygon segmentation lists, areas, and metadata attributes.
- **YOLO Format**: Normalized coordinates (`class_idx x_center y_center width height`) and YOLOv8 polygon format.
- **Pascal VOC XML**: Standard XML schema with `<annotation>`, `<bndbox>`, occlusion, and truncation tags.
- **JSON Import**: Seamlessly load and merge external COCO annotations.

---

## ⌨️ Keyboard Shortcuts Reference

| Key | Action |
| :--- | :--- |
| `1` - `9` | Instant Taxonomy Class Switcher |
| `V` | Select & Transform Tool |
| `B` | Bounding Box Annotation Tool |
| `P` | Polygon Segmentation Tool |
| `K` | Keypoint / Point Marker Tool |
| `H` / `Space + Drag` | Pan Viewport Canvas |
| `Delete` / `Backspace` | Delete Selected Annotation |
| `Ctrl + Z` | Undo Last Annotation Action |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo Annotation Action |
| `+` / `-` | Zoom In / Zoom Out |
| `0` | Reset Zoom to 100% |
| `Esc` | Deselect Object / Cancel In-Progress Polygon |
| `Enter` | Complete & Close Active Polygon |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Architecture**: Single-page application with modular state partition and geometric validation engine

---

## 🚀 Getting Started
