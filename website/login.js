// IMPORTED CODE -- NOT TESTED YET
var provider = new firebase.auth.GoogleAuthProvider();
var database = firebase.database().ref();
let userVar
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      userVar = user
      username.textContent = user.displayName
    } else {
      userVar = null
      showInline(loginButton)  
      hide(signOutButton)
      hide(username)
      hide(profilePic)
    }
})
loginButton.addEventListener('click', (e) => {
    firebase.auth().signInWithRedirect(provider)
})
signOutButton.addEventListener('click', (e) => {
    firebase.auth().signOut()
})  

addProject.addEventListener('click', () => {
    if (userVar) {
      hide(projectDiv)
      show(projectCreate)
    } else {
      firebase.auth().signInWithRedirect(provider)
    }
})

document.getElementById('getval').addEventListener('change', readURL, true);
function readURL(){
    var file = document.getElementById("getval").files[0];
    var reader = new FileReader();
    reader.onloadend = function(){
      document.getElementById('imagePrev').style.backgroundImage = "url(" + reader.result + ")";
      // document.getElementById('imagePrev').src = reader.result
        picturelink = reader.result
    }
    if(file){
          reader.readAsDataURL(file);
    }
}

const submitProject = () => {
    var img = document.getElementById('imagePrev').style.backgroundImage
    var summary = document.getElementById('quickSum')
    var longText = document.getElementById('descText')
    var username = document.getElementById('username')
    var title = document.getElementById('titleInput')
    if (img != "" && summary != "" && longText != "" && title !="") {
      firebase.database().ref().child("Projects/").push({
        user: {
          username: username.innerHTML,
          uid: userVar.uid
        },
        votes: 0,
        img: img,
        sum: summary.value,
        description: longText.value,
        title: title.value
      })
    } else {
      alert("Please fill out all of the information before submitting!")
    }
    summary.value = ""
    longText.value = ""
    title.value = ""
    img = "https://cdn.glitch.com/17811074-3f7f-4387-bae0-2ea3beecc9ec%2FNoImageAvailable.jpg?v=1563942790921"
}

firebase.database().ref('Projects/').on('child_added', function(snapshot) {
    const ul = document.getElementById('projectsUl')
    const bigUl = document.getElementById('bigDivs')
    const div = document.createElement('div')
    const bigDiv = document.createElement('div')
    div.className = "userProject"
    bigDiv.className = "bigDiv"
    div.innerHTML = "<h1 class='projectName'>"+snapshot.val().title+"</h1><div class='userPic' style='background-image:"+snapshot.val().img+ 
      "'></div><div class='userInfo'>"+snapshot.val().sum+
      "</div><div class='vote' id='vote" + snapshot.key +"'><button class='expandInfo' id='expand"+snapshot.key+"'>More Info</button></div>"
    div.id = snapshot.key
    bigDiv.innerHTML = "<div><div class='bigTitle'><h1>"+snapshot.val().title+"</h1></div><div class='bigImg' style='background-image:"+snapshot.val().img+"'></div><div class='description'>"+snapshot.val().description+"</div><button class='back' id='backBtn"+snapshot.key+"'>Back</button></div>"
    bigDiv.id = "big"+snapshot.key
    ul.insertBefore(div, ul.firstChild)
    bigUl.appendChild(bigDiv)
    createUnlikeButton(document.getElementById("vote"+snapshot.key), snapshot)
    createLikeButton(document.getElementById("vote"+snapshot.key), snapshot)
    document.getElementById("expand" + snapshot.key).addEventListener('click', () => expand(snapshot.key))
    document.getElementById("backBtn" + snapshot.key).addEventListener('click', () => shrink(snapshot.key))
    firebase.database().ref("likes/"+snapshot.key+"/"+userVar.uid).once('value', function(snap) {
    if (snap.val()) {
      hide(document.getElementById("voteButton" + snapshot.key))
      show(document.getElementById("unVoteButton" + snapshot.key))
    } else {
      show(document.getElementById("voteButton" + snapshot.key))
      hide(document.getElementById("unVoteButton" + snapshot.key))
    }
  })
})