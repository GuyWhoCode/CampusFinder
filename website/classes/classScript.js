// eslint-disable-next-line no-undef
const classSocket = io("/")
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    return JSON.parse(this.getItem(key));
}
let classListElm = document.getElementById("classList")
let confirmationScreen = document.getElementById("confirmationScreen")
let confirmTitle = document.getElementById("confirmTitle")
let saveAllClasses = document.getElementById("saveAllClasses")
let saveAllClassesMobile = document.getElementById("saveAllClassesMobile")
let confirmationClassListMobile = document.getElementById("confirmationClassListMobile")
let saveClassesMobileBtn = document.getElementById("saveClassesMobileBtn")
// eslint-disable-next-line no-undef
let confirmationModal = new bootstrap.Modal(document.getElementById('confirmationClassModal'))
// eslint-disable-next-line no-undef
let confirmClassMobile = new bootstrap.Modal(document.getElementById('confirmClassMobile'))
let confirmationDescription = document.getElementById("confirmationDescription")
let confirmationClassMessage = document.getElementById("confirmationClassMessage")
let deletedClasses = []
let periodsConfirmed = []
let confirmationList = {}
let teachers = localStorage.getObject("teacherList")
// Initializes autocomplete feature by referencing local storage of teacher list
let debug = false

Object.values(document.getElementsByClassName("classSelector")).map((elm, index) => {
    teachers.map(val => {
        if (val.name !== undefined) {
            let name = document.createElement("option")
            name.value = `${val.name} (${val.room})`
            document.getElementById("teacherNames" + index).appendChild(name)
        }
        // Weeds out the database update identifier 
    })
    // Adds autocomplete option element to datalist -- Enables autocomplete on inputs
})


// eslint-disable-next-line no-unused-vars
const findTeacherInfo = teacherName => {
    let teacherInfo = ""
    teachers.map(val => val.name === teacherName ? (teacherInfo = val) : undefined)
    // Linear search algorithm of going through all teacher names until the teacher name matches with the query teacher name
    return teacherInfo
}

const deleteClassELm = classElm => {
    deletedClasses.push(Object.values(classElm.childNodes).filter(val => val.nodeName === "P")[0].innerHTML)
    classElm.remove()
    // Stores the name of the removed class and then deletes the element
    if (Object.values(document.getElementsByClassName("confirmTeacher")).length === 0) return; 
    // Edge case: When there are no elements to delete, exit out of the code.
    let classIdentifier = deletedClasses[deletedClasses.length-1].split(" ").join("")
    // Returns a string that contains the period number; Format: PeriodX
    let periodNumber = parseInt(deletedClasses[deletedClasses.length-1].split(" ")[1])

    let confirmNodes = Object.values(confirmationScreen.childNodes)
    let confirmPeriodIndex = confirmNodes
        .map((val, index) => val.className === "confirmTeacher " + classIdentifier ? index : undefined)
        .filter(val => val !== undefined)[0]
    // Finds confirmsPeriod Element first by filtering out the child node list to delete the rest of the class entry.
    confirmNodes[confirmPeriodIndex].remove()
    // Deletes the teacher name element
    confirmNodes[confirmPeriodIndex - 1].remove()
    // Deletes the period number element
    confirmNodes[confirmPeriodIndex + 1].remove()
    // // Deletes the spacing element
    delete confirmationList[periodNumber]
    // Updates the final confirmation list accordingly
    
    // GENERAL USE: Handles logic behind deleting the selected class entry
}

const undoDelete = className => {
    // Sample className: Period 1
    let classSelector = document.createElement("div")
    classSelector.className = "classSelector"

    if (sessionStorage.darkMode === "false") classSelector.style.backgroundColor = "#cfcdcd"
    // Adds light mode to previously deleted class entries

    let periodName = document.createElement("p")
    periodName.className = 'period fs-4'
    periodName.innerHTML = className
    classSelector.appendChild(periodName)

    let searchTeacher = document.createElement("form")
    searchTeacher.className = "searchTeacher"
    searchTeacher.action = "."
    searchTeacher.addEventListener("submit", event => {event.preventDefault(), confirmClass("Period " + className.split(" ")[1])})

    let teacherAutocomplete = document.createElement("input")
    teacherAutocomplete.setAttribute("list", "teacherNames" + className.split(" ")[1])
    // List is not originally a native attribute that can be set with dot notation. Set attribute manually.
    teacherAutocomplete.id = className
    teacherAutocomplete.className = "teacherAutocomplete form-control"
    teacherAutocomplete.placeholder = "Teacher name"
    searchTeacher.appendChild(teacherAutocomplete)
    classSelector.appendChild(searchTeacher)

    let teacherName = document.createElement('datalist')
    teacherName.id = "teacherNames" + className.split(" ")[1]
    teachers.map(val => {
        let name = document.createElement("option")
        name.value = `${val.name} (${val.room})`
        teacherName.appendChild(name)
    })
    classSelector.appendChild(teacherName)

    teacherName.insertAdjacentHTML("afterend", '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-dash-circle-fill deleteClass" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/> </svg>')
    // Adds SVG image of delete button
    classSelector.childNodes[3].addEventListener("click", () => {deleteClassELm(classSelector)})

    return classSelector
    // Creates a class selector element with the following components: Period name, form with text input, drop-down menu, submit button, and Delete Class button
}

const classInsertion = (val, index, list, insertedValue) => {
    if (index + 1 !== list.length && val < insertedValue && list[index + 1] > insertedValue) return index
    // If the value before is less than the period number and the value after is greater than the period number, return the index
    // The index is one greater than calculated to compensate for weird behavior of inserting 1 index before intended index.
    // First case is a precaution to prevent index out of array error
    // GENERAL USE: Inequality Insertion algorithm when given a number to be inserted into an array
}


const insertNewClass = elm => {
    let classElms = Object.values(classListElm.childNodes).filter(val => val.nodeName !== "#text")
    // Removes extraneous text node values when first taking child nodes of pre-written code in HTML file
    let classPeriods = classElms.map(val => parseInt(Object.values(val.childNodes).filter(val => val.nodeName === "P")[0].innerHTML.split(" ")[1]))
    // Filters out all other elements besides the paragraph tag containing Period X. Manipulates the value of innerHTML to get the int X for every element.
    let periodNumber = parseInt(elm.split(" ")[1])

    if (periodNumber < classPeriods[0]) {
        return classListElm.insertBefore(undoDelete(elm), classListElm.childNodes[0])
        // Insert element at the first node element in the element
    } 
    else if (periodNumber > classPeriods[classPeriods.length-1]) {
        return classListElm.appendChild(undoDelete(elm))
        // Insert element at the last node element in the element
    }

    classPeriods.map((val, index) => classInsertion(val, index, classPeriods, periodNumber) !== undefined ? classListElm.insertBefore(undoDelete(elm), classElms[index+1]) : undefined)
    // GENERAL USE: Serves as Undo Function
}

const confirmClass = period => {
    let elmValue = document.getElementById(period).value
    if (!elmValue.includes("(") && !elmValue.includes(")")) return;
    // Exits out of the program if the input isn't valid
    
    let teacherName = elmValue.split("(")[0].trim()
    // Format of drop-down name: lastName, firstName (XXXX)
    if (teacherName === "") return;

    let classIdentifier = period.split(" ").join("")
    // Formatted as PeriodX
    let periodNumber = parseInt(period.split(" ")[1])
    let roomNumber = elmValue.split("(")[1].split(")")[0]
    
    if (Object.values(document.getElementsByClassName("confirmPeriod")).map(val => val.className.includes(classIdentifier)).filter(val => val === true).length !== 0) {
        return document.getElementsByClassName("confirmTeacher " + classIdentifier)[0].innerHTML = teacherName
        // Updates only the teacher name if an existing entry has already been created; Prevents duplicates by returning command
        // Uses identifier established in the code below: className of "confirmPeriod PeriodX"
    }
    
    let periodName = document.createElement("p")
    periodName.className = "confirmPeriod " + classIdentifier
    periodName.innerHTML = period

    let teacherElm = document.createElement("p")
    teacherElm.className = "confirmTeacher " + classIdentifier
    teacherElm.innerHTML = teacherName

    let periodNameMobile = document.createElement("p")
    periodNameMobile.className = "confirmPeriod " + classIdentifier
    periodNameMobile.innerHTML = period

    let teacherElmMobile = document.createElement("p")
    teacherElmMobile.className = "confirmTeacher " + classIdentifier
    teacherElmMobile.innerHTML = teacherName
    // Creates a new confirmation element composed of a Period title, teacher name, and a break.

    confirmationList[periodNumber] = teacherName + "--" + roomNumber
    // Adds to the confirmation list to be saved server-side; Format: Teacher--XXXX

    periodsConfirmed.sort()
    // Helps with the insertion algorithm by organizing the periods confirmed from least to greatest (default sort)
    if (periodsConfirmed.length === 0) {
        periodsConfirmed.push(periodNumber)
        confirmationClassListMobile.appendChild(periodNameMobile)
        confirmationClassListMobile.appendChild(teacherElmMobile)
        confirmationClassListMobile.appendChild(document.createElement("br"))
        // Mobile modal sorting for first element of the list (no other items present)

        confirmTitle.insertAdjacentElement("afterend", periodName)
        periodName.insertAdjacentElement("afterend", teacherElm)
        return teacherElm.insertAdjacentElement("afterend", document.createElement("br"))
        // Uses Adjacent Element insertion to insert at the beginning; each element added after one is added
        // INSERT BEGINNING for Desktop

    } else if (periodNumber > periodsConfirmed[periodsConfirmed.length-1]) {
        periodsConfirmed.push(periodNumber)
        confirmationClassListMobile.appendChild(periodNameMobile)
        confirmationClassListMobile.appendChild(teacherElmMobile)
        confirmationClassListMobile.appendChild(document.createElement("br"))

        confirmationScreen.appendChild(periodName)
        confirmationScreen.appendChild(teacherElm)
        return confirmationScreen.appendChild(document.createElement("br"))
        // INSERT LAST for both Desktop and Mobile

    } else if (periodNumber < periodsConfirmed[0]) {
        periodsConfirmed.push(periodNumber)
        confirmationClassListMobile.insertBefore(periodName, confirmationClassListMobile.firstChild)
        periodName.insertAdjacentElement("afterend", teacherElm)
        teacherElm.insertAdjacentElement("afterend", document.createElement("br"))
        // Mobile modal sorting for the first element of the list (when items ARE present)

        confirmTitle.insertAdjacentElement("afterend", periodName)
        periodName.insertAdjacentElement("afterend", teacherElm)
        return teacherElm.insertAdjacentElement("afterend", document.createElement("br"))
        // Uses Adjacent Element insertion to insert at the beginning; each element added after one is added
        // INSERT BEGINNING for Desktop
    } 
    

    periodsConfirmed.push(periodNumber)
    periodsConfirmed.map((val, index) => {if (classInsertion(val, index, periodsConfirmed, periodNumber) !== undefined) {
        confirmationScreen.insertBefore(periodName, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        confirmationScreen.insertBefore(teacherElm, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        confirmationScreen.insertBefore(document.createElement("br"), document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        // Desktop Version

        confirmationClassListMobile.insertBefore(periodNameMobile, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[1])
        confirmationClassListMobile.insertBefore(teacherElmMobile, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[1])
        confirmationClassListMobile.insertBefore(document.createElement("br"), document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[1])
        // Mobile Version
        // Gets the Period X container after at the found index (uses the number at the index, not the index number itself) as a reference point to insert
    }}) 
}

Object.values(document.getElementsByClassName("searchTeacher")).map((val, index) => {
    if (navigator.userAgent.indexOf("Android") !== -1 || navigator.userAgent.indexOf("like Mac") !== -1) {
        val.addEventListener("keydown", event => { if (event.key === "Enter") confirmClass("Period " + index) })
        // Adds keydown event listener for mobile that adds functionality to the Search button
    } else {
        val.addEventListener("submit", event => {event.preventDefault(), confirmClass("Period " + index)})
        val.addEventListener("change", event => {confirmClass("Period " + index)})
    }
})
// Adds ability to hit enter on Class autocomplete forms

Object.values(document.getElementsByClassName("searchTeacher")).map(val => val.insertAdjacentHTML("afterend", '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-dash-circle-fill deleteClass" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-7z"/> </svg>'))
// Adds scalable delete button image

Object.values(document.getElementsByClassName("classSelector")).map(val => val.childNodes[4].addEventListener("click", () => {deleteClassELm(val)}))
// Adds button click to delete class image 

document.getElementById("undoButton").addEventListener("click", () => {
    let periodDeleted = deletedClasses.length-1
    insertNewClass(deletedClasses[periodDeleted])
    deletedClasses.splice(periodDeleted, 1)
    // Deletes class from list to prevent multiple unnecessary undoes
    // GENERAL USE: Handles event handling of undo button
})

document.getElementById("homePage").addEventListener("click", ()=> {
    window.location = "/home"
})


saveAllClasses.addEventListener("click", () => {
    if (Object.values(confirmationList).length >= 3) {
        if (!debug) {
            classSocket.emit("saveTeacherSelection", confirmationList)
            sessionStorage.setObject("userClasses", confirmationList)
            // Sets the session storage to the new class list so that the user can see the updated class list on home page
        }
        confirmationClassMessage.innerHTML = "Success"
        confirmationDescription.innerHTML = "Your class selections have been saved."
        
    } else {
        confirmationClassMessage.innerHTML = "Error"
        confirmationDescription.innerHTML = "Please add at least 3 classes to the selection and click Submit Class to confirm your selection."
        // Creates error modal when the user has not submitted at least 3 classes.
    }
    confirmationModal.show()
    // Provides confirmation that the classes have been submitted and redirected home
})

saveAllClassesMobile.addEventListener("click", () => {
    if (Object.values(confirmationList).length <= 3) {
        confirmationClassMessage.innerHTML = "Error"
        confirmationDescription.innerHTML = "Please add at least 3 classes to the selection and click Save Classes to confirm your selection."
        return confirmationModal.show()
        // Measure to prevent class submission when there is less than 3 classes added
    }
    confirmClassMobile.show()
    // Shows class confirmation modal for mobile
})

saveClassesMobileBtn.addEventListener("click", () => {
    confirmClassMobile.hide()
    confirmationClassMessage.innerHTML = "Success"
    confirmationDescription.innerHTML = "Your class selections have been saved."
    confirmationModal.show()

    if (!debug) {
        sessionStorage.setObject("userClasses", confirmationList)
        // Sets the session storage to the new class list so that the user can see the updated class list on home page
        classSocket.emit("saveTeacherSelection", confirmationList)
        // Shows success message and saves the classes for mobile
    } 
})


document.getElementById('confirmationClassModal').addEventListener("hidden.bs.modal", () => Object.values(confirmationList).length >= 3 ? window.location = "/home" : undefined)
// Redirects the user home after the confirmation class modal is closed

if (!debug) {
    if (sessionStorage.getItem("email") === null) {
        window.location = "/home"
        // If the user is not logged in, redirect them to the main screen.
    } else {
        confirmationList["userEmail"] = sessionStorage.getItem("email")
    }
}
 
if (sessionStorage.darkMode === "false") {
    document.getElementById("toolBar").style.backgroundColor = "#e9d283"
    document.getElementById("toolBar").style.color = "#000000"
    document.body.style.backgroundColor = "#FFFFFF"
    document.body.style.color = "#000000"
    Object.values(document.getElementsByClassName("classSelector")).map(val => val.style.backgroundColor = "#cfcdcd")
    confirmationScreen.style.backgroundColor = "#cfcdcd"
}

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
// eslint-disable-next-line no-unused-vars
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    // eslint-disable-next-line no-undef
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
// Initializes Bootstrap tooltips

function enableUndoHotkey(e) {
    let eventHandler = window.event ? event : e
    if (eventHandler.keyCode === 90 && (eventHandler.ctrlKey || e.metaKey)) {
        let periodDeleted = deletedClasses.length-1
        insertNewClass(deletedClasses[periodDeleted])
        deletedClasses.splice(periodDeleted, 1)
    }
}
document.onkeydown = enableUndoHotkey;
// https://stackoverflow.com/questions/16006583/capturing-ctrlz-key-combination-in-javascript        