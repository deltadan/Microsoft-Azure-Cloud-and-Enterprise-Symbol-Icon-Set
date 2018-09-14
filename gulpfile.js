var gulp = require('gulp');
var svgexport = require('svgexport');
var fs = require('fs');
var glob = require("glob")
var archiver = require('archiver');
const path = require('path');
var formats = require('./gulpconfig.json');
var tempDir = "tmp";
var symbolsDir = "Symbols";
gulp.task('default', function() {
    if (!fs.existsSync(tempDir)) { 
        fs.mkdirSync(tempDir); 
    }    
    formats.forEach(format => {
        var formatDir = path.join(tempDir, format.name);
        if (!fs.existsSync(formatDir)) {
            fs.mkdirSync(formatDir);
        }
        format.categories.forEach(category => {
            category.styles.forEach(style => {
                generateImages(category.name, style.name, format.name, format.extension, style.options)
            })
        });
    });
});
function generateImages(imageCategory, imageStyle, folderName, fileExtension, extraOptions) {
    var directory = path.join(symbolsDir, imageStyle, imageCategory);
    glob("**/*.svg", { cwd: directory }, (error, filePaths) => {
        var conversionData = [];
        filePaths.forEach(filePath => {
            var fileName = path.basename(filePath, '.svg');
            var dataParameters = {
                "input": [
                    path.join(directory, filePath)
                ],
                "output": []
            };
            var fileSuffix = imageStyle == "Color" ? "-color" : "";
            var options = [
                path.join(tempDir, folderName, imageCategory, fileName + fileSuffix + fileExtension)
            ];
            dataParameters.output.push(options.concat(extraOptions));
            conversionData.push(dataParameters);
        });
        console.dir(conversionData, { depth: 5, colors: true });
        svgexport.render(conversionData, () => {});
    });
}