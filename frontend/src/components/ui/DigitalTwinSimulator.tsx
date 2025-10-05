import React from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';

interface DigitalTwinSimulatorProps {
  cityData?: any;
  onSimulate?: (params: {type: string}) => void;
}

export const DigitalTwinSimulator: React.FC<DigitalTwinSimulatorProps> = ({ cityData, onSimulate }) => (
  <ZPCard>
    <ZPCard.Header><ZPCard.Title>Digital Twin Simulator</ZPCard.Title></ZPCard.Header>
    <ZPCard.Body>
      <div className="grid grid-cols-2 gap-4">
        <ZPButton onClick={() => onSimulate?.({type: 'add_solar'})}>Add Solar Panels</ZPButton>
        <ZPButton onClick={() => onSimulate?.({type: 'plant_trees'})}>Plant Trees</ZPButton>
      </div>
    </ZPCard.Body>
  </ZPCard>
);

export default DigitalTwinSimulator;