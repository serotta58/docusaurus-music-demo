"use strict";

import { useEffect } from 'react';

let seqNo = 0;

const AbcNotation = ({ abcString, options, onRender }) => {
  const abcjs = require('abcjs');
  const targetId = "paper" + seqNo++;
  let visObj;

  const handleRenderedObj = () => {
    // Pass the rendered object back to the parent for possible use,
    // such as creating audio to play
    onRender && onRender(visObj);
  }

  // Note that useEffect only fires in the browser, so this prevents calling
  // renderAbc on the server or build where it would fail due to the lack of
  // the browser window and document that it requires.
  useEffect(() => {
    console.time('Render ABC');     // Record and show how long this takes
    visObj = abcjs.renderAbc(targetId, abcString, options);
    console.timeEnd('Render ABC');
    handleRenderedObj(visObj);
  });

  return (
    <div id={targetId}></div>
  );
}

export default AbcNotation;
