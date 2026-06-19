const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        downloadFile(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const binDir = path.join(process.cwd(), "bin");
  const targetBinary = path.join(binDir, process.platform === "win32" ? "typst.exe" : "typst");

  // If binary already exists, skip
  if (fs.existsSync(targetBinary)) {
    console.log("Typst binary already exists at", targetBinary);
  } else {
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    const platform = process.platform;
    const arch = process.arch;
    let downloadUrl = "";
    let archiveName = "";

    console.log(`Current platform: ${platform}, arch: ${arch}`);

    if (platform === "linux" && arch === "x64") {
      archiveName = "typst-x86_64-unknown-linux-musl.tar.xz";
      downloadUrl = `https://github.com/typst/typst/releases/download/v0.14.2/${archiveName}`;
    } else if (platform === "darwin" && arch === "x64") {
      archiveName = "typst-x86_64-apple-darwin.tar.xz";
      downloadUrl = `https://github.com/typst/typst/releases/download/v0.14.2/${archiveName}`;
    } else if (platform === "darwin" && arch === "arm64") {
      archiveName = "typst-aarch64-apple-darwin.tar.xz";
      downloadUrl = `https://github.com/typst/typst/releases/download/v0.14.2/${archiveName}`;
    } else if (platform === "win32" && arch === "x64") {
      archiveName = "typst-x86_64-pc-windows-msvc.zip";
      downloadUrl = `https://github.com/typst/typst/releases/download/v0.14.2/${archiveName}`;
    }

    if (downloadUrl) {
      const archivePath = path.join(binDir, archiveName);
      console.log(`Downloading Typst from ${downloadUrl}...`);
      try {
        await downloadFile(downloadUrl, archivePath);
        console.log("Download complete. Extracting...");

        if (archiveName.endsWith(".tar.xz")) {
          // Use tar command to extract
          execSync(`tar -xf "${archivePath}" -C "${binDir}"`);
          const folderName = archiveName.replace(".tar.xz", "");
          const extractedBinary = path.join(binDir, folderName, "typst");
          fs.renameSync(extractedBinary, targetBinary);
          fs.rmSync(path.join(binDir, folderName), { recursive: true, force: true });
        } else if (archiveName.endsWith(".zip")) {
          execSync(`powershell -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${binDir}' -Force"`);
          const folderName = archiveName.replace(".zip", "");
          const extractedBinary = path.join(binDir, folderName, "typst.exe");
          fs.renameSync(extractedBinary, targetBinary);
          fs.rmSync(path.join(binDir, folderName), { recursive: true, force: true });
        }

        fs.unlinkSync(archivePath);

        if (platform !== "win32") {
          fs.chmodSync(targetBinary, "755");
        }

        console.log("Typst binary installed successfully to", targetBinary);
      } catch (err) {
        console.error("Failed to download or install Typst binary:", err);
      }
    } else {
      console.log("Unsupported platform/architecture for automatic typst download.");
    }
  }

  // Next, download Sarabun fonts
  const fontsDir = path.join(process.cwd(), "fonts");
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const fonts = [
    { name: "Sarabun-Regular.ttf", url: "https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Regular.ttf" },
    { name: "Sarabun-Bold.ttf", url: "https://github.com/google/fonts/raw/main/ofl/sarabun/Sarabun-Bold.ttf" }
  ];

  for (const font of fonts) {
    const fontPath = path.join(fontsDir, font.name);
    if (!fs.existsSync(fontPath)) {
      console.log(`Downloading font ${font.name}...`);
      try {
        await downloadFile(font.url, fontPath);
        console.log(`Font ${font.name} downloaded successfully.`);
      } catch (err) {
        console.error(`Failed to download font ${font.name}:`, err);
      }
    } else {
      console.log(`Font ${font.name} already exists.`);
    }
  }
}

main().catch(console.error);
