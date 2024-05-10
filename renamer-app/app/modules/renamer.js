const { exec } = require("child_process");
const fs = require("fs-extra");
const path = require("path");

function unzipFile(zipPath, outputPath, outputLog) {
  return new Promise((resolve, reject) => {
    exec(`unzip -o "${zipPath}" -d "${outputPath}"`, (error) => {
      if (error) {
        outputLog.push(`Error unzipping file: ${error.message}`);
        reject(error);
      } else {
        outputLog.push(`Unzipped ${zipPath} to ${outputPath}`);
        resolve();
      }
    });
  });
}

function rezipFile(outputZipPath, inputPath, outputLog) {
  return new Promise((resolve, reject) => {
    const absoluteOutputZipPath = path.resolve(outputZipPath);
    const cmd = `cd "${inputPath}" && zip -r "${absoluteOutputZipPath}" .`;
    console.log(cmd);
    outputLog.push(`Executing: ${cmd}`);
    exec(cmd, (error) => {
      if (error) {
        outputLog.push(`Error rezipping file: ${error.message}`);
        reject(error);
      } else {
        outputLog.push(`Rezipped contents of ${inputPath} into ${absoluteOutputZipPath}`);
        resolve();
      }
    });
  });
}

async function buildRenameTable(dirPath, outputLog) {
  let table = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const subTable = await buildRenameTable(fullPath, outputLog);
      table = table.concat(subTable);
    }
  }

  const contentsPath = path.join(dirPath, 'contents.json');
  if (await fs.pathExists(contentsPath)) {
    const contents = await fs.readJson(contentsPath);
    contents.files.forEach(file => {
      if (file.title) {
        const oldPath = path.join(dirPath, file.filename);
        let newPath;
        if (!file.filename.endsWith('/') && !fs.lstatSync(oldPath).isDirectory()) {
          const extension = path.extname(file.filename);
          const newFileName = file.title + extension;
          newPath = path.join(dirPath, newFileName.replace(/[<>:"\/\\|?*]+/g, ''));
        } else {
          const parentDir = path.dirname(oldPath);
          newPath = path.join(parentDir, file.title.replace(/[<>:"\/\\|?*]+/g, ''));
        }
        table.push({ oldPath, newPath });
      }
    });
  }

  return table;
}

async function renameFiles(table, outputLog) {
  for (let { oldPath, newPath } of table) {
    if (oldPath !== newPath && await fs.pathExists(oldPath)) {
      outputLog.push(`RENAME:\n${oldPath} \n---> ${newPath}`);
      await fs.move(oldPath, newPath, { overwrite: true });
    } else if (!await fs.pathExists(oldPath)) {
      outputLog.push(`File not found and cannot be renamed: ${oldPath}`);
    }
  }
}

async function processZip(originalZipPath, outputLog) {
  const tempUnzipDir = path.join(__dirname, 'temp-extract');
  await fs.ensureDir(tempUnzipDir);

  await unzipFile(originalZipPath, tempUnzipDir, outputLog);
  const renameTable = await buildRenameTable(tempUnzipDir, outputLog);
  await renameFiles(renameTable, outputLog);

  const originalFileName = path.basename(originalZipPath, '.zip');
  const outputZipName = `${originalFileName}_renamed.zip`;
  const outputZipPath = path.join(path.dirname(originalZipPath), outputZipName);

  await rezipFile(outputZipPath, tempUnzipDir, outputLog);
  console.log(originalFileName);

  if (await fs.pathExists(outputZipPath)) {
    outputLog.push(`New ZIP file created at: ${outputZipPath}`);
  } else {
    outputLog.push(`Failed to create new ZIP file at: ${outputZipPath}`);
  }

  try {
    await fs.emptyDir(tempUnzipDir);
    await fs.remove(tempUnzipDir);
    outputLog.push('Temporary extraction directory successfully removed.');
  } catch (cleanupError) {
    outputLog.push(`Cleanup error: ${cleanupError.message}`);
  }
}

module.exports = { processZip };
