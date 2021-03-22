   // convert base64 to blob


const constraints = {
    // video: { width: 720, height: 360 },
    // video: { width: 768, height: 432 },
    video: { width: 1280, aspectRatio: 1920/1080 },
    
    // video: { width: { min: 1920 }, height: { min: 1080 } },
};

const cropX = 37;
const cropY = 59;
const cropWidth = 245;
const cropHeight = 20;


const captureVideoButton = document.querySelector('#start-capture-button');
const screenshotButton = document.querySelector('#screenshot-take-button');

const video = document.querySelector('#video-stream');
const canvas = document.querySelector('#mirror-canvas');

const trackIdName = document.querySelector('#trackid-name');
const trackIdCanvas = document.querySelector('#trackid-canvas');
const trackIdButton = document.querySelector('#trackid-button');
trackIdCanvas.width = cropWidth;
trackIdCanvas.height = cropHeight;

const screenshotList = document.querySelector('#screenshot-list');
const screenshotClear = document.querySelector('#screenshot-clear-button');
const screenshotUpload = document.querySelector('#screenshot-upload-button');




trackIdButton.onclick = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0,);

    trackIdCanvas.width = cropWidth;
    trackIdCanvas.height = cropHeight;
    const ctx1 = trackIdCanvas.getContext('2d');
    ctx1.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    addScreenshot('trackname', trackIdCanvas);
    const trackName = doORC(trackIdCanvas);
    console.log(trackName);
    trackIdName.value = trackName;

}


screenshotClear.onclick = () => {
    screenshotList.innerHTML = '';
}


captureVideoButton.onclick = () => {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            screenshotButton.disabled = false;
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error("ERROR: ", error)
        });
};

screenshotButton.onclick = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0,);
    addScreenshot('results', canvas);
    
    // img.src = canvas.toDataURL("image/webp");
    // img.className = 'screenshot';
};


screenshotUpload.onclick = () => {
    const scrList = screenshotList.childNodes;
    const oresult = document.getElementById('ocr_result');
    const serverName = document.getElementById('trackid-server');

    const trackInfo = {};
    trackInfo.trackName = oresult.innerHTML;
    trackInfo.server = serverName.value;
    trackInfo.time = new Date().getTime().toString();
    trackInfo.screens = [];
    
    scrList.forEach((img) => {
      const picInfo = {};
      picInfo.type = img.alt;
      picInfo.image = img.src;
      trackInfo.screens.push(picInfo);
       
    });


    // console.log(trackInfo);

  fetch('/uploadall', {
    method: 'POST', // or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(trackInfo),

  })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });


};

window.onload = () => {
  captureVideoButton.onclick();
}

function addScreenshot(type, canvas) {
    const node = document.createElement('img');
    node.src = canvas.toDataURL("image/webp");
    node.className = 'screenshot';
    if(type == 'trackname')
      node.className += 'trackname';
    node.alt = type;
    screenshotList.appendChild(node);

}


function doORC(img) {
    const ostatus = document.getElementById('ocr_status');
    const oresult = document.getElementById('ocr_result');
    // const otext;
    const { createWorker } = Tesseract;

    const worker = createWorker({
      workerPath: '../node_modules/tesseract.js/dist/worker.min.js',
      langPath: '../lang-data',
      corePath: '../node_modules/tesseract.js-core/tesseract-core.wasm.js',
      logger: (m) => {
        console.log(m);
        ostatus.innerText = m.status + '\n' + (m.progress * 100).toString().substring(0,3) + '%';
      },
      
    });

    (async () => {
      await worker.load();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const { data: { text } } = await worker.recognize(img);
      oresult.innerText = text;
      // otext = text;
      await worker.terminate();
      

      
    })();
    
}


/*

async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow', // manual, *follow, error
      referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
  
  postData('https://example.com/answer', { answer: 42 })
    .then(data => {
      console.log(data); // JSON data parsed by `data.json()` call
    });
  */


/*
    // dataURL = img.src;        
    // const fd = new FormData();
    // var blob = dataURItoBlob(dataURL);
    // fd.append("canvasImage", blob);
    // for(let i = 0; i <  )


dataURItoBlob = (dataURI) => {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}
*/