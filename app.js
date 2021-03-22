
// --- IMPORTS ------------------------------------------------------
const express = require('express');
const app = express();
const favicon = require('serve-favicon');
const path = require('path');

const fs = require('fs');
const multer = require('multer');

var bodyParser = require('body-parser')

app.use(favicon(path.join(__dirname,'public', 'favicon.ico')));
app.use('/public',express.static(__dirname + '/public'));
app.use('/node_modules',express.static(__dirname + '/node_modules'));
app.use('/lang-data',express.static(__dirname + '/lang-data'));

// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))


// --- WORKER -------------------------------------------------------
const { createWorker } = require('tesseract.js');
//const { resolveSoa } = require('dns');
const worker = createWorker({
    logger: m => console.log(m),
});

// --- STORAGE ------------------------------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        // cb(null, file.originalname);
        cb(null, req.body.time + '.json');
    }
});

// --- RENDER -------------------------------------------------------
const upload = multer({storage: storage}).any();
app.set('view engine', 'ejs');


// --- ROUTES -------------------------------------------------------
app.get('/', (req,res) => {
    res.render('index.ejs');
})



app.post('/uploadall', (req, res)  => {
    const result = 'OK';
    const data = req.body;

    // console.log("----------------Datareceived: ----------------\n" + data + "\n----------------");
    
    if(!data || data == undefined) {
        res.send(JSON.stringify({status:"ERROR: body is empty"}));
        return;
    }

    fs.writeFile(path.join(__dirname,'/uploads/TrackInfo_' + data.time + '_.json'), JSON.stringify(data), (err) => {
        if(err) {
            return res.send(JSON.stringify({status: "ERROR: Unable to write file", error: err}));
        }
    }); 

    return res.send(JSON.stringify({status: "OK"}));

});


/*
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        // console.log(req.file);

        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if(err) return console.log('ERROR', err);
            worker
                .recognize(data, "eng", {tessjs_create_pdf: '1'})
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.send(result.text);
                })
                .finally(() => worker.terminate());
        })
    })
});
*/




// --- SERVER STARTUP -----------------------------------------------
const PORT = 5000; // || process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}` ));










