const hideElm = elm => elm.style.display = "none"
const showElmBlock = elm => elm.style.display = "block"

let picUpload = document.getElementById("pic")
let showcaseUploadedImage = document.getElementById("showcaseUploadedImage")

picUpload.addEventListener("change", () => {
	let file = picUpload.files[0]
	if (file !== undefined) {
		let reader = new FileReader()
		reader.onloadend = ()=> {
            let img = new Image();

            img.onload = function(){
                let width = img.width;
                if (width > 64) return alert("Please resize the picture to a size of 64 x 64. A picture with a width of 64 pixels is also acceptable if the rescaled picture's height doesn't equal 64 pixels.")
                showcaseUploadedImage.src = reader.result
                // Checks if the uploaded image fits within the required specifications of having a width equal to or less than 64 pixels.
            }

            img.src = reader.result;
		};
		reader.readAsDataURL(file)
	}

    // Image File reader
})

// // eslint-disable-next-line no-unused-vars
// const clearPicSubmission = () => {
// 	previewImg.src = ""
// 	robotPicture.value = ""
// 	showElmBlock(matchNumLabel)
// 	hideElm(robotPicture)
// 	hideElm(previewImg)
// 	pictureButton.className = ""
// 	robotPicture.required = false;
// }