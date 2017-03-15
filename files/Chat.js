(async()=>{
    let
        [
            EventEmmiter,
            Ui,
        ]=await Promise.all([
            module.repository.althea.EventEmmiter,
            module.shareImport('Chat/Ui.js'),
        ]),
        blockSize=64
    function Chat(site,target){
        EventEmmiter.call(this)
        this._site=site
        this._target=target
        this._messages=[]
        this._getMessagesPromise={}
        this._getMessages('before').then(()=>{
            setInterval(()=>this._getMessages('after'),200)
        })
    }
    Object.setPrototypeOf(Chat.prototype,EventEmmiter.prototype)
    Object.defineProperty(Chat.prototype,'_currentUser',{async get(){
        let site=await this._site
        return site.currentUser
    }})
    Object.defineProperty(Chat.prototype,'readyToGetMessages',{get(){
        if(this._readyToGetMessages)
            return this._readyToGetMessages
        return this._readyToGetMessages=Promise.all([
            this._site,
            this._target,
        ])
    }})
    Object.defineProperty(Chat.prototype,'readyToRenderMessages',{get(){
        if(this._readyToRenderMessages)
            return this._readyToRenderMessages
        let loadNickname=u=>u.load('nickname')
        return this._readyToRenderMessages=Promise.all([
            this._currentUser.then(loadNickname),
            this._target.then(loadNickname),
        ])
    }})
    Chat.prototype._getMessagesData=async function(mode){
        let
            chat=this,
            [
                site,
                targetUser,
            ]=await this.readyToGetMessages
        let doc={
            function:   'getMessages',
            target:     targetUser.id,
        }
        if(mode=='before'){
            doc.after=0
            doc.before=calcBefore()
            doc.last=blockSize
        }else if(mode=='after'){
            doc.after=calcAfter()
            doc.before=0
        }
        return site.send(doc)
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
        let
            site=       await this._site,
            targetUser= await this._target
        site.send({
            function:   'sendMessage',
            target:     targetUser.id,
            message,
        })
    }
    Object.defineProperty(Chat.prototype,'ui',{get(){
        if(this._ui)
            return this._ui
        let ui=new Ui(this._site,this)
        ui.queryOlder=()=>this._getMessages('before')
        ui.sendMessage=m=>this._sendMessage(m)
        return this._ui=ui
    }})
    return Chat
})()
