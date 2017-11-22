import{dom}from                     '/lib/core.static.js'
import createChatRoom from          './goChatRoom/createChatRoom.js'
async function notification(out,chat,target){
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
    out.in({type:'interval',arguments:[updateTitle,1000]})
    chat.on('append',()=>{
        if(tabIsFocused)
            return
        if(unread==0)
            notification=1
        unread++
        this._playSound()
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
async function content(chat,target){
    chat=await chat
    let ui=chat.ui
    let out=this._setMainOut(ui.node)
    out.in({type:'style',node:dom.tn(await chat.style)})
    ui.style=s=>{
        let color={
            default:'',
            gnulinux:'black',
        }[s.id]
        let n=dom.tn(s.content+`body{background-color:${color}}`)
        out.in({type:'style',node:n})
        out.in({type:'themeColor',color})
        return()=>out.outStyle(n)
    }
    notification.call(this,out,chat,target)
    ui.focus()
}
function showChatRoom(id){
    let
        target=this._site.getUser(id),
        chatRoom=createChatRoom.call(this,target)
    content.call(this,chatRoom,target)
}
export default showChatRoom
