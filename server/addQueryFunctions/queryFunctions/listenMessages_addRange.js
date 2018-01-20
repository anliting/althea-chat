module.exports=async(sv,opt,session)=>{
    if(!(
        typeof opt.start=='string'&&
        typeof(opt.start=+opt.start)=='number'&&
        opt.start==opt.start&&
        typeof opt.end=='string'&&
        typeof(opt.end=+opt.end)=='number'&&
        opt.end==opt.end&&
        sv.hasListenOn(session)
    ))
        return
    sv.addListenRange(session,{
        start:  opt.start,
        end:    opt.end,
    })
}
