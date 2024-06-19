const fs = require('fs');
const path = require('path');

module.exports = class DataHandler {
    constructor(DataBaseDir) {
        this.baseDir = DataBaseDir;
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir);
        }
        let cleanup = async () => {
            console.log('[DataHandler] Czyszczenie folderu ./DataBase/TEMP...');
            await this.cleanup();
            process.exit();
        };
        process.once('SIGINT', cleanup);
        process.once('SIGTERM', cleanup);
        process.once('beforeExit', cleanup);
    }
    cleanup() { // usówa folder TEMP
        if (fs.existsSync(`${this.baseDir}/TEMP`)) {
            fs.readdirSync(`${this.baseDir}/TEMP`).forEach((file) => {
                let currentPath = path.join(`${this.baseDir}/TEMP`, file);
                if (fs.lstatSync(currentPath).isDirectory()) {
                    this.removeFolderRecursive(currentPath);
                } else {
                    fs.unlinkSync(currentPath);
                }
            });
        }
    }
    create(category, id, object) { // tworzy plik
        let filePath = path.join(this.baseDir, category, `${id}.json`);
        let data = JSON.stringify(object, null, 2);
        try {
            if (fs.existsSync(filePath)) {
                let existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                let mergedData = { ...existingData, ...object };
                let mergedDataString = JSON.stringify(mergedData, null, 2);
                fs.writeFileSync(filePath, mergedDataString);
            } else {
                fs.mkdirSync(path.join(this.baseDir, category), { recursive: true });
                fs.writeFileSync(filePath, data);
            }
            return true;
        } catch (error) {
            return false;
        }
    }
    delete(id) { // usówa cały plik
        let fileToDelete = this.findFile(id);
        if (fileToDelete) {
            try {
                fs.unlinkSync(fileToDelete);
                return true;
            } catch (error) {
                return false;
            }
        }
        return false;
    }
    get(id) { // zwraca zawartość pliku
        let fileToRead = this.findFile(id);
        if (fileToRead) {
            try {
                let fileData = fs.readFileSync(fileToRead, 'utf8');
                let result = JSON.parse(fileData);
                return result;
            } catch (error) {
                return null;
            }
        }
        return null;
    }
    edit(id, updatedFields) { // pozwala zmienić zawartość danego pliku
        let fileToEdit = this.findFile(id);
        if (fileToEdit) {
        try {
            let fileData = fs.readFileSync(fileToEdit, 'utf8');
            let existingData = JSON.parse(fileData);
            let updatedData = { ...existingData, ...updatedFields };
            let updatedDataString = JSON.stringify(updatedData, null, 2);
            fs.writeFileSync(fileToEdit, updatedDataString);
            return true;
        } catch (error) {
            return false;
        }
        }
        return false;
    }
    findFile(id) { // funkcia sprawdzająca czy plik istnieje, jeśli tak zwraca jego połorzęnie.
        let categories = fs.readdirSync(this.baseDir);
        for (let category of categories) {
            let files = fs.readdirSync(path.join(this.baseDir, category));
            for (let file of files) {
                if (file === `${id}.json`) {
                    return path.join(this.baseDir, category, file);
                }
            }
        }
        return null;
    }
}