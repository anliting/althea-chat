module.exports=newMessage
function newMessage(fromUser,toUser,message){
    return this.query(`
        insert into message set ?
    `,{
        fromUser,
        toUser,
        message
    }).then(a=>a[0].insertId)
}
