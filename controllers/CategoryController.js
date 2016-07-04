//db.categories.update({},{$inc: {position: -1}}, {multi: true})

const Category = require('../models/CategoryModel.js');



module.exports = {
  //@TODO Entregar dados da Company
  findByCompany: (req, res, next) =>{
    const companyID = req.query.companyID; //Parâmetro passado via GET
    const Company = require('../models/CompanyModel.js');

    require('../lib/saveMenuStatistics.js')(companyID);

    //Buscar todas categorias associadas a companhia desejada
    // Retorna apenas o nome e o _id
    const companyFields = {name: 1, phone: 1, email: 1, address:1, social: 1, status:1};
    const categoryFields = {name: 1, position: 1 };

    Company.findOne({_id: companyID}, companyFields).lean()
    .then((company)=>{
      if(!company.status)
          res.status(500).json({success: false, msg: "Estabelecimento não ativo! Informe o responsável do estabelecimento.", company: null, categories: null});
      Category.find({companyID: companyID, status: true}, categoryFields, {sort: {position: 1}}).lean()
      .then((categories)=>{
          res.status(200).json({success: true, company: company, categories: categories});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(500).json({success: false, msg: "Erro ao buscar dados das categorias!", company: null, categories: null});
      });
    })
    .catch((err)=>{//Caso algum erro ocorra
        res.status(500).json({success: false, msg: 'Erro ao buscar os dados da companhia!', company: null, categories: null});
    });
  },

  findAllByCompany: (req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    //Buscar todas categorias associadas a companhia desejada
      Category.find({companyID: companyID}).lean()
      .then((categories)=>{
          res.status(200).json({success: true, categories: categories});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(500).json({success: false, msg: "Erro ao buscar dados das categorias!", categories: null});
      });
  },

  new:(req, res, next) =>{
    //Pegar dados da compania logada, via token
    const companyID = req.companyID;

    //Cria uma nova categoria de acordo com o nome da categoria passada
    Category.count({companyID: companyID},(err, count)=>{//Starts on 0
      if(err) res.status(500).json({success: false, msg: "Erro ao adicionar uma nova categoria!"});
      let newCategory = new Category({companyID: companyID, name: req.body.name, position: count});
      newCategory.save().then((category)=>{//Caso a categoria seja criada com sucesso, retorna a categoria criada
          res.status(200).json({success: true, msg: "Categoria adicionada com sucesso!"});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(500).json({success: false, msg: "Erro ao adicionar uma nova categoria!"});
      });
    });


  },

  edit: (req, res, next)=>{
    //Procura uma categoria pelo _id e altera seu nome (único atributo)
    //{new: true, upsert: false} - Retorna o objeto alterado e não cria um novo objeto caso não exista na busca
    Category.findOneAndUpdate({_id: req.body.categoryID}, {name: req.body.name} ,{new: true, upsert: false})
      .then((category)=>{//Retorna o objeto alterado, em caso de sucesso na edição
          res.status(200).json({success: true, msg: "Categoria editada com sucesso"});
      })
      .catch((err)=>{//Caso algum erro ocorra
          res.status(500).json({success: false, msg: "Erro ao editar a categoria"});
      });
  },
//TODO REMOVER
  // resetBD: (req, res, next) =>{
  //   Category.update({name: "Pratos Frios"}, {$set: {position: 0}}, {multi:false}).exec();
  //   Category.update({name: "Pratos Quentes"}, {$set: {position: 1}}, {multi:false}).exec();
  //   Category.update({name: "Sanduíche"}, {$set: {position: 2}}, {multi:false}).exec();
  //   Category.update({name: "Prato Principal"}, {$set: {position: 3}}, {multi:false}).exec();
  //   Category.update({name: "Carta de Vinhos"}, {$set: {position: 4}}, {multi:false}).exec();
  //   Category.update({name: "Cervejas artesanais"}, {$set: {position: 5}}, {multi:false}).exec();
  //   res.status(200).json({success:true});
  // },

  changePosition: (req, res, next)=>{
    //TODO filtar por empresa, Token somente para logados
    let params = {
      fieldName : 'companyID',
      fieldID : req.companyID,
      elementID : req.body.categoryID,
      oldIndex : req.body.oldIndex,
      newIndex : req.body.newIndex,
      model: Category
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
    Category.findOneAndUpdate({_id: req.body.categoryID}, {status: req.body.status} ,{new: true, upsert: false})
    .then((category)=>{
      res.status(200).json({success: true, msg: "Status da categoria editada com sucesso"});
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: "Erro ao editar o status da categoria"});
    });
  },

  remove: (req, res, next) =>{
    const Item = require('../models/ItemModel.js');
    Item.count({categoryID: req.body.categoryID})
    .then((itemCount)=>{
      if(itemCount > 0) {
        res.status(500).json({success: false, msg: 'Remova todos itens vinculados à categoria antes de removê-la'});
      }else{
        Category.findOneAndRemove({_id: req.body.categoryID})
        .then((category)=>{
          res.status(200).json({success: true, msg: 'Categoria removida com sucesso'});
        })
        .catch((err)=>{
          res.status(500).json({success: false, msg: 'Erro ao remover a categoria. Tente novamente!'});
        });
      }
    })
    .catch((err)=>{
      res.status(500).json({success: false, msg: 'Erro ao remover a categoria. Tente novamente!'});
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
    if(err) res.status(500).json({err: err});
    res.status(200).json({success: true, data: result});
  });
}
