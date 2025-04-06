import translator from "open-google-translator";

translator.supportedLanguages();

function translate(text) {
    return new Promise((resolve, reject) => {
        translator
            .TranslateLanguageData({
                listOfWordsToTranslate: [text],
                fromLanguage: "en",
                toLanguage: "vi",
            })
            .then((data) => {
                resolve(data[0].translation);
            }).catch((err) => {
                reject(err)
            });
    });
}

export { translate };