//db.categories.update({},{$inc: {position: -1}}, {multi: true})

const Category = require('../models/CategoryModel.js');



module.exports = {
    findByCompany: (req, res, next) => {
        const companyID = req.query.companyID; //Parâmetro passado via GET
        const Company = require('../models/CompanyModel.js');
        logger.debug('[Category Controller]', 'Parametros findByCompany (STATUS=TRUE)', req.query);

        require('../lib/saveMenuStatistics.js')(companyID);

        //Buscar todas categorias associadas a companhia desejada
        // Retorna apenas o nome e o _id
        const companyFields = {
            name: 1,
            phone: 1,
            email: 1,
            address: 1,
            social: 1,
            status: 1
        };
        const categoryFields = {
            name: 1,
            position: 1
        };

        Company.findOne({
                _id: companyID
            }, companyFields).lean()
            .then((company) => {
                logger.debug('[Category Controller]', 'Dados de company recuperado', company);
                if (!company.status)
                    res.status(500).json({
                        success: false,
                        msg: "Estabelecimento não ativo! Informe o responsável do estabelecimento.",
                        company: null,
                        categories: null
                    });
                Category.find({
                        companyID: companyID,
                        status: true
                    }, categoryFields, {
                        sort: {
                            position: 1
                        }
                    }).lean()
                    .then((categories) => {
                        logger.debug('[Category Controller]', 'Categorias recuperadas com sucesso (STATUS=TRUE)', categories);
                        res.status(200).json({
                            success: true,
                            company: company,
                            categories: categories
                        });
                    })
                    .catch((err) => { //Caso algum erro ocorra
                        logger.error('[Category Controller]', 'Erro ao recuperar dados de categorias', err.errmsg);
                        res.status(500).json({
                            success: false,
                            msg: "Erro ao buscar dados das categorias!",
                            company: null,
                            categories: null,
							err: err.errmsg
                        });
                    });
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Category Controller]', 'Erro ao recuperar dados de company', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao buscar os dados da companhia!',
                    company: null,
                    categories: null,
					err: err.errmsg
                });
            });
    },

    findAllByCompany: (req, res, next) => {
        //Pegar dados da compania logada, via token
        const companyID = req.companyID;
        logger.debug('[Category Controller]', 'Parametros findAllByCompany', req.companyID);
        //Buscar todas categorias associadas a companhia desejada
        Category.find({
                companyID: companyID
            }, {}, {
                sort: {
                    position: 1
                }
            }).lean()
            .then((categories) => {
                logger.debug('[Category Controller]', 'Categorias recuperadas com sucesso', categories);
                res.status(200).json({
                    success: true,
                    categories: categories
                });
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Category Controller]', 'Erro ao recuperar dados de company', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao buscar dados das categorias!",
                    categories: null,
					err: err.errmsg
                });
            });
    },

    new: (req, res, next) => {
        //Pegar dados da compania logada, via token
        const companyID = req.companyID;
        logger.debug('[Category Controller]', 'Parametos newCategory', req.companyID, req.body);
        //Cria uma nova categoria de acordo com o nome da categoria passada
        Category.count({
            companyID: companyID
        }, (err, count) => { //Starts on 0
            if (err) {
                logger.error('[Category Controller]', 'Erro ao recuperar quantidade de categorias', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao adicionar uma nova categoria!",
					err: err.errmsg
                });
            }
            let newCategory = new Category({
                companyID: companyID,
                name: req.body.name,
                position: count
            });
            newCategory.save()
                .then((category) => { //Caso a categoria seja criada com sucesso, retorna a categoria criada
                    logger.debug('[Category Controller]', 'Categoria salva com sucesso', category);
                    res.status(200).json({
                        success: true,
                        msg: "Categoria adicionada com sucesso!"
                    });
                })
                .catch((err) => { //Caso algum erro ocorra
                    logger.error('[Category Controller]', 'Erro ao salvar nova categoria', err.errmsg);
                    res.status(500).json({
                        success: false,
                        msg: "Erro ao adicionar uma nova categoria!",
						err: err.errmsg
                    });
                });
        });
    },

    edit: (req, res, next) => {
        logger.debug('[Category Controller]', 'Parametros para editar Categoria', req.body);
        //Procura uma categoria pelo _id e altera seu nome (único atributo)
        //{new: true, upsert: false} - Retorna o objeto alterado e não cria um novo objeto caso não exista na busca
        Category.findOneAndUpdate({
                _id: req.body.categoryID
            }, {
                name: req.body.name
            }, {
                new: true,
                upsert: false
            })
            .then((category) => { //Retorna o objeto alterado, em caso de sucesso na edição
                logger.debug('[Category Controller]', 'Categoria editada com sucesso', category);
                res.status(200).json({
                    success: true,
                    msg: "Categoria editada com sucesso"
                });
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Category Controller]', 'Erro ao editar categoria', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao editar a categoria",
					err: err.errmsg
                });
            });
    },

    changePosition: (req, res, next) => {
        let params = {
            fieldName: 'companyID',
            fieldID: req.companyID,
            elementID: req.body.categoryID,
            oldIndex: req.body.oldIndex,
            newIndex: req.body.newIndex,
            model: Category
        };

        logger.debug('[Category Controller]', 'Parametros para atualizar posição da Categoria', params);
        require('../lib/changePositionList.js')(params)
            .then((success) => {
                logger.debug('[Category Controller]', 'Atualização posições com sucesso', success);
                res.status(200).json(success);
            })
            .catch((err) => {
                logger.error('[Category Controller]', 'Erro ao atualizar posições da categoria', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao atualizar posições das categorias. Tente novamente!',
					err: err
                });
            });

    },

    changeStatus: (req, res, next) => {
        logger.debug('[Category Controller]', 'Parametros para atualizar Status da Categoria', req.body);
        Category.findOneAndUpdate({
                _id: req.body.categoryID
            }, {
                status: req.body.status
            }, {
                new: true,
                upsert: false
            })
            .then((category) => {
                logger.debug('[Category Controller]', 'Atualização do status da categoria com sucesso', category);
                res.status(200).json({
                    success: true,
                    msg: "Status da categoria editada com sucesso"
                });
            })
            .catch((err) => {
                logger.error('[Category Controller]', 'Erro ao atualizar status da categoria', err.errmsg);
                res.status(500).json({
                    success: false,
                    msg: "Erro ao editar o status da categoria",
					err: err.errmsg
                });
            });
    },

    remove: (req, res, next) => {
        const Item = require('../models/ItemModel.js');
        logger.debug('[Category Controller]', 'Paramestros remove categoria', req.body);
        Item.count({
                categoryID: req.body.categoryID
            })
            .then((itemCount) => {
                logger.debug('[Category Controller]', 'Quantidade de items na categoria', itemCount);
                if (itemCount > 0) {
                    logger.debug('[Category Controller]', 'Não remove categoria com items');
                    res.status(500).json({
                        success: false,
                        msg: 'Remova todos itens vinculados à categoria antes de removê-la'
                    });
                } else {
                    Category.findOneAndRemove({
                            _id: req.body.categoryID
                        })
                        .then((category) => {
                            logger.debug('[Category Controller]', 'Categoria removida com sucessso', category);
                            Category.update({
                                    companyID: category.companyID,
                                    position: {
                                        $gte: category.position
                                    }
                                }, {
                                    $inc: {
                                        position: -1
                                    }
                                }, {
                                    multi: true
                                })
                                .then((result) => {
                                    logger.debug('[Category Controller]', 'Atualização de positions com sucesso', result);
                                    res.status(200).json({
                                        success: true,
                                        msg: 'Categoria removida com sucesso'
                                    });
                                })
                                .catch((err) => {
                                    logger.error('[Category Controller]', 'Erro ao atualizar positions das categorias', err.errmsg);
                                    res.status(500).json({
                                        success: false,
                                        msg: 'Erro ao atualizar posição das categorias.',
										err: err.errmsg
                                    });
                                });
                        })
                        .catch((err) => {
                            logger.error('[Category Controller]', 'Erro ao remover categoria', err.errmsg);
                            res.status(500).json({
                                success: false,
                                msg: 'Erro ao remover a categoria. Tente novamente!',
								err: err.errmsg
                            });
                        });
                }
            })
            .catch((err) => {
                logger.error('[Category Controller]', 'Erro ao recuperar quantidade de items na categoria', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao remover a categoria. Tente novamente!',
					err: err.errmsg
                });
            });
    },
}

function getMaxPosition() {
    Category.aggregate([{
        $group: {
            _id: "$companyID",
            maxPosition: {
                $max: "$position"
            }
        }
    }]).exec((err, result) => {
        if (err) res.status(500).json({
            err: err.errmsg
        });
        res.status(200).json({
            success: true,
            data: result
        });
    });
}
