export const getSummaries = async (reports, parquet_path) => {
    return fetch(`${process.env.MODELURL}/api/callsummariser`, {
        method:"POST",
        body:JSON.stringify({reports, parquet_path}),
        headers:{
            'Content-Type': 'application/json'
        }
    })
}