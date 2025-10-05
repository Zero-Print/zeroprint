'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZPCard } from '@/components/ui/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { 
  Map, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter,
  Eye,
  EyeOff,
  Settings,
  Download
} from 'lucide-react';

interface Ward {
  id: string;
  name: string;
  population: number;
  co2Level: number;
  airQuality: number;
  greenSpace: number;
  coordinates: [number, number][];
  center: [number, number];
  metrics: {
    carbonReduction: number;
    renewableEnergy: number;
    wasteRecycling: number;
    publicTransport: number;
    citizenEngagement: number;
  };
}

interface MapLayer {
  id: string;
  name: string;
  type: 'co2' | 'air-quality' | 'green-space' | 'population' | 'engagement';
  visible: boolean;
  color: string;
}

interface InteractiveMapProps {
  wards: Ward[];
  selectedWardId?: string;
  onWardSelect: (wardId: string) => void;
  onLayerToggle?: (layerId: string) => void;
  className?: string;
}

export function InteractiveMap({ 
  wards, 
  selectedWardId, 
  onWardSelect, 
  onLayerToggle,
  className = '' 
}: InteractiveMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredWard, setHoveredWard] = useState<string | null>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'co2', name: 'CO2 Levels', type: 'co2', visible: true, color: '#ef4444' },
    { id: 'air-quality', name: 'Air Quality', type: 'air-quality', visible: false, color: '#3b82f6' },
    { id: 'green-space', name: 'Green Space', type: 'green-space', visible: false, color: '#22c55e' },
    { id: 'population', name: 'Population Density', type: 'population', visible: false, color: '#f59e0b' },
    { id: 'engagement', name: 'Citizen Engagement', type: 'engagement', visible: false, color: '#8b5cf6' }
  ]);
  const [showControls, setShowControls] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Mock GeoJSON-style coordinates for demonstration
  const generateWardPath = (ward: Ward): string => {
    const baseX = 100 + (ward.id.charCodeAt(0) % 5) * 120;
    const baseY = 100 + (ward.id.charCodeAt(1) % 4) * 100;
    
    return `M ${baseX} ${baseY} 
            L ${baseX + 80} ${baseY} 
            L ${baseX + 100} ${baseY + 60} 
            L ${baseX + 80} ${baseY + 80} 
            L ${baseX} ${baseY + 80} 
            L ${baseX - 20} ${baseY + 60} Z`;
  };

  const getWardColor = (ward: Ward): string => {
    const activeLayer = layers.find(l => l.visible);
    if (!activeLayer) return '#e5e7eb';

    let intensity = 0;
    switch (activeLayer.type) {
      case 'co2':
        intensity = Math.min(ward.co2Level / 100, 1);
        break;
      case 'air-quality':
        intensity = Math.min(ward.airQuality / 100, 1);
        break;
      case 'green-space':
        intensity = Math.min(ward.greenSpace / 100, 1);
        break;
      case 'population':
        intensity = Math.min(ward.population / 100000, 1);
        break;
      case 'engagement':
        intensity = Math.min(ward.metrics.citizenEngagement / 100, 1);
        break;
    }

    // Create gradient based on intensity
    const r = parseInt(activeLayer.color.slice(1, 3), 16);
    const g = parseInt(activeLayer.color.slice(3, 5), 16);
    const b = parseInt(activeLayer.color.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => ({
      ...layer,
      visible: layer.id === layerId ? !layer.visible : false
    })));
    onLayerToggle?.(layerId);
  };

  const exportMap = () => {
    if (svgRef.current) {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = 'ward-map.png';
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <ZPCard className={`relative overflow-hidden ${className}`}>
      <ZPCard.Header>
        <ZPCard.Title className="flex items-center gap-2">
          <Map className="h-5 w-5" />
          Interactive Ward Map
        </ZPCard.Title>
        <ZPCard.Description>
          Explore environmental data across city wards with interactive visualization layers
        </ZPCard.Description>
      </ZPCard.Header>

      <ZPCard.Body className="p-0">
        {/* Map Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 z-10 space-y-2">
            <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
              <ZPButton
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                className="w-full justify-start"
              >
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom In
              </ZPButton>
              <ZPButton
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="w-full justify-start"
              >
                <ZoomOut className="h-4 w-4 mr-2" />
                Zoom Out
              </ZPButton>
              <ZPButton
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="w-full justify-start"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset View
              </ZPButton>
              <ZPButton
                variant="ghost"
                size="sm"
                onClick={exportMap}
                className="w-full justify-start"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </ZPButton>
            </div>
          </div>
        )}

        {/* Layer Controls */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Map Layers</h4>
              <ZPButton
                variant="ghost"
                size="sm"
                onClick={() => setShowControls(!showControls)}
              >
                <Settings className="h-4 w-4" />
              </ZPButton>
            </div>
            <div className="space-y-2">
              {layers.map(layer => (
                <div key={layer.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: layer.color }}
                    />
                    <span className="text-sm">{layer.name}</span>
                  </div>
                  <ZPButton
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLayer(layer.id)}
                  >
                    {layer.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </ZPButton>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map SVG */}
        <div className="relative w-full h-96 bg-gradient-to-br from-blue-50 to-green-50">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 600 400"
            className="cursor-move"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Ward polygons */}
              {wards.map(ward => (
                <g key={ward.id}>
                  <path
                    d={generateWardPath(ward)}
                    fill={getWardColor(ward)}
                    stroke={selectedWardId === ward.id ? "#1f2937" : "#6b7280"}
                    strokeWidth={selectedWardId === ward.id ? 3 : 1}
                    className="cursor-pointer transition-all duration-200 hover:stroke-gray-900 hover:stroke-2"
                    onClick={() => onWardSelect(ward.id)}
                    onMouseEnter={() => setHoveredWard(ward.id)}
                    onMouseLeave={() => setHoveredWard(null)}
                  />
                  
                  {/* Ward labels */}
                  <text
                    x={100 + (ward.id.charCodeAt(0) % 5) * 120 + 40}
                    y={100 + (ward.id.charCodeAt(1) % 4) * 100 + 45}
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 pointer-events-none"
                  >
                    {ward.name}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Ward Info Tooltip */}
        {hoveredWard && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
            {(() => {
              const ward = wards.find(w => w.id === hoveredWard);
              if (!ward) return null;
              
              return (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{ward.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Population:</span>
                      <span className="ml-1 font-medium">{ward.population.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">CO2 Level:</span>
                      <span className="ml-1 font-medium">{ward.co2Level}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Air Quality:</span>
                      <span className="ml-1 font-medium">{ward.airQuality}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Green Space:</span>
                      <span className="ml-1 font-medium">{ward.greenSpace}%</span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <ZPButton
                      size="sm"
                      onClick={() => onWardSelect(ward.id)}
                      className="w-full"
                    >
                      View Details
                    </ZPButton>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </ZPCard.Body>

      {/* Legend */}
      <ZPCard.Footer className="bg-gray-50">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Legend:</span>
            {layers.filter(l => l.visible).map(layer => (
              <div key={layer.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: layer.color, opacity: 0.3 }}
                  />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: layer.color, opacity: 1 }}
                  />
                </div>
                <span className="text-sm text-gray-600">{layer.name}</span>
              </div>
            ))}
          </div>
          <ZPBadge variant="secondary">
            {wards.length} Wards
          </ZPBadge>
        </div>
      </ZPCard.Footer>
    </ZPCard>
  );
}

export default InteractiveMap;