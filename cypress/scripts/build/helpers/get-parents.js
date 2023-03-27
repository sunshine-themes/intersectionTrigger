// src/helpers.ts
var is = {
  function: (a) => typeof a === "function",
  string: (a) => "string" === typeof a,
  boolean: (a) => "boolean" === typeof a,
  object: (a) => !!a && "object" === typeof a && a !== null && !(a instanceof Array),
  num: (a) => typeof a === "number",
  array: (a) => a instanceof Array,
  element: (a) => a instanceof HTMLElement,
  empty: (a) => Object.keys(a).length === 0,
  doc: (a) => a instanceof Document,
  anime: (a) => is.object(a) && a.hasOwnProperty("animatables") && !a.hasOwnProperty("add"),
  tl: (a) => is.object(a) && a.hasOwnProperty("add") && is.function(a.add),
  animeInstance: (a) => is.anime(a) || is.tl(a),
  pixel: (a) => a.includes("px"),
  inObject: (obj, prop) => is.object(obj) && prop in obj,
  percent: (a) => a.includes("%"),
  scrollable: (element, dir) => dir ? "y" === dir ? element.scrollHeight > element.clientHeight : element.scrollWidth > element.clientWidth : element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
};
var getParents = (element) => {
  const parents = [];
  for (let el = element.parentElement; el && !is.doc(el) && el !== document.documentElement; el = el.parentElement) {
    parents.push(el);
  }
  return parents;
};

// cypress/scripts/src/js/helpers/get-parents.ts
var target = document.querySelector("#target");
if (target)
  window.storedParents = getParents(target);
