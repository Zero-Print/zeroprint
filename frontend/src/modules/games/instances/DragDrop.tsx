"use client";

import React, { useState } from 'react';
import DragDropGameUI from '@/components/games/DragDropGameUI';
import { DragDropGameEngine } from '@/lib/gameEngine/DragDropGameEngine';
import { GameState } from '@/types/games';

const engine = new DragDropGameEngine();

export default function DragDropInstance() {
  const [state, setState] = useState<GameState>(engine.getState());
  return (
    <DragDropGameUI gameEngine={engine} gameState={state} onStateChange={setState} />
  );
}


