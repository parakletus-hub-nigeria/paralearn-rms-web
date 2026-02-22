const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let modified = 0;
walkDir('./src', function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        if (content.includes('react-toastify')) {
            // Replace imports
            let newContent = content.replace(/from ['"]react-toastify['"]/g, 'from "sonner"');
            
            // Remove ToastContainer
            newContent = newContent.replace(/,\s*ToastContainer\s*}/g, '}');
            newContent = newContent.replace(/{\s*ToastContainer\s*,/g, '{');
            newContent = newContent.replace(/{\s*ToastContainer\s*}/g, '');
            
            // Cleanup empty imports
            newContent = newContent.replace(/import\s*{\s*}\s*from\s*"sonner";?[\r\n]*/g, '');
            
            // Remove CSS
            newContent = newContent.replace(/import ['"]react-toastify\/dist\/ReactToastify\.css['"];?[\r\n]*/g, '');
            
            if (content !== newContent) {
                fs.writeFileSync(filePath, newContent);
                console.log('Updated ' + filePath);
                modified++;
            }
        }
    }
});

console.log('Total files modified: ' + modified);
