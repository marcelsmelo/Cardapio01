//Upload de imagem
  const multer = require('multer');
  const multerConfig = multer({
      //dest: 'uploads/',
      storage: multer.memoryStorage(),
      fileFilter: imageFilter,
      limits: { fileSize: 1048576 }
  });

  function imageFilter (req, file, cb) {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
      cb(null, true);
    }else{
      cb('Formato de arquivo não suportado!', false);
    }
}

module.exports = multerConfig;
