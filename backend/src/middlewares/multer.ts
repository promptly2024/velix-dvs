import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// For single file
export const uploadSingleFile = upload.single('file');
// For multiple files
export const uploadMultipleFiles = upload.array('files', 2); 
// For multiple files
export const uploadMultipleFilesCreateListing = upload.array('images', 2);