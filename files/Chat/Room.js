(async()=>{
    let
        [
            EventEmmiter,
            Ui,
            style,
        ]=await Promise.all([
            module.repository.althea.EventEmmiter,
            module.shareImport('Room/Ui.js'),
            module.get('Room/style.css'),
        ]),
        blockSize=16
    function Room(imageUploader,currentUser,target){
        EventEmmiter.call(this)
        this._imageUploader=imageUploader
        this._currentUser=currentUser
        this._target=target
        this._sendFunction=new Promise(set=>
            Object.defineProperty(this,'send',{set})
        )
        this._messages=[]
        this._getMessagesPromise={}
        ;(async()=>{
            await this._getMessages('before')
            setInterval(()=>this._getMessages('after'),200)
        })()
    }
    Object.setPrototypeOf(Room.prototype,EventEmmiter.prototype)
    Room.prototype._getMessagesData=async function(mode){
        let
            chat=this
        let doc={
            function:   'getMessages',
            target:     (await this._target).id,
        }
        if(mode=='before'){
            doc.after=0
            doc.before=calcBefore()
            doc.last=blockSize
        }else if(mode=='after'){
            doc.after=calcAfter()
            doc.before=0
        }
        return this._send(doc)
        function calcBefore(){
            return chat._messages.length==0?
                0
            :
                chat._messages[0].id
        }
        function calcAfter(){
            return chat._messages.length==0?
                0
            :
                chat._messages[chat._messages.length-1].id+1
        }
    }
    Room.prototype._getMessages=async function(mode='after'){
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
                }else if(mode=='after'){
                    if(this._ui)
                        this._ui.append(res)
                    this._messages=this._messages.concat(res)
                    if(res.length)
                        this.emit('append')
                }
            }
        }catch(e){}
        delete this._getMessagesPromise[mode]
    }
    Room.prototype._sendMessage=async function(message){
        return this._send({
            function:   'sendMessage',
            target:     (await this._target).id,
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
    Room.prototype.style=style
    Object.defineProperty(Room.prototype,'ui',{get(){
        if(this._ui)
            return this._ui
        let ui=new Ui(
            this._currentUser,
            this._target
        )
        ui.queryOlder=()=>this._getMessages('before')
        ui.sendMessage=m=>this._sendMessage(m)
        ui.getSetting=this.getSetting
        ui.setSetting=this.setSetting
        ui.playNotificationSound=this.playNotificationSound
        ui.imageUploader=this._imageUploader
        ui.connectionStatus=this._connectionStatus
        return this._ui=ui
    }})
    return Room
})()