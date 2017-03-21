(async()=>{
    let[
        createChatRoom,
        mainStyle,
    ]=await Promise.all([
        module.shareImport('createChatRoom.js'),
        module.get('style.css'),
    ])
    function ChatPage(){
        this.settings={
            notificationSound:0,
        }
        this.style=document.createElement('style')
        document.head.append(this.style)
        this.style.appendChild(document.createTextNode(mainStyle))
    }
    ChatPage.prototype.playSound=function(settings){
        let n=document.createElement('audio')
        n.autoplay=true
        n.src='plugins/althea-chat/main/notification.mp3'
        n.onended=e=>document.body.removeChild(n)
        n.volume=this.settings.notificationSound
        document.body.appendChild(n)
    }
    ChatPage.prototype.showConversationList=function(){
        document.title='Conversations - Chat'
        let n=document.createElement('div')
        n.className='conversationList'
        n.textContent='Conversations:'
        ;(async()=>{
            let site=await module.repository.althea.site
            let conversations=await site.send('getConversations')
            conversations.map(id=>
                n.appendChild(createConversation(id))
            )
            function createConversation(id){
                let n=document.createElement('div')
                ;(async()=>{
                    n.appendChild(await createLink(id))
                })()
                return n
                async function createLink(id){
                    let n=document.createElement('a')
                    let u=await site.getUser(id)
                    await u.load(['username','nickname'])
                    n.textContent=u.nickname||u.username
                    n.href=`chat/${u.username}`
                    return n
                }
            }
        })()
        document.body.appendChild(n)
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
    ChatPage.prototype.showChatRoom=function(id){
        let
            target=getUser(id),
            chatRoom=createChatRoom.call(
                this,
                target,
                module.repository.althea.site
            )
        notification.call(this,chatRoom,target)
        content.call(this,chatRoom)
        async function getUser(id){
            let site=await module.repository.althea.site
            return site.getUser(id)
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
