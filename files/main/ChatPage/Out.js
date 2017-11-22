function Out(){
    this._status='on'
    this.set=new Set
}
Out.prototype.in=function(doc){
    this.set.add(doc)
    if(this._status=='on'&&this._forEach)
        this._forEach.in(doc)
}
Out.prototype.out=function(doc){
    this.set.delete(doc)
    if(this._status=='on'&&this._forEach)
        this._forEach.out(doc)
}
Out.prototype.on=function(){
    this._status='on'
    if(this._forEach)
        this.set.forEach(this._forEach.in)
}
Out.prototype.off=function(){
    this._status='off'
    if(this._forEach)
        this.set.forEach(this._forEach.out)
}
Out.prototype.setForEach=function(doc){
    if(this._forEach)
        this.set.forEach(this._forEach.out)
    this._forEach=doc
    this.set.forEach(this._forEach.in)
}
export default Out
