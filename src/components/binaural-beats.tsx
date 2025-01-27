import { useState, useEffect, useRef } from 'react';

interface Oscillators {
  left: OscillatorNode | null;
  right: OscillatorNode | null;
}

interface BrainwavePreset {
  name: string;
  frequency: number;
  description: string;
}

const brainwavePresets: BrainwavePreset[] = [
  { name: 'Delta', frequency: 2, description: '0.5-4 Hz: Deep sleep, healing, immune system' },
  { name: 'Theta', frequency: 6, description: '4-8 Hz: Meditation, intuition, memory' },
  { name: 'Alpha', frequency: 10, description: '8-12 Hz: Relaxation, focus, learning' },
  { name: 'Beta', frequency: 20, description: '12-30 Hz: Active thinking, focus, alertness' },
  { name: 'Gamma', frequency: 35, description: '30-100 Hz: Peak performance, cognition' }
];

const BinauralBeatsPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [baseFreq, setBaseFreq] = useState(440);
  const [beatFreq, setBeatFreq] = useState(10);
  const [selectedPreset, setSelectedPreset] = useState<string>('Alpha');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Oscillators>({ left: null, right: null });
  const gainNodeRef = useRef<GainNode | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }
  };

  const startOscillators = () => {
    const ctx = audioContextRef.current;
    if (!ctx || !gainNodeRef.current) return;

    oscillatorsRef.current.left = ctx.createOscillator();
    oscillatorsRef.current.right = ctx.createOscillator();

    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();

    const leftPanner = ctx.createStereoPanner();
    const rightPanner = ctx.createStereoPanner();

    leftPanner.pan.value = -1;
    rightPanner.pan.value = 1;

    if (oscillatorsRef.current.left && oscillatorsRef.current.right) {
      oscillatorsRef.current.left.connect(leftGain);
      oscillatorsRef.current.right.connect(rightGain);

      leftGain.connect(leftPanner);
      rightGain.connect(rightPanner);

      leftPanner.connect(gainNodeRef.current);
      rightPanner.connect(gainNodeRef.current);

      oscillatorsRef.current.left.frequency.value = baseFreq;
      oscillatorsRef.current.right.frequency.value = baseFreq + beatFreq;

      oscillatorsRef.current.left.start();
      oscillatorsRef.current.right.start();
    }
  };

  const stopOscillators = () => {
    if (oscillatorsRef.current.left && oscillatorsRef.current.right) {
      oscillatorsRef.current.left.stop();
      oscillatorsRef.current.right.stop();
      oscillatorsRef.current = { left: null, right: null };
    }
  };

  useEffect(() => {
    if (isPlaying) {
      initAudio();
      startOscillators();
    } else {
      stopOscillators();
    }
    return () => stopOscillators();
  }, [isPlaying]);

  useEffect(() => {
    if (oscillatorsRef.current.left && oscillatorsRef.current.right) {
      oscillatorsRef.current.left.frequency.value = baseFreq;
      oscillatorsRef.current.right.frequency.value = baseFreq + beatFreq;
    }
  }, [baseFreq, beatFreq]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const handlePresetChange = (presetName: string) => {
    const preset = brainwavePresets.find(p => p.name === presetName);
    if (preset) {
      setBeatFreq(preset.frequency);
      setSelectedPreset(presetName);
    }
  };

  // return (
  //   <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
  //     <h2 className="text-xl font-bold mb-4">Binaural Beats Generator</h2>
  //
  //     <div className="space-y-6">
  //       <div className="grid grid-cols-5 gap-2">
  //         {brainwavePresets.map((preset) => (
  //           <button
  //             key={preset.name}
  //             onClick={() => handlePresetChange(preset.name)}
  //             className={`p-2 text-sm rounded ${
  //               selectedPreset === preset.name
  //                 ? 'bg-blue-600 text-white'
  //                 : 'bg-gray-200 hover:bg-gray-300'
  //             }`}
  //           >
  //             {preset.name}
  //           </button>
  //         ))}
  //       </div>
  //
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Base Frequency: {baseFreq}Hz</label>
  //         <input
  //           type="range"
  //           min="20"
  //           max="1000"
  //           value={baseFreq}
  //           onChange={(e) => setBaseFreq(Number(e.target.value))}
  //           className="w-full"
  //         />
  //       </div>
  //
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Beat Frequency: {beatFreq}Hz</label>
  //         <input
  //           type="range"
  //           min="0.5"
  //           max="40"
  //           step="0.5"
  //           value={beatFreq}
  //           onChange={(e) => setBeatFreq(Number(e.target.value))}
  //           className="w-full"
  //         />
  //       </div>
  //
  //       <div>
  //         <label className="block text-sm font-medium mb-1">Volume: {Math.round(volume * 100)}%</label>
  //         <input
  //           type="range"
  //           min="0"
  //           max="1"
  //           step="0.01"
  //           value={volume}
  //           onChange={(e) => setVolume(Number(e.target.value))}
  //           className="w-full"
  //         />
  //       </div>
  //
  //       <button
  //         onClick={() => setIsPlaying(!isPlaying)}
  //         className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
  //       >
  //         {isPlaying ? 'Stop' : 'Start'}
  //       </button>
  //
  //       <div className="mt-6 space-y-2">
  //         <h3 className="font-semibold">Brainwave Frequencies:</h3>
  //         {brainwavePresets.map((preset) => (
  //           <div key={preset.name} className="text-sm">
  //             <span className="font-medium">{preset.name}:</span> {preset.description}
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (<div className="container">
  <h2>Binaural Beats Generator</h2>

  <div className="button-grid">
    {brainwavePresets.map((preset) => (
      <button
        key={preset.name}
        onClick={() => handlePresetChange(preset.name)}
        className={`preset-button ${selectedPreset === preset.name ? 'active' : ''}`}
      >
        {preset.name}
      </button>
    ))}
  </div>
  <div className="preset-info">
    <h3>Brainwave Frequencies:</h3>
    {brainwavePresets.map((preset) => (
      <div key={preset.name}>
        <span>{preset.name}:</span> {preset.description}
      </div>
    ))}
  </div>
  <div className="slider-container">
  <div>
    <label>Base Frequency: {baseFreq}Hz</label>
    <input type="range" min="20" max="1000" value={baseFreq} onChange={(e) => setBaseFreq(Number(e.target.value))} />
  </div>

  <div>
    <label>Beat Frequency: {beatFreq}Hz</label>
    <input type="range" min="0.5" max="40" step="0.5" value={beatFreq} onChange={(e) => setBeatFreq(Number(e.target.value))} />
  </div>

  <div>
    <label>Volume: {Math.round(volume * 100)}%</label>
    <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
  </div>
</div>

  <button
    onClick={() => setIsPlaying(!isPlaying)}
    className="play-button"
  >
    {isPlaying ? 'Stop' : 'Start'}
  </button>
</div>);
};

export default BinauralBeatsPlayer;
