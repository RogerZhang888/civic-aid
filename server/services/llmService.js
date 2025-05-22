const debug = false

/**
 * Calls the Python model using CLI and returns the output.
 * Assumes the Python script exposes a callable entrypoint like: use_model(query, query_type, image_path)
 */
export const callModel = async ({ query, prompt, model, imagePath = null }) => {
    const temporaryResponse = {
        typeDecision:`\`\`\`json
{
    "type": "report",
    "confidence": 0.9,
    "title": "Sample Title"
}
\`\`\``,
        typeDecisionlowconf:`\`\`\`json
{
    "type": "report",
    "confidence": 0.7,
    "title": "Sample Title"
}
\`\`\``,
        clarifytype:"Could you clarify if you're reporting a fire hydrant flooding incident or asking a question about it? This will help me assist you better.",
        report:`\`\`\`json
{
    "summary": "Test change. The user reported a burst fire hydrant along Lim Chu Kang road, just outside Sungei Gedong camp, causing significant flooding in the area.",
    "confidence": 0.9,
    "urgency": 0.9,
    "recommendedSteps": "Dispatch a team to inspect and repair the burst fire hydrant immediately to prevent further flooding and water wastage. Consider traffic management if the flooding affects road access.",
    "agency": "Public Utilities Board",
    "sources": [
        "https://www.pub.gov.sg/",
        "https://www.scdf.gov.sg/home/fire-safety/fire-hydrant-system"
    ]
}
\`\`\``,
        clarifyreportlow:"Thank you for reporting the burst fire hydrant near Lim Chu Kang Road. To better assist, could you confirm the exact landmark or address, the severity of flooding (e.g., ankle-deep, road impassable), and whether there are any immediate safety concerns? This will help escalate your report more effectively.",
        clarifyreportmed:"Thank you for reporting the burst fire hydrant near Lim Chu Kang Road. To better assist, could you confirm the exact landmark or address, the severity of flooding (e.g., ankle-deep, road impassable), and whether there are any immediate safety concerns? This will help escalate your report more effectively.",
        question:`\`\`\`json
{
    "answer": "If you are experiencing or inquiring about an MRT breakdown, you can check real-time updates on train service status via the SMRT or SBS Transit websites, or the MyTransport app. For alternative transport arrangements during disruptions, LTA may activate free bus bridging services. You can also follow official social media channels for live updates. If you need assistance, you may contact the respective transport operators: SMRT (1800-336-8900) or SBS Transit (1800-287-2727).",
    "confidence": 0.9,
    "sources": [
        "https://www.smrt.com.sg/",
        "https://www.sbstransit.com.sg/",
        "https://www.mytransport.sg/",
        "https://www.lta.gov.sg/"
    ]
}
\`\`\``,
        clarifyquestionlow:"Ask question boi",
        clarifyquestionmed:"Ask question boi 2",
    }
    const responseByCode = [
        temporaryResponse.typeDecision,
        temporaryResponse.clarifytype,
        temporaryResponse.report,
        temporaryResponse.clarifyreportlow,
        temporaryResponse.clarifyreportmed,
        temporaryResponse.question,
        temporaryResponse.clarifyquestionlow,
        temporaryResponse.clarifyquestionmed
    ]
    // const temporaryResponse = `{\"type\":\"question\", \"confidence\":\"${Math.random()}\", \"answer\":\"This is my very good answer\", \"sources\":[\"loremipsumdolorsitamet\"]}`
    // TEMPORARY CODE FOR TESTING
    if (debug) return new Promise((res, rej) => {
        res(responseByCode[prompt[0]])
    })

    console.log(`CALLING MODEL [${model}] WITH API for query ${query}`)
    return fetch(`${process.env.MODELURL}/api/callmodel`, {
        method:"POST",
        body:JSON.stringify({query, prompt, model, filepath: imagePath}),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        return res.json()
    }).then((res) => {
        if (res.used_rag) console.log("!! RAG USED !!")
        return res.answer
    })
};
