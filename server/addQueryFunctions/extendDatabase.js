let loadChatProperties=require('./extendDatabase/loadChatProperties')
module.exports=db=>{
    db=Object.create(db)
    loadChatProperties(db)
    return db
}
