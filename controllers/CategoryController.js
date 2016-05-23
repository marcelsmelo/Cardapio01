'use strict';

const Category = require('../models/CategoryModel.js');



module.exports = {
  //@TODO Entregar dados da Company
  findByCompany: (req, res, next) =>{
    const companyID = req.query.companyID; //Parâmetro passado via GET
    const Company = require('../models/CompanyModel.js');

    //Buscar todas categorias associadas a companhia desejada
    // Retorna apenas o nome e o _id
    const companyFields = {name: 1, phone: 1, email: 1, address:1, social: 1};
    const categoryFields = {name: 1, position: 1 };

    Company.findOne({_id: companyID, status: true}, companyFields)
    .then((company)=>{
      Category.find({companyID: companyID, status: true}, categoryFields, {sort: {position: 1}})
      .then((categories)=>{
          res.status(200).json({success: true, company: company, categories: categories});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(404).json({success: false});
      });
    })
    .catch((err)=>{//Caso algum erro ocorra
        res.status(404).json({success: false});
    });
  },

  findAllByCompany: (req, res, next) =>{
    const companyID = req.query.companyID; //Parâmetro passado via GET

    //Buscar todas categorias associadas a companhia desejada
      Category.find({companyID: companyID})
      .then((categories)=>{
          res.status(200).json({success: true, data: categories});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(404).json({success: false});
      });
  },

  new:(req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    //Cria uma nova categoria de acordo com o nome da categoria passada
    Category.count({companyID: companyID},(err, maxPos)=>{
      if(err) res.status(404).json({success: false, err: err});
      let newCategory = new Category({companyID: companyID, name: req.body.categoryName, position: maxPos+1});
      newCategory.save().then((category)=>{//Caso a categoria seja criada com sucesso, retorna a categoria criada
          res.status(200).json({success: true, data: category});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(404).json({success: false, err: err});
      });
    });


  },

  edit: (req, res, next)=>{
    //Pegar dados da compania logada, via token
    const company = req.companyDecoded;

    //Procura uma categoria pelo _id e altera seu nome (único atributo)
    //{new: true, upsert: false} - Retorna o objeto alterado e não cria um novo objeto caso não exista na busca
    Category.findOneAndUpdate({_id: req.body.categoryID}, {name: req.body.categoryName} ,{new: true, upsert: false})
      .then((category)=>{//Retorna o objeto alterado, em caso de sucesso na edição
          res.status(200).json({success: true, data: category});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(404).json({success: false, err: err});
      });
  },

  changePosition: (req, res, next)=>{
    Category.findOneAndUpdate({_id: req.body.categoryID}, {position: req.body.position} ,{new: true, upsert: false})
    .then((category)=>{
      res.status(200).json({success: true, data: category});
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  },

  changeStatus: (req, res, next) =>{
    Category.findOneAndUpdate({_id: req.body.categoryID}, {status: req.body.status} ,{new: true, upsert: false})
    .then((category)=>{
      res.status(200).json({success: true, data: category});
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  },

  remove: (req, res, next) =>{
    const Item = require('../models/ItemModel.js');
    Item.count({categoryID: req.body.categoryID})
    .then((itemCount)=>{
      if(itemCount > 0) {
        res.status(404).json({success: false, msg: 'Remova todos itens vinculados à categoria antes de removê-la'});
      }else{
        Item.findOneAndRemove({_id: req.body.itemID})
        .then((item)=>{
          res.status(200).json({success: true, data: item});
        })
        .catch((err)=>{
          res.status(404).json({success: false, err: err});
        });
        res.status(200).json({sucess:"vai remover heim"});
      }
    })
    .catch((err)=>{
      res.status(404).json({success: false, err: err});
    });
  },
}

function getMaxPosition(){
  Category.aggregate([
    {
      $group: {
        _id: "$companyID",
        maxPosition: {$max: "$position"}
      }
    }
  ]).exec((err, result)=>{
    if(err) res.status(404).json({err: err});
    res.status(200).json({success: true, data: result});
  });
}
