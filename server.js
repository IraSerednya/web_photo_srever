
//sdfsfd
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { AbortController } = require('node-abort-controller');
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const { generatorFormData } = require("./utils/generatorFormData");
const { generateNewServer } = require("./utils/generateNewServer");
const { CallServer } = require("./utils/CallServer");
const { archiveImages } = require("./utils/archiveImages");
const { NUMBER_IMAGE_TO_SERVER, archiveDir, pauseSend, workerServers, numberServers, urlWorkServer } = require('./utils/const');
const { deleteArchive } = require('./utils/deleteFilesInDirectory');
const { ServerPorts } = require('./utils/ServerPorts');


ServerPorts.generateFreePorts();
// const numberServers1 = Math.ceil(20 / NUMBER_IMAGE_TO_SERVER);
// const serverPorts = new ServerPorts(5);

// createServers(serverPorts.ports);
console.log('ServerPorts.ports', ServerPorts.freePorts)
// console.log('ServerPorts.ports', serverPorts.ports)

// console.log('ServerPorts.ports', serverPorts.urlPorts)



myEmitter.setMaxListeners(200); // Збільшуємо ліміт до 20

const app = express();
const port = 8000;
const dataQuery = {}


// Створимо директорію для збереження зображень, якщо вона не існує

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// console.log(workerServers)

app.use(express.json());
app.use(cors());

app.post('/upload-multiple', upload.array('images', 300), async (req, res) => {
    try {
        console.log('upload-multiple')

        if (!req.files || req.files.length === 0) {
            return res.status(400).send('Будь ласка, завантажте зображення');
        }


        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir);
        }
        const { idQuery } = req.body;
        dataQuery[idQuery].processingStatus = 'processing images';
        // console.log('req.idQuery', idQuery)

        // console.log(req.files[0])
        dataQuery[idQuery].total = req.files.length;

        const generatorData = generatorFormData(req)
        const nextServer = generateNewServer(dataQuery[idQuery].serverPorts.urlPorts)
        // Використовуємо цикл `for...of` для послідовного завантаження

        // console.log('nextFormData', nextFormData)

        CallServer.isServersTrue[idQuery] = new Array(dataQuery[idQuery].serverPorts.length).fill('1')

        const dataForCallServer = {
            generatorData,
            nextServer,
            dataQueryId: dataQuery[idQuery],
            res,
        }

        for (let i = 0; i < dataQuery[idQuery].serverPorts.length; i++) {
            new CallServer(dataForCallServer, i);
        }


    } catch (error) {
        console.log('upload-multiple ', error)
    }

});



app.post('/init', (req, res) => {
    try {

        const { idQuery, urlMainServer, numberImage, } = req.body;
        //Перевірка на правильність даних

        if (!numberImage || !idQuery || !urlMainServer) {
            res.status(400).send('неправильный, некорректный запрос.');
        }
        const numberServers = Math.ceil(numberImage / NUMBER_IMAGE_TO_SERVER);
        // console.log('numberServers', numberServers)
        const dataSend = {
            message: 'Дані проініціалізовано',
        }

        if (ServerPorts.freePorts.length > 1) {
            //якщо є вільні порти то створюємо нового клієнта
            const controller = new AbortController();
            // console.log('ServerPorts.ports', ServerPorts.freePorts);
            const serverPorts = new ServerPorts(numberServers);
            // console.log('ServerPorts.ports', ServerPorts.freePorts);
            dataSend.ports = serverPorts.ports.length;
            // console.log('serverPorts', serverPorts.ports);


            dataQuery[idQuery] = {
                controller,
                id: idQuery,
                progress: 0,
                total: 0,
                processingStatus: 'unloading',
                processedImages: [],
                serverPorts,
                flag: 0,
                linkWorkServers: [],
            }

            createServers(serverPorts.ports, idQuery);
            setTimeout(() => {
                try {
                    dataQuery[idQuery].linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));
                    dataQuery[idQuery].linkWorkServers.length = 0;
                } catch (error) {
                    console.log('abort ', error)
                }
            }, (5 * 60 * 1000));

            urlWorkServer.url = urlMainServer
        } else {
            dataSend.ports = 0;
        }


        // console.log('req.body.idQuery', idQuery, urlMainServer)
        res.json(dataSend);
    } catch (error) {
        console.log('init ', error)
    }

});


// Додайте новий ендпоінт для отримання статусу
app.post('/status', (req, res) => {
    try {
        const { idQuery } = req.body;
        // console.log('get status', idQuery)
        // console.log(dataQuery)
        res.json({
            progress: dataQuery[idQuery]?.progress,
            download: dataQuery[idQuery]?.download,
            total: dataQuery[idQuery]?.total,
            processingStatus: dataQuery[idQuery]?.processingStatus,
        });
    } catch (error) {
        console.log('status ', error)
    }
});

app.post('/killer', (req, res) => {
    let { pause } = req.body;
    if (pause > 3000) {
        pause = 3000
    }
    pauseSend.pause = parseInt(pause);
    console.log(pauseSend)
    // console.log('serverStopped')
    // dataQuery[idQuery].linkWorkServers[0].close(() => {
    //     console.log(`Сервер  зупинено`);
    // })
    // linkWorkServers[1].close(() => {
    //     console.log(`Сервер  зупинено`);
    // })
    // linkWorkServers[2].close(() => {
    //     console.log(`Сервер  зупинено`);
    // })
    res.json({
        message: 'Server stopped',
    });
});

app.post('/abort', (req, res) => {
    try {
        const { idQuery } = req.body;
        // dataQuery[idQuery].controller = controller;
        console.log('abort', idQuery)
        // console.log('abort', dataQuery[idQuery].controller.signal.aborted)
        // dataQuery[idQuery].processingStatus = 'cancelled';
        // dataQuery[idQuery].controller.abort(); // Скасовуємо всі запити
        // dataQuery[idQuery].linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));
        // dataQuery[idQuery].linkWorkServers.length = 0;
        // dataQuery[idQuery].serverPorts.returnPorts();//повертаємо порти
        // setTimeout(() => {
        //     delete dataQuery[idQuery];
        // }, 15000)

        console.log('abort', dataQuery[idQuery].controller.signal.aborted);

        res.send('Запит скасовано');
    } catch (error) {
        console.log('abort ', error)
    }
});


// app.use('/archive', express.static(path.join(__dirname, 'archive')));




// Маршрут для завантаження конкретного файлу
app.get('/archive/:file', (req, res) => {
    try {
        const filePath = path.join(archiveDir, req.params.file);
        console.log('archive/:file', req.params.file)
        // Перевіряємо, чи існує файл
        if (fs.existsSync(filePath)) {
            console.log('Завантаження архіву:', filePath);

            // Відправляємо файл на завантаження
            res.download(filePath, (err) => {
                if (err) {
                    console.error('Помилка при завантаженні файлу:', err);
                    res.status(500).send('Помилка при завантаженні файлу.');
                } else {
                    // Успішне завантаження, видаляємо файл
                    deleteArchive(filePath)
                }
            });
        } else {
            res.status(404).send('Файл не знайдено.');
        }
    } catch (error) {
        console.log('/archive/:file ', error)
    }
});


app.listen(port, () => {
    console.log(`Центральний сервер працює на http://localhost:${port}`);
});


// Функція для створення сервера 
function createServer(port, idQuery) {
    const app = express();

    // Використовуємо CORS для дозволу запитів з інших доменів
    app.use(cors());

    // Налаштування multer для завантаження файлів
    const storage = multer.memoryStorage();
    const upload = multer({ storage: storage });

    // Функція обробки зображень
    const processImages = async (req, res) => {
        // console.log('worker server worker server 111111111111111111111 ' + req.body.idProcess)
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).send('Будь ласка, завантажте зображення');
            }
            // console.log('worker server worker server 2222222222222222222222 ' + req.body.idProcess)

            const processType = req.body.processType;
            const processedImages = [];

            // console.log('worker server worker server 33333333333333333333 ' + req.body.idProcess)

            for (let i = 0; i < req.files.length; i++) {
                // console.log('worker server worker server 444444444444444444444 ' + req.body.idProcess)

                let processedImage;
                console.log(`Обробляється зображення на сервері з портом: ${port}`); // Виводимо номер порта
                switch (processType) {
                    case 'resize':
                        const width = parseInt(req.body.resizeWidth) || 300;
                        const height = parseInt(req.body.resizeHeight) || 300;
                        processedImage = await sharp(req.files[i].buffer).resize(width, height).toBuffer();
                        break;
                    case 'grayscale':
                        processedImage = await sharp(req.files[i].buffer).grayscale().toBuffer();
                        break;
                    case 'rotate':
                        const degrees = parseInt(req.body.rotateDegrees) || 90;
                        processedImage = await sharp(req.files[i].buffer).rotate(degrees).toBuffer();
                        break;
                    case 'blur':
                        const blurLevel = parseFloat(req.body.blurLevel) || 5;
                        processedImage = await sharp(req.files[i].buffer).blur(blurLevel).toBuffer();
                        break;
                    case 'brightness':
                        const brightnessLevel = parseFloat(req.body.brightnessLevel) || 1;
                        processedImage = await sharp(req.files[i].buffer).modulate({ brightness: brightnessLevel }).toBuffer();
                        break;
                    case 'contrast':
                        const contrastLevel = parseFloat(req.body.contrastLevel) || 1;
                        processedImage = await sharp(req.files[i].buffer).modulate({ contrast: contrastLevel }).toBuffer();
                        break;
                    case 'crop':
                        const cropWidth = parseInt(req.body.cropWidth) || 300;
                        const cropHeight = parseInt(req.body.cropHeight) || 300;
                        processedImage = await sharp(req.files[i].buffer).extract({ width: cropWidth, height: cropHeight, left: 0, top: 0 }).toBuffer();
                        break;
                    default:
                        return res.status(400).send('Невідомий тип обробки');
                }
                // console.log('worker server worker server 555555555555555555555 ' + req.body.idProcess)

                const imageBase64 = `data:image/jpeg;base64, ${processedImage.toString('base64')}`;
                const fileName = req.files[i].originalname;
                processedImages.push({ imageBase64, fileName });

            }

            res.json(processedImages);
        } catch (error) {
            console.log('processImages', error)

            if (req.aborted) {
                console.log('Запит було скасовано');
                res.status(499).send('Перервано користувачем');
            } else {
                res.status(500).send('Помилка під час обробки зображень');
            }
        }
        // console.log('worker server worker server 777777777777777777777 ' + req.body.idProcess)

    };

    // Роут для обробки зображень
    app.post('/process-images', upload.array('images', 200), processImages);

    // Запускаємо сервер
    const linkServer = app.listen(port, () => {
        console.log(`Оброблювальний сервер працює на http://localhost:${port}`);
    });

    dataQuery[idQuery].linkWorkServers.push(linkServer)

    app.get('/status', (req, res) => {
        console.log('get status port  ', port)
        res.json({ st: "Сервер работает" });
    });
};

// Функція для створення кількох серверів
// const createServers = (numServers, startPort) => {
//     for (let i = 0; i < numServers; i++) {
//         const port = startPort + i;
//         createServer(port);
//     }
// };

function createServers(ports, idQuery) {
    console.log('portsportsportsportsports', ports)
    ports.forEach((port) => {
        createServer(port, idQuery);
    })
};
// createServers([8106, 8107, 8108, 8109], 54654)





// Кількість серверів і стартовий порт
const startPort = 8100; // Початковий порт

// createServers(numberServers, startPort);

