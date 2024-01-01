const createError = require("http-errors");

// 通用分页排序限制条数 pipeline
function sortPageLimitPipelineFunc(req) {
  const {
    page = 0,
    limit = 0,
    sortField = "currentDate",
    sortMethod = 1,
  } = req.query;
  const pageInfo = (() => {
    const pageInfo = {};
    if (page) pageInfo.page = ~~page;
    if (limit) pageInfo.limit = ~~limit;
    if (sortField) pageInfo.sortField = sortField;
    if (sortMethod) pageInfo.sortMethod = ~~sortMethod;
    if (Object.keys(pageInfo).length) return pageInfo;
    return undefined;
  })();

  //   通用分页排序逻辑
  const sortPageLimitPipeline = (() => {
    const sortPageLimitPipeline = [];
    //    排序
    if (sortField) {
      sortPageLimitPipeline.push(
        // 排序
        {
          $sort: {
            [sortField]: Number(-~~sortMethod), // 正序排序，-1 为倒序排序
          },
        }
      );
    }
    if (page) {
      sortPageLimitPipeline.push(
        // 分页
        {
          $skip: (page - 1) * Number(~~limit),
        }
      );
    }
    if (~~limit) {
      //   限制返回条数;
      sortPageLimitPipeline.push({
        $limit: parseInt(~~limit),
      });
    }
    return sortPageLimitPipeline;
  })();
  return { sortPageLimitPipeline, pageInfo };
}

// 将b数组中的数据，根据某个字段，和a数组中的字段进行匹配，并放入a数组中那个数据的chilren中
function mergeArrays(a, b, afiled, bfield) {
  // 构建以 comment_id 为键的映射表
  const map = {};
  for (const item of a) {
    map[item[afiled]] = item;
    item.children = []; // 初始化 children 属性
  }

  // 遍历数组 b，将符合条件的项添加到对应的 a 数组对象的 children 属性中
  for (const item of b) {
    const parentItem = map[item[bfield]];
    if (parentItem) {
      parentItem.children.push(item);
    }
  }

  return Object.values(map);
}

/**
 * des:错误处理函数
 * @params res
 * @params apiName
 * @params error
 * @params code
 */
function errorFunc(res, apiName, error, code = 201) {
  if (code === 201) {
    console.log(apiName, error);
    res.send({
      status: 201,
      msg: error.message,
    });
  }
}
module.exports = {
  sortPageLimitPipelineFunc,
  mergeArrays,
  errorFunc,
};
