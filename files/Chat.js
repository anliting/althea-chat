(async()=>{
    let
        [
            EventEmmiter,
            Ui,
            style,
        ]=await Promise.all([
            module.repository.althea.EventEmmiter,
            module.shareImport('Chat/Ui.js'),
            module.get('Chat/style.css'),
        ]),
        blockSize=16
    function Chat(imageUploader,currentUser,target){
        EventEmmiter.call(this)
        this._imageUploader=imageUploader
        this._currentUser=currentUser
        this._target=target
        this._sendFunction=new Promise(set=>
            Object.defineProperty(this,'send',{set})
        )
        this._messages=[]
        this._getMessagesPromise={}
        this._ready={}
        this._getMessages('before').then(()=>
            setInterval(()=>this._getMessages('after'),200)
        )
    }
    Object.setPrototypeOf(Chat.prototype,EventEmmiter.prototype)
    Object.defineProperty(Chat.prototype,'_readyToRenderMessages',{get(){
        if(this._ready.renderMessages)
            return this._ready.renderMessages
        let loadNickname=u=>u.load('nickname')
        return this._ready.renderMessages=Promise.all([
            this._currentUser.then(loadNickname),
            this._target.then(loadNickname),
        ])
    }})
    Chat.prototype._getMessagesData=async function(mode){
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
    Chat.prototype._getMessages=async function(mode='after'){
        if(this._getMessagesPromise[mode])
            return
        this._getMessagesPromise[mode]=this._getMessagesData(mode)
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
        delete this._getMessagesPromise[mode]
    }
    Chat.prototype._sendMessage=async function(message){
        return this._send({
            function:   'sendMessage',
            target:     (await this._target).id,
            message,
        })
    }
    Chat.prototype._send=async function(doc){
        return(await this._sendFunction)(doc)
    }
    Chat.prototype.style=style
    Object.defineProperty(Chat.prototype,'ui',{get(){
        if(this._ui)
            return this._ui
        let ui=new Ui(this)
        ui.queryOlder=()=>this._getMessages('before')
        ui.sendMessage=m=>this._sendMessage(m)
        ui.getSetting=this.getSetting
        ui.setSetting=this.setSetting
        ui.playNotificationSound=this.playNotificationSound
        ui.imageUploader=this._imageUploader
        return this._ui=ui
    }})
    return Chat
})()
