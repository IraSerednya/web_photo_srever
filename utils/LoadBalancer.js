const { sendData } = require("./sendData")
const path = require('path');
const fs = require('fs');
const {  deleteArchive } = require('./deleteFilesInDirectory');
const { archivePath, archiveDir } = require('./const');
const { urlWorkServer, pauseSend } = require('./const');
const { ServerPorts } = require('./ServerPorts');
const { archiveFromBuffers } = require('./archiveImagesBuffer');

let flag = 0
let knacked = false
class LoadBalancer {

    static process = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    constructor({ generatorData, dataQueryId, res }, workServer, indexProcess) {
        this.generatorData = generatorData;
        this.dataQueryId = dataQueryId;
        this.res = res;
        this.idQuery = dataQueryId.id;
        this.indexProcess = indexProcess;
        this.workServer = workServer;
        this.dataQueryId.isServersTrue.push(1)
        this.#callNewServer();
    }

    async #callNewServer() {
        let { formData, index, finish } = this.generatorData.nextFormData()
        // console.log('this.linkWorkServers', this.linkWorkServers)


        while (!finish) {
            try {
                console.log('start start start start star start start start' + this.indexProcess)
                // if (flag === 3) {
                //     this.linkWorkServers[0].close(() => {
                //     })
                //     await new Promise(resolve => setTimeout(resolve, 500));

                //     console.log(`Сервер  зупинено ` + this.indexProcess);
                // }
                // await new Promise(resolve => setTimeout(resolve, 2000));

                if (urlWorkServer.url !== "http://localhost:8000") {
                    console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT')
                    await new Promise(resolve => setTimeout(resolve, pauseSend.pause));
                }

                if (this.dataQueryId.controller.signal.aborted) {
                    this.dataQueryId.download = 'cancelled';
                    break;
                }

                // const { server } = this.nextServer.next();
                // Якщо немає доступних серверів, припиняємо обробку
                console.log('server', this.workServer + " " + this.indexProcess)
                if (!this.workServer) {
                    throw new Error('No available servers');
                }
                // console.log('this.controller.aborted', this.dataQueryId.controller.signal.aborted)
                let res;
                formData.append('idProcess', this.indexProcess);
                // if (flag === 5) {
                //     knacked = true
                //     console.log(`Сервер  зупинено ` + this.indexProcess);

                //     res = await sendData(this.workServer + '45', formData, this.dataQueryId.controller, this.indexProcess)
                //     console.log(`Сервер  зупинено ` + this.indexProcess);

                // } else {
                //     console.log('11111111111111111111111111111111111111111111111111 ' + this.indexProcess)
                //     if (knacked) {
                //         console.log('********************************************************')
                //         console.log(this.workServer)
                //         console.log(formData)
                //         console.log(this.dataQueryId.controller.signal.aborted)
                //         console.log('********************************************************')
                //     }
                res = await sendData(this.workServer, formData, this.dataQueryId.controller, this.indexProcess)
                // }
                // flag++
                // console.log('222222222222222222222222222222222222222222222222222222 ' + this.indexProcess)

                if (res) {
                    // console.log('33333333333333333333333333333333333333333333333333 ' + this.indexProcess)

                    // LoadBalancer.process[this.indexProcess]++;
                    this.dataQueryId.processedImages.push({ res, name: res[0].fileName })

                    this.dataQueryId.progress += 1;
                    ({ formData, index, finish } = this.generatorData.nextFormData());
                    console.log('444444444444444444444444444444444444444444444444444444444 ' + this.indexProcess)

                } else {
                    // console.log('6666666666666666666666666666666666666666666666666666666666 ' + this.indexProcess)
                    this.generatorData.returnFormData(formData);
                    break

                    // throw new Error('ошибка отправки на сервер');
                    // console.log('this.dataQueryId.serverPorts.urlPorts', this.dataQueryId.serverPorts.urlPorts);
                    // this.nextServer.deleteErrorServer(server);
                    // continue processingLoop; // Пропустить сервер и перейти к следующему
                    // console.log('this.dataQueryId.serverPorts.urlPorts', this.dataQueryId.serverPorts.urlPorts);
                    // ({ formData, index, finish } = this.generatorData.nextFormData());
                    // continue;
                    // this.#checkServersTrue();
                    // break;
                }
                // console.log('55555555555555555555555555555555555555555555555555555555555555 ' + this.indexProcess)

            } catch (error) {
                // console.log('777777777777777777777777777777777777777777777777777777777777 ' + this.indexProcess)
                // console.log('this.dataQueryId.serverPorts.urlPorts', this.dataQueryId.serverPorts.urlPorts)
                console.log(error)
                // this.nextServer.deleteErrorServer(server);
                await new Promise(resolve => setTimeout(resolve, 1000));
                // console.log('6666666666666666666611111111111111111111111111111666666666666666 ' + this.indexProcess)
                // continue processingLoop; // Пропустить сервер и перейти к следующему
            }

        }


        // console.log('888888888888888888888888888888888888888888888888888888888888888888888 ' + this.indexProcess)

        this.#checkServersTrue()
    }

    async #checkServersTrue() {
        // console.log('999999999999999999999999999999999999999999999999999999999999999 ' + this.indexProcess)
        try {

            this.dataQueryId.isServersTrue.pop()
            // console.log('LoadBalancer.isServersTrue[this.idQuery]', this.dataQueryId.isServersTrue)
            const { finish } = this.generatorData.nextFormData()

            if (this.dataQueryId.isServersTrue.length === 0) {
                this.dataQueryId.serverPorts.returnPorts();
                this.dataQueryId.linkWorkServers.forEach(server => server.close(() => console.log(`Сервер  зупинено`)));
                this.dataQueryId.linkWorkServers.length = 0;
                if (!finish) {
                    throw new Error('Помилка обробки даних не всі файли обробленр')
                }
                console.log('ServerPorts.ports', ServerPorts.freePorts)
                // Перевіряємо існування вихідної директорії

                if (!fs.existsSync(archiveDir)) {
                    fs.mkdirSync(archiveDir);
                }

                // Перевіряємо, чи "archivePath" не є директорією
                if (fs.existsSync(archivePath) && fs.lstatSync(archivePath).isDirectory()) {
                    throw new Error(`Помилка: ${archivePath} є директорією, а не файлом.`);
                }

                const id = this.idQuery.toString();


                // this.dataQueryId.progress = this.dataQueryId.total;
                const newArchivePath = path.join(archiveDir, `${id}_images_archive.zip`);//Папка для архіва з фото
                const downloadLink = `${urlWorkServer.url}/archive/${id}_images_archive.zip`//Імя архів з фотографіями
                this.dataQueryId.processingStatus = 'archive images';
                // const downloadLink = await archiveImages(newImagesDir, newArchivePath);
                await archiveFromBuffers(this.dataQueryId.processedImages, newArchivePath);


                setTimeout(() => { deleteArchive(newArchivePath) }, 60000);
                this.dataQueryId.processingStatus = "downloading"
                this.res.json({ processedImages: this.dataQueryId.processedImages, downloadLink });

                // console.log('LoadBalancer.process', LoadBalancer.process)
                // console.log('this.dataQueryId.processedImages', this.dataQueryId.processedImages.length)
                // LoadBalancer.process = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                // console.log('url', downloadLink)
            }
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = { LoadBalancer };