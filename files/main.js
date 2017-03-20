let chatPage={}
chatPage.settings={
    notificationSound:0,
}
chatPage.style=document.createElement('style')
document.head.append(chatPage.style)
chatPage.playSound=function(settings){
    let n=document.createElement('audio')
    n.autoplay=true
    n.src='plugins/althea-chat/main/notification.mp3'
    n.onended=e=>document.body.removeChild(n)
    n.volume=this.settings.notificationSound
    document.body.appendChild(n)
}
chatPage.showConversationList=function(){
    document.title='Conversations - Chat'
    let n=document.createElement('div')
    n.className='conversationList'
    ;(async()=>{
        let site=await module.repository.althea.site
        let conversations=await site.send('getConversations')
        console.log(conversations)
        conversations.map(con=>{
            n.appendChild(document.createTextNode(con))
            n.appendChild(document.createTextNode(' '))
        })
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
;(async()=>{
    ;(await module.importByPath('lib/general.js',{mode:1}))(module)
    localStorage.hacker&&(async()=>{
        module.repository.althea.hacker
    })()
    module.repository.Chat=module.shareImport('Chat.js')
    let[
        createChatRoom,
        mainStyle,
    ]=await Promise.all([
        module.shareImport('main/createChatRoom.js'),
        module.get('main/style.css'),
    ])
    chatPage.showChatRoom=function(id){
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
        this.style.appendChild(document.createTextNode(await mainStyle))
        this.style.appendChild(document.createTextNode(await chat.style))
        document.body.appendChild(node)
        ui.focus()
        ui.beAppended()
    }
    module.arguments.userId==undefined?
        localStorage.hacker&&
            chatPage.showConversationList()
    :
        chatPage.showChatRoom(module.arguments.userId)
})()
