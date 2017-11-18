import{dom,order}from '/lib/core.static.js'
function createConversation(site,id){
    let
        user=site.getUser(id),
        tc=textContent(id)
    return{
        n:dom.div(createLink(id)),
        order:tc,
    }
    async function textContent(id){
        let u=await user
        await u.load(['username','nickname'])
        return u.nickname||u.username
    }
    async function createLink(id){
        return dom.a(async n=>{
            let u=await user
            await u.load('username')
            n.href=`chat/${u.username}`
            return tc
        })
    }
}
export default function(){
    document.title='Conversations - Chat'
    dom.body(dom.div(
        {className:'conversationList'},
        'Conversations:',
        async n=>{
            order.post(
                (await this._site.send('getConversations')).map(async id=>{
                    let c=createConversation(this._site,id)
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
    ))
}
