const studentListDiv = document.querySelector("#studentList");
const sectionAvldiv = document.querySelector("#sectionAvailable");
const sectionAdddiv = document.querySelector("#sectionAdded");
const validateButton = document.querySelector("#validateButton");
const saveButton = document.querySelector("#saveButton");
const preloaderTemplate = document.querySelector("#preloaderTemplate");

// intializing Materailize js class
M.AutoInit();

// initialize all models
prerequisiteModal = document.querySelector("#prerequisiteModal");
prerequisiteModal = M.Modal.init(prerequisiteModal);
examModel = document.querySelector("#examModel");
examModel = M.Modal.init(examModel);
validateModal = document.querySelector("#validateModal");
validateModal = M.Modal.init(validateModal);

// initializing variables
let currentID = "";
let tableBodydivs = [];
let prereqList = [];
let examSchedule = [];
let sectionList = [];
let sectionAvailable = [];
let sectionAddedclsNbr = [];
let sectionAddedDetails = [];

// Add saveButton event listener
saveButton.addEventListener("click", () => {
  let toSendData = [];
  tableBodydivs.forEach((tr) => {
    let trData = "";
    console.log(tr);
    Array.from(tr.children).forEach((td) => {
      let found = false;
      for (let i = 0; i < sectionAddedDetails.length; i++) {
        if (
          sectionAddedDetails[i].split(":")[0].trim() == td.innerText.trim()
        ) {
          found = true;
          trData += sectionAddedDetails[i] + ",";
        }
      }
      if (!found) trData += "-,";
    });
    trData = trData.slice(0, -2);
    console.log(trData);
    toSendData.push(trData);
  });
  // console.log(toSendData);
  axios
    .put("https://acbdata.herokuapp.com/student/" + currentID, {
      id: currentID,
      tt: toSendData,
    })
    .then(() => {
      alert("Save Successful");
      saveButton.href = "index.html";
      saveButton.click();
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add validate button event listener
validateButton.addEventListener("click", () => {
  let validated = true;
  tableBodydivs.forEach((trow) => {
    // console.log(trow);
    Array.from(trow.children).forEach((tdata) => {
      // console.log(tdata.innerText);
      if (tdata.innerText.split(" ").length > 3) {
        validated = false;
      }
    });
  });
  if (validated) {
    if (saveButton.className.includes("disabled"))
      saveButton.classList.toggle("disabled");
  } else {
    document
      .querySelector("#validateModal")
      .querySelector(".modal-content")
      .querySelector("p").innerText = "Please check errors";
    validateModal.open();
  }
});

const removeFromTT = (csNr, collitp) => {
  // remove data from timetable
  // remove from section Added List
  // Add to sectionAvailable list

  collitp.remove();
  axios
    .get("https://acbdata.herokuapp.com/timings", {
      params: {
        clsNbr: csNr,
      },
    })
    .then((res) => {
      // console.log(res.data['Class Pattern'], res.data['Mtg Start'], res.data['End time']);
      // remove from timetable

      let startTime = parseInt(res.data["Mtg Start"].split(":")[0], 10);
      if (startTime < 8) startTime += 12;
      let endTime = parseInt(res.data["End time"].split(":")[0], 10);
      if (endTime < 8) endTime += 12;
      if (res.data["End time"].split(":")[1] != "00") endTime++;
      let clsPtrn = res.data["Class Pattern"];

      let days = [];
      for (let i = 0; i < clsPtrn.length; i++) {
        if (clsPtrn[i] == "M") days.push(0);
        if (clsPtrn[i] == "W") days.push(2);
        if (clsPtrn[i] == "F") days.push(4);
        if (clsPtrn[i] == "S") days.push(5);
        if (clsPtrn[i] == "T")
          if (clsPtrn[i + 1] == "H") days.push(3);
          else days.push(1);
      }
      days.forEach((dayIndex) => {
        for (let i = startTime; i != endTime; i++) {
          let tddivs = Array.from(tableBodydivs[i - 8].children);
          let reqString =
            res.data.Subject +
            " " +
            res.data.Catalog.trim() +
            " " +
            res.data.Section;

          let remString = tddivs[dayIndex].innerText.split(reqString);
          tddivs[dayIndex].innerText = remString[0] || "-" + remString[1] || "";
          if (tddivs[dayIndex].innerText.split(" ").length < 4)
            tddivs[dayIndex].style.backgroundColor = "transparent";
        }
      });

      // move to available section List

      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText =
        res.data.Subject +
        res.data.Catalog +
        " " +
        res.data["Course Title"] +
        " " +
        res.data.Section;

      let addIcon = document.createElement("i");
      addIcon.className = "material-icons";
      addIcon.innerText = "add";
      addIcon.style.float = "right";

      addIcon.addEventListener("click", () =>
        addToTT(res.data["Class Nbr"], collit)
      );

      collit.appendChild(addIcon);
      sectionAvldiv.insertBefore(
        collit,
        sectionAvldiv.firstElementChild.nextSibling
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

const addToTT = (csNr, collitp) => {
  axios
    .get("https://acbdata.herokuapp.com/timings", {
      params: {
        clsNbr: csNr,
      },
    })
    .then((res) => {
      // console.log(res.data);
      collitp.remove();
      if (!saveButton.className.includes("disabled"))
        saveButton.classList.toggle("disabled");
      // console.log(res.data['Class Pattern'], res.data['Mtg Start'], res.data['End time']);
      // add to timetable

      let startTime = parseInt(res.data["Mtg Start"].split(":")[0], 10);
      if (startTime < 8) startTime += 12;
      let endTime = parseInt(res.data["End time"].split(":")[0], 10);
      if (endTime < 8) endTime += 12;
      if (res.data["End time"].split(":")[1] != "00") endTime++;

      let clsPtrn = res.data["Class Pattern"];

      let days = [];
      for (let i = 0; i < clsPtrn.length; i++) {
        if (clsPtrn[i] == "M") days.push(0);
        if (clsPtrn[i] == "W") days.push(2);
        if (clsPtrn[i] == "F") days.push(4);
        if (clsPtrn[i] == "S") days.push(5);
        if (clsPtrn[i] == "T")
          if (clsPtrn[i + 1] == "H") days.push(3);
          else days.push(1);
      }
      days.forEach((dayIndex) => {
        for (let i = startTime; i != endTime; i++) {
          let tddivs = Array.from(tableBodydivs[i - 8].children);
          if (tddivs[dayIndex].innerText == "-")
            tddivs[dayIndex].innerText =
              res.data.Subject + res.data.Catalog + " " + res.data.Section;
          else {
            tddivs[dayIndex].innerText +=
              " " +
              res.data.Subject +
              res.data.Catalog +
              " " +
              res.data.Section;
            tddivs[dayIndex].style.backgroundColor = "#EE6E73";
          }
          tddivs[dayIndex].innerText = tddivs[dayIndex].innerText.trim();
        }
      });

      // move to added section List

      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText =
        res.data.Subject +
        res.data.Catalog +
        " " +
        res.data["Course Title"] +
        " " +
        res.data.Section;

      let addIcon = document.createElement("i");
      addIcon.className = "material-icons";
      addIcon.innerText = "delete";
      addIcon.style.float = "right";

      // add to section Added List
      sectionAddedDetails.push(
        res.data.Subject +
          " " +
          res.data.Catalog.trim() +
          " " +
          res.data.Section +
          ":" +
          res.data["Class Nbr"]
      );
      sectionAddedclsNbr.push(res.data["Class Nbr"]);

      addIcon.addEventListener("click", () =>
        removeFromTT(res.data["Class Nbr"], collit)
      );

      collit.appendChild(addIcon);

      sectionAdddiv.appendChild(collit);

      // get prerequisites
      // get Exam Schedule
    })
    .catch((err) => {
      console.log(err);
    });
};

const getTT = (id, collitp) => {
  let collitParent = collitp.parentElement;
  collitParent.innerHTML = "";
  studentListDiv.style.display = "none";
  // sectionAvldiv.style.display = "block";
  // sectionAdddiv.style.display = "block";
  document.querySelector("#preSecLoader").style.display = "block";
  axios
    .get("https://acbdata.herokuapp.com/student/tt", {
      params: {
        studid: id,
      },
    })
    .then((res) => {
      currentID = id;
      // make rows according to the table body
      res.data.tt.forEach((hrRow) => {
        let tr = document.createElement("tr");

        // Current Format of data
        // rows of data according to each hour - delimiter ','
        // classnumber delimiter ':'

        hrRow.split(",").forEach((clsDetails) => {
          let td = document.createElement("td");
          td.innerText = clsDetails.split(":")[0];

          // console.log(clsDetails);

          if (
            clsDetails.includes(":") &&
            !sectionAddedDetails.includes(clsDetails)
          )
            sectionAddedDetails.push(clsDetails);

          // Add clsNbr to sectionAdded list
          if (clsDetails.split(":")[1])
            sectionAddedclsNbr.push(clsDetails.split(":")[1]);

          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });

      // console.log(sectionAddedDetails);

      tableBodydivs = Array.from(document.querySelector("#tableBody").children);
      // load section List
      axios.get("https://acbdata.herokuapp.com/sectionList").then((res) => {
        document.querySelector("#preSecLoader").style.display = "none";
        sectionAvldiv.style.display = "block";
        sectionAdddiv.style.display = "block";

        // remove duplicate data

        if (!sectionAddedclsNbr.includes(res.data[0]["Class Nbr"]))
          sectionAvailable.push(res.data[0]);

        for (let i = 1; i < res.data.length; i++) {
          if (res.data[i]["Class Nbr"] != res.data[i - 1]["Class Nbr"]) {
            if (!sectionAddedclsNbr.includes(res.data[i]["Class Nbr"]))
              sectionAvailable.push(res.data[i]);
          }
        }

        // populate SectionAdded
        sectionAddedDetails.forEach((element) => {
          let collit = document.createElement("a");
          collit.href = "#";
          collit.className = "collection-item";
          if (element != "-") collit.innerText = element.split(":")[0];

          let addIcon = document.createElement("i");
          addIcon.className = "material-icons";
          addIcon.innerText = "delete";
          addIcon.style.float = "right";

          addIcon.addEventListener("click", () =>
            removeFromTT(element.split(":")[1], collit)
          );

          collit.appendChild(addIcon);

          sectionAdddiv.appendChild(collit);
        });

        // Add to sectionAvailable

        sectionAvailable.forEach((element) => {
          let collit = document.createElement("a");
          collit.href = "#";
          collit.className = "collection-item";
          collit.innerText =
            element.Subject +
            element.Catalog +
            " " +
            element["Course Title"] +
            " " +
            element.Section;

          let addIcon = document.createElement("i");
          addIcon.className = "material-icons";
          addIcon.innerText = "add";
          addIcon.style.float = "right";

          addIcon.addEventListener("click", () =>
            addToTT(element["Class Nbr"], collit)
          );

          collit.appendChild(addIcon);

          sectionAvldiv.appendChild(collit);
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// Load Students List

axios
  .get("https://acbdata.herokuapp.com/student")
  .then((res) => {
    studentListDiv.querySelector(".preloader-wrapper").style.display = "none";
    res.data.forEach((element) => {
      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText = element.studid + " - " + element.name;
      collit.addEventListener("click", () => getTT(element.studid, collit));
      studentListDiv.appendChild(collit);
    });
  })
  .catch((err) => {
    studentListDiv.appendChild(
      document.createTextNode("An error occured" + err)
    );
  });
