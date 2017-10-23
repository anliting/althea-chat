import createChatRoom from './ChatPage/createChatRoom.js'
import mainStyle from './style.js'
import showConversationList from './ChatPage/showConversationList.js'
import {dom}from '/lib/core.static.js'
function ChatPage(site){
    this._site=site
    this.settings=localStorage.altheaChatSettings?
        JSON.parse(localStorage.altheaChatSettings)
    :
        {notificationSound:0}
    dom.head(
        this.style=dom.style(mainStyle),
        this.themeColor=dom.meta({name:'theme-color'})
    )
}
ChatPage.prototype.playSound=function(settings){
    dom.body(dom.audio({
        autoplay:true,
        src:'plugins/althea-chat/main/notification-a.mp3',
        onended(e){document.body.removeChild(this)},
        volume:this.settings.notificationSound,
    }))
}
ChatPage.prototype.showConversationList=showConversationList
ChatPage.prototype.showChatRoom=function(id){
    let
        target=this._site.getUser(id),
        chatRoom=createChatRoom.call(this,target)
    notification.call(this,chatRoom,target)
    content.call(this,chatRoom)
}
ChatPage.prototype.setSetting=function(k,v){
    this.settings[k]=v
    localStorage.altheaChatSettings=JSON.stringify(this.settings)
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
        lazyChangeTitle(`${notiPart}${target.nickname}`)
        notification=1-notification
    }
    function lazyChangeTitle(s){
        document.title==s||(document.title=s)
    }
}
async function content(chat){
    chat=await chat
    let ui=chat.ui
    dom(this.style,await chat.style)
    ui.style=s=>{
        let n=dom.tn(s.content)
        dom(this.style,n)
        let color={
            default:'',
            gnulinux:'black',
        }[s.id]
        this.themeColor.content=color
        document.body.style.backgroundColor=color
        return()=>this.style.removeChild(n)
    }
    dom.body(ui.node)
    ui.focus()
}
export default ChatPage
