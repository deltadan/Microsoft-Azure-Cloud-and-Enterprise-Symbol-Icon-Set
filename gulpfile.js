var gulp = require('gulp');
var svgexport = require('svgexport');
var fs = require('fs-extra');
var archiver = require('archiver');
var glob = require("glob")
const path = require('path');
var formats = require('./gulpconfig.json');
var imageGenDir = "gen";
var archiveDir = "zip";
var symbolsDir = "Symbols";
gulp.task('default', function() {
    if (!fs.existsSync(imageGenDir)) { 
        fs.mkdirSync(imageGenDir); 
    }    
    formats.forEach(format => {
        var formatDir = path.join(imageGenDir, format.name);
        if (!fs.existsSync(formatDir)) {
            fs.mkdirSync(formatDir);
        }
        var promises = [];
        format.categories.forEach(category => {
            category.styles.forEach(style => {
                var promise = generateImages(category.name, style.name, format.name, format.extension, format.convert, style.options)
                promises.push(promise);
            })
        });
        Promise.all(promises).then(() => {
            createArchive(format.name, format.archiveFile);
        });        
    });
});
function generateImages(imageCategory, imageStyle, folderName, fileExtension, convert, extraOptions) {
    var directory = path.join(symbolsDir, imageStyle, imageCategory);
    var filePaths = glob.sync("**/*.svg", { cwd: directory });
    var conversionData = [];
    filePaths.forEach(filePath => {
        var fileName = path.basename(filePath, '.svg');
        var sourceFile = path.join(directory, filePath);
        var nameSuffix = imageStyle == "Color" ? "-color" : "";
        var destFile = path.join(imageGenDir, folderName, imageCategory, fileName + nameSuffix + fileExtension);
        console.dir(destFile);
        console.dir(sourceFile);
        if (convert) {
            var dataParameters = {
                "input": [
                    sourceFile
                ],
                "output": []
            };
            var options = [
                destFile
            ];
            dataParameters.output.push(options.concat(extraOptions));
            conversionData.push(dataParameters);
        }
        else {
            fs.copySync(sourceFile, destFile);
        }
    });
    console.dir(conversionData, { depth: 5, colors: true });
    return new Promise((resolve, reject) => {
        svgexport.render(conversionData, () => {
            resolve();
        });
    });
}
function createArchive(folderName, archiveFileName) {
    if (!fs.existsSync(archiveDir)) { 
        fs.mkdirSync(archiveDir); 
    }    
    var output = fs.createWriteStream(path.join(archiveDir, archiveFileName));
    console.log("Creating zip file: " + archiveFileName)
    var archive = archiver('zip', {
        zlib: { level: 9 }
    });
    archive.pipe(output);
    archive.directory(path.join(imageGenDir, folderName), false);
    archive.finalize();
}