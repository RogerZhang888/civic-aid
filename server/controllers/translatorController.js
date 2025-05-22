import { translate } from "../services/translator.js"

export const getTranslation = async (req, res) => {
    if (!req.body.text) {
        res.status(400).json({error: "Text not provided"})
        return;
    }
    
    const text = req.body.text
    const target = req.body.target ?? "ENGLISH"
    // TARGET - 'ENGLISH', 'CHINESE', 'MALAY', 'TAMIL'

    const allowedTargets = [
        'ENGLISH',
        'CHINESE',
        'MALAY',
        'TAMIL'
    ]
    if (!allowedTargets.includes(target)) {
        res.status(400).json({error: `Invalid target language: ${target}`})
        return;
    }

    translate(text, target).then((r) => {
        res.json({
            text: r
        })
    })
}