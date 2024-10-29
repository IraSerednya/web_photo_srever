
//Returns the next element from the array, if the array reaches the end, move to the first element
function generateNewServer(workerServers) {
    let index = -1;

    const next = () => {
        try {

            // Спочатку збільшуємо індекс
            index++;
            // Якщо індекс більше або дорівнює кількості серверів, скидаємо його на 0
            if (index >= workerServers.length - 1) {
                index = 0;
            }

            // Повертаємо поточний сервер
            return {
                server: workerServers[index]
            };
        } catch (error) {
            console.log('generateNewServer next', error)
        }
    };

    const deleteErrorServer = (urlServer) => {
        try {

            console.log('workerServers', workerServers);
            workerServers = workerServers.filter((server) => server !== urlServer);
            console.log('workerServers', workerServers);
        } catch (error) {
            console.log('generateNewServer deleteErrorServer', error)
        }
    }

    return { next, deleteErrorServer };
}


module.exports = { generateNewServer };