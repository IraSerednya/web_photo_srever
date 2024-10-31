const NUMBER_FRI_PORTS = 20;
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

            if (lengthFreePort === 0) {
                throw Error('Немає вільних серверів')
            }
            //забираємо потрібну кількість портів для процесу
            const ports = ServerPorts.freePorts.splice(0, numberPorts);
            this.ports = ports
            this.length = ports.length
            console.log('getFreePorts', ServerPorts.freePorts)
        } catch (error) {
            console.log('getFreePorts', error)
        }
    }


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