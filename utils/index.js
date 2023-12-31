const createError = require("http-errors");
// 通用搜索逻辑
async function searchFun(
  req,
  res,
  next,
  apiName,
  Model,
  pipeline = [],
  totalCountPipeLine = []
) {
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

  if (totalCountPipeLine.length === 0) {
    //创建一个没有任何影响的管道，主要是管道不能传入空值
    totalCountPipeLine.push({ $match: { $expr: { $eq: [1, 1] } } });
  }
  const docs = await Model.aggregate([...totalCountPipeLine]).exec();
  const totalCount = docs.length;

  //   通用分页排序逻辑
  const defaultPipeline = (() => {
    const pipeline = [];
    //    排序
    if (sortField) {
      pipeline.push(
        // 排序
        {
          $sort: {
            [sortField]: Number(-~~sortMethod), // 正序排序，-1 为倒序排序
          },
        }
      );
    }
    if (page) {
      pipeline.push(
        // 分页
        {
          $skip: (page - 1) * Number(~~limit),
        }
      );
    }
    if (~~limit) {
      //   限制返回条数;
      pipeline.push({
        $limit: parseInt(~~limit),
      });
    }
    return pipeline;
  })();
  try {
    const docs = await Model.aggregate([
      ...pipeline,
      ...defaultPipeline,
    ]).exec();
    const count = docs.length;
    res.send({
      status: 200,
      data: docs,
      totalCount,
      count,
      pageInfo,
      msg: "success",
    });
  } catch (error) {
    console.log(apiName, error);
    next(createError(500));
  }
}

module.exports = {
  searchFun,
};
