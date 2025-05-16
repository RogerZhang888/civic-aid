import * as deepl from 'deepl-node';

const authKey = process.env.DEEPL_KEY;
const translator = new deepl.Translator(authKey);

export const translate = async (text, sourceLang=null, targetLang='en') => {
    const result = await translator.translateText(text, sourceLang, targetLang);
    return result
};