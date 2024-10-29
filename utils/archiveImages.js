const archiver = require('archiver'); // Для створення архівів
const fs = require('fs');


// // Перевірка, чи існує папка "archive", якщо ні — створюємо її
// if (!fs.existsSync(archiveDir)) {
//     fs.mkdirSync(archiveDir);
// }



const archiveImages = async (newImagesDir, newArchivePath) => {
    try {
        if (!fs.existsSync(newImagesDir)) {
            throw new Error(`Директорія ${newImagesDir} не існує`);
        }

        const output = fs.createWriteStream(newArchivePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        return new Promise((resolve, reject) => {
            console.log('Початок архівації:', newImagesDir);

            // Обробка помилок потоку запису
            output.on('error', (err) => {
                console.error('Помилка запису архіву:', err);
                reject(err);
            });

            output.on('close', async () => {
                try {
                    console.log(`${archive.pointer()} байт записано до архіву`);
                    resolve('Archived successful');
                } catch (closeError) {
                    console.error('Помилка при завершенні архівації:', closeError);
                    reject(closeError);
                }
            });

            // Обробка помилок архіватора
            archive.on('error', (err) => {
                console.error('Помилка архівації:', err);
                output.end();
                reject(err);
            });

            archive.on('warning', (err) => {
                if (err.code === 'ENOENT') {
                    console.warn('Попередження архівації:', err);
                } else {
                    console.error('Серйозне попередження архівації:', err);
                    reject(err);
                }
            });

            archive.pipe(output);

            try {
                archive.directory(newImagesDir, false);
                archive.finalize();
            } catch (archiveError) {
                console.error('Помилка при додаванні файлів до архіву:', archiveError);
                output.end();
                reject(archiveError);
            }
        });
    } catch (error) {
        console.error('Загальна помилка архівації:', error);
        throw error;
    }
};


module.exports = { archiveImages };
