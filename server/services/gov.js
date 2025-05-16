exports.parsePermissios = (permissionsList) => {
    let res = []
    for (let permission of permissionsList) {
        let parsedPerms = permission.split("-")
        if (parsedPerms.length !== 2) continue

        res.push({
            agency: parsedPerms[0],
            role: parsedPerms[1],
        })
    }
    return res;
}