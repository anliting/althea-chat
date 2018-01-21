async function roomAddMessagesToUi(mode,messages){
    await Promise.all(messages.map(async row=>{
        this.ui.users[row.fromUser]=await this._getUser(row.fromUser)
    }))
    this.ui[mode](messages)
}
export default roomAddMessagesToUi
