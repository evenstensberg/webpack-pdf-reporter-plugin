#!/usr/bin/env node
const fs = require("fs");
const { promises: Fs } = require("fs");

const path = require("path");
const PDFDocument = require("pdfkit");

const doc = new PDFDocument({
  size: "A4",
  info: {
    Title: "Webpack detailed Compilation info",
    Author: "Even Stensberg",
  },
});

async function exists(path) {
  try {
    await Fs.access(path);
    return true;
  } catch {
    return false;
  }
}
const tmpDirFolder = path.resolve("/tmp");

function getFilenamePrefix() {
  const date = new Date();

  const timeStr = date.toLocaleTimeString("en-US", { hour12: false });
  const dateParts = date
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/");
  dateParts.unshift(dateParts.pop());
  const dateStr = dateParts.join("-");

  const filenamePrefix = `webpack-compilation_${dateStr}_${timeStr}.pdf`;
  // replace characters that are unfriendly to filenames
  return filenamePrefix.replace(/[/?<>\\:*|"]/g, "-");
}

function setCompilationInformation(statsObject) {
  const startTime = new Date(statsObject.startTime);
  const endTime = new Date(statsObject.endTime);
  const diffInSeconds = (endTime.getTime() - startTime.getTime()) / 1000;
  const JSONstats = statsObject.toJson();
  const imagePath = path.resolve(__dirname, "logo-on-white-bg.png");
  doc.image(imagePath, 20, 20, { fit: [100, 100] });
  doc.fontSize(20);
  doc
    .font("Helvetica")
    .text(`Webpack Compilation ${new Date()}`, {
      width: 410,
      align: "center",
    })
    .moveDown(4);

  doc.fontSize(15);

  doc
    .font("Helvetica")
    .text(`Webpack Information`, {
      width: 410,
      align: "left",
    })
    .moveDown(2);

  doc
    .fontSize(11)
    .text(`webpack version: `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${JSONstats.version}`)
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font("Helvetica")
    .text(`Output path: `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${JSONstats.outputPath}`)
    .moveDown(2);

  // compilation info

  doc.fontSize(15);

  doc
    .font("Helvetica")
    .text(`Compilation Summary`, {
      width: 410,
      align: "left",
    })
    .moveDown(2);

  doc
    .fontSize(11)

    .text(`Compilation Hash: `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${statsObject.hash}`)
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .text(`Compilation Start: `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${startTime}`)
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .text(`Compilation End: `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${endTime}`)
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .text(`Time Used (in seconds): `, {
      align: "left",
    })
    .font("Helvetica-Bold")
    .text(`${diffInSeconds}`)
    .moveDown(0.5);

  // Modules

  doc.fontSize(15);
  doc
    .font("Helvetica")
    .text(`Module Information`, {
      width: 410,
      align: "left",
    })
    .moveDown(2);

    JSONstats.modules.forEach(mod => {
        doc
        .fontSize(11)
    
        .text(`Module Name: `, {
          align: "left",
        })
        .font("Helvetica-Bold")
        .text(`${mod.name}`, {
            align: 'left'
        })
        .moveDown(0.5)

        .text(`Module Type: `)
        .font("Helvetica")
        .text(`${mod.moduleType}`)
        .moveDown(0.5)

        .font("Helvetica-Bold")
        .text(`Size: `)
        .font("Helvetica")
        .text(`${mod.size} KB`)
        .moveDown(0.5)

        .font("Helvetica-Bold")
        .text(`Built: `)
        .font("Helvetica")
        .text(`${mod.built}`)
        .moveDown(0.5)

        .font("Helvetica-Bold")
        .text(`Cached: `)
        .font("Helvetica")
        .text(`${mod.cached}`)
        .moveDown(2);
    });
    // Assets

    doc.fontSize(15);
    doc
      .font("Helvetica")
      .text(`Assets Information`, {
        width: 410,
        align: "left",
      })
      .moveDown(2);
      JSONstats.assets.forEach(asset => {
        doc
        .fontSize(11)
    
        .text(`Asset Name: `, {
          align: "left",
        })
        .font("Helvetica-Bold")
        .text(`${asset.name}`, {
            align: 'left'
        })
        .moveDown(0.5)

        .text(`Asset Type: `)
        .font("Helvetica")
        .text(`${asset.type}`)
        .moveDown(0.5)

        .font("Helvetica-Bold")
        .text(`Size: `)
        .font("Helvetica")
        .text(`${asset.size} KB`)
        .moveDown(0.5)

        .font("Helvetica-Bold")
        .text(`Cached: `)
        .font("Helvetica")
        .text(`${asset.cached}`)
        .moveDown(2);
    });
    console.log(JSONstats.assets)
}

class PdfPulgin {
  constructor(options) {}

  apply(compiler) {
    compiler.hooks.done.tapAsync("PDF-Plugin", async (stats) => {
      let statsObject = stats;
      statsObject.nowDate = new Date();
      const outputPath = path.resolve(process.cwd(), `${getFilenamePrefix()}`);
      const tmpName = path.resolve(tmpDirFolder, "stats.json");
      // if folder exists
      const tmpDirExists = await exists(tmpDirFolder);
      if (!tmpDirExists) {
        fs.mkdir(tmpDirFolder, { recursive: true }, (err) => {
          const exists = fs.existsSync(tmpName);
          // if stats.json file doesnt exists
          if (!exists) {
            fs.writeFileSync(tmpName, JSON.stringify(statsObject.toJson()));
            setCompilationInformation(statsObject);
            doc.end();
            return;
          }
          // if exists

          const oldStatsFile = fs.readFileSync(tmpName, "utf8");
          // DIFF Here
        });
        return;
      }

      const statsFileExists = await exists(tmpName);
      // if stats.json file doesnt exists
      if (!statsFileExists) {
        // write stats file to tmp folder
        fs.writeFileSync(tmpName, JSON.stringify(statsObject.toJson()));

        setCompilationInformation(statsObject);

        doc.pipe(fs.createWriteStream(outputPath));
        console.log("Generated PDF at: ", outputPath);
        doc.end();
        return;
      }
      // if exists
      // DIFF
      
      const oldStatsFile = fs.readFileSync(tmpName, "utf8");
    });
  }
}

module.exports = PdfPulgin;

// TODO:

// 1. Store json files in a data structure
// 2. compare two stats files
// 3. output to PDF
