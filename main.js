import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
let isWebcamEnabled = false;
let cameraFacingMode = 'environment';
let firstStart = true;

const webcamButton = document.getElementById('webcamButton');
const liveView = document.getElementById('liveView');
const webcam = document.getElementById('webcam');
const ctx = document.getElementById('canvas').getContext('2d');
let cameraWidth = 0;
let cameraHeight = 0;

// not display the webcam
webcam.style.display = 'none';

const detectFromVideoFrame = (model) => {
  // IF TEXTURE SIZE OxO return
  if (webcam.videoWidth === 0 || webcam.videoHeight === 0) {
    return;
  }
  const webcamElement = webcam;
  const liveViewElement = liveView;
  const videoWidth = cameraWidth;
  const videoHeight = cameraHeight;
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  liveViewElement.width = videoWidth;
  liveViewElement.height = videoHeight;
  ctx.drawImage(webcamElement, 0, 0, videoWidth, videoHeight);
  model.detect(webcamElement).then((predictions) => {
    for (let n = 0; n < predictions.length; n++) {
      const prediction = predictions[n];
      ctx.beginPath();
      ctx.lineWidth = '2';
      ctx.strokeStyle = 'green';
      ctx.fillStyle = 'black';
      ctx.font = '18px Arial';
      ctx.fillText(
        prediction.class.charAt(0).toUpperCase() +
          prediction.class.slice(1) +
          ' ' +
          Math.round(parseFloat(prediction.score) * 100) +
          '% confidence',
        prediction.bbox[0],
        prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10
      );
      ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
      ctx.fillStyle = '#10503020';
      ctx.fill();
      ctx.stroke();
    }

    requestAnimationFrame(() => detectFromVideoFrame(model));
  });
};
const stopAICamera = () => {
  webcam.srcObject.getVideoTracks().forEach((track) => track.stop());
  webcam.removeEventListener('loadeddata', () => {
    console.log('loadeddata');
  });
};

const startAICamera = async (model, facingMode) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: facingMode,
    },
    audio: false,
  });
  webcam.srcObject = stream;
  if (!firstStart) return;
  firstStart = false;
  webcam.addEventListener('loadeddata', () => {
    cameraWidth = webcam.videoWidth;
    cameraHeight = webcam.videoHeight;
    console.log('cameraWidth', cameraWidth);
    console.log('cameraHeight', cameraHeight);
    canvas.width = cameraWidth;
    canvas.height = cameraHeight;
    detectFromVideoFrame(model);
  });

  canvas.addEventListener('click', () => {
    console.log('CLICK');
    stopAICamera();
    if (cameraFacingMode === 'environment') {
      cameraFacingMode = 'user';
    } else {
      cameraFacingMode = 'environment';
    }
    startAICamera(model, cameraFacingMode);
  });
};

cocoSsd.load().then((loadedModel) => {
  console.log('Model loaded: ', loadedModel);
  // enable webcam button
  webcamButton.disabled = false;
  webcamButton.innerText = 'Enable webcam';

  webcamButton.addEventListener('click', async () => {
    if (isWebcamEnabled) return;
    isWebcamEnabled = true;
    console.log('Button clicked');
    console.log(navigator.mediaDevices);
    startAICamera(loadedModel, cameraFacingMode);
  });
});

// ON CLICK ON VIDEO, TURN CAMERA (ENVIRONMENT OR USER)
