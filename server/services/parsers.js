const extractJson = (raw) => {
    const jsonRegex = /\{\s*("[^"]+"\s*:\s*[^{}]+)(\s*,\s*"[^"]+"\s*:\s*[^{}]+)*\s*\}/
    let jsonSection = raw.match(jsonRegex)[0]
    let obj = {}
    try {
        obj = JSON.parse(jsonSection)
    } catch {
        console.log("Invalid JSON parse", jsonSection)
        return {invalid:true}
    }
    return obj
}

export const responseParsers = {
    typeDecisionParser: (res) => {
        // QUESTION, REPORT + CONFIDENCE, VALID
        let r = {type: undefined, valid: undefined, confidence: undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (
            !(parsed.type === "report" || parsed.type === "question") || 
            !(typeof parsed.confidence === "number")
        ) r.valid = false
        else {
            r = {
                type: parsed.type,
                confidence: parsed.confidence,
                valid: true
            }
        }
        console.log("Type decision parser validty", r)
        return r
    },
    defaultParser: (res) => {
        // Just standard answer + confidence parser
        let r = {answer: undefined, valid: undefined, confidence: undefined, sources: undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (
            !(typeof parsed.answer === "string") || 
            !(typeof parsed.confidence === "number") || 
            !(
                Array.isArray(parsed.sources) && 
                (parsed.sources.length === 0 || typeof parsed.sources[0] === "string")
            )
        ) r.valid = false
        else {
            r = {
                answer: parsed.answer,
                confidence: parsed.confidence,
                sources: parsed.sources,
                valid: true
            }
        }

        return r
    },
    reportParser: (res) => {
        // For reports
        let r = {summary: undefined, agency: undefined, confidence: undefined, sources: undefined, urgency:undefined, recommendedSteps:undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (
            !(typeof parsed.summary === "string") ||
            !(typeof parsed.agency === "string") ||
            !(typeof parsed.confidence === "number") ||
            !(
                Array.isArray(parsed.sources) && 
                (parsed.sources.length === 0 || typeof parsed.sources[0] === "string")
            ) ||
            !(typeof parsed.urgency === "number") ||
            !(typeof parsed.recommendedSteps === "string")
        ) r.valid = false
        else {
            r = parsed
            r.valid = true
        }
        return r
    },
    noParser: (res) => {
        return {answer:res, valid:true};
    }
}