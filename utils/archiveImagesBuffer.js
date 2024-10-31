const archiver = require('archiver');
const { PassThrough } = require('stream');
const fs = require('fs');

// Функція для створення архіву з буфера

const archiveFromBuffers = async (buffers, archivePath) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(archivePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Високий рівень стиснення
        });

        // Обробка помилок
        output.on('error', (err) => {
            console.error('Помилка запису архіву:', err);
            reject(err);
        });

        output.on('close', () => {
            console.log(`${archive.pointer()} байт записано до архіву`);
            resolve(archivePath);
        });

        archive.on('error', (err) => {
            console.error('Помилка архівації:', err);
            reject(err);
        });

        // Підключаємо архів до виходу
        archive.pipe(output);

        // Додаємо кожен буфер з масиву до архіву з унікальним ім'ям
        buffers.forEach((buffer, index) => {
            const base64Data = buffer.res[0].imageBase64.replace(/^data:image\/jpeg;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');
            const passThrough = new PassThrough();
            passThrough.end(imageBuffer);

            // Додаємо файл до архіву з унікальним ім'ям
            archive.append(passThrough, { name: buffer.name });
        });

        archive.finalize(); // Завершуємо архівацію
    });
};


module.exports = { archiveFromBuffers };