'use strict';

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
    Item.find({categoryID: categoryID, status: true}, fieldsReturn, {sort: {position: 1}})
      .then((items)=>{
        res.status(200).json({success: true, data: items});
      })
      .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar items da categoria. Tente novamente!'});
      });
  },

  findAllByCategory: (req, res, next) =>{
    const categoryID = req.query.categoryID; //Parâmetro passado via GET

    //Procura todos itens associados a categoria
    Item.find({categoryID: categoryID})
      .then((items)=>{
        res.status(200).json({success: true, data: items});
      })
      .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar items da categoria. Tente novamente!'});
      });
  },

  new: (req, res, next) =>{

    //Cria um novo item com os valores passados como parâmetro

    Category.count({companyID: companyID},(err, maxPos)=>{
      if(err) res.status(500).json({success: false, err: err});
      let newItem = new Item({categoryID: req.body.categoryID, name: req.body.itemName, description: req.body.itemDescription, prices: JSON.parse(req.body.itemPrices), position: maxPos});
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
        name : req.body.itemName,
        description: req.body.itemDescription,
        prices: itemPrices};

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
      res.status(200).json({success: true, msg: 'Item removido com sucesso!'});
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao remover o item. Tente novamente!'});
    });
  },

  changePosition: (req, res, next)=>{
    Item.findOneAndUpdate({_id: req.body.itemID}, {position: req.body.position} ,{new: true, upsert: false})
    .then((category)=>{
      res.status(200).json({success: true, msg: 'Posição do item alterada com sucesso!'});
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao alterar a posição do item. Tente novamente!'});
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
