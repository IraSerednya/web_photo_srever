
const FormData = require('form-data');
const { imagesDir } = require('./const');

const generatorFormData = (req) => {

    let index = -1; // Ініціалізуємо індекс -1, щоб перший виклик давав перше зображення

    const next = () => {
        index++;
        const formData = new FormData();



        if (index >= req?.files.length) {
            return {
                formData: null,  // Повертаємо null або інше значення, коли індекс за межами
                finish: true,
                index
            };
        } else {

            const file = req?.files[index];
            formData.append('processType', req?.body?.processType);
            formData.append('images', file?.buffer, { filename: file?.originalname });
            formData.append('resizeWidth', req?.body?.resizeWidth);
            formData.append('resizeHeight', req?.body?.resizeHeight);
            formData.append('rotateDegrees', req?.body?.rotateDegrees);
            formData.append('blurLevel', req?.body?.blurLevel);
            formData.append('brightnessLevel', req?.body?.brightnessLevel);
            formData.append('contrastLevel', req?.body?.contrastLevel);
            formData.append('cropWidth', req?.body?.cropWidth);
            formData.append('cropHeight', req?.body?.cropHeight);
            formData.append('name', req?.files[index]?.originalname);


            return {
                formData,
                finish: false, // Перевіряємо, чи це останнє зображення
                index
            };
        }

    };

    return next;
};

module.exports = { generatorFormData };