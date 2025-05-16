import { translate } from "../services/translator.js"


export const getTranslation = async (req, res) => {
    if (!req.params.text) {
        res.json(400).json({error: "Text not provided"})
    }
    
    const text = req.params.text
    const source = req.params.source ?? null
    const target = req.params.target ?? "en"

    translate(text, source, target).then((res) => {
        res.json({
            text: res
        })
    })
}