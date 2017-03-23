(async()=>{
    let[
        dom,
    ]=await Promise.all([
        module.repository.althea.dom,
    ])
    function createConversation(site,id){
        let n=dom.div()
        let
            user=site.getUser(id),
            tc=textContent(id)
        ;(async()=>{
            n.appendChild(await createLink(id))
        })()
        return{
            n,
            order:tc,
        }
        async function textContent(id){
            let u=await user
            await u.load(['username','nickname'])
            return u.nickname||u.username
        }
        async function createLink(id){
            let n=dom.a()
            let u=await user
            await u.load('username')
            n.textContent=await tc
            n.href=`chat/${u.username}`
            return n
        }
    }
    return function(){
        document.title='Conversations - Chat'
        let n=dom.div()
        n.className='conversationList'
        n.textContent='Conversations:'
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
                e=>n.appendChild(e.n),
                (a,b)=>a.o.localeCompare(b.o)<0
            )
        })()
        document.body.appendChild(n)
    }
})()
