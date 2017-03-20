(async()=>{
    let[
        createChatRoom,
        mainStyle,
    ]=await Promise.all([
        module.shareImport('chatPage/createChatRoom.js'),
        module.get('chatPage/style.css'),
    ])
    let chatPage={}
    chatPage.settings={
        notificationSound:0,
    }
    chatPage.style=document.createElement('style')
    chatPage.showContacts=function(){
        document.title='Chat'
    }
    chatPage.showChatRoom=function(id){
        let
            target=getUser(id),
            chatRoom=createChatRoom(
                target,
                module.repository.althea.site,
                this.settings
            )
        notification(chatRoom,target)
        content.call(this,chatRoom)
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
    async function content(chat){
        chat=await chat
        let ui=chat.ui,node=ui.node
        this.style.appendChild(document.createTextNode(await mainStyle))
        this.style.appendChild(document.createTextNode(await chat.style))
        document.body.appendChild(node)
        ui.focus()
        ui.beAppended()
    }
    document.head.append(chatPage.style)
    return chatPage
})()
