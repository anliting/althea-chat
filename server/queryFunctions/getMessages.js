module.exports=(db,opt,env)=>{
    if(!(
        typeof opt.target=='number'&&
        typeof opt.after=='number'&&
        typeof opt.before=='number'&&(
            !('last' in opt)||
            typeof opt.last=='number'
        )
    ))
        return
    opt.before||(opt.before=Infinity)
    return db.getMessages(
        env.currentUser.id,
        opt.target,
        opt.after,
        opt.before,
        opt.last
    )
}
