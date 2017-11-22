function Out(){
    this.set=new Set
}
Out.prototype.in=function(doc){
    this.set.add(doc)
}
Out.prototype.out=function(doc){
    this.set.delete(doc)
}
Out.prototype.end=function(){
    this.set.forEach(e=>this.out(e))
}
export default Out
