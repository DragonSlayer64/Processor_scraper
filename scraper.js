import nodefetch from "node-fetch";
import fetch from "node-fetch";
import promptSync from "prompt-sync";
const prompt = promptSync();

async function getProcessorData() {
  try {
    const response = await fetch(
      "https://en.wikipedia.org/wiki/Comparison_of_Intel_processors"
    );
    const responseText = await response.text();
    let dataPosition = responseText.indexOf("<td><a");
    let processors = [];
    while (dataPosition !== -1) {
      let trTag = responseText.slice(dataPosition - 5, dataPosition - 1);
      if (trTag === "<tr>") {
        let dataPositionBegin = responseText.indexOf(">", dataPosition + 6);
        let dataPositionEnd = responseText.indexOf("<", dataPositionBegin);
        const proc = responseText.slice(dataPositionBegin + 1, dataPositionEnd);
        processors.push(proc);
      }
      dataPosition = responseText.indexOf("<td><a", dataPosition + 6);
    }
    let position = findTr(responseText, 0);
    let years = [];
    while (position !== -1) {
      position = find4thTd(responseText, position);
      if (position === -1) break;
      let year = getYear(responseText, position);
      position = findTr(responseText, position);
      if (findTr === -1) break;
      if (year === "N/A " || position === -1) {
        break;
      }
      if (!years.includes(year)) years.push(year);
    }
    return { processors, years };
  } catch (error) {
    console.error(error);
  }
}

function findTr(response, position) {
  position = response.indexOf("<tr>", position);
  if (position === -1) return -1;
  return position;
}

function find4thTd(response, position) {
  let i = 0;
  while (i < 4 && position !== -1) {
    position = response.indexOf("<td>", position + 4);
    i++;
  }
  return position;
}
function getYear(response, position) {
  if (position === -1) return "N/A";
  let yearRegex = /(19|20)\d{2}/;
  let year = response.slice(position + 4).match(yearRegex);
  if (year) {
    return year[0];
  }
  return "N/A";
}


const data = await getProcessorData();
console.log(data);

const userYear = prompt("What year does your processor have? ");

let filteredProcessors = [];
for (let i = 0; i < data.years.length; i++) {
  if (data.years[i] === userYear) {
    filteredProcessors.push(data.processors[i]);
  }
}
console.log(filteredProcessors);
