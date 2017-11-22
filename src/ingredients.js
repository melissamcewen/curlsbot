const async = require('async');
const Templates = require('./templates');


// ingredient detection

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
"sodium cocoyl sarcosinate",
"sodium laureth sulfate",
"sodium lauryl sulfate",
"sodium lauryl sulfoacetate",
"sodium myreth sulfate",
"sodium xylenesulfonate",
"tea-dodecylbenzenesulfonate",
"ethyl peg-15 cocamine sulfate",
"dioctyl sodium sulfosuccinate"
];

var goodSulfates = [
"behentrimonium methosulfate",
"disodium laureth sulfosuccinate",
"magnesium sulfate",
"sodium lauroyl sarcosinate"
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
"isopropyl alcohol",
"alcohol denat."
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
"lanolin alcohol",
"benzyl alcohol",
"stearyl alcohol",
"aminomethyl propanol"
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
"cera alba",
"paraffinum liquidum (mineral oil)",
"microcrystalline wax" 
];

function evaluateIngredients(ingredients, senderID){
  var ingredientsHandled = true;
  var ingredientDetected = false;
  var questionableIngredientsDetected=false;
  var badIngredientsDetected = false;
  
  if (ingredients.indexOf(',') === -1 ){
      ingredientsHandled = false;
      console.log("can't handle");
  }
  var ingredientsList = ingredients.split(',');
  // TODO need to handle slashs



  // TODO clean this up
  var goodSiliconeList = "";
  var badSiliconeList = "";
  var unknownSiliconeList = "";
  var goodSulfateList = "";
  var badSulfateList = "";
  var unknownSulfateList= "";
  var goodAlcoholList = "";
  var badAlcoholList ="";
  var unknownAlcoholList="";
  var goodWaxOilList = "";
  var badWaxOilList= "";
  var unknownWaxOilList= "";
  



  ingredientsList.forEach(function(ingredient){
    //clean up our string
    var ingredientTest = ingredient.trim().toLowerCase();
    console.log(ingredientTest.indexOf(',') == -1);
    if (ingredientTest.length >= 150 ){
      ingredientsHandled = false;
      console.log("can't handle");
      return;
    }
    // TODO need case for handling extremely long strings to warn them of issue
    // detect cones
    var cone = /cone/i; 
    var dimethiconol = /dimethicon/i; 
    if(cone.test(ingredientTest) || dimethiconol.test(ingredientTest)) {

      ingredientDetected = true;
      console.log("silicone");
      // for now we only have one "good silicone" pattern so let's test for it
      if (goodSilicones.indexOf(ingredientTest) !== -1) {
        goodSiliconeList += ingredientTest += " \n ";
      } else if (badSilicones.indexOf(ingredientTest) !== -1) {
        badIngredientsDetected = true;
        badSiliconeList += ingredientTest += " \n" ; 
      } else {
        var peg = /peg/i;
        var dimethicone = /dimethicone/i;
        if(peg.test(ingredientTest)) {
          unknownSiliconeList += "- ";
          unknownSiliconeList += ingredientTest += " though this one looks a bit like a peg silicone which should be water soluble \uD83E\uDD14. It's probably OK but please look it up to make sure it is approved. \n \n ";
        } else if (dimethicone.test(ingredientTest) || dimethiconol.test(ingredientTest)) {
          badIngredientsDetected = true;
          badSiliconeList += ingredientTest += " looks like dimethicone to me \n" ;
        } else {
          unknownSiliconeList += ingredientTest += " \n ";
        }
        questionableIngredientsDetected=true;

      }


    }
    
    // detect sulfates
    var sulfate = /sulfate/i;
    var sulfo = /sulfo/i;
    var sarcosinate = /sarcosinate/i;
    if(sulfate.test(ingredientTest)|| sulfo.test(ingredientTest) || sarcosinate.test(ingredientTest)) {
      console.log("sulfate detected");
      ingredientDetected = true;
      // seems like there is only one good sulfate so let's test for it
      if (goodSulfates.indexOf(ingredientTest) !== -1){
        goodSulfateList += ingredientTest += " \n";

      } else if (badSulfates.indexOf(ingredientTest) !== -1) {
        badIngredientsDetected = true;
        badSulfateList += ingredientTest += " \n";

      } else {
        unknownSulfateList += ingredientTest += " \n";
        questionableIngredientsDetected=true;
      }
    }

    // detect alcohol
    var alcohol = /alcohol/i;
    var witchHazel = /witch hazel/i;
    var propanol = /propanol/i;
    var alcoholTest = badAlcohols.indexOf(ingredientTest);
    if(alcohol.test(ingredientTest)|| alcoholTest !== -1 || witchHazel.test(ingredientTest) || propanol.test(ingredientTest)){
      ingredientDetected = true;
      if(alcoholTest !== -1){
        badIngredientsDetected = true;
        badAlcoholList += ingredientTest += " \n";
      } else if (goodAlcohols.indexOf(ingredientTest) !== -1){
        goodAlcoholList += ingredientTest += " \n";
      } else {
        questionableIngredientsDetected=true;
        var goodAlcoholDetect = false;
        var badAlcoholDetect = false;
        
        goodAlcohols.forEach(function(alcohol) {
          var testing = ingredientTest.indexOf(alcohol);
          if(testing !== -1 && goodAlcoholDetect === false){
            goodAlcoholDetect = true;
            goodAlcoholList += "-";
            goodAlcoholList += ingredientTest += " is probably " ;
            goodAlcoholList += alcohol += " which is an OK alcohol, but check to make sure \n\n";
          }
        });
        
        badAlcohols.forEach(function(alcohol) {
          var testing = ingredientTest.indexOf(alcohol);
          if(testing !== -1 && badAlcoholDetect === false){
            badAlcoholDetect = true;
            badIngredientsDetected === true;
            badAlcoholList += "-";
            badAlcoholList += ingredientTest += " is probably " ;
            badAlcoholList += alcohol += " which is a harsh drying alcohol that is not curly girl approved, but check to make sure \n\n";
          }
        });

        if (goodAlcoholDetect === false && badAlcoholDetect === false){
          unknownAlcoholList += ingredientTest += " \n";
        }
        
      }

    };
    
    // detect bad waxes and oils
    var beeswax = /bees/i;
    var mineral = /mineral/i;
    var petro = /petro/i;
    var waxOilTest = badWaxesOils.indexOf(ingredientTest);

    if(beeswax.test(ingredientTest)|| waxOilTest !== -1 || petro.test(ingredientTest) || mineral.test(ingredientTest)){
      ingredientDetected = true;
      if(waxOilTest !== -1){
        badIngredientsDetected = true;
        badWaxOilList += ingredientTest += " \n";
      } else {
        var WaxOildetect = false;
        badWaxesOils.forEach(function(baddy) {
          var testing = ingredientTest.indexOf(baddy);
          if(testing !== -1 && WaxOildetect === false){
            WaxOildetect = true;
            questionableIngredientsDetected = true;
            badWaxOilList += ingredientTest += " is probably " ;
            badWaxOilList += baddy += " which is not CG approved but I'm not entirely sure \n";
          }
        });

        if (WaxOildetect === false){
          unknownWaxOilList += ingredientTest += " \n";
        }

      }
      
    }
    




  });
var messages = [];
  
 if(ingredientsHandled=== false){
   console.log("this won't be handled");
    var message = "Wow thanks for the compliment! \uD83D\uDE0A Oh was this supposed to be some ingredients? If so I'm sorry, but I can't really read this list properly because it doesn't look like a comma seperated list to me. Being a \uD83E\uDD16 does have some annoying limitations sometimes. "
    if (ingredientDetected === true) {
      message += " It does look like this contains some silicones or sulfates though, or maybe both.";
        
    }
    Templates.sendTextMessage(senderID, message);

    return;
  }


  if (goodSiliconeList){
    var message = "\u2B50\uFE0F These look like 'good silicones' because they are water soluble, they are perfectly OK \uD83D\uDC4D: \n \n";
     messages.push(message + goodSiliconeList);
  }

  if (badSiliconeList) {
    var message = "\uD83D\uDEAB Yikes, it seems to me this product has these bad silicones, they can build up on your hair and mean this product is not curly girl approved \uD83D\uDE22: \n \n"; 
    messages.push(message + badSiliconeList);

  }

  if(unknownSiliconeList){
    var message = "\u2753 I don't know these silicones yet, i'll take a note and try to find out more about them. In the meantime you should do your own research: \n \n ";
    messages.push(message + unknownSiliconeList);
  }

  if (goodSulfateList){
    var message = "\u2B50\uFE0F These are sulfates or sulfate-like cleansers, but they are gentle, so that means they are curly-girl approved! : \n \n"
    messages.push(message + goodSulfateList);
  }

  if (badSulfateList){
    var message = "\uD83D\uDEAB Yikes! These are either harsh sulfates or similar sulfer-based compounds which are not curly girl approved : \n \n"
    messages.push(message + badSulfateList);
  }

  if (unknownSulfateList){
    var message = "\u2753 I can't tell you much about these sulfates, you should look them up for more info : \n \n"
    messages.push(message + unknownSulfateList);
  }

  if (goodAlcoholList){
    var message = "\u2B50\uFE0F These alcohols won't dry our your hair, they are curly girl approved: \n \n"
    messages.push(message + goodAlcoholList);
  }

  if (badAlcoholList){
    var message = "\uD83D\uDEAB these alcohols will dry out your hair, they are not curly girl approved : \n \n"
    messages.push(message + badAlcoholList);
  }

  if (unknownAlcoholList){
    var message = "\u2753 Well that's embarrassing, this is an alcohol, but I can't tell you anything about it, you should probably Google it. Someday I hope to be smarter than Google : \n \n"
    messages.push(message + unknownAlcoholList);
  }

  if (badWaxOilList){
    var message = "\uD83D\uDEAB Hmm looks like this product has some CG unapproved waxes or oils : \n \n"
    messages.push(message + badWaxOilList);
  }

  if (unknownWaxOilList){
    var message = "\u2753 These are some waxes and oils I don't know much about, I recommend you look them up. I would if I could : \n \n"
    messages.push(message + unknownWaxOilList);
  }
  
  if(badIngredientsDetected === true){
    var message = "\uD83E\uDD16\uD83D\uDC4E My final verdict? Looks like this product is NOT curly girl approved \uD83D\uDED1"
    messages.push(message);
  } else if (questionableIngredientsDetected === true ) {
    var message = "\uD83E\uDD16\u2753 My final verdict? I can't say if this is approved or not, you'll need to do your own research. \u26A0\uFE0F"
    messages.push(message);
  } else {
    var message = "\uD83E\uDD16\uD83D\uDC4D Woohoo, I can't find anything wrong with this, looks like it's curly girl approved! But don't forget to read the label carefully and do a backup check yourself – ingredients listed online are not always accurate. "
    messages.push(message);
  }
  console.log(messages);
  async function executeSequentially(messages) {
    for (const message of messages) {
        await Templates.sendTextMessage(senderID, message);
    }
  }
  executeSequentially(messages);


}

module.exports = {
   evaluateIngredients
 }