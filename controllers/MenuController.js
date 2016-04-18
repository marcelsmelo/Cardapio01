const Menu = require('../models/MenuModel.js');
const qrCode = require('qr-image');
var fs = require('fs');
var path = require('path');

module.exports = {
  find: (req, res, next) =>{
    const userID = req.query.userID;

    Menu.findOne({userID:userID}).then(
      (data)=>{
        if(data != null){
          const card = data.cardapio;
          for(c in card){
            console.log('Categoria ',c);
            const itens = card[c];
            itens.forEach((element, index)=>{
              console.log('item '+index+': ' ,element);
            });
          }
          res.json({success: true, data: data});
        }else{
          res.json({success: false, msg: 'Nenhum cardápio encontrado para o usuário logado'});
        }
      },
      (err)=>{
        console.log(err);
        res.json({success: false, err: err});
      }
    );
  },

  new:(req, res, next) =>{
    const user = req.userDecoded;
    if(!user){
      res.status(404).json({success: false, msg: 'User logged required... '});
    }

    var cardapio = {
      categoria1: [
        {name: 'teste1.1', descripton: 'teste1.1', price:'teste1.1'},
        {name: 'teste1.2', descripton: 'teste1.2', price:'teste1.2'},
        {name: 'teste1.3', descripton: 'teste1.3', price:'teste1.3'}
      ],
      categoria2: [
        {name: 'teste2.1', descripton: 'teste2.1', price:'teste2.1'},
        {name: 'teste2.2', descripton: 'teste2.2', price:'teste2.2'},
        {name: 'teste2.3', descripton: 'teste2.3', price:'teste2.3'}
      ],
    };

    const newMenu = new Menu({userID: user._id, cardapio: cardapio});

    newMenu.save().then(
      (menu)=>{
        console.log(menu);
        res.status(200).json({success: true, data: menu});
      },
      (err)=>{
        console.log(err);
        res.status(404).json({success: false, err: err});
      }
     );
  },

  generateQRCode: (req, res, next) =>{
    const user = req.userDecoded;
    if(!user){
      res.status(404).json({success: false, msg: 'User logged required... '});
    }
    const imagePath = path.join(__dirname, '../public/qrCodes/', user._id+'.png');

    const code = qrCode.image('teste para testar', {type: 'png', size: 10, margin: 2});
    const output = fs.createWriteStream(imagePath);
    code.pipe(output);

    res.status(200).json({success: true, msg:'QR Code Generate on '});
  }
}
