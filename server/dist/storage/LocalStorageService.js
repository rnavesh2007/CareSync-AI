"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.LocalStorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class LocalStorageService {
    baseDir;
    baseUrl;
    constructor(baseDir, baseUrl = '/uploads') {
        this.baseDir = baseDir || path_1.default.resolve(process.cwd(), 'uploads');
        this.baseUrl = baseUrl;
        this.ensureDirectoryExists(this.baseDir);
    }
    ensureDirectoryExists(dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    async saveFile(fileBuffer, fileName, mimeType, folder = 'reports') {
        const targetFolder = path_1.default.join(this.baseDir, folder);
        this.ensureDirectoryExists(targetFolder);
        const safeName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fullPath = path_1.default.join(targetFolder, safeName);
        await fs_1.default.promises.writeFile(fullPath, fileBuffer);
        const relativePath = path_1.default.posix.join(folder, safeName);
        const url = `${this.baseUrl}/${relativePath}`;
        return {
            fileName: safeName,
            originalName: fileName,
            mimeType,
            size: fileBuffer.length,
            filePath: fullPath,
            url,
        };
    }
    async getFileStream(filePath) {
        if (!fs_1.default.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fs_1.default.createReadStream(filePath);
    }
    async deleteFile(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
                return true;
            }
            return false;
        }
        catch {
            return false;
        }
    }
    getFileUrl(filePath) {
        const relative = path_1.default.relative(this.baseDir, filePath).replace(/\\/g, '/');
        return `${this.baseUrl}/${relative}`;
    }
}
exports.LocalStorageService = LocalStorageService;
exports.storageService = new LocalStorageService();
