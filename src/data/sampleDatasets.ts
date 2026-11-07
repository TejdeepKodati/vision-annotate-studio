import { ImageDatasetItem, LabelClass } from '../types/annotation';

// Urban Traffic Classes
const urbanClasses: LabelClass[] = [
  { id: 'u-car', name: 'Vehicle', color: '#3B82F6', hotkey: '1', description: 'Passenger cars, sedans, SUVs, and vans', category: 'Automotive' },
  { id: 'u-truck', name: 'Heavy Truck', color: '#8B5CF6', hotkey: '2', description: 'Delivery vans, box trucks, and buses', category: 'Automotive' },
  { id: 'u-pedestrian', name: 'Pedestrian', color: '#EC4899', hotkey: '3', description: 'People walking, standing, or crossing', category: 'Vulnerable Road Users' },
  { id: 'u-cyclist', name: 'Cyclist', color: '#F59E0B', hotkey: '4', description: 'Bicyclists and scooter riders', category: 'Vulnerable Road Users' },
  { id: 'u-trafficlight', name: 'Traffic Light', color: '#EF4444', hotkey: '5', description: 'Signal head housing and active light state', category: 'Infrastructure' },
  { id: 'u-lane', name: 'Lane Boundary', color: '#10B981', hotkey: '6', description: 'Dashed or solid road surface markings', category: 'Infrastructure' }
];

// Aerial Infrastructure Classes
const aerialClasses: LabelClass[] = [
  { id: 'a-bldg', name: 'Building / Warehouse', color: '#6366F1', hotkey: '1', description: 'Industrial, commercial or residential rooftop', category: 'Structures' },
  { id: 'a-solar', name: 'Solar Array', color: '#F59E0B', hotkey: '2', description: 'Photovoltaic solar panel banks', category: 'Energy' },
  { id: 'a-water', name: 'Water Reservoir', color: '#06B6D4', hotkey: '3', description: 'Canals, rivers, lakes, or retention ponds', category: 'Terrain' },
  { id: 'a-bridge', name: 'Bridge Structure', color: '#A855F7', hotkey: '4', description: 'Highway overpasses and river crossings', category: 'Infrastructure' },
  { id: 'a-road', name: 'Roadway', color: '#64748B', hotkey: '5', description: 'Paved highway asphalt lanes', category: 'Infrastructure' }
];

// Retail Shelf Classes
const retailClasses: LabelClass[] = [
  { id: 'r-can', name: 'Soda Can', color: '#F97316', hotkey: '1', description: 'Beverage aluminum cans (330ml-500ml)', category: 'Beverages' },
  { id: 'r-bottle', name: 'Glass Bottle', color: '#06B6D4', hotkey: '2', description: 'Olive oil, vinegar, or wine glass bottles', category: 'Packaged Goods' },
  { id: 'r-cereal', name: 'Cereal Box', color: '#8B5CF6', hotkey: '3', description: 'Cardboard breakfast boxes', category: 'Dry Food' },
  { id: 'r-price', name: 'Price Tag', color: '#EAB308', hotkey: '4', description: 'Digital or paper shelf pricing cards', category: 'Merchandising' },
  { id: 'r-oos', name: 'Out of Stock Gap', color: '#EF4444', hotkey: '5', description: 'Empty shelf spaces requiring restock', category: 'Inventory' }
];

// Medical Microscopy Classes
const medicalClasses: LabelClass[] = [
  { id: 'm-nucleus', name: 'Cell Nucleus', color: '#A855F7', hotkey: '1', description: 'Intact stained cell nuclei with chromatin', category: 'Cytology' },
  { id: 'm-mitosis', name: 'Mitotic Anomaly', color: '#EF4444', hotkey: '2', description: 'Atypical mitotic spindles and dividing cells', category: 'Pathology' },
  { id: 'm-tissue', name: 'Tissue Stroma', color: '#3B82F6', hotkey: '3', description: 'Eosinophilic extracellular connective matrix', category: 'Histology' },
  { id: 'm-centroid', name: 'Centroid Keypoint', color: '#10B981', hotkey: '4', description: 'Exact center coordinate of target nucleus', category: 'Landmarks' }
];

// Helper to encode SVGs cleanly
function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

// 1. Urban Traffic Autonomous Driving SVG (1200 x 750)
const urbanSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="60%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#334155" />
    </linearGradient>
    <linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="carBodyGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="truckGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>
  </defs>

  <!-- Sky & City Horizon -->
  <rect x="0" y="0" width="1200" height="380" fill="url(#skyGrad)" />
  <rect x="60" y="140" width="90" height="240" fill="#1E293B" />
  <rect x="180" y="80" width="140" height="300" fill="#0F172A" />
  <rect x="360" y="160" width="100" height="220" fill="#1E293B" />
  <rect x="740" y="100" width="130" height="280" fill="#0F172A" />
  <rect x="910" y="150" width="110" height="230" fill="#1E293B" />
  <rect x="1050" y="110" width="100" height="270" fill="#0F172A" />

  <!-- Road & Highway -->
  <rect x="0" y="380" width="1200" height="370" fill="url(#roadGrad)" />
  
  <!-- Sidewalks -->
  <rect x="0" y="360" width="1200" height="25" fill="#475569" />
  <rect x="0" y="385" width="1200" height="5" fill="#64748B" />

  <!-- Crosswalk zebra stripes -->
  <g fill="#CBD5E1" opacity="0.85">
    <rect x="180" y="440" width="30" height="260" rx="3" />
    <rect x="230" y="440" width="30" height="260" rx="3" />
    <rect x="280" y="440" width="30" height="260" rx="3" />
    <rect x="330" y="440" width="30" height="260" rx="3" />
  </g>

  <!-- Lane Markings (Yellow double center & dashed white) -->
  <line x1="0" y1="560" x2="1200" y2="560" stroke="#FBBF24" stroke-width="4" />
  <line x1="0" y1="568" x2="1200" y2="568" stroke="#FBBF24" stroke-width="4" />
  
  <line x1="400" y1="460" x2="1200" y2="460" stroke="#F8FAFC" stroke-width="4" stroke-dasharray="35,30" opacity="0.8" />
  <line x1="400" y1="670" x2="1200" y2="670" stroke="#F8FAFC" stroke-width="4" stroke-dasharray="35,30" opacity="0.8" />

  <!-- Traffic Signal Gantry Structure -->
  <rect x="980" y="190" width="16" height="200" fill="#475569" />
  <rect x="940" y="220" width="90" height="24" rx="4" fill="#1E293B" stroke="#64748B" stroke-width="2" />
  <!-- Signal Lights -->
  <circle cx="955" cy="232" r="7" fill="#EF4444" />
  <circle cx="985" cy="232" r="7" fill="#475569" />
  <circle cx="1015" cy="232" r="7" fill="#475569" />

  <!-- Vehicle 1: Autonomous Test Car (Sedan with Roof Sensor Dome) -->
  <g id="car1">
    <!-- Shadow -->
    <ellipse cx="600" cy="545" rx="135" ry="16" fill="#000000" opacity="0.6" />
    <!-- Car body -->
    <path d="M 480 520 L 510 465 L 670 465 L 720 500 L 735 525 L 475 525 Z" fill="url(#carBodyGrad)" />
    <!-- Cabin & Windows -->
    <path d="M 520 468 L 545 435 L 640 435 L 675 468 Z" fill="#93C5FD" opacity="0.75" />
    <!-- Wheels -->
    <circle cx="525" cy="525" r="22" fill="#1E293B" stroke="#94A3B8" stroke-width="6" />
    <circle cx="685" cy="525" r="22" fill="#1E293B" stroke="#94A3B8" stroke-width="6" />
    <!-- Roof LiDAR / Sensor Pod -->
    <rect x="580" y="420" width="30" height="15" rx="4" fill="#F59E0B" />
    <line x1="595" y1="420" x2="595" y2="410" stroke="#EF4444" stroke-width="3" />
    <!-- Headlights & Taillights -->
    <rect x="730" y="508" width="8" height="12" rx="2" fill="#FEF08A" />
    <rect x="473" y="510" width="6" height="12" rx="2" fill="#EF4444" />
  </g>

  <!-- Vehicle 2: Delivery Van / Truck -->
  <g id="truck1">
    <ellipse cx="980" cy="510" rx="125" ry="14" fill="#000000" opacity="0.5" />
    <rect x="880" y="390" width="160" height="105" rx="4" fill="url(#truckGrad)" />
    <path d="M 1040 420 L 1075 450 L 1075 495 L 1040 495 Z" fill="#6D28D9" />
    <rect x="1045" y="430" width="22" height="25" rx="2" fill="#C4B5FD" opacity="0.8" />
    <circle cx="920" cy="495" r="20" fill="#0F172A" stroke="#94A3B8" stroke-width="5" />
    <circle cx="1035" cy="495" r="20" fill="#0F172A" stroke="#94A3B8" stroke-width="5" />
  </g>

  <!-- Pedestrian on Crosswalk -->
  <g id="pedestrian1">
    <ellipse cx="255" cy="520" rx="14" ry="4" fill="#000000" opacity="0.5" />
    <!-- Head -->
    <circle cx="255" cy="440" r="10" fill="#FBCFE8" />
    <!-- Torso (Pink jacket) -->
    <rect x="247" y="450" width="16" height="34" rx="4" fill="#EC4899" />
    <!-- Legs -->
    <line x1="251" y1="484" x2="247" y2="518" stroke="#1E293B" stroke-width="5" stroke-linecap="round" />
    <line x1="259" y1="484" x2="263" y2="518" stroke="#1E293B" stroke-width="5" stroke-linecap="round" />
  </g>

  <!-- Cyclist in Bike Lane -->
  <g id="cyclist1">
    <ellipse cx="380" cy="650" rx="35" ry="6" fill="#000000" opacity="0.5" />
    <!-- Bike Wheels -->
    <circle cx="345" cy="640" r="16" fill="none" stroke="#F59E0B" stroke-width="4" />
    <circle cx="410" cy="640" r="16" fill="none" stroke="#F59E0B" stroke-width="4" />
    <!-- Bike Frame -->
    <polyline points="345,640 375,640 395,615 365,615 345,640" fill="none" stroke="#F59E0B" stroke-width="3" />
    <line x1="375" y1="640" x2="365" y2="605" stroke="#F59E0B" stroke-width="3" />
    <!-- Rider -->
    <circle cx="370" cy="580" r="8" fill="#FCD34D" />
    <path d="M 370 588 L 380 610 L 398 618" fill="none" stroke="#EAB308" stroke-width="6" stroke-linecap="round" />
    <line x1="380" y1="610" x2="375" y2="635" stroke="#1E293B" stroke-width="4" />
  </g>
</svg>`;

// 2. Aerial Drone Infrastructure SVG (1200 x 800)
const aerialSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0E7490" />
      <stop offset="50%" stop-color="#0891B2" />
      <stop offset="100%" stop-color="#06B6D4" />
    </linearGradient>
    <pattern id="solarGrid" width="24" height="14" patternUnits="userSpaceOnUse">
      <rect width="22" height="12" fill="#1E3A8A" stroke="#3B82F6" stroke-width="1.5" />
    </pattern>
    <pattern id="fieldGrid" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#14532D" />
      <line x1="0" y1="0" x2="60" y2="60" stroke="#166534" stroke-width="3" opacity="0.5" />
    </pattern>
  </defs>

  <!-- Green Rural & Industrial Ground -->
  <rect x="0" y="0" width="1200" height="800" fill="url(#fieldGrid)" />

  <!-- Meandering River / Water Body -->
  <path d="M 0 160 Q 240 280 440 210 T 800 240 T 1200 180 L 1200 420 Q 860 480 620 400 T 260 460 L 0 400 Z" fill="url(#waterGrad)" />

  <!-- Industrial Warehouse Complex 1 (White Roof with HVAC Units) -->
  <g id="bldg1">
    <rect x="80" y="520" width="280" height="190" rx="4" fill="#F1F5F9" stroke="#94A3B8" stroke-width="3" />
    <!-- HVAC Units -->
    <rect x="110" y="545" width="40" height="30" fill="#64748B" />
    <rect x="180" y="545" width="40" height="30" fill="#64748B" />
    <rect x="110" y="610" width="40" height="30" fill="#64748B" />
    <rect x="180" y="610" width="40" height="30" fill="#64748B" />
    <rect x="250" y="570" width="60" height="90" fill="#CBD5E1" stroke="#94A3B8" stroke-width="2" />
  </g>

  <!-- Industrial Warehouse 2 -->
  <g id="bldg2">
    <rect x="880" y="490" width="240" height="240" rx="4" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3" />
    <rect x="920" y="530" width="50" height="40" fill="#475569" />
    <rect x="1000" y="530" width="50" height="40" fill="#475569" />
    <rect x="940" y="620" width="120" height="60" fill="#CBD5E1" />
  </g>

  <!-- Photovoltaic Solar Farm Array -->
  <g id="solarArray">
    <rect x="520" y="520" width="280" height="210" rx="4" fill="url(#solarGrid)" stroke="#60A5FA" stroke-width="3" />
    <rect x="510" y="510" width="300" height="230" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="6,6" />
  </g>

  <!-- Concrete Highway Bridge across River -->
  <g id="bridgeOverpass">
    <rect x="680" y="100" width="80" height="380" fill="#334155" stroke="#64748B" stroke-width="3" />
    <!-- Bridge Center Line -->
    <line x1="720" y1="100" x2="720" y2="480" stroke="#F8FAFC" stroke-width="3" stroke-dasharray="20,15" />
    <!-- Pier Pillars in Water -->
    <ellipse cx="675" cy="280" rx="12" ry="24" fill="#0F172A" />
    <ellipse cx="765" cy="280" rx="12" ry="24" fill="#0F172A" />
    <!-- Cars on Bridge -->
    <rect x="692" y="180" width="16" height="32" rx="3" fill="#EF4444" />
    <rect x="732" y="320" width="18" height="36" rx="3" fill="#3B82F6" />
  </g>
</svg>`;

// 3. Retail Shelf Stock Analysis SVG (1200 x 800)
const retailSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="shelfGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1E293B" />
    </linearGradient>
    <linearGradient id="canCola" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="50%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#B91C1C" />
    </linearGradient>
    <linearGradient id="canLemon" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="50%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="glassBottle" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#047857" />
      <stop offset="40%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#065F46" />
    </linearGradient>
  </defs>

  <!-- Supermarket Background Backboard -->
  <rect x="0" y="0" width="1200" height="800" fill="#0F172A" />

  <!-- Shelf Tier 1 (Y: 200) - Cereal Boxes -->
  <rect x="40" y="210" width="1120" height="24" rx="2" fill="url(#shelfGrad)" stroke="#64748B" stroke-width="2" />
  <!-- Cereal Boxes -->
  <g id="cereals">
    <rect x="80" y="60" width="90" height="150" rx="3" fill="#8B5CF6" stroke="#C4B5FD" stroke-width="2" />
    <rect x="185" y="60" width="90" height="150" rx="3" fill="#6366F1" stroke="#A5B4FC" stroke-width="2" />
    <rect x="290" y="60" width="90" height="150" rx="3" fill="#EC4899" stroke="#FBCFE8" stroke-width="2" />
    <rect x="395" y="60" width="90" height="150" rx="3" fill="#F59E0B" stroke="#FDE68A" stroke-width="2" />
    <rect x="500" y="60" width="90" height="150" rx="3" fill="#10B981" stroke="#A7F3D0" stroke-width="2" />
  </g>
  <!-- Price Tags on Shelf 1 -->
  <g fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5">
    <rect x="100" y="212" width="50" height="20" rx="2" />
    <rect x="205" y="212" width="50" height="20" rx="2" />
    <rect x="310" y="212" width="50" height="20" rx="2" />
    <rect x="415" y="212" width="50" height="20" rx="2" />
    <rect x="520" y="212" width="50" height="20" rx="2" />
  </g>

  <!-- Shelf Tier 2 (Y: 440) - Glass Oil & Wine Bottles -->
  <rect x="40" y="450" width="1120" height="24" rx="2" fill="url(#shelfGrad)" stroke="#64748B" stroke-width="2" />
  <g id="bottles">
    <rect x="100" y="290" width="50" height="160" rx="8" fill="url(#glassBottle)" />
    <rect x="115" y="255" width="20" height="35" rx="3" fill="#065F46" />
    
    <rect x="180" y="290" width="50" height="160" rx="8" fill="url(#glassBottle)" />
    <rect x="195" y="255" width="20" height="35" rx="3" fill="#065F46" />

    <rect x="260" y="290" width="50" height="160" rx="8" fill="url(#glassBottle)" />
    <rect x="275" y="255" width="20" height="35" rx="3" fill="#065F46" />

    <!-- Out of Stock Void Gap -->
    <rect x="360" y="260" width="180" height="190" fill="#EF4444" fill-opacity="0.12" stroke="#EF4444" stroke-width="2" stroke-dasharray="6,6" />
    <text x="390" y="360" fill="#EF4444" font-family="sans-serif" font-size="16" font-weight="bold">OUT OF STOCK</text>

    <!-- Rest of Bottles -->
    <rect x="600" y="290" width="50" height="160" rx="8" fill="#0284C7" />
    <rect x="615" y="255" width="20" height="35" rx="3" fill="#0369A1" />

    <rect x="680" y="290" width="50" height="160" rx="8" fill="#0284C7" />
    <rect x="695" y="255" width="20" height="35" rx="3" fill="#0369A1" />
  </g>
  <g fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5">
    <rect x="100" y="452" width="50" height="20" rx="2" />
    <rect x="180" y="452" width="50" height="20" rx="2" />
    <rect x="260" y="452" width="50" height="20" rx="2" />
    <rect x="600" y="452" width="50" height="20" rx="2" />
  </g>

  <!-- Shelf Tier 3 (Y: 690) - Soda Cans -->
  <rect x="40" y="700" width="1120" height="24" rx="2" fill="url(#shelfGrad)" stroke="#64748B" stroke-width="2" />
  <g id="sodaCans">
    <!-- Red Cola Cans -->
    <rect x="80" y="560" width="65" height="140" rx="10" fill="url(#canCola)" stroke="#F87171" stroke-width="2" />
    <rect x="160" y="560" width="65" height="140" rx="10" fill="url(#canCola)" stroke="#F87171" stroke-width="2" />
    <rect x="240" y="560" width="65" height="140" rx="10" fill="url(#canCola)" stroke="#F87171" stroke-width="2" />

    <!-- Lemon Sparkling Cans -->
    <rect x="350" y="560" width="65" height="140" rx="10" fill="url(#canLemon)" stroke="#FCD34D" stroke-width="2" />
    <rect x="430" y="560" width="65" height="140" rx="10" fill="url(#canLemon)" stroke="#FCD34D" stroke-width="2" />
    <rect x="510" y="560" width="65" height="140" rx="10" fill="url(#canLemon)" stroke="#FCD34D" stroke-width="2" />

    <!-- Blue Energy Cans -->
    <rect x="620" y="560" width="65" height="140" rx="10" fill="#2563EB" stroke="#60A5FA" stroke-width="2" />
    <rect x="700" y="560" width="65" height="140" rx="10" fill="#2563EB" stroke="#60A5FA" stroke-width="2" />
    <rect x="780" y="560" width="65" height="140" rx="10" fill="#2563EB" stroke="#60A5FA" stroke-width="2" />
  </g>
  <g fill="#FEF08A" stroke="#CA8A04" stroke-width="1.5">
    <rect x="90" y="702" width="45" height="20" rx="2" />
    <rect x="170" y="702" width="45" height="20" rx="2" />
    <rect x="250" y="702" width="45" height="20" rx="2" />
    <rect x="360" y="702" width="45" height="20" rx="2" />
    <rect x="440" y="702" width="45" height="20" rx="2" />
  </g>
</svg>`;

// 4. Medical Microscopy Imaging SVG (1200 x 800)
const medicalSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <radialGradient id="darkfieldGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="80%" stop-color="#0F0C29" />
      <stop offset="100%" stop-color="#050515" />
    </radialGradient>
    <radialGradient id="nucleusGrad1" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#E879F9" />
      <stop offset="60%" stop-color="#A855F7" />
      <stop offset="100%" stop-color="#581C87" />
    </radialGradient>
    <radialGradient id="mitosisGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCA5A5" />
      <stop offset="40%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#7F1D1D" />
    </radialGradient>
  </defs>

  <!-- Dark-Field Slide Canvas -->
  <rect x="0" y="0" width="1200" height="800" fill="url(#darkfieldGrad)" />

  <!-- Extracellular Matrix / Cytoplasm Sheaths (Translucent Cyan/Blue) -->
  <path d="M 120 180 Q 300 80 500 220 T 900 160 T 1120 380 Q 980 620 740 560 T 260 680 T 80 440 Z" fill="#3B82F6" fill-opacity="0.16" stroke="#60A5FA" stroke-width="2" stroke-dasharray="8,6" />

  <!-- Normal Cell Nucleus 1 -->
  <ellipse cx="260" cy="320" rx="70" ry="60" fill="url(#nucleusGrad1)" stroke="#D8B4FE" stroke-width="3" />
  <circle cx="245" cy="310" r="14" fill="#3B0764" opacity="0.75" />
  <circle cx="275" cy="330" r="10" fill="#3B0764" opacity="0.6" />

  <!-- Normal Cell Nucleus 2 -->
  <ellipse cx="460" cy="420" rx="85" ry="75" fill="url(#nucleusGrad1)" stroke="#D8B4FE" stroke-width="3" />
  <circle cx="445" cy="405" r="18" fill="#3B0764" opacity="0.75" />
  <circle cx="485" cy="435" r="12" fill="#3B0764" opacity="0.6" />

  <!-- Normal Cell Nucleus 3 -->
  <ellipse cx="820" cy="300" rx="75" ry="65" fill="url(#nucleusGrad1)" stroke="#D8B4FE" stroke-width="3" />
  <circle cx="805" cy="285" r="15" fill="#3B0764" opacity="0.75" />

  <!-- Atypical Mitotic Anomaly Spindle (Dividing Cell Nucleus) -->
  <g id="mitoticFigure">
    <!-- Chromatin Spindle bridge -->
    <path d="M 620 220 Q 670 180 720 230 Q 700 290 650 280 Z" fill="url(#mitosisGrad)" stroke="#F87171" stroke-width="3" />
    <path d="M 600 320 Q 640 370 700 330 Q 680 280 620 290 Z" fill="url(#mitosisGrad)" stroke="#F87171" stroke-width="3" />
    <!-- Spindle Ray Filaments -->
    <line x1="620" y1="220" x2="600" y2="320" stroke="#FCA5A5" stroke-width="2" stroke-dasharray="4,4" />
    <line x1="720" y1="230" x2="700" y2="330" stroke="#FCA5A5" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="660" cy="275" r="6" fill="#FEE2E2" />
  </g>

  <!-- Smaller Micro-Nuclei in Stroma -->
  <ellipse cx="360" cy="580" rx="45" ry="38" fill="url(#nucleusGrad1)" stroke="#D8B4FE" stroke-width="2" />
  <ellipse cx="880" cy="540" rx="55" ry="48" fill="url(#nucleusGrad1)" stroke="#D8B4FE" stroke-width="2" />
</svg>`;

export const sampleDatasets: ImageDatasetItem[] = [
  {
    id: 'urban-traffic-01',
    title: 'Urban Traffic & Autonomous Driving Benchmark',
    category: 'Autonomous Vehicles',
    imageUrl: createSvgDataUri(urbanSvg),
    width: 1200,
    height: 750,
    defaultClasses: urbanClasses,
    guidelines: [
      'Draw tight bounding boxes along outer body frame of vehicles, excluding projected road shadows.',
      'Pedestrians must encompass body extremities, handheld baggage, and strollers.',
      'Cyclists should be classified under "Cyclist" encompassing both rider and bicycle unit.',
      'Segment lane markings along inner edge with continuous multi-point polygons.',
      'Flag occluded vehicles with Occluded toggle and specify occlusion percentage in Rationale.'
    ],
    sampleAnnotations: [
      {
        id: 'ann-u-1',
        classId: 'u-car',
        toolType: 'box',
        bbox: { x: 470, y: 410, width: 275, height: 140 },
        confidence: 98,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Autonomous test vehicle with rooftop LiDAR sensor suite clearly visible in primary lane.',
        createdAt: '2026-11-07T12:00:00Z'
      },
      {
        id: 'ann-u-2',
        classId: 'u-truck',
        toolType: 'box',
        bbox: { x: 875, y: 385, width: 205, height: 135 },
        confidence: 95,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Commercial box delivery vehicle parked near right road boundary.',
        createdAt: '2026-11-07T12:01:00Z'
      },
      {
        id: 'ann-u-3',
        classId: 'u-pedestrian',
        toolType: 'box',
        bbox: { x: 238, y: 428, width: 34, height: 96 },
        confidence: 92,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Pedestrian in pink outerwear crossing crosswalk zebra stripes.',
        createdAt: '2026-11-07T12:02:00Z'
      },
      {
        id: 'ann-u-4',
        classId: 'u-cyclist',
        toolType: 'box',
        bbox: { x: 325, y: 570, width: 110, height: 90 },
        confidence: 89,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Active commuter bicyclist in dedicated bike transit lane.',
        createdAt: '2026-11-07T12:03:00Z'
      },
      {
        id: 'ann-u-5',
        classId: 'u-trafficlight',
        toolType: 'point',
        points: [{ x: 955, y: 232 }],
        confidence: 99,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Active RED signal lamp at overhead intersection gantry.',
        createdAt: '2026-11-07T12:04:00Z'
      }
    ]
  },
  {
    id: 'aerial-drone-02',
    title: 'Aerial Drone Infrastructure Survey',
    category: 'Geospatial & Remote Sensing',
    imageUrl: createSvgDataUri(aerialSvg),
    width: 1200,
    height: 800,
    defaultClasses: aerialClasses,
    guidelines: [
      'Trace natural water body boundaries closely using Polygon Segmentation tool.',
      'Delineate industrial warehouse building perimeters along outer foundation roofline.',
      'Enclose contiguous solar photovoltaic arrays into consolidated bounding boxes or polygon segments.',
      'Mark overpass bridge pylons and deck anchor points with Keypoint markers.'
    ],
    sampleAnnotations: [
      {
        id: 'ann-a-1',
        classId: 'a-bldg',
        toolType: 'box',
        bbox: { x: 75, y: 515, width: 290, height: 200 },
        confidence: 96,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Primary distribution center warehouse with roof ventilation chillers.',
        createdAt: '2026-11-07T12:05:00Z'
      },
      {
        id: 'ann-a-2',
        classId: 'a-solar',
        toolType: 'box',
        bbox: { x: 505, y: 505, width: 310, height: 240 },
        confidence: 97,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Grid-connected solar farm photovoltaic module array.',
        createdAt: '2026-11-07T12:06:00Z'
      },
      {
        id: 'ann-a-3',
        classId: 'a-water',
        toolType: 'polygon',
        points: [
          { x: 0, y: 160 },
          { x: 240, y: 280 },
          { x: 440, y: 210 },
          { x: 800, y: 240 },
          { x: 1200, y: 180 },
          { x: 1200, y: 420 },
          { x: 860, y: 480 },
          { x: 620, y: 400 },
          { x: 260, y: 460 },
          { x: 0, y: 400 }
        ],
        isClosed: true,
        confidence: 94,
        isOccluded: false,
        isTruncated: true,
        rationale: 'Meandering river canal intersecting survey section.',
        createdAt: '2026-11-07T12:07:00Z'
      },
      {
        id: 'ann-a-4',
        classId: 'a-bridge',
        toolType: 'box',
        bbox: { x: 675, y: 95, width: 90, height: 390 },
        confidence: 98,
        isOccluded: false,
        isTruncated: true,
        rationale: 'Concrete multi-lane highway overpass crossing canal.',
        createdAt: '2026-11-07T12:08:00Z'
      }
    ]
  },
  {
    id: 'retail-shelf-03',
    title: 'Retail Shelf Stock & Inventory Analysis',
    category: 'Retail & Merchandising',
    imageUrl: createSvgDataUri(retailSvg),
    width: 1200,
    height: 800,
    defaultClasses: retailClasses,
    guidelines: [
      'Annotate each individual front-facing retail product container.',
      'Mark shelf price tags directly beneath the corresponding product facings.',
      'Bounding boxes for out-of-stock areas must span the complete empty gap between neighboring SKUs.',
      'Do not annotate items in the back row unless > 50% front-face is visible.'
    ],
    sampleAnnotations: [
      {
        id: 'ann-r-1',
        classId: 'r-can',
        toolType: 'box',
        bbox: { x: 75, y: 555, width: 75, height: 150 },
        confidence: 98,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Red cola can 330ml front facing in tier 3.',
        createdAt: '2026-11-07T12:09:00Z'
      },
      {
        id: 'ann-r-2',
        classId: 'r-bottle',
        toolType: 'box',
        bbox: { x: 95, y: 250, width: 60, height: 205 },
        confidence: 96,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Dark green olive oil glass bottle with cap.',
        createdAt: '2026-11-07T12:10:00Z'
      },
      {
        id: 'ann-r-3',
        classId: 'r-cereal',
        toolType: 'box',
        bbox: { x: 75, y: 55, width: 100, height: 160 },
        confidence: 97,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Purple breakfast cereal carton box.',
        createdAt: '2026-11-07T12:11:00Z'
      },
      {
        id: 'ann-r-4',
        classId: 'r-oos',
        toolType: 'box',
        bbox: { x: 355, y: 255, width: 190, height: 200 },
        confidence: 92,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Confirmed out-of-stock shelf void on oil shelf.',
        createdAt: '2026-11-07T12:12:00Z'
      },
      {
        id: 'ann-r-5',
        classId: 'r-price',
        toolType: 'box',
        bbox: { x: 95, y: 210, width: 60, height: 25 },
        confidence: 99,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Shelf channel price tag card.',
        createdAt: '2026-11-07T12:13:00Z'
      }
    ]
  },
  {
    id: 'medical-microscopy-04',
    title: 'Medical Fluorescence Histopathology',
    category: 'Biomedical & Pathology',
    imageUrl: createSvgDataUri(medicalSvg),
    width: 1200,
    height: 800,
    defaultClasses: medicalClasses,
    guidelines: [
      'Segment intact cell nuclei along the outer perimeter of chromatic fluorescence.',
      'Mitotic figures (atypical cell divisions) must be segmented using polygon tool with minimum 6 vertices.',
      'Place centroid keypoints at exact optical mass center of visible nuclei.',
      'Flag any cellular debris or staining artifacts with low confidence rating and clear rationale.'
    ],
    sampleAnnotations: [
      {
        id: 'ann-m-1',
        classId: 'm-nucleus',
        toolType: 'polygon',
        points: [
          { x: 190, y: 320 },
          { x: 215, y: 270 },
          { x: 260, y: 260 },
          { x: 310, y: 275 },
          { x: 330, y: 320 },
          { x: 310, y: 365 },
          { x: 260, y: 380 },
          { x: 210, y: 365 }
        ],
        isClosed: true,
        confidence: 95,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Well-delineated nuclear chromatin cluster in upper left stromal region.',
        createdAt: '2026-11-07T12:14:00Z'
      },
      {
        id: 'ann-m-2',
        classId: 'm-mitosis',
        toolType: 'box',
        bbox: { x: 590, y: 175, width: 140, height: 200 },
        confidence: 91,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Active atypical mitotic figure with multipolar chromosome spindle rays.',
        createdAt: '2026-11-07T12:15:00Z'
      },
      {
        id: 'ann-m-3',
        classId: 'm-centroid',
        toolType: 'point',
        points: [{ x: 460, y: 420 }],
        confidence: 99,
        isOccluded: false,
        isTruncated: false,
        rationale: 'Optic centroid of primary resting cell nucleus.',
        createdAt: '2026-11-07T12:16:00Z'
      }
    ]
  }
];