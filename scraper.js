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
        const proc = responseText.slice(
          dataPositionBegin + 1,
          dataPositionEnd
        );
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
    throw new Error("Failed to fetch processor data: " + error.message);
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

async function showProcessorInfo(processor) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/wiki/${processor}`
    );
    const responseText = await response.text();
    const infoBegin = responseText.indexOf("<table class=\"infobox");
    const infoEnd = responseText.indexOf("</table>", infoBegin) + 8;
    const processorInfo = responseText.slice(infoBegin, infoEnd);
    console.log("Processor Information for " + processor + ":");
    console.log(processorInfo);
  } catch (error) {
    throw new Error("Failed to fetch processor info: " + error.message);
  }
}

async function main() {
  const data = await getProcessorData();
  console.log("Available Processors:");
  console.log(data.processors);

  const userYear = prompt("Enter the year of your processor: ");
  
  let filteredProcessors = [];
  for (let i = 0; i < data.years.length; i++) {
    if (data.years[i] === userYear) {
filteredProcessors.push(data.processors[i]);
}
}

if (filteredProcessors.length === 0) {
console.log("No processors found for the entered year.");
} else {
console.log("Processors available for the entered year:");
console.log(filteredProcessors);


const userSelection = prompt("Enter the index of the processor to view more information: ");
const selectedIndex = parseInt(userSelection);

if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= filteredProcessors.length) {
  console.log("Invalid selection. Exiting...");
} else {
  const selectedProcessor = filteredProcessors[selectedIndex];
  console.log("Selected Processor: " + selectedProcessor);
  await showProcessorInfo(selectedProcessor);
}
}
}

main();




