(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    function createConversation(site,id){
        let
            user=site.getUser(id),
            tc=textContent(id)
        return{
            n:dom('div',createLink(id)),
            order:tc,
        }
        async function textContent(id){
            let u=await user
            await u.load(['username','nickname'])
            return u.nickname||u.username
        }
        async function createLink(id){
            return dom('a',async n=>{
                let u=await user
                await u.load('username')
                n.href=`chat/${u.username}`
                return tc
            })
        }
    }
    return function(){
        document.title='Conversations - Chat'
        let n=dom('div','Conversations:',{className:'conversationList'})
        ;(async()=>{
            let[order,site]=await Promise.all([
                module.repository.althea.order,
                module.repository.althea.site,
            ])
            order.post(
                (await site.send('getConversations')).map(async id=>{
                    let c=createConversation(site,id)
                    return{
                        n:c.n,
                        o:await c.order
                    }
                }),
                (a,b)=>n.insertBefore(a.n,b.n),
                e=>dom(n,e.n),
                (a,b)=>a.o.localeCompare(b.o)<0
            )
        })()
        dom(document.body,n)
    }
})()
