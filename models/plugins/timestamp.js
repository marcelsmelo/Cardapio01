module.exports = (schema, options)=>{
  schema.add({create_at:{type: Date, default: Date.now}});
  schema.add({update_at:{type: Date, default: Date.now}});

  schema.pre('findOneAndUpdate', function (next){
        this._update.update_at= Date.now();
        next();
  });
};
