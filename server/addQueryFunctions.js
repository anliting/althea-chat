let
    extendDatabase=     require('./addQueryFunctions/extendDatabase'),
    queryFunctions=     require('./addQueryFunctions/queryFunctions')
function addQueryFunctions(althea){
    let db=extendDatabase(althea.database)
    Object.entries(queryFunctions).map(([k,v])=>
        althea.addQueryFunction(k,(opt,env)=>
            v(db,opt,env)
        )
    )
}
module.exports=addQueryFunctions
