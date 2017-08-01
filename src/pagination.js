/**
 * Created by mirabalj on 10/12/16.
 */

const set = require("lodash.set");

const orderHasId = (order, keyPaginated) =>
  order.filter(inner => inner[0].toLowerCase() === keyPaginated) > 0;

const isIdLastInOrder = (order, keyPaginated) =>
  (order.map(inner => inner[0]).indexOf(keyPaginated) + 1) === order.length;

const reverseOrderClause = (order) =>
  order.map(([col, direction]) => [
      col,
      direction.toUpperCase() === "ASC" ? "DESC" : "ASC"
  ]);

const hashOrder = (order) => {
  return order.reduce((acc, [col, dir]) => {
   acc[col] = dir;
   return acc;
  });
};

const rowValuefy ({ where, orderHash }) => {
  Object.keys(where).reduce((acc, k) => {

    const orderColDir = orderHash[k] || 'ASC';
    const sOrderColDir = orderColDir === 'ASC' ? "$gt" : "$lt";

    let val = where[k];
    if (typeof val === "object") {
      val = rowValuefy(val);
    } else {
      const and = set(and, '$and.$or');

      val = { $and: {


      }



    }

  });

};

export default (Model, { name } = {}) => {
  // Pagination using cursor is here!
  const results = async function any({
    sinceId, maxId, limit = 1,
    select, where = {},
    reverse = false,
    order = [], keyPaginated = 'id',
    include = [], subQuery = true,
  } = {}, callback) {
    try {
      /*
      const lsThanE = reverse ? '$gte' : '$lte';
      const lsThan = reverse ? '$gt' : '$lt';
      const gsThan = reverse ? '$lt' : '$gt';
      const findObject = where;
      const findCursor = {};
      console.log("sinceId!", sinceId);
      */


      /*
       * if cursor PK:
       * find item, then for each column:
       * -
       *
       *
       */

      if (sinceId) {
        const comparator = (reverse) ? '$lt' : '$gt';
        const andVal = {};
        andVal[keyPaginated] = {};
        andVal[keyPaginated][comparator] = sinceId;
        where = { $and: andVal };
        //findCursor[lsThan] = sinceId;
        //findObject[keyPaginated] = findCursor;
      }

      /*
      if (maxId) {
        findCursor[gsThan] = maxId;
        findObject[keyPaginated] = findCursor;
      }
      */

      console.log("where", order);

      // Assign order of search.  PK must be last.
      if (!orderHasId(order, keyPaginated)) {
        order.push([keyPaginated, 'ASC']);
      } else if (!isIdLastInOrder(order, keyPaginated)) {
        throw new Error('id must be the last sort order column');
      }
      const queryOrder = reverse ? reverseOrderClause(order) : order;
      console.log("queryOrder", queryOrder, "sinceId", sinceId, "reverse", reverse);

      //const keyPaginatedOrder = reverse ? 'ASC' : 'DESC';
      //order.push([keyPaginated, keyPaginatedOrder]);

      // Execute query with limit
      const objects = (!sinceId && reverse) ? [] : await this.findAll({
        where,
        subQuery,
        include,
        limit,
        attributes: select,
        order: queryOrder,
      });

      /*
      let nextCursor = undefined;
      const len = objects.length;

      // Search fine? create a cursor!
      if (len) {
        const lastCursor = objects[len - 1][keyPaginated];
        const findNextCursorWhere = where;
        const findNextCursor = {};
        findNextCursor[lsThan] = lastCursor;
        findNextCursorWhere[keyPaginated] = findNextCursor;
        // Find next cursor
        const nextObject = await this.findOne({
          where: findNextCursorWhere,
          subQuery,
          include,
          order,
        });
        // Exist next cursor?
        if (nextObject) {
          nextCursor = nextObject[keyPaginated];
        }
      }
      */

      // Create paginate object
      const objectReturn = {
        objects: reverse ? objects.reverse() : objects,
        order, // note we report the order requested, no the queryOrder we needed to use to get the proper records
        reverse,
        limit
      };

      // Call back, ¿exist?
      if (callback) {
        callback(null, objectReturn);
      }

      // Return paginate
      return objectReturn;
    } catch (err) {
      // Catch error and send to callback
      if (callback) callback(err);
      throw err;
    }
  };
  // Assign the function as the name identifier
  if (name) {
    Model[name] = results;
  } else {
    Model.paginate = results;
  }
};
