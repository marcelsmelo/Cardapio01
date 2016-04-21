const Menu = require('../models/MenuModel.js');
const qrCode = require('qr-image');
var fs = require('fs');
var path = require('path');

module.exports = {

  findByUser: (req, res, next) =>{
    const userID = req.params.userID;

    Menu.findOne({userID:userID})
        .populate('userID', '_id name email')
        .then(
      (data)=>{
        if(data != null){
          // const card = data.cardapio;
          // for(c in card){
          //   console.log('Categoria ',c);
          //   const itens = card[c];
          //   itens.forEach((element, index)=>{
          //     console.log('item '+index+': ' ,element);
          //   });
          // }
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

    const categorias = ['categoria1m', 'categoria22m', 'categoria3'];

    const  categoria1 = [
        {name: 'teste1.1m', descripton: 'teste1.1m', price:'teste1.1m'},
        {name: 'teste1.2m', descripton: 'teste1.2m', price:'teste1.2m'},
        {name: 'teste1.3m', descripton: 'teste1.3m', price:'teste1.3m'}
      ];

    const categoria2 = [
        {name: 'teste2.12m', descripton: 'teste2.12m', price:'teste2.12m'},
        {name: 'teste2.22m', descripton: 'teste2.22m', price:'teste2.22m'},
        {name: 'teste2.32m', descripton: 'teste2.32m', price:'teste2.32m'}
      ];

      const categoria3 = [
          {name: 'teste3.131', descripton: 'teste3.13', price:'teste3.13'},
          {name: 'teste3.231', descripton: 'teste3.23', price:'teste3.23'},
          {name: 'teste3.331', descripton: 'teste3.33', price:'teste3.33'}
        ];


    const data = {userID: user._id, categorias: categorias};
    data['categoria1'] = categoria1;
    data['categoria2'] = categoria2;
    data['categoria3'] = categoria3;
    console.log('Data: ', data);

    const newMenu = new Menu(data);
    console.log('NewMenu: ', newMenu);

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

  editMenu: (req, res, next)=>{
    //TODO Pegar ID Menu pelo QR CODE e passar pela URL
    const user = req.userDecoded;

    const categorias = ['categoria1m', 'categoria22m', 'categoria3'];

    const  categoria1 = [
        {name: 'teste1.1m', descripton: 'teste1.1m', price:'teste1.1m'},
        {name: 'teste1.2m', descripton: 'teste1.2m', price:'teste1.2m'},
        {name: 'teste1.3m', descripton: 'teste1.3m', price:'teste1.3m'}
      ];

    const categoria2 = [
        {name: 'teste2.12m', descripton: 'teste2.12m', price:'teste2.12m'},
        {name: 'teste2.22m', descripton: 'teste2.22m', price:'teste2.22m'},
        {name: 'teste2.32m', descripton: 'teste2.32m', price:'teste2.32m'}
      ];

      const categoria3 = [
          {name: 'teste3.131', descripton: 'teste3.13', price:'teste3.13'},
          {name: 'teste3.231', descripton: 'teste3.23', price:'teste3.23'},
          {name: 'teste3.331', descripton: 'teste3.33', price:'teste3.33'}
        ];

    const data = {userID: user._id, categorias: categorias};
    data['categoria1'] = categoria1;
    data['categoria2'] = categoria2;
    data['categoria3'] = categoria3;
    console.log('Data: ', data);

    Menu.findOneAndUpdate({userID: user._id}, data,{new: true, upsert: false} ).then(
            (data)=>{
              res.status(200).json({success: true, data: data});
            },
            (err)=>{
              res.status(404).json({success: false, msg: 'Menu not modified!'});
            }
    );
  },



  generateQRCode: (req, res, next) =>{
    const user = req.userDecoded;
    //TODO Inserir ID Menu no QR CODE

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
