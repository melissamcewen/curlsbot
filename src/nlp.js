// helper function for nlp handling
function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}


module.exports = {
   firstEntity
}