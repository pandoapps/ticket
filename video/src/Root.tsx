import React from 'react';
import { Composition } from 'remotion';
import { TicketeiraVideo } from './Composition';

// Total: 1110 frames @ 30fps = 37 seconds
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="TicketeiraVideo"
      component={TicketeiraVideo}
      durationInFrames={1110}
      fps={30}
      width={1280}
      height={720}
    />
  );
};
