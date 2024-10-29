const NUMBER_FRI_PORTS = 200;
const START_PORTS = 8100;

class ServerPorts {
    static freePorts = [];
    static errorPorts = [];

    constructor(numberPorts) {
        this.numberPorts = numberPorts;
        this.getFreePorts(numberPorts)
    }

    getFreePorts(numberPorts) {
        try {

            const lengthFreePort = ServerPorts.freePorts.length;
            const ports = ServerPorts.freePorts.splice(0, numberPorts);

            if (ports.length === 0) {
                throw Error('Немає вільних серверів')
            }

            if (ServerPorts.freePorts.length === 0 && ports.length < lengthFreePort) {
                console.log('Не вдалося виділити бажану кількість серверів.')
            }

            this.ports = ports
            this.length = ports.length
            this.urlPorts = ports.map((port) => `http://localhost:${port}/process-images`)
            console.log('getFreePorts', ServerPorts.freePorts)
        } catch (error) {
            console.log('getFreePorts', error)
        }
    }

    // getUrlPorts(ports) {
    //     const urlPorts = ports.map((port) => `http://localhost:${port}/process-images`)
    //     console.log('getUrlPorts', this.urlPorts)
    //     return urlPorts
    // }

    returnPorts() {
        try {

            ServerPorts.freePorts.push(...this.ports)
            console.log("returnPorts", ServerPorts.freePorts)
        } catch (error) {
            console.log('returnPorts', error)
        }
    }

    static generateFreePorts() {
        ServerPorts.freePorts = Array.from({ length: NUMBER_FRI_PORTS }).map((_, i) => (START_PORTS + i))
    }

}

module.exports = { ServerPorts };