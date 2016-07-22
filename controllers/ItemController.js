//db.items.update({},{$inc: {position: -1}}, {multi: true})

const Category = require('../models/CategoryModel.js');
const qrCode = require('qr-image');
const fs = require('fs');
const path = require('path');
const htmlPDF = require('html-pdf');
const handlebars = require('handlebars');
const Item = require('../models/ItemModel.js');


module.exports = {
    findByCategory: (req, res, next) => {
        const categoryID = req.query.categoryID; //Parâmetro passado via GET
        const fieldsReturn = {
            name: 1,
            description: 1,
            prices: 1,
            position: 1
        };
        logger.debug('[Item Controller]', 'Parametros findByCategory (STATUS=TRUE)', req.query);

        require('../lib/saveCategoryStatistics.js')(categoryID);

        //Procura todos itens associados a categoria
        Item.find({
                categoryID: categoryID,
                status: true
            }, fieldsReturn, {
                sort: {
                    position: 1
                }
            }).lean()
            .then((items) => {
                logger.debug('[Item Controller]', 'Items recuperados com sucesso (STATUS=TRUE)', items);
                res.status(200).json({
                    success: true,
                    items: items
                });
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Category Controller]', 'Erro ao recuperar items', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao buscar items da categoria. Tente novamente!',
                    items: null
                });
            });
    },

    findAllByCategory: (req, res, next) => {
        const categoryID = req.query.categoryID; //Parâmetro passado via GET
        //Procura todos itens associados a categoria
        logger.debug('[Item Controller]', 'Parametros findAllByCategory', req.query);
        Item.find({
                categoryID: categoryID
            }, {}, {
                sort: {
                    position: 1
                }
            }).lean()
            .then((items) => {
                logger.debug('[Item Controller]', 'Items recuperados com sucesso', items);
                res.status(200).json({
                    success: true,
                    items: items
                });
            })
            .catch((err) => { //Caso algum erro ocorra
                logger.error('[Category Controller]', 'Erro ao recuperar items', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao buscar items da categoria. Tente novamente!',
                    items: null
                });
            });
    },

    new: (req, res, next) => {
        let companyID = req.companyID;
        logger.debug('[Item Controller]', 'Parametros newItem', req.companyID, req.body);
        if (req.body.prices.length == 0) {
            logger.debug('[Item Controller]', 'Erro: Produtos devem ter preços', req.body.prices);
            res.status(500).json({
                success: false,
                msg: 'Erro ao criar um novo item. Adicione pelo menos um preço ao item!'
            });
        } else {
            //Cria um novo item com os valores passados como parâmetro
            Item.count({
                categoryID: req.body.categoryID
            }, (err, count) => {
                if (err) {
                    logger.error('[Item Controller]', 'Erro ao recuperar quantidade de items', err);
                    res.status(500).json({
                        success: false,
                        msg: 'Erro ao criar um novo item. Tente novamente!'
                    });
                }
                let newItem = new Item({
                    categoryID: req.body.categoryID,
                    name: req.body.name,
                    description: req.body.description,
                    prices: req.body.prices,
                    position: count
                });
                newItem.save()
                    .then((itemCreated) => {
                        logger.debug('[Item Controller]', 'Item criado com sucesso', itemCreated);
                        res.status(200).json({
                            success: true,
                            msg: 'Item criado com sucesso!'
                        });
                    })
                    .catch((errNew) => {
                        logger.error('[Item Controller]', 'Erro ao criar novo Item', errNew);
                        res.status(500).json({
                            success: false,
                            msg: 'Erro ao criar um novo item. Tente novamente!'
                        });
                    });
            });
        }
    },

    edit: (req, res, next) => {
        logger.debug('[Item Controller]', 'Parametros editItem', req.companyID, req.body);
        if (req.body.prices.length == 0) {
            logger.debug('[Item Controller]', 'Erro: Produtos devem ter preços', req.body.prices);
            res.status(500).json({
                success: false,
                msg: 'Erro ao criar um novo item. Adicione pelo menos um preço ao item!'
            });
        } else {
            //Monta um objeto Item com os novos dados a serem editados.
            const itemUpd = {
                name: req.body.name,
                description: req.body.description,
                prices: req.body.prices
            };
            //Busca o item que irá sofrer a edição e o atualiza com os dados da variável Item
            Item.findOneAndUpdate({
                    _id: req.body.itemID
                }, itemUpd, {
                    new: true,
                    upsert: false
                })
                .then((itemUpdated) => { //Retorna todo objeto item alterado, em caso de sucesso na edição
                    logger.debug('[Item Controller]', 'Item editado com sucesso', itemCreated);
                    res.status(200).json({
                        success: true,
                        msg: 'Item editado com sucesso'
                    });
                })
                .catch((err) => { //Caso algum erro ocorra na edição do objeto categoria
                    logger.error('[Item Controller]', 'Erro ao editar um Item', err);
                    res.status(500).json({
                        success: false,
                        msg: 'Erro ao atualizar dados do item. Tente novamente!'
                    });
                });
        }
    },

    remove: (req, res, next) => {
        logger.debug('[Item Controller]', 'Parametros removeItem', req.body);
        Item.findOneAndRemove({
                _id: req.body.itemID
            })
            .then((item) => {
                logger.debug('[Item Controller]', 'Item removido com sucesso', item);
                Item.update({
                        categoryID: item.categoryID,
                        position: {
                            $gte: item.position
                        }
                    }, {
                        $inc: {
                            position: -1
                        }
                    }, {
                        multi: true
                    })
                    .then((result) => {
                        logger.debug('[Item Controller]', 'Posições dos items atualizado com sucesso', result);
                        res.status(200).json({
                            success: true,
                            msg: 'Item removido com sucesso!'
                        });
                    })
                    .catch((err) => {
                        logger.error('[Item Controller]', 'Erro ao atualizar posição dos items', err);
                        res.status(500).json({
                            success: false,
                            msg: 'Erro ao atualizar posição dos itens.'
                        });
                    });
            })
            .catch((err) => {
                logger.error('[Item Controller]', 'Erro ao remover Item', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao remover o item. Tente novamente!'
                });
            });
    },

    changePosition: (req, res, next) => {
        logger.debug('[Item Controller]', 'Parametros changePosition', req.body);
        let params = {
            fieldName: 'categoryID',
            fieldID: req.body.categoryID,
            elementID: req.body.itemID,
            oldIndex: req.body.oldIndex,
            newIndex: req.body.newIndex,
            model: Item
        };
        logger.debug('[Item Controller]', 'Parametros para atualizar posição do Item', params);
        require('../lib/changePositionList.js')(params)
            .then((success) => {
                logger.debug('[Item Controller]', 'Atualização posições com sucesso', success);
                res.status(200).json(success);
            })
            .catch((erro) => {
                logger.error('[Item Controller]', 'Erro ao atualizar posições do item', err);
                res.status(500).json(erro);
            });
    },

    changeStatus: (req, res, next) => {
        logger.debug('[Item Controller]', 'Parametros changeStatus', req.body);
        Item.findOneAndUpdate({
                _id: req.body.itemID
            }, {
                status: req.body.status
            }, {
                new: true,
                upsert: false
            })
            .then((item) => {
                logger.debug('[Item Controller]', 'Status do Item atualizado com sucesso', item);
                res.status(200).json({
                    success: true,
                    msg: 'Status do item alterado com sucesso!s'
                });
            })
            .catch((err) => {
                logger.error('[Item Controller]', 'Erro ao atualizar status do item', err);
                res.status(500).json({
                    success: false,
                    msg: 'Erro ao alterar o status do item. Tente novamente!'
                });
            });
    }
}
