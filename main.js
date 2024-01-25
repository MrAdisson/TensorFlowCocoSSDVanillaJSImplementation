import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

let cameraFacingMode = 'environment';
const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

/**
 * @returns {boolean}
 * @description Check if webcam access is supported in the browser.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 */
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button for when user
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

// Enable the live webcam view and start classification.
function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) return;

  // Hide the button once clicked.
  event.target.disabled = true;

  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: {
      facingMode: cameraFacingMode,
    },
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });
}

let model = null;

cocoSsd.load().then((loadedModel) => {
  console.log('Model loaded: ', loadedModel);
  model = loadedModel;
  demosSection.classList.remove('invisible');
  enableWebcamButton.disabled = false;
  enableWebcamButton.innerText = 'Enable webcam';
});

let children = [];

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText =
          predictions[n].class + ' - with ' + Math.round(parseFloat(predictions[n].score) * 100) + '% confidence.';
        p.style =
          'margin-left: ' +
          predictions[n].bbox[0] +
          'px; margin-top: ' +
          predictions[n].bbox[1] +
          'px; width: ' +
          predictions[n].bbox[2] +
          'px; top: 0; left: 0;';
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style =
          'left: ' +
          predictions[n].bbox[0] +
          'px; top: ' +
          predictions[n].bbox[1] +
          'px; width: ' +
          predictions[n].bbox[2] +
          'px; height: ' +
          predictions[n].bbox[3] +
          'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }

    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}

// const detectFromVideoFrame = (model) => {
//   model.detect(video).then((predictions) => {
//     for (let n = 0; n < predictions.length; n++) {
//       const prediction = predictions[n];
//     }

//     requestAnimationFrame(() => detectFromVideoFrame(model));
//   });
// };
// const stopAICamera = () => {
//   webcam.srcObject.getVideoTracks().forEach((track) => track.stop());
//   webcam.removeEventListener('loadeddata', () => {
//     console.log('loadeddata');
//   });
// };

// const startAICamera = async (model, facingMode) => {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: {
//       facingMode: facingMode,
//     },
//     audio: false,
//   });
//   webcam.srcObject = stream;
//   if (!firstStart) return;
//   firstStart = false;
//   webcam.addEventListener('loadeddata', () => {
//     // cameraWidth = webcam.videoWidth;
//     // cameraHeight = webcam.videoHeight;
//     detectFromVideoFrame(model);
//   });

//   // canvas.addEventListener('click', () => {
//   //   console.log('CLICK');
//   //   stopAICamera();
//   //   if (cameraFacingMode === 'environment') {
//   //     cameraFacingMode = 'user';
//   //   } else {
//   //     cameraFacingMode = 'environment';
//   //   }
//   //   startAICamera(model, cameraFacingMode);
//   // });
// };
