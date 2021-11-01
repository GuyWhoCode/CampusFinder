let pictureButton = document.getElementById('roboPics')
let matchNumLabel = document.getElementById('matchNumLabel')
let robotPicture = document.getElementById('robotPicture')
let previewImg = document.getElementById('previewImg')
const hideElm = elm => elm.style.display = "none"
const showElmBlock = elm => elm.style.display = "block"

robotPicture.addEventListener("change", ()=> {
	let file = robotPicture.files[0]
	if (file !== undefined) {
		let reader = new FileReader()
		reader.onloadend = ()=> {
			previewImg.src = reader.result
		};
		reader.readAsDataURL(file)
	}
})

const getPic = () => {
	//maximum of 117 images saved on local storage
	return previewImg.src
}

const clearPicSubmission = () => {
	previewImg.src = ""
	robotPicture.value = ""
	showElmBlock(matchNumLabel)
	hideElm(robotPicture)
	hideElm(previewImg)
	pictureButton.className = ""
	robotPicture.required = false;
}