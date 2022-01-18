/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const SELECTOR_TYPE = Object.freeze({
  ELEMENT: 'element',
  ID: 'id',
  CLASS: 'class',
  ATTRIBUTE: 'attribute',
  PSEUDO_CLASS: 'pseudo_class',
  PSEUDO_ELEMENT: 'pseudo_element',
});

const selectorOrder = [
  SELECTOR_TYPE.ELEMENT,
  SELECTOR_TYPE.ID,
  SELECTOR_TYPE.CLASS,
  SELECTOR_TYPE.ATTRIBUTE,
  SELECTOR_TYPE.PSEUDO_CLASS,
  SELECTOR_TYPE.PSEUDO_ELEMENT,
];

const cssSelectorBuilder = {
  parts: [],

  element(value) {
    const { ELEMENT } = SELECTOR_TYPE;

    this.validateType(ELEMENT);
    this.validateOccurrences(ELEMENT);

    return this.getNewObjWithAddedPart({
      type: ELEMENT,
      value,
      get formattedValue() {
        return this.value;
      },
    });
  },

  id(value) {
    const { ID } = SELECTOR_TYPE;

    this.validateType(ID);
    this.validateOccurrences(ID);

    return this.getNewObjWithAddedPart({
      type: ID,
      value,
      get formattedValue() {
        return `#${this.value}`;
      },
    });
  },

  class(value) {
    const { CLASS } = SELECTOR_TYPE;

    this.validateType(CLASS);


    return this.getNewObjWithAddedPart({
      type: CLASS,
      value,
      get formattedValue() {
        return `.${this.value}`;
      },
    });
  },

  attr(value) {
    const { ATTRIBUTE } = SELECTOR_TYPE;

    this.validateType(ATTRIBUTE);

    return this.getNewObjWithAddedPart({
      type: ATTRIBUTE,
      value,
      get formattedValue() {
        return `[${this.value}]`;
      },
    });
  },

  pseudoClass(value) {
    const { PSEUDO_CLASS } = SELECTOR_TYPE;

    this.validateType(PSEUDO_CLASS);

    return this.getNewObjWithAddedPart({
      type: PSEUDO_CLASS,
      value,
      get formattedValue() {
        return `:${this.value}`;
      },
    });
  },

  pseudoElement(value) {
    const { PSEUDO_ELEMENT } = SELECTOR_TYPE;

    this.validateType(PSEUDO_ELEMENT);
    this.validateOccurrences(PSEUDO_ELEMENT);

    return this.getNewObjWithAddedPart({
      type: PSEUDO_ELEMENT,
      value,
      get formattedValue() {
        return `::${this.value}`;
      },
    });
  },

  combine(selector1, combinator, selector2) {
    return {
      ...this,
      chunks: [selector1.stringify(), combinator, selector2.stringify()],
    };
  },

  stringify() {
    if (this.chunks) {
      return this.chunks.join(' ');
    }
    return this.parts.map((part) => part.formattedValue).join('');
  },

  getNewObjWithAddedPart(part) {
    return {
      ...this,
      parts: this.parts.concat(part),
    };
  },

  validateType(type) {
    const { parts } = this;
    const lastPart = parts[parts.length - 1];
    if (
      lastPart
      && selectorOrder.indexOf(lastPart.type) > selectorOrder.indexOf(type)
    ) {
      throw new Error(
        'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element',
      );
    }
  },

  validateOccurrences(type) {
    if (this.parts.some((obj) => obj.type === type)) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
