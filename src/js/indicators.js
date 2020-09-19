/**
 * Return list average value
 * @param {Array<number>} array
 */
function avg(array) {
  const sum = array.reduce((a, b) => a + b, 0);
  return sum / array.length;
}

/**
 * Return a moving averate of a price array
 * @param {*} array
 * @param {number} count
 */
export function movingAverage(array, count) {
  var result = [];

  for (var i = count; i < array.length; i++) {
    let val = avg(array.slice(i - count, i).map((v) => v.close));
    if (isNaN(val)) {
      continue;
    } else {
      result.push({ time: array[i].time, value: val });
    }
  }

  return result;
}

/**
 * Extract a list of values from a object list
 * @param {Array<Object>} rows
 * @param {String} key
 */
export function unpack(rows, key) {
  return rows.map(function (row) {
    return row[key];
  });
}
