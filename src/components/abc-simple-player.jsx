"use strict";

import AbcNotation from "./abc-notation";
import { useState } from "react";

const AbcPlayer = ({ abcString, renderOptions, bpm = 0 }) => {
  const abcjs = require('abcjs');
  var visualObj;
  var synth;

  // TODO: Add some transposition controls (visual and/or playback using midiTranspose, etc.).  These could be passed in with props, or with added pulldown selectors.

  function ButtonGroup () {
    const [showPlay, setShowPlay] = useState(true);
    const [showStop, setShowStop] = useState(false);

    const playStyle = showPlay ? {} : {'display':'none'};
    const stopStyle = showStop ? {} : {'display':'none'};

    const handlePlayEnded = () => {
      setShowPlay(true);
      setShowStop(false);
    }

    const handlePlayClick = () => {
      console.log('synth = ', synth);
      if (typeof synth === 'undefined') {
        console.time('CreateSynth');
        synth = new abcjs.synth.CreateSynth();
        console.timeEnd('CreateSynth');
      }

      const beatsPerMeasure = visualObj.getBeatsPerMeasure();
      const qBpm = visualObj.getBpm();    // 180 or whatever the Q: statement set for beats/min
      let millisecondsPerMeasure = visualObj.millisecondsPerMeasure();
      // Allow prop to override if the music has the default of 180 (so probably no Q: setting)
      if (bpm > 0 && qBpm === 180) {
        millisecondsPerMeasure = 1000 * (60 / bpm) * visualObj.getBeatsPerMeasure()
      }
      console.log('ms/meas = ', millisecondsPerMeasure, ' bpm = ', bpm);
    
      synth.init({
        // audioContext: myContext,
        visualObj: visualObj,
        millisecondsPerMeasure: millisecondsPerMeasure,
        options: {
          // soundFontUrl: '',     // replace the default?
          // pan: [-0.3, 0.3],     // for panning voices left/right
          onEnded: handlePlayEnded,
          midiTranspose: 0,
        }
      }).then(function (response){
        console.log('Notes loaded: ', response);
        return synth.prime();
      }).then(function (response){
        console.log('Synth primed:', response.status);
        synth.start();
        setShowPlay(false);
        setShowStop(true);
        return Promise.resolve();
      }).catch(function (error){
        if (error.status === 'NotSupported') {
          console.warn('Synth audio not supported');
          setShowPlay(false);
          setShowStop(false);
        } else {
          console.warn('Synth error: ', error);
        }
      });
    }
  
    const handleStopClick = () => {
      if (synth) {
        synth.stop();
        setShowPlay(true);
        setShowStop(false);
      }
    }
  
      return (
      <div>
        <button onClick={handlePlayClick} style={playStyle}>Play</button>
        <button onClick={handleStopClick} style={stopStyle}>Stop</button>
      </div>    
    );
  }  

  const handleRender = ( renderedObj ) => {
    visualObj = renderedObj[0];
    console.log(visualObj);
  }

  return (
    <div>
      <AbcNotation abcString={abcString} options={renderOptions} onRender={handleRender} />
      <ButtonGroup />
    </div>
  );
}

export default AbcPlayer;
