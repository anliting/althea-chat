Promise.all([
    module.repository.althea.EventEmmiter,
    module.shareImport('Chat/ChatView.js'),
]).then(modules=>{
    let
        EventEmmiter=   modules[0],
        ChatView=       modules[1]
    function Chat(site,target){
        EventEmmiter.call(this)
        this.site=site
        this.target=target
        this.messages=[]
        this.getMessages()
        setInterval(()=>{
            this.getMessages()
        },200)
    }
    Object.setPrototypeOf(Chat.prototype,EventEmmiter.prototype)
    Object.defineProperty(Chat.prototype,'currentUser',{get(){
        return this.site.then(site=>site.currentUser)
    }})
    Object.defineProperty(Chat.prototype,'readyToSendMessage',{get(){
        if(this._readyToSendMessage)
            return this._readyToSendMessage
        return this._readyToSendMessage=Promise.all([
            this.site,
            this.target,
        ])
    }})
    Object.defineProperty(Chat.prototype,'readyToGetMessages',{get(){
        if(this._readyToGetMessages)
            return this._readyToGetMessages
        return this._readyToGetMessages=Promise.all([
            this.site,
            this.target,
        ])
    }})
    Object.defineProperty(Chat.prototype,'readyToRenderMessages',{get(){
        if(this._readyToRenderMessages)
            return this._readyToRenderMessages
        return this._readyToRenderMessages=Promise.all([
            this.currentUser.then(user=>user.load('nickname')),
            this.target.then(user=>user.load('nickname')),
        ])
    }})
    Chat.prototype.getMessages=function(){
        let chat=this
        if(this.getMessagesPromise)
            return
        this.getMessagesPromise=this.readyToGetMessages.then(vals=>{
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
                return chat.messages.length==0?
                    0
                :
                    chat.messages[chat.messages.length-1].id+1
            }
        }).then(res=>{
            this.emit('append',res)
            Array.prototype.push.apply(this.messages,res)
            delete this.getMessagesPromise
        })
    }
    Chat.prototype.sendMessage=function(message){
        this.readyToSendMessage.then(vals=>{
            let
                site=vals[0],
                targetUser=vals[1]
            site.send({
                function:   'sendMessage',
                target:     targetUser.id,
                message,
            })
        })
    }
    Object.defineProperty(Chat.prototype,'view',{get(){
        return new ChatView(this.site,this)
    }})
    return Chat
})
