let
    edges=              require('./updateDatabase/edges')
async function updateDatabase(althea){
    let ver=await getDbVer(althea)
    while(ver in edges)
        ver=await edges[ver](althea.database)
    setDbVer(althea,ver)
}
async function getData(althea){
    let data=await althea.getData()
    return data?JSON.parse(data):{}
}
async function getDbVer(althea){
    return(await getData(althea)).databaseVersion||0
}
async function setDbVer(althea,ver){
    let data=await getData(althea)
    data.databaseVersion=ver
    await althea.setData(data)
}
module.exports=updateDatabase
