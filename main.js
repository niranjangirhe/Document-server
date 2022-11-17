const db = firebase.firestore();
var mode = 0;
toggle();
function toggle() {

    loadDoc();
    var uploader = document.getElementById("uploader");
    var downloader = document.getElementById("downloader");

    if (mode == 0) {
        uploader.style.display = "none";
        downloader.style.display = "block";
        mode = 1;
    }
    else {
        uploader.style.display = "block";
        downloader.style.display = "none";
        mode = 0;
    }
}

function login() {
    var password = document.getElementById("password").value;
    var email = "niranjangirheindia@gmail.com"
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            var user = userCredential.user;
            alert("Logged in");
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            alert("Error");
        });
}

function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        alert("Logged out");
    }).catch((error) => {
        // An error happened.
        alert("Error");
    });
}

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        var B1 = document.getElementById("loginB1");
        var B2 = document.getElementById("loginB2");
        var logout = document.getElementById("logout");


        logout.style.display = "block";
        B1.style.display = "none";
        B2.style.display = "none";

        loadDoc();

    } else {
        var B1 = document.getElementById("loginB1");
        var B2 = document.getElementById("loginB2");
        var logout = document.getElementById("logout");


        logout.style.display = "none";
        B1.style.display = "block";
        B2.style.display = "block";
    }
});

function loadDoc() {
    console.log("Loading");
    var DocList = document.getElementById("DocList");
    DocList.innerHTML = "";
    db.collection("Documents").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.data().name);
            DocList.innerHTML += `<option value="` + doc.data().link + `">` + doc.data().name + `</option>`
        });
    });

}

function download() {
    var link = document.getElementById("DocList").value;
    window.open(link);
}

function upload() {
    var file = document.getElementById("file").files[0];
    var name = document.getElementById("name").value;
    var storageRef = firebase.storage().ref('Documents/' + name);
    var task = storageRef.put(file);
    task.on('state_changed',
        function progress(snapshot) {
            var percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById("upProgress").innerHTML = percentage.toFixed(2) + "%";
        },
        function error(err) {
            alert("Error");
        },
        function complete() {
            task.snapshot.ref.getDownloadURL().then((downloadURL) => {
                db.collection("Documents").where("name", "==", name).get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        db.collection("Documents").doc(doc.id).delete();
                    });
                }).then(() => {
                    db.collection("Documents").add({
                        name: name,
                        link: downloadURL,
                        date: firebase.firestore.FieldValue.serverTimestamp()
                    })
                        .then((docRef) => {
                            document.getElementById("upProgress").innerHTML = "Upload";
                            alert("Uploaded");
                        })
                        .catch((error) => {
                            alert("Error");
                        });


                });
            });

        }
    );
}