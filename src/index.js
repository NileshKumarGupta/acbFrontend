const studentListDiv = document.querySelector("#studentList");
const sectionAvldiv = document.querySelector("#sectionAvailable");
const sectionAdddiv = document.querySelector("#sectionAdded");
const validateButton = document.querySelector("#validateButton");
const saveButton = document.querySelector("#saveButton");
const backButton = document.querySelector("#backButton");
// intializing Materailize js class
M.AutoInit();

// initialize all models
prerequisiteModal = document.querySelector("#prerequisiteModal");
prerequisiteModal = M.Modal.init(prerequisiteModal);
examModal = document.querySelector("#examModal");
examModal = M.Modal.init(examModal);
validateModal = document.querySelector("#validateModal");
validateModal = M.Modal.init(validateModal);

// initializing variables
let currentID = "";
let tableBodydivs = [];
let prereqList = [];
let examSchedule = new Set();
let sectionList = [];
let sectionAvailable = [];
let sectionAddedclsNbr = new Set();
let sectionAddedCourse = new Set();
let sectionAddedDetails = [];

// backButton function
backButton.addEventListener("click", () => {
  if (confirm("Warning: All your progress will be lost"))
    window.location = "https://acbsoftware.netlify.com";
});

// Exam schedule Modal function
document.querySelector("#exambtn").addEventListener("click", () => {
  clnrstr = "";
  sectionAddedDetails.forEach((str) => {
    clnrstr += str.split(":")[1] + ",";
  });
  examModal.open();
  document
    .querySelector("#examClashList")
    .querySelector(".preloader-wrapper").style.display = "block";
  document
    .querySelector("#examClashList")
    .querySelectorAll(".collection-item")
    .forEach((it) => it.remove());
  axios
    .get("https://acbdata.herokuapp.com/exams", {
      params: {
        clsnr: clnrstr,
      },
    })
    .then((res) => {
      document
        .querySelector("#examClashList")
        .querySelector(".preloader-wrapper").style.display = "none";
      examSchedule = new Set();
      res.data.forEach((info) => {
        let examstr =
          info["Course Title"] + ":" + info["Exam Tm Cd"] + info["Exam Date"];
        examSchedule.add(examstr);
      });
      examClashes = [];
      examSchedule = Array.from(examSchedule);
      for (let i = 0; i < examSchedule.length; i++) {
        for (let j = i + 1; j < examSchedule.length; j++) {
          if (
            examSchedule[i] == examSchedule[j] ||
            examSchedule[i].split(":")[1] == "" ||
            examSchedule[j].split(":")[1] == ""
          )
            continue;
          if (examSchedule[i].split(":")[1] == examSchedule[j].split(":")[1]) {
            examClashes.push(
              examSchedule[i].split(":")[0] +
                " clashes with " +
                examSchedule[j].split(":")[0]
            );
          }
        }
      }

      if (examClashes.length) {
        examClashes.forEach((item) => {
          let collit = document.createElement("a");
          collit.href = "#";
          collit.className = "collection-item";
          collit.innerText = item;

          document.querySelector("#examClashList").append(collit);
        });
      } else {
        let collit = document.createElement("a");
        collit.href = "#";
        collit.className = "collection-item";
        collit.innerText = "No Clashes Detected";

        document.querySelector("#examClashList").append(collit);
      }
    })
    .catch((err) => {
      // console.log(err);
    });
});

// prerequisites modal function
document.querySelector("#prereqbtn").addEventListener("click", () => {
  // get all courses
  prerequisiteModal.open();
  crsIdty = "";
  sectionAddedDetails.forEach(
    (str) => (crsIdty += str.split(" ")[0] + " " + str.split(" ")[1] + ",")
  );

  document
    .querySelector("#prereqList")
    .querySelector(".preloader-wrapper").style.display = "block";
  document
    .querySelector("#prereqList")
    .querySelectorAll(".collection-item")
    .forEach((it) => it.remove());
  axios
    .get("https://acbdata.herokuapp.com/prst", {
      params: {
        courseIdentity: crsIdty,
      },
    })
    .then((res) => {
      res.data.forEach((preq) => {
        let prereqstr =
          preq["pereq1 title "] +
          " " +
          preq["pereq2 title "] +
          " " +
          preq["pereq3 title "] +
          " " +
          preq["pereq4 title "];

        if (!prereqstr.trim()) return;

        let collit = document.createElement("a");
        collit.href = "#";
        collit.className = "collection-item";
        collit.innerText = preq["Title"] + " - " + prereqstr;

        document.querySelector("#prereqList").append(collit);
      });
      document
        .querySelector("#prereqList")
        .querySelector(".preloader-wrapper").style.display = "none";
    })
    .catch((err) => {
      // console.log(err);
    });
});

// console.log("does this execute till this?");

// Add saveButton event listener
saveButton.addEventListener("click", () => {
  let toSendData = [];
  tableBodydivs.forEach((tr) => {
    let trData = "";
    // console.log(tr);
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
    // console.log(trData);
    toSendData.push(trData);
  });
  console.log(toSendData);
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
      // console.log(err);
    });
});

// Add validate button event listener
validateButton.addEventListener("click", () => {
  let timeValidate = true;
  tableBodydivs.forEach((trow) => {
    // console.log(trow);
    Array.from(trow.children).forEach((tdata) => {
      // console.log(tdata.innerText);
      if (tdata.innerText.split(" ").length > 3) {
        timeValidate = false;
      }
    });
  });

  clnrstr = "";
  sectionAddedDetails.forEach((str) => {
    clnrstr += str.split(":")[1] + ",";
  });

  axios
    .get("https://acbdata.herokuapp.com/exams", {
      params: {
        clsnr: clnrstr,
      },
    })
    .then((res) => {
      examSchedule = new Set();
      res.data.forEach((info) => {
        let examstr =
          info["Course Title"] + ":" + info["Exam Tm Cd"] + info["Exam Date"];
        examSchedule.add(examstr);
      });
      examClashes = [];
      examSchedule = Array.from(examSchedule);
      for (let i = 0; i < examSchedule.length; i++) {
        for (let j = i + 1; j < examSchedule.length; j++) {
          if (
            examSchedule[i] == examSchedule[j] ||
            examSchedule[i].split(":")[1] == "" ||
            examSchedule[j].split(":")[1] == ""
          )
            continue;
          if (examSchedule[i].split(":")[1] == examSchedule[j].split(":")[1]) {
            examClashes.push(
              examSchedule[i].split(":")[0] +
                " clashes with " +
                examSchedule[j].split(":")[0]
            );
          }
        }
      }
      let examValidate = false;
      if (examClashes.length == 0) examValidate = true;

      let validated = examValidate && timeValidate;

      if (validated) {
        document
          .querySelector("#validateModal")
          .querySelector(".modal-content")
          .querySelector("p").innerHTML = "<h5>No Clashes Detected</h5>";
        validateModal.open();
        if (saveButton.className.includes("disabled"))
          saveButton.classList.toggle("disabled");
      } else {
        let errorText = "";
        if (!examValidate)
          errorText +=
            "There are clashes in exam timings, please check exam clashes";
        if (!timeValidate) errorText += " There are clashes in class timings";
        document
          .querySelector("#validateModal")
          .querySelector(".modal-content")
          .querySelector("p").innerHTML = "<h5>" + errorText + "</h5>";
        validateModal.open();
      }
    })
    .catch((err) => {
      // console.log(err);
    });
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
      // console.log("this executed");
      // console.log(
      //   res.data["Class Pattern"],
      //   res.data["Mtg Start"],
      //   res.data["End time"]
      // );
      // remove from timetable

      // console.log(res.data);

      finalDetails = [];
      finalDetails.push(res.data[0]);

      if (res.data.length != 1) {
        for (let i = 1; i < res.data.length; i++) {
          if (
            res.data[i]["Class Pattern"] + res.data[i]["Mtg Start"] !=
            res.data[i - 1]["Class Pattern"] + res.data[i - 1]["Mtg Start"]
          )
            finalDetails.push(res.data[i]);
        }
      }

      finalDetails.forEach((data) => {
        let startTime = parseInt(data["Mtg Start"].split(":")[0], 10);
        if (startTime < 8) startTime += 12;
        let endTime = parseInt(data["End time"].split(":")[0], 10);
        if (endTime < 8) endTime += 12;
        if (data["End time"].split(":")[1] != "00") endTime++;
        let clsPtrn = data["Class Pattern"];

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
              data.Subject + " " + data.Catalog.trim() + " " + data.Section;

            let remString = tddivs[dayIndex].innerText.split(reqString);
            // console.log(remString);
            if (remString[0] == "" && remString[1] == "") {
              // console.log(remString[0], remString[1]);
              tddivs[dayIndex].innerText = "-";
            } else if (remString[0] == "") {
              tddivs[dayIndex].innerText = remString[1];
            } else {
              tddivs[dayIndex].innerText = remString[0];
            }
            // console.log(tddivs[dayIndex].innerText);
            if (tddivs[dayIndex].innerText.trim().split(" ").length < 4)
              tddivs[dayIndex].style.backgroundColor = "transparent";
          }
        });
      });

      // remove from sectionAddedDetails

      let reqclsnum = res.data[0]["Class Nbr"];
      sectionAddedDetails = sectionAddedDetails.filter((val) => {
        if (val.split(":")[1] != reqclsnum) return val;
      });

      // console.log(sectionAddedDetails);

      // move to available section List

      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText =
        res.data[0].Subject +
        res.data[0].Catalog +
        " " +
        res.data[0]["Course Title"] +
        " " +
        res.data[0].Section;

      let addIcon = document.createElement("i");
      addIcon.className = "material-icons";
      addIcon.innerText = "add";
      addIcon.style.float = "right";

      addIcon.addEventListener("click", () =>
        addToTT(res.data[0]["Class Nbr"], collit)
      );

      collit.appendChild(addIcon);
      sectionAvldiv.insertBefore(
        collit,
        sectionAvldiv.firstElementChild.nextSibling
      );
    })
    .catch((err) => {
      // console.log(err);
    });
};

const addToTT = (csNr, collitp) => {
  collitp.remove();
  axios
    .get("https://acbdata.herokuapp.com/timings", {
      params: {
        clsNbr: csNr,
      },
    })
    .then((res) => {
      // console.log(res.data);
      if (!saveButton.className.includes("disabled"))
        saveButton.classList.toggle("disabled");
      // // console.log(
      //   res.data["Class Pattern"],
      //   res.data["Mtg Start"],
      //   res.data["End time"]
      // );
      // add to timetable
      // console.log(res.data);

      finalDetails = [];
      finalDetails.push(res.data[0]);

      if (res.data.length != 1) {
        for (let i = 1; i < res.data.length; i++) {
          if (
            res.data[i]["Class Pattern"] + res.data[i]["Mtg Start"] !=
            res.data[i - 1]["Class Pattern"] + res.data[i - 1]["Mtg Start"]
          )
            finalDetails.push(res.data[i]);
        }
      }

      // console.log(finalDetails);

      finalDetails.forEach((data) => {
        let startTime = parseInt(data["Mtg Start"].split(":")[0], 10);
        if (startTime < 8) startTime += 12;
        let endTime = parseInt(data["End time"].split(":")[0], 10);
        if (endTime < 8) endTime += 12;
        if (data["End time"].split(":")[1] != "00") endTime++;

        let clsPtrn = data["Class Pattern"];

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
                data.Subject + data.Catalog + " " + data.Section;
            else {
              tddivs[dayIndex].innerText +=
                " " + data.Subject + data.Catalog + " " + data.Section;
              tddivs[dayIndex].style.backgroundColor = "#EE6E73";
            }
            tddivs[dayIndex].innerText = tddivs[dayIndex].innerText.trim();
          }
        });
      });

      // move to added section List

      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText =
        res.data[0].Subject +
        res.data[0].Catalog +
        " " +
        res.data[0]["Course Title"] +
        " " +
        res.data[0].Section;

      let addIcon = document.createElement("i");
      addIcon.className = "material-icons";
      addIcon.innerText = "delete";
      addIcon.style.float = "right";

      // add to section Added List
      sectionAddedDetails.push(
        res.data[0].Subject +
          " " +
          res.data[0].Catalog.trim() +
          " " +
          res.data[0].Section +
          ":" +
          res.data[0]["Class Nbr"] +
          ":" +
          res.data[0]["Course ID"]
      );
      sectionAddedclsNbr.add(res.data[0]["Class Nbr"]);
      sectionAddedCourse.add(res.data[0]["Course ID"]);
      addIcon.addEventListener("click", () =>
        removeFromTT(res.data[0]["Class Nbr"], collit)
      );

      collit.appendChild(addIcon);

      sectionAdddiv.appendChild(collit);

      // console.log(sectionAddedDetails);
    })
    .catch((err) => {
      // console.log(err);
    });
};

const getTT = (id, collitp) => {
  let collitParent = collitp.parentElement;
  collitParent.innerHTML = "";
  studentListDiv.style.display = "none";
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
          if (clsDetails.split(":")[1]) {
            sectionAddedclsNbr.add(clsDetails.split(":")[1]);
            sectionAddedCourse.add(clsDetails.split(":")[2]);
          }
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });

      // console.log(sectionAddedDetails);
      // console.log(sectionAddedclsNbr);
      // console.log(sectionAddedCourse);

      tableBodydivs = Array.from(document.querySelector("#tableBody").children);
      // load section List
      axios.get("https://acbdata.herokuapp.com/sectionList").then((res) => {
        document.querySelector("#preSecLoader").style.display = "none";
        document
          .querySelector("#studinfo")
          .querySelector("blockquote").innerText = id;
        backButton.style.display = "inline-block";
        sectionAvldiv.style.display = "block";
        sectionAdddiv.style.display = "block";

        // remove duplicate data

        if (!sectionAddedclsNbr.has(res.data[0]["Class Nbr"]))
          sectionAvailable.push(res.data[0]);

        for (let i = 1; i < res.data.length; i++) {
          if (res.data[i]["Class Nbr"] != res.data[i - 1]["Class Nbr"]) {
            if (!sectionAddedclsNbr.has(res.data[i]["Class Nbr"]))
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
      // console.log(err);
    });
};

// Load Students List
// console.log("is this executing?");
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
