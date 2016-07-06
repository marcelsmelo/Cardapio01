//db.items.update({},{$inc: {position: -1}}, {multi: true})

const Category = require('../models/CategoryModel.js');
const qrCode = require('qr-image');
const fs = require('fs');
const path = require('path');
const htmlPDF = require('html-pdf');
const handlebars = require('handlebars');
const Item = require('../models/ItemModel.js');


module.exports = {
  findByCategory: (req, res, next) =>{
    const categoryID = req.query.categoryID; //Parâmetro passado via GET
    const fieldsReturn = {name:1, description: 1, prices: 1, position:1};

    require('../lib/saveCategoryStatistics.js')(categoryID);

    //Procura todos itens associados a categoria
    Item.find({categoryID: categoryID, status: true}, fieldsReturn, {sort: {position: 1}}).lean()
      .then((items)=>{
        res.status(200).json({success: true, items: items});
      })
      .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar items da categoria. Tente novamente!', items: null});
      });
  },

  findAllByCategory: (req, res, next) =>{
    const categoryID = req.query.categoryID; //Parâmetro passado via GET
    //Procura todos itens associados a categoria
    Item.find({categoryID: categoryID}).lean()
      .then((items)=>{
        res.status(200).json({success: true, items: items});
      })
      .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar items da categoria. Tente novamente!', items: null});
      });
  },

  new: (req, res, next) =>{
    let companyID = req.companyID;
    //Cria um novo item com os valores passados como parâmetro
    Item.count({categoryID: req.body.categoryID},(err, count)=>{
      if(err)
        res.status(500).json({success: false, err: err});
      let newItem = new Item({categoryID: req.body.categoryID, name: req.body.name, description: req.body.description, prices: JSON.parse(req.body.prices), position: count});
      newItem.save()
      .then((itemCreated)=>{
         res.status(200).json({success: true, msg: 'Item criado com sucesso!'});
      })
      .catch((err)=>{
         res.status(500).json({success: false, msg: 'Erro ao criar um novo item. Tente novamente!'});
      });
    });
  },

  edit: (req, res, next) =>{
    //Monta um objeto Item com os novos dados a serem editados.
    const itemUpd = {
        name : req.body.name,
        description: req.body.description,
        prices: req.body.prices};
    //Busca o item que irá sofrer a edição e o atualiza com os dados da variável Item
    Item.findOneAndUpdate({_id: req.body.itemID}, itemUpd ,{new: true, upsert: false})
      .then((itemUpdated)=>{//Retorna todo objeto item alterado, em caso de sucesso na edição
          res.status(200).json({success: true, msg: 'Item editado com sucesso'});
        })
      .catch((err)=>{//Caso algum erro ocorra na edição do objeto categoria
          res.status(500).json({success: false, msg: 'Erro ao atualizar dados do item. Tente novamente!'});
      });
  },

  remove: (req, res, next) =>{
    Item.findOneAndRemove({_id: req.body.itemID})
    .then((item)=>{
        Item.update({categoryID: item.categoryID, position: {$gte: item.position}},{$inc: {position: -1}}, {multi: true})
        .then((result)=>{
          res.status(200).json({success: true, msg: 'Item removido com sucesso!'});
        })
        .catch((err)=>{
          res.status(500).json({success: false, msg: 'Erro ao atualizar posição dos itens.'});
        });
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao remover o item. Tente novamente!'});
    });
  },

  changePosition: (req, res, next)=>{
    let params = {
      fieldName : 'categoryID',
      fieldID : req.body.categoryID,
      elementID : req.body.itemID,
      oldIndex : req.body.oldIndex,
      newIndex : req.body.newIndex,
      model: Item
    };

    require('../lib/changePositionList.js')(params)
    .then((success)=>{
      res.status(200).json(success);
    })
    .catch((erro)=>{
      res.status(500).json(erro);
    });
  },

  changeStatus: (req, res, next) =>{
    Item.findOneAndUpdate({_id: req.body.itemID}, {status: req.body.status} ,{new: true, upsert: false})
    .then((item)=>{
      res.status(200).json({success: true, msg: 'Status do item alterado com sucesso!s'});
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao alterar o status do item. Tente novamente!'});
    });
  }

}
