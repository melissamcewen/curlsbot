
//TODO  modularize this


module.exports = evaluateIngredients;

var badSilicones = [
"dimethicone",
"bisaminopropyl dimethicone",
"cetearyl methicone",
"cetyl dimethicone",
"cyclopentasiloxane",
"stearoxy dimethicone",
"stearyl dimethicone",
"trimethylsilylamodimethicone",
"amodimethicone",
"dimethiconol",
"behenoxy dimethicone",
"phenyl trimethicone",
"aminopropyl triethoxysilane",
"silicone"
];

var goodSilicones =  [
"peg-dimethicone",
"dimethicone copolyol",
"dimethicone-pg diethylmonium chloride",
"pg-dimethicone", 
"glycidoxy dimethicone crosspolymer", 
"dimethicone hydroxypropyl trimonium chloride", 
"hydroxyethyl acetomonium pg-dimethicone", 
"stearalkonium dimethicone peg-8 phthalate", 
"steardimonium hydroxypropyl panthenyl peg-7 dimethicone phosphate chloride",
];

var badSulfates = [
"alkylbenzene sulfonate",
"alkyl benzene sulfonate",
"ammonium laureth sulfate",
"ammonium lauryl sulfate",
"ammonium xylenesulfonate",
"sodium c14-16 olefin sulfonate",
"sodium cocoyl sarcosinate",
"sodium laureth sulfate",
"sodium lauryl sulfate",
"sodium lauryl sulfoacetate",
"sodium myreth sulfate",
"sodium Xylenesulfonate",
"tea-dodecylbenzenesulfonate",
"ethyl peg-15 cocamine sulfate",
"dioctyl sodium sulfosuccinate"
];

var goodSulfates = [
"behentrimonium methosulfate",
"disodium laureth sulfosuccinate",
];

var badAlcohols = [
"denatured alcohol",
"sd alcohol 40",
"witch hazel",
"isopropanol",
"ethanol",
"sd alcohol",
"propanol",
"propyl alcohol",
"isopropyl alcohol"
];

var goodAlcohols = [
"behenyl alcohol",
"cetearyl alcohol",
"ceteryl alcohol",
"cetyl alcohol",
"isocetyl alcohol",
"isostearyl alcohol",
"lauryl alcohol",
"myristyl alcohol",
"stearyl alcohol",
"c30-50 alcohols",
"lanolin alcohol"
];

var badWaxesOils = [
"castor oil",
"mineral oil",
"huile minerale",
"parrifidium liquidium",
"petrolatum",
"bees wax",
"beeswax",
"candelia wax",
"cire dabeille",
"cera alba"
];

function evaluateIngredients(ingredients){
  var ingredientsList = ingredients.split(',');
  // TODO need to handle slashs
  var ingredientDetected = false;
  ingredientsList.forEach(function(ingredient){
    //clean up our string
    var ingredientTest = ingredient.trim().toLowerCase();
    // TODO need case for handling extremely long strings to warn them of issue
    // detect cones
    var cone = /cone/i; 
    if(cone.test(ingredientTest)) {
      console.log("cone detected");
      ingredientDetected = true;
      console.log(ingredientTest);
      // for now we only have one "good silicone" pattern so let's test for it
      var goodSilicone = /quaternium/i
      if (goodSilicone.test(ingredientTest)){
        sendTextMessage(senderID, "this is a quaternium silicone which is a good silicone");
      } else if (goodSilicones.indexOf(ingredientTest) !== -1) {
        goodSiliconeIndex = goodSilicones.indexOf(ingredientTest)
        sendTextMessage(senderID, "this is a another good silicone called " + goodSilicones[goodSiliconeIndex]);
      } else if (badSilicones.indexOf(ingredientTest) !== -1) {
        badSiliconeIndex = badSilicones.indexOf(ingredientTest); 
        console.log ("this is a bad silicone called" + badSilicones[badSiliconeIndex])
      } else {
        console.log(ingredientTest + " is a silicone I don't know about yet, please check this list");
      }

    }
    /*
    // detect sulfates
    var sulfate = /sulfate/i;
    var sulfo = /sulfo/i;
    if(sulfate.test(ingredientTest)|| sulfo.test(ingredientTest)) {
      console.log("sulfate detected");
      ingredientDetected = true;
      // seems like there is only one good sulfate so let's test for it
      if (goodSulfates.indexOf(ingredientTest) !== -1){
        console.log("this is a good sulfate called " + ingredientTest);
      } else if (badSulfates.indexOf(ingredientTest) !== -1) {
        console.log("this is a bad sulfate called " + ingredientTest);
      } else {
        console.log("this is a sulfate I don't know about yet, please check this list");
      }
    }
    
    // detect alcohol
    var alcohol = /alcohol/i;
    var alcoholTest = badAlcohols.indexOf(ingredientTest);
    if(alcohol.test(ingredientTest)|| alcoholTest !== -1){
      console.log("alcohol detected");
      ingredientDetected = true;
      if(alcoholTest !== -1){
        console.log("bad alcohol named " + badAlcohols[alcoholTest]);
      } else if (goodAlcohols.indexOf(ingredientTest) !== -1){
        console.log("good alcohol detected");
      } else {
        console.log("this is an alcohol I don't know about yet, please check this list");
      }

    };
    
    // detect bad waxes and oils
    var beeswax = /bees/i;
    var mineral = /mineral/i;
    var petro = /petro/i;
    var waxOilTest = badWaxesOils.indexOf(ingredientTest);

    if(beeswax.test(ingredientTest)|| waxOilTest !== -1 || petro.test(ingredientTest) || mineral.test(ingredientTest)){
       ingredientDetected = true;
       console.log("wax oil detected");
      if(waxOilTest !== -1){
        console.log("bad waxoil named " + badWaxesOils[waxOilTest]);
      } else {
        var WaxOildetect = false;
        badWaxesOils.forEach(function(baddy) {
          var testing = ingredientTest.indexOf(baddy);
          if(testing !== -1){
            WaxOildetect = true;
            console.log(ingredientTest + "looks like " + baddy);
          }
        });

        if (WaxOildetect === false){
                 console.log("this a potentially unknown wax oil named" + ingredientTest);
        }

      }
      
    }
    
*/

  });

  if(ingredientDetected === false){
    console.log("I can't find anything wrong with this ingredient list, but I'm still a baby bot and I'm learning. Check this list to be sure.");
  }
}

