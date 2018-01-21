import roomAddMessagesToUi from'./roomAddMessagesToUi.js'
async function startListen(){
    let
        startListen,
        promise=new Promise(rs=>startListen=rs)
    this._session=this._createSession()
    this._session.send({
        function:       'chat_listenMessages',
        conversation:   (await this._conversationId),
    })
    this._session.onMessage=doc=>{
        if(doc.error)
            return console.error(doc.error)
        let res=doc.value
        switch(res.function){
            case'pushMessages':
                if(!res.value.length)
                    break
                res.value.sort((a,b)=>a.id-b.id)
                if(
                    !this._messages.length||
                    res.value[0].id<this._messages[0].id
                ){
                    roomAddMessagesToUi.call(this,'prepend',res.value)
                    this._messages=res.value.concat(this._messages)
                    this._gettingMessages=0
                }else{
                    roomAddMessagesToUi.call(this,'append',res.value)
                    this._messages=this._messages.concat(res.value)
                    this.emit('append')
                }
            break
            case'listenStarted':
                startListen()
            break
        }
    }
    await promise
}
export default startListen
