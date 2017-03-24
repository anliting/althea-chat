(async()=>{
    let[
        createChatRoom,
        mainStyle,
        showConversationList,
        dom,
    ]=await Promise.all([
        module.shareImport('createChatRoom.js'),
        module.get('style.css'),
        module.shareImport('showConversationList.js'),
        module.repository.althea.dom,
    ])
    function ChatPage(){
        this.settings={
            notificationSound:0,
        }
        this.style=dom.style()
        document.head.append(this.style)
        this.style.appendChild(document.createTextNode(mainStyle))
    }
    ChatPage.prototype.playSound=function(settings){
        document.body.appendChild(dom.audio(n=>{
            n.autoplay=true
            n.src='plugins/althea-chat/main/notification.mp3'
            n.onended=e=>document.body.removeChild(n)
            n.volume=this.settings.notificationSound
        }))
    }
    ChatPage.prototype.showConversationList=showConversationList
    ChatPage.prototype.showChatRoom=function(id){
        let
            target=getUser(id),
            chatRoom=createChatRoom.call(
                this,
                target,
                module.repository.althea.site
            )
        style.call(this,chatRoom)
        notification.call(this,chatRoom,target)
        content.call(this,chatRoom)
        async function getUser(id){
            let site=await module.repository.althea.site
            return site.getUser(id)
        }
    }
    ChatPage.prototype.setSetting=function(k,v){
        this.settings[k]=v
        if(k=='colorScheme'){
            if(this.colorScheme)
                this.style.removeChild(this.colorScheme)
            this.colorScheme=document.createTextNode(v.style)
            this.style.appendChild(this.colorScheme)
            if(v.name=='Default'){
                document.body.style.backgroundColor=''
            }else if(v.name=='GNU/Linux'){
                document.body.style.backgroundColor='black'
            }
        }
    }
    async function style(chatRoom){
        chatRoom=await chatRoom
    }
    async function notification(chat,target){
        await Promise.all([
            (async()=>{
                chat=await chat
            })(),
            (async()=>{
                target=await target
                await target.load('nickname')
            })(),
        ])
        let
            tabIsFocused=true,
            notification=0,
            unread=0
        updateTitle()
        setInterval(updateTitle,1000)
        chat.on('append',()=>{
            if(tabIsFocused)
                return
            if(unread==0)
                notification=1
            unread++
            this.playSound()
        })
        addEventListener('focusin',e=>{
            tabIsFocused=true
            unread=0
        })
        addEventListener('focusout',e=>{
            tabIsFocused=false
        })
        function updateTitle(){
            let notiPart=unread==0?'':`${'◯⬤'[notification]} (${unread}) `
            document.title=`${notiPart}↔ ${target.nickname}`
            notification=1-notification
        }
    }
    async function content(chat){
        chat=await chat
        let ui=chat.ui,node=ui.node
        this.style.appendChild(document.createTextNode(await chat.style))
        document.body.appendChild(node)
        ui.focus()
        ui.beAppended()
    }
    return new ChatPage
})()
