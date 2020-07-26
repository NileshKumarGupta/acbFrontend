const studentListDiv = document.querySelector("#studentList");
const sectionAvldiv = document.querySelector("#sectionAvailable");
const sectionAdddiv = document.querySelector("#sectionAdded");
const validateButton = document.querySelector("#validateButton");
const saveButton = document.querySelector("#saveButton");
const backButton = document.querySelector("#backButton");
const filter = document.querySelector("#filter");
const backendString = "https://acbdata.herokuapp.com";

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

// download all students timetable

const downloadAll = () => {
  axios
    .get(backendString + "/student2")
    .then((res) => {
      let studentList = res.data;
      let totalData = ["StudentID, StudentName, Section, ClassNbr"];
      let studentProcessed = 0;
      studentList.forEach((student) => {
        axios
          .get(backendString + "/student2/tt", {
            params: {
              studid: student.studid,
            },
          })
          .then((response) => {
            console.log(response.data.tt);
            let studenttt = response.data.tt;
            console.log(studenttt);
            let ttstring = studenttt.join(",");
            let studentCourses = new Set();
            ttstring.split(",").forEach((detail) => {
              if (!detail || detail == "-") return;
              studentCourses.add(detail);
            });
            // Department, Course, Section : classnbr
            Array.from(studentCourses).forEach((courseDetail) => {
              console.log(courseDetail);
              let strow = "";
              strow += student.studid + ",";
              strow += student.name + ",";
              strow +=
                courseDetail.split(" ")[0] +
                courseDetail.split(" ")[1] +
                "-" +
                courseDetail.split(" ")[2].split(":")[0] +
                ",";
              strow += courseDetail.split(":")[1];
              totalData.push(strow);
            });
            studentProcessed++;
            if (studentProcessed == studentList.length) {
              console.log("this was called");
              let csvString = totalData.join("%0A");
              // let downloadFileButton = document.querySelector(
              //   "#downloadAllButton"
              // );
              let downloadFileButton = document.querySelector("#dummyLink");
              downloadFileButton.href = "data:attachment/csv," + csvString;
              downloadFileButton.target = "_blank";
              downloadFileButton.download = "All Students" + ".csv";
              downloadFileButton.click();
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
      return true;
    })
    .catch((err) => console.log(err));
};
document
  .querySelector("#downloadAllButton")
  .addEventListener("click", downloadAll);

// update Student List
document.querySelector("#upStButton").addEventListener("click", () => {
  // let csvDownload = downloadAll();
  let files = document.querySelector("#listInput").files;
  if (!files) return;
  let file = files[0];
  let reader = new FileReader();

  reader.readAsBinaryString(file);

  reader.onload = () => {
    let workbook = XLSX.read(reader.result, {
      type: "binary",
    });
    workbook.SheetNames.forEach((sheetName) => {
      let data = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName],
        { raw: false }
      );
      console.log(data);

      if (!(data[0]["studid"] && data[0]["name"])) return;

      console.log(data);
      axios
        .put(backendString + "/slDelete2")
        .then((res) => {
          M.toast({ html: "Saving" });
          axios
            .post(backendString + "/slUpdate2", {
              studentData: data,
            })
            .then((res) => {
              M.toast({ html: "Successfully Saved" });
              /*
              setTimeout(
                () => (window.location = "https://acbalt2.netlify.app"),
                5000
              );
              */
              setInterval(() => {
                if (csvDownload)
                  window.location = "https://acbalt2.netlify.app";
              }, 500);
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    });
  };
});

// update timetable
document.querySelector("#upTtButton").addEventListener("click", () => {
  let files = document.querySelector("#ttInput").files;
  if (!files) return;
  let file = files[0];
  let reader = new FileReader();

  console.log("This function is executing");

  reader.readAsBinaryString(file);

  reader.onload = () => {
    let workbook = XLSX.read(reader.result, {
      type: "binary",
    });
    workbook.SheetNames.forEach((sheetName) => {
      let data = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName],
        { raw: false }
      );
      console.log("dataLoaded");
      console.log(data);

      if (!data[0]["Course ID"]) return;
      console.log(data);
      console.log(data.slice(0, 100));

      axios
        .put(backendString + "/ttdelete")
        .then((res) => {
          let total = 1;
          console.log(res);
          let last = 0;
          let end = Math.min(50, data.length - 1);
          while (end != data.length) {
            axios
              .post(backendString + "/ttUpdate", {
                courseData: data.slice(last, end),
              })
              .then((res) => {
                total++;
                M.toast({ html: "Saving" });
              })
              .catch((err) => console.log(err));
            last = end;
            end = Math.min(last + 50, data.length);
          }

          setInterval(() => {
            if (total >= data.length / 50) {
              total = 0;
              M.toast({ html: "Succesfully Saved" });
              setTimeout(
                () => (window.location = "https://acbalt2.netlify.app"),
                2000
              );
            }
          }, 2000);
        })
        .catch((err) => console.log(err));
    });
  };
});

document.querySelector("#upPqButton").addEventListener("click", () => {
  let files = document.querySelector("#PqInput").files;
  if (!files) return;
  let file = files[0];
  let reader = new FileReader();

  console.log("This function is executing");

  reader.readAsBinaryString(file);

  reader.onload = () => {
    let workbook = XLSX.read(reader.result, {
      type: "binary",
    });
    workbook.SheetNames.forEach((sheetName) => {
      let data = XLSX.utils.sheet_to_row_object_array(
        workbook.Sheets[sheetName],
        { raw: false }
      );
      console.log("dataLoaded");

      if (!data[0]["Course ID"]) return;
      console.log(data);
      console.log(data.slice(0, 100));

      axios
        .put(backendString + "/pqdelete")
        .then((res) => {
          let total = 1;
          let last = 0;
          let end = Math.min(50, data.length - 1);
          while (end != data.length) {
            last = end;
            end = Math.min(last + 50, data.length);
            axios
              .post(backendString + "/pqUpdate", {
                courseData: data.slice(last, end),
              })
              .then((res) => {
                total++;
                M.toast({ html: "Saving" });
              })
              .catch((err) => console.log(err));
          }

          setInterval(() => {
            if (total >= data.length / 50) {
              total = 0;
              M.toast({ html: "Succesfully Saved" });
              setTimeout(
                () => (window.location = "https://acbalt2.netlify.app"),
                2000
              );
            }
          }, 2000);
        })
        .catch((err) => console.log(err));
    });
  };
});

// search function
filter.addEventListener("keyup", () => {
  let text = filter.value.toUpperCase();
  Array.from(sectionAvldiv.children).forEach((li) => {
    if (li.tagName == "INPUT" || li.tagName == "DIV") return;
    if (!li.innerText.includes(text)) li.style.display = "none";
    else li.style.display = "block";
  });
});

// backButton function
backButton.addEventListener("click", () => {
  if (confirm("Warning: All unsaved data will be lost"))
    window.location = "https://acbalt2.netlify.com";
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
    .get(backendString + "/exams", {
      params: {
        clsnr: clnrstr,
      },
    })
    .then((res) => {
      document
        .querySelector("#examClashList")
        .querySelector(".preloader-wrapper").style.display = "none";
      examSchedule = new Set();
      console.log(res.data);
      res.data.forEach((info) => {
        if (!info.hasOwnProperty("Exam Tm Cd")) return;
        let examstr = info["COURSETITLE"] + ":" + info["Exam Tm Cd"];
        "" + info["Exam Date"];
        examSchedule.add(examstr);
      });
      console.log(examSchedule);
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
      console.log(err);
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
    .get(backendString + "/prst", {
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

// Add saveButton event listener
saveButton.addEventListener("click", () => {
  let toSendData = [];
  tableBodydivs.forEach((tr) => {
    let trData = "";
    Array.from(tr.children).forEach((td) => {
      if (td.innerText.includes("00")) return;
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
  // console.log(toSendData.toString());
  M.toast({ html: "Saving" });
  axios
    .put(backendString + "/student2/" + currentID, {
      id: currentID,
      tt: toSendData,
    })
    .then(() => {
      M.toast({ html: "Successfully saved" });
      saveButton.href = "index.html";
      window.location = "https://acbalt2.netlify.app";
    })
    .catch((err) => {
      console.log(err);
    });
});

// Add validate button event listener
validateButton.addEventListener("click", () => {
  let timeValidate = true;
  tableBodydivs.forEach((trow) => {
    Array.from(trow.children).forEach((tdata) => {
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
    .get(backendString + "/exams", {
      params: {
        clsnr: clnrstr,
      },
    })
    .then((res) => {
      examSchedule = new Set();
      res.data.forEach((info) => {
        if (!info.hasOwnProperty("Exam Tm Cd")) return;
        let examstr =
          info["COURSETITLE"] + ":" + info["Exam Tm Cd"] + info["Exam Date"];
        examSchedule.add(examstr);
      });
      console.log(examSchedule);
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
  console.log(csNr);
  collitp.remove();
  axios
    .get(backendString + "/timings", {
      params: {
        clsNbr: csNr,
      },
    })
    .then((res) => {
      finalDetails = [];
      finalDetails.push(res.data[0]);

      // remove from sectionAddedDetails

      let reqclsnum = res.data[0]["Class Nbr"];
      sectionAddedDetails = sectionAddedDetails.filter((val) => {
        if (val.split(":")[1] != reqclsnum) return val;
      });

      // move to available section List

      let collit = document.createElement("a");
      collit.href = "#";
      collit.className = "collection-item";
      collit.innerText =
        res.data[0].Subject +
        res.data[0].Catalog +
        " " +
        res.data[0]["COURSETITLE"] +
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
      // remove from timetable
      if (!res.data[0].hasOwnProperty("Mtg Start")) return;
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
          if (clsPtrn[i] == "M") days.push(1);
          if (clsPtrn[i] == "W") days.push(3);
          if (clsPtrn[i] == "F") days.push(5);
          if (clsPtrn[i] == "S") days.push(6);
          if (clsPtrn[i] == "T")
            if (clsPtrn[i + 1] == "H") days.push(4);
            else days.push(2);
        }
        days.forEach((dayIndex) => {
          for (let i = startTime; i != endTime; i++) {
            let tddivs = Array.from(tableBodydivs[i - 8].children);
            let reqString =
              data.Subject + " " + data.Catalog.trim() + " " + data.Section;

            let remString = tddivs[dayIndex].innerText.split(reqString);
            if (remString[0] == "" && remString[1] == "") {
              tddivs[dayIndex].innerText = "-";
            } else if (remString[0] == "") {
              tddivs[dayIndex].innerText = remString[1];
            } else {
              tddivs[dayIndex].innerText = remString[0];
            }
            if (tddivs[dayIndex].innerText.trim().split(" ").length < 4)
              tddivs[dayIndex].style.backgroundColor = "transparent";
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
const addToTT = (csNr, collitp) => {
  collitp.remove();
  axios
    .get(backendString + "/timings", {
      params: {
        clsNbr: csNr,
      },
    })
    .then((res) => {
      if (!saveButton.className.includes("disabled"))
        saveButton.classList.toggle("disabled");

      finalDetails = [];
      finalDetails.push(res.data[0]);

      if (res.data.length != 1) {
        for (let i = 1; i < res.data.length; i++) {
          let present = false;
          for (let j = 0; j < finalDetails.length; j++) {
            if (
              res.data[i]["Class Pattern"] + res.data[i]["Mtg Start"] ==
              finalDetails[j]["Class Pattern"] + finalDetails[j]["Mtg Start"]
            )
              present = true;
          }
          if (!present) finalDetails.push(res.data[i]);
        }
      }

      console.log(finalDetails);

      finalDetails.forEach((data) => {
        if (!data.hasOwnProperty("Mtg Start")) return;
        let startTime = parseInt(data["Mtg Start"].split(":")[0], 10);
        if (startTime < 8) startTime += 12;
        let endTime = parseInt(data["End time"].split(":")[0], 10);
        if (endTime < 8) endTime += 12;
        if (data["End time"].split(":")[1] != "00") endTime++;

        let clsPtrn = data["Class Pattern"];

        let days = [];
        for (let i = 0; i < clsPtrn.length; i++) {
          if (clsPtrn[i] == "M") days.push(1);
          if (clsPtrn[i] == "W") days.push(3);
          if (clsPtrn[i] == "F") days.push(5);
          if (clsPtrn[i] == "S") days.push(6);
          if (clsPtrn[i] == "T")
            if (clsPtrn[i + 1] == "H") days.push(4);
            else days.push(2);
        }
        days.forEach((dayIndex) => {
          for (let i = startTime; i != endTime; i++) {
            let tddivs = Array.from(tableBodydivs[i - 8].children);
            if (tddivs[dayIndex].innerText == "-")
              tddivs[dayIndex].innerText =
                data.Subject + " " + data.Catalog + " " + data.Section;
            else {
              tddivs[dayIndex].innerText +=
                " " + data.Subject + " " + data.Catalog + " " + data.Section;
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
        " " +
        res.data[0].Catalog +
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
    });
  // .catch((err) => {
  //   console.log(err);
  // });
};

const getTT = (id, collitp) => {
  let collitParent = collitp.parentElement;
  collitParent.innerHTML = "";
  studentListDiv.style.display = "none";
  document.querySelector("#uploadData").style.display = "none";
  document.querySelector("#slt").style.display = "none";
  document.querySelector("#preSecLoader").style.display = "block";
  document.querySelector("#toHide").style.display = "none";
  document.querySelector("#downloadAllButton").style.display = "none";
  axios
    .get(backendString + "/student2/tt", {
      params: {
        studid: id,
      },
    })
    .then((res) => {
      currentID = id;
      // make rows according to the table body
      let dayBeginTime = 8;
      res.data.tt.forEach((hrRow) => {
        let tr = document.createElement("tr");

        // Current Format of data
        // rows of data according to each hour - delimiter ','
        // classnumber delimiter ':'

        // add time
        let td = document.createElement("td");
        td.innerText = dayBeginTime++ + ":00";
        tr.appendChild(td);

        hrRow.split(",").forEach((clsDetails) => {
          let td = document.createElement("td");
          td.innerText = clsDetails.split(":")[0];

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

      tableBodydivs = Array.from(document.querySelector("#tableBody").children);
      // load section List
      axios.get(backendString + "/sectionList").then((res) => {
        document.querySelector("#preSecLoader").style.display = "none";
        document.querySelector("#sectionAddedHeading").style.display = "block";
        document.querySelector("#sectionAvailableHeading").style.display =
          "block";
        document
          .querySelector("#studinfo")
          .querySelector("blockquote").innerText = id;
        backButton.style.display = "inline-block";
        sectionAvldiv.style.display = "block";
        sectionAdddiv.style.display = "block";

        let downloadFileButton = document.querySelector("#downloadButton");
        downloadFileButton.style.display = "inline-block";
        downloadFileButton.addEventListener("click", () => {
          let thead = Array.from(
            document.querySelector("thead").children[0].children
          );
          let header = thead.reduce(
            (text, el) => text + el.innerText + ",",
            ""
          );
          let data = [];
          data.push(header);
          for (let i = 0; i < tableBodydivs.length; i++) {
            data.push(
              Array.from(tableBodydivs[i].children).reduce(
                (text, el) => text + el.innerText + ",",
                ""
              )
            );
          }

          let csvString = data.join("%0A");
          downloadFileButton.href = "data:attachment/csv," + csvString;
          downloadFileButton.target = "_blank";
          downloadFileButton.download = id + ".csv";
        });

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
          // console.log(element);
          let collit = document.createElement("a");
          collit.href = "#";
          collit.className = "collection-item";
          collit.innerText =
            element.Subject +
            element.Catalog +
            " " +
            element["COURSETITLE"] +
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
    });
  // .catch((err) => {
  //   console.log(err);
  // });
};

axios
  .get(backendString + "/student2")
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
