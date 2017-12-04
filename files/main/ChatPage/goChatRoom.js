import{dom}from                     '/lib/core.static.js'
import createChatRoom from          './goChatRoom/createChatRoom.js'
import DecalarativeSet from         './DecalarativeSet.js'
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
        out.in({'type':'playSound'})
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
async function content(out,chat,target){
    chat=await chat
    let ui=chat.ui
    ui.out=out
    this._setMainOut(out)
    out.in({type:'body',node:ui.node})
    out.in({type:'style',node:dom.tn(await chat.style)})
    ui.style=s=>{
        let color={
            default:'',
            gnulinux:'black',
        }[s.id]
        let
            n=dom.tn(s.content+`body{background-color:${color}}`),
            style={type:'style',node:n}
        out.in(style)
        out.in({type:'themeColor',color})
        return()=>out.out(style)
    }
    notification.call(this,out,chat,target)
    ui.focus()
}
function showChatRoom(id){
    let
        out=new DecalarativeSet,
        target=this._site.getUser(id),
        chatRoom=createChatRoom.call(this,out,target)
    content.call(this,out,chatRoom,target)
}
export default showChatRoom
