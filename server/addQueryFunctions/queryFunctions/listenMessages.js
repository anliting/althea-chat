module.exports=async(sv,opt,env)=>{
    if(!(
        typeof opt.conversation=='number'&&
        typeof opt.after=='number'
    ))
        return
    if(!(await sv.userOwnConversation(
        env.currentUser,
        opt.conversation
    )))
        return
    let getting=false
    let interval=setInterval(async()=>{
        if(getting)
            return
        getting=true
        let res=await sv.getMessages(
            opt.conversation,
            opt.after,
            Infinity
        )
        getting=false
        if(1<env.wsConnection.readyState)
            return clearInterval(interval,1)
        opt.after=Math.max(opt.after,...res.map(row=>row.id+1))
        env.sendValue(res)
    },200)
}
