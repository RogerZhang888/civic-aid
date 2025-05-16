import { callModel } from "./llmService.js";
import { systempromptTemplates } from "./promptbook.js";

export const translate = async (text, targetLang='ENGLISH') => {
    return callModel({
        query: text,
        prompt: systempromptTemplates.translateTemplate(targetLang),
        model: "basic"
    })
};