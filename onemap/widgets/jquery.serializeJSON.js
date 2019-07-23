define(["jquery"], function($) {

  $.fn.serializeJSON = function () {
    var obj, formAsArray;
    obj = {};
    formAsArray = this.serializeArray();

    $.each(formAsArray, function (i, input) {
      var name, value, keys;
      name = input.name;
      value = input.value;

      // Split the input name in programatically readable keys
      // name = "foo"              => keys = ['foo']
      // name = "[foo]"            => keys = ['foo']
      // name = "foo[inn][bar]"    => keys = ['foo', 'inn', 'bar']
      // name = "foo[inn][arr][0]" => keys = ['foo', 'inn', 'arr', '0']
      // name = "arr[][val]"       => keys = ['arr', '', 'val']
      keys = $.map(name.split('['), function (key) {
        var last;
        last = key[key.length - 1];
        return last === ']' ? key.substring(0, key.length - 1) : key;
      });
      if (keys[0] === '') { keys.shift(); } // "[foo][inn]" should be same as "foo[inn]"

      // Set value in the object using the keys
      $.deepSet(obj, keys, value);
    });
    return obj;
  };

  // Auxiliar function to check if a variable is an Object
  var isObject = function (obj) {
    return obj === Object(obj);
  };

  // Auxiliar function to check if a variable is a valid Array index
  var isValidArrayIndex = function(val){
      return /^[0-9]+$/.test(String(val));
  };

  $.deepSet = function (obj, keys, value) {
    var key, nextKey, tail, objectOrArray, lastKey, lastElement;

    if (!keys || keys.length === 0) { throw new Error("ArgumentError: keys param expected to be an array with least one key"); }
    key = keys[0];

    if (keys.length == 1) { // only one key, then it's not a deepSet, just assign the value.
      if (key === '') {
        obj.push(value); // empty key is used to add values to the array
      } else {
        obj[key] = value; // other keys can be used as array indexes or object keys
      }

    } else { // more keys menas a deepSet. Apply recursively

      nextKey = keys[1];

      // Empty key is used to add values to the array => merge next keys in the object element.
      if (key === '') {
        lastKey = obj.length - 1;
        lastElement = obj[obj.length - 1];
        if (isObject(lastElement) && !lastElement[nextKey]) { // if nextKey is a new attribute in the last object element then set the new value in there.
          key = lastKey;
        } else { // if the array does not have an object as last element, create one.
          obj.push({});
          key = lastKey + 1;
        }
      }

      // obj[key] defaults to Object or Array, depending on the next key
      if (obj[key] === undefined) {
        if (nextKey === '' || isValidArrayIndex(nextKey)) { // if is '', 1, 2, 3 ... then use an Array
          obj[key] = [];
        } else { // if is something else, use an Object
          obj[key] = {};
        }
      }

      // Recursively access the inner Object
      tail = keys.slice(1);
      $.deepSet(obj[key], tail, value);
    }

  };

});
