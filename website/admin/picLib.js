import {showcaseUploadedImage, showElmBlock} from "./adminScript.js"

let picUpload = document.getElementById("pic")

picUpload.addEventListener("change", () => {
	let file = picUpload.files[0]
	if (file !== undefined) {
		let reader = new FileReader()
		reader.onloadend = () => {
            const recommendedImageWidth = 80
            let img = new Image();


            img.onload = () => {
                let width = img.width;
                if (width > recommendedImageWidth) return alert("Please resize the picture to a size of 80 x 80. A picture with a width of 64 pixels is also acceptable if the rescaled picture's height doesn't equal 80 pixels.")
                showElmBlock(showcaseUploadedImage)
                showcaseUploadedImage.src = reader.result
                // Checks if the uploaded image fits within the required specifications of having a width equal to or less than 80 pixels.
            }

            img.src = reader.result;
		};
		reader.readAsDataURL(file)
	}

    // Image File reader
})
