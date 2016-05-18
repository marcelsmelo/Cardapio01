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

    //Procura todos itens associados a categoria
    Item.find({categoryID: categoryID})
      .then((items)=>{
        res.status(200).json({success: true, data: items});
      })
      .catch((err)=>{//Caso algum erro ocorra
        res.status(404).json({success: false, err: err});
      });
  },

  new: (req, res, next) =>{

    //Cria um novo item com os valores passados como parâmetro
    let newItem = new Item({categoryID: req.body.categoryID, name: req.body.itemName, description: req.body.itemDescription, prices: JSON.parse(req.body.itemPrices)});
    newItem.save()
    .then((itemCreated)=>{
       res.status(200).json({success: true, data: itemCreated});
    })
    .catch((err)=>{
       res.status(404).json({success: false, err: err});
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
          res.status(200).json({success: true, data: itemUpdated});
        })
      .catch((err)=>{//Caso algum erro ocorra na edição do objeto categoria
        res.status(404).json({success: false, err: errEdit});
      });
  },

  remove: (req, res, next) =>{
    Item.findOneAndRemove({_id: req.body.itemID})
    .then((item)=>{
      res.status(200).json({success: true, data: item});
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  },

  changeStatus: (req, res, next) =>{
    Item.findOneAndUpdate({_id: req.body.itemID}, {active: req.body.status} ,{new: true, upsert: false})
    .then((item)=>{
      res.status(200).json({success: true, data: item});
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  }

}
