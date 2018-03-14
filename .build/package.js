var svgexport = require('svgexport');
var fs = require('fs');
var glob = require("glob")
const path = require('path');

var tempDir = "tmp"
var pngTempDir = path.join(tempDir, "png");
var jpgTempDir = path.join(tempDir, "jpg");

if (!fs.existsSync(tempDir)) { fs.mkdirSync(tempDir); }
if (!fs.existsSync(pngTempDir)) { fs.mkdirSync(pngTempDir); }
if (!fs.existsSync(jpgTempDir)){ fs.mkdirSync(jpgTempDir); }

glob("**/*.svg", (error, filePaths) => {
    var conversionData = [];
    filePaths.forEach(filePath => {
        var folderName = path.dirname(filePath);
        var fileName = path.basename(filePath, '.svg');
        conversionData.push({
            "input": [
                filePath
            ],
            "output": [
                [
                    path.join(pngTempDir, folderName, fileName + '.png'),
                    "4x"
                ],
                [
                    path.join(jpgTempDir, folderName, fileName + '.jpg'),
                    "4x",
                    "85%",
                    "svg { background: #ffffff; }"
                ]
            ]
        });
    });
    console.dir(conversionData, { depth: 5, colors: true });
    svgexport.render(conversionData, () => {});
});
