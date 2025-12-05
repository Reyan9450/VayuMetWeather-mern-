import React from 'react';
import { addHours, format } from 'date-fns';
import { Play, Pause } from 'lucide-react';

const ForecastSlider = ({ 
    currentIndex, 
    totalSteps, 
    stepHours, 
    baseTime, 
    onChange, 
    isPlaying, 
    onTogglePlay 
}) => {
    
    // Calculate the date to display above the slider
    // If baseTime is invalid, default to now.
    const start = baseTime ? new Date(baseTime) : new Date();
    const currentForecastTime = addHours(start, currentIndex * stepHours);
    const displayTime = format(currentForecastTime, 'EEE, MMM d • HH:mm');

    return (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-[1000] w-[90%] max-w-xl bg-gray-900/90 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-gray-700">
            
            {/* Header: Label and Time */}
            <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Rain Accumulation
                </span>
                <span className="text-sm font-mono font-semibold text-gray-200">
                    {displayTime} UTC
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button 
                    onClick={onTogglePlay}
                    className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg"
                >
                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                </button>

                {/* The Slider */}
                <input
                    type="range"
                    min="0"
                    max={totalSteps - 1}
                    value={currentIndex}
                    onChange={(e) => onChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                />

                {/* Hour Counter */}
                <span className="text-xs text-gray-400 font-mono whitespace-nowrap w-12 text-right">
                    +{currentIndex * stepHours}h
                </span>
            </div>
        </div>
    );
};

export default ForecastSlider;