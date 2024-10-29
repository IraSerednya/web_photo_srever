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
            const passThrough = new PassThrough();
            passThrough.end(buffer.img);

            // Додаємо файл до архіву з унікальним ім'ям
            archive.append(passThrough, { name: buffer.name });
        });

        archive.finalize(); // Завершуємо архівацію
    });
};

// Використання функції
// const bufferData = Buffer.from('Це вміст файлу, який буде додано до архіву.', 'utf-8');
// const archivePath = 'path/to/archive.zip';

// archiveFromBuffer(bufferData, archivePath)
//     .then((result) => {
//         console.log('Архів успішно створено:', result);
//     })
//     .catch((error) => {
//         console.error('Помилка при створенні архіву:', error);
//     });


module.exports = { archiveFromBuffers };