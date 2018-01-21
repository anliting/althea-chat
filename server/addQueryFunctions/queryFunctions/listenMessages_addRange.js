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
    let range={
        start:  opt.start,
        end:    opt.end,
    }
    if(typeof opt.first=='number')
        range.first=opt.first
    else if(typeof opt.last=='number')
        range.last=opt.last
    sv.addListenRange(session,range)
}
