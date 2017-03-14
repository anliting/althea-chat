(async()=>{
    let[
        EventEmmiter,
        Ui,
    ]=await Promise.all([
        module.repository.althea.EventEmmiter,
        module.shareImport('Chat/Ui.js'),
    ])
    function Chat(site,target){
        EventEmmiter.call(this)
        this._site=site
        this._target=target
        this._messages=[]
        this.getMessages()
        setInterval(this.getMessages.bind(this),200)
    }
    Object.setPrototypeOf(Chat.prototype,EventEmmiter.prototype)
    Object.defineProperty(Chat.prototype,'currentUser',{async get(){
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
            this.currentUser.then(loadNickname),
            this._target.then(loadNickname),
        ])
    }})
    Chat.prototype._getMessages=async function(){
        let chat=this
        let vals=await this.readyToGetMessages
        let
            site=vals[0],
            targetUser=vals[1]
        return site.send({
            function:   'getMessages',
            target:     targetUser.id,
            after:      calcAfter(),
            before:     0
        })
        function calcAfter(){
            return chat._messages.length==0?
                0
            :
                chat._messages[chat._messages.length-1].id+1
        }
    }
    Chat.prototype.getMessages=async function(){
        if(this._getMessagesPromise)
            return
        this._getMessagesPromise=this._getMessages()
        let res=await this._getMessagesPromise
        this.emit('append',res)
        Array.prototype.push.apply(this._messages,res)
        delete this._getMessagesPromise
    }
    Chat.prototype.sendMessage=async function(message){
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
        let ui=new Ui(this._site,this)
        this.on('append',messages=>
            ui.append(messages)
        )
        return ui
    }})
    return Chat
})()
