// eslint-disable-next-line no-undef
const classSocket = io()
let classListElm = document.getElementById("classList")
let confirmationScreen = document.getElementById("confirmationScreen")
let confirmTitle = document.getElementById("confirmTitle")
let saveAllClasses = document.getElementById("saveAllClasses")
let deletedClasses = []
let periodsConfirmed = []
let confirmationList = []
let teachers;

classSocket.emit("requestTeacher")
classSocket.on("teacherData", data => {
    teachers = data
    Object.values(document.getElementsByClassName("classSelector")).map((elm, index) => {
        teachers.map(val => {
            let name = document.createElement("option")
            name.value = `${val.name} (${val.room})`
            document.getElementById("teacherNames" + index).appendChild(name)
            // Adds autocomplete option element to datalist -- Enables autocomplete on inputs
        })
    })
    // Initializes autocomplete feature by sending an internal request through a socket to the server for teacher names
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
    let periodNumber = deletedClasses[deletedClasses.length-1].split(" ").join("")
    // Returns a string that contains the period number
    let confirmNodes = Object.values(confirmationScreen.childNodes)
    let confirmPeriodIndex = confirmNodes
        .map((val, index) => val.className === "confirmPeriod " + periodNumber ? index : undefined)
        .filter(val => val !== undefined)[0]
    // Finds confirmsPeriod Element first by filtering out the child node list to delete the rest of the class entry.
    confirmNodes[confirmPeriodIndex].remove()
    // Deletes the period number element
    confirmNodes[confirmPeriodIndex + 1].remove()
    // Deletes the teacher name element
    confirmNodes[confirmPeriodIndex - 1].remove()
    // Deletes the spacing element
    confirmationList.map((val, index) => val.period === parseInt(periodNumber) ? confirmationList.splice(index, 1) : undefined)
    // Updates the final confirmation list accordingly
    
    // GENERAL USE: Handles logic behind deleting the selected class entry
}

const undoDelete = className => {
    // Sample className: Period 1
    let classSelector = document.createElement("div")
    classSelector.className = "classSelector"

    let periodName = document.createElement("p")
    periodName.className = 'period'
    periodName.innerHTML = className
    classSelector.appendChild(periodName)

    let searchTeacher = document.createElement("form")
    searchTeacher.className = "searchTeacher"

    let teacherAutocomplete = document.createElement("input")
    teacherAutocomplete.setAttribute("list", "teacherNames" + className.split(" ")[1])
    // List is not originally a native attribute that can be set with dot notation. Set attribute manually.
    teacherAutocomplete.id = className
    teacherAutocomplete.className = "teacherAutocomplete"
    teacherAutocomplete.placeholder = "Enter WHS teacher name"
    teacherAutocomplete.autofocus = true
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

    let submitClass = document.createElement('button')
    submitClass.className = "submitClass premadeBlue"
    submitClass.innerHTML = "Submit Class"
    classSelector.appendChild(submitClass)

    let deleteButton = document.createElement('img')
    deleteButton.src = "./classes./minus.png"
    deleteButton.className = "deleteClass"
    deleteButton.style.width = "50px"
    deleteButton.addEventListener("click", () => {deleteClassELm(classSelector)})
    classSelector.appendChild(deleteButton)

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
    let teacherName = document.getElementById(period).value.split("(")[0].trim()
    // Format of drop-down name: lastName, firstName (XXXX)
    if (teacherName === "") return;

    let classIdentifier = period.split(" ").join("")
    // Formatted as PeriodX
    let periodNumber = parseInt(period.split(" ")[1])
    
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
    // Creates a new confirmation element composed of a Period title, teacher name, and a break.

    confirmationList.push({
        "period": periodNumber,
        "teacher": teacherName
    })
    // Adds to the confirmation list to be saved server-side

    if (periodsConfirmed.length === 0 || periodNumber < periodsConfirmed[0]) {
        periodsConfirmed.push(periodNumber)
        confirmTitle.insertAdjacentElement("afterend", periodName)
        periodName.insertAdjacentElement("afterend", teacherElm)
        return teacherElm.insertAdjacentElement("afterend", document.createElement("br"))
        // Uses Adjacent Element insertion to insert at the beginning; each element added after one is added
    } 
    else if (periodNumber > periodsConfirmed[periodsConfirmed.length-1]) {
        periodsConfirmed.push(periodNumber)
        confirmationScreen.insertBefore(periodName, saveAllClasses)
        confirmationScreen.insertBefore(teacherElm, saveAllClasses)
        return confirmationScreen.insertBefore(document.createElement("br"), saveAllClasses)
        // Uses the Confirm classes button as a reference to insert the elements before it
    }

    periodsConfirmed.map((val, index) => {if (classInsertion(val, index, periodsConfirmed, periodNumber) !== undefined) {
        confirmationScreen.insertBefore(periodName, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        confirmationScreen.insertBefore(teacherElm, document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        confirmationScreen.insertBefore(document.createElement("br"), document.getElementsByClassName("confirmPeriod Period" + periodsConfirmed[index+1])[0])
        // Gets the Period X container after at the found index (uses the number at the index, not the index number itself) as a reference point to insert
    }}) 
    periodsConfirmed.sort()
    // Helps with the insertion algorithm by organizing the periods confirmed from least to greatest (default sort)

}
Object.values(document.getElementsByClassName("classSelector")).map(val => val.childNodes[9].addEventListener("click", () => {deleteClassELm(val)}))
// Adds button click to delete class image 

Object.values(document.getElementsByClassName("submitClass")).map((val, index) => val.addEventListener("click", () => {confirmClass("Period " + index)}))
// Adds button click to Submit Class button

Object.values(document.getElementsByClassName("searchTeacher")).map((val, index) => val.addEventListener("submit", event => {event.preventDefault(), confirmClass("Period " + index)}))
// Adds ability to hit enter on Class autocomplete forms

document.getElementById("undoButton").addEventListener("click", () => {
    let periodDeleted = deletedClasses.length-1
    insertNewClass(deletedClasses[periodDeleted])
    deletedClasses.splice(periodDeleted, 1)
    // Deletes class from list to prevent multiple unnecessary undoes
    // GENERAL USE: Handles event handling of undo button
})

saveAllClasses.addEventListener("click", () => confirmationList.length > 3 ? classSocket.emit("saveTeacherSelection", confirmationList) : alert("Please select more than 3 classes."))