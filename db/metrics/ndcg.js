// Ranking position
// For example, for an NDCG@10, use p = 10
//
// ATTENTION: Due to current limitation in Quepid ("bestDocs" is
// 10-deep at most), p must be <= max(Number of results shown, 10)
// For example, for p = 10, set the "Number of Results to Show"
// in the Settings to 10.
var p = 10

// Rating scale max value: MUST MATCH THE MAX RATING SPECIFIED IN THE
// "Scale for query ratings" configuration block below.
var rating_scale_max = 10

var scaled_ndcg = ndcg() * 100.0;
log("Quepid scaled NDCG: " + scaled_ndcg);

setScore(scaled_ndcg);

// Logging function.
function log(obj) {
    // Log messages on the developer's console.
    var debug = false
    if (debug === true) console.log(obj)
}

// --------------------------------------------------------------------
// Retrieve a document's rating.
// hasDocRating(): See mock above.
// docRating(): See mock above.
// --------------------------------------------------------------------
function ratingOrDefault(posn, defVal) {
  if (!hasDocRating(posn)) {
    return defVal;
  }
  return docRating(posn);
}

// --------------------------------------------------------------------
// Log base 2.
// --------------------------------------------------------------------
function log2(num) {
  return Math.log(num) / Math.log(2);
}

// --------------------------------------------------------------------
// Round with precision,
// --------------------------------------------------------------------
function myRound(number, precision = 0) {
  var factor = Math.pow(10, precision);
  var tempNumber = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
}

// --------------------------------------------------------------------
// Build the list of ratings from 'docs'.
// Arguments:
// p: Max rank position (See 'p' in the Wikipedia article)
// --------------------------------------------------------------------
function currDocs(p) {
  var rVal = [];
  // for (var i = 0; i < Math.min(docs.length, p); i++) {
  for (var i = 0; i < p; i++) {
    var rating = ratingOrDefault(i, 0.0)
    log("Doc " + i + ": " + rating)
    rVal.push(rating);
  }
  log("CURR Docs: " + rVal);
  return rVal;
}

// --------------------------------------------------------------------
// DCG calculator
// Arguments:
// docList: List of rated documents.
// p: Maximum rank position.
// --------------------------------------------------------------------
function dcg(ratings, p) {
  var dcgScore = 0
  for (var i = 1; i <= ratings.length && i <= p; i++) {
    var logPosition = log2(i + 1);
    var dcgAdder = ratings[i - 1] / logPosition
    dcgScore += dcgAdder
    log('i=' + i + " ratings[i-1]=" + ratings[i - 1] + "/log(i+1)=" + logPosition + " => DCG incr. of " + myRound(dcgAdder, 3) + " (DCG=" + myRound(dcgScore, 3) + ")")
  }
  log('DCG([' + ratings + ']) = ' + dcgScore)
  return dcgScore
}

// --------------------------------------------------------------------
// Build the list of the best/ideal ratings.
// Arguments:
// p: Max rank position (See 'p' in the Wikipedia article)
// max_rating: Max rating (e.g., 10 for a 1-to-10 scale)
// --------------------------------------------------------------------
function gatherBestDocs(p, max_rating) {
  var rVal = [];
  // Star at the max rating (e.g., 10 for the 1-to-10 scale)
  var rat = max_rating;
  while (rVal.length < p && rat >= 1) {
    // Gather the ratings of 'rat'
    appendDocsWithRating(rat, p, rVal);
    // Set 'rat' to the next rating down
    --rat;
  }
  // 0 pad the rest
  for (var i = rVal.length; i < p; i++) {
    log("Ideal ratings list: Padding with 0.0 at position (0-based) " + i);
    rVal.push(0.0);
  }
  log("BEST Docs: " + rVal);
  return rVal;
}

// ...
function appendDocsWithRating(rating, p, ratList) {
  log("Getting docs with rating: " + rating);
  // console.log("bestDocs.length: " + bestDocs.length);
  eachDocWithRatingEqualTo(rating, function gather(doc) {
    // console.log(doc.BUS_BUSINESS_NAME + " RAT " + doc.getRating());
    if (ratList.length < p)
      ratList.push(doc.rating);
    else
      log("Already reached ranking position " + p);
  })
  log(" => Ideal ratings list: " + ratList);
}

function ndcg() {

  log(" RUNNING NDCG!!! ");
  log(" *************** ");

  log('Docs count    : ' + docs.length)
  log('bestDocs count: ' + bestDocs.length)

  // Log the objects for inspection in the developer's console
  log(docs)
  log(bestDocs)

  log('p=' + p)
  log('Using scale 1-' + rating_scale_max)

  var myDcg = dcg(currDocs(p), p);
  var iDcg = dcg(gatherBestDocs(p, rating_scale_max), p);

  // NDCG is ~ dcg(currDocs()) / dcg(bestDocs())
  var nDcg = myDcg / iDcg;

  log(" DCG: " + myDcg);
  log("iDCG: " + iDcg);
  log("NDCG: " + nDcg);

  return nDcg;
}
