import createChatRoom from      './goChatRoom/createChatRoom.js'
import{DecalarativeSet}from     '../../dt.mjs'
async function notification(chat,target){
    let out=chat.ui.out
    await Promise.all([
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
function showChatRoom(id){
    let
        target=this._site.getUser(id),
        chatRoom=createChatRoom.call(this,target),
        out=new DecalarativeSet
    chatRoom.ui.out.forEach={
        in(e){
            if(
                e.type=='styleIdContent'
            ){
                let color={
                    default:'initial',
                    gnulinux:'black',
                }[e.id]
                out.in(e.style={
                    type:'style',
                    node:document.createTextNode(
                        `${e.content}body{background-color:${color}}`
                    ),
                })
                out.in(e.themeColor={type:'themeColor',color})
            }else
                out.in(e)
        },
        out(e){
            if(
                e.type=='styleIdContent'
            ){
                out.out(e.style)
                out.out(e.themeColor)
            }else
                out.out(e)
        },
    }
    notification.call(this,chatRoom,target)
    this._setMainOut(out)
    chatRoom.ui.focus()
}
export default showChatRoom
