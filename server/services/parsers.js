const extractJson = (raw) => {
    const jsonRegex = /\{\s*("[^"]+"\s*:\s*[^{}]+)(\s*,\s*"[^"]+"\s*:\s*[^{}]+)*\s*\}/
    let jsonSection = ""
    try {
        jsonSection = raw.match(jsonRegex)[0]
    } catch {
        console.log("JSON search failed")
        return {invalid:true}
    }
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
            !(typeof parsed.confidence === "number") || 
            !(typeof parsed.title === "string")
        ) r.valid = false
        else {
            r = {
                type: parsed.type,
                confidence: parsed.confidence,
                title: parsed.title,
                valid: true
            }
        }
        // console.log("Type decision parser validty", r)
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
        let r = {title: undefined, summary: undefined, agency: undefined, confidence: undefined, sources: undefined, urgency:undefined, recommendedSteps:undefined}
        let parsed = extractJson(res)
        if (parsed.invalid) return {valid:false}

        if (
            !(typeof parsed.title === "string") ||
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
            r = {
                ...parsed,
                valid: true
            }
        }
        return r
    },
    noParser: (res) => {
        if (res.includes("liuweiqiang")) return {valid:false}
        return res?{answer:res.replace(/^[\*\#\`]+|[\*\#\`]+$/g, ""), valid:true}:{valid:false};
    }
}