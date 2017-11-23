import{dom,order}from '/lib/core.static.js'
import DecalarativeSet from       './DecalarativeSet.js'
function createConversation(chatPage,site,id){
    let
        user=site.getUser(id),
        tc=textContent()
    return{
        n:dom.div(createLink()),
        order:tc,
    }
    async function textContent(){
        let u=await user
        await u.load(['username','nickname'])
        return u.nickname||u.username
    }
    async function createLink(){
        return dom.a(async n=>{
            let u=await user
            await u.load('username')
            n.href=`chat/${u.username}`
            n.onclick=e=>{
                if(
                    e.altKey||
                    e.ctrlKey||
                    e.metaKey||
                    e.shiftKey||
                    e.button!=0
                )
                    return
                e.preventDefault()
                e.stopPropagation()
                chatPage.goChatRoom(id)
            }
            return tc
        })
    }
}
export default function(){
    document.title='Conversations - Chat'
    let out=new DecalarativeSet
    this._setMainOut(out)
    out.in({type:'body',node:dom.div(
        {className:'conversationList'},
        'Conversations:',
        async n=>{
            order.post(
                (await this._site.send('getConversations')).map(async id=>{
                    let c=createConversation(this,this._site,id)
                    return{
                        n:c.n,
                        o:await c.order
                    }
                }),
                (a,b)=>n.insertBefore(a.n,b.n),
                e=>dom(n,e.n),
                (a,b)=>a.o.localeCompare(b.o)<0
            )
        }
    )})
}
