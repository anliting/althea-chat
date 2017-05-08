;(async()=>{
    let
        [
            dom,
            EventEmmiter,
            ui,
            style,
            deviceSpecificStyle,
        ]=await Promise.all([
            module.repository.althea.dom,
            module.repository.althea.EventEmmiter,
            module.shareImport('Room/prototype.ui.js'),
            module.get('Room/style.css'),
            getDeviceSpecificStyle(),
        ]),
        blockSize=16
    async function getDeviceSpecificStyle(){
        let browser=await module.repository.althea.browser
        return await module.get(`Room/style.${
            browser.isMobile?'mobile':'desktop'
        }.css`)
    }
    function Room(
        createSession,
        imageUploader,
        conversationId,
        currentUser,
        target
    ){
        EventEmmiter.call(this)
        this._createSession=createSession
        this._imageUploader=imageUploader
        this._conversationId=conversationId
        this._currentUser=currentUser
        this._target=target
        this._sendFunction=new Promise(set=>
            Object.defineProperty(this,'send',{set})
        )
        this._messages=[]
        this._getMessagesPromise={}
        ;(async()=>{
            await this._getMessages('before')
            let session=this._createSession()
            session.send({
                function:       'listenMessages',
                conversation:   (await this._conversationId),
                after:          roomCalcAfter.call(this),
            })
            session.onMessage=doc=>{
                let res=doc.value
                if(this._ui)
                    this._ui.append(res)
                this._messages=this._messages.concat(res)
                if(res.length)
                    this.emit('append')
            }
        })()
    }
    Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype)
    Room.prototype._getMessagesData=async function(mode){
        let
            chat=this
        let doc={
            function:       'getMessages',
            conversation:   (await this._conversationId),
        }
        if(mode=='before'){
            doc.after=0
            doc.before=calcBefore()
            doc.last=blockSize
        }
        return this._send(doc)
        function calcBefore(){
            return chat._messages.length==0?
                0
            :
                chat._messages[0].id
        }
    }
    function roomCalcAfter(){
        return this._messages.length==0?
            0
        :
            this._messages[this._messages.length-1].id+1
    }
    Room.prototype._getMessages=async function(mode){
        if(this._getMessagesPromise[mode])
            return
        this._getMessagesPromise[mode]=this._getMessagesData(mode)
        try{
            let res=await this._getMessagesPromise[mode]
            if(res.length){
                res.sort((a,b)=>a.id-b.id)
                if(mode=='before'){
                    if(this._ui)
                        this._ui.prepend(res)
                    this._messages=res.concat(this._messages)
                }
            }
        }catch(e){}
        delete this._getMessagesPromise[mode]
    }
    Room.prototype._sendMessage=async function(message){
        return this._send({
            function:       'sendMessage',
            conversation:   (await this._conversationId),
            message,
        })
    }
    Room.prototype._send=async function(doc){
        return(await this._sendFunction)(doc)
    }
    Object.defineProperty(Room.prototype,'connectionStatus',{set(val){
        this._connectionStatus=val
        if(this._ui)
            this._ui.connectionStatus=val
    }})
    Room.prototype.style=style+deviceSpecificStyle
    Object.defineProperty(Room.prototype,'ui',ui)
    return Room
})()
