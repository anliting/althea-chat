import{doe,order}from '/lib/core.static.js'
import{DecalarativeSet}from'../../dt.mjs'
async function createConversation(chatPage,site,id){
    let
        user=site.getUser(id),
        tc=textContent()
    return{
        n:doe.div(await createLink()),
        order:tc,
    }
    async function textContent(){
        let u=await user
        await u.load(['username','nickname'])
        return u.nickname||u.username
    }
    async function createLink(){
        return doe.a(async n=>{
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
        },await tc)
    }
}
export default function(){
    document.title='Conversations - Chat'
    let out=new DecalarativeSet
    this._setMainOut(out)
    out.in({type:'body',node:doe.div(
        {className:'conversationList'},
        'Conversations:',
        async n=>{
            order.post(
                (await this._site.send('chat_getConversations')).map(async id=>{
                    let c=await createConversation(this,this._site,id)
                    return{
                        n:c.n,
                        o:await c.order
                    }
                }),
                (a,b)=>n.insertBefore(a.n,b.n),
                e=>doe(n,e.n),
                (a,b)=>a.o.localeCompare(b.o)<0
            )
        }
    )})
}
