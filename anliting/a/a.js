// https://developers.google.com/drive/v3/web/about-sdk
(async()=>{
    let
        authorizeButton=document.getElementById('authorize-button'),
        signoutButton=document.getElementById('signout-button'),
        content=document.getElementById('content')
    async function initClient() {
        await gapi.client.init({
            discoveryDocs:[
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
            ],
            clientId:'1040053646946-suppijprovg780dtp0h8n7q21noc5u6d.apps.googleusercontent.com',
            scope:'https://www.googleapis.com/auth/drive.metadata.readonly'
        })
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus)
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
        authorizeButton.onclick=()=>
            gapi.auth2.getAuthInstance().signIn()
        signoutButton.onclick=()=>
            gapi.auth2.getAuthInstance().signOut()
    }
    function updateSigninStatus(isSignedIn){
        if (isSignedIn) {
            authorizeButton.style.display='none'
            signoutButton.style.display='block'
            listFiles()
        } else {
            authorizeButton.style.display='block'
            signoutButton.style.display='none'
        }
    }
    async function listFiles(){
        let response=await gapi.client.drive.files.list({
            'pageSize':16,
            'fields':'nextPageToken, files(id, name)'
        })
        let files=response.result.files
        if(!files)
            return
        content.textContent=files.map(f=>`${f.name} (${f.id})\n`).join('')
    }
    await module.scriptByPath('https://apis.google.com/js/api.js')
    gapi.load('client:auth2',initClient)
})()
