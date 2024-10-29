
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// async function sendData(workerServer, formData, controller, idProcess) {
//     try {
//         console.log('sendData', idProcess)
//         console.log('workerServer', idProcess, workerServer)

//         const response = await fetch(workerServer, {
//             method: 'POST',
//             body: formData,
//             headers: formData.getHeaders(),
//             signal: controller.signal, // Передаємо сигнал скасування
//         });

//         if (!response.ok) {
//             throw new Error('Помилка під час завантаження зображень');
//         }

//         return await response.json();
//         // processedImages.push(blobs); // Зберігаємо результат обробки

//         // Оновлюємо статус
//         // processingStatus.progress = index + 1;
//         // console.log(`Оброблено зображень: ${index + 1}/${req.files.length}`);

//     } catch (error) {
//         // if (error.name === 'AbortError') {
//         // console.log('Запит було скасовано на робочому сервері');
//         // break; // Виходимо з циклу у випадку скасування
//         // } else {
//         console.error('Сталася помилка:', error);
//         // }
//     }
// }

async function sendData(workerServer, formData, controller, idProcess) {
    try {
        // console.log(`sendData called for process ID: ${idProcess}`);
        // console.log(`Worker Server: ${workerServer} for process ID: ${idProcess}`);

        const response = await fetch(workerServer, {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders(),
            signal: controller.signal, // Передаємо сигнал скасування
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Помилка ${response.status}: ${errorText}`);
        }

        const jsonResponse = await response.json();
        return jsonResponse;

    } catch (error) {
        if (error.name === 'AbortError') {
            console.warn('Запит було скасовано на робочому сервері');
        } else {
            console.error('Сталася помилка:', error.message);
        }
    }
}


module.exports = { sendData };