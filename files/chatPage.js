(async()=>{
    let[
        createChatRoom
    ]=await Promise.all([
        module.shareImport('chatPage/createChatRoom.js')
    ])
    function ChatPage(){
    }
    ChatPage.prototype.showChatRoom=function(id,settings,style,mainStyle){
        let
            target=getUser(id),
            chatRoom=createChatRoom(
                target,
                module.repository.althea.site,
                settings
            )
        notification(chatRoom,target)
        content(chatRoom,style,mainStyle)
        async function getUser(id){
            let site=await module.repository.althea.site
            return site.getUser(id)
        }
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
            playSound()
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
    async function content(chat,style,mainStyle){
        chat=await chat
        let ui=chat.ui,node=ui.node
        style.appendChild(document.createTextNode(await mainStyle))
        style.appendChild(document.createTextNode(await chat.style))
        document.body.appendChild(node)
        ui.focus()
        ui.beAppended()
    }
    return new ChatPage
})()
